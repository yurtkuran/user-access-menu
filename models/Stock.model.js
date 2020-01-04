const mongoose = require('mongoose');

// Create Schema
const stockSchema = new mongoose.Schema({
    sector: {
        type: String,
        trim: true,
    },
    symbol: {
        type: String,
        trim: true,
    },
    companyName: {
        type: String,
        trim: true,
    },
},
{timestamps: true});

module.exports = Stock = mongoose.model('Stock', stockSchema);