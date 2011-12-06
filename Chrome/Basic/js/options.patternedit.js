function patternLoad(pattern, edit){
		//console.log()
		$(".modeAdd").show();
		$(".modeQuickAdd").hide();
		$("#patternEnabled").setChecked(pattern.data.enabled);
		$("#patternTemporary").setChecked(pattern.data.temp);
		$("#patternName").val(pattern.data.name);
		$("#patternUrl").val(pattern.data.url);
		$("input[name='patternWhitelist'][value='"+pattern.data.whitelist+"']").setChecked(true);
		$("input[name='patternType'][value='"+pattern.data.type+"']").setChecked(true);
		
		
		
			$("#patternEditDlg").dialog({
				title: localize("FoxyProxy - Add/Edit pattern"),
				modal: true,
				width:500,
				resizable: false,
				buttons: [{ 
					text:localize("Save"),
					click: function(){
						if($("#patternUrl").val() == ''){
							alert(localize("Pattern URL must be specified"));
						} else {
							list[selectedProxy].data.patterns[selectedPattern].data.enabled = $("#patternEnabled").is(":checked");
							list[selectedProxy].data.patterns[selectedPattern].data.temp = $("#patternTemporary").is(":checked");
							list[selectedProxy].data.patterns[selectedPattern].data.name = $("#patternName").val();
							list[selectedProxy].data.patterns[selectedPattern].data.url = $("#patternUrl").val();
							list[selectedProxy].data.patterns[selectedPattern].data.whitelist = $("input[name='patternWhitelist']:checked").val();
							list[selectedProxy].data.patterns[selectedPattern].data.type = $("input[name='patternType']:checked").val();
							updatePatternTable();
							oPatternTable.fnSelectRow(selectedPattern);
							$( this ).dialog( "close" );
						}
					}
				},{
					text: localize("Cancel"),
					click: function(){
						if(!edit)list[selectedProxy].data.patterns.splice(selectedPattern, 1);
						updatePatternTable(selectedPattern)
						$( this ).dialog( "close" );
					}
				}]
			});
	}