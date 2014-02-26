/***** context menus *****/

/* TODO: use contextMenus.onClicked for handling clicks
function contextMenuHandler() {
    
}

chrome.contextMenus.onClicked.addListener(contextMenuHandler);
*/


foxyProxy.updateContextMenu = function () {
    console.log("updateContextMenu");
    var useAdvancedMenus = foxyProxy._settings.useAdvancedMenus;

    chrome.contextMenus.removeAll();
    
    if (foxyProxy._settings.showContextMenu && foxyProxy.getFoxyProxyEdition() != 'Basic') {
        console.log("creating context menus");
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("mode_patterns_label"),
            type: "checkbox",
            onclick: function () {
                foxyProxy.state = 'auto';
            },
            checked: ('auto' == foxyProxy.state)
        });
        
        if (useAdvancedMenus) { // create sub-menu options for each proxy
            console.log("using advanced menus...");

            foxyProxy._proxyList.forEach( function ( proxy) {
                console.log("creating menus for proxy: " + proxy.data.name);
                chrome.contextMenus.create({
                    title: proxy.data.name,
                    id: proxy.data.id
                });
                
                chrome.contextMenus.create({
                    title: chrome.i18n.getMessage("enabled"),
                    parentId: proxy.data.id,
                    type: "checkbox",
                    checked: (proxy.data.enabled),
                    onclick: function() {
                        proxy.data.enabled = !proxy.data.enabled;
                        foxyProxy.applyState();
                    }
                });
                
                chrome.contextMenus.create({
                    title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                    type: "checkbox",
                    onclick: function () {
                        foxyProxy.state = proxy.data.id;
                    },
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
                            title: pattern.data.url,
                            parentId: "patterns" + proxy.data.id,
                            type: "checkbox",
                            checked: (pattern.data.enabled),
                            onclick: function() {
                                pattern.data.enabled = !pattern.data.enabled;
                                foxyProxy.applyState();
                            }
                        });
                    });
                }
            });

        } else { // simple menus
            console.log("using simple menus");
            foxyProxy._proxyList.forEach( function ( proxy) {
                console.log("proxy: " + proxy.data.name);
                if (proxy.data.enabled) {
                    chrome.contextMenus.create({
                        title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                        type: "checkbox",
                        onclick: function () {
                            foxyProxy.state = proxy.data.id;
                        },
                        checked: (proxy.data.id == foxyProxy.state)
                    });
                }
            });

        }
        
        console.log("creating common menus");
        // common menu options (simple and advanced)
        // everybody gets disable entry
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("mode_disabled_label"),
            type: "checkbox",
            onclick: function () {
                foxyProxy.state = 'disabled';
            },
            checked: ('disabled' == foxyProxy.state)
        });
        
        chrome.contextMenus.create({
             type: "separator"
         });
        
        if (useAdvancedMenus) { // make sure 'more' comes last for advanced menus

             chrome.contextMenus.create({
                 title: chrome.i18n.getMessage("more"),
                 id: "context-menu-more"
             });

             chrome.contextMenus.create({
                 title: chrome.i18n.getMessage("global_settings"),
                 id: "context-menu-global-settings",
                 parentId: "context-menu-more",
                 type: "normal"
             });
        }
        
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("options"),
            parentId: useAdvancedMenus ? "context-menu-more" : null,
            onclick: function () {
                foxyProxy.options("tabProxies");
            }
        });
        
        if (foxyProxy._settings.enabledQA && foxyProxy.state != 'disabled') {
            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("QuickAdd"),
                parentId: useAdvancedMenus ? "context-menu-more" : null,
                onclick: function (info, tab) {
                    foxyProxy.options("addpattern#" + tab.url);
                }
            });
        }
        
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("show_context_menu"),
            type: "checkbox",
            checked: foxyProxy._settings.showContextMenu,
            parentId: useAdvancedMenus ? "context-menu-global-settings" : null,
            onclick: function() {
                foxyProxy.toggleShowContextMenu();
            }

        });
        
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("use_advanced_menus"),
            type: "checkbox",
            checked: useAdvancedMenus,
            parentId: useAdvancedMenus ? "context-menu-global-settings" : null,
            onclick: function() {
                foxyProxy.toggleAdvancedMenus();
            }

        });

     }

};

foxyProxy.updateContextMenu();