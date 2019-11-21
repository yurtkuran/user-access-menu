const Sequelize  = require('sequelize');
const db         = require('../config/database');

class Log extends Sequelize.Model {};

Log.init({
    _id: {
        type: Sequelize.INTEGER,
        trim: true,
        primaryKey: true
    },
    _user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        trim: true
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
}, { 
    sequelize:  db, 
    modelName:  'log',
    timestamps: true,
    updatedAt:  false
});

module.exports = Log;