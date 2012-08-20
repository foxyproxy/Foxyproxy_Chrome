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

/*             // Will need to remove and reintroduce columns when functionality is working.
	     {"sTitle": localize( "Auto PAC URL")},
	     {"sTitle": localize( "Proxy DNS")}
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

function updateProxyTable(selected){
    oTable.fnClearTable();
    if(list && list.length)
	oTable.fnAddData(list);
    if(typeof selected != 'undefined')
	oTable.fnSelectRow(selected);
    toggleselectedProxy();
}

function deleteSelectedProxy(){
    selectedProxy = oTable.fnGetSelectedPosition();
    /*if(!list[selectedProxy].data.readonly){
     list.splice(selectedProxy, 1);
     saveProxies();
     updateProxyTable();
     if(list.length<=1)
     {
     chrome.extension.getBackgroundPage().foxyProxy.settings.enabledQA=false;
     }
     }*/
    deleteProxy(selectedProxy);
}

function deleteProxy(index)
{
    if(!list[index].data.readonly){
	list.splice(index, 1);
	saveProxies();
	updateProxyTable();
	if(list.length<=1)
	{
	    chrome.extension.getBackgroundPage().foxyProxy.settings.enabledQA=false;
	}
    }		
}

function copySelectedProxy(){
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


