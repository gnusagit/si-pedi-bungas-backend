var mongoose = require('mongoose');
var timeZone = require('mongoose-timezone');
// Audit Schema
var AuditSchema = mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    dataname: {
        type: String
    },
    aksi: {
        type: String
    },
    old_data: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    new_data: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    }
}, {
    timestamps: true
});
AuditSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
var Audit = module.exports = mongoose.model('Audit', AuditSchema);
module.exports.getAuditById = function(id, callback) {
    Audit.findById(id, callback);
}
module.exports.createAudit = function(newAudit, callback) {
    newAudit.save(callback);
}