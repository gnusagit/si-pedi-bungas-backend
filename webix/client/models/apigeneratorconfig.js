export function dataapigeneratorconfig(grid, parentID) {
    grid.showProgress({
        type: "bottom"
    })
    return webix.ajax().get("si-pedi-bungas-server/apigeneratorconfig/" + parentID).then(function(data) {
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