const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');
let spbanggotaSchema = mongoose.Schema({
    "nama_anggota": {
        "type": "String"
    },
    "firebaseid": {
        "type": "String"
    },
    "imei": {
        "type": "String"
    },
    "pangkat": {
        "type": "String"
    },
    "nrp": {
        "type": "String"
    },
    "telepon": {
        "type": "String"
    },
    "email": {
        "type": "String"
    },
    "satker": {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": "spbsatker"
    }
}, {
    timestamps: true
});
spbanggotaSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('spbanggota', spbanggotaSchema, 'spbanggota');