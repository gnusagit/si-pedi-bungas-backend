import {
    JetView
} from "webix-jet"
import {
    dataapigenerator
} from "models/apigenerator"
export default class apigeneratorForm extends JetView {
    init(view) {
        this._api = this.app.config.api
        let api = this._api
        webix.ajax().post(api + "/apigenerator-packagelist/").then(data => {
            let selOption = []
            data.json().forEach(obj => {
                selOption.push({
                    id: obj.id,
                    value: obj.value
                })
            })
            $$("apigenerator-form").elements["packagename"].define({
                options: selOption
            })
            $$("apigenerator-form").elements["packagename"].refresh()
        }).fail(err => {
            let response = JSON.parse(err.response)
            webix.message({
                type: response['type'],
                text: response['message']
            })
        })
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "apigenerator-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "apigenerator-toolbar",
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
                    id: "apigenerator-form",
                    width: 500,
                    elements: [{
                        "view": "text",
                        "name": "id",
                        "hidden": true
                    }, {
                        "view": "richselect",
                        "name": "packagename",
                        "label": "Package",
                        "options": [],
                        "required": false
                    }, {
                        "view": "text",
                        "name": "description",
                        "required": false,
                        "label": "Description",
                        "tooltip": "Description"
                    }]
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
                            let form = $$("apigenerator-form")
                            let api = this.$scope._api
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("apigeneratorData")
                                if (values.id != '') {
                                    webix.ajax().put(api + "/apigenerator/", values).then(function(data) {
                                        let response = data.json()
                                        $$("apigenerator-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataapigenerator(grid))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                } else {
                                    webix.ajax().post(api + "/apigenerator/", values).then(function(data) {
                                        let response = data.json()
                                        $$("apigenerator-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataapigenerator(grid))
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
                            $$("apigenerator-form").clear()
                            $$("apigenerator-win").hide()
                            $$("apigeneratorData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}