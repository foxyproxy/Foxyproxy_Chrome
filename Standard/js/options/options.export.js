var generateXMLForPatterns = function (xmlDoc, patternsList) {
    var j = 0, patternLen, curPattern, curPatternNode, matches, match;
    console.log("generateXMLForPatterns called");
    if (patternsList) {
        matches = xmlDoc.createElement("matches");

        for (j = 0, patternLen = patternsList.length; j < patternLen; j++) {
            curPattern = patternsList[j].data;
            match = xmlDoc.createElement("match");
            match.setAttribute("enabled", curPattern.enabled);
            match.setAttribute("name", curPattern.name);

            if (curPattern.type != "wildcard") {
                match.setAttribute("isRegex", true);
                match.setAttribute("pattern", curPattern.regex);
            } else {
                match.setAttribute("isRegex", false);
                match.setAttribute("pattern", curPattern.url);
            }

            match.setAttribute("reload", true);
            match.setAttribute("autoReload", false);

            if (curPattern.whitelist == "Inclusive") {
                match.setAttribute("isBlacklist", false);
            } else {
                match.setAttribute("isBlacklist", true);
            }

            match.setAttribute("isMultiline", false);
            match.setAttribute("fromSubscription", false);
            match.setAttribute("caseSensitive", false);

            matches.appendChild(match);
        }

        return matches;

    }

    return null;

};

var generateXMLFromStorage = function () {
    var xmlDoc = document.implementation.createDocument(null, null, null);
    var foxyproxy = xmlDoc.createElement("foxyproxy");

    var proxies = xmlDoc.createElement("proxies");

    var proxyList = JSON.parse(localStorage.getItem("proxyList")),
        len = proxyList.length, i = 0, curProxy, curProxyNode, 
        attr, manualconf, patterns, patternsNode;
    
    for (; i < len; i++) {
        curProxy = proxyList[i].data;

        if (curProxy.id == 'default') {
            continue;
        }

        curProxyNode = xmlDoc.createElement("proxy");
        
        curProxyNode.setAttribute('name', curProxy.name);
        curProxyNode.setAttribute('id', curProxy.id);
        curProxyNode.setAttribute('enabled', curProxy.enabled);
        curProxyNode.setAttribute('color', curProxy.color);
        curProxyNode.setAttribute('isSocks', curProxy.isSocks);
        curProxyNode.setAttribute("mode", curProxy.type);

        if (curProxy.type == "manual") {
            manualconf = xmlDoc.createElement("manualconf");
            manualconf.setAttribute("host", curProxy.host);
            manualconf.setAttribute("port", curProxy.port);
            curProxyNode.appendChild(manualconf);
        }


        console.log(curProxy.patterns);
        if (curProxy.patterns) {
            patternsNode = generateXMLForPatterns(xmlDoc, curProxy.patterns);
            if (patternsNode) {
                curProxyNode.appendChild(patternsNode);
            }
        }
        

        proxies.appendChild(curProxyNode);
        
    }
    
    xmlDoc.appendChild(foxyproxy);
    foxyproxy.appendChild(proxies);
    
    console.log(xmlDoc);
};

var exportAndDownload = function() {
    var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?><foxyproxy><\/foxyproxy>']);
    var evt = document.createEvent("HTMLEvents");
    /*
    evt.initEvent("click");
    $("<a>", {
        download: "FoxyProxy-export.fpx",
        href: webkitURL.createObjectURL(blob)
    }).get(0).dispatchEvent(evt);
     */
    generateXMLFromStorage();
};

$(document).ready(function (e) {

    var $button = $("#export-to-file");
    $button.click(function (e) {
        exportAndDownload();
    });

}); 
