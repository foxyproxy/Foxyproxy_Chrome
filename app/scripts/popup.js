
var options = function (data){
    chrome.extension.getBackgroundPage().foxyProxy.options(data);
    
};

var toggleRadioButton = function (id){
    $("li").removeClass("navbar-checked");
    $("#state-"+id).addClass("navbar-checked");
    chrome.extension.getBackgroundPage().foxyProxy.state = id;
    window.close();
};


$(document).ready(function(){

    $("#navbar").on("click", "li", function (e) {
        e.preventDefault();

        var elemId = $(this).attr("id");

        switch (elemId) {
            case "state-auto":
            toggleRadioButton('auto');
            break;
            
            case "state-disabled":
            toggleRadioButton('disabled');
            break;
            
            case "quickAdd":
            chrome.extension.getBackgroundPage().getCurrentTabUrl(
                function (url) { options('addpattern#' + url); }
            );
            break;
            
            case "tabProxies":
            options('tabProxies');
            break;
        }

    });

    $("a").each(function(){
    if(this.childNodes.length == 0 || (this.childNodes.length == 1 && this.childNodes[0].nodeName == "#text")){
        this.innerText = chrome.i18n.getMessage(this.innerText);
    }
    });

    var list = chrome.extension.getBackgroundPage().foxyProxy.proxyList;
    console.log(list);

    $.each(list, function(i, proxy){
        var a;
    console.log(proxy.data.type);
    if(proxy.data.enabled){

        a = $("<a href='#'/>").text(chrome.i18n.getMessage("Use_proxy") +" \"" + proxy.data.name + "\" "+chrome.i18n.getMessage("for_all_URLs")).css({
        "color": proxy.data.color
        });

    $("<li />").attr("id", "state-"+proxy.data.id).attr("proxyid", proxy.data.id).append(a).click(function(){
        toggleRadioButton($(this).attr("proxyid"));
        }).insertBefore("li#state-disabled");


    }
    });

    $("#state-" + chrome.extension.getBackgroundPage().foxyProxy.state).addClass("navbar-checked");

    if(!chrome.extension.getBackgroundPage().foxyProxy.settings.enabledQA || chrome.extension.getBackgroundPage().foxyProxy.state=='disabled')
    $('#quickAdd').hide();
});
