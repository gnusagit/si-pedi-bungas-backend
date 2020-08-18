export function dataSideMenu(sidebar) {
    sidebar.showProgress({
        type: "top"
    })
    return webix.ajax().get("si-pedi-bungas-server/sidemenu/").then(function(data) {
        sidebar.hideProgress()
        return data.json()
    }).fail(function(err) {
        sidebar.hideProgress()
        let response = JSON.parse(err.response)
        if (response) {
            webix.message({
                type: response['type'],
                text: response['message']
            })
        }
        return null
    })
}