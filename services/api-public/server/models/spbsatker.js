const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');
let spbsatkerSchema = mongoose.Schema({
    "treecode": {
        "type": "String"
    },
    "ortu": {
        "type": "String"
    },
    "sortitem": {
        "type": "Number"
    },
    "nama": {
        "type": "String"
    },
    "label": {
        "type": "String"
    },
    "tipe": {
        "type": "String"
    }
}, {
    timestamps: true
});
spbsatkerSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('spbsatker', spbsatkerSchema, 'spbsatker');