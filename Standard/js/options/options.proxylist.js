var selectedProxy =  -1;
var oTable;
var list = null;
var bg = null;

function resetProxies(){
    bg = chrome.extension.getBackgroundPage();
    list = $.map(bg.foxyProxy.proxyList, function (p){ return new Proxy(p);} );
}

function saveProxies(){
    bg.foxyProxy.proxyList = list;
    bg.foxyProxy.state = bg.foxyProxy.state;
    onTabShow("");
}

resetProxies();

function initProxyList() {
    $(".listManupualtionButtons > button").css('width', '150px');
    $("button").button().css({"text-align": "left"});
    oTable = $('#proxyList').dataTable( {
	"bPaginate": false,
	"bLengthChange": false,
	"bFilter": false,
	"bSort": false,
	"bInfo": false,
	"bAutoWidth": false,
	"bUseRendered": false,
	"aaData": list,
	"oLanguage": {
	    "sZeroRecords": ""
	},
	"aoColumns": [
	    {"bVisible": false},
	    {"sTitle": localize( "Enabled"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='css/images/bullet_tick.png'>":"";}},
	    {"sTitle": localize( "Color"), "bUseRendered":false, "fnRender": function(obj) { var c = obj.aData[ obj.iDataColumn ]; return "<span class='colorbox' style='background-color: "+c+"'></span>";}},
	    
	    {"sTitle": localize( "Proxy Name") },
	    {"sTitle": localize( "Proxy Notes") },
	    {"sTitle": localize( "Host or IP Address") },
	    {"sTitle": localize( "Port")},
	    {"sTitle": localize( "SOCKS proxy?"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='css/images/bullet_tick.png'>":"";}},
	    {"sTitle": localize( "SOCKS Version")},

             // Will need to remove and reintroduce columns when functionality is working.
	     {"sTitle": localize( "Auto PAC URL")},
/*	     {"sTitle": localize( "Proxy DNS")}
*/
	]
    } );
    

    
    $("#proxyList tbody tr").live('click', function () {
	oTable.fnSelect(this);
	toggleselectedProxy();
    } ).first().click();
    $("#proxyList tbody tr").live('dblclick', function (e) {
        e.preventDefault();
        e.stopPropagation();
	oTable.fnSelect(this);
	toggleselectedProxy();
        editProxy();
        return false;
    });
}

function toggleselectedProxy(){
    selectedProxy = oTable.fnGetSelectedPosition();
    if(selectedProxy === null) {
	$("#proxylistMoveUp").button( "option", "disabled", "disabled");
	$("#proxylistMoveDown").button( "option", "disabled", "disabled");
	$("#proxylistDelete, #proxylistCopy, #proxylistEdit").button( "option", "disabled", "disabled");
    }
    else {
	$("#proxylistMoveUp").button( "option", "disabled", (selectedProxy==0) || (selectedProxy==list.length-1));
	$("#proxylistMoveDown").button( "option", "disabled",  (selectedProxy==list.length-2) || (selectedProxy==list.length-1));
	$("#proxylistDelete, #proxylistCopy").button( "option", "disabled",  (selectedProxy==list.length-1));
	$('#proxylistEdit').button( "option", "disabled", "");
    }
    

}

function addNewProxy(aUri){
    var proxy = null;
    if (aUri){
	if(aUri.domain && aUri.port){
	    proxy = new Proxy({
		host: aUri.domain,
		port: aUri.port
	    });
	} else {
	    alert(localize("host:port can not be determined from selected text"));
	    return;
	}
    } else {
	proxy = new Proxy();
    }
    list.splice(list.length-1, 0, proxy);
    selectedProxy = list.length-2;
    proxyLoad(proxy);
}

function editProxy(){
    selectedProxy = oTable.fnGetSelectedPosition();
    proxyLoad(list[selectedProxy],true);
}

function updateProxyTable(selected) {
    oTable.fnClearTable();
    if(list && list.length)
	oTable.fnAddData(list);
    if(typeof selected != 'undefined')
	oTable.fnSelectRow(selected);
    toggleselectedProxy();
}

function deleteSelectedProxy() {
    selectedProxy = oTable.fnGetSelectedPosition();
    deleteProxy(selectedProxy);
}

function deleteDefaultProxy() {
  var i;
  for (i = list.length - 1; i >= 0; i--) {
    if (list[i].data.name == "Default") {
      // deleting default proxy which is located by making a special
      // call to deleteProxy.
      deleteProxy(i, true);
    }
  }
};

function deleteProxy(index, deleteDefault) {
  deleteDefault = deleteDefault || false;
  if(!list[index].data.readonly || 
     (list[index].data.readonly && deleteDefault)) {
    list.splice(index, 1);
    saveProxies();
    updateProxyTable();
    if(list.length<=1) {
      chrome.extension.getBackgroundPage().foxyProxy.settings.enabledQA=false;
    }
  }
}

function copySelectedProxy() {
    selectedProxy = oTable.fnGetSelectedPosition();
    if(typeof selectedProxy=='number' && selectedProxy>=0 && !list[selectedProxy].data.readonly){
	list.splice(selectedProxy, 0, new Proxy(list[selectedProxy]));
	saveProxies();
	updateProxyTable(selectedProxy);
    }
}

function moveSelectedProxyUp(){
    selectedProxy = oTable.fnGetSelectedPosition();
    if(selectedProxy >0){
	var buf = list[selectedProxy-1];
	list[selectedProxy-1] = list[selectedProxy];;
	list[selectedProxy] = buf;
	saveProxies();
	updateProxyTable(selectedProxy-1);
    }
}

function moveSelectedProxyDown(){
    selectedProxy = oTable.fnGetSelectedPosition();
    if(selectedProxy < list.length-1){
	var buf = list[selectedProxy+1];
	list[selectedProxy+1] = list[selectedProxy];;
	list[selectedProxy] = buf;
	saveProxies();
	updateProxyTable(selectedProxy+1);
    }
}

/**
 * Default is always at the bottom currently, but issues can arise if
 * it is not (e.g.: if there is a bug in the code) So it is safe to
 * have a function that ensures it is at the bottom for later
 * use. Especially with import, which should place all proxies at the
 * bottom (arr[0]) and the default at the top, but this function may
 * still be useful in case of failure.
 */
var placeDefaultToBottom = function () {
  // place default at the bottom of the proxy list.
  
  var i = 0;
  var le = list.length;
  var defaultProxy;
  if (list[le-1].data.name != 'Default') {
    // default should always be at the bottom.
    for (; i < le; i++) {
      if (list[i].data.name == 'Default') {
        defaultProxy = list.splice(i, 1);
        list.push(defaultProxy.pop());
        return;
      }
    }
  }
};