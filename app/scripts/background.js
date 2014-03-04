'use strict';

/* onInstalled listener opens tab to the appropriate post-install page. */
chrome.runtime.onInstalled.addListener(function(details) {
    var urlToOpen;
    
    if (details.reason ) {
        var target = chrome.i18n.getMessage("FoxyProxy_Target").toLowerCase(),
            edition = chrome.i18n.getMessage("FoxyProxy_Edition").toLowerCase();
        
        if ("dev" == edition) {
            return; //short-circuit to avoid opening tabs in dev mode.
        }
        
        if (details.reason == "install") {
            urlToOpen = "http://getfoxyproxy.org/" + target + "/" + edition + "/install.html";
        } else if (details.reason == "update") {
            urlToOpen = "http://getfoxyproxy.org/" + target + "/" + edition + "/update.html";
        }

        if (urlToOpen) {
            chrome.tabs.create({
                url: urlToOpen,
                selected: true
            });
        }
    }
});
