let jwt = require('jsonwebtoken')

function login(user, pass) {
    let jwtToken = jwt.sign({
        'user': user,
        'pass': pass
    }, 'Bab4r00ssa2020', {
        algorithm: 'HS256'
    })
    return webix.ajax().headers({
        'token': jwtToken
    }).post("si-pedi-bungas-server/auth/login").then(data => {
        let dataParse = data.json()
        webix.storage.cookie.put('tokenID', dataParse.token)
        return data.json()
    }).fail(function(err) {
        return null
    })
}

function status() {
    return webix.ajax().headers({
        'token-id': webix.storage.cookie.get('tokenID')
    }).post("si-pedi-bungas-server/auth/status").then(a => a.json());
}

function logout() {
    return webix.ajax().headers({
        'token-id': webix.storage.cookie.get('tokenID')
    }).post("si-pedi-bungas-server/auth/logout").then(a => {
        webix.storage.cookie.clear()
        return a.json()
    })
}
export function _dateDiff(datepart, fromdate, todate) {
    datepart = datepart.toLowerCase();
    var diff = todate - fromdate;
    var divideBy = {
        w: 604800000,
        d: 86400000,
        h: 3600000,
        n: 60000,
        s: 1000
    };
    return Math.floor(diff / divideBy[datepart]);
}
export default {
    login,
    status,
    logout
}