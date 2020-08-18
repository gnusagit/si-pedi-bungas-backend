import {
    JetView
} from "webix-jet"
export default class LoginView extends JetView {
    config() {
        let ui = {
            cols: [{
                gravity: 1,
                template: ""
            }, {
                rows: [{
                    gravity: 1,
                    template: ""
                }, {
                    view: "label",
                    template: "<img src='assets/img/logo.png' height='90'/>",
                    align: "center",
                    height: 100
                }, {
                    view: "form",
                    id: 'loginForm',
                    width: 300,
                    elements: [{
                        view: "text",
                        name: "username",
                        label: "Username",
                        labelPosition: "top"
                    }, {
                        view: "text",
                        type: "password",
                        name: "password",
                        label: "Password",
                        labelPosition: "top"
                    }, {
                        view: "button",
                        css: "webix_primary",
                        value: "Login",
                        click: () => this.do_login(),
                        hotkey: "enter"
                    }],
                    rules: {
                        $obj: function(data) {
                            if (!data.username) {
                                webix.message({
                                    type: "error",
                                    text: "Username cannot be empty"
                                });
                                return false;
                            }
                            if (!data.password) {
                                webix.message({
                                    type: "error",
                                    text: "Password cannot be empty"
                                });
                                return false;
                            }
                            return true
                        }
                    }
                }, {
                    gravity: 1,
                    template: ""
                }]
            }, {
                gravity: 1,
                template: ""
            }]
        };
        return ui;
    }
    init(view) {
        localStorage.setItem("online", 0)
    }
    do_login() {
        const user = this.app.getService("user");
        const form = this.$$("loginForm");
        if (form.validate()) {
            const data = form.getValues();
            user.login(data.username, data.password).catch(function() {
                form.elements.password.focus();
                webix.delay(function() {
                    webix.message({
                        type: "error",
                        text: "Invalid Login"
                    })
                })
            })
        }
    }
}