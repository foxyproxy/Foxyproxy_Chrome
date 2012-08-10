function proxySelection(param){

	//function addNewProxy(aUri)
		var aUri = null;
		if (param){
			var aUri = parseUri(param);
			if(aUri.domain && aUri.port){

			} else {
				alert(localize("host:port can not be determined from selected text"));
				return;
			}
		}

	//proxySelectionDlg
	//proxySelectionUrl
	//proxySelectionTable
	$("#proxySelectionUrl").text(param);
	$.each(list, function(i, proxy){
		$("#proxySelectionTable tbody").append(
			$("<tr />").attr("proxyId", i)
				.append(
					$("<td>").html(
						(proxy.data.enabled?"<img src='css/images/bullet_tick.png'>":"")
					)
				)
				.append(
					$("<td>").html(
						"<span style='color: "+proxy.data.color+"'>"+proxy.data.color+"</span>"
					)
				)
				.append(
					$("<td>").text(
						proxy.data.name
					)
				)
				.append(
					$("<td>").text(
						proxy.data.notes
					)
				).click(function(){
					$("#proxySelectionTable tbody tr").removeClass('selected_row');
					$(this).toggleClass('selected_row')
				})
		)
	});
	$("#proxySelectionDlg").dialog({
		title: localize("FoxyProxy"),
		width: "500px",
		modal: true,
		buttons:[
			{
				text: localize("Add New Proxy"),
				click: function() { 
					addNewProxy(aUri);
					$(this).dialog("close"); 
				},
				css:{"float":"left"}
				
			},{
				text: localize("Save"),
				click: function(){
					var id = parseInt($("#proxySelectionTable tbody tr.selected_row").attr("proxyId"));
					if(id || id==0){
						if(list[id].data.name == (list[id].data.host+":"+list[id].data.port)){
							list[id].data.name = aUri.domain +":"+aUri.port;
						}
						list[id].data.host = aUri.domain;
						list[id].data.port = aUri.port;
						saveProxies();
						updateProxyTable(id);
						$(this).dialog("close");
					} else {
						alert(localize('Select proxy to update'));
					}
				}
			},{
				text: localize("Cancel"),
				click: function(){ $(this).dialog("close");}
			}
		]
	}).parent().find(".ui-dialog-buttonset").css({
		"width":"100%",
		"text-align": "right"
	});
}