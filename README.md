# Twitter-Intelligence-Web-Application

## Directory Structure for the project

    Twitter-Intelligence-Web-Application
    
    _pycache__/
    analyzetweets.py
    assets/
        README.md
    charts/
        -bar1.js
        -horizBar.js
        -linechart2.js
        -linechart3.js
        -wordcloud.j
    favicon.ico
    gramex.yaml
    index.html
    js/
        -common.js
        -filter-template.js
        -README.md
        -tweetRender.js
        -vegaMain.js
    ktr_dashboard.py
    modi.css
    package.json
    README.md
    scaff.html
    setup.sh*
    static/
        -ktr-jpg
        -modi.jpg
        -Preloader_.gif
    style.css
    templates/
        -favcount.html
        -filters.html
        -topsection.html
        -tweetcount.html
    test/
        -gramextest.yaml
    tweetscraper.py
    twitterdata.db

## File and function details

The gramex configuration is controlled by the file  `gramex.yaml`. For details on how to configure the app, read https://learn.gramener.com/guide/

The twitter scraper code is in `tweetscraper.py` and the collected tweets are analyzed using pandas in `analyzetweets.py` file. 

## Steps to set up locally

1. Install the following dependencies in your system
    - Anaconda 5.2.0 or later
    - Install node.js 8 or later

2. Make sure your system has latest python and pip installed

3. Install gramex using following commands:
    - `npm install -g yarn`
    - `pip install --verbose gramex`
    - `gramex setup --all`

4. Create a new directory and clone the repo in it using the following command :-

    `git clone https://github.com/kriti21/Twitter-Intelligence-Web-Application.git `

5. Open git bash or command line on your system and navigate to the repo and run gramex using :-

    `gramex`

  Open http://127.0.0.1:8080/ in the browser to see the application running.
