const Sequelize  = require('sequelize');

module.exports = new Sequelize('tutorial_passport', 'root', '1candy', {
    host:    'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    logging: false
});