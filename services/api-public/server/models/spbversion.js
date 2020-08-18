const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');

let spbversionSchema = mongoose.Schema({
    "version_code": {
        "type": "Number"
    },
    "version_name": {
        "type": "String"
    }
}, {
    timestamps: true
});

spbversionSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('spbversion', spbversionSchema, 'spbversion');
