const mongoose = require('mongoose');

// Create Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
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