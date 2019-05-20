import datetime
import os
import tweepy
import json
import math
import pandas as pd
import logging
import gramex.cache
from gramex import service
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from tweepy import OAuthHandler
from tweepy import API
from tweepy import Cursor
from time import sleep
from sqlalchemy import create_engine


def update_aggregate_table(df):
    fav_ret_counts = df.groupby(['created_date', 'user', 'userhandle']).agg(sum).reset_index()[
        ['created_date', 'user', 'userhandle', 'favorite_count', 'retweet_count']]
    data_user_group = df.groupby(['created_date', 'user'])
    tweetscount = data_user_group.size().reset_index(name='tweet_count')
    followerscount = data_user_group['followers_count'].mean().reset_index()
    merged = pd.merge(fav_ret_counts, tweetscount, on=['created_date', 'user'], how='inner')
    merged = pd.merge(merged, followerscount, on=['created_date', 'user'], how='inner')
    handler_data = merged.to_dict(orient="list")
    directory = os.path.dirname(os.path.abspath(__file__))
    dbpath = os.path.join(directory, 'twitterdata.db')
    enginepath = 'sqlite:///'+dbpath
    try:
        import gramex
        gramex.data.insert(enginepath, table='aggtweets',
                           args=handler_data, id=['created_date', 'user'])
    except Exception as e:
        logging.exception(e)


def formatted_tweets(all_tweets_list):
    for dict_ in all_tweets_list:
        for key in dict_.keys():
            if key in ['favorited', 'retweeted', 'truncated', 'is_quote_status']:
                dict_[key] = int(dict_[key])

        keys_list = list(dict_.keys())
        for eachkey in keys_list:
            if eachkey in ['in_reply_to_user_id', 'in_reply_to_status_id', 'quoted_status_id']:
                dict_.pop(eachkey)

        if 'quoted_status' in dict_.keys():
            temp = dict_.pop('quoted_status')
            dict_['quoted_tweet_id'] = '{}'.format(temp['id'])

        if 'extended_entities' in dict_.keys():
            temp = dict_.pop('extended_entities')
            dict_['extended_entities_media'] = ",".join(map(str, temp['media']))

        temp = dict_.pop('place')
        dict_['place'] = '{}'.format(temp)

        dict_['created_date'] = pd.to_datetime(dict_['created_at'])
        dict_['year_month'] = dict_['created_date'].strftime('%Y-%m')

        temp = dict_.pop('entities')
        for key in temp.keys():
            dict_[key] = ",".join(map(str, temp[key]))

        temp = dict_.pop('user')
        dict_['user'] = temp['name']
        dict_['user_id'] = temp['id']
        dict_['userhandle'] = temp['screen_name']
        dict_['location'] = temp['location']
        dict_['followers_count'] = temp['followers_count']
        dict_['user_statuses_count'] = temp['statuses_count']
        dict_['twitter_account_created_on'] = pd.to_datetime(
            temp['created_at']).strftime('%Y-%m-%d')

        dict_['retweeted_status'] = json.dumps(dict_.get('retweeted_status', 'None'))
    return all_tweets_list


class Scraper:
    def __init__(self, user, startdate, enddate, browser):
        directory = os.path.dirname(os.path.abspath(__file__))
        y, m, d = map(int, startdate.split('-'))
        self.start = datetime.datetime(y, m, d)
        y, m, d = map(int, enddate.split('-'))
        self.end = datetime.datetime(y, m, d)

        options = Options()
        options.headless = True

        self.user = user
        self.delay = 3
        self.driver = webdriver.Chrome(
            chrome_options=options, executable_path=os.path.join(directory, 'chromedriver'))
        self.id_selector = '.time a.tweet-timestamp'
        self.tweet_selector = 'li.js-stream-item'
        self.ids = []

    def format_day(self, date):
        return '-'.join(['{}'.format(date.year), '{}'.format(
            date.month).zfill(2), '{}'.format(date.day).zfill(2)])

    def form_url(self, user, since, until):
        st = """https://twitter.com/search?l=&
                q=from%3A{}%20since%3A{}%20until%3A{}&
                src=typd&lang=en""".format(
            user, since, until)
        return st

    def increment_day(self, date, i):
        return date + datetime.timedelta(days=i)

    def write_to_file(self, twitter_ids_filename, ids):
        try:
            directory = os.path.dirname(os.path.abspath(__file__))
            directory = os.path.join(directory, 'static')
            filepath = os.path.join(directory, twitter_ids_filename)
            with open(filepath, 'a+', encoding='cp1252') as outfile:
                [outfile.write('%d\n' % id) for id in ids]

        except Exception:
            logging.exception("Exception occured. Write to file aborted.")

    def scrape_latest3ktweets(self):
        directory = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(directory, 'api_keys.json'), encoding='cp1252') as f:
            keys = json.load(f)
        auth = OAuthHandler(keys['consumer_key'], keys['consumer_secret'])
        auth.set_access_token(keys['access_token'], keys['access_token_secret'])
        auth_api = API(auth)
        all_data = []
        for index, status in enumerate(Cursor(auth_api.user_timeline, id=self.user).items()):
            all_data.append(dict(status._json))

        all_data = formatted_tweets(all_data)
        df = pd.DataFrame(all_data)
        df['created_date'] = pd.to_datetime(df['created_at'])
        df['created_date'] = df['created_date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        df.dropna(how='all', inplace=True, axis=1)
        dbpath = os.path.join(directory, 'twitterdata.db')
        enginepath = 'sqlite:///'+dbpath
        engine = create_engine(enginepath)
        query = 'select id from tweets'
        import gramex
        initial_data = gramex.cache.query(query, engine)
        all_ids = initial_data.id.unique()
        if (len(all_ids) > 0):
            df = df.loc[~df['id'].isin(all_ids)]

        handler_data = df.to_dict(orient="list")
        update_aggregate_table(df)
        try:
            import gramex
            gramex.data.insert(enginepath, table='tweets', args=handler_data, id='id')
        except Exception as e:
            logging.exception(e)

    def scrape_historictweets(self):
        days = (self.end - self.start).days + 1
        for day in range(days):
            d1 = self.format_day(self.increment_day(self.start, 0))
            d2 = self.format_day(self.increment_day(self.start, 1))
            url = self.form_url(self.user, d1, d2)
            self.driver.get(url)
            sleep(self.delay)

            try:
                found_tweets = self.driver.find_elements_by_css_selector(self.tweet_selector)
                increment = 1

                while len(found_tweets) >= increment:
                    self.driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
                    sleep(self.delay)
                    found_tweets = self.driver.find_elements_by_css_selector(self.tweet_selector)
                    next_five = 5
                    increment += next_five

                for tweet in found_tweets:
                    try:
                        id = tweet.find_element_by_css_selector(
                            self.id_selector).get_attribute('href').split('/')[-1]
                        self.ids.append(id)
                        if len(self.ids) >= 1:
                            self.write_to_file(self.user, self.ids)
                            self.ids = []
                    except StaleElementReferenceException:
                        logging.exception('lost element reference' + tweet)

            except NoSuchElementException:
                logging.exception('no tweets on this day')

            self.start = self.increment_day(self.start, 1)
        self.driver.quit()


class GetMetadata:
    def __init__(self, user):
        self.user = user

        directory = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(directory, 'api_keys.json'), encoding='cp1252') as f:
            keys = json.load(f)

        auth = tweepy.OAuthHandler(keys['consumer_key'], keys['consumer_secret'])
        auth.set_access_token(keys['access_token'], keys['access_token_secret'])
        self.api = tweepy.API(auth)
        self.output_file = '{}.json'.format(self.user)

        directory = os.path.dirname(os.path.abspath(__file__))
        directory = os.path.join(directory, 'static')
        filepath = os.path.join(directory, self.user)
        try:
            with open(filepath, encoding='cp1252') as f:
                self.ids = f.read().splitlines()
            self.get_data(self.ids, self.api)
        except Exception as e:
            logging.exception(e)

    def get_data(self, ids, api):
        all_data = []
        start = 0
        end = 100
        limit = len(ids)
        i = math.ceil(limit / 100)

        for go in range(i):
            sleep(6)
            id_batch = ids[start:end]
            start += 100
            end += 100
            tweets = api.statuses_lookup(id_batch)
            for tweet in tweets:
                all_data.append(dict(tweet._json))  # list of dicts

        all_data = formatted_tweets(all_data)
        df = pd.DataFrame(all_data)
        df['created_date'] = pd.to_datetime(df['created_at'])
        df['created_date'] = df['created_date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        df.dropna(how='all', inplace=True, axis=1)
        directory = os.path.dirname(os.path.abspath(__file__))
        dbpath = os.path.join(directory, 'twitterdata.db')
        enginepath = 'sqlite:///'+dbpath
        engine = create_engine(enginepath)
        query = 'select id from tweets'
        import gramex
        initial_data = gramex.cache.query(query, engine)
        all_ids = initial_data.id.unique()
        if (len(all_ids) > 0):
            df = df.loc[~df['id'].isin(all_ids)]
        update_aggregate_table(df)
        handler_data = df.to_dict(orient="list")
        try:
            import gramex
            gramex.data.insert(enginepath, table='tweets', args=handler_data, id='id')
        except Exception as e:
            logging.exception(e)
        return all_data


def send():
    mailer = service.email['email-test']
    mailer.mail(
        to='kriti.rohilla@gramenerit.com',
        subject='Subject',
        body='This plain text is shown if the client cannot render HTML')
    return "Email Sent"


def startscraping(handler):
    try:
        args = handler.argparse(
            'twitterhandle'
        )
        browser = 'Chrome'

        try:
            startdate = datetime.date.today().strftime('%Y-%m-%d')
            enddate = datetime.datetime.strftime(
                datetime.datetime.now() - datetime.timedelta(5), '%Y-%m-%d')
            obj1 = Scraper(args.twitterhandle, startdate, enddate, browser)
            obj1.scrape_latest3ktweets()
            directory = os.path.dirname(os.path.abspath(__file__))
            dbpath = os.path.join(directory, 'twitterdata.db')
            enginepath = 'sqlite:///'+dbpath
            engine = create_engine(enginepath)
            query = '''SELECT DISTINCT twitter_account_created_on
                    FROM tweets WHERE userhandle = "{}"'''.format(
                    args.twitterhandle)
            data = gramex.cache.query(query, engine)
            enddate = datetime.date.today().strftime('%Y-%m-%d')
            startdate = '{}'.format(data['twitter_account_created_on'].get(0))
            obj2 = Scraper(args.twitterhandle, startdate, enddate, browser)
            obj2.scrape_historictweets()
        except Exception as e:
            logging.exception(e)
            directory = os.path.dirname(os.path.abspath(__file__))
            dbpath = os.path.join(directory, 'twitterdata.db')
            enginepath = 'sqlite:///'+dbpath
            engine = create_engine(enginepath)
            query = '''SELECT DISTINCT twitter_account_created_on
                    FROM tweets WHERE userhandle = "{}"'''.format(
                    args.twitterhandle)
            data = gramex.cache.query(query, engine)
            enddate = datetime.date.today().strftime('%Y-%m-%d')
            startdate = '{}'.format(data['twitter_account_created_on'].get(0))
            obj1 = Scraper(args.twitterhandle, startdate, enddate, browser)
            obj1.scrape_historictweets()

        try:
            obj2 = GetMetadata(args.twitterhandle)
        except Exception as e:
            obj2 = GetMetadata(args.twitterhandle)

        return (args.twitterhandle)

    except Exception as e:
        logging.exception(e)


def main1(handler):
    yield service.threadpool.submit(startscraping, handler)
    send()


def run_scheduler():
    directory = os.path.dirname(os.path.abspath(__file__))
    dbpath = os.path.join(directory, 'twitterdata.db')
    enginepath = 'sqlite:///'+dbpath
    engine = create_engine(enginepath)
    query = "SELECT DISTINCT userhandle FROM tweets"
    data = gramex.cache.query(query, engine)
    usernames = data.userhandle.unique()
    browser = 'Chrome'
    startdate = datetime.date.today().strftime('%Y-%m-%d')
    enddate = datetime.datetime.strftime(
        datetime.datetime.now() - datetime.timedelta(5), '%Y-%m-%d')
    for each_handle in usernames:
        obj1 = Scraper(each_handle, startdate, enddate, browser)
        obj1.scrape_latest3ktweets()
