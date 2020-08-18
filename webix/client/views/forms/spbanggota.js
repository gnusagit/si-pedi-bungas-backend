import {
    JetView
} from "webix-jet"
import {
    dataspbanggota
} from "models/spbanggota"
export default class spbanggotaForm extends JetView {
    init(view) {
        this._api = this.app.config.api;
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "spbanggota-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "spbanggota-toolbar",
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
                    id: "spbanggota-form",
                    width: 350,
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
                                "name": "nama_anggota",
                                "required": true,
                                "tooltip": "Nama",
                                "label": "Nama",
                                "type": "text"
                            }, {
                                "view": "text",
                                "name": "firebaseid",
                                "required": false,
                                "tooltip": "Firebase",
                                "hidden": true,
                                "label": "Firebase",
                                "type": "text"
                            }, {
                                "view": "text",
                                "name": "imei",
                                "required": false,
                                "tooltip": "Imei",
                                "hidden": true,
                                "label": "Imei",
                                "type": "text"
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "text",
                                "name": "pangkat",
                                "required": true,
                                "tooltip": "Pangkat",
                                "label": "Pangkat",
                                "type": "text"
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "text",
                                "name": "nrp",
                                "required": true,
                                "tooltip": "NRP",
                                "label": "NRP",
                                "type": ""
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "text",
                                "name": "telepon",
                                "required": false,
                                "tooltip": "Telepon",
                                "label": "Telepon",
                                "type": "text"
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "text",
                                "name": "email",
                                "required": false,
                                "tooltip": "Email",
                                "label": "Email",
                                "type": "email"
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "combo",
                                "name": "satker",
                                "required": false,
                                "tooltip": "Satker",
                                "label": "Satker",
                                "suggest": {
                                    "body": {
                                        "view": "tree",
                                        "select": true,
                                        "url": "si-pedi-bungas-server/spbsatker/"
                                    }
                                }
                            }]
                        }]
                    }],
                    rules: {
                        $obj: function(data) {
                            let startVal = 0
                            if (!data.nama_anggota) {
                                $$('spbanggota-form').markInvalid('nama_anggota', 'Nama must be filled');
                                startVal = 1;
                            }
                            if (!data.pangkat) {
                                $$('spbanggota-form').markInvalid('pangkat', 'Pangkat must be filled');
                                startVal = 1;
                            }
                            if (!data.nrp) {
                                $$('spbanggota-form').markInvalid('nrp', 'NRP must be filled');
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
                            let form = $$("spbanggota-form")
                            let api = this.$scope._api
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("spbanggotaData")
                                if (values.id != '') {
                                    webix.ajax().put(api + "/spbanggota/", values).then(function(data) {
                                        let response = data.json()
                                        $$("spbanggota-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbanggota(grid))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                } else {
                                    webix.ajax().post(api + "/spbanggota/", values).then(function(data) {
                                        let response = data.json()
                                        $$("spbanggota-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbanggota(grid))
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
                            $$("spbanggota-form").clear()
                            $$("spbanggota-form").clearValidation()
                            $$("spbanggota-win").hide()
                            $$("spbanggotaData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}