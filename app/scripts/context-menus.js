/***** context menus *****/

function contextMenuHandler() {
    
}

chrome.contextMenus.onClicked.addListener(contextMenuHandler);


this.updateContextMenu = function () {
    var foxyProxy = this,
        useAdvancedMenus = foxyProxy.settings.useAdvancedMenus;

    chrome.contextMenus.removeAll();
    
    if (this.settings.showContextMenu && this.getFoxyProxyEdition() != 'Basic') {
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("mode_patterns_label"),
            type: "checkbox",
            onclick: function () {
                self.state = 'auto';
            },
            checked: ('auto' == self.state)
        });
        
        if (useAdvancedMenus) { // create sub-menu options for each proxy
            $.each(this.proxyList, function (i, proxy) {
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
                        self.applys();
                    }
                });
                
                chrome.contextMenus.create({
                    title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                    type: "checkbox",
                    onclick: function () {
                        self.state = proxy.data.id;
                    },
                    checked: (proxy.data.id == self.state),
                    parentId: proxy.data.id
                });
                
                if (proxy.data.id != "default" && proxy.data.patterns && proxy.data.patterns.length > 0) {
                    chrome.contextMenus.create({
                        title: chrome.i18n.getMessage("patterns"),
                        id: "patterns" + proxy.data.id,
                        parentId: proxy.data.id
                    });
                
                    $.each(proxy.data.patterns, function(px, pattern) {
                        chrome.contextMenus.create({
                            title: pattern.data.url,
                            parentId: "patterns" + proxy.data.id,
                            type: "checkbox",
                            checked: (pattern.data.enabled),
                            onclick: function() {
                                pattern.data.enabled = !pattern.data.enabled;
                                self.applys();
                            }
                        });
                    });
                }

            });

        } else { // simple menus
            $.each(this.proxyList, function (i, proxy) {
                if (proxy.data.enabled) {
                    chrome.contextMenus.create({
                        title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                        type: "checkbox",
                        onclick: function () {
                            self.state = proxy.data.id;
                        },
                        checked: (proxy.data.id == state)
                    });
                }
            });

        }
        
        // common menu options (simple and advanced)
        // everybody gets disable entry
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("mode_disabled_label"),
            type: "checkbox",
            onclick: function () {
                self.state = 'disabled';
            },
            checked: ('disabled' == state)
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
                self.options("tabProxies");
            }
        });
        
        if (this.settings.enabledQA && this.state != 'disabled') {
            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("QuickAdd"),
                parentId: useAdvancedMenus ? "context-menu-more" : null,
                onclick: function (info, tab) {
                    self.options("addpattern#" + tab.url);
                }
            });
        }
        
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("show_context_menu"),
            type: "checkbox",
            checked: settings.showContextMenu,
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