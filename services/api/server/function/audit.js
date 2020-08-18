let AuditTrails = require('../models/audit')
let mongoose = require("mongoose")
module.exports.generate = function(uid, dataname, type, oldData, newData) {
    var newAuditTrails = new AuditTrails({
        uid: mongoose.Types.ObjectId(uid),
        dataname: dataname,
        aksi: type,
        old_data: oldData,
        new_data: newData
    });
    AuditTrails.createAudit(newAuditTrails, function(err, data) {
        if (err) throw err;
        console.log(data)
    });
}