import pandas as pd
import re
import pymysql
from collections import Counter
from wordcloud import STOPWORDS


def tweet_query(args):
    users = args.get('user', [])
    if len(users) > 0:
        vals = ', '.join("'%s'" % pymysql.escape_string(v) for v in users)
        return 'select * from tweets where user in (%s)' % vals
    else:
        return 'select * from tweets where user = "Narendra Modi"'


def aggregate_tweet_query(args):
    users = args.get('user', [])
    if len(users) > 0:
        vals = ', '.join("'%s'" % pymysql.escape_string(v) for v in users)
        return 'select * from aggtweets where user in (%s)' % vals
    else:
        return 'select * from aggtweets where user = "Narendra Modi"'


def draw_cards(handler, data):
    args = handler.argparse(
        card={'default': 'favorites'},
    )

    cards_dictionary = {
        'favorites': five_most_popular_tweet,
        'retweets': five_most_popular_tweet,
        'language_diversity': get_language_diversity,
        'total_languages': get_total_languages,
        'wordcloud': get_wordcloud
    }
    col = None
    if args.card == 'favorites':
        col = 'favorite_count'
    elif args.card == 'retweets':
        col = 'retweet_count'
    return cards_dictionary[args.card](data, col)


def draw_charts(handler, data):
    args = handler.argparse(
        chart={'default': 'tweet_count_month'},
    )
    charts_dictionary = {
        'tweet_count_day': draw_tweet_count,
        'tweet_count_month': draw_tweet_count,
        'tweet_count_year': draw_tweet_count,
        'fav_count_day': draw_fav_count,
        'fav_count_month': draw_fav_count,
        'fav_count_year': draw_fav_count,
        'ret_count_day': draw_ret_count,
        'ret_count_month': draw_ret_count,
        'ret_count_year': draw_ret_count,
        'avg_tweets': get_average,
        'avg_followers': get_average,
        'avg_retweets': get_average,
        'avg_favorites': get_average,
        'engagement_score_day': draw_engagement_score,
        'engagement_score_month': draw_engagement_score,
        'engagement_score_year': draw_engagement_score,
    }

    if args.chart in ['tweet_count_day', 'fav_count_day', 'ret_count_day',
                      'engagement_score_day']:
        col = 'day'
    elif args.chart in ['tweet_count_month', 'fav_count_month',
                        'ret_count_month', 'engagement_score_month']:
        col = 'month'
    elif args.chart in ['tweet_count_year', 'fav_count_year',
                        'ret_count_year', 'engagement_score_year']:
        col = 'year'
    elif args.chart == 'avg_tweets':
        col = 'tweet_count'
    elif args.chart == 'avg_followers':
        col = 'followers_count'
    elif args.chart == 'avg_retweets':
        col = 'retweet_count'
    elif args.chart == 'avg_favorites':
        col = 'favorite_count'

    data['created_day'] = pd.to_datetime(data['created_date'])
    data['created_month'] = data['created_day'].apply(lambda x: x.strftime('%Y-%m'))
    data['created_year'] = data['created_day'].apply(lambda x: x.strftime('%Y'))
    return charts_dictionary[args.chart](data, col)


def draw_tweet_count(data, col=None):
    if (col == 'day'):
        return data[['created_date', 'tweet_count']]
    elif (col == 'month'):
        cnt = data.groupby(['created_month']).agg(sum).reset_index()[
            ['created_month', 'tweet_count']]
        return cnt
    elif (col == 'year'):
        cnt = data.groupby(['created_year']).agg(sum).reset_index()[['created_year', 'tweet_count']]
        return cnt


def draw_fav_count(data, col=None):
    if (col == 'day'):
        return data[['created_date', 'favorite_count']]
    elif (col == 'month'):
        favs = data.groupby(['created_month']).agg(sum).reset_index()[
            ['created_month', 'favorite_count']]
        return favs
    elif (col == 'year'):
        favs = data.groupby(['created_year']).agg(sum).reset_index()[
            ['created_year', 'favorite_count']]
        return favs


def draw_ret_count(data, col=None):
    if (col == 'day'):
        return data[['created_date', 'retweet_count']]
    elif (col == 'month'):
        rets = data[['created_month', 'created_year', 'retweet_count']]
        rets = rets.groupby(['created_month', 'created_year']).agg(sum).reset_index()[
            ['created_month', 'created_year', 'retweet_count']]
        return rets
    elif (col == 'year'):
        rets = data.groupby(['created_year']).agg(sum).reset_index()[
            ['created_year', 'retweet_count']]
        return rets


def get_average(data, col=None):
    res = [int(data[col].mean())]
    return pd.DataFrame(res, columns=[col])


def draw_engagement_score(data, col=None):
    if (col == 'day'):
        data['es'] = (data['favorite_count']+data['retweet_count'])/(data['followers_count'])
        return data[['created_date', 'es']]
    elif (col == 'month'):
        temp = data.groupby(['created_month']).agg(sum).reset_index()[
            ['created_month', 'favorite_count', 'retweet_count', 'followers_count']]
        temp['es'] = (temp['favorite_count']+temp['retweet_count'])/(temp['followers_count'])
        return temp[['created_month', 'es']]
    elif (col == 'year'):
        temp = data.groupby(['created_year']).agg(sum).reset_index()[
            ['created_year', 'favorite_count', 'retweet_count', 'followers_count']]
        temp['es'] = (temp['favorite_count']+temp['retweet_count'])/(temp['followers_count'])
        return temp[['created_year', 'es']]


def get_language_diversity(data, col=None):
    res = data.groupby('lang').size().reset_index(
        name='languages').sort_values(by='languages', ascending=False)[:5]
    return res


def get_total_languages(data, col=None):
    res = data['lang'].unique()
    return pd.DataFrame(res)


def five_most_popular_tweet(data, col=None):
    s = data.nlargest(5, col)['id_str']
    return s.to_frame()


def get_wordcloud(data, col=None):
    stopwords = set(STOPWORDS)
    stopwords.add('amp')

    _ = data[data['lang'] == 'en']['text'].values
    text = re.sub(
        '(http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?',
        '', ' '.join(_))
    wordlist = re.sub("[^\w]", " ",  text).split()
    wordfrequency = dict(Counter(wordlist))
    words = list(wordfrequency.keys())
    counts = list(wordfrequency.values())
    df_words = pd.DataFrame({'word': words, 'count': counts})
    word = [
        'i', 'me', 'myself',
        'we', 'us', 'our', 'ours', 'also', 'ourselves',
        'you', 'your', 'yours', 'yourself', 'yourselves',
        'he', 'him', 'his', 'himself',
        'she', 'her', 'hers', 'herself',
        'it', 'its', 'itself',
        'they', 'them', 'their', 'theirs', 'themselves',
        'what', 'which', 'who', 'whom', 'whose',
        'this', 'that', 'these', 'those',
        'am', 'is', 'are', 'was', 'were',
        'be', 'been', 'being',
        'have', 'has', 'had', 'having',
        'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'can', 'could', 'ought',
        'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
        'than', 'too', 'very', 'say', 'says', 'said', 'shall',
        'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while',
        'of', 'at', 'by', 'for', 'with',
        'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
        'above', 'below', 'to', 'from', 'up', 'upon', 'down', 'in', 'out'
        'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
        'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
        'few', 'more', 'most', 'other']
    word.append('https')
    df_words = df_words.query("word not in @word")
    return df_words.nlargest(1000, 'count')
