var foxyproxy = chrome.extension.getBackgroundPage().foxyProxy;

var options = function (data){
    foxyproxy.options(data);
    
};

var toggleRadioButton = function (id){
    $("li").removeClass("navbar-checked");
    $("#state-"+id).addClass("navbar-checked");
    foxyproxy.state = id;
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
    if(this.childNodes.length === 0 || (this.childNodes.length == 1 && this.childNodes[0].nodeName == "#text")){
        this.innerText = this.innerText; //FIXME
    }
    });
    
    if ('Basic' == foxyproxy.getFoxyProxyEdition()) {
        console.log('hiding auto mode for Basic edition');
        $("#state-auto").hide();
    }

    var list = foxyproxy.proxyList;
    console.log(list);

    $.each(list, function(i, proxy){
        var a;
    console.log(proxy.data.type);
    if(proxy.data.enabled){

        a = $("<a href='#'/>").text(chrome.i18n.getMessage("mode_custom_label", proxy.data.name)).css({
        "color": proxy.data.color
        });

    $("<li />").attr("id", "state-"+proxy.data.id).attr("proxyid", proxy.data.id).append(a).click(function(){
        toggleRadioButton($(this).attr("proxyid"));
        }).insertBefore("li#state-disabled");


    }
    });

    $("#state-" + chrome.extension.getBackgroundPage().foxyProxy.state).addClass("navbar-checked");

    if(!foxyproxy.settings.enabledQA || foxyproxy.state=='disabled' || 'Basic' == foxyproxy.getFoxyProxyEdition()) {
        $('#quickAdd').hide();
    }
});

