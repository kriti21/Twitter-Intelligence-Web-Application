/* globals ajax_call, tweetsRender, g1, twttr */
var likeContainers = ['tweetlike1', 'tweetlike2', 'tweetlike3', 'tweetlike4', 'tweetlike5']
var retContainers = ['retweet1', 'retweet2', 'retweet3', 'retweet4', 'retweet5']

var modiRetweetIds = ["1101521097323958272", "1096035566670565376", "1096446425276153856", "890204830416883712", "1096293506048380928"]
var ktrRetweetIds = ["1072384049933619200", "1027274231766286338", "1038427160959041536", "1058237306203648001", "891655750455410696"]


function tweetsRender() {
    var list = g1.url.parse(location.hash.replace('#', '')).searchList;
    $('#retweet1').text('');
    $('#tweetlike1').text('');
    if ('user' in list) {
      ajax_call("analysis?card=retweets&user=KTR").done(function(result) {
        result.forEach(function(d) {
          tweetCreate(d.id_str, 'retweet1')
        })
      })
      ajax_call("analysis?card=favorites&user=KTR").done(function(result) {
        result.forEach(function(d) {
          tweetCreate(d.id_str, 'tweetlike1')
        })
      })
  
    } else {
      ajax_call("analysis?card=retweets").done(function(result) {
        result.forEach(function(d) {
          tweetCreate(d.id_str, 'retweet1')
        })
      })
      ajax_call("analysis?card=favorites").done(function(result) {
        result.forEach(function(d) {
          tweetCreate(d.id_str, 'tweetlike1')
        })
      })
    }
  }

  // Gets tweets and renders it
  function tweetCreate(id, containerId) {
    twttr.widgets.createTweet(id, document.getElementById(containerId), {
        cards: 'hidden',
        conversation: 'none',
        theme: 'light'
      }
    );
  }

  