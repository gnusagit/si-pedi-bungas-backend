import {
    JetView
} from "webix-jet"
import spbsuratForm from "views/forms/spbsurat"
import {
    dataspbsurat
} from "models/spbsurat"
export default class spbsuratView extends JetView {
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
        let parentID = this.getParam('parentID', true)
        // Load last state
        let statePrimary = webix.storage.local.get("spbsuratState_" + parentID) == null ? grid.getState() : webix.storage.local.get("spbsuratState_" + parentID)
        let stateTmp = grid.getState()
        if (statePrimary) {
            let dataPermission = webix.storage.local.get("currentActPerm")
            Object.keys(dataPermission['spbsurat']).forEach((key, index) => {
                if (key == 'edit' || key == 'delete' || key == 'printdoc' || key == 'otherLink') {
                    if (dataPermission['spbsurat'][key] == 1) {
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
            grid.parse(dataspbsurat(grid, parentID)).then(initState => {
                grid.setState(statePrimary)
            })
            webix.storage.local.put("spbsuratState_" + parentID, statePrimary)
        }
        // Load form & title bar
        this._form = this.ui(spbsuratForm)
        let titleBC = JSON.parse(localStorage.getItem("breadCumb"))
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1' onclick='history.go(-1)'>Laporan polisi (Daftar laporan)</a><a class='n2'>Surat (${atob(titleBC[0])})</a></div>`)
        // Import
        $$("spbsurat_import").config.upload = api + '/spbsurat_import/' + parentID
        $$("spbsurat_import").config.urlData = {
            'type': 'append'
        }
        $$("spbsurat_import").attachEvent("onFileUpload", function(file, response) {
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
                    grid.parse(dataspbsurat(grid, parentID))
                    webix.message({
                        type: "success",
                        text: "Data has imported"
                    })
                }
            }
        })
        // Action Permission
        let dataPermission = webix.storage.local.get("currentActPerm")
        if (dataPermission['spbsurat']['addBtn'] == 1) {
            $$("addBtn").show()
        } else {
            $$("addBtn").hide()
        }
        if (dataPermission['spbsurat']['delete'] == 1) {
            $$("deleteBtn").show()
        } else {
            $$("deleteBtn").hide()
        }
        if (dataPermission['spbsurat']['importBtn'] == 1) {
            $$("spbsurat_import").show()
        } else {
            $$("spbsurat_import").hide()
        }
        if (dataPermission['spbsurat']['exportBtn'] == 1) {
            $$("exportBtn").show()
        } else {
            $$("exportBtn").hide()
        }
        $$("addBtn").attachEvent("onItemClick", function(id, e, trg) {
            let form = $$('spbsurat-form')
            form.clear()
            $$('spbsurat-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n2'>Add</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spbsurat-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spbsurat-win'));
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
                click: "$$('spbsurat-form').clear(); $$('spbsurat-form').clearValidation(); $$('spbsurat-win').hide();"
            }], $$('spbsurat-toolbar'))
            form.elements.laporan.setValue(parentID)
        })
        $$("deleteBtn").attachEvent("onItemClick", function(id, e, trg) {
            let delID = []
            let lampiran = [];
            grid.eachRow(function(id) {
                if (this.getItem(id).ch1 == 'on') {
                    delID.push(id)
                    if (this.getItem(id).lampiran != '') {
                        this.getItem(id).lampiran.forEach(fileEle => {
                            lampiran.push(fileEle.name);
                        })
                    }
                }
            })
            if (delID.length != 0) {
                webix.confirm({
                    text: "Data will be deleted. <br/> are you sure?",
                    ok: "Yes",
                    cancel: "No",
                    callback: function(res) {
                        if (res) {
                            webix.ajax().del(api + "/spbsurat/" + parentID, {
                                id: delID,
                                lampiran: lampiran
                            }).then(function(data) {
                                let response = data.json()
                                grid.clearAll()
                                grid.parse(dataspbsurat(grid, parentID))
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
                filename: "spbsuratexport",
                name: "spbsurat",
                columns: {
                    "nomor": {
                        "header": "Nomor LP"
                    },
                    "tanggal": {
                        "header": "Tanggal"
                    },
                    "nomorSurat": {
                        "header": "Nomor surat"
                    },
                    "jenisSuratNama": {
                        "header": "Jenis surat"
                    }
                }
            });
        })
        $$("refreshBtn").attachEvent("onItemClick", function(id, e, trg) {
            grid.clearAll()
            grid.parse(dataspbsurat(grid, parentID))
        })
        $$("backBtn").attachEvent("onItemClick", function(id, e, trg) {
            webix.storage.local.put("spbsuratState_" + parentID, grid.getState())
            history.back()
        })
        grid.on_click['mdi-pencil'] = function(e, id, node) {
            let form = $$('spbsurat-form')
            let item = grid.getItem(id)
            $$('spbsurat-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n5'>Update</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spbsurat-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spbsurat-win'));
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
                click: "$$('spbsurat-form').clear(); $$('spbsurat-form').clearValidation(); $$('spbsurat-win').hide(); $$('spbsuratData').unselect();"
            }], $$('spbsurat-toolbar'))
            form.setValues(item)
            localStorage.setItem("spbsurat-lampiran", JSON.stringify(Array()));
            let filelampiranArr = [];
            let filelampiran = item.lampiran;
            filelampiran.forEach(element => {
                filelampiranArr.push({
                    "name": element['name'],
                    "status": "server",
                    "sizetext": element.sizetext
                });
            });
            $$("spbsurat-form").elements["lampiran"].files.clearAll();
            $$("spbsurat-form").elements["lampiran"].files.parse(filelampiranArr);
        }
        grid.on_click['mdi-trash-can-outline'] = function(e, id, node) {
            webix.confirm({
                text: "Data will be deleted. <br/> are you sure?",
                ok: "Ya",
                cancel: "Batal",
                callback: function(res) {
                    if (res) {
                        let item = grid.getItem(id)
                        let delID = []
                        let lampiran = [];
                        delID.push(item.id)
                        if (item.lampiran != '') {
                            item.lampiran.forEach(fileEle => {
                                lampiran.push(fileEle.name);
                            })
                        }
                        webix.ajax().del(api + "/spbsurat/" + parentID, {
                            id: delID,
                            lampiran: lampiran
                        }).then(function(data) {
                            let response = data.json()
                            grid.clearAll()
                            grid.parse(dataspbsurat(grid, parentID))
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
            window.open(`http://103.85.13.5/${api}/spbsurat_printdocument/${item['id']}`)
        }
        grid.on_click['mdi-dots-vertical'] = function(e, id, node) {
            let item = grid.getItem(id)
            this.$scope.ui({
                view: "submenu",
                id: "spbsuratGridPopUp",
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
                            let titleBC = JSON.parse(localStorage.getItem("breadCumb"))
                            if (titleBC[1] == undefined) {
                                titleBC.push(this.getMenuItem(id).parent_title)
                            } else {
                                titleBC[1] = this.getMenuItem(id).parent_title
                            }
                            localStorage.setItem("breadCumb", JSON.stringify(titleBC))
                            webix.storage.local.put("spbsuratState", grid.getState())
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
    id: "spbsurat_import",
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
        id: "spbsuratData",
        view: "datatable",
        select: true,
        tooltip: true,
        scheme: {
            $init: function(obj) {
                obj.jenisSuratNama = obj.jenisSurat_docs[0] == undefined ? '' : obj.jenisSurat_docs[0].jenis;
            }
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
            "id": "nomorSurat",
            "header": ["Nomor surat", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 1,
            "width": 0,
            "template": ""
        }, {
            "id": "jenisSuratNama",
            "header": ["Jenis surat", {
                "content": "selectFilter"
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