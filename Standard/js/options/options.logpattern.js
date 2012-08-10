function proxySelectionPattern(forAll){

	var lines = $("#log tbody tr"+ (forAll ? "" : ".selected_row") );
	if(!lines.length)return;
	/*.each(function(tr){
		var data = oLog.fnGetData(tr);
		log.removeLog({
				timestamp: data[0],
				url: data[2]
			}, function(){
				logRefresh();
			}
		);
	});*/

	//$("#proxySelectionUrl").text(param);
	$("#patternProxyTraining").empty();
	$.each(list, function(i, proxy){
		if(proxy.data.readonly)return;
			$("<option />").val(i).text(proxy.data.name).appendTo("#patternProxyTraining");
	});
	
	$("input[name='patternWhitelistTraining'][value='Inclusive']").setChecked(true);
	$("input[name='patternTypeTraining'][value='wildcard']").setChecked(true);
	
	$('#patternNameTraining').val("Training Pattern");
	$('#patternTemplateTraining').val("*://${3}${6}/*");
	$("#trainingPatternsDlg").dialog({
		title: localize("FoxyProxy"),
		width: "500px",
		modal: true,
		buttons:[
			{
				text: localize("Add"),
				click: function(){
					var id = parseInt($("#patternProxyTraining option:selected").val());
					if(id || id==0){
						var hasDuplicates = false;
						$.each(lines, function(i, line)
						{
							var data = oLog.fnGetData(line);
							var pattern = new ProxyPattern();
							pattern.data.enabled = true;
							pattern.data.temp = $("#patternTemporaryTraining").is(":checked");
							pattern.data.name = $("#patternNameTraining").val();
							
							pattern.data.url = genPattern(data[2],$('#patternTemplateTraining').val())

							pattern.data.whitelist = $("input[name='patternWhitelistTraining']:checked").val();
							pattern.data.type = $("input[name='patternTypeTraining']:checked").val();
							

							if(patternDuplicates(list[id].data.patterns, pattern))
								hasDuplicates = true;
							else
								list[id].data.patterns.push(pattern);
						});
						
						saveProxies();
						updateProxyTable(id);
						if(hasDuplicates)alert(localize("Some or all of the patterns weren't added because they duplicate existing patterns for the specified proxy."));
						$(this).dialog("close");
					} else {
						alert(localize('Select proxy to add patternt'));
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