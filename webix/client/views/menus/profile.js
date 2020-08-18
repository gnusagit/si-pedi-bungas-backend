import {
    JetView,
    plugins
} from "webix-jet"
export default class MenuView extends JetView {
    config() {
        return {
            view: "animatePopupToolbar",
            id: "profilePopup",
            width: 250,
            body: {
                rows: [{
                    view: "list",
                    id: "itemPopUp",
                    autoheight: true,
                    select: true,
                    template: "<span class='mdi #icon#'></span> <span>#value#</span>",
                    on: {
                        onItemClick: function(id) {
                            let obj = this.getItem(id)
                            if (id == 'logout') {
                                localStorage.setItem("online", 0)
                                this.$scope.app.show(obj.page)
                            } else if (id == 'changepassword') {
                                $$("app:menu").unselectAll()
                                this.$scope.app.show(obj.page)
                                $$("tabs").addOption({
                                    id: obj.id,
                                    value: `<span class='mdi ${obj.icon}'></span> ${obj.value}`,
                                    close: true
                                })
                                $$("tabs").setValue(obj.id)
                            } else if (id == 'username') {
                                $$("app:menu").unselectAll()
                                this.$scope.app.show(obj.page)
                                $$("tabs").addOption({
                                    id: 'ownerprofile',
                                    value: `<span class='mdi ${obj.icon}'></span> Profile`,
                                    close: true
                                })
                                $$("tabs").setValue('ownerprofile')
                            } else {
                                webix.message({
                                    type: "error",
                                    text: "Page not found"
                                })
                            }
                        }
                    }
                }]
            }
        }
    }
}