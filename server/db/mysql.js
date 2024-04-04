const Sequelize = require('sequelize')
// 链接数据库的配置

const isDev = process.env.mode === 'dev'

/**
 * 数据库名称, 账号，密码
 */
const sequelize = new Sequelize('bilidanmu', 'bilidanmu', 'Rz7F87rDeGZCkt3N', {
  host: '45.142.158.158',
  dialect: 'mysql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+08:00', //东八时区
})

module.exports = sequelize
