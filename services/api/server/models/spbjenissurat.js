const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');
let spbjenissuratSchema = mongoose.Schema({
    "jenis": {
        "type": "String"
    },
    "tahapanSurat": {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": "spbtahapansurat"
    },
    "tahapanSuratNama": {
        "type": "String"
    }
}, {
    timestamps: true
});
spbjenissuratSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('spbjenissurat', spbjenissuratSchema, 'spbjenissurat');