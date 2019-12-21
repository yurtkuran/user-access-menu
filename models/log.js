const mongoose = require('mongoose');

// Create Schema
const logSchema = new mongoose.Schema({
    _user: {
        type: mongoose.Schema.Types.ObjectId,
    },
    type: {
        type: String,
    },
},
{timestamps: true});

module.exports = Log = mongoose.model('Log', logSchema);