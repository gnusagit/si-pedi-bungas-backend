import {
    JetView
} from "webix-jet"
import {
    dataspbuser
} from "models/spbuser"
export default class spbuserForm extends JetView {
    init(view) {
        this._api = this.app.config.api
        let form = $$("spbuser-form")
        // Re-generate password
        $$("refreshPassword").attachEvent("onItemClick", function (id, e, node) {
            let randomstring = Math.random().toString(36).slice(-8);
            form.elements.password_auto.setValue(randomstring)
        })
        // Manualy password
        $$("passwordManual").attachEvent("onChange", function (newv, oldv) {
            form.elements.password.disable()
            form.elements.password.hide()
            form.elements.re_password.disable()
            form.elements.re_password.hide()
            $$("passwordAutoContainer").show()
            if (newv == 1) {
                form.elements.password.enable()
                form.elements.password.show()
                form.elements.re_password.enable()
                form.elements.re_password.show()
                $$("passwordAutoContainer").hide()
            }
        })
        // Change password
        $$("changePassword").attachEvent("onChange", function (newv, oldv) {
            // Generate password auto
            $$("passwordAutoContainer").hide()
            form.elements.password_auto.setValue('')
            form.elements.passwordManual.disable()
            form.elements.passwordManual.hide()
            if (newv == 1) {
                $$("passwordAutoContainer").show()
                form.elements.passwordManual.enable()
                form.elements.passwordManual.show()
                let randomstring = Math.random().toString(36).slice(-8);
                form.elements.password_auto.setValue(randomstring)
            }
        })
    }
    config() {
        return {
            view: "animateWindow",
            modal: true,
            id: "spbuser-win",
            move: true,
            head: {
                view: "toolbar",
                css: "header",
                id: "spbuser-toolbar",
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
                    id: "spbuser-form",
                    width: 500,
                    elements: [{
                        view: "combo",
                        name: "group_id",
                        label: "Usergroup",
                        required: true,
                        suggest: {
                            filter: function (item, value) {
                                if (item.usergroup.toString().toLowerCase().indexOf(value.toLowerCase()) === 0) return true;
                                return false;
                            },
                            body: {
                                view: "list",
                                yCount: 5,
                                select: true,
                                template: function (obj) {
                                    return `<div class="webix_strong"><span class="status" style="background-color:${obj.color}">${obj.usergroup}</span></div>`
                                },
                                url: this.app.config.api + '/usergroups/'
                            },
                            fitMaster: true
                        },
                        on: {
                            onChange: function (newv, oldv) {}
                        }
                    }, {
                        "cols": [{
                            "view": "text",
                            "name": "id",
                            "hidden": true
                        }, {
                            "view": "text",
                            "name": "idAkses",
                            "required": false,
                            "tooltip": "Username",
                            "label": "Username",
                            "type": ""
                        }]
                    }, {
                        "cols": [{
                            "view": "combo",
                            "name": "individu",
                            "required": true,
                            "tooltip": "Individu",
                            "label": "Individu",
                            "suggest": {
                                "filter": function (item, value) {
                                    if (item.nama.toLowerCase().indexOf(value) !== -1 || item.nama_anggota.toLowerCase().indexOf(value) !== -1) {
                                        return true;
                                    }
                                    return false;
                                },
                                "body": {
                                    "view": "list",
                                    "yCount": 5,
                                    "select": true,
                                    "template": function (obj) {
                                        return '<div class=webix_strong>' + [obj.nama, obj.nama_anggota].filter(Boolean).join(' ') + '</div>';
                                    },
                                    "url": "si-pedi-bungas-server/llpanggota/"
                                },
                                "fitMaster": true
                            }
                        }]
                    }, {
                        "view": "checkbox",
                        "name": "changePassword",
                        "id": "changePassword",
                        "label": "Change Password",
                        "labelPosition": "left",
                        "labelWidth": 125
                    }, {
                        id: "passwordAutoContainer",
                        cols: [{
                            "view": "text",
                            "name": "password_auto",
                            "readonly": true,
                            "tooltip": "Password",
                            "label": "Password",
                            "type": "text",
                        }, {
                            view: "icon",
                            icon: "mdi mdi-reload",
                            id: "refreshPassword",
                            tooltip: "Reload",
                            "css": {
                                "position": "relative",
                                "top": "10px"
                            },
                            borderless: true
                        }]
                    }, {
                        "view": "checkbox",
                        "name": "passwordManual",
                        "id": "passwordManual",
                        "label": "Manually Password",
                        "labelPosition": "left",
                        "labelWidth": 140
                    }, {
                        "view": "text",
                        "name": "password",
                        "tooltip": "Password",
                        "label": "Password",
                        "type": "password"
                    }, {
                        "view": "text",
                        "name": "re_password",
                        "tooltip": "Re Password",
                        "label": "Re Password",
                        "type": "password"
                    },{
						"cols" : [
							{ 
								view:"checkbox", 
								label:"Akses",
								name : "role_mobile",
								labelPosition:"left",
								labelRight : "Mobile"
							},
							{ 
								view:"checkbox", 
								label:"",
								name : "role_backend",
								labelPosition:"left",
								labelRight : "Backend"
							}
						]
					}],
                    rules: {
                        $obj: function (data) {
                            let startVal = 0
                            if (!data.group_id) {
                                this.markInvalid('group_id', 'Usergroup must be filled')
                                startVal = 1
                            }
                            if (data.passwordManual == 1) {
                                if (data.password == '') {
                                    this.markInvalid('password', 'Password must be filled');
                                    startVal = 1;
                                }
                                if (data.re_password == '') {
                                    this.markInvalid('re_password', 'Re-Password must be filled');
                                    startVal = 1;
                                }
                                if (data.password != '') {
                                    if (data.password != data.re_password) {
                                        this.markInvalid('re_password', 'Password not same, try again');
                                        startVal = 1;
                                    }
                                }
                            }
                            if (!data.namaDisplay) {
                                $$('spbuser-form').markInvalid('namaDisplay', 'Nama must be filled');
                                startVal = 1;
                            }
                            if (!data.individu) {
                                $$('spbuser-form').markInvalid('individu', 'Individu must be filled');
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
                        type: "icon",
                        css: "webix_primary",
                        icon: "mdi mdi-check",
                        align: "center",
                        width: 120,
                        click: function () {
                            let form = $$("spbuser-form")
                            let api = this.$scope.app.config.api
                            if (form.validate()) {
                                let values = form.getValues()
                                let grid = $$("spbuserData")
                                if (values.id != '') {
                                    webix.ajax().put(api + "/spbuser/", values).then(function (data) {
                                        let response = data.json()
                                        $$("spbuser-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbuser(grid))
                                    }).fail(err => {
                                        let response = JSON.parse(err.response)
                                        webix.message({
                                            type: response['type'],
                                            text: response['message']
                                        })
                                    })
                                } else {
                                    webix.ajax().post(api + "/spbuser/", values).then(function (data) {
                                        let response = data.json()
                                        $$("spbuser-win").hide()
                                        webix.message({
                                            type: response.type,
                                            text: response.message
                                        })
                                        grid.clearAll()
                                        grid.parse(dataspbuser(grid))
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
                        click: function () {
                            $$("spbuser-form").clear()
                            $$("spbuser-form").clearValidation()
                            $$("spbuser-win").hide()
                            $$("spbuserData").unselect()
                        }
                    }]
                }]
            }
        }
    }
}