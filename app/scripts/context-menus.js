/***** context menus *****/

// TODO: use contextMenus.onClicked for handling clicks
function contextMenuHandler( info, tab) {
    var id = info.menuItemId;
    console.log("contextMenu onClick handler: "+ id);
    
    switch(id) {
        case "mode_patterns_label":
            //TODO
            break;
        case "mode_custom_label":
            //TODO
            break;
        case "mode_disabled_label":
            foxyProxy.state = "disabled";
            break;
        case "context-menu-options":
            foxyProxy.options("tabProxies");
            break;
        case "context-menu-quick-add":
            foxyProxy.options("addpattern#" + tab.url);
            break;
        case "show_context_menu":
            foxyProxy.toggleShowContextMenu();
            break;
        case "use_advanced_menus":
            foxyProxy.toggleAdvancedMenus();
            break;
        default:
            //TODO: handle proxies and patterns clicks
    }
}

chrome.contextMenus.onClicked.addListener(contextMenuHandler);



foxyProxy.updateContextMenu = function () {
    console.log("updateContextMenu");
    var useAdvancedMenus = foxyProxy._settings.useAdvancedMenus;

    chrome.contextMenus.removeAll();
    
    if (foxyProxy._settings.showContextMenu && foxyProxy.getFoxyProxyEdition() != 'Basic') {
        console.log("creating context menus");
        chrome.contextMenus.create({
            id: "mode_patterns_label",
            title: chrome.i18n.getMessage("mode_patterns_label"),
            type: "checkbox",
            // onclick: function () {
            //     foxyProxy.state = 'auto';
            // },
            checked: ('auto' == foxyProxy.state)
        });
        
        if (useAdvancedMenus) { // create sub-menu options for each proxy
            if (foxyProxy._proxyList && foxyProxy._proxyList.length) {
                foxyProxy._proxyList.forEach( function ( proxy) {
                    chrome.contextMenus.create({
                        title: proxy.data.name,
                        id: proxy.data.id
                    });

                    chrome.contextMenus.create({
                        id: "enabled_" + proxy.data.id,
                        title: chrome.i18n.getMessage("enabled"),
                        parentId: proxy.data.id,
                        type: "checkbox",
                        checked: (proxy.data.enabled)//,
                        // onclick: function() {
                        //     proxy.data.enabled = !proxy.data.enabled;
                        //     foxyProxy.applyState();
                        // }
                    });

                    chrome.contextMenus.create({
                        id: "mode_custom_label",
                        title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                        type: "checkbox",
                        // onclick: function () {
                        //     foxyProxy.state = proxy.data.id;
                        // },
                        checked: (proxy.data.id == foxyProxy.state),
                        parentId: proxy.data.id
                    });

                    if (proxy.data.id != "default" && proxy.data.patterns && proxy.data.patterns.length > 0) {
                        chrome.contextMenus.create({
                            title: chrome.i18n.getMessage("patterns"),
                            id: "patterns" + proxy.data.id,
                            parentId: proxy.data.id
                        });
                        proxy.data.patterns.forEach( function( pattern) { 
                            chrome.contextMenus.create({
                                id: "proxy_" + proxy.data.id + "_pattern_" + pattern.data.url,
                                title: pattern.data.url,
                                parentId: "patterns" + proxy.data.id,
                                type: "checkbox",
                                checked: (pattern.data.enabled)//,
                                // onclick: function() {
                                //     pattern.data.enabled = !pattern.data.enabled;
                                //     foxyProxy.applyState();
                                // }
                            });
                        });
                    }
                });
            }
        } else { // simple menus
            console.log("using simple menus");
            if (foxyProxy._proxyList && foxyProxy._proxyList.length) {            
                foxyProxy._proxyList.forEach( function ( proxy) {
                    console.log("proxy: " + proxy.data.name);
                    if (proxy.data.enabled) {
                        chrome.contextMenus.create({
                            id: "mode_custom_label",
                            title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                            type: "checkbox",
                            // onclick: function () {
                            //     foxyProxy.state = proxy.data.id;
                            // },
                            checked: (proxy.data.id == foxyProxy.state)
                        });
                    }
                });
            }
        }
        
        console.log("creating common menus");
        // common menu options (simple and advanced)
        // everybody gets disable entry
        chrome.contextMenus.create({
            id: "mode_disabled_label",
            title: chrome.i18n.getMessage("mode_disabled_label"),
            type: "checkbox",
            // onclick: function () {
            //     foxyProxy.state = 'disabled';
            // },
            checked: ('disabled' == foxyProxy.state)
        });
        
        chrome.contextMenus.create({
             type: "separator"
         });
        
        if (useAdvancedMenus) { // make sure 'more' comes last for advanced menus

             chrome.contextMenus.create({
                 id: "context-menu-more",
                 title: chrome.i18n.getMessage("more")
             });

             chrome.contextMenus.create({
                 id: "context-menu-global-settings",                 
                 title: chrome.i18n.getMessage("global_settings"),
                 parentId: "context-menu-more",
                 type: "normal"
             });
        }
        
        chrome.contextMenus.create({
            id: "context-menu-options",
            title: chrome.i18n.getMessage("options"),
            parentId: useAdvancedMenus ? "context-menu-more" : null//,
            // onclick: function () {
            //     foxyProxy.options("tabProxies");
            // }
        });
        
        if (foxyProxy._settings.enabledQA && foxyProxy.state != 'disabled') {
            chrome.contextMenus.create({
                id: "context-menu-quick-add",
                title: chrome.i18n.getMessage("QuickAdd"),
                parentId: useAdvancedMenus ? "context-menu-more" : null,
                // onclick: function (info, tab) {
                //     foxyProxy.options("addpattern#" + tab.url);
                // }
            });
        }
        
        chrome.contextMenus.create({
            id: "show_context_menu",
            title: chrome.i18n.getMessage("show_context_menu"),
            type: "checkbox",
            checked: foxyProxy._settings.showContextMenu,
            parentId: useAdvancedMenus ? "context-menu-global-settings" : null//,
            // onclick: function() {
            //     foxyProxy.toggleShowContextMenu();
            // }

        });
        
        chrome.contextMenus.create({
            id: "use_advanced_menus",
            title: chrome.i18n.getMessage("use_advanced_menus"),
            type: "checkbox",
            checked: useAdvancedMenus,
            parentId: useAdvancedMenus ? "context-menu-global-settings" : null//,
            // onclick: function() {
            //     foxyProxy.toggleAdvancedMenus();
            // }

        });

     }

};

// initialize context menus
chrome.runtime.getBackgroundPage(function( bgPage) {
    bgPage.foxyProxy.updateContextMenu();
});