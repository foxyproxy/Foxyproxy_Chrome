chrome.runtime.getBackgroundPage(function( bgPage) {
    
    var foxyproxy = bgPage.foxyProxy;


    var options = function (data){
        foxyproxy.options(data);
    
    };

    var toggleRadioButton = function (id){
        $("li").removeClass("navbar-checked");
        $("#state-"+id).addClass("navbar-checked");
        foxyproxy.state = id;
        window.close();
    };

    $(document).ready(function() {

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
                chrome.tabs.getSelected(null, function(tab) {
                    options('addpattern#' + tab.url);
                });
                break;
            
                case "tabProxies":
                options('tabProxies');
                break;
            }

        });

        foxyproxy.getProxyList( function( items) {
            var list = items.proxyList;
        
            $("a").each(function(){
                if(this.childNodes.length === 0 || (this.childNodes.length == 1 && this.childNodes[0].nodeName == "#text")){
                    this.innerText = this.innerText; //FIXME
                }
            });
    
            list.forEach( function( proxy) {
                var a;
                console.log(proxy.data.type);

                if (proxy.data.enabled) {

                    a = $("<a href='#'/>").text(chrome.i18n.getMessage("mode_custom_label", proxy.data.name))
                        .css( { "color": proxy.data.color });

                    $("<li />").attr("id", "state-"+proxy.data.id)
                        .attr("proxyid", proxy.data.id)
                        .append(a)
                        .click( function() {
                                toggleRadioButton($(this).attr("proxyid"));
                        })
                        .insertBefore("li#state-disabled");
                    }
            });
    
            if ('Basic' == foxyproxy.getFoxyProxyEdition()) {
                console.log('hiding auto mode for Basic edition');
                $("#state-auto").hide();
            }

            $("#state-" + foxyproxy.state).addClass("navbar-checked");

            if (!foxyproxy._settings.enabledQA || foxyproxy.state=='disabled' || 'Basic' == foxyproxy.getFoxyProxyEdition()) {
                $('#quickAdd').hide();
            }
        });
    });
});
