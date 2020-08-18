const mongoose = require('mongoose');
let SchemaData = mongoose.Schema({
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    moduleSource: {
        type: String
    },
    module_id: {
        type: String
    },
    menu: {
        type: String
    },
    value: {
        type: String
    },
    icon: {
        type: String
    },
    open: {
        type: Boolean
    },
    details: {
        type: String
    },
    sortnumber: {
        type: Number
    }
});
module.exports = mongoose.model('Menu', SchemaData);