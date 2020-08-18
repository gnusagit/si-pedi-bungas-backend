import {
    JetView
} from "webix-jet"
import apigeneratorconfigForm from "views/forms/apigeneratorconfig"
import {
    dataapigeneratorconfig
} from "models/apigeneratorconfig"
export default class apigeneratorconfigView extends JetView {
    config() {
        return layout
    }
    urlChange(view, url) {
        let api = this.app.config.api
        webix.ajax().post(api + "/auth/rolemenu/", {
            menucode: '5f321cdfb53fc4001193e3b5'
        }).then(function(data) {
            let response = data.json()
            if (response.msg == 0) {
                webix.alert({
                    type: "alert-warning",
                    text: 'You are not allowed on this page',
                    callback: function(result) {
                        history.back();
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
        let parentID = this.getParam('parentID', true)
        let grid = view.queryView({
            view: "datatable"
        })
        // Set State
        webix.attachEvent('unload', function() {
            webix.storage.local.put("apigeneratorconfigState_" + parentID, grid.getState())
        })
        // Parse data
        grid.parse(dataapigeneratorconfig(grid, parentID))
        // Load state
        let state = webix.storage.local.get("apigeneratorconfigState_" + parentID)
        if (state) {
            grid.setState(state)
        }
        // Load form & title bar
        this._form = this.ui(apigeneratorconfigForm)
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1' onclick='history.go(-1)'>${localStorage.getItem("mainTitle")} (${localStorage.getItem("mainDetails")})</a><a class='n2'>Configuration (${atob(this.getParam('label'))})</a></div>`)
        // Check API button started
        webix.ajax().post(api + "/apigenerator-check-api/", {
            'dataID': parentID
        }).then(function(data) {
            let response = data.json()
            if (response.status == 1) {
                $$("toggleBtn").setValue(true)
                webix.message({
                    type: 'success',
                    'text': 'API Started'
                })
            } else {
                $$("toggleBtn").setValue(false)
            }
        }).fail(err => {
            let response = JSON.parse(err.response)
            webix.message({
                type: response['type'],
                text: response['message']
            })
        })
        grid.on_click['mdi-pencil'] = function(e, id, node) {
            let item = grid.getItem(id)
            $$('apigeneratorconfig-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n5'>Update</a></div>"
            }, {
                view: "icon",
                icon: "wxi-close",
                css: "alter",
                tooltip: "Close window",
                click: "$$('apigeneratorconfig-form').clear(); $$('apigeneratorconfig-win').hide(); $$('apigeneratorconfigData').unselect();"
            }], $$('apigeneratorconfig-toolbar'))
            $$('apigeneratorconfig-form').setValues(item)
        }
        $$("toggleBtn").attachEvent("onItemClick", function(id, e, trg) {
            if ($$("toggleBtn").getValue() == true) {
                webix.confirm({
                    text: "API will be stopped. <br/> are you sure?",
                    ok: "Yes",
                    cancel: "No",
                    callback: function(res) {
                        if (res) {
                            webix.ajax().post(api + "/apigenerator-stop/", {
                                dataID: parentID
                            }).then(function(data) {
                                let response = data.json()
                                $$("toggleBtn").setValue(false)
                                webix.message({
                                    type: response.type,
                                    text: response.message
                                })
                            }).fail(function(err) {
                                let response = JSON.parse(err.response)
                                webix.message({
                                    type: response['type'],
                                    text: response['message']
                                })
                            })
                        } else {
                            $$("toggleBtn").setValue(true)
                        }
                    }
                })
            } else {
                this.$scope.ui({
                    view: "window",
                    id: "start-api-ui-win",
                    head: {
                        view: "toolbar",
                        css: "header",
                        height: 50,
                        cols: [{
                            view: "label",
                            label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n2'>Start API</a></div>"
                        }, {
                            view: "icon",
                            icon: "wxi-close",
                            css: "alter",
                            tooltip: "Close window",
                            click: function(a, b, c) {
                                $$('start-api-ui-win').hide()
                                $$("toggleBtn").setValue(false)
                            }
                        }]
                    },
                    modal: true,
                    body: {
                        rows: [{
                            view: "form",
                            id: "start-api-ui-form",
                            width: 250,
                            elementsConfig: {
                                labelPosition: 'top'
                            },
                            elements: [{
                                "view": "checkbox",
                                "label": "TTL?",
                                "name": "ttl",
                                "required": false,
                                "on": {
                                    onChange: function(newv, oldv) {
                                        if (newv == 1) {
                                            $$("ttlGroup").show()
                                        } else {
                                            $$("ttlGroup").hide()
                                        }
                                    }
                                }
                            }, {
                                id: "ttlGroup",
                                hidden: true,
                                rows: [{
                                    "view": "datepicker",
                                    "name": "ttlStartDate",
                                    "label": "Start Date",
                                    "disabled": true,
                                    "format": "%Y-%m-%d %H:%i",
                                    "value": new Date()
                                }, {
                                    "view": "datepicker",
                                    "name": "ttlEndDate",
                                    "label": "End Date",
                                    "format": "%Y-%m-%d %H:%i",
                                    "suggest": {
                                        "view": "suggest",
                                        "type": "calendar",
                                        "body": {
                                            "view": "calendar",
                                            "timepicker": true,
                                            "minDate": webix.Date.add(new Date(), -1, 'day')
                                        }
                                    },
                                    "on": {
                                        onChange: function(newv, oldv) {
                                            let startDate = $$("start-api-ui-form").elements['ttlStartDate'].getValue().getTime()
                                            let endDate = newv.getTime()
                                            let timediff = Math.round((endDate - startDate) / 1000)
                                            $$("start-api-ui-form").elements['ttlValue'].setValue(timediff)
                                        }
                                    }
                                }]
                            }, {
                                "view": "text",
                                "name": "ttlValue",
                                "required": false,
                                "readonly": true,
                                "hidden": true,
                                "label": "TTL Value"
                            }]
                        }, {
                            padding: 5,
                            css: 'grey_color',
                            cols: [{
                                view: "button",
                                label: "Save",
                                type: 'icon',
                                css: 'webix_primary',
                                icon: 'mdi mdi-check',
                                align: "center",
                                click: function() {
                                    let form = $$('start-api-ui-form')
                                    let value = form.getValues()
                                    if (form.validate()) {
                                        webix.ajax().post(api + "/apigeneratorconfig/" + parentID, value).then(function(data) {
                                            let response = data.json()
                                            $$('start-api-ui-win').hide()
                                            webix.message({
                                                type: response.type,
                                                text: response.message
                                            })
                                        }).fail(function(err) {
                                            let response = JSON.parse(err.response)
                                            webix.message({
                                                type: response['type'],
                                                text: response['message']
                                            })
                                        })
                                    }
                                }
                            }]
                        }]
                    }
                }).show(e)
            }
        })
        $$("refreshBtn").attachEvent("onItemClick", function(id, e, trg) {
            grid.clearAll()
            grid.parse(dataapigeneratorconfig(grid, parentID))
        })
        $$("backBtn").attachEvent("onItemClick", function(id, e, trg) {
            webix.storage.local.put("apigeneratorconfigState_" + parentID, grid.getState())
            history.back()
        })
    }
}
const controls = [{
    id: "toggleBtn",
    view: "toggle",
    type: "icon",
    css: "webix_primary",
    offIcon: "mdi mdi-play",
    onIcon: "mdi mdi-pause",
    width: 80,
    onLabel: "API",
    offLabel: "API"
}, {
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-refresh",
    autowidth: true,
    label: "Refresh",
    id: "refreshBtn"
}, {}, {
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-arrow-left",
    label: "Go back",
    autowidth: true,
    id: "backBtn"
}]
const grid = {
    margin: 10,
    rows: [{
        id: "apigeneratorconfigData",
        view: "datatable",
        select: true,
        tooltip: true,
        columns: [{
            "id": "id",
            "header": "#",
            "hidden": true
        }, {
            "id": "fieldname",
            "header": ["Fieldname", {
                "content": "textFilter"
            }],
            "sort": "string",
            "fillspace": 2,
            "template": ""
        }, {
            "id": "deskripsi",
            "header": ["Configuration", {
                "content": "textFilter"
            }],
            "sort": "string",
            "fillspace": 4,
            "template": function(obj) {
                let one = `<span class='status' style='background-color:${obj.pullField == 1 ? '#06a0c3' : '#c0392b'}; color:white;'>${obj.pullField}</span>`
                let two = `<span class='status' style='background-color:#1e824c; color:white;'>${obj.filterType}</span>`
                let three = `<span class='status' style='background-color:#34495e; color:white;'>${obj.operatorFilter}</span>`
                return `${one} ${obj.filterType == '' || obj.filterType == '0' ? '' : two} ${obj.filterType == 'Operator' ? three : ''}`
            }
        }, {
            id: "edit",
            header: "&nbsp;",
            width: 35,
            hidden: false,
            tooltip: 'Edit',
            template: "<span style='cursor:pointer;' class='mdi mdi-pencil'></span>"
        }],
        on: {
            onAfterRender() {
                webix.extend(this, webix.ProgressBar);
            },
            onAfterLoad: function() {
                webix.extend(this, webix.OverlayBox);
                this.hideOverlay()
                if (!this.count()) this.showOverlay("Sorry, there is no data");
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