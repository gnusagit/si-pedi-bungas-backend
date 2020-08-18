import {
    JetView
} from "webix-jet"
import {
    dataapigeneratorconfig
} from "models/apigeneratorconfig"
export default class apigeneratorconfigForm extends JetView {
    init(view) {
        this._api = this.app.config.api
        this._parentID = this.getParam('parentID', true)
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "apigeneratorconfig-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "apigeneratorconfig-toolbar",
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
                    id: "apigeneratorconfig-form",
                    width: 500,
                    elements: [{
                        "cols": [{
                            "view": "text",
                            "name": "id",
                            "hidden": true,
                        }, {
                            "view": "text",
                            "name": "apiId",
                            "hidden": true,
                        }, {
                            "view": "text",
                            "name": "fieldname",
                            "required": true,
                            "label": "Fieldname",
                            "tooltip": "Fieldname",
                            "disabled": true
                        }]
                    }, {
                        "view": "richselect",
                        "name": "filterType",
                        "label": "Filter Options",
                        "options": [{
                            "id": "0",
                            "value": ""
                        }, {
                            "id": "ObjectId",
                            "value": "ObjectId"
                        }, {
                            "id": "Likes",
                            "value": "Likes"
                        }, {
                            "id": "Operator",
                            "value": "Operator"
                        }],
                        "required": false,
                        "on": {
                            onChange: function(newv, oldv) {
                                console.log(newv)
                                if (newv == 'Operator') {
                                    $$("apigeneratorconfig-form").elements["operatorFilter"].show()
                                } else {
                                    $$("apigeneratorconfig-form").elements["operatorFilter"].hide()
                                    $$("apigeneratorconfig-form").elements["operatorFilter"].setValue('')
                                }
                            }
                        }
                    }, {
                        "view": "richselect",
                        "name": "operatorFilter",
                        "label": "Operator",
                        "options": [{
                            "id": "$eq",
                            "value": "Use $eq"
                        }, {
                            "id": "$gt",
                            "value": "Use $gt"
                        }, {
                            "id": "$gte",
                            "value": "Use $gte"
                        }, {
                            "id": "$in",
                            "value": "Use $in"
                        }, {
                            "id": "$lte",
                            "value": "Use $lte"
                        }, {
                            "id": "$ne",
                            "value": "Use $ne"
                        }, {
                            "id": "$nin",
                            "value": "Use $nin"
                        }],
                        "required": true,
                        "hidden": true
                    }, {
                        "view": "checkbox",
                        "label": "Pull Field?",
                        "name": "pullField",
                        "required": false,
                        "labelPosition": "left"
                    }, ]
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
                            let form = $$("apigeneratorconfig-form")
                            let api = this.$scope._api
                            let parentID = this.$scope._parentID
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("apigeneratorconfigData")
                                if (values.id != '') {
                                    webix.ajax().put(api + "/apigeneratorconfig/" + parentID, values).then(function(data) {
                                        let response = data.json()
                                        $$("apigeneratorconfig-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataapigeneratorconfig(grid, parentID))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                } else {
                                    webix.message({
                                        type: 'error',
                                        text: 'Form error'
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
                            $$("apigeneratorconfig-form").clear()
                            $$("apigeneratorconfig-win").hide()
                            $$("apigeneratorconfigData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}