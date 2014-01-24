const SOCKS5 = "5";

// always store 'state' and 'useChromeSync' in localStorage so we don't sync unwanted data.
if (!localStorage.getItem('state')){
    localStorage.setItem('state', 'disabled');
}

var useChromeSync = localStorage.getItem("useChromeSync");
if (!useChromeSync) {
    localStorage.setItem("useChromeSync", false);
}

    
var storageAPI = useChromeSync ? chrome.storage.sync : chrome.storage.local;

if (!storageAPI.getItem('proxyList')) {
    storageAPI.setItem('proxyList', JSON.stringify([{
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
    }]));
}
if (!storageAPI.getItem('settings')){
    storageAPI.setItem('settings', JSON.stringify({
        showContextMenu: true,
        enabledQA: false,
        patternTemplateQA: "*://${3}${6}/*",
        patternNameQA: "Dynamic QuickAdd Pattern",
        patternTemporaryQA: false,
        patternWhitelistQA:"Inclusive",
        patternTypeQA:"wildcard",
        useAdvancedMenus: false,
        useChromeSync: false
    }));
}
