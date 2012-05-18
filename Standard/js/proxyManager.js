var ProxyManager = {
	autoPacScriptPath: null,
	socksPacScriptPath: null,
	ProxyModes: {
		direct: "direct",
		manual: "manual",
		auto: "auto"
	}
};
ProxyManager.directConnectionProfile = {
	id: "direct",
	name: "[proxy_directConnection]",
	proxyMode: ProxyManager.ProxyModes.direct,
	color: "inactive"
};

/**
 * Converts the "data" property of a Proxy object (as defined in background.html; elements of |proxyList|) to a "profile" object.
 * Not sure why we can't just use |proxyList| elements instead or |ProxyConfig| class directly.
 */
ProxyManager.profileFromProxy = function (a) {
	var b = a.data.host + ":" + a.data.port;
	return {
    // TODO: Use the |ProxyConfig| class directly. For now, see top of background.html for object model.
		proxyMode: a.data.type,
		proxyHttp: a.data.isSocks ? null : b,
		proxyHost: a.data.host,
		proxyPort: a.data.port,
		proxySocks: a.data.isSocks ? b : null,
		socksVersion: a.data.socks,
		proxyConfigUrl: a.data.configUrl
	}
};
ProxyManager.profileAuto = function () {
	return {
		proxyMode: ProxyManager.ProxyModes.auto,
		proxyHttp: "",
		proxySocks: "",
		socksVersion: "",
		proxyConfigUrl: ""
	}
};

/**
 * We're being disabled. TODO: shouldn't we use the "clear" value/setting instead of setting to system settings?
 */
ProxyManager.applyDisable = function (a) {
	ProxyConfig.mode = "system";
	chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
	console.log("Proxy is disabled: applyDisable");
	console.log(ProxyConfig);
};

/**
 * Patterns mode being set. TODO: change this from "auto" to "patterns".
 */
ProxyManager.applyAuto = function (a) {
	ProxyConfig.pacScript.url = "";
	ProxyConfig.pacScript.data = ProxyManager.generatePacAutoScript();
  // debug: dump the pac
console.log("pac is " + ProxyConfig.pacScript.data);
	ProxyConfig.mode = "pac_script";
	console.log(ProxyConfig);
	chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
	console.log("Proxy is auto: applyAuto");
};

/**
 * "Use proxy for all URLs" being set. It can be configured as PAC, a fixed server (http/socks)
 * or direct. TODO: add system and WPAD as options.
 */
ProxyManager.applyProxy = function (a) {
	console.log(a);
	if (a.proxyMode == ProxyManager.ProxyModes.auto) { // Auto = Pac Script URL
		ProxyConfig.mode = "pac_script";
		ProxyConfig.data = "";
		ProxyConfig.pacScript = a.proxyConfigUrl;
		console.log(ProxyConfig);
		chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
		console.log("Proxy is auto: applyProxy");
	} else if (a.proxyMode == ProxyManager.ProxyModes.manual) { // Manually set URL/HOST
		ProxyConfig.mode = "fixed_servers";
    if (a.proxySocks) {
      console.log("setting to SOCKS version " + a.socksVersion);
  		ProxyConfig.rules.singleProxy.scheme = "socks" + a.socksVersion;
    }
    else  {
      console.log("setting to HTTP(S)");
  		ProxyConfig.rules.singleProxy.scheme = "http";
    }
		ProxyConfig.rules.singleProxy.host = a.proxyHost;
		ProxyConfig.rules.singleProxy.port = parseInt(a.proxyPort);
    // WHY DOES THIS THROW AN EXCEPTION? ProxyConfig.rules.fallbackProxy = ProxyConfig.rules.singleProxy; // fallbackProxy is the same
		console.log(ProxyConfig);
		chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
		console.log("Proxy is manual: applyProxy");
	} else if (a.proxyMode == ProxyManager.ProxyModes.direct) { // profileFromProxy
		ProxyConfig.mode = "direct";
		console.log(ProxyConfig);
		chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
		console.log("Proxy is direct: applyProxy");
	} else {
		console.log("Proxy is ... something else! INVALID STATE");
	}
};

/*
13 May 2012 EHJ: does not appear to be used. Remove completely if confirmed

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
*/

/**
 * Used for "patterns" (a.k.a "auto") mode since chrome does not natively
 * support switching by URL like Gecko.
 */
ProxyManager.generatePacAutoScript = function () {
	var a = [],
		b = foxyProxy.proxyList;
	a.push("function FindProxyForURL(url, host) {");
	for (var c = 0, sz=b.length; c < sz; c++) {
		a.push(ProxyManager.proxyToScript(b[c]))
	}
	a.push("}");
	return a.join("\r\n");
};

ProxyManager.template = "\
\
var patterns = [{patterns}], white = -1;\n\
for (var i=0, sz=patterns.length; i<sz; i++) {\n\
    // ProxyPattern instances\n\
    var p = patterns[i];\n\
    if (p.enabled) {\n\
      if (p.url.regex.test(url)) {\n\
        if (p.whitelist == \"Inclusive\") {\n\
          // Black takes priority over white -- skip this pattern\n\
          continue;\n\
        }\n\
        else if (white == -1) {\n\
          white = i; // store first matched index and continue checking for blacklist matches!\n\
        }\n\
      }\n\
    }\n\
  }\n\
  if (white != -1) return /*this.matches[white]*/ {proxyStr};\n\
}";

ProxyManager.proxyToScript = function (proxy) {
	var c = "", proxyStr;
	switch (proxy.data.type) {
	  case "direct":
		  proxyStr = '"DIRECT"';
		  break;
	  case "manual":
		  proxyStr = '"' + (proxy.data.isSocks ? "SOCKS " : "PROXY ") + proxy.data.host + ":" + proxy.data.port + '"';
		  break;
	  case "auto": // PAC
      // 13 May 2012 EHJ: does this work? Check the generated script for accuracy then change code and remove this comment so we don't keep checking.
		  c += " function getProxy(url, host){ " + proxy.data.pac + " return FindProxyForURL(url, host); }", proxyStr = "getProxy(url, host)"
	}
	if (proxy.data.id == "default") {
		c += "return " + proxyStr + ";";
		return c;
	}

  // Non-default proxies
  c += ProxyManager.template.replace("{patterns}|{proxyStr}", function(s) {
      switch(s) {
        case "{patterns}":
          for (var k=0, ret="", sz=proxy.patterns.length; k<sz; k++) {
            ret += proxy.patterns[k].data.toSource();
            if (k+1<sz) ret += ", ";
          }
          return ret;
        case "{proxyStr}":
          return proxyStr;
      }
  });

  // TODO: handle IP patterns
  return c;
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
