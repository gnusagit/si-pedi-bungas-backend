import {
    JetView
} from "webix-jet"
import apigeneratorForm from "views/forms/apigenerator"
import {
    dataapigenerator
} from "models/apigenerator"
export default class apigeneratorView extends JetView {
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
        let grid = view.queryView({
            view: "datatable"
        })
        // Set State
        webix.attachEvent('unload', function() {
            webix.storage.local.put("appMenu", $$("app:menu").getState())
            webix.storage.local.put("apigeneratorState", grid.getState())
        })
        // Parse data
        grid.parse(dataapigenerator(grid))
        // Load current state
        let state = webix.storage.local.get("apigeneratorState")
        if (state) {
            grid.setState(state)
        }
        // Load form and title bar
        this._form = this.ui(apigeneratorForm)
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1'>${localStorage.getItem("mainTitle")} (${localStorage.getItem("mainDetails")})</a></div>`)
        setInterval(function() {
            if ($$("apigeneratorData") != undefined) {
                $$("apigeneratorData").refresh()
            }
        }, 1000)
        grid.on_click['mdi-pencil'] = function(e, id, node) {
            $$('apigenerator-win').show()
            let item = $$('apigeneratorData').getItem(id)
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n5'>Update</a></div>"
            }, {
                view: "icon",
                icon: "wxi-close",
                css: "alter",
                tooltip: "Close window",
                click: "$$('apigenerator-form').clear(); $$('apigenerator-win').hide(); $$('apigeneratorData').unselect();"
            }], $$('apigenerator-toolbar'))
            $$('apigenerator-form').setValues(item)
        }
        grid.on_click['mdi-trash-can-outline'] = function(e, id, node) {
            webix.confirm({
                text: "Data will be deleted. <br/> are you sure?",
                ok: "Yes",
                cancel: "No",
                callback: function(res) {
                    if (res) {
                        let item = grid.getItem(id)
                        let delID = []
                        let delAPI = []
                        delID.push(item.id)
                        delAPI.push(item.apiKey)
                        webix.ajax().del(api + "/apigenerator/", {
                            id: delID,
                            delApi: delAPI
                        }).then(function(data) {
                            let response = data.json()
                            grid.clearAll()
                            grid.parse(dataapigenerator(grid))
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
            })
        }
        grid.on_click['mdi-dots-vertical'] = function(e, id, node) {
            let item = grid.getItem(id)
            this.$scope.ui({
                view: "submenu",
                id: "apigeneratorGridPopUp",
                width: 200,
                padding: 0,
                data: [{
                    "id": "apigeneratorconfig",
                    "icon": "mdi mdi-menu-right",
                    "value": "Configuration",
                    "page": "/app/apigeneratorconfig?parentID=" + item.id + "&label=" + btoa(item.packagename) + ""
                }],
                on: {
                    onMenuItemClick: function(id) {
                        let _ini = this
                        if (id == '') {
                            webix.message({
                                type: "error",
                                text: "Page not found"
                            })
                        } else {
                            let countDownDate = new Date(item.ttlEndDate).getTime()
                            var now = new Date().getTime();
                            var distance = countDownDate - now;
                            if (distance < 0) {
                                webix.ajax().post(api + "/apigenerator-stop/", {
                                    dataID: item['id']
                                }).then(function(data) {
                                    webix.storage.local.put("apigeneratorState", $$("apigeneratorData").getState())
                                    _ini.$scope.app.show(_ini.getMenuItem(id).page)
                                }).fail(function(err) {
                                    let response = JSON.parse(err.response)
                                    webix.message({
                                        type: response['type'],
                                        text: response['message']
                                    })
                                })
                            } else {
                                webix.storage.local.put("apigeneratorState", $$("apigeneratorData").getState())
                                _ini.$scope.app.show(_ini.getMenuItem(id).page)
                            }
                        }
                    }
                }
            }).show(node)
        }
        $$("addBtn").attachEvent("onItemClick", function(id, e, trg) {
            $$('apigenerator-form').clear()
            $$('apigenerator-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n2'>Add</a></div>"
            }, {
                view: "icon",
                icon: "wxi-close",
                css: "alter",
                tooltip: "Close window",
                click: "$$('apigenerator-form').clear(); $$('apigenerator-win').hide();"
            }], $$('apigenerator-toolbar'))
        })
        $$("deleteBtn").attachEvent("onItemClick", function(id, e, trg) {
            let delID = []
            let delAPI = []
            grid.eachRow(function(id) {
                if (this.getItem(id).ch1 == 'on') {
                    delID.push(id)
                    delAPI.push(this.getItem(id).apiKey)
                }
            })
            if (delID.length != 0) {
                webix.confirm({
                    text: "Data will be deleted. <br/> are you sure?",
                    ok: "Yes",
                    cancel: "No",
                    callback: function(res) {
                        if (res) {
                            webix.ajax().del(api + "/apigenerator/", {
                                id: delID,
                                delApi: delAPI
                            }).then(function(data) {
                                let response = data.json()
                                grid.clearAll()
                                grid.parse(dataapigenerator(grid))
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
                })
            } else {
                webix.message({
                    type: 'debug',
                    text: 'No data selected'
                })
            }
        })
        $$("refreshBtn").attachEvent("onItemClick", function(id, e, trg) {
            grid.clearAll()
            grid.parse(dataapigenerator(grid))
        })
        $$("infoBtn").attachEvent("onItemClick", function(id, e, trg) {
            let selectedItem = grid.getSelectedItem()
            if (selectedItem == undefined) {
                webix.message({
                    type: 'debug',
                    text: 'No data selected'
                })
                return false
            }
            this.$scope.ui({
                view: "window",
                id: "info-api-ui-win",
                head: {
                    view: "toolbar",
                    css: "header",
                    height: 50,
                    cols: [{
                        view: "label",
                        label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n5'>Info</a></div>"
                    }, {
                        view: "icon",
                        icon: "wxi-close",
                        css: "alter",
                        tooltip: "Close window",
                        click: function(a, b, c) {
                            $$('info-api-ui-win').hide()
                        }
                    }]
                },
                modal: true,
                body: {
                    rows: [{
                        view: "form",
                        id: "info-api-ui-form",
                        width: 500,
                        elementsConfig: {
                            labelPosition: 'top'
                        },
                        elements: [{
                            "view": "text",
                            "name": "link",
                            "required": false,
                            "readonly": true,
                            "value": `http://103.85.13.5:10435/si-pedi-bungas-server-public/${selectedItem['packagename']}`
                        }, {
                            "view": "text",
                            "name": "token",
                            "required": false,
                            "readonly": true,
                            "placeholder": "Token-ID",
                            "value": `${selectedItem['apiKey']}`
                        }]
                    }]
                }
            }).show(e)
        })
        $$("configBtn").attachEvent("onItemClick", function(id, e, trg) {
            let _ini = this
            let selectedItem = $$("apigeneratorData").getSelectedItem()
            if (selectedItem == undefined) {
                webix.message({
                    type: 'debug',
                    text: 'No data selected'
                })
                return false
            }
            let countDownDate = new Date(selectedItem['ttlEndDate']).getTime()
            var now = new Date().getTime();
            var distance = countDownDate - now;
            if (distance < 0) {
                webix.ajax().post(api + "/apigenerator-stop/", {
                    dataID: selectedItem['id']
                }).then(function(data) {
                    webix.storage.local.put("apigeneratorState", $$("apigeneratorData").getState())
                    _ini.$scope.app.show(`/app/apigeneratorconfig?parentID=${selectedItem['id']}&label=${btoa(selectedItem['packagename'])}`)
                }).fail(function(err) {
                    let response = JSON.parse(err.response)
                    webix.message({
                        type: response['type'],
                        text: response['message']
                    })
                })
            } else {
                webix.storage.local.put("apigeneratorState", $$("apigeneratorData").getState())
                _ini.$scope.app.show(`/app/apigeneratorconfig?parentID=${selectedItem['id']}&label=${btoa(selectedItem['packagename'])}`)
            }
        })
    }
}
const controls = [{
    view: "button",
    type: "icon",
    icon: "mdi mdi-file-plus",
    css: "webix_primary",
    label: "Add",
    autowidth: true,
    hidden: false,
    id: "addBtn"
}, {
    view: "button",
    type: "icon",
    css: "webix_danger",
    icon: "mdi mdi-delete-forever",
    autowidth: true,
    label: "Delete",
    hidden: false,
    id: "deleteBtn"
}, {
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-refresh",
    autowidth: true,
    label: "Refresh",
    id: "refreshBtn"
}, {
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-information-variant",
    autowidth: true,
    label: "Info",
    id: "infoBtn"
}, {
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-settings",
    autowidth: true,
    label: "Configuration",
    id: "configBtn"
}, {}]
const grid = {
    margin: 10,
    rows: [{
        id: "apigeneratorData",
        view: "datatable",
        select: true,
        tooltip: true,
        columns: [{
            "id": "id",
            "header": "#",
            "hidden": true
        }, {
            "id": "ch1",
            "checkValue": "on",
            "uncheckValue": "off",
            "header": ["", {
                "content": "masterCheckbox"
            }],
            "width": 40,
            "css": "center",
            "template": "{common.checkbox()}"
        }, {
            "id": "packagename",
            "header": ["Package", {
                "content": "textFilter"
            }],
            "sort": "string",
            "fillspace": 1,
            "template": ""
        }, {
            "id": "description",
            "header": ["Description", {
                "content": "textFilter"
            }],
            "sort": "string",
            "fillspace": 1,
            "template": ""
        }, {
            "id": "othersData",
            "header": ["Info", {
                "content": "textFilter"
            }],
            "sort": "string",
            "fillspace": 2,
            "template": function(obj) {
                let one = `<span class='status' style='background-color:${obj.apiKey == undefined ? '' : obj.apiKey == '' ? '' : '#06a0c3'}; color:white;'>${obj.apiKey == undefined ? '' : obj.apiKey == '' ? '' : obj.apiKey}</span>`
                let countDownDate = new Date(obj.ttlEndDate).getTime()
                // Get today's date and time
                var now = new Date().getTime();
                // Find the distance between now and the count down date
                var distance = countDownDate - now;
                // Time calculations for days, hours, minutes and seconds
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                let two = ` expires in: <span class='status' style='background-color:#fe4a49; color:white;'>${days+'d'}</span> <span class='status' style='background-color:#2ab7ca; color:white;'>${hours+'h'}</span> <span class='status' style='background-color:#f6cd61; color:white;'>${minutes+'m'}</span> <span class='status' style='background-color:#1e824c; color:white;'>${seconds+'s'}</span>`
                return `${obj.ttl == undefined ? '' : obj.ttlValue == null ? "<span class='status' style='background-color:#3c9d9b; color:white;'>Forever</span> "+ one : obj.ttl == 0 ? "<span class='status' style='background-color:#ee4035; color:white;'>Expired</span>" : distance < 0 ? "<span class='status' style='background-color:#ee4035; color:white;'>Expired</span>" : one+two}`
            }
        }, {
            id: "edit",
            header: "&nbsp;",
            width: 35,
            hidden: false,
            tooltip: 'Edit',
            template: "<span style='cursor:pointer;' class='mdi mdi-pencil'></span>"
        }, {
            id: "delete",
            header: "&nbsp;",
            width: 35,
            hidden: false,
            tooltip: 'Delete',
            template: "<span style='cursor:pointer;' class='mdi mdi-trash-can-outline'></span>"
        }, {
            id: "otherLink",
            header: "&nbsp;",
            width: 35,
            hidden: true,
            tooltip: 'Others Link',
            template: "<span style='cursor:pointer;' class='mdi mdi-dots-vertical'></span>"
        }],
        on: {
            onAfterRender() {
                webix.extend(this, webix.ProgressBar)
            },
            onAfterLoad: function() {
                webix.extend(this, webix.OverlayBox);
                this.hideOverlay()
                if (!this.count()) this.showOverlay("Sorry, there is no data")
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