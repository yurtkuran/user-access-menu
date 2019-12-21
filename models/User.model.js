const mongoose = require('mongoose');

// Create Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
    },
    isMember: {
        type: Boolean,
    },
    isVerified: {
        type: Boolean, 
    }
},
{timestamps: true});

module.exports = User = mongoose.model('User', userSchema);