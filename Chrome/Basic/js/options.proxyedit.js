var oPatternTable = null;
var sProxyColor = null;
var selectedPattern = -1;

(function($)  {
   $.fn.extend({
      setChecked : function(state)  {
		if (state)
			return this.filter(":radio, :checkbox").attr("checked", true);
		else 
			return this.filter(":radio, :checkbox").removeAttr("checked");
      }
   });
   
}(jQuery));

	function proxyLoad(proxy, edit){
		
		console.log(proxy.data);
		
		$("input[name='proxyType'][value='"+proxy.data.type+"']").setChecked(true).click();
		
		$("#proxyHost").val(proxy.data.host);
		$("#proxyPort").val(proxy.data.port);
		$("#proxyIsSocks").setChecked(proxy.data.isSocks);
		$("input[name='proxySocks'][value='"+proxy.data.socks+"']").setChecked(true);
		

		
		$("#proxyEnabled").setChecked(proxy.data.enabled).attr('disabled', proxy.data.readonly ? 'disabled': '');
		$("#proxyName").val(proxy.data.name).attr('disabled', proxy.data.readonly ? 'disabled': '');
		$("#proxyNotes").val(proxy.data.notes).attr('disabled', proxy.data.readonly ? 'disabled': '');
		$("#proxyCycle").setChecked(proxy.data.cycle);//.attr('disabled', proxy.data.readonly);
		$("#proxyDNS").setChecked(proxy.data.useDns);//.attr('disabled', proxy.data.readonly);		
		$("#proxyConfigUrl").val(proxy.data.configUrl).attr('disabled', proxy.data.readonly ? 'disabled': '');
		$("#proxyNotifLoad").setChecked(proxy.data.notifOnLoad).attr('disabled', proxy.data.readonly ? 'disabled': '');
		$("#proxyNotifError").setChecked(proxy.data.notifOnError).attr('disabled', proxy.data.readonly ? 'disabled': '');
		$("#proxyPACReload").setChecked(proxy.data.reloadPAC).attr('disabled', proxy.data.readonly ? 'disabled': '');
		$("#proxyPACInterval").val(proxy.data.reloadPACInterval).attr('disabled', proxy.data.readonly ? 'disabled': '');
		$("#proxyPatterns * input[type='button']");//.button("option", "disabled", proxy.data.readonly);
		$("#configUrlPanel input[type='button']");//.button("option", "disabled", proxy.data.readonly);
		$("#proxyLogin").val(list[selectedProxy].data.login);
		$("#proxyPass").val(list[selectedProxy].data.pass);
		
		$("input[name='proxyType']:checked").click();
		
		sProxyColor = proxy.data.color;
		$('#proxyColor').ColorPickerSetColor(sProxyColor);//.attr('disabled', proxy.data.readonly ? 'disabled': '');
		$('#proxyColor div').css('backgroundColor',sProxyColor);
		oPatternTable.fnClearTable();
		if(proxy.data.patterns && proxy.data.patterns.length)
			oPatternTable.fnAddData(proxy.data.patterns);
		if(proxy.data.readonly && $("#tabs").tabs('option', 'selected')==2){
			$("#tabs").tabs( "select" , 1 );
		}
		$("#proxyPatternsLink").css("display", proxy.data.readonly?"none":"block");
		
		$("#proxyEditDlg").dialog({
			title: localize("FoxyProxy - Proxy settings"),
			modal: true,
			width:"700px",
	//		height: 460,
			resizable: false,
			buttons: [
				{
					text: localize("Save"),
					click: function(){
						if($("input[name='proxyType']:checked").val() == 'manual' && ($("#proxyHost").val()=='' || $("#proxyPort").val()=='')){
							alert(localize("Hostname/IP address and port must be specified"));
							return;
						}
						if($("input[name='proxyType']:checked").val() == 'auto' && !RegExp('^\\d*$').test($("#proxyPACInterval").val())){
							alert(localize("Interval should be integer"));
							return;
						}
						if($("input[name='proxyType']:checked").val()=="auto")
						{
							var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
							if(!regexp.test($("#proxyConfigUrl").val()))
							{
								alert(localize("Proxy config URL is not valid"));
								return;
							}
								
						}
						
						{
							
							if($("#proxyName").val() == ''){
								var mode = $("input[name='proxyType']:checked").val();
								if(mode == 'manual')
									$("#proxyName").val($("#proxyHost").val() +":"+$("#proxyPort").val())
								else
								{
									
									var index = 0;
									var found = true;
									while(found)
									{
										index++;
										var name = "New Proxy";
										if(index>1)name+=" ("+index+")";
										found = false;
										for(i in list)
										{
											if(list[i].data.name == name)
											{
												found = true;
												break;												
											}
										}
										if(!found)$("#proxyName").val(name);
										
									}
								}
							}
							list[selectedProxy].data.enabled = $("#proxyEnabled").is(":checked");
							list[selectedProxy].data.cycle = $("#proxyCycle").is(":checked");
							list[selectedProxy].data.useDns = $("#proxyDNS").is(":checked");
							list[selectedProxy].data.isSocks = $("#proxyIsSocks").is(":checked");
							list[selectedProxy].data.notifOnLoad = $("#proxyNotifLoad").is(":checked");
							list[selectedProxy].data.notifOnError = $("#proxyNotifError").is(":checked");
							list[selectedProxy].data.reloadPAC = $("#proxyPACReload").is(":checked");
							list[selectedProxy].data.name = $("#proxyName").val();
							list[selectedProxy].data.notes = $("#proxyNotes").val();
							list[selectedProxy].data.type = $("input[name='proxyType']:checked").val();
							list[selectedProxy].data.socks = $("input[name='proxySocks']:checked").val();
							list[selectedProxy].data.host = $("#proxyHost").val();
							list[selectedProxy].data.port = $("#proxyPort").val();
							list[selectedProxy].data.configUrl = $("#proxyConfigUrl").val();
							list[selectedProxy].data.reloadPACInterval = $("#proxyPACInterval").val();
							list[selectedProxy].data.color = sProxyColor;
							
							if($("input[name='proxyType']:checked").val()=="auto")
							{
								list[selectedProxy].updatePAC();
							}
							
							updateProxyTable();
							//oTable.fnSelectRow(selectedProxy);
							saveProxies();

							$( this ).dialog( "close" );
						}
					}
				},{
					text: localize("Cancel"),
					click: function(){
						if(!edit)
							deleteProxy(selectedProxy)
						else
							updateProxyTable();
						
						$( this ).dialog( "close" );
					}
				}
			]
		});
	}
	
	$(document).ready(function(){
		$("#tabs").tabs({ selected:1});
		$("input[type='button']").button();
		oPatternTable = $("#patternList").dataTable( {
				"bPaginate": false,
				"bLengthChange": false,
				"bFilter": false,
				"bSort": false,
				"bInfo": false,
				"bAutoWidth": false,
				"bUseRendered": false,
				"aaData": [],
				"oLanguage": {
					"sZeroRecords": ""
				},
				"aoColumns": [
					{ "sTitle": localize("Enabled"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='css/images/bullet_tick.png'>":"";}},
					{ "sTitle": localize("Pattern Name")},
					{ "sTitle": localize("URL pattern")},
					{ "sTitle": localize("Pattern Type")},
					{ "sTitle": localize("Whitelist (Inclusive) or Blacklist (Exclusive)")},
					//{ "sTitle": localize("Case sensitive"},
					{ "sTitle": localize("Temporary"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='css/images/bullet_tick.png'>":"";}}
				]
			} );
			$("#patternList tbody tr").live('click', function () {
					oPatternTable.fnSelect(this);
			} );
			$('#proxyColor').ColorPicker({
				color: "#000",
				onShow: function (colpkr) {
					$(colpkr).fadeIn(500);
					return false;
				},
				onHide: function (colpkr) {
					$(colpkr).fadeOut(500);
					return false;
				},
				onChange: function (hsb, hex, rgb) {
					sProxyColor = '#' + hex;
					$('#proxyColor div').css('backgroundColor',sProxyColor);
				}
			}).children("div").css({'background-color':'#000'});			
	});
	
	function addNewPattern(){
		list[selectedProxy].data.patterns.push(new ProxyPattern());
		selectedPattern = list[selectedProxy].data.patterns.length-1;
		patternLoad(list[selectedProxy].data.patterns[selectedPattern]);
	}
	
	function editPattern(){
		selectedPattern = oPatternTable.fnGetSelectedPosition();
		patternLoad(list[selectedProxy].data.patterns[selectedPattern], true);
	}
	
		function updatePatternTable(selected){
			oPatternTable.fnClearTable();
			if(list[selectedProxy].data.patterns && list[selectedProxy].data.patterns.length)
				oPatternTable.fnAddData(list[selectedProxy].data.patterns);
			if(typeof selected != 'undefined')
				oPatternTable.fnSelectRow(selected);		
		}
		
		function deleteSelectedPattern(){
			selectedPattern = oPatternTable.fnGetSelectedPosition();
			if(selectedPattern === null)return;
			list[selectedProxy].data.patterns.splice(selectedPattern, 1);
			updatePatternTable();
		}		
		function copySelectedPattern(){
			console.log(selectedPattern);
			selectedPattern = oPatternTable.fnGetSelectedPosition();
			console.log(selectedPattern)
			if(typeof selectedPattern=='number' && selectedPattern>=0){
				list[selectedProxy].data.patterns.splice(selectedPattern, 0, new ProxyPattern(list[selectedProxy].data.patterns[selectedPattern]));
				updatePatternTable(selectedPattern);
			}
		}
		
		function openPacViewDlg(){
			console.log($("#proxyConfigUrl").val());
			if($("#proxyConfigUrl").val()){
					$.ajax({
						url: $("#proxyConfigUrl").val(),
						xhr:  function(){ 
							if(XMLHttpRequest){
								return new XMLHttpRequest();
							} else {
								return null;
							}
						},
						success: function(data){
								console.log(data)
							$("#pacViewDlgText").val(data);
							$("#pacViewDlg").dialog({
										width: '520px',
										title: localize("FoxyProxy - PAC View"),
										modal: true
							});
						}
					});
			}
		}
		
		function testPac()
		{

			if($("#proxyConfigUrl").val()){
				$.ajax({
					url: $("#proxyConfigUrl").val(),
					xhr:  function(){ 
							if(XMLHttpRequest){
								return new XMLHttpRequest();
							} else {
								return null;
							}
					},
					success: function(data){
						console.log(data);
							var worker = new Worker("js/testpac.js");
							var timer = setTimeout(function(){
									worker.terminate();
									alert(localize("PAC execution timeout."));
								},1000);
							worker.onmessage = function(e)
							{
								clearTimeout(timer);
								alert(localize("PAC file sucsessful loaded!"));
							}
							worker.onerror = function(e)
							{
								clearTimeout(timer);
								alert(localize("PAC file error!")+"\r\n"+e.data);
							}
							worker.postMessage(data);
						}
					});
			}
		}