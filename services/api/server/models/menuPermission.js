const mongoose = require('mongoose');
let SchemaData = mongoose.Schema({
    menu_id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    guid: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    }
});
module.exports = mongoose.model('menusPermission', SchemaData);