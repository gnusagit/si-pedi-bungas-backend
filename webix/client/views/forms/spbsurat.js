import {
    JetView
} from "webix-jet"
import {
    dataspbsurat
} from "models/spbsurat"
export default class spbsuratForm extends JetView {
    init(view) {
        this._api = this.app.config.api;
        this._parentID = this.getParam('parentID', true);
        $$("spbsurat-form").elements["lampiran"].files.attachEvent("onBeforeDelete", function(id, e) {
            let objFile = $$("spbsurat-form").elements["lampiran"].files.getItem(id);
            let listObj = JSON.parse(localStorage.getItem("spbsurat-lampiran"));
            if (objFile['status'] == 'server') {
                listObj.push(objFile['name']);
            }
            localStorage.setItem("spbsurat-lampiran", JSON.stringify(listObj));
        });
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "spbsurat-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "spbsurat-toolbar",
                height: 50,
                cols: []
            },
            position: "center",
            body: {
                rows: [{
                    view: "form",
                    elementsConfig: {
                        labelPosition: 'top'
                    },
                    id: "spbsurat-form",
                    width: 500,
                    elements: [{
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "text",
                                "name": "id",
                                "hidden": true
                            }, {
                                "view": "text",
                                "name": "laporan",
                                "hidden": true
                            }, {
                                "view": "datepicker",
                                "name": "tanggal",
                                "required": true,
                                "tooltip": "Tanggal",
                                "label": "Tanggal",
                                "format": "%d/%m/%Y",
                                "timepicker": false,
                                "multiselect": false,
                                "stringResult": true
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "combo",
                                "name": "laporan",
                                "required": false,
                                "tooltip": "Nomor laporan polisi",
                                "hidden": true,
                                "label": "Nomor laporan polisi",
                                "options": [""]
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "text",
                                "name": "nomorSurat",
                                "required": true,
                                "tooltip": "Nomor surat",
                                "label": "Nomor surat",
                                "type": "text"
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "cols": [{
                                    "view": "combo",
                                    "name": "jenisSurat",
                                    "required": true,
                                    "tooltip": "Jenis surat",
                                    "label": "Jenis surat",
                                    "suggest": {
                                        "filter": function(item, value) {
                                            if (item.jenis.toLowerCase().indexOf(value) !== -1) {
                                                return true;
                                            }
                                            return false;
                                        },
                                        "body": {
                                            "view": "list",
                                            "yCount": 5,
                                            "select": true,
                                            "template": function(obj) {
                                                return '<div class=webix_strong>' + [obj.jenis].filter(Boolean).join(' ') + '</div>';
                                            },
                                            "url": "si-pedi-bungas-server/spbjenissurat/"
                                        },
                                        "fitMaster": true
                                    }
                                }, {
                                    "view": "icon",
                                    "icon": "mdi mdi-plus",
                                    "tooltip": "Add New Jenis surat",
                                    "css": {
                                        "position": "relative",
                                        "top": "10px"
                                    },
                                    "click": function(e, id, node) {
                                        this.$scope.ui({
                                            view: "window",
                                            head: {
                                                view: "toolbar",
                                                css: "header",
                                                height: 50,
                                                cols: [{
                                                    view: "label",
                                                    css: {
                                                        "padding-left": "8px"
                                                    },
                                                    label: "Add New Jenis surat"
                                                }, {
                                                    view: "icon",
                                                    icon: "mdi mdi-close-circle",
                                                    css: "alter",
                                                    click: function(a, b, c) {
                                                        this.getTopParentView().hide();
                                                    }
                                                }]
                                            },
                                            move: false,
                                            modal: true,
                                            body: {
                                                rows: [{
                                                    view: "form",
                                                    elements: [{
                                                        view: "text",
                                                        name: "jenis",
                                                        placeholder: "Fill in here...",
                                                        required: true
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
                                                            let form = this.getTopParentView().queryView({
                                                                view: 'form'
                                                            });
                                                            let value = form.getValues();
                                                            if (form.validate()) {
                                                                webix.ajax().post("si-pedi-bungas-server/spbjenissurat/", value).then(function(data) {
                                                                    let response = data.json();
                                                                    webix.message({
                                                                        type: response.type,
                                                                        text: response.message
                                                                    });
                                                                    $$("spbsurat-form").elements["jenisSurat"].getList().clearAll();
                                                                    $$("spbsurat-form").elements["jenisSurat"].getList().load("si-pedi-bungas-server/spbjenissurat/");
                                                                    form.clear();
                                                                    form.clearValidation();
                                                                }).fail(err => {
                                                                    webix.message({
                                                                        type: 'error',
                                                                        text: 'Connection error'
                                                                    });
                                                                });
                                                            }
                                                        }
                                                    }]
                                                }]
                                            }
                                        }).show(id);
                                    }
                                }]
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "list",
                                "id": "lampiranList",
                                "type": "uploader",
                                "autoheight": true,
                                "borderless": true,
                                "on": {
                                    "onItemClick": function(id, e, node) {
                                        let api = this.$scope._api;
                                        let name = this.getItem(id).name;
                                        webix.ajax().get(api + '/spbsurat_presignedobject/', {
                                            objectname: name,
                                            document: 'lampiran'
                                        }).then(function(data) {
                                            let response = data.json();
                                            if (response.status == 0) {
                                                webix.message({
                                                    type: 'error',
                                                    text: response.message
                                                });
                                                return false
                                            }
                                            window.open(response.message)
                                        }).fail(function(xhr) {
                                            webix.message({
                                                type: 'error',
                                                text: 'Connection error'
                                            });
                                        });
                                    }
                                }
                            }, {
                                "view": "uploader",
                                "name": "lampiran",
                                "required": false,
                                "tooltip": "Lampiran",
                                "label": "Lampiran",
                                "autosend": false,
                                "multiple": true,
                                "value": "Upload File",
                                "link": "lampiranList",
                                "id": "lampiran",
                                "css": "webix_primary",
                                "upload": "si-pedi-bungas-server/spbsurat_upload/",
                                "urlData": {
                                    "document": "lampiran",
                                    "policy": "public",
                                    "compress": false
                                },
                                "on": {
                                    "onBeforeFileAdd": function(file) {
                                        if (this.files.count() >= 5) {
                                            webix.message({
                                                'type': 'debug',
                                                'text': '5 files upload at a time'
                                            });
                                            return false;
                                        }
                                        if (file.size && file.size > 15000000) {
                                            webix.message({
                                                'type': 'debug',
                                                'text': 'Max size 15.00mb'
                                            });
                                            return false;
                                        }
                                    }
                                }
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "textarea",
                                "name": "uraian",
                                "required": false,
                                "tooltip": "Uraian",
                                "label": "Uraian",
                                "height": 150
                            }]
                        }]
                    }],
                    rules: {
                        $obj: function(data) {
                            let startVal = 0
                            if (!data.tanggal) {
                                $$('spbsurat-form').markInvalid('tanggal', 'Tanggal must be filled');
                                startVal = 1;
                            }
                            if (!data.nomorSurat) {
                                $$('spbsurat-form').markInvalid('nomorSurat', 'Nomor surat must be filled');
                                startVal = 1;
                            }
                            if (!data.jenisSurat) {
                                $$('spbsurat-form').markInvalid('jenisSurat', 'Jenis surat must be filled');
                                startVal = 1;
                            }
                            if (startVal == 1) {
                                return false
                            } else {
                                return true
                            }
                        }
                    }
                }, {
                    view: "toolbar",
                    padding: 5,
                    css: 'grey_color',
                    elements: [{}, {
                        view: "button",
                        label: "Save",
                        type: 'icon',
                        css: 'webix_primary',
                        icon: 'mdi mdi-check',
                        align: "center",
                        width: 120,
                        click: function() {
                            let form = $$("spbsurat-form")
                            let api = this.$scope._api
                            let parentID = this.$scope._parentID
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("spbsuratData")
                                form.elements["lampiran"].send();
                                if (values.id != '') {
                                    let lampiranArr = [];
                                    $$("spbsurat-form").elements["lampiran"].files.data.each(function(obj, index) {
                                        lampiranArr.push({
                                            'name': obj.name,
                                            'sizetext': obj.sizetext
                                        })
                                    });
                                    values.lampiran = lampiranArr;
                                    let parseDellampiran = JSON.parse(localStorage.getItem("spbsurat-lampiran"));
                                    if (parseDellampiran.length != 0) {
                                        webix.ajax().post(api + "/spbsurat_remove_file/", {
                                            "documentName": "lampiran",
                                            "objName": parseDellampiran
                                        }).then(function(data) {
                                            let response = data.json();
                                            webix.message({
                                                type: response.type,
                                                text: response.message
                                            });
                                        }).fail(err => {
                                            webix.message({
                                                type: 'error',
                                                text: 'Connection error'
                                            });
                                        });
                                    }
                                    webix.ajax().put(api + "/spbsurat/" + parentID, values).then(function(data) {
                                        let response = data.json()
                                        $$("spbsurat-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbsurat(grid, parentID))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                } else {
                                    let lampiranArr = [];
                                    $$("spbsurat-form").elements["lampiran"].files.data.each(function(obj, index) {
                                        lampiranArr.push({
                                            'name': obj.name,
                                            'sizetext': obj.sizetext
                                        });
                                    });
                                    values.lampiran = lampiranArr;
                                    webix.ajax().post(api + "/spbsurat/" + parentID, values).then(function(data) {
                                        let response = data.json()
                                        $$("spbsurat-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbsurat(grid, parentID))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                }
                            }
                        }
                    }, {
                        view: "button",
                        label: "Cancel",
                        type: 'icon',
                        css: 'webix_danger',
                        icon: 'mdi mdi-cancel',
                        align: "center",
                        width: 120,
                        click: function() {
                            $$("spbsurat-form").clear()
                            $$("spbsurat-form").clearValidation()
                            $$("spbsurat-win").hide()
                            $$("spbsuratData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}