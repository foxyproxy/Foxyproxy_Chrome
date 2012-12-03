var settings = chrome.extension.getBackgroundPage().foxyProxy.settings;
function saveSettings(){
    chrome.extension.getBackgroundPage().foxyProxy.settings = settings;
}


function genPattern(url, strTemplate, caseSensitive) {
    
    var flags = caseSensitive ? "gi" : "g";
    var parsedUrl = parseUri(url);
    parsedUrl.hostport = parsedUrl.domain ? parsedUrl.domain + (parsedUrl.port ? ":"+parsedUrl.port: "") : "";
    parsedUrl.prePath = (parsedUrl.protocol?parsedUrl.protocol+"://":"")+ parsedUrl.authority;
    var ret = strTemplate.replace("${0}", parsedUrl.protocol?parsedUrl.protocol:"", flags);    
    ret = ret.replace("${1}", parsedUrl.user ? parsedUrl.user : "", flags);    
    ret = ret.replace("${2}", parsedUrl.password ? parsedUrl.password : "", flags); 
    ret = ret.replace("${3}", parsedUrl.userInfo ? parsedUrl.userInfo + "@" : "", flags); 
    ret = ret.replace("${4}", parsedUrl.domain ? parsedUrl.domain : "", flags); 
    ret = ret.replace("${5}", parsedUrl.port ? parsedUrl.port : "", flags); 
    ret = ret.replace("${6}", parsedUrl.hostport ? parsedUrl.hostport : "", flags); 
    ret = ret.replace("${7}", parsedUrl.prePath ? parsedUrl.prePath : "", flags);                 
    ret = ret.replace("${8}", parsedUrl.directory ? parsedUrl.directory : "", flags); 
    ret = ret.replace("${9}", parsedUrl.file ? parsedUrl.file : "", flags); 
    ret = ret.replace("${10}", parsedUrl.file ? parsedUrl.file : "", flags); 
    ret = ret.replace("${11}", parsedUrl.file ? parsedUrl.file : "", flags); 
    ret = ret.replace("${12}", parsedUrl.path ? parsedUrl.path : "", flags); 
    ret = ret.replace("${13}", parsedUrl.anchor ? parsedUrl.anchor : "", flags);      
    ret = ret.replace("${14}", parsedUrl.query?parsedUrl.query:"", flags);       
    ret = ret.replace("${15}", parsedUrl.source?parsedUrl.source:"", flags);

    return ret;
}

function onTabShow(tabName) {
    console.log("tagName is", tabName);
    var proxyModeCombo = $('#proxyModeGlobal');
    proxyModeCombo.empty();
    $('<option value="auto">Use proxies based on their pre-defined patterns and priorities</option>').appendTo(proxyModeCombo);
    $.each(list, function(i, proxy){
	if(proxy.data.enabled){
	    var option = $("<option value='"+proxy.data.id+"'>"+localize("Use proxy") +" \"" + proxy.data.name + "\" "+localize("for all URLs")+"</option>")
		    .appendTo(proxyModeCombo);
	}
    });
    $('<option value="disabled">Disable FoxyProxy</option>').appendTo(proxyModeCombo);
    $("option[value='"+chrome.extension.getBackgroundPage().foxyProxy.state+"']",proxyModeCombo).attr("selected", "selected");
    
    switch(tabName)	{
    case 'pageQuick':
	
	$("#enabledQA").setChecked(settings.enabledQA);
	$("#patternTemporaryQA").setChecked(settings.patternTemporaryQA);
	if(settings.enabledQA)
	    $('#QASettingsContainer *').each(function(){ $(this).prop('disabled', false); });
	else
	    $('#QASettingsContainer *').each(function(){  $(this).attr('disabled','disabled'); });
	$("#patternTemplateQA").val(settings.patternTemplateQA);
	$("#patternUrlQA").val("http://fred:secret@mail.foo.com:8080/inbox/msg102.htm#subject?style=elegant").change();
	$("#patternNameQA").val(settings.patternNameQA);
	$("#patternProxyQA *").remove();
	$.each(list, function(i, proxy){
	    if(!proxy.data.readonly)
	    {
		$("#patternProxyQA").append( $('<option value="'+i+'">'+proxy.data.name+'</option>'));
	    }
	});
	
	$("#patternProxyQA option[value='"+settings.patternProxyQA+"']").attr("selected", "selected");
	$("#patternProxyQA").change();
	
	$("input[name='patternWhitelistQA'][value='"+settings.patternWhitelistQA+"']").setChecked(true);
	$("input[name='patternTypeQA'][value='"+settings.patternTypeQA+"']").setChecked(true);
	break;
    }
}

$(document).ready(function() {


    $("#settingsContextmenu").setChecked(settings.showContextMenu).click(function(){
	settings.showContextMenu = $(this).is(":checked");
	chrome.extension.getBackgroundPage().foxyProxy.settings = settings;
    });
    

    
    $("#enabledQA").click(function(){
	if(list.length<=1) {
            alert("You must have entered at least one proxy in order to use QuickAdd");
	    return false;
        }

	settings.enabledQA = $(this).is(":checked");
	
	chrome.extension.getBackgroundPage().foxyProxy.settings = settings;
	if(settings.enabledQA)
	    $('#QASettingsContainer *').each(function(){ $(this).prop('disabled', false); });
	else
	    $('#QASettingsContainer *').each(function(){  $(this).attr('disabled','disabled'); });
    });

    $("#patternTemporaryQA").click(function(){
	settings.patternTemporaryQA = $(this).is(":checked");
	chrome.extension.getBackgroundPage().foxyProxy.settings = settings;
    });
    $("#patternTemplateQA").keyup(function(){
	settings.patternTemplateQA=$(this).val();
	saveSettings();
	$("#patternResultQA").val(genPattern($("#patternUrlQA").val(),settings.patternTemplateQA));
    });

    
    $("#patternUrlQA").change(function(){
	$("#patternResultQA").val(genPattern($(this).val(),settings.patternTemplateQA));
    });
    $("#patternNameQA").change(function(){
	settings.patternNameQA=$(this).val();
	chrome.extension.getBackgroundPage().foxyProxy.settings = settings;
    });
    
    $("input[name='patternWhitelistQA']").click(function(){
	settings.patternWhitelistQA = $(this).val();
	chrome.extension.getBackgroundPage().foxyProxy.settings = settings;
    });
    $("input[name='patternTypeQA']").click(function(){
	settings.patternTypeQA = $(this).val();
	chrome.extension.getBackgroundPage().foxyProxy.settings = settings;
    });
    
    $("#patternProxyQA, #dialogPatternProxyQA").change(function(){
	settings.patternProxyQA = $(this).val();
	chrome.extension.getBackgroundPage().foxyProxy.settings = settings;
    });



    $("#proxyTypeDirect").click(function(){
	if($(this).is(":checked")) {
	    $(".proxyTypeManualGroup *").attr('disabled','disabled');
	    $(".proxyTypeAutoGroup *").attr('disabled','disabled');
	    $("#proxyDNS").attr('disabled','disabled');
	}
    });
    $("#proxyTypeManual").click(function(){
	if($(this).is(":checked")) {
	    $(".proxyTypeManualGroup *").prop('disabled', false);
	    $(".proxyTypeAutoGroup *").attr('disabled','disabled');
	    $("#proxyDNS").prop('disabled', false);
	}
    });
    $("#proxyTypeAuto").click(function(){
	if($(this).is(":checked")) {
	    $(".proxyTypeManualGroup *").attr('disabled','disabled');
	    $(".proxyTypeAutoGroup *").prop('disabled', false);
	    $("#proxyDNS").prop('disabled', false);
	}
    });
    
    
    $(document.body).keydown(function (e) {
	//console.log(e);
	var dialogs = $('.ui-dialog:visible');
	var tables;
	if(dialogs.size()>0)
	{
	    tables = $('.dataTables_wrapper > table',dialogs).filter(':visible');
	}
	else
	{
	    tables = $('.dataTables_wrapper > table').filter(':visible');
	}
	
	var activeTable = tables;
	if (e.keyCode == 38) {
	    var s = activeTable.find("tbody tr.selected_row");
	    s.toggleClass("selected_row");
	    if(s.length && !s.is(":first-child"))
		s.prev().toggleClass("selected_row").click();
	    else
		activeTable.find("tbody tr:last").toggleClass("selected_row").click();
	}
	if (e.keyCode == 40) {
	    var s = activeTable.find("tbody tr.selected_row");
	    s.toggleClass("selected_row");
	    if(s.length && !s.is(":last-child"))
		s.next().toggleClass("selected_row").click();
	    else
		activeTable.find("tbody tr:first").toggleClass("selected_row").click();
	}
    });
    
    $("#proxyModeGlobal").change(function () {
	var newState = $("option:selected",this).val();
	chrome.extension.getBackgroundPage().foxyProxy.state = newState;
    });
    
    onTabShow('');
});

function exportConfig()
{
    var settingsString = chrome.extension.getBackgroundPage().foxyProxy.settingsToXml();
    chrome.extension.getBackgroundPage().foxyProxy.saveToFile(settingsString);	
}