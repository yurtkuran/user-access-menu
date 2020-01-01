const mongoose = require('mongoose');

// Create Schema
const sectorSchema = new mongoose.Schema({
    symbol: {
        type: String,
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
},
{timestamps: true});

module.exports = Sector = mongoose.model('Sector', sectorSchema);