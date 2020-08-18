export function datamenu(grid) {
    grid.showProgress({
        type: "icon"
    })
    return webix.ajax().get("si-pedi-bungas-server/menu/").then(function(data) {
        grid.hideProgress()
        return data.json()
    }).fail(function(err) {
        grid.hideProgress()
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