import {
    JetView
} from "webix-jet";
export default class menuPermissionActView extends JetView {
    config() {
        return layout;
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
        let guid = dataUri['guid']
        let moduleId = atob(dataUri['moduleid'])
        webix.ajax().get(api + "/menu_permission_act/module/" + moduleId).then(mdl => {
            let selOptions = []
            let moduleArr = mdl.json()
            moduleArr.forEach(function(obj) {
                selOptions.push({
                    id: obj.id,
                    value: obj.label
                })
            })
            $$("moduleCombo").define({
                options: selOptions
            })
            $$("moduleCombo").refresh()
            return selOptions[0]['id']
        }).then(md2 => {
            $$("moduleCombo").setValue(md2)
        }).fail(function(err) {
            let response = JSON.parse(err.response)
            webix.message({
                type: response['type'],
                text: response['message']
            })
        })
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1' onclick='history.go(-2)'>${localStorage.getItem("mainTitle")} (${localStorage.getItem("mainDetails")})</a><a class='n2' onclick='history.go(-1)'>${atob(dataUri['menuName'])}</a><a class='n3'>${dataUri['guname']}</a></div>`)
        $$("moduleCombo").attachEvent("onChange", function(newv, oldv) {
            grid.clearAll()
            grid.define("url", `rest->${api}/menu_permission_act/${menuId}/${guid}?id=${newv}`);
        })
        grid.attachEvent("onCheck", function(rowId, colId, state) {
            let item_id = rowId
            let status = state ? "Checked " : "Un-checked "
            let mod = state ? "add" : "delete"
            let controllerName = $$('moduleCombo').getValue()
            webix.ajax().get(`${api}/menu_permission_act/${mod}/${moduleId}/${guid}/${item_id}?controllerName=${controllerName}`).then(data => {
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
    }
}
const controls = [{
    "view": "combo",
    "id": "moduleCombo",
    "required": true,
    "tooltip": "Choose Module"
}, {}, {}, {
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
        id: "menuPermissionActData",
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
            id: "label",
            header: "Label",
            sort: "string",
            fillspace: 1,
            template: "<span class='status' style='background-color:#color#'>#label#</span>",
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