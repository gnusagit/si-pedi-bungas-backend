import {
    JetView
} from "webix-jet"
import profile from "views/menus/profile"
import menu from "views/menus/sidebar"
export default class AppView extends JetView {
    config() {
        return layout
    }
    init() {
        this.ui(profile)
        webix.attachEvent("onBeforeAjax", function(mode, url, data, request, headers, files, promise) {
            headers["token-id"] = webix.storage.cookie.get('tokenID')
        });
    }
    ready() {
        let api = this.app.config.api
        webix.ajax().get(`${api}/auth/getuser`).then(data => {
            let user = data.json()
            webix.storage.local.put("currentActPerm", user['permissionAct'])
            let where = {};
            where["5f321b49b53fc4001193e386"] = user.user.idAkses;
            where["5f321b64b53fc4001193e387"] = user.user.idAkses;
            where["5f3611edd5495600116cfcce"] = user.user.idAkses;
            $$("avatar").attachEvent("onItemClick", function(id, e, node) {
                $$("profilePopup").show(this.$view)
                $$("itemPopUp").unselectAll()
                $$("itemPopUp").parse([{
                    id: 'username',
                    icon: "mdi-account-circle",
                    value: where[user.user.group_id],
                    disabled: true,
                    page: "/app/ownerprofile"
                }, {
                    id: 'changepassword',
                    icon: "mdi-settings",
                    value: "Change Password",
                    page: "/app/changepassword"
                }, {
                    id: 'logout',
                    icon: "mdi-logout",
                    value: "Logout",
                    page: "/logout"
                }])
            })
        }).fail(err => {
            let response = JSON.parse(err.response)
            webix.message({
                type: response['type'],
                text: response['message']
            })
        })
        $$("tabs").attachEvent("onAfterTabClick", function(id, ev) {
            if (id == 'changepassword') {
                this.$scope.app.show('app/' + id)
            } else {
                $$("app:menu").select(id)
            }
        })
        $$("tabs").attachEvent("onChange", function(newv, oldv) {
            if (newv == 'changepassword') {
                this.$scope.app.show('app/' + newv)
            } else {
                $$("app:menu").select(newv)
            }
        })
        $$("tabs").attachEvent("onBeforeTabClose", function(id, value) {
            let countItem = $$("tabs").config.options.length
            if ((countItem - 1) == 0) return false
        })
    }
}
const mainToolbar = {
    height: 55,
    padding: 3,
    view: "toolbar",
    css: "black_color",
    cols: [{
        view: "icon",
        icon: "mdi mdi-menu",
        css: "font-button",
        click: function() {
            $$("app:menu").toggle();
        }
    }, {
        view: "label",
        align: 'left',
        tooltip: "Si Pedi Bungas",
        label: "<div class='logos'>&nbsp;</div> <div class='logos2'><img class='rounded_logo' src='assets/img/logo.png' style='position:relative; z-index:1;' height='42'/></div> <span style='font-size:22px; color:white;'>Si Pedi Bungas</span>"
    }, {
        batch: "default"
    }, {
        view: "icon",
        icon: "mdi mdi-account-circle",
        css: "font-button profileBtn",
        id: "avatar",
        tooltip: "Profile",
        borderless: true
    }]
}
const body = {
    rows: [{
        view: "tabbar",
        id: "tabs",
        options: [],
        multiview: true,
        tabMinWidth: 250,
        tooltip: function(obj) {
            return obj.value
        }
    }, {
        height: 44,
        id: "title",
        css: "title",
        template: "<div class='header'>#title#</div><div class='details'>( #details# )</div>",
    }, {
        view: "scrollview",
        body: {
            cols: [{
                $subview: true
            }]
        }
    }]
}
const layout = {
    rows: [mainToolbar, {
        cols: [menu, body]
    }]
}
webix.protoUI({
    name: "animateWindow",
    $init: function() {
        this.$ready.push(function() {
            this.attachEvent("onShow", function() {
                var base = this.$view.className.split("animated")[0];
                this.$view.className = base + " animated bounceInUp";
            })
            this.attachEvent("onHide", function() {
                this.$view.style.display = "block";
                this.$view.className += " animated bounceOutDown";
            })
        });
    }
}, webix.ui.window);
webix.protoUI({
    name: "animatePopupToolbar",
    $init: function() {
        this.$ready.push(function() {
            this.attachEvent("onShow", function() {
                var base = this.$view.className.split("animated")[0];
                this.$view.className = base + " animated flipInX";
            })
            this.attachEvent("onHide", function() {
                this.$view.style.display = "block";
                this.$view.className += " animated flipOutX";
            })
        });
    }
}, webix.ui.popup);