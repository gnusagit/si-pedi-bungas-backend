const mongoose = require('mongoose');
let SchemaData = mongoose.Schema({
    module_id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    label: {
        type: String,
        index: true
    },
    controller_name: {
        type: String,
        index: true
    },
    grid_type: {
        type: String,
        index: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    addBtn: {
        type: Number
    },
    editBtn: {
        type: Number
    },
    deleteBtn: {
        type: Number
    },
    importBtn: {
        type: Number
    },
    printBtn: {
        type: Number
    },
    exportBtn: {
        type: Number
    }
});
module.exports = mongoose.model('modulesapp', SchemaData, 'modulesapp');