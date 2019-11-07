const Sequelize  = require('sequelize');
const db         = require('../config/database');

class User extends Sequelize.Model {};

User.init({
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
}, { sequelize: db, modelName: 'user' });

module.exports = User;