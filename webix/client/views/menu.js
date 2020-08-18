import {
    JetView
} from "webix-jet"
import {
    datamenu
} from "models/menu"
export default class menuView extends JetView {
    config() {
        return layout
    }
    urlChange(view, url) {
        let api = this.app.config.api
        webix.ajax().post(api + "/auth/rolemenu/", {
            menucode: '5f32168bb53fc4001193e36f'
        }).then(function(data) {
            let response = data.json()
            if (response.msg == 0) {
                view.queryView({
                    view: "treetable"
                }).clearAll()
                webix.alert({
                    type: "alert-warning",
                    text: 'You are not allowed on this page',
                    callback: function(result) {
                        history.back()
                    }
                })
            }
        }).fail(function(err) {
            let response = JSON.parse(err.response)
            webix.message({
                type: response['type'],
                text: response['message']
            })
        })
    }
    init(view) {
        let grid = view.queryView({
            view: "treetable"
        })
        // Set state
        webix.attachEvent('unload', function() {
            webix.storage.local.put("appMenu", $$("app:menu").getState())
            webix.storage.local.put("menuState", grid.getState())
        })
        // Load last state
        let state = webix.storage.local.get("menuState") == null ? grid.getState() : webix.storage.local.get("menuState")
        if (state) {
            grid.parse(datamenu(grid)).then(initState => {
                grid.setState(state)
            })
        }
        // Load title bar
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1'>${localStorage.getItem("mainTitle")} (${localStorage.getItem("mainDetails")})</a></div>`)
        $$("refreshBtn").attachEvent("onItemClick", function(id, e, trg) {
            grid.clearAll()
            grid.parse(datamenu(grid))
        })
        grid.on_click['mdi-settings'] = function(e, id, node) {
            let item = grid.getItem(id)
            webix.storage.local.put("menuState", grid.getState())
            let varUri = {
                'menuName': btoa(item.value),
                'menuID': item.id,
                'type': btoa(item.moduleSource),
                'moduleid': btoa(item.module_id)
            }
            this.$scope.app.show(`/app/menuPermission?data=${btoa(JSON.stringify(varUri))}`)
        }
    }
}
const controls = [{
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-refresh",
    autowidth: true,
    label: "Refresh",
    id: "refreshBtn"
}, {}]
const grid = {
    margin: 10,
    rows: [{
        id: "menuData",
        view: "treetable",
        select: true,
        tooltip: true,
        columns: [{
            "id": "id",
            "header": "#",
            "hidden": true
        }, {
            "id": "menu",
            "header": ["Menu", {
                "content": "textFilter"
            }],
            "sort": "string",
            "fillspace": 1,
            "template": function(obj, common) {
                return (obj.$parent ? common.space(obj, common) : '') + common.icon(obj, common) + obj.value
            }
        }, {
            id: "permission",
            header: "&nbsp;",
            width: 35,
            tooltip: 'Permission',
            template: "<span  style='cursor:pointer;' class='mdi mdi-settings'></span>"
        }],
        on: {
            onAfterRender() {
                webix.extend(this, webix.ProgressBar)
            }
        }
    }]
}
const layout = {
    type: "space",
    rows: [{
        height: 40,
        cols: controls
    }, {
        rows: [grid]
    }]
}