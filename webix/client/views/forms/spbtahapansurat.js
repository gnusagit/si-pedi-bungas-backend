import {
    JetView
} from "webix-jet"
import {
    dataspbtahapansurat
} from "models/spbtahapansurat"
export default class spbtahapansuratForm extends JetView {
    init(view) {
        this._api = this.app.config.api;
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "spbtahapansurat-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "spbtahapansurat-toolbar",
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
                    id: "spbtahapansurat-form",
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
                                "name": "tahanapan",
                                "required": true,
                                "tooltip": "Tahapan",
                                "label": "Tahapan",
                                "type": "text"
                            }]
                        }]
                    }],
                    rules: {
                        $obj: function(data) {
                            let startVal = 0
                            if (!data.tahanapan) {
                                $$('spbtahapansurat-form').markInvalid('tahanapan', 'Tahapan must be filled');
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
                            let form = $$("spbtahapansurat-form")
                            let api = this.$scope._api
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("spbtahapansuratData")
                                if (values.id != '') {
                                    webix.ajax().put(api + "/spbtahapansurat/", values).then(function(data) {
                                        let response = data.json()
                                        $$("spbtahapansurat-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbtahapansurat(grid))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                } else {
                                    webix.ajax().post(api + "/spbtahapansurat/", values).then(function(data) {
                                        let response = data.json()
                                        $$("spbtahapansurat-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbtahapansurat(grid))
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
                            $$("spbtahapansurat-form").clear()
                            $$("spbtahapansurat-form").clearValidation()
                            $$("spbtahapansurat-win").hide()
                            $$("spbtahapansuratData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}