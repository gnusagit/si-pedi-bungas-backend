export function dataspblaporan(grid) {
    grid.showProgress({
        type: "bottom"
    })
    return webix.ajax().get("si-pedi-bungas-server/spblaporan/").then(function(data) {
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