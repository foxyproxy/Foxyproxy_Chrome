
/* Extension object - main entry point for FoxyProxy extension */
function Extension() {
    var _settings,
        _proxyList,
        state,
        self = this;
        timers = [];

    //this.log = new FoxyLog();
    
    this.__defineGetter__("state", function () {
        return state;
    });
    
    this.__defineSetter__("state", function (_state) {
    //-- Handler for switching between the extension state (available states are [disabled | auto | <proxy.data.id>])
        console.log("setting state...");
        state = _state;
        reloadTimers();
        this.applyState();
        if (this.updateContextMenu) {
            this.updateContextMenu();
        }
        localStorage.setItem("state", _state);
    });

    /***** util functions *****/
    
    function reloadTimers() {
        console.log('reload timers');
        while (timers.length) {
            clearInterval(timers.pop());
        } 
        
        if (_proxyList && _proxyList.length) {
            _proxyList.map( function (proxy, i) {
                //-- Save to storage only proxies with temp= false
                if (proxy.data.type == 'auto' && proxy.data.reloadPAC && parseInt(proxy.data.reloadPACInterval, 10)) {
                    timers.push(
                        setInterval((function (i) {
                            return function () {
                                proxyList[i].updatePAC();
                                console.log(proxyList[i]);
                                self.applyState();
                            };
                        })(i), proxy.data.reloadPACInterval * 60000));
                }
            });
        }
    }

    
    this.applyState = function () {
        var color;
        console.log("State change: " + this.state);
        
        switch (this.state) {
            case "disabled": // foxyproxy is disabled
                console.log("disabled");
                ProxyManager.applyDisable(ProxyManager.directConnectionProfile);
                break;
            case "auto": // foxyproxy is set to by pattern proxy - auto
                console.log("patterns mode is selected");
                ProxyManager.applyAuto(ProxyManager.profileAuto());
                break;

            default: // single proxy selected
                var proxy = this.getCurrentProxy();

                if (proxy) {
                    color = proxy.data.color;
                    if (proxy.data.pac.length === 0 || !proxy.data.pac) {
                        console.log("manual mode selected and proxy is " + proxy);
                        ProxyManager.applyProxy(ProxyManager.profileFromProxy(proxy));
                    } else {
                        console.log("manual mode selected with remote PAC and proxy is " + proxy);
                        ProxyManager.applyAutoPac(proxy);
                    }
                }
                
        }
        foxyProxy.updateIcon(color);
    };
    
    /**
     * returns the edition of this version of FoxyProxy, e.g. 'Standard' or 'Basic'.
     * defaults to 'Standard'
     */
    this.getFoxyProxyEdition = function() {
        var edition = chrome.i18n.getMessage("FoxyProxy_Edition");
        
        if (!edition) {
            edition = 'Standard';
        }
        
        return edition;
    };
    
    
    /*
     * Returns the current proxy object in use, if a single proxy is selected.
     */
    this.getCurrentProxy = function getCurrentProxy() {
        if (self._proxyList) {
            for (var i = 0; i < self._proxyList.length; i++) {
                if (self._proxyList[i].data.id == this.state) {
                    return self._proxyList[i];
                }
            }
        }
    };
    
    // used by quickAdd feature
    this.getProxyForUrl = function (url, callback) {
        if (this.state == 'auto') {
            var res = ProxyManager.getPatternForUrl(url);
            if (res.proxy) {
                callback(url, res.proxy, res.pattern);
                return;
            }
        } else {
            var proxy = this.getCurrentProxy();
            callback(url, proxy);
            return;
            
        }
    };


    this.options = function (data) {
        //-- This function opens options page with passed data parametr or update existent tab with opened options page if exists
        var bOptionsPageFound = false;
        chrome.tabs.getAllInWindow(null, function (tabs) { //FIXME: replace tab.url with chrome.extension.getViews to remove tabs permission
            tabs.forEach(function ( tab) {
                if (tab.url.indexOf(chrome.extension.getURL("options.html")) === 0) { 
                    bOptionsPageFound = true;
                    chrome.tabs.update(tab.id, {
                        url: chrome.extension.getURL("options.html") + "#" + data,
                        selected: true
                    });
                    self.optionsTabId = tab.id;
                }
            });
            if (!bOptionsPageFound) {
                chrome.tabs.create({
                    url: chrome.extension.getURL("options.html") + "#" + data,
                    selected: true
                }, function( tab) {
                    self.optionsTabId = tab.id;
                });
            }
        });
        
        // dispatch data via message api
        if (data) {
            chrome.tabs.sendMessage(self.optionsTabId, { "data": data });
        }
    };
    
    this.toggleSyncStorage = function() {
        console.log("toggling sync storage");
        
        foxyProxy.setSync(!foxyProxy._settings.useSyncStorage);
    };
    
    this.toggleAdvancedMenus = function toggleAdvancedMenus() {
        
        foxyProxy._settings.useAdvancedMenus = !foxyProxy._settings.useAdvancedMenus;
        foxyProxy.updateContextMenu();
        
        if (self.optionsTabId) {
            chrome.tabs.sendMessage(self.optionsTabId, { setting: "useAdvancedMenus" });
        }
        
        foxyProxy.updateSettings({"settings": foxyProxy._settings });
    };
    
    this.toggleShowContextMenu = function toggleShowContextMenu() {
        foxyProxy._settings.showContextMenu = !foxyProxy._settings.showContextMenu;
        foxyProxy.updateContextMenu();
        
        if (self.optionsTabId) {
            chrome.tabs.sendMessage(self.optionsTabId, { setting: "showContextMenu" });
        }
        
        foxyProxy.updateSettings({"settings": foxyProxy._settings });
    };
    
    this.updateIcon = function updateIcon( color) {
        if (foxyProxy.state == 'disabled') {
            chrome.browserAction.setIcon({
                path: 'images/logo-disabled.png'
            });
        } else if (foxyProxy.state == 'auto') {
            chrome.browserAction.setIcon({
                path: 'images/logo.png'
            });
        } else if (color) {
            foxyProxy.currentIcon = foxyProxy.icon;
            foxyProxy.currentImageData = IconCreator.paintIcon(foxyProxy.icon, color);
            chrome.browserAction.setIcon({
                imageData: foxyProxy.currentImageData
            });
        }
    };

    /*
     * Listen for beforeNavigate events and update foxyProxy icon
     */
    chrome.webNavigation.onBeforeNavigate.addListener(function( details) {
        var url = details.url;
        if (url) {
            foxyProxy.getProxyForUrl(url, function(url, proxy, pattern) {
                if (proxy) {
                    foxyProxy.updateIcon(proxy.data.color);
                    
                    if (foxyProxy.state == 'auto') {
                        foxyProxy.animateBlink(6);
                    } else {
                        foxyProxy.animateFlip();
                    }
                } else {
                    foxyProxy.updateIcon();
                }
            });
        }
    });
    
    /*
     * quick-add command listener
     */
    chrome.commands.onCommand.addListener(function( command) {
        console.log("got command: " +command);
        if (command == "quick-add" ) {
            // get current url
            chrome.tabs.query(
                { 
                    "active": true,
                    //"currentWindow": true,
                    "lastFocusedWindow": true,
                    "windowType": "normal"
                },
                function( tabs ) {
                    if (tabs[0]) {
                        console.log("url is : " + tabs[0].url);
                        self.options('addpattern#' + tabs[0].url);
                    }
                }
            );
            // chrome.tabs.getCurrent(function( tab) {
            //     if (tab) {
            //         var url = tab.url;
            //         console.log("url is : " + url);
            //         self.options('addpattern#' + url);
            //         
            //     }
            //  });
        }
    });
    
    /*
     *
     *
    chrome.webNavigation.onCompleted.addListener(function () {
        foxyProxy.updateIcon();
    }); */
    
    //FIXME: onRequest is deprecated!
    // chrome.extension.onRequest.addListener(function (request, sender, callback) {
    // 
    // var tab = sender.tab;
    // if (state == 'disabled') return;
    // 
    // if (request.action == 'addpattern') {
    //         if (self.settings.enabledQA) {
    //       self.options('addpattern#' + request.url);
    //         }
    // } 
    //     else if (request.action == 'proxylist') {
    //     self.options('tabProxies');
    // } 
    //     else if (request.action == 'log') {
    // 
    //     self.getProxyForUrl(request.url, function (url, proxy, pattern) {
    // 
    //     console.log(proxy, IconCreator.paintIcon(self.icon, proxy.data.color));
    //     if (proxy) {
    //         self.currentImageData = IconCreator.paintIcon(self.icon, proxy.data.color);
    //         chrome.browserAction.setIcon({
    //         imageData: self.currentImageData
    //         });
    //         self.log.addLog(url, proxy, pattern);
    //         if (self.state == 'auto') {
    //         self.animateBlink(6);
    //         } else {
    //         self.animateFlip();
    //         }
    //     } else {
    //         self.currentIcon = self.icon;
    //         chrome.browserAction.setIcon({
    //         path: 'images/logo.png'
    //         });
    //     }
    //     });
    // }
    // });     
}

// bootstrap
foxyProxy = new Extension();

foxyProxy.state = localStorage.getItem('state') || 'disabled';