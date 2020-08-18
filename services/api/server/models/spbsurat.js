const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');
let spbsuratSchema = mongoose.Schema({
    "createdBy": {
        "type": mongoose.Schema.Types.ObjectId
    },
    "idAkses": {
        "type": "String"
    },
    "tanggal": {
        "type": "String"
    },
    "laporan": {
        "type": mongoose.Schema.Types.ObjectId
    },
    "nomorSurat": {
        "type": "String"
    },
    "jenisSurat": {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": "spbjenissurat"
    },
    "lampiran": {
        "type": mongoose.Schema.Types.Mixed,
        "default": []
    },
    "uraian": {
        "type": "String"
    }
}, {
    timestamps: true
});
spbsuratSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('spbsurat', spbsuratSchema, 'spbsurat');