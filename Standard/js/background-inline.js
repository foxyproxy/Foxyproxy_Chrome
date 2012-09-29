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
	patternTypeQA:"wildcard"
    }));
}
if (!localStorage.getItem('state')){
    localStorage.setItem('state', 'disabled');
}
$(document).ready(function(){
    $.ajax({
	url: chrome.extension.getURL("locale/en-en.json"),
	complete: function(xhr, status,data){
	    console.log(xhr, status, data);
	    localStorage.setItem('en-en', xhr.responseText);
	    foxyProxy = new Extension();
	    foxyProxy.log.clear();
	    foxyProxy.state = localStorage.getItem('state');
	    
	}
    });
});
function localize(txt){
    if(!window.locale){
	window.locale = JSON.parse(localStorage.getItem('en-en'));
    }
    if(txt && window.locale && window.locale[txt]){
	return window.locale[txt];
    } else {
	return txt;
    }
}
var ProfileManager;
var foxyProxy;
function copyToClipboard(str) {
    var obj=document.getElementById("hbnaclhngkhpmpgmfakaghgjbblokeeh");
    if( obj ){
	obj.value = str;
	obj.select();
	document.execCommand("copy", false, null);
    }
}