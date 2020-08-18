import {
    JetView
} from "webix-jet"
export default class menuPermissionView extends JetView {
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
                    view: "datatable"
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
        let api = this.app.config.api
        let grid = view.queryView({
            view: "datatable"
        })
        let dataUri = JSON.parse(atob(this.getParam('data', true)))
        let menuId = dataUri['menuID']
        let menuType = atob(dataUri['type'])
        let menuName = atob(dataUri['menuName'])
        let moduleId = atob(dataUri['moduleid'])
        grid.define("url", "rest->" + api + "/menu_permission/" + menuId)
        let state = grid.getState()
        if (menuType == 'cm') {
            state.hidden.splice(state.hidden.indexOf('permission'), 1)
            state.ids.push('permission')
        } else {
            state.ids.splice(state.ids.indexOf('permission'), 1)
            state.hidden.push('permission')
        }
        grid.setState(state)
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1' onclick='history.go(-1)'>${localStorage.getItem("mainTitle")} (${localStorage.getItem("mainDetails")})</a><a class='n2'>${this._menuName}</a></div>`)
        grid.attachEvent("onCheck", function(rowId, colId, state) {
            let item_id = rowId
            let status = state ? "Checked " : "Un-checked "
            let mod = state ? "add" : "delete"
            webix.ajax().get(`${api}/menu_permission/${mod}/${menuId}/${item_id}`).then(data => {
                webix.message({
                    type: 'success',
                    text: status
                })
            }).fail(err => {
                let response = JSON.parse(err.response)
                webix.message({
                    type: response['type'],
                    text: response['message']
                })
            })
        })
        grid.on_click['mdi-settings'] = function(e, id, node) {
            let item = this.getItem(id)
            let varUri = {
                'menuName': btoa(menuName),
                'menuID': menuId,
                'type': btoa(menuType),
                'guid': item['id'],
                'guname': item['usergroup'],
                'moduleid': btoa(moduleId)
            }
            this.$scope.app.show(`/app/menuPermissionAct?data=${btoa(JSON.stringify(varUri))}`)
        }
    }
}
const controls = [{}, {
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-arrow-left",
    label: "Go back",
    autowidth: true,
    click: function() {
        history.back()
    }
}]
const grid = {
    margin: 10,
    rows: [{
        view: "datatable",
        select: true,
        tooltip: true,
        columns: [{
            id: "id",
            header: "#",
            hidden: true
        }, {
            id: "markCheckbox",
            header: "",
            width: 40,
            css: "center",
            template: "{common.checkbox()}"
        }, {
            id: "usergroup",
            header: "Group",
            sort: "string",
            fillspace: 1,
            template: "<span class='status' style='background-color:#color#'>#usergroup#</span>",
        }, {
            id: "permission",
            header: "&nbsp;",
            width: 35,
            tooltip: 'Permission',
            hidden: true,
            template: "<span style='cursor:pointer;' class='mdi mdi-settings'></span>"
        }]
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