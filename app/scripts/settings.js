
(function() {
    var settings,
        proxyList,
        useSyncStorage,
        storageApi,
        state = localStorage.getItem('state'),
        queryUrl = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/options.html";
    
    // always store 'state' in localStorage so we don't sync unwanted data.
    if (state === null) {
        localStorage.setItem('state', 'disabled');
    }
    
    useSyncStorage = JSON.parse(localStorage.getItem("useSyncStorage"));
    storageApi = useSyncStorage ? chrome.storage.sync : chrome.storage.local;

    //// migration code - move old settings from localStorage
    if (useSyncStorage === null) {
        localStorage.setItem("useSyncStorage", false);
        
        var localSettings = localStorage.getItem("settings");
        if (localSettings) {
            console.log("migrating settings from localStorage");
            settings = JSON.parse(localSettings);
            
            storageApi.set({"settings": settings});
            //localStorage.removeItem("settings");
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
        
            storageApi.set({"proxyList": proxyList});
            //localStorage.removeItem("proxyList");
        }

    } ///// end migration code
    
    // load initial settings or default settings
    if (!settings && !proxyList) {
        storageApi.get(["settings", "proxyList"], function( items) {
            if (items.settings) {
                foxyProxy._settings = items.settings;
            } else {
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
                storageApi.set({"settings": settings}, function() {
                    if (chrome.runtime.lastError) {
                        console.log("failed to set default settings");
                        console.log(chrome.runtime.lastError);
                    } else {
                        console.log("set settings to default");
                    }
                });
            }
            
            if (items.proxyList && items.proxyList.length) {
                storageApi.get(items.proxyList, function( proxies) {
                    var list = [];

                    for (var i = 0; i < items.proxyList.length; i++) {
                        list.push(new Proxy(proxies[items.proxyList[i]]));
                    }
                                        
                    foxyProxy._proxyList = list;
                    
                    if (foxyProxy.updateContextMenu) {
                        foxyProxy.updateContextMenu();
                    }
                });
                
            } else {
                var defaultProxy = new Proxy({
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
                        "socks": "5",
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
                });
                
                foxyProxy._proxyList = [ defaultProxy ];
                storageApi.set({ "proxyList": [ "default" ], "default": defaultProxy }, function() {
                    if (chrome.runtime.lastError) {
                        console.log("failed to set default proxy list");
                        console.log(chrome.runtime.lastError);
                    } else {
                        console.log("set proxyList to default");
                    }
                });
            }
        });
    }
    
    // chrome.storage.onChanged.addListener(function( changes, areaName) {
    //     console.log("got storage.onChanged for area: " + areaName);
    //     console.log(changes);
    // });
    
    
    ///// FP Settings API /////
        
    foxyProxy.setSync = function setSync( isSync ) {
        console.log("foxyProxy setSync: " + isSync);
        useSyncStorage = !!isSync;
        localStorage.setItem("useSyncStorage", useSyncStorage);
        storageApi = isSync ? chrome.storage.sync : chrome.storage.local;
        if (isSync) {
            foxyProxy.getSettings();
            foxyProxy.getProxyList();
        } else if (foxyProxy.updateSettings) {
            foxyProxy._settings.useSyncStorage = useSyncStorage;
            foxyProxy.updateSettings({"settings": foxyProxy._settings, "proxyList": foxyProxy._proxyList });
        }
    };
    
    foxyProxy.getSettings = function getSettings( callback) {
        storageApi.get("settings", function( items) {
            foxyProxy._settings = items.settings;
            if (callback) {
                callback(items);
            } else {
                chrome.tabs.query({"url": queryUrl},
                    function( tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            chrome.tabs.sendMessage(tabs[i].id, items);
                        }
                    }
                );            
            }
        });
    };
        
    foxyProxy.getProxyList = function getProxyList( callback) {
        var list = [];
        storageApi.get("proxyList", function( items) {
            
            if (items.proxyList && items.proxyList.length) {

                storageApi.get(items.proxyList, function( proxies) {
                    for (var i = 0; i < items.proxyList.length; i++) {
                        list.push(new Proxy(proxies[items.proxyList[i]]));
                    }

                    foxyProxy._proxyList = list;
                    
                    if (typeof(callback) == "function") {
                        callback({"proxyList": list });
                    } else {
                        chrome.tabs.query({"url": queryUrl },
                            function( tabs) {
                                console.log("sending proxyList to " + tabs.length + " foxyproxy tabs");
                                for (var i = 0; i < tabs.length; i++) {
                                    chrome.tabs.sendMessage(tabs[i].id, { "proxyList": list });
                                }
                            }
                        );

                    }
                });
            }
        });
    };

    foxyProxy.updateSettings = function updateSettings( message, sender, sendResponse ) {
        var i,
            proxy,
            proxyId,
            list = [],
            saveObj = {},
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
                // save proxies keyed off of ID to avoid storage quota limit.
                for (i = 0; i < message.proxyList.length; i++) {
                    proxy = message.proxyList[i];
                    id = proxy.data.id;
                    list.push(id);
                    saveObj[id] = proxy;
                }
                saveObj.proxyList = list;
            } else {
                keys.push("proxyList");
            }
        }
        if (keys.length > 0) {
            storageApi.get(keys, function( items) {
                if (typeof(sendResponse) == "function") {
                    sendResponse(items);
                } else {
                    chrome.tabs.query({"url": queryUrl},
                        function( tabs) {
                            for (var i = 0; i < tabs.length; i++) {
                                chrome.tabs.sendMessage(tabs[i].id, { "settings": foxyProxy._settings, "proxyList": foxyProxy._proxyList } );
                            }
                        }
                    );
                    if (foxyProxy.updateContextMenu) {
                        foxyProxy.updateContextMenu();
                    }
                }
            } );
        } else {
            storageApi.set(saveObj, function() {
                //TODO: handle errors
                if (chrome.runtime.lastError) {
                    console.log("error updating settings: ");
                    console.log(chrome.runtime.lastError);
                } else {
                    if (saveObj.settings) {
                        foxyProxy._settings = saveObj.settings;
                    }
                    if (saveObj.proxyList) {
                        var pList = [];
                        for (i = 0; i < saveObj.proxyList.length;i++) {
                            pList.push(saveObj[saveObj.proxyList[i]]);
                        }
                        foxyProxy._proxyList = pList;
                    }
                    if (typeof(sendResponse) == "function") {
                        sendResponse({ "settings": foxyProxy._settings, "proxyList": foxyProxy._proxyList });
                    } else {
                        chrome.tabs.query({"url": queryUrl},
                            function( tabs) {
                                for (var i = 0; i < tabs.length; i++) {
                                    chrome.tabs.sendMessage(tabs[i].id, { "settings": foxyProxy._settings, "proxyList": foxyProxy._proxyList });
                                }
                            }
                        );
                        if (foxyProxy.updateContextMenu) {
                            foxyProxy.updateContextMenu();
                        }
                    }
                }
            });
        }
    
    };
})();