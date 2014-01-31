/* onInstalled listener opens tab to the appropriate post-install page. */
chrome.runtime.onInstalled.addListener(function(details) {
    var urlToOpen;
    
    if (details.reason ) {
        var target = chrome.i18n.getMessage("FoxyProxy_Target").toLowerCase(),
            edition = chrome.i18n.getMessage("FoxyProxy_Edition").toLowerCase();
            
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

/* Extension object - main entry point for FoxyProxy extension */
function Extension() {
    var settings = JSON.parse(localStorage.getItem('settings'));
    var proxyList = $.map(JSON.parse(localStorage.getItem('proxyList')), function (p) {
	var t = new Proxy(p);
	var i = 0;
	while (i < t.data.patterns.length) {
	    if (t.data.patterns[i].data.temp) t.data.patterns.splice(i, 1);
	    else i++;
	}
	return t;
    });
    var state = null;
    var self = this;
    var timers = [];
    this.log = new FoxyLog();
    this.__defineGetter__("settings", function () {
	return settings;
    });
    this.__defineSetter__("settings", function (oSettings) {
	settings = oSettings;
	self.updateContextMenu();
	localStorage.setItem("settings", JSON.stringify(oSettings));
    });
    this.__defineGetter__("proxyList", function () {
	return proxyList;
    });
    this.__defineSetter__("proxyList", function (aProxy) {
	//-- handler for property proxyList setting
	proxyList = aProxy;
	self.updateContextMenu();
	reloadTImers();
	localStorage.setItem("proxyList", JSON.stringify(
	    $.map(proxyList, function (el) {
		//-- Save to storage only proxies with temp= false
		if (el.data.type == 'auto' && el.data.pac) {
		    el.updatePAC();
		}
		if (!el.data.temp) {
		    return el;
		} else {
		    return null;
		}
	    })));
    });

    function reloadTImers() {
	console.log('reload timers');
	while (timers.length) {
	    clearInterval(timers.pop());
	} {
	    $.map(proxyList, function (proxy, i) {
		//-- Save to storage only proxies with temp= false
		if (proxy.data.type == 'auto' && proxy.data.reloadPAC && parseInt(proxy.data.reloadPACInterval)) {
		    timers.push(
			setInterval((function (i) {
			    return function () {
				proxyList[i].updatePAC();
				console.log(proxyList[i]);
				self.applys();
			    };
			})(i), proxy.data.reloadPACInterval * 60000));
		}
	    });
	}
    }
    this.__defineGetter__("state", function () {
	return state;
    });
    this.__defineSetter__("state", function (_state) {
	//-- Handler for switching between the extension state (available states is [disabled | auto | <proxy.data.id>])
	state = _state;
	reloadTImers();
	this.applys();
	self.updateContextMenu();
	localStorage.setItem("state", _state);
    });
    this.applys = function () {
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
	    for (var i = 0; i < proxyList.length; i++)
		if (proxyList[i].data.id == this.state) proxy = proxyList[i];
	    if (proxy && (proxy.data.pac.length == 0 || !proxy.data.pac)) {
		console.log("manual mode selected and proxy is " + proxy);
		chrome.browserAction.setIcon({
		    imageData: IconCreator.paintIcon(self.icon, proxy.data.color)
		});
		ProxyManager.applyProxy(ProxyManager.profileFromProxy(proxy));
	    } else {
                console.log("manual mode selected with remote PAC and proxy is " + proxy);
		chrome.browserAction.setIcon({
		    imageData: IconCreator.paintIcon(self.icon, proxy.data.color)
		});
                ProxyManager.applyAutoPac(proxy);
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
        chrome.tabs.getAllInWindow(null, function (tabs) {
            $.each(tabs, function (i, tab) {
                if (tab.url.indexOf(chrome.extension.getURL("options.html")) == 0) {
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
    
    this.updateContextMenu = function () {
        var foxyProxy = this,
            useAdvancedMenus = foxyProxy.settings.useAdvancedMenus;

        chrome.contextMenus.removeAll();
        
        if (this.settings.showContextMenu && this.getFoxyProxyEdition() != 'Basic') {
            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("mode_patterns_label"),
                type: "checkbox",
                onclick: function () {
                    self.state = 'auto';
                },
                checked: ('auto' == self.state)
            });
            
            if (useAdvancedMenus) { // create sub-menu options for each proxy
                $.each(this.proxyList, function (i, proxy) {
                    chrome.contextMenus.create({
                        title: proxy.data.name,
                        id: proxy.data.id
                    });
                    
                    chrome.contextMenus.create({
                        title: chrome.i18n.getMessage("enabled"),
                        parentId: proxy.data.id,
                        type: "checkbox",
                        checked: (proxy.data.enabled),
                        onclick: function() {
                            proxy.data.enabled = !proxy.data.enabled;
                            self.applys();
                        }
                    });
                    
                    chrome.contextMenus.create({
                        title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                        type: "checkbox",
                        onclick: function () {
                            self.state = proxy.data.id;
                        },
                        checked: (proxy.data.id == self.state),
                        parentId: proxy.data.id
                    });
                    
                    if (proxy.data.id != "default" && proxy.data.patterns && proxy.data.patterns.length > 0) {
                        chrome.contextMenus.create({
                            title: chrome.i18n.getMessage("patterns"),
                            id: "patterns" + proxy.data.id,
                            parentId: proxy.data.id
                        });
                    
                        $.each(proxy.data.patterns, function(px, pattern) {
                            chrome.contextMenus.create({
                                title: pattern.data.url,
                                parentId: "patterns" + proxy.data.id,
                                type: "checkbox",
                                checked: (pattern.data.enabled),
                                onclick: function() {
                                    pattern.data.enabled = !pattern.data.enabled;
                                    self.applys();
                                }
                            });
                        });
                    }

                });

            } else { // simple menus
                $.each(this.proxyList, function (i, proxy) {
                    if (proxy.data.enabled) {
                        chrome.contextMenus.create({
                            title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                            type: "checkbox",
                            onclick: function () {
                                self.state = proxy.data.id;
                            },
                            checked: (proxy.data.id == state)
                        });
                    }
                });

            }
            
            // common menu options (simple and advanced)
            // everybody gets disable entry
            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("mode_disabled_label"),
                type: "checkbox",
                onclick: function () {
                    self.state = 'disabled';
                },
                checked: ('disabled' == state)
            });
            
            chrome.contextMenus.create({
                 type: "separator"
             });
            
            if (useAdvancedMenus) { // make sure 'more' comes last for advanced menus

                 chrome.contextMenus.create({
                     title: chrome.i18n.getMessage("more"),
                     id: "context-menu-more"
                 });

                 chrome.contextMenus.create({
                     title: chrome.i18n.getMessage("global_settings"),
                     id: "context-menu-global-settings",
                     parentId: "context-menu-more",
                     type: "normal"
                 });
            }
            
            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("options"),
                parentId: useAdvancedMenus ? "context-menu-more" : null,
                onclick: function () {
                    self.options("tabProxies");
                }
            });
            
            if (this.settings.enabledQA && this.state != 'disabled') {
                chrome.contextMenus.create({
                    title: chrome.i18n.getMessage("QuickAdd"),
                    parentId: useAdvancedMenus ? "context-menu-more" : null,
                    onclick: function (info, tab) {
                        self.options("addpattern#" + tab.url);
                    }
                });
            }
            
            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("show_context_menu"),
                type: "checkbox",
                checked: settings.showContextMenu,
                parentId: useAdvancedMenus ? "context-menu-global-settings" : null,
                onclick: function() {
                    foxyProxy.toggleShowContextMenu();
                }

            });
            
            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("use_advanced_menus"),
                type: "checkbox",
                checked: useAdvancedMenus,
                parentId: useAdvancedMenus ? "context-menu-global-settings" : null,
                onclick: function() {
                    foxyProxy.toggleAdvancedMenus();
                }

            });

         }

    };
    
    this.toggleAdvancedMenus = function toggleAdvancedMenus() {
        
        settings.useAdvancedMenus = !settings.useAdvancedMenus;
        foxyProxy.updateContextMenu();
        
        if (self.optionsTabId) {
            chrome.tabs.sendMessage(self.optionsTabId, { setting: "useAdvancedMenus" });
        }
    };
    
    this.toggleShowContextMenu = function toggleShowContextMenu() {
        settings.showContextMenu = !settings.showContextMenu;
        foxyProxy.updateContextMenu();
        
        if (self.optionsTabId) {
            chrome.tabs.sendMessage(self.optionsTabId, { setting: "showContextMenu" });
        }
    };

    
    self.icon = $('#image')[0];
    self.currentIcon = $("#customImage")[0];
    var animationFrames = 36,
	animationSpeed = 10,
	canvas = document.getElementById('canvas'),
	canvasContext = canvas.getContext('2d'),
	rotation = 0,
	animating = false;
    this.animateFlip = function (bInAction) {
	if (rotation == 0 || bInAction) {
	    rotation += 1 / animationFrames;
	    self.drawIconAtRotation();
	    if (rotation <= 1) {
		setTimeout(function () {
		    self.animateFlip(1);
		}, animationSpeed);
	    } else {
		rotation = 0;
		self.drawIconAtRotation();
		animating = false;
	    }
	}
    };
    this.drawIconAtRotation = function () {
	function ease(x) {
	    return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
	}
	canvasContext.save();
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	canvasContext.translate(
	    Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
	canvasContext.rotate(2 * Math.PI * ease(rotation));
	canvasContext.drawImage(self.currentIcon, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
	canvasContext.restore();
	chrome.browserAction.setIcon({
	    imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
	});
    };
    this.animateBlink = function (count, bInAction) {
	if (!animating || bInAction) {
	    animating = true;
	    if (count % 2 == 0) {
		chrome.browserAction.setIcon({
		    path: 'images/logo.png'
		});
	    } else {
		chrome.browserAction.setIcon({
		    imageData: self.currentImageData
		});
	    }
	    if (count) {
		setTimeout(function () {
		    self.animateBlink(count - 1, 1);
		}, 500);
	    } else {
		animating = false;
	    }
	}
    };
    chrome.extension.onRequest.addListener(function (request, sender, callback) {

	var tab = sender.tab;
	if (state == 'disabled') return;

	if (request.action == 'addpattern') {
            if (self.settings.enabledQA) {
	      self.options('addpattern#' + request.url);
            }
	} 
        else if (request.action == 'proxylist') {
	    self.options('tabProxies');
	} 
        else if (request.action == 'log') {

	    self.getProxyForUrl(request.url, function (url, proxy, pattern) {

		console.log(proxy, IconCreator.paintIcon(self.icon, proxy.data.color));
		if (proxy) {
		    self.currentImageData = IconCreator.paintIcon(self.icon, proxy.data.color);
		    chrome.browserAction.setIcon({
			imageData: self.currentImageData
		    });
		    self.log.addLog(url, proxy, pattern);
		    if (self.state == 'auto') {
			self.animateBlink(6);
		    } else {
			self.animateFlip();
		    }
		} else {
		    self.currentIcon = self.icon;
		    chrome.browserAction.setIcon({
			path: 'images/logo.png'
		    });
		}
	    });
	}
    });
    self.settingsToXml = function () {
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
    }
    self.saveToFile = function (content) {
	//plugin.saveToFile(content);
    }

    function updateLocalIps() {
	/*if (!plugin.updateLocalIps) {
	 self.localIps = [];
	 return;
	 }
	 plugin.updateLocalIps();
	 self.localIps = eval(plugin.localIps);*/
    }
    /*self.updateLocalIps = updateLocalIps;
     updateLocalIps();*/
}
