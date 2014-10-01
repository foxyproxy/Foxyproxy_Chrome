var ga_key = chrome.i18n.getMessage("ga_key");

// google analytics boilerplate
var _gaq = _gaq || [];
_gaq.push(['fp4chrome._setAccount', ga_key]);
  
  
// inject google analytics script into background page.
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// listener for event tracking
chrome.runtime.onMessage.addListener(function( request, sender, sendResponse)  {
    if (request && request.trackEvent ) {
        var trackEvent = request.trackEvent;
        console.log("receieved tracking event: ", trackEvent);
        
        if (trackEvent.category && trackEvent.action) {
            // opt_interaction is always set to true because bounce rate doesn't make sense for an extension.
            //_gaq.push(['_trackEvent'], category, action, opt_label, opt_value, opt_noninteraction );
            _gaq.push(['fp4chrome._trackEvent'], trackEvent.category, trackEvent.action, trackEvent.label, trackEvent.value, true);
        }
    }
});
