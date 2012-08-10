function addPattern(param){
	if(!settings.enabledQA || !list[settings.patternProxyQA])
	{
		
		settings.enabledQA = false;
		alert(localize('QuickAdd disabled'));
		return;
	}
	$(".modeAdd").hide();
	$(".modeQuickAdd").show();
	
	$("#patternPageUrl").val(param).change(function(e)
		{
			$("#patternUrl").val(genPattern(e.target.value,settings.patternTemplateQA));
		}).change();
	

	$("#patternEditDlg").dialog({
		title: localize("FoxyProxy"),
		width: "500px",
		modal: true,
		buttons:[
			{
				text: localize("OK"),
				click: function() { 
					selectedProxy = settings.patternProxyQA;
					var exists = false;
					var url = $("#patternUrl").val();
					$.each(list[selectedProxy].data.patterns, function(i, pattern){ if(pattern.data.url == url)exists=true;})
					if(!exists)
					{
						list[selectedProxy].data.patterns.push(new ProxyPattern());
						selectedPattern = list[selectedProxy].data.patterns.length-1;
						list[selectedProxy].data.patterns[selectedPattern].data.enabled = true;
						list[selectedProxy].data.patterns[selectedPattern].data.temp = settings.patternTemporaryQA;
						list[selectedProxy].data.patterns[selectedPattern].data.name = settings.patternNameQA;
						list[selectedProxy].data.patterns[selectedPattern].data.url = url;
						list[selectedProxy].data.patterns[selectedPattern].data.whitelist = settings.patternWhitelistQA;
						list[selectedProxy].data.patterns[selectedPattern].data.type = settings.patternTypeQA;
						
						saveProxies();
					}
					$(this).dialog("close"); 
				}
				
			},
			{
				text: localize("Cancel"),
				click: function(){ $(this).dialog("close");}
			}
		]
	}).parent().find(".ui-dialog-buttonset").css({
		"width":"100%",
		"text-align": "right"
	});
}