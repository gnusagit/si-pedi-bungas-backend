import {
    JetView
} from "webix-jet"
import spbsatkerForm from "views/forms/spbsatker"
import {
    dataspbsatker
} from "models/spbsatker"
export default class spbsatkerView extends JetView {
    config() {
        return layout
    }
    urlChange(view, url) {
        let api = this.app.config.api
        webix.ajax().post(api + "/auth/rolemenu/", {
            menucode: '5f3219f5b53fc4001193e378'
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
            view: "treetable"
        })
        // Set State
        webix.attachEvent('unload', function() {
            webix.storage.local.put("appMenu", $$("app:menu").getState())
        })
        // Load last state
        let statePrimary = webix.storage.local.get("spbsatkerState") == null ? grid.getState() : webix.storage.local.get("spbsatkerState")
        let stateTmp = grid.getState()
        if (statePrimary) {
            let dataPermission = webix.storage.local.get("currentActPerm")
            Object.keys(dataPermission['spbsatker']).forEach((key, index) => {
                if (key == 'edit' || key == 'delete' || key == 'printdoc' || key == 'otherLink') {
                    if (dataPermission['spbsatker'][key] == 1) {
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
            grid.parse(dataspbsatker(grid)).then(initState => {
                grid.setState(statePrimary)
            })
            webix.storage.local.put("spbsatkerState", statePrimary)
        }
        // Load form and title bar
        this._form = this.ui(spbsatkerForm)
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1'>Satker & Satwil (Daftar Satker & Satwil)</a></div>`);
        // Import
        $$("spbsatker_import").config.upload = api + '/spbsatker_import/'
        $$("spbsatker_import").config.urlData = {
            'type': 'append'
        }
        $$("spbsatker_import").attachEvent("onFileUpload", function(file, response) {
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
                    grid.parse(dataspbsatker(grid))
                    webix.message({
                        type: "success",
                        text: "Data has imported"
                    })
                }
            }
        })
        // Action Permission
        let dataPermission = webix.storage.local.get("currentActPerm")
        if (dataPermission['spbsatker']['addBtn'] == 1) {
            $$("addBtn").show()
        } else {
            $$("addBtn").hide()
        }
        if (dataPermission['spbsatker']['delete'] == 1) {
            $$("deleteBtn").show()
        } else {
            $$("deleteBtn").hide()
        }
        if (dataPermission['spbsatker']['importBtn'] == 1) {
            $$("spbsatker_import").show()
        } else {
            $$("spbsatker_import").hide()
        }
        if (dataPermission['spbsatker']['exportBtn'] == 1) {
            $$("exportBtn").show()
        } else {
            $$("exportBtn").hide()
        }
        $$("addBtn").attachEvent("onItemClick", function(id, e, trg) {
            let countParent = []
            let form = $$('spbsatker-form')
            form.clear()
            $$('spbsatker-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n2'>Add</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spbsatker-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spbsatker-win'));
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
                click: "$$('spbsatker-form').clear(); $$('spbsatker-form').clearValidation(); $$('spbsatker-win').hide();"
            }], $$('spbsatker-toolbar'))
            grid.eachRow(function(row) {
                if (grid.getItem(row).ortu == '') {
                    countParent.push(grid.getItem(row).id)
                }
            })
            form.elements.treecode.setValue(`spbsatker-${grid.count()+1}`);
            form.elements.sortitem.setValue(countParent.length + 1);
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
                            webix.ajax().del(api + "/spbsatker/", {
                                id: delID
                            }).then(function(data) {
                                let response = data.json()
                                grid.clearAll()
                                grid.parse(dataspbsatker(grid))
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
                filename: "spbsatkerexport",
                name: "spbsatker",
                columns: {
                    "nama": {
                        "header": "Nama Satker"
                    },
                    "tipe": {
                        "header": "Tipe"
                    }
                }
            });
        })
        $$("refreshBtn").attachEvent("onItemClick", function(id, e, trg) {
            grid.clearAll()
            grid.parse(dataspbsatker(grid))
        })
        grid.attachEvent("onCheck", function(row, column, state) {
            let treecode = this.getItem(row).treecode

            function recursiveTree(idd) {
                grid.eachRow(function(id) {
                    if (this.getItem(id).ortu == idd) {
                        grid.getItem(id)[column] = state
                        recursiveTree(grid.getItem(id).treecode)
                    }
                })
            }
            recursiveTree(treecode)
            grid.refresh();
        })
        grid.attachEvent("onBeforeDrop", function(context) {
            let values = {}
            let item
            let dataPermission = webix.storage.local.get("currentActPerm")
            if (dataPermission['spbsatker']['dragndrop'] == 1) {
                //accept only dnd on data area
                if (!context.target || !this.getItem(context.target)) return false;
                if (this.getItem(context.target).$count && this.getItem(context.target).open) {
                    //drop as first child
                    context.parent = context.target;
                    context.index = 0;
                } else {
                    //drop next
                    context.index++;
                }
                if (context.target == null) {
                    item = grid.getItem(context.parent.row);
                } else {
                    item = grid.getItem(context.target.row);
                }
                let countParent = []
                grid.eachRow(function(row) {
                    if (grid.getItem(row).ortu == '') {
                        countParent.push(grid.getItem(row).id)
                    }
                })
                values.id = context.start
                values.sortitem = item.treecode == this.getItem(context.start).treecode ? this.getItem(context.start).ortu == '' ? this.getItem(context.start).sortitem : countParent.length + 1 : (this.getItem(context.target).$count) + 1
                values.ortu = item.treecode == this.getItem(context.start).treecode ? '' : item.treecode
                values.drag = 'yes'
                webix.ajax().put(api + "/spbsatker/", values).then(function(data) {
                    let response = data.json()
                    $$("spbsatker-win").hide()
                    webix.message({
                        type: response.type,
                        text: response.message
                    })
                    grid.clearAll()
                    grid.parse(dataspbsatker(grid))
                }).fail(err => {
                    let response = JSON.parse(err.response)
                    webix.message({
                        type: response['type'],
                        text: response['message']
                    })
                })
            } else {
                return false
            }
        })
        grid.attachEvent("onItemDblClick", function(id, node, e) {
            let form = $$('spbsatker-form')
            let winadd = $$('spbsatker-win');
            let item = grid.getItem(id.row);
            let dataPermission = webix.storage.local.get("currentActPerm")
            if (dataPermission['spbsatker']['doubleclick'] == 1) {
                winadd.show();
                webix.ui([{
                    view: "label",
                    label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n2'>Add</a></div>"
                }, {
                    view: "icon",
                    icon: "mdi mdi-fullscreen",
                    tooltip: "Enable fullscreen mode",
                    click: function() {
                        if ($$('spbsatker-win').config.fullscreen) {
                            webix.fullscreen.exit();
                            this.define({
                                icon: "mdi mdi-fullscreen",
                                tooltip: "Enable fullscreen mode"
                            });
                        } else {
                            webix.fullscreen.set($$('spbsatker-win'));
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
                    click: "$$('spbsatker-form').clear(); $$('spbsatker-form').clearValidation(); $$('spbsatker-win').hide();"
                }], $$('spbsatker-toolbar'));
                form.clear()
                form.elements.sortitem.setValue((item.$count + 1));
                form.elements.treecode.setValue(`${item.treecode}.${item.$count+1}`);
                form.elements.ortu.setValue(item.treecode);
            }
        })
        grid.on_click['mdi-pencil'] = function(e, id, node) {
            let form = $$('spbsatker-form')
            let item = grid.getItem(id)
            $$('spbsatker-win').show()
            webix.ui([{
                view: "label",
                label: "<div class='breadcrumb' style='margin-top:6px; line-height:0px'><a class='n4'>Form</a><a class='n5'>Update</a></div>"
            }, {
                view: "icon",
                icon: "mdi mdi-fullscreen",
                tooltip: "Enable fullscreen mode",
                click: function() {
                    if ($$('spbsatker-win').config.fullscreen) {
                        webix.fullscreen.exit();
                        this.define({
                            icon: "mdi mdi-fullscreen",
                            tooltip: "Enable fullscreen mode"
                        });
                    } else {
                        webix.fullscreen.set($$('spbsatker-win'));
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
                click: "$$('spbsatker-form').clear(); $$('spbsatker-form').clearValidation(); $$('spbsatker-win').hide(); $$('spbsatkerData').unselect();"
            }], $$('spbsatker-toolbar'))
            form.setValues(item)
        }
        grid.on_click['mdi-printer'] = function(e, id, node) {
            let item = grid.getItem(id)
            window.open(`http://103.85.13.5/${api}/spbsatker_printdocument/${item['id']}`)
        }
        grid.on_click['mdi-dots-vertical'] = function(e, id, node) {
            let item = grid.getItem(id)
            this.$scope.ui({
                view: "submenu",
                id: "spbsatkerGridPopUp",
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
                            webix.storage.local.put("spbsatkerState", grid.getState())
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
    id: "spbsatker_import",
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
    label: "Refresh"
}, {}]
const grid = {
    margin: 10,
    rows: [{
        id: "spbsatkerData",
        view: "treetable",
        select: true,
        tooltip: true,
        drag: true,
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
            "id": "nama",
            "header": ["Nama Satker", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 1,
            "width": 0,
            "template": "{common.treetable()} #nama#"
        }, {
            "id": "tipe",
            "header": ["Tipe", {
                "content": "textFilter"
            }],
            "sort": "",
            "fillspace": 1,
            "width": 0
        }, {
            id: "edit",
            header: "&nbsp;",
            width: 35,
            hidden: false,
            tooltip: "Edit",
            template: "<span style='cursor:pointer;' class='mdi mdi-pencil'></span>"
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