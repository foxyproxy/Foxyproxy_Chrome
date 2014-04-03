
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
    //-- Handler for switching between the extension state (available states is [disabled | auto | <proxy.data.id>])
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
        console.log("State change: " + this.state);
        switch (this.state) {
            case "disabled": // foxyproxy is disabled
                console.log("disabled");
                ProxyManager.applyDisable(ProxyManager.directConnectionProfile);
                chrome.browserAction.setIcon({
                    path: 'images/logo-disabled.png'
                });
                break;
            case "auto": // foxyproxy is set to by pattern proxy - auto
                console.log("patterns mode is selected");
                ProxyManager.applyAuto(ProxyManager.profileAuto());
                chrome.browserAction.setIcon({
                    path: 'images/logo.png'
                });
                break;

            default: // single proxy selected
                var proxy = null;
                if (self._proxyList) {
                    for (var i = 0; i < self._proxyList.length; i++) {
                        if (self._proxyList[i].data.id == this.state) proxy = self._proxyList[i];
                    }
                    if (proxy && (proxy.data.pac.length === 0 || !proxy.data.pac)) {
                        console.log("manual mode selected and proxy is " + proxy);
                        console.log("icon is " + foxyProxy.icon);
                        console.log(foxyProxy.icon);
                        chrome.browserAction.setIcon({
                            imageData: IconCreator.paintIcon(foxyProxy.icon, proxy.data.color)
                        });
                        ProxyManager.applyProxy(ProxyManager.profileFromProxy(proxy));
                    } else {
                        console.log("manual mode selected with remote PAC and proxy is " + proxy);
                        chrome.browserAction.setIcon({
                             imageData: IconCreator.paintIcon(foxyProxy.icon, proxy.data.color)
                        });
                        ProxyManager.applyAutoPac(proxy);
                    }
                }
        }
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
    
    // used by quickAdd feature
    this.getProxyForUrl = function (url, callback) {
        switch (this.state) {
            case "disabled":
                break;
            case "auto":
                var res = ProxyManager.getPatternForUrl(url);
                if (res.proxy) {
                    callback(url, res.proxy, res.pattern);
                    return;
                }
                break;
            default:
                var proxy = null;
                for (var i = 0; i < proxyList.length; i++)
                    if (proxyList[i].data.id == this.state) proxy = proxyList[i];
                if (proxy) {
                    callback(url, proxy);
                    return;
                }
        }
        callback(url);
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
    };
    
    this.toggleSyncStorage = function() {
        var useSyncStorage = JSON.parse(localStorage.getItem("useSyncStorage"));
        console.log("toggling sync storage from " + useSyncStorage + " to " + !useSyncStorage);
        
        foxyProxy.setSync(!useSyncStorage);
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