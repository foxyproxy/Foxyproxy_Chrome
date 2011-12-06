/*
logClear
logRefresh
logSet
logOpen
logDelete
*/

var oLog = null;

$(document).ready(function(){
	$("#logEnabled").setChecked(chrome.extension.getBackgroundPage().foxyProxy.log.enabled).click(function(){
		chrome.extension.getBackgroundPage().foxyProxy.log.enabled = $(this).is(':checked');
	});
	$("#logSize").val(chrome.extension.getBackgroundPage().foxyProxy.log.maxLength);
	$("#logSizeSet").click(function(){
		chrome.extension.getBackgroundPage().foxyProxy.log.maxLength = $("#logSize").val();
		chrome.extension.getBackgroundPage().foxyProxy.log.truncate(function(){
			logRefresh();
		});
	});	
	oLog = $("#log").dataTable({
			"bFilter": true,
			"bSort": false,
			"bInfo": false,
			"bAutoWidth": false,
			"bUseRendered": false,
			"aaData": [],
			"oLanguage": {
				"sZeroRecords": ""
			},
			"aoColumns": [
				{"sTitle": localize( "Timestamp"),"bUseRendered":false, "fnRender": function(obj) { return new Date(obj.aData[ obj.iDataColumn ]).toUTCString()}},
				{"sTitle": localize( "Color"), "bUseRendered":false, "fnRender": function(obj) { var c = obj.aData[ obj.iDataColumn ]; return "<span class='colorbox' style='background-color: "+c+"'></span>";}},
				{"sTitle": localize( "Url") },
				{"sTitle": localize( "Proxy Name") },
				{"sTitle": localize( "Proxy Notes") },
				{"sTitle": localize( "Pattern Name") },
				{"sTitle": localize( "Pattern")},
				{"bVisible": false},
				{"sTitle": localize( "Pattern Type")},
				{"sTitle": localize( "Whitelist")},
				{"sTitle": localize( "PAC")},
				{"sTitle": localize( "Error"),"bVisible": false}
			]
	}); 
	logRefresh();
	$("#log tbody tr").live('click', function (e) {
		var clickedRow = this;
		console.log(e);
		if(e.ctrlKey){
			$(this).toggleClass('selected_row');
		} else if (e.shiftKey){
			$("#log tbody tr.selected_row").toggleClass('selected_row');
			var iFlag = 0;
			$("#log tbody tr").each(function(i, tr){
				console.log($(tr).is(".first_selected_row") , tr == clickedRow);
				if($(tr).is(".first_selected_row") || tr == clickedRow){
					iFlag++;
					if($(tr).is(".first_selected_row") && tr == clickedRow)
						iFlag++;
				}
				console.log(iFlag);
				if(iFlag){
					$(tr).toggleClass('selected_row');
					if(iFlag>1)
						return false;
				}
			});
		} else {
			oLog.fnSelect(this);
		}
		console.log($("#log tbody tr.selected_row").length);
		if($("#log tbody tr.selected_row").length == 1){
			$("#log tbody tr.first_selected_row").toggleClass('first_selected_row');
			$("#log tbody tr.selected_row").toggleClass('first_selected_row');
		}
		toggleselectedLog();
	} ).first().click();
});


function toggleselectedLog(){

}

function logClear(){
	chrome.extension.getBackgroundPage().foxyProxy.log.clear(function(){
		logRefresh();
	});
	
}

function logRefresh(){
	chrome.extension.getBackgroundPage().foxyProxy.log.getLogs(function(logs){
		oLog.fnClearTable();
		oLog.fnAddData(logs);
	});
}

function logOpen(){
	var count = $("#log tbody tr.selected_row").length;
	if( (count>5 && window.confirm("Realy open "+$("#log tbody tr.selected_row").length + " new tabs?" )) || (count <=5)){
		$("#log tbody tr.selected_row").each(function(tr){
			chrome.tabs.create({
				url:oLog.fnGetData(tr)[2],
				selected: true
			});
		});
	}
}
function logDelete(){
	var log = chrome.extension.getBackgroundPage().foxyProxy.log;
	$("#log tbody tr.selected_row").each(function(tr){
		var data = oLog.fnGetData(tr);
		console.log(data);
		log.removeLog({
				timestamp: data[0],
				url: data[2]
			}, function(){
				logRefresh();
			}
		);
	});
}
