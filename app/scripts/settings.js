const SOCKS5 = "5";

(function() {
    var settings, proxyList;
    
    var queryUrl = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/*";
    

    // always store 'state' in localStorage so we don't sync unwanted data.
    if (!localStorage.getItem('state')) {
        localStorage.setItem('state', 'disabled');
    }

    //// migration code - move old settings from localStorage?
    var localSettings = localStorage.getItem("settings");
    if (localSettings) {
        console.log("migrating settings from localStorage");
        settings = JSON.parse(localSettings);
    }

    if (!settings) {
        settings = {
            showContextMenu: true,
            enabledQA: false,
            patternTemplateQA: "*://${3}${6}/*",
            patternNameQA: "Dynamic QuickAdd Pattern",
            patternTemporaryQA: false,
            patternWhitelistQA:"Inclusive",
            patternTypeQA:"wildcard",
            useAdvancedMenus: false
        };
    }

    var localProxyList = localStorage.getItem("proxyList");
    if (localProxyList) {
        console.log("migrating proxyList from localStorage");
        var proxyJSON = JSON.parse(localProxyList);
        proxyList = proxyJSON.map( function (p) {
            var t = new Proxy(p); // depends on proxy.js
            var i = 0;
            while (i < t.data.patterns.length) {
                if (t.data.patterns[i].data.temp) t.data.patterns.splice(i, 1);
                else i++;
            }

            return t;
        });
    }

    if (!proxyList) {
        proxyList = {
            "data": {
                "id": "default",
                "readonly": true,
                "enabled": true,
                "color": "#0000ff",
                "name": "Default",
                "notes": "These are the settings that are used when no patterns match an URL",
                "host": "",
                "port": "",
                "isSocks": false,
                "socks": SOCKS5,
                "pac": "",
                "dns": "",
                "type": "direct", // proxyMode
                "cycle": false,
                "useDns": true,
                "reloadPAC": false,
                "bypassFPForPAC": false,
                "reloadPACInterval": 60,
                "configUrl": "",
                "notifOnLoad": false,
                "notifOnError": false,
                "patterns": [],
                "ipPatterns": [],
                "login": "",
                "pass": ""
            }
        };
    }
    
    
    foxyProxy._settings = settings;
    foxyProxy._proxyList = proxyList;
    
    
    ///// FP Settings API /////
    
    var useSyncStorage, storageApi;
    
    foxyProxy.setSync = function setSync( isSync ) {
        console.log("foxyProxy setSync: " + isSync);
        useSyncStorage = !!isSync;
        localStorage.setItem("useSyncStorage", useSyncStorage);
        storageApi = isSync ? chrome.storage.sync : chrome.storage.local;
        foxyProxy._settings.useSyncStorage = useSyncStorage;
        if (foxyProxy.updateSettings) {
            foxyProxy.updateSettings({"settings": foxyProxy._settings, "proxyList": foxyProxy._proxyList });
        }
    };
    
    // -- bootstrap storage
    foxyProxy.setSync(JSON.parse(localStorage.getItem("useSyncStorage")));
    
    storageApi.set({ "settings": settings }, function() {
        if (chrome.runtime.lastError) {
            console.log("error saving settings: " + runtime.lastError);
        }
    });

    storageApi.set({ "proxyList": proxyList }, function() {
        if (chrome.runtime.lastError) {
            console.log("error saving proxyList: " + runtime.lastError);
        }
    });
    // --
    
    foxyProxy.getSettings = function getSettings( callback) {
        storageApi.get("settings", function( items) {
            if (callback) {
                callback(items);
            } else {
                chrome.tabs.query({"url": queryUrl},
                    function( tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            chrome.tabs.sendMessage(tabs[i].id, { "settings": items });
                        }
                    }
                );            
            }
        });
    };
        
    foxyProxy.getProxyList = function getProxyList( callback) {
        var queryUrl;
        console.log("getProxyList");
        storageApi.get("proxyList", function( items) {
            console.log("getProxyList got: " + items);
            console.log(items);
            
            if (callback) {
                callback(items);
            } else {
                /*
                var tabs = chrome.extension.getViews();
                console.log("sending message to " + tabs.length + " foxyproxy tabs");
                for (var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, { "proxyList": items });
                }
                */
                

                chrome.tabs.query({"url": queryUrl },
                    function( tabs) {
                        console.log("sending message to " + tabs.length + " foxyproxy tabs");
                        for (var i = 0; i < tabs.length; i++) {
                            console.log(tabs[i]);
                            chrome.tabs.sendMessage(tabs[i].id, { "proxyList": items });
                        }
                    }
                );
                
            }
        });
    };

    //TODO: rename/refactor
    foxyProxy.updateSettings = function updateSettings( message, sender, sendResponse ) {
        console.log("settings listener received message: " + message);
        console.log(message);
        var saveObj = {},
            keys = [];
        if (message.settings !== undefined) {        
            if (message.settings !== null) {
                saveObj.settings = message.settings;
            } else {
                keys.push("settings");
            }
        }
    
        if (message.proxyList !== undefined) {
            if (message.proxyList !== null) {
                saveObj.proxyList = message.proxyList;
            } else {
                keys.push("proxyList");
            }
        }
        console.log("keys: " + keys);
        if (keys.length > 0) {
            console.log("getting keys: " + keys);
            storageApi.get(keys, function( items) {
                if (typeof(sendResponse) == "function") {
                    sendResponse(items);
                } else {
                    chrome.tabs.query({"url": queryUrl},
                        function( tabs) {
                            for (var i = 0; i < tabs.length; i++) {
                                chrome.tabs.sendMessage(tabs[i].id, { "settings": items });
                            }
                        }
                    );
                }
            } );
        } else {
            console.log("saving to ");
            console.log(storageApi);
            console.log(saveObj);
            storageApi.set(saveObj, function() {
                //TODO: handle errors
                if (typeof(sendResponse) == "function") {
                    sendResponse(items);
                } else {
                    chrome.tabs.query({"url": queryUrl},
                        function( tabs) {
                            for (var i = 0; i < tabs.length; i++) {
                                chrome.tabs.sendMessage(tabs[i].id, { "settings": foxyProxy._settings });
                            }
                        }
                    );
                }
            });
        }
    
    };


    //FIXME
    /***** settings export *****/
    foxyProxy.settingsToXml = function () {
        var xmlDoc = document.implementation.createDocument("", "foxyproxy", null);
        var rootNode = xmlDoc.documentElement;
        rootNode.setAttribute('contextMenu', self.settings.showContextMenu.toString());
        var mode = self.state;
        if (self.state == 'auto') mode = 'patterns';
        rootNode.setAttribute('mode', mode);
        proxiesNode = xmlDoc.createElement('proxies');
        $.map(proxyList, function (proxy) {
            var proxyNode = xmlDoc.createElement('proxy');
            proxyNode.setAttribute('id', proxy.data.id);
            proxyNode.setAttribute('name', proxy.data.name);
            proxyNode.setAttribute('name', proxy.data.name);
            proxyNode.setAttribute('notes', proxy.data.notes);
            proxyNode.setAttribute('enabled', proxy.data.enabled);
            proxyNode.setAttribute('mode', proxy.data.mode);
            proxyNode.setAttribute('lastresort', proxy.data.readonly);
            proxyNode.setAttribute('color', proxy.data.color);
            var matchesNode = xmlDoc.createElement('matches');
            $.map(proxy.data.patterns, function (pattern) {
            var matchNode = xmlDoc.createElement('match');
            matchNode.setAttribute('enabled', pattern.data.enabled);
            matchNode.setAttribute('name', pattern.data.name);
            matchNode.setAttribute('pattern', pattern.data.url);
            matchNode.setAttribute('isRegEx', (pattern.data.type != 'wildcard'));
            matchNode.setAttribute('isBlackList', (pattern.data.whitelist != 'Inclusive'));
            matchNode.setAttribute('temp', pattern.data.temp);
            matchesNode.appendChild(matchNode);
            });
            proxyNode.appendChild(matchesNode);
            var autoconfNode = xmlDoc.createElement('autoconf');
            autoconfNode.setAttribute('url', proxy.data.configUrl);
            autoconfNode.setAttribute('autoReload', proxy.data.reloadPAC);
            autoconfNode.setAttribute('bypassFPForPAC', proxy.data.bypassFPForPAC);
            autoconfNode.setAttribute('reloadFreqMins', proxy.data.reloadPACInterval);
            proxyNode.appendChild(autoconfNode);
            var manualconfNode = xmlDoc.createElement('manualconf');
            manualconfNode.setAttribute('host', proxy.data.host);
            manualconfNode.setAttribute('port', proxy.data.port);
            manualconfNode.setAttribute('socksversion', proxy.data.socks.indexOf('5') != -1 ? '5' : '4');
            manualconfNode.setAttribute('isSocks', proxy.data.isSocks);
            proxyNode.appendChild(manualconfNode);
            proxiesNode.appendChild(proxyNode);
        });
        xmlDoc.documentElement.appendChild(proxiesNode);
        var quickAddNode = xmlDoc.createElement('quickadd');
        quickAddNode.setAttribute("enabled", self.settings.enabledQA);
        quickAddNode.setAttribute("temp", self.settings.patternTemplateQA);
        if (!self.settings.patternProxyQA || !proxyList[self.settings.patternProxyQA]) quickAddNode.setAttribute("proxy-id", "");
        else quickAddNode.setAttribute("proxy-id", proxyList[self.settings.patternProxyQA].data.id);
        var quickAddMatchNode = xmlDoc.createElement('match');
        quickAddMatchNode.setAttribute('enabled', 'true');
        quickAddMatchNode.setAttribute('name', 'true');
        quickAddMatchNode.setAttribute('pattern', self.settings.patternTemplateQA);
        quickAddMatchNode.setAttribute('name', self.settings.patternNameQA);
        xmlDoc.documentElement.appendChild(quickAddNode);
        return (new XMLSerializer()).serializeToString(xmlDoc);
    };
    
})();