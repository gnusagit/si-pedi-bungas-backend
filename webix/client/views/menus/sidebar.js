import {
    JetView,
    plugins
} from "webix-jet"
import {
    dataSideMenu
} from "models/sidemenu"
export default class MenuView extends JetView {
    init(view) {
        webix.extend($$("app:menu"), webix.ProgressBar)
        webix.$$("app:menu").parse(dataSideMenu(view))
        this.use(plugins.Menu, "app:menu")
        $$("app:menu").attachEvent("onBeforeSelect", function(id) {
            if (this.getItem(id).$count) {
                return false
            }
        })
        $$("app:menu").attachEvent("onAfterSelect", function(id) {
            let online = localStorage.getItem("online")
            let menuId = localStorage.getItem("last_selected_item")
            if (online == 1) {
                if (menuId != 'changepassword') {
                    if ($$(menuId + "Data") != undefined) {
                        webix.storage.local.put(menuId + "State", $$(menuId + "Data").getState())
                    }
                }
            }
            var item = this.getItem(id)
            localStorage.setItem("last_selected_item", id)
            localStorage.setItem("online", 1)
            localStorage.setItem("mainTitle", item.value)
            localStorage.setItem("mainDetails", item.details)
            // Tabbar
            $$("tabs").addOption({
                id: item.id,
                value: `<span class='${item.icon}'></span> ${item.value}`,
                close: true
            })
            $$("tabs").setValue(item.id)
        })
    }
    config() {
        return {
            width: 232,
            view: "sidebar",
            id: "app:menu",
            activeTitle: true,
            select: true,
            scroll: true,
            tooltip: {
                template: function(obj) {
                    return obj.$count ? "" : obj.details
                }
            },
            ready: function() {
                let state = webix.storage.local.get("appMenu")
                if (state) {
                    if (state['select'].length == 0) {
                        $$("app:menu").setState(state)
                        $$("app:menu").select(localStorage.getItem("last_selected_item"))
                    } else {
                        $$("app:menu").setState(state)
                    }
                } else {
                    $$("app:menu").setState({
                        "collapsed": true,
                        "open": [],
                        "select": ["pengaturan"]
                    })
                }
            }
        }
    }
}