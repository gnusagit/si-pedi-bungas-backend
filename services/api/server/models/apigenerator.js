const mongoose = require('mongoose'),
    timeZone = require('mongoose-timezone');
let apigeneratorSchema = mongoose.Schema({
    "packagename": {
        "type": "String"
    },
    "description": {
        "type": "String"
    },
    "ttl": {
        "type": "Number"
    },
    "ttlValue": {
        "type": "Number"
    },
    "ttlStartDate": {
        "type": "String"
    },
    "ttlEndDate": {
        "type": "String"
    },
    "status": {
        "type": "Number"
    },
    "apiKey": {
        "type": "String"
    }
}, {
    timestamps: true
});
apigeneratorSchema.plugin(timeZone, {
    paths: ['createdAt', 'updatedAt']
});
module.exports = mongoose.model('apigenerator', apigeneratorSchema, 'apigenerator');