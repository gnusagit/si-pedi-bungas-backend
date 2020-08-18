const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');
let spbtahapansuratSchema = mongoose.Schema({
    "createdBy": {
        "type": mongoose.Schema.Types.ObjectId
    },
    "tahanapan": {
        "type": "String"
    }
}, {
    timestamps: true
});
spbtahapansuratSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('spbtahapansurat', spbtahapansuratSchema, 'spbtahapansurat');