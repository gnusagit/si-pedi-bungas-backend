import {
    JetView
} from "webix-jet"
import spbjenissuratForm from "views/forms/spbjenissurat"
import {
    dataspbjenissurat
} from "models/spbjenissurat"
export default class spbjenissuratView extends JetView {
    config() {
        return layout
    }
    urlChange(view, url) {
        let api = this.app.config.api
        webix.ajax().post(api + "/auth/rolemenu/", {
            menucode: '5f3610c6d5495600116cfcbf'
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
        let statePrimary = webix.storage.local.get("spbjenissuratState") == null ? grid.getState() : webix.storage.local.get("spbjenissuratState")
        let stateTmp = grid.getState()
        if (statePrimary) {
            let dataPermission = webix.storage.local.get("currentActPerm")
            Object.keys(dataPermission['spbjenissurat']).forEach((key, index) => {
                if (key == 'edit' || key == 'delete' || key == 'printdoc' || key == 'otherLink') {
                    if (dataPermission['spbjenissurat'][key] == 1) {
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
            grid.parse(dataspbjenissurat(grid)).then(initState => {
                grid.setState(statePrimary)
            })
            webix.storage.local.put("spbjenissuratState", statePrimary)
        }
        // Load form and title bar
        this._form = this.ui(spbjenissuratForm)
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1'>Jenis surat (Daftar jenis surat)</a></div>`)
        // Import
        $$("spbjenissurat_import").config.upload = api + '/spbjenissurat_import/'
        $$("spbjenissurat_import").config.urlData = {
            'type': 'append'
        }
        $$("spbjenissurat_import").attachEvent("onFileUpload", function(file, response) {
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
                    grid.parse(dataspbjenissurat(grid))
                    webix.message({
                        type: "success",
                        text: "Data has imported"
                    })
                }
            }
        })
        // Action Permission
        let dataPermission = webix.storage.local.get("currentActPerm")
        if (dataPermission['spbjenissurat']['addBtn'] == 1) {
            $$("addBtn").show()
        } else {
            $$("addBtn").hide()
        }
        if (dataPermission['spbjenissurat']['delete'] == 1) {
            $$("deleteBtn").show()
        } else {
            $$("deleteBtn").hide()
        }
        if (dataPermission['spbjenissurat']['importBtn'] == 1) {
            $$("spbjenissurat_import").show()
        } else {
            $$("spbjenissurat_import").hide()
        }
        if (dataPermission['spbjenissurat']['exportBtn'] == 1) {
            $$("exportBtn").show()
        } else {
            $$("exportBtn").hide()
        }
        $$("addBtn").attachEvent("onItemClick", function(id, e, trg) {
            let form = $$('spbjenissurat-form')
            form.clear()
            $$('spbjenissurat-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n2'>Add</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spbjenissurat-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spbjenissurat-win'));
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
                click: "$$('spbjenissurat-form').clear(); $$('spbjenissurat-form').clearValidation(); $$('spbjenissurat-win').hide();"
            }], $$('spbjenissurat-toolbar'))
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
                            webix.ajax().del(api + "/spbjenissurat/", {
                                id: delID
                            }).then(function(data) {
                                let response = data.json()
                                grid.clearAll()
                                grid.parse(dataspbjenissurat(grid))
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
                filename: "spbjenissuratexport",
                name: "spbjenissurat",
                columns: {
                    "jenis": {
                        "header": "Jenis"
                    },
                    "tahapanSuratNama": {
                        "header": "Tahapan surat"
                    }
                }
            })
        })
        $$("refreshBtn").attachEvent("onItemClick", function(id, e, trg) {
            grid.clearAll()
            grid.parse(dataspbjenissurat(grid))
        })
        grid.on_click['mdi-pencil'] = function(e, id, node) {
            let form = $$('spbjenissurat-form')
            let item = grid.getItem(id)
            $$('spbjenissurat-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n5'>Update</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spbjenissurat-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spbjenissurat-win'));
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
                click: "$$('spbjenissurat-form').clear(); $$('spbjenissurat-form').clearValidation(); $$('spbjenissurat-win').hide(); $$('spbjenissuratData').unselect();"
            }], $$('spbjenissurat-toolbar'))
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
                        webix.ajax().del(api + "/spbjenissurat/", {
                            id: delID
                        }).then(function(data) {
                            let response = data.json()
                            grid.clearAll()
                            grid.parse(dataspbjenissurat(grid))
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
            window.open(`http://103.85.13.5/${api}/spbjenissurat_printdocument/${item['id']}`)
        }
        grid.on_click['mdi-dots-vertical'] = function(e, id, node) {
            let item = grid.getItem(id)
            this.$scope.ui({
                view: "submenu",
                id: "spbjenissuratGridPopUp",
                width: 200,
                padding: 0,
                data: null,
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
                            webix.storage.local.put("spbjenissuratState", grid.getState())
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
    id: "spbjenissurat_import",
    hidden: false,
    autosend: true
}, {
    view: "button",
    type: "icon",
    css: "webix_primary",
    icon: "mdi mdi-file-download",
    autowidth: true,
    label: "Export",
    hidden: false,
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
        id: "spbjenissuratData",
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
            "id": "jenis",
            "header": ["Jenis", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 1,
            "width": 0,
            "template": ""
        }, {
            "id": "tahapanSuratNama",
            "header": ["Tahapan surat", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 1,
            "width": 0,
            "template": ""
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
            hidden: true,
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