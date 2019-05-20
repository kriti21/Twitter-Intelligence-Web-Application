/* globals g1, tweetMax, ajax_call, pillHandler, hashNun */

function pillHandler() {
  var currentObj = g1.url.parse(location.hash.replace('#', '')).searchList;
  var templateData = [];
  for(var property in currentObj) {
    templateData.push({[property]: currentObj[property][0]})
  }
  $('#filter_breadcrumb').template({data: templateData})
}

function hashNun(event) {
  event .preventDefault();
  window.location.hash = "";
}

// gets the max value of count in data
function maxVal(url, id, objVal) {
ajax_call(url).done(function(data) {
	var z, date, userBool=false, timeBool=false;
	data.forEach(function(val, index) {
		if(index==0) {
            z=val[objVal]
            date=val.created_month || val.created_year
        }
		else {
	if(val[objVal]>z) {
        z=val[objVal]
        date=val.created_month||val.created_year
    }
 }
})
var fullDate = new Date(date);
var month = fullDate.toLocaleString('en-us', {month: 'long'})
var gVar = g1.url.parse(location.hash.replace('#', '')).searchList
if('user' in gVar) userBool=true
if('aggtime' in gVar) timeBool=true
    var y = {"count": numeral(z).format('0,0'), "date": date, "user": userBool, "month": month, "time": timeBool}
    $(id).template({data: y})
})
}

function topSec(){
  var searchList = g1.url.parse(location.hash.replace('#', '')).searchList
  var y={}
  if('user' in searchList) {
    var ktrTotal;
    y.img = "./static/ktr.jpg"
    y.twitFollowers = numeral(1209856).format('0,0');
    $.ajax({url: "analysis2?chart=tweet_count_year&user=KTR"})
      .done(function(ktrTweetObj){
        ktrTotal = totaller(ktrTweetObj, 'tweet_count')
        y.totalTweets = numeral(ktrTotal).format('0,0');
        $.ajax({url: "analysis2?chart=ret_count_year&user=KTR"})
          .done(function(ktrRetCt){
            y.avgTweet = numeral(Math.ceil(totaller(ktrRetCt, 'retweet_count')/ktrTotal)).format('0,0');
          })
        $.ajax({url: "analysis2?chart=fav_count_year&user=KTR"})
          .done(function(res){
            y.avgFav = numeral(Math.ceil(totaller(res, 'favorite_count')/ktrTotal)).format('0,0');
          })
      });
  } else {
    var modiTotal;
    y.img = "./static/modi.jpg"
    y.twitFollowers = numeral(28503034).format('0,0');
    $.ajax({url: "analysis2?chart=tweet_count_year"})
      .done(function(modiTweetObj) {
        modiTotal = totaller(modiTweetObj, 'tweet_count')
        y.totalTweets = numeral(modiTotal).format('0,0');
        $.ajax({url: "analysis2?chart=ret_count_year"})
          .done(function(modiRetCt){
            y.avgTweet = numeral(Math.ceil(totaller(modiRetCt, 'retweet_count')/modiTotal)).format('0,0');
          })
        $.ajax({url: "analysis2?chart=fav_count_year"})
          .done(function(modiFavCt){
            y.avgFav = numeral(Math.ceil(totaller(modiFavCt, 'favorite_count')/modiTotal)).format('0,0');
          })
      });
  }
  $('#topsection').template({data: y})
}

function sum(total, num){
  return total+num
}


function totaller(a, key){
	var tempO = []
	a.forEach(function(element){
	tempO.push(element[key])
})
 var complete = tempO.reduce(sum)
return complete
}
