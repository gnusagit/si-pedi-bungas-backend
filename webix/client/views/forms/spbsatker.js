import {
    JetView
} from "webix-jet"
import {
    dataspbsatker
} from "models/spbsatker"
export default class spbsatkerForm extends JetView {
    init(view) {
        this._api = this.app.config.api;
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "spbsatker-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "spbsatker-toolbar",
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
                    id: "spbsatker-form",
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
                                "name": "nama",
                                "required": true,
                                "tooltip": "Nama Satker",
                                "label": "Nama Satker",
                                "type": "text"
                            }, {
                                "view": "text",
                                "name": "treecode",
                                "hidden": true
                            }, {
                                "view": "text",
                                "name": "sortitem",
                                "hidden": true
                            }, {
                                "view": "text",
                                "name": "ortu",
                                "hidden": true
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "text",
                                "name": "label",
                                "required": false,
                                "tooltip": "Label",
                                "label": "Label",
                                "type": "text"
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
                                "view": "combo",
                                "name": "tipe",
                                "required": false,
                                "tooltip": "Tipe",
                                "label": "Tipe",
                                "options": ["Satuan Kerja", "Satuan Wilayah"]
                            }]
                        }]
                    }],
                    rules: {
                        $obj: function(data) {
                            let startVal = 0
                            if (!data.nama) {
                                $$('spbsatker-form').markInvalid('nama', 'Nama Satker must be filled');
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
                            let form = $$("spbsatker-form")
                            let api = this.$scope._api
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("spbsatkerData")
                                if (values.id != '') {
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
                                    webix.ajax().post(api + "/spbsatker/", values).then(function(data) {
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
                            $$("spbsatker-form").clear()
                            $$("spbsatker-form").clearValidation()
                            $$("spbsatker-win").hide()
                            $$("spbsatkerData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}