import {
    JetView
} from "webix-jet";
export default class ChangePasswordView extends JetView {
    config() {
        return layout;
    }
    init(view) {
        $$("app:menu").unselectAll()
        let api = this.app.config.api
        webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1'>Change Password</a></div>`)
        $$("saveBtn").attachEvent("onItemClick", function(id, e, trg) {
            let form = $$("changepassword-form")
            if (form.validate()) {
                let values = form.getValues()
                webix.ajax().put(api + "/auth/changepass/", values).then(function(data) {
                    let response = data.json()
                    webix.message({
                        type: response.type,
                        text: response.message
                    })
                    form.clear()
                }).fail(err => {
                    let response = JSON.parse(err.response)
                    webix.message({
                        type: response['type'],
                        text: response['message']
                    })
                })
            }
        })
    }
}
const layout = {
    type: "space",
    rows: [{
        view: "form",
        elementsConfig: {
            labelPosition: 'top'
        },
        id: "changepassword-form",
        elements: [{
            "view": "text",
            "type": "password",
            "name": "oldpass",
            "required": true,
            "label": "Old Password",
            "tooltip": "Old Password"
        }, {
            "view": "text",
            "type": "password",
            "name": "newpass",
            "required": true,
            "label": "New Password",
            "tooltip": "New Password"
        }, {
            "view": "text",
            "name": "re_password",
            "tooltip": "Re Password",
            "required": true,
            "label": "Re Password",
            "type": "password"
        }],
        rules: {
            $obj: function(data) {
                let startVal = 0
                if (data.oldpass == '') {
                    this.markInvalid('oldpass', 'Old Password must be filled');
                    startVal = 1;
                }
                if (data.newpass == '') {
                    this.markInvalid('newpass', 'Password must be filled');
                    startVal = 1;
                }
                if (data.re_password == '') {
                    this.markInvalid('re_password', 'Re-Password must be filled');
                    startVal = 1;
                }
                if (data.newpass != '') {
                    if (data.newpass != data.re_password) {
                        this.markInvalid('re_password', 'Password not same, try again');
                        startVal = 1;
                    }
                }
                if (startVal == 1) {
                    return false
                } else {
                    return true
                }
            }
        }
    }, {
        padding: 5,
        cols: [{}, {
            view: "button",
            label: "Save",
            type: 'icon',
            css: 'webix_primary',
            icon: 'mdi mdi-check',
            align: "center",
            id: "saveBtn",
            width: 120
        }]
    }]
}