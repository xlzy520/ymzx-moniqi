const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../db/mysql')

const Data = sequelize.define(
  'data',
  {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
  }
)
const Op = Sequelize.Op
// 通过 sync 方法同步数据结构
// 即,创建表
Data.sync({ force: false })
const dayjs = require('dayjs')

class ConfigDataModel {
  static async findOne(query) {
    return await Data.findOne({
      where: {
        ...query,
      },
    })
  }

  static async add(data) {
    return await Data.create(data)
  }

  static async update(data, where) {
    return await Data.update(data, {
      where: {
        ...where,
      },
    })
  }

  // 分页查询
}
module.exports = ConfigDataModel
