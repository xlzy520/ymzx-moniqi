const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../db/mysql')

const Videos = sequelize.define(
  'video',
  {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    bvid: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    danmuCount: {
      type: DataTypes.STRING(100),
      allowNull: true,
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
Videos.sync({ force: false })
const dayjs = require('dayjs')

class LicenseModel {
  static async findOne(query) {
    return await Videos.findOne({
      where: {
        ...query,
      },
    })
  }

  static async add(data) {
    return await Videos.create(data)
  }

  static async update(data) {
    return await Videos.update(data, {
      where: {
        id: data.id,
      },
    })
  }

  static async delete(data) {
    return await Videos.destroy({
      where: {
        id: data.id,
      },
    })
  }

  // 分页查询
  static async findAndCountAll({ offset = 0, limit = 10, name = '', startTime = '', endTime = '' }) {
    const where = {}
    return await Videos.findAndCountAll({
      where: {
        // key: {
        //   [Op.like]: name ? `%${name}%` : '%%',
        // },
        // createdAt: {
        //   [Op.between]: [
        //     dayjs(startTime).toDate(), // 将 startTime 转换为日期对象
        //     dayjs(endTime).toDate(), // 将 endTime 转换为日期对象
        //   ],
        // },
      },
      // offset,
      // limit,
    })
  }
}
module.exports = LicenseModel
