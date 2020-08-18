import {
    JetView
} from "webix-jet"
import {
    dataspblaporan
} from "models/spblaporan"
export default class spblaporanForm extends JetView {
    init(view) {
        this._api = this.app.config.api;
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "spblaporan-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "spblaporan-toolbar",
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
                    id: "spblaporan-form",
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
                                "name": "nomor",
                                "required": true,
                                "tooltip": "Nomor LP",
                                "label": "Nomor LP",
                                "type": "text"
                            }]
                        }]
                    }, {
                        "margin": 10,
                        "cols": [{
                            "margin": 10,
                            "rows": [{
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
                            if (!data.nomor) {
                                $$('spblaporan-form').markInvalid('nomor', 'Nomor LP must be filled');
                                startVal = 1;
                            }
                            if (!data.tanggal) {
                                $$('spblaporan-form').markInvalid('tanggal', 'Tanggal must be filled');
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
                            let form = $$("spblaporan-form")
                            let api = this.$scope._api
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("spblaporanData")
                                if (values.id != '') {
                                    webix.ajax().put(api + "/spblaporan/", values).then(function(data) {
                                        let response = data.json()
                                        $$("spblaporan-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspblaporan(grid))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                } else {
                                    webix.ajax().post(api + "/spblaporan/", values).then(function(data) {
                                        let response = data.json()
                                        $$("spblaporan-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspblaporan(grid))
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
                            $$("spblaporan-form").clear()
                            $$("spblaporan-form").clearValidation()
                            $$("spblaporan-win").hide()
                            $$("spblaporanData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}