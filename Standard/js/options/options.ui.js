if(typeof console == 'undefined'){
    window.console = {
	log: function(txt){ 
	    //alert(txt);
	}
    };
}

var localize = function (txt){
    if(!window.locale){
	window.locale = JSON.parse(localStorage.getItem('en-en'));
    }
    if(txt && window.locale[txt]){
	return window.locale[txt];
    } else {
	return txt;
    }
};

var simple_tooltip = function (target_items, name){

    $(target_items).each(function(i){

	var div = $("<div/>").attr({"class": name, "id": name + i});
	var p = $("<p/>").text(localize($(this).attr('id')));
	div.append(p);

	$("body").append(div);

	var my_tooltip = $("#"+name+i);
	

	$(this).removeAttr("title").mouseover(function(){
	    my_tooltip.show();
	}).mousemove(function(kmouse){
	    my_tooltip.css({left:kmouse.pageX+15, top:kmouse.pageY+15});
	}).mouseout(function(){
	    my_tooltip.hide();
	});

    });
};

$(document).ready(function(){
    
    /* listen for all button clicks and load
       the appropriate function accordingly */
    $("body").on("click", "button", function (e) {

        var buttonId = $(this).attr("id");
        
        switch (buttonId) {

        /* Proxy List panel */    
        case "proxylistMoveUp":
            moveSelectedProxyUp();
            break;

        case "proxylistMoveDown":
            moveSelectedProxyDown();
            break;
         
        case "addNewProxy":
            addNewProxy();
            break;
	    
        case "proxylistEdit":
            editProxy();
            break;
            
        case "proxylistCopy":
            copySelectedProxy();
            break;
            
        case "proxylistDelete":
            deleteSelectedProxy();
            break;

        /* global settings */
	case "btnExport":
	    exportConfig();
	    break;

	/* log */
        case "logClear":
            logClear();
            break;

        case "logRefresh":
            logRefresh();
            break;

        case "logOpen":
            logOpen();
            break;
            
        case "logCopy":
            logCopy();
            break;
            
        case "logDelete":
            logDelete();
            break;

        case "logSaveToFile":
            logSaveToFile();
            break;
            
        case "logPatternsForSelected":
            logPatternsForSelected();
            break;
            
        case "logPatternsForAll":
            logPatternsForAll();
            break;
            
	case "pacViewButton":
	    openPackViewDlg();
	    break;
	    
	case "testPac":
	    testPac();
	    break;

	/* patterns */
	case "addNewPattern":
	    addNewPattern();
	    break;
	    
	case "editPattern":
	    editPattern();
	    break;
	    
	case "copySelectedPattern":
	    copySelectedPattern();
	    break;

	case "deleteSelectedPattern":
	    deleteSelectedPattern();
	    break;
	
        }
        
    });

    

    $('#proxyHost').keyup(function(){
	var str = $(this).val();
	str = str.replace(/\s/g,'');
	$(this).val(str);
    });

    /**
     * If the user enters the port as part of the hostname, parse it and put it into the port field automatically.
     * Thanks, Sebastian Lisken <Sebastian dot Lisken at gmx dot net>
     */
    $('#proxyHost').change(function() {
	var portInput = document.getElementById("proxyPort");
	this.value = this.value.replace(/^\s*(.*?)\s*$/, "$1");
	var match = this.value.match(/^(.*?)(?:\s*:\s*|\s+)([0-9]+)$/);
	if (match) {
	    var port = match[2] - 0;
	    if (port < 0x10000) {
		this.value = match[1];
		portInput.value = port;
	    }
	}
    });

    $("#proxyPort").keypress(function(event){
	var newVal = $(this).val()+String.fromCharCode(event.which);
	if((newVal>65535) || (newVal==='0'))event.preventDefault();
	if(event.shiftKey)event.preventDefault();
    });



    $("#logSize").keypress(function(event){
	if(event.shiftKey)event.preventDefault();
    });
    $("#proxyPort").numeric();
    $("#logSize").numeric();
    $("#proxyPACInterval").numeric();

    $("span, th, a, button, h1").each(function(){
	if(this.childNodes.length == 0 || (this.childNodes.length == 1 && this.childNodes[0].nodeName == "#text")){
	    this.innerText = localize(this.innerText);
	}	
    });
    initProxyList();
    
    
    console.log('ready');

    $(".navbar-item:not(diabled='true')").click(function(){
	$(".navbar-item").removeClass("navbar-item-selected");
	var tab = $(this);
	$(".tabPage").hide();
	tab.addClass("navbar-item-selected");
	var tabId = $(document.getElementById(tab.attr("pagename"))).show().attr('id');
	onTabShow(tabId);
    });
    
    

    
    if(window.location.hash){
	console.log(window.location.hash);
	if (window.location.hash.indexOf("#tab") == 0){
	    $(window.location.hash).click();
	} else if(window.location.hash.indexOf("#quickadd#") == 0){
	    $("#tabtabProxies").click();
	    proxySelection(unescape(window.location.hash.replace("#quickadd#", "")));
	} else if(window.location.hash.indexOf("#addpattern#") == 0){
	    addPattern(unescape(window.location.hash.replace("#addpattern#", "")));
	}
    }
    
    var id = chrome.i18n.getMessage("@@extension_id");
    chrome.management.get(id, function(info)
			  {
			      $('#appString').text(info.name+" "+info.version);
			  });
    
    
    simple_tooltip(".help","tooltip");
    
});

