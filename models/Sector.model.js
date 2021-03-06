const mongoose = require('mongoose');

// Create Schema
const sectorSchema = new mongoose.Schema({
    symbol: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
},
{timestamps: true});

module.exports = Sector = mongoose.model('Sector', sectorSchema);