// see: http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-support
// and: http://www.html5rocks.com/en/tutorials/file/xhr2/

var checkBoolean = function (str, defaultNum) {
    if (str == "true") {
        return true;
    }
    
    return defaultNum;

};

var checkNumeric = function (str) {
    if ($.isNumeric(str)) {
        return str;
    }
    return 0;
};

var checkValidType = function (str) {
    if (str === "direct" ||
        str === "manual" ||
        str === "auto") {
        return str;
    }
    return "direct";
};

var importPatterns = function (xmlProxy, proxy, xmlDoc) {
    try {
        console.log("trying import patterns for", proxy.data.name);
        var xmlPatterns = xmlProxy.getElementsByTagName("matches")[0].getElementsByTagName("match");
        var i = 0, length = xmlPatterns.length, pattern;
        
        var patterns = [];

        for (; i < length; i++) {
            pattern =  new ProxyPattern();
            pattern.data.enabled = checkBoolean(xmlPatterns[i].getAttribute("enabled"), false);
            pattern.data.temp = false;
            pattern.data.name = xmlPatterns[i].getAttribute("name");
            pattern.data.url = xmlPatterns[i].getAttribute("pattern");
            console.log("isRegexp for ", pattern.data.name, "is", xmlPatterns[i].getAttribute("isRegEx"));
            pattern.data.type = (xmlPatterns[i].getAttribute("isRegEx") == "true") ? "regexp" : "wildcard";
            pattern.data.whitelist = (xmlPatterns[i].getAttribute("isBlackList") == "true") ? "Exclusive" : "Inclusive";
            patterns.push(pattern);
        }
        proxy.data.patterns = patterns;
    } catch (e) {
        // no parsable pattern... just forget about it.
        return;
    }

};

var importProxies = function (xmlDoc) {
    var proxy, elem, patterns;
    var i = 0;
    var proxies = xmlDoc.getElementsByTagName("proxies")[0].getElementsByTagName("proxy");
    
    for (; i < proxies.length; i++) {
        

        /* rebuild a proxy from xml element */
        proxy = new Proxy();

        proxy.data.type = checkValidType(proxies[i].getAttribute("mode"));
        proxy.data.name = proxies[i].getAttribute("name");
        proxy.data.notes = proxies[i].getAttribute("notes");

        if (proxy.data.name != 'Default' && proxy.data.type != 'direct') {

            proxy.data.enabled = checkBoolean(proxies[i].getAttribute("enabled"));
            proxy.data.cycle = checkBoolean(proxies[i].getAttribute("includeInCycle"));
            proxy.data.useDns = checkBoolean(proxies[i].getAttribute("proxyDNS"));
            proxy.data.color = proxies[i].getAttribute("color");
            if (proxies[i].getElementsByTagName('manualconf')[0] != undefined) {
                elem = proxies[i].getElementsByTagName('manualconf')[0];
                proxy.data.isSocks = checkBoolean(elem.getAttribute("isSocks"));
                proxy.data.socks = checkNumeric(elem.getAttribute("socksversion"), 5);
                proxy.data.host = elem.getAttribute("host");
                proxy.data.port = checkNumeric(elem.getAttribute("port"), 0);
            } else {
                proxy.data.isSocks = false;
                proxy.data.socks = 5;
            }
            
            proxy.data.notifOnLoad = true;
            proxy.data.notifOnError = true;

            if (proxies[i].getElementsByTagName('autoconf')[0] != undefined) {
                elem = proxies[i].getElementsByTagName('autoconf')[0];
                proxy.data.reloadPAC = checkBoolean(elem.getAttribute('autoReload'));
                proxy.data.configUrl = elem.getAttribute("url");
            } else {
                proxy.data.reloadPAC = false;
            }

            /* handle patterns */
            importPatterns(proxies[i], proxy, xmlDoc);

            list.splice(0, 0, proxy);
        }
    }
};



window.onload = function () {
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

    var fileInput = document.querySelector("#settings-import");
    var file;

    fileInput.onchange = function(e){
        file = e.target.files[0];
        var reader = new FileReader();      
        reader.onload = function (event) {
            try {
                var xmlDoc = $.parseXML(event.target.result);
                
                var addProxies = function () {
                    importProxies(xmlDoc);
                    updateProxyTable();
                    saveProxies();
                    
                };

                var replaceProxies = function () {
                    // remove all existing proxies!
                    var i;
                    for (i = list.length - 1; i >= 0; i--) {
                        if (list[i].data.name != "Default") {
                            deleteProxy(i);
                        }
                    }
                    updateProxyTable();
                    saveProxies();
                    addProxies();
                };


                $("#import-dialog").dialog({resizable: false,
                                    height:200,
                                    modal:true,
                                    buttons: {
                                        "Replace": function () { replaceProxies(); $(this).dialog('close'); }, 
                                        "Add": function () { replaceProxies(); $(this).dialog('close'); },
                                        "Nevermind": function () { /* Do nothing */ $(this).dialog('close'); }
                                    }
                                     
                                    });

                $("#import-result").text(localize("Your FoxyProxy Settings file has been imported successfully."));
            } catch (e) {
                $("#import-result").text(localize("An error occurred. The file you have chosen may not contain valid FoxyProxy settings. Please try to use a different file."));
            }
      };      
        reader.readAsText(file);
    };
};