import {
    JetView
} from "webix-jet"
import spblaporanForm from "views/forms/spblaporan"
import {
    dataspblaporan
} from "models/spblaporan"
export default class spblaporanView extends JetView {
    config() {
        return layout
    }
    urlChange(view, url) {
        let api = this.app.config.api
        webix.ajax().post(api + "/auth/rolemenu/", {
            menucode: '5f321748b53fc4001193e371'
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
        })
        // Load last state
        let statePrimary = webix.storage.local.get("spblaporanState") == null ? grid.getState() : webix.storage.local.get("spblaporanState")
        let stateTmp = grid.getState()
        if (statePrimary) {
            let dataPermission = webix.storage.local.get("currentActPerm")
            Object.keys(dataPermission['spblaporan']).forEach((key, index) => {
                if (key == 'edit' || key == 'delete' || key == 'printdoc' || key == 'otherLink') {
                    if (dataPermission['spblaporan'][key] == 1) {
                        if (stateTmp.hidden.indexOf(key) >= 0) {
                            stateTmp.hidden.splice(stateTmp.hidden.indexOf(key), 1);
                        }
                        if (stateTmp.ids.indexOf(key) < 0) {
                            stateTmp.ids.push(key)
                        }
                    } else {
                        if (stateTmp.ids.indexOf(key) >= 0) {
                            stateTmp.ids.splice(stateTmp.ids.indexOf(key), 1);
                        }
                        if (stateTmp.hidden.indexOf(key) < 0) {
                            stateTmp.hidden.push(key)
                        }
                    }
                }
            })
            statePrimary['ids'] = stateTmp['ids']
            statePrimary['hidden'] = stateTmp['hidden']
            grid.parse(dataspblaporan(grid)).then(initState => {
                grid.setState(statePrimary)
            })
            webix.storage.local.put("spblaporanState", statePrimary)
        }
        // Load form and title bar
        this._form = this.ui(spblaporanForm)
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1'>Laporan polisi (Daftar laporan)</a></div>`)
        // Import
        $$("spblaporan_import").config.upload = api + '/spblaporan_import/'
        $$("spblaporan_import").config.urlData = {
            'type': ''
        }
        $$("spblaporan_import").attachEvent("onFileUpload", function(file, response) {
            if (response) {
                if (response.error_code == 1) {
                    if (typeof response.err_desc === 'string' || response.err_desc instanceof String) webix.message({
                        type: "error",
                        text: response.err_desc
                    })
                    else webix.message({
                        type: "error",
                        text: response.err_desc.message
                    })
                } else {
                    grid.clearAll()
                    grid.parse(dataspblaporan(grid))
                    webix.message({
                        type: "success",
                        text: "Data has imported"
                    })
                }
            }
        })
        // Action Permission
        let dataPermission = webix.storage.local.get("currentActPerm")
        if (dataPermission['spblaporan']['addBtn'] == 1) {
            $$("addBtn").show()
        } else {
            $$("addBtn").hide()
        }
        if (dataPermission['spblaporan']['delete'] == 1) {
            $$("deleteBtn").show()
        } else {
            $$("deleteBtn").hide()
        }
        if (dataPermission['spblaporan']['importBtn'] == 1) {
            $$("spblaporan_import").show()
        } else {
            $$("spblaporan_import").hide()
        }
        if (dataPermission['spblaporan']['exportBtn'] == 1) {
            $$("exportBtn").show()
        } else {
            $$("exportBtn").hide()
        }
        $$("addBtn").attachEvent("onItemClick", function(id, e, trg) {
            let form = $$('spblaporan-form')
            form.clear()
            $$('spblaporan-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n2'>Add</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spblaporan-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spblaporan-win'));
                        this.define({
                            icon: "mdi mdi-fullscreen-exit",
                            tooltip: "Disable fullscreen mode"
                        });
                    }
                    this.refresh();
                }
            }, {
                view: "icon",
                icon: "wxi-close",
                css: "alter",
                tooltip: "Close window",
                click: "$$('spblaporan-form').clear(); $$('spblaporan-form').clearValidation(); $$('spblaporan-win').hide();"
            }], $$('spblaporan-toolbar'))
        })
        $$("deleteBtn").attachEvent("onItemClick", function(id, e, trg) {
            let delID = []
            grid.eachRow(function(id) {
                if (this.getItem(id).ch1 == 'on') {
                    delID.push(id)
                }
            })
            if (delID.length != 0) {
                webix.confirm({
                    text: "Data will be deleted. <br/> are you sure?",
                    ok: "Yes",
                    cancel: "No",
                    callback: function(res) {
                        if (res) {
                            webix.ajax().del(api + "/spblaporan/", {
                                id: delID
                            }).then(function(data) {
                                let response = data.json()
                                grid.clearAll()
                                grid.parse(dataspblaporan(grid))
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
        $$("exportBtn").attachEvent("onItemClick", function(id, e, trg) {
            webix.toExcel(grid, {
                filename: "spblaporanexport",
                name: "spblaporan",
                columns: {
                    "nomor": {
                        "header": "Nomor LP"
                    },
                    "tanggal": {
                        "header": "Tanggal"
                    }
                }
            })
        })
        $$("refreshBtn").attachEvent("onItemClick", function(id, e, trg) {
            grid.clearAll()
            grid.parse(dataspblaporan(grid))
        })
        grid.on_click['mdi-pencil'] = function(e, id, node) {
            let form = $$('spblaporan-form')
            let item = grid.getItem(id)
            $$('spblaporan-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n5'>Update</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spblaporan-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spblaporan-win'));
                        this.define({
                            icon: "mdi mdi-fullscreen-exit",
                            tooltip: "Disable fullscreen mode"
                        });
                    }
                    this.refresh();
                }
            }, {
                view: "icon",
                icon: "wxi-close",
                css: "alter",
                tooltip: "Close window",
                click: "$$('spblaporan-form').clear(); $$('spblaporan-form').clearValidation(); $$('spblaporan-win').hide(); $$('spblaporanData').unselect();"
            }], $$('spblaporan-toolbar'))
            form.setValues(item)
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
                        delID.push(item.id)
                        webix.ajax().del(api + "/spblaporan/", {
                            id: delID
                        }).then(function(data) {
                            let response = data.json()
                            grid.clearAll()
                            grid.parse(dataspblaporan(grid))
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
        grid.on_click['mdi-printer'] = function(e, id, node) {
            let item = grid.getItem(id)
            window.open(`http://103.85.13.5/${api}/spblaporan_printdocument/${item['id']}`)
        }
        grid.on_click['mdi-dots-vertical'] = function(e, id, node) {
            let item = grid.getItem(id)
            this.$scope.ui({
                view: "submenu",
                id: "spblaporanGridPopUp",
                width: 200,
                padding: 0,
                data: [{
                    "id": "spbsurat",
                    "icon": "mdi mdi-menu-right",
                    "value": "Surat",
                    "parent_title": btoa(item.nomor),
                    "page": "/app/spbsurat?parentID=" + item.id + "&label=" + btoa(item.nomor)
                }],
                on: {
                    onMenuItemClick: function(id) {
                        if (id == '') {
                            webix.message({
                                type: "error",
                                text: "Page not found"
                            })
                        } else {
                            let titleBC = [this.getMenuItem(id).parent_title]
                            localStorage.setItem("breadCumb", JSON.stringify(titleBC))
                            webix.storage.local.put("spblaporanState", grid.getState())
                            this.$scope.app.show(this.getMenuItem(id).page)
                        }
                    }
                }
            }).show(node)
        }
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
    view: "uploader",
    type: "iconButton",
    icon: "mdi mdi-file-excel",
    autowidth: true,
    label: "Import Excel File",
    inputName: "file",
    id: "spblaporan_import",
    hidden: true,
    autosend: true
}, {
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-file-download",
    autowidth: true,
    label: "Export",
    hidden: true,
    id: "exportBtn"
}, {
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
        id: "spblaporanData",
        view: "datatable",
        select: true,
        tooltip: true,
        scheme: {
            $init: function(obj) {}
        },
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
            "id": "nomor",
            "header": ["Nomor LP", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 0,
            "width": 0,
            "template": ""
        }, {
            "id": "tanggal",
            "header": ["Tanggal", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 1,
            "width": 0,
            "template": "",
            "format": webix.Date.dateToStr('%d/%m/%Y')
        }, {
            id: "edit",
            header: "&nbsp;",
            width: 35,
            hidden: false,
            tooltip: "Edit",
            template: "<span style='cursor:pointer;' class='mdi mdi-pencil'></span>"
        }, {
            id: "delete",
            header: "&nbsp;",
            width: 35,
            hidden: false,
            tooltip: "Delete",
            template: "<span style='cursor:pointer;' class='mdi mdi-trash-can-outline'></span>"
        }, {
            id: "printdoc",
            header: "&nbsp;",
            width: 35,
            hidden: true,
            tooltip: "Print",
            template: "<span style='cursor:pointer;' class='mdi mdi-printer'></span>"
        }, {
            id: "otherLink",
            header: "&nbsp;",
            width: 35,
            hidden: false,
            tooltip: "Options",
            template: "<span style='cursor:pointer;' class='mdi mdi-dots-vertical'></span>"
        }],
        "export": true,
        on: {
            onAfterRender() {
                webix.extend(this, webix.ProgressBar)
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