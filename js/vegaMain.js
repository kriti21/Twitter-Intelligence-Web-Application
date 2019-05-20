/* global vega, vegaTooltip, g1, bar1, horizBar, lineChart2, lineChart3, wordclouder, bar2, 
renderCharts, maxVal */

// all charts rendered are iterated using foreach loop on year/month arrays
var charts = [bar1, horizBar, lineChart2, lineChart3, wordclouder]
var modiYear = ['analysis2?chart=tweet_count_year&user=Narendra%20Modi', 'analysis2?chart=fav_count_year&user=Narendra%20Modi', 'analysis2?chart=ret_count_year&user=Narendra%20Modi', 'analysis2?chart=engagement_score_year&user=Narendra%20Modi', 'analysis?card=wordcloud']
var ktrYear = ['analysis2?chart=tweet_count_year&user=KTR', 'analysis2?chart=fav_count_year&user=KTR', 'analysis2?chart=ret_count_year&user=KTR', 'analysis2?chart=engagement_score_year&user=KTR', 'analysis?card=wordcloud&user=KTR']
var modiMonth = ['analysis2?chart=tweet_count_month&user=Narendra%20Modi', 'analysis2?chart=fav_count_month&user=Narendra%20Modi', 'analysis2?chart=ret_count_month&user=Narendra%20Modi', 'analysis2?chart=engagement_score_month&user=Narendra%20Modi', 'analysis?card=wordcloud']
var ktrMonth = ['analysis2?chart=tweet_count_month&user=KTR', 'analysis2?chart=fav_count_month&user=KTR', 'analysis2?chart=ret_count_month&user=KTR', 'analysis2?chart=engagement_score_month&user=KTR', 'analysis?card=wordcloud&user=KTR']
var counts = ['tweet_count', 'favorite_count', 'retweet_count', 'es', 'word']
var chartIds = ['#chart1', '#chart2', '#chart3', '#chart4', '#wordcloud']
var modmUri = ['analysis2?chart=tweet_count_year', 'analysis2?chart=fav_count_year']
var ktrmUri = ['analysis2?chart=tweet_count_year&user=KTR', 'analysis2?chart=fav_count_year&user=KTR']
var modyUri = ['analysis2?chart=tweet_count_month', 'analysis2?chart=fav_count_month']
var ktryUri = ['analysis2?chart=tweet_count_month&user=KTR', 'analysis2?chart=fav_count_month&user=KTR']
var templateId = ['#tweetct', '#favct']
var objRef = ['tweet_count', 'favorite_count']
var dict = {
    'month': 'created_month',
    'year': 'created_year',
    'day': 'created_day',
    'tooltipYear': 'datum.created_year',
    'tooltipMonth': 'datum.created_month',
    'mth': 'Month',
    'yr': 'Year',
}
// Creates vega view
function createView(data, chartId) {
    var handler = new vegaTooltip.Handler();
    new vega.View(vega.parse(data))
    .renderer('svg')
    .tooltip(handler.call)
    .logLevel(vega.Warn)
    .initialize(chartId)
    .hover()
    .run()
    setResponsive(chartId)
}
// Ajax call for loading data into vega
function ajax_call(url) {
    return $.getJSON({
    dataType: 'json',
    url: url
    })
}

function renderCharts(yearArr, monthArr) {
    // hash contains aggtime key in searchList
    var parseD = g1.url.parse(location.hash.replace('#', '')).searchList
    if('aggtime' in parseD) {
        yearArr.forEach(function(element, index) {
            ajax_call(element)
            .done(function(result) {
                createView(charts[index](result, dict.year, dict.yr, dict.tooltipYear, counts[index]), chartIds[index])
            })
            .fail(function() {})
        })
    } else {      
        monthArr.forEach(function(element, index) {
            ajax_call(element)
            .done(function(result){
                createView(charts[index](result, dict.month, dict.mth, dict.tooltipMonth, counts[index]), chartIds[index])
            })
            .fail(function() {})
        })
    }
}

function setResponsive(chartId) {
    setTimeout(function(){
        $(chartId + ' svg').attr({'width': '90%', 'height': '100%'})
    }, 1000)
}

// Renders charts according to the selected user and also the maximum values in each chart
function userHandler() {
    var z = g1.url.parse(location.hash.replace('#', '')).searchList
    if('user' in z) {
        renderCharts(ktrYear, ktrMonth);
        ('aggtime' in z) ? ktrmUri.forEach(function(elem, index) { maxVal(elem, templateId[index], objRef[index]) }) : ktryUri.forEach(function(elem, index) { maxVal(elem, templateId[index], objRef[index]) })
    } else{
        renderCharts(modiYear, modiMonth);
        ('aggtime' in z) ? modmUri.forEach(function(elem, index) { maxVal(elem, templateId[index], objRef[index]) }) : modyUri.forEach(function(elem, index) { maxVal(elem, templateId[index], objRef[index]) })
    }
}