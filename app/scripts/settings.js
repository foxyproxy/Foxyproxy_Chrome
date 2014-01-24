const SOCKS4 = "4", SOCKS5 = "5";
if (!localStorage.getItem('proxyList')) {
    localStorage.setItem('proxyList', JSON.stringify([{
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
if (!localStorage.getItem('settings')){
    localStorage.setItem('settings', JSON.stringify({
    showContextMenu: true,
    enabledQA: false,
    patternTemplateQA: "*://${3}${6}/*",
    patternNameQA: "Dynamic QuickAdd Pattern",
    patternTemporaryQA: false,
    patternWhitelistQA:"Inclusive",
    patternTypeQA:"wildcard",
    useAdvancedMenus: false
    }));
}
if (!localStorage.getItem('state')){
    localStorage.setItem('state', 'disabled');
}