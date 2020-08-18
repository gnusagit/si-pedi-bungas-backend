const mongoose = require('mongoose');
let UsergroupSchema = mongoose.Schema({
    usergroup: {
        type: String,
        index: true
    },
    color: {
        type: String
    }
});
module.exports = mongoose.model('Usergroup', UsergroupSchema);