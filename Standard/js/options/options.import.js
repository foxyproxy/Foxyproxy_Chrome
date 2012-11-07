// see: http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-support
// and: http://www.html5rocks.com/en/tutorials/file/xhr2/

var checkBoolean = function (str) {
    if (str == "true") {
        return true;
    }
    
    return false;

}

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

                var proxies = xmlDoc.getElementsByTagName("proxies")[0].getElementsByTagName("proxy");

                var addProxies = function () {
                    var proxy, elem;
                    var i = 0;
                    for (; i < proxies.length; i++) {
                        /* rebuild a proxy from xml element */
                        proxy = new Proxy();

                        proxy.data.type = proxies[i].getAttribute("mode");
                        proxy.data.name = proxies[i].getAttribute("name");
                        proxy.data.notes = proxies[i].getAttribute("notes");

                        if (proxy.data.name != 'Default') {
                            console.log("adding", proxy.data.name);
                            proxy.data.enabled = checkBoolean(proxies[i].getAttribute("enabled"));
                            proxy.data.cycle = checkBoolean(proxies[i].getAttribute("includeInCycle"));
                            proxy.data.useDns = checkBoolean(proxies[i].getAttribute("proxyDNS"));

                            if (proxies[i].getElementsByTagName('manualconf')[0] != undefined) {
                                elem = proxies[i].getElementsByTagName('manualconf')[0];
                                proxy.data.isSocks = checkBoolean(elem.getAttribute("isSocks"));
                                proxy.data.socks = elem.getAttribute("socksversion");
                                proxy.data.host = elem.getAttribute("host");
                                proxy.data.port = elem.getAttribute("port");
                            } else {
                                proxy.data.isSocks = false;
                                proxy.data.socks = 5;
                            }
                            
                            proxy.data.notifOnLoad = true;
                            proxy.data.notifOnError = true;

                            if (proxies[i].getElementsByTagName('autconf')[0] != undefined) {
                                elem = proxy.data.getElementsByTagName('autoconf')[0];
                                proxy.data.reloadPAC = checkBoolean(elem.getAttribute('autoReload'));
                                proxy.data.configUrl = elem.getAttribute("url");
                            } else {
                                proxy.data.reloadPAC = false;
                            }
                            list.splice(0, 0, proxy);
                        }
                    }

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

                console.log("List of existing proxies, count", list);
                $("#import-result").text(localize("Your FoxyProxy Settings file has been imported successfully."));
            } catch (e) {
                $("#import-result").text(localize("An error occurred. The file you have chosen may not contain valid FoxyProxy settings. Please try to use a different file."));
            }
      };      
        reader.readAsText(file);
    };
};