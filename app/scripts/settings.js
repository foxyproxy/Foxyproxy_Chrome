const SOCKS5 = "5";

// always store 'state' and 'useChromeSync' in localStorage so we don't sync unwanted data.
if (!localStorage.getItem('state')) {
    localStorage.setItem('state', 'disabled');
}

var useSyncStorage = localStorage.getItem("useSyncStorage");
if (!useSyncStorage) {
    localStorage.setItem("useSyncStorage", false);
    useSyncStorage = false;
}

//TODO: make this togglable in settings    
var storageApi = useSyncStorage ? chrome.storage.sync : chrome.storage.local;

//// migration code - move old settings from localStorage?
var localSettings = localStorage.getItem("settings");
if (localSettings) {
    console.log("migrating settings from localStorage");
    var settings = JSON.parse(localSettings);
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
    var proxyList = $.map(JSON.parse(localProxyList), function (p) {
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


/////

function updateSettings( message, sender, sendResponse ) {
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
            sendResponse(items);
        } );
    } else {
        storageApi.set(saveObj, function() {
            //TODO: handle errors
            sendResponse(saveObj);
        });
    }
    
}

console.log("registering settings message listener...");
chrome.runtime.onMessage.addListener( updateSettings);
