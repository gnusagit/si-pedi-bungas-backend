import {
    JetView
} from "webix-jet"
import {
    dataspbjenissurat
} from "models/spbjenissurat"
export default class spbjenissuratForm extends JetView {
    init(view) {
        this._api = this.app.config.api;
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "spbjenissurat-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "spbjenissurat-toolbar",
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
                    id: "spbjenissurat-form",
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
                                "name": "jenis",
                                "required": true,
                                "tooltip": "Jenis",
                                "label": "Jenis",
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
                                    "name": "tahapanSurat",
                                    "required": true,
                                    "tooltip": "Tahapan surat",
                                    "label": "Tahapan surat",
                                    "suggest": {
                                        "filter": function(item, value) {
                                            if (item.tahanapan.toLowerCase().indexOf(value) !== -1) {
                                                return true;
                                            }
                                            return false;
                                        },
                                        "body": {
                                            "view": "list",
                                            "yCount": 5,
                                            "select": true,
                                            "template": function(obj) {
                                                return '<div class=webix_strong>' + [obj.tahanapan].filter(Boolean).join(' ') + '</div>';
                                            },
                                            "url": "si-pedi-bungas-server/spbtahapansurat/"
                                        },
                                        "fitMaster": true
                                    }
                                }, {
                                    "view": "icon",
                                    "icon": "mdi mdi-plus",
                                    "tooltip": "Add New Tahapan surat",
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
                                                    label: "Add New Tahapan surat"
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
                                                        name: "tahanapan",
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
                                                                webix.ajax().post("si-pedi-bungas-server/spbtahapansurat/", value).then(function(data) {
                                                                    let response = data.json();
                                                                    webix.message({
                                                                        type: response.type,
                                                                        text: response.message
                                                                    });
                                                                    $$("spbjenissurat-form").elements["tahapanSurat"].getList().clearAll();
                                                                    $$("spbjenissurat-form").elements["tahapanSurat"].getList().load("si-pedi-bungas-server/spbtahapansurat/");
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
                            }, {
                                "view": "text",
                                "name": "tahapanSuratNama",
                                "required": false,
                                "tooltip": "Tahapan surat",
                                "hidden": true,
                                "label": "Tahapan surat",
                                "type": "text"
                            }]
                        }]
                    }],
                    rules: {
                        $obj: function(data) {
                            let startVal = 0
                            if (!data.jenis) {
                                $$('spbjenissurat-form').markInvalid('jenis', 'Jenis must be filled');
                                startVal = 1;
                            }
                            if (!data.tahapanSurat) {
                                $$('spbjenissurat-form').markInvalid('tahapanSurat', 'Tahapan surat must be filled');
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
                            let form = $$("spbjenissurat-form")
                            let api = this.$scope._api
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("spbjenissuratData")
                                if (values.id != '') {
                                    webix.ajax().put(api + "/spbjenissurat/", values).then(function(data) {
                                        let response = data.json()
                                        $$("spbjenissurat-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbjenissurat(grid))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                } else {
                                    webix.ajax().post(api + "/spbjenissurat/", values).then(function(data) {
                                        let response = data.json()
                                        $$("spbjenissurat-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbjenissurat(grid))
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
                            $$("spbjenissurat-form").clear()
                            $$("spbjenissurat-form").clearValidation()
                            $$("spbjenissurat-win").hide()
                            $$("spbjenissuratData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}