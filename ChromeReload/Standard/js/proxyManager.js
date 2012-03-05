var ProxyManager = {
	autoPacScriptPath: null,
	socksPacScriptPath: null,
	ProxyModes: {
		direct: "direct",
		manual: "fixed_servers",
		auto: "pac_script"
	}
};
ProxyManager.directConnectionProfile = {
	id: "direct",
	name: "[proxy_directConnection]",
	proxyMode: ProxyManager.ProxyModes.direct,
	color: "inactive"
};
ProxyManager.profileFromProxy = function (a) {
	var b = a.data.host + ":" + a.data.port;
	return {
		proxyMode: a.data.type,
		proxyHttp: a.data.isSocks ? null : b,
		proxyHost: a.data.host,
		proxyPort: a.data.port,
		proxySocks: a.data.isSocks ? b : "",
		socksVersion: a.data.socks,
		proxyConfigUrl: a.data.configUrl,
		proxyExceptions: "",
		useSameProxy: a.data.isSocks ? null : !0
	}
};
ProxyManager.profileAuto = function () {
	return {
		proxyMode: ProxyManager.ProxyModes.auto,
		proxyHttp: "",
		proxySocks: "",
		socksVersion: "",
		proxyConfigUrl: "",
		proxyExceptions: "",
		useSameProxy: !1,
		isAutomaticModeProfile: !0
	}
};
ProxyManager.apply = function (a) {
	if (a.isAutomaticModeProfile) { // profileAuto - Detect proxy used by filter - pac_script
		ProxyConfig.pacScript.data = ProxyManager.generatePacAutoScript();
		ProxyConfig.mode = a.proxyMode;
		chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
		return;
	} else if (a.proxyMode == ProxyManager.ProxyModes.manual && a.proxySocks.trim().length > 0) { // profileFromProxy & directConnectionProfile(?)
		ProxyConfig.rule.singleProxy.host = a.proxyHost;
		ProxyConfig.rule.singleProxy.port = a.proxyPort;
		ProxyConfig.mode = a.proxyMode;
		chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
		return;
	} else { // profileFromProxy
		//var url = a.proxyConfigUrl + "?" + (new Date).getTime();
		//b.setProxy(a.proxyMode, a.proxyHttp, a.proxyExceptions, (a.proxyMode == 'auto_detect') ? url : "", "");
		ProxyConfig.mode = a.proxyMode;
		ProxyConfig.rules.singleProxy.host = proxy.data.host;
		ProxyConfig.rules.singleProxy.port = proxy.data.port;
		chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
		console.log(ProxyConfig);
	}
};
ProxyManager.generateSocksPacScript = function (a) {
	var b = [];
	b.push("function regExpMatch(url, pattern) {");
	b.push("\ttry { return new RegExp(pattern).test(url); } catch(ex) { return false; }");
	b.push("}\r\n");
	b.push("function FindProxyForURL(url, host) {");
	b.push('return "SOCKS' + (a.socksVersion == "5" ? "5 " : " ") + a.proxySocks + '"');
	b.push("}");
	return b.join("\r\n")
};
ProxyManager.generatePacAutoScript = function () {
	var a = [],
		b = foxyProxy.proxyList;
	a.push("function regExpMatch(url, pattern) {");
	a.push("\ttry { return new RegExp(pattern).test(url); } catch(ex) { return false; }");
	a.push("}\r\n");
	a.push("function FindProxyForURL(url, host) {");
	for (var c = 0; c < b.length; c++) {
		a.push(ProxyManager.proxyToScript(b[c]))
	}
	a.push("}");
	return a.join("\r\n")
};
ProxyManager.proxyToScript = function (proxy) {
	var c = "";
	switch (proxy.data.type) {
	case "direct":
		proxyStr = '"DIRECT"';
		break;
	case "manual":
		proxyStr = '"' + (proxy.data.isSocks ? "SOCKS " : "PROXY ") + proxy.data.host + ":" + proxy.data.port + '"';
		break;
	case "auto":
		c += " function getProxy(url, host){ " + proxy.data.pac + " return FindProxyForURL(url, host); }", proxyStr = "getProxy(url, host)"
	}
	if (proxy.data.id == "default") {
		c += "return " + proxyStr + ";";
		return c;
	}
	c += "\nvar blacklisted = false;\n";
	c += "\nipMatched = false;\nvar matched = false;\n";
	var b = proxy.data.ipPatterns;
	for (a = 0; a < b.length; a++) {
		if (b[a].data.enabled) {
			for (i in foxyProxy.localIps) {
				var d = b[a].data.url || "",
					f = b[a].data.type == "wildcard",
					e = b[a].data.whitelist != "Inclusive";
				f && (d.substr(0, 1) != "*" && (d = "*" + d), d.substr(d.length - 1, 1) != "*" && (d += "*"));
				var g = f ? "shExpMatch" : "regExpMatch";
				c += "if ( !blacklisted && (" + g + "('" + foxyProxy.localIps[i] + "', '" + d + "')";
				if (f && (d.indexOf("://*.") > 0 || d.indexOf("*.") == 0)) {
					c += " || shExpMatch(url, '" + d.replace("*.", "*") + "')"
				}
				c += (e ? ")) blacklisted = true;" : ")) matched = true;") + "\n";
			}
		}
	}
	var b = proxy.data.patterns;
	for (a = 0; a < b.length; a++) {
		if (b[a].data.enabled) {
			var d = b[a].data.url || "",
				f = b[a].data.type == "wildcard",
				e = b[a].data.whitelist != "Inclusive";
			f && (d.substr(0, 1) != "*" && (d = "*" + d), d.substr(d.length - 1, 1) != "*" && (d += "*"));
			var g = f ? "shExpMatch" : "regExpMatch";
			c += "if ( !blacklisted && (" + g + "(url, '" + d + "')";
			if (f && (d.indexOf("://*.") > 0 || d.indexOf("*.") == 0)) {
				c += " || shExpMatch(url, '" + d.replace("*.", "*") + "')"
			}
			c += (e ? ")) blacklisted = true;" : ")) matched = true;") + "\n";
		}
	}
	c += "if( !blacklisted && matched )  return " + proxyStr + ";\n";
	return c
};
ProxyManager.getPatternForUrl = function (a) {
	var b = {
		proxy: null,
		pattern: null
	};
	$.each(foxyProxy.proxyList, function (c, proxy) {
		proxy.data.enabled && $.each(proxy.data.patterns, function (c, e) {
			if (e.data.enabled && e.test(a)) {
				if (e.data.whitelist != 'Inclusive') {
					b.proxy = null;
					b.pattern = null;
					return false;
				}
				b.proxy = proxy;
				b.pattern = e;
			}
			return true;
		});
		return b.proxy == null
	});
	if (b.proxy == null) {
		b.proxy = foxyProxy.proxyList[foxyProxy.proxyList.length - 1]
	}
	return b
};