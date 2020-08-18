const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');
let spblaporanSchema = mongoose.Schema({
    "createdBy": {
        "type": mongoose.Schema.Types.ObjectId
    },
    "idAkses": {
        "type": "String"
    },
    "nomor": {
        "type": "String"
    },
    "tanggal": {
        "type": "String"
    },
    "uraian": {
        "type": "String"
    },
    "spbsurat": [{
        "type": mongoose.Schema.Types.ObjectId,
        "ref": "spbsurat"
    }]
}, {
    timestamps: true
});
spblaporanSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('spblaporan', spblaporanSchema, 'spblaporan');