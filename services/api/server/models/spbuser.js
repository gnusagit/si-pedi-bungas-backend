const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');
let spbuserSchema = mongoose.Schema({
    "idAkses": {
        "type": "String"
    },
    "password": {
        "type": "String"
    },
    "pswd": {
        "type": "String"
    },
    "group_id": {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": "Usergroup"
    },
    "individu": {
        "type": mongoose.Schema.Types.ObjectId,
        "ref": "llpanggota"
    },
    "role_mobile": {
        "type": "Number",
        "default" : 0
    },
    "role_backend": {
        "type": "Number",
        "default" : 0
    }
}, {
    timestamps: true
});
spbuserSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('spbuser', spbuserSchema, 'spbuser');