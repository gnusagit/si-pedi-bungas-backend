const mongoose = require('mongoose')
let apigeneratorconfigSchema = mongoose.Schema({
    "apiId": {
        "type": mongoose.Schema.Types.ObjectId
    },
    "fieldname": {
        "type": "String"
    },
    "filterType": {
        "type": "String"
    },
    "operatorFilter": {
        "type": "String"
    },
    "pullField": {
        "type": "Number"
    },
    "lookup": {
        "type": "String"
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('apigeneratorconfig', apigeneratorconfigSchema, 'apigeneratorconfig');