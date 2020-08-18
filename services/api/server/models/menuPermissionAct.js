const mongoose = require('mongoose');
let SchemaData = mongoose.Schema({
    label: {
        type: String,
        index: true
    },
    controller_name: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    menu_id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    guid: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    }
});
module.exports = mongoose.model('menuspermissionact', SchemaData, 'menuspermissionact');