const Sequelize = require('sequelize')

const sequelize = new Sequelize('node-complete', 'nodecomplete', 'nodecomplete', {
  host: 'localhost',
  dialect: 'mysql'
})

module.exports = sequelize;