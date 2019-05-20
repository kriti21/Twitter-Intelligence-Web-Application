/* globals renderCharts, pillHandler, g1, maxVal, userHandler, tweetsRender, twttr, topSec */

// Preloader
function hideLoader() {
    $('#preloader').hide()
    $('#main').show()
   }
   
   $(window).ready(hideLoader)
   setTimeout(hideLoader, 20 * 1000)


   $('body').urlfilter()
   $('.selectpicker').selectpicker()

function urlfilterAdder() {
    $('button.dropdown-toggle').click()
    $('button.dropdown-toggle').click()
    $('li>a.dropdown-item').each(function(index){
        if(index==0){
        $(this).addClass('urlfilter').attr('data-target','#').attr('data-mode','del').attr('href','?user=KTR')
        } else {
        $(this).addClass('urlfilter').attr('data-target','#').attr('data-mode','toggle').attr('href','?user=KTR')
    }
    })
}

// Call all these functions once
$(function() {
userHandler();
pillHandler();
urlfilterAdder();
tweetsRender();
topSec();
})

// this function will be bound to hashchange event and will render templates and charts
function hashTrig() {
userHandler();
pillHandler();
tweetsRender();
topSec();
}
window.onhashchange = hashTrig
