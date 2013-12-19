const afterInstallUrl = "http://getfoxyproxy.org/chrome/standard/install.html";

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

    function checkFirst() {
	if (!localStorage.getItem("installedtime")) {
	    localStorage.setItem("installedtime", (new Date()).toString());
	    var id = chrome.i18n.getMessage("@@extension_id");
	    chrome.management.getAll(function (a) {
		for (var i = 0; i < a.length; i++)
		    if (a[i].id === id) localStorage.setItem("version", a[i].version);
	    });
	    chrome.tabs.create({
		url: afterInstallUrl,
		selected: true
	    });
	    return true;
	}
	return false;
    }

    function checkVersion() {
	var id = chrome.i18n.getMessage("@@extension_id");
	var version = "";
	chrome.management.getAll(function (a) {
	    for (var i = 0; i < a.length; i++)
		if (a[i].id === id) {
		    version = localStorage.getItem("version") || a[i].version;
		    /*if(version !== a[i].version)
		     chrome.tabs.create({url: afterUpdateUrl, selected: true });*/
		    version = a[i].version;
		    localStorage.setItem("version", version);
		}
	});
    }
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
		    chrome.tabs.update(tab.id, {
			url: chrome.extension.getURL("options.html") + "#" + data,
			selected: true
		    });
		}
	    });
	    if (!bOptionsPageFound) {
		chrome.tabs.create({
		    url: chrome.extension.getURL("options.html") + "#" + data,
		    selected: true
		});
	    }
	});
    };
    this.updateContextMenu = function () {
	chrome.contextMenus.removeAll();
	if (this.settings.showContextMenu) {
	    chrome.contextMenus.create({
		title: chrome.i18n.getMessage("mode_patterns_label"),
		type: "radio",
		onclick: function () {
		    self.state = 'auto';
		},
		checked: ('auto' == state)
	    });
	    $.each(this.proxyList, function (i, proxy) {
		if (proxy.data.enabled) {
		    chrome.contextMenus.create({
			title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
			type: "radio",
			onclick: function () {
			    self.state = proxy.data.id;
			},
			checked: (proxy.data.id == state)
		    });
		}
	    });
	    chrome.contextMenus.create({
		title: chrome.i18n.getMessage("mode_disabled_label"),
		type: "radio",
		onclick: function () {
		    self.state = 'disabled';
		},
		checked: ('disabled' == state)
	    });
	    chrome.contextMenus.create({
		type: "separator"
	    });
	    chrome.contextMenus.create({
		title: chrome.i18n.getMessage("options"),
		onclick: function () {
		    self.options("tabProxies");
		}
	    });
	    if (this.settings.enabledQA && this.state != 'disabled') {
		chrome.contextMenus.create({
		    title: chrome.i18n.getMessage("QuickAdd"),
		    onclick: function (info, tab) {
			self.options("addpattern#" + tab.url);
		    }
		});
	    }
	    /*
	     chrome.contextMenus.create({
	     title: chrome.i18n.getMessage("Proxy_List"),
	     onclick: function(){ self.options("tabProxies");}
	     });
	     */
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
    checkFirst() || checkVersion();
}
