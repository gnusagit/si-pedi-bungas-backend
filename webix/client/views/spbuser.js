import {
    JetView
} from "webix-jet"
import spbuserForm from "views/forms/spbuser"
import {
    dataspbuser
} from "models/spbuser"
export default class spbuserView extends JetView {
    config() {
        return layout
    }
    urlChange(view, url) {
        let api = this.app.config.api
        webix.ajax().post(api + "/auth/rolemenu/", {
            menucode: '5f3216b7b53fc4001193e370'
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
        let statePrimary = webix.storage.local.get("spbuserState") == null ? grid.getState() : webix.storage.local.get("spbuserState")
        let stateTmp = grid.getState()
        if (statePrimary) {
            let dataPermission = webix.storage.local.get("currentActPerm")
            Object.keys(dataPermission['spbuser']).forEach((key, index) => {
                if (key == 'edit' || key == 'delete' || key == 'printdoc' || key == 'otherLink') {
                    if (dataPermission['spbuser'][key] == 1) {
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
            grid.parse(dataspbuser(grid)).then(initState => {
                grid.setState(statePrimary)
            })
            webix.storage.local.put("spbuserState", statePrimary)
        }
        // Load form and title bar
        this._form = this.ui(spbuserForm)
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1'>Pengguna (Daftar pengguna)</a></div>`)
        // Import
        $$("spbuser_import").config.upload = api + '/spbuser_import/'
        $$("spbuser_import").config.urlData = {
            'type': 'append'
        }
        $$("spbuser_import").attachEvent("onFileUpload", function(file, response) {
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
                    grid.parse(dataspbuser(grid))
                    webix.message({
                        type: "success",
                        text: "Data has imported"
                    })
                }
            }
        })
        // Action Permission
        let dataPermission = webix.storage.local.get("currentActPerm")
        if (dataPermission['spbuser']['addBtn'] == 1) {
            $$("addBtn").show()
        } else {
            $$("addBtn").hide()
        }
        if (dataPermission['spbuser']['delete'] == 1) {
            $$("deleteBtn").show()
        } else {
            $$("deleteBtn").hide()
        }
        if (dataPermission['spbuser']['importBtn'] == 1) {
            $$("spbuser_import").show()
        } else {
            $$("spbuser_import").hide()
        }
        if (dataPermission['spbuser']['exportBtn'] == 1) {
            $$("exportBtn").show()
        } else {
            $$("exportBtn").hide()
        }
        $$("addBtn").attachEvent("onItemClick", function(id, e, trg) {
            let form = $$('spbuser-form')
            form.clear()
            $$('spbuser-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n2'>Add</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spbuser-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spbuser-win'));
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
                click: "$$('spbuser-form').clear(); $$('spbuser-form').clearValidation(); $$('spbuser-win').hide();"
            }], $$('spbuser-toolbar'))
            // Change Password
            form.elements.changePassword.hide()
            // Password manually
            form.elements.passwordManual.enable()
            form.elements.passwordManual.show()
            form.elements.password.disable()
            form.elements.password.hide()
            form.elements.re_password.disable()
            form.elements.re_password.hide()
            // Generate password auto
            $$("passwordAutoContainer").show()
            let randomstring = Math.random().toString(36).slice(-8);
            form.elements.password_auto.setValue(randomstring)
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
                            webix.ajax().del(api + "/spbuser/", {
                                id: delID
                            }).then(function(data) {
                                let response = data.json()
                                grid.clearAll()
                                grid.parse(dataspbuser(grid))
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
                filename: "spbuserexport",
                name: "spbuser",
                columns: {
                    "idAkses": {
                        "header": "Username"
                    },
                    "namaDisplay": {
                        "header": "Nama"
                    }
                }
            })
        })
        $$("refreshBtn").attachEvent("onItemClick", function(id, e, trg) {
            grid.clearAll()
            grid.parse(dataspbuser(grid))
        })
        grid.on_click['mdi-pencil'] = function(e, id, node) {
            let form = $$('spbuser-form')
            let item = grid.getItem(id)
            $$('spbuser-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n5'>Update</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spbuser-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spbuser-win'));
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
                click: "$$('spbuser-form').clear(); $$('spbuser-form').clearValidation(); $$('spbuser-win').hide(); $$('spbuserData').unselect();"
            }], $$('spbuser-toolbar'))
            form.setValues(item)
            // Change Password
            form.elements.changePassword.show()
            // Disable Password
            form.elements.passwordManual.disable()
            form.elements.passwordManual.hide()
            form.elements.password.disable()
            form.elements.password.hide()
            form.elements.re_password.disable()
            form.elements.re_password.hide()
            // Generate password auto
            $$("passwordAutoContainer").hide()
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
                        webix.ajax().del(api + "/spbuser/", {
                            id: delID
                        }).then(function(data) {
                            let response = data.json()
                            grid.clearAll()
                            grid.parse(dataspbuser(grid))
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
            window.open(`http://103.85.13.5/${api}/spbuser_printdocument/${item['id']}`)
        }
        grid.on_click['mdi-dots-vertical'] = function(e, id, node) {
            let item = grid.getItem(id)
            this.$scope.ui({
                view: "submenu",
                id: "spbuserGridPopUp",
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
                            webix.storage.local.put("spbuserState", grid.getState())
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
    id: "spbuser_import",
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
        id: "spbuserData",
        view: "datatable",
        select: true,
        tooltip: true,
        scheme: {
            $init: function(obj) {
                obj.groupName = obj.group_docs[0] == undefined ? '' : obj.group_docs[0].usergroup;
                obj.groupColor = obj.group_docs[0] == undefined ? '' : obj.group_docs[0].color;
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
            "id": "idAkses",
            "header": ["Username", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 1,
            "width": 0,
            "template": ""
        }, {
            "id": "namaDisplay",
            "header": ["Nama", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 1,
            "width": 0,
            "template": ""
        }, {
            "id": "usergroup",
            "header": ["Group", {
                "content": "textFilter"
            }],
            "sort": "text",
            "adjust": "data",
            "template": "<span class='status' style='background-color:#groupColor#'>#groupName#</span>"
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