const Sequelize = require('sequelize')
// 链接数据库的配置

const isDev = process.env.mode === 'dev'

/**
 * 数据库名称, 账号，密码
 */
const sequelize = new Sequelize('bili_danmu', 'root', 'xlzy5200', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+08:00', //东八时区
  // 关闭日志
  logging: isDev ? console.log : false,
})

module.exports = sequelize
