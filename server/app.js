const fs = require('fs')
const path = require('path')
const express = require('express')
const axios = require('axios')
const dayjs = require('dayjs')
const cors = require('cors')
const app = express()
const ConfigDataModel = require('./modules/data')
const VideoModel = require('./modules/video')

const isDev = process.env.mode === 'dev'

app.use(cors())
app.use(
  express.json({
    limit: '10mb',
  })
)
app.use(express.urlencoded({ limit: '10mb', extended: false }))

const currentTime = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const serviceWarn = (text) => {
  return axios.get('http://express.xlzy520.cn/serviceWarn', {
    params: {
      text,
    },
  })
}

app.post('/api/setLocalValue', async (req, res) => {
  const { key, value } = req.body
  if (!key || !value) {
    res.send({
      code: 500,
      data: null,
      message: '参数错误',
    })
    return
  }
  const config = await ConfigDataModel.findOne({ key })
  if (config) {
    await ConfigDataModel.update({ value }, { key })
  } else {
    await ConfigDataModel.add({ key, value })
  }
  res.send({
    code: 200,
    data: null,
    message: '设置成功',
  })
})

app.post('/api/getLocalValue', async (req, res) => {
  const { key } = req.body
  if (!key) {
    res.send({
      code: 500,
      data: null,
      message: '参数错误',
    })
    return
  }
  const config = await ConfigDataModel.findOne({ key })
  res.send({
    code: 200,
    data: config,
    message: '',
  })
})

app.post('/api/myinfo', async (req, res) => {
  const { cookie } = req.body
  if (!cookie) {
    res.send({
      code: 500,
      data: null,
      message: '参数错误',
    })
    return
  }
  axios
    .get('https://api.bilibili.com/x/space/myinfo', {
      headers: {
        cookie,
      },
    })
    .then((response) => {
      res.send({
        code: 200,
        data: response.data,
        message: '',
      })
    })
    .catch((error) => {
      res.send({
        code: 500,
        data: error,
        message: '查询失败',
      })
    })
})

app.get('/api/getVideoInfo', async (req, res) => {
  const { aid, bvid } = req.query
  const type = aid ? 'aid' : 'bvid'
  const id = aid || bvid
  axios
    .get(`https://api.bilibili.com/x/web-interface/view?${type}=${id}`)
    .then((response) => {
      res.send({
        code: 200,
        data: response.data,
        message: '',
      })
    })
    .catch((error) => {
      res.send({
        code: 500,
        data: error,
        message: '查询失败',
      })
    })
})

app.post('/api/addVideo', async (req, res) => {
  const { bvid, aid, cid, title, originJSON } = req.body
  const data = {
    bvid,
    aid,
    cid,
    title,
    originJSON,
  }

  const videoData = await VideoModel.findOne({
    bvid,
  })
  if (videoData) {
    res.send({
      code: 500,
      data: null,
      message: '该视频已经存在',
    })
    return
  }
  VideoModel.add(data)
    .then((result) => {
      res.send({
        code: 200,
        data: result,
        message: '添加成功',
      })
    })
    .catch((err) => {
      res.send({
        code: 500,
        data: err,
        message: '添加失败',
      })
    })
})

app.post('/api/updateVideo', (req, res) => {
  const { id, status } = req.body
  const data = {
    id,
    status,
  }
  VideoModel.update(data)
    .then((result) => {
      res.send({
        code: 200,
        data: result,
        message: '更新成功',
      })
    })
    .catch((err) => {
      res.send({
        code: 500,
        data: err,
        message: '更新失败',
      })
    })
})

app.post('/api/deleteVideo', (req, res) => {
  const { id } = req.body
  const data = {
    id,
  }
  VideoModel.delete(data)
    .then((result) => {
      res.send({
        code: 200,
        data: result,
        message: '删除成功',
      })
    })
    .catch((err) => {
      res.send({
        code: 500,
        data: null,
        message: `删除失败, ${err.message}`,
      })
    })
})

// 分页查询
app.get('/api/getVideoList', (req, res) => {
  const { pageSize, pageNum, name, phone, fruit, startTime, endTime, key } = req.query
  VideoModel.findAndCountAll({
    // offset: Number(pageSize) * (Number(pageNum) - 1),
    // limit: Number(pageSize),
    // name: name || '',
    // phone: phone || '',
    // fruit: phone || '',
    // startTime: startTime || '',
    // endTime: endTime || '',
  })
    .then((result) => {
      res.send({
        code: 200,
        data: result,
        message: '查询成功',
      })
    })
    .catch((err) => {
      console.log(err, '===========打印的 ------ ')
      res.send({
        code: 500,
        data: err,
        message: '查询失败',
      })
    })
})

app.post('/config/add', (req, res) => {
  const { name, value, key } = req.body
  if (key !== 'D3YauWstVc6aguaxqE') {
    res.send({
      code: 500,
      data: null,
      message: '秘钥错误',
    })
    return
  }
  const data = {
    name,
    value,
  }
  ConfigDataModel.add(data)
    .then((result) => {
      res.send({
        code: 200,
        data: result,
        message: '添加成功',
      })
    })
    .catch((err) => {
      res.send({
        code: 500,
        data: err,
        message: '添加失败',
      })
    })
})

app.post('/config/update', (req, res) => {
  const { name, value, key } = req.body
  if (!isDev && key !== 'D3YauWstVc6aguaxqE') {
    res.send({
      code: 500,
      data: null,
      message: '秘钥错误',
    })
    return
  }
  const data = {
    name,
    value,
  }
  ConfigDataModel.update(data, { name })
    .then((result) => {
      res.send({
        code: 200,
        data: result,
        message: '更新成功',
      })
    })
    .catch((err) => {
      res.send({
        code: 500,
        data: err.message,
        message: '更新失败',
      })
    })
})

app.get('/config/get', (req, res) => {
  const { key, name } = req.query
  ConfigDataModel.findOne({
    name,
    isDeleted: false,
  })
    .then((result) => {
      res.send({
        code: 200,
        data: result,
        message: '查询成功',
      })
    })
    .catch((err) => {
      res.send({
        code: 500,
        data: err,
        message: '查询失败',
      })
    })
})

app.get('/license/adminxlzy520/add', (req, res) => {
  const { type } = req.query
  // 生成一个32位的随机字符串
  const randomStr = Math.random().toString(36).substr(2)
  const data = {
    key: randomStr,
    type,
  }
  LicenseModel.add(data)
    .then((result) => {
      res.send({
        code: 200,
        data: result,
        message: '添加成功',
      })
    })
    .catch((err) => {
      res.send({
        code: 500,
        data: err,
        message: '添加失败',
      })
    })
})

app.get('/license/bind', async (req, res) => {
  let { key, deviceID, type } = req.query
  const clientIP = req.headers['x-forwarded-for'] || req.ip
  console.log(`【${currentTime()}】 开始绑定 ${key} ${deviceID}， 客户端IP: ${clientIP}`)
  if (!key || !deviceID) {
    res.send({
      code: 500,
      data: null,
      message: '参数错误',
    })
    return
  }
  const ua = req.headers['user-agent']
  key = key.trim()
  try {
    const license = await LicenseModel.findOne({
      key,
    })
    if (!license) {
      console.log(`【${currentTime()}】 ${key} key不存在`)
      res.send({
        code: 500,
        data: null,
        message: 'key不存在',
      })
      return
    }
    if (!license.deviceID) {
      console.log(`【${currentTime()}】 ${key} key未绑定设备`)
      try {
        await LicenseLogModel.add({
          key,
          deviceID,
          type,
          ua,
          deviceCount: 1,
          ip: clientIP,
        })
      } catch (err) {
        console.log(`【${currentTime()}】 ${key} 添加日志失败`, err.message)
      }

      await LicenseModel.update({
        id: license.id,
        deviceID,
        // ua
      })
      res.send({
        code: 20000,
      })
      return
    }
    if (license.deviceID === deviceID) {
      if (type && license.type === type) {
        console.log(`【${currentTime()}】 ${key} ${type} 授权成功`)
        res.send({
          code: 20000,
        })
        return
      }
      console.log(`【${currentTime()}】 ${key} 授权成功`)
      res.send({
        code: 20000,
      })
    } else {
      console.log(`【${currentTime()}】 ${key} key已经绑定`)
      const resetDeviceCount = license.resetDeviceCount || 0
      const isIgnoreUAList = ['com.ss.android.ugc.aweme', 'Dalvik/2.1.0']
      if (isIgnoreUAList.some((item) => ua.includes(item))) {
        console.log(`【${currentTime()}】 ${key} ${ua} 虚假设备 不需要绑定设备`)
        res.send({
          code: 20000,
        })
        return
      }
      if (resetDeviceCount >= 6) {
        console.log(`【${currentTime()}】 ${key} 设备绑定次数已经用完`)
        res.send({
          code: 500,
          data: null,
          message: '设备绑定次数已经用完，建议抖音扫码打开之后，不要切换设备。',
        })
        return
      }
      try {
        await LicenseLogModel.add({
          key,
          deviceID,
          type,
          ua,
          deviceCount: resetDeviceCount + 1,
          ip: clientIP,
        })
      } catch (err) {
        console.log(`【${currentTime()}】 ${key} 添加日志失败`, err.message)
      }
      console.log(
        `【${currentTime()}】 ${key} 设备绑定次数加1, 新设备ID: ${deviceID}, 当前设备绑定次数：${resetDeviceCount + 1}, ua: ${ua}`
      )
      await LicenseModel.update({
        id: license.id,
        deviceID,
        resetDeviceCount: resetDeviceCount + 1,
        // ua: license.ua+'-------'+ua
      })
      res.send({
        code: 20000,
      })
    }
  } catch (err) {
    console.log(`【${currentTime()}】 ${key} key绑定失败`, err.message)
    res.send({
      code: 500,
      data: err.message,
      message: '绑定失败',
    })
  }
})

app.get('/license/reset', async (req, res) => {
  const { key } = req.query
  if (!key) {
    res.send({
      code: 500,
      data: null,
      message: '参数错误',
    })
    return
  }
  console.log(`【${currentTime()}】 开始重置 ${key}`)
  const license = await LicenseModel.findOne({
    key,
  })
  if (license) {
    LicenseModel.update({
      id: license.id,
      deviceID: null,
      resetDeviceCount: 5,
    })
      .then((result) => {
        res.send({
          code: 200,
          data: result,
          message: '重置成功',
        })
      })
      .catch((err) => {
        res.send({
          code: 500,
          data: err.message,
          message: '重置失败',
        })
      })
  } else {
    res.send({
      code: 500,
      data: null,
      message: 'key不存在',
    })
  }
})

app.get('/test', (req, res) => {
  res.send('test')
})

const Config = {
  lastPushTime: 0,
}
const pushMsg = (text) => {
  const now = Date.now()
  if (now - Config.lastPushTime < 1000 * 60 * 60) {
    return
  }
  Config.lastPushTime = now
  axios.get(`https://express.xlzy520.cn/serviceWarn?text=${text}`)
}

const qqQueryParams = [
  'cmd=1&pf=mds_qq_qb-__mds_sq_qb_-html5&pfkey=pfkey&from_h5=1&from_https=1&openid=D723FFB116AB3C10839202CEE0F66523&openkey=B29B47626183B0C358FDF21AB19B1BA6&session_id=openid&session_type=kp_accesstoken&qq_appid=101502376&offerId=1450000186&sandbox=&provide_uin=',
]

app.get('/queryQQNickname', (req, res) => {
  const { qq } = req.query
  if (!qq) {
    res.send({
      code: 500,
      data: null,
      message: '参数错误',
    })
    return
  }
  console.log('查询QQ昵称:', qq)
  const randomIndex = Math.floor(Math.random() * qqQueryParams.length)
  const qqQueryParam = qqQueryParams[randomIndex]

  axios
    .post('https://api.unipay.qq.com/v1/r/1450000186/wechat_query', qqQueryParam + qq, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'https://pay.qq.com',
        Referer: 'https://pay.qq.com/',
      },
    })
    .then((response) => {
      const data = response.data
      console.log('查询QQ昵称:', qq, '结果：', data)
      if (data.nick) {
        res.send({
          code: 200,
          data: response.data,
          message: '查询成功',
        })
      } else {
        let randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)]
        randomNickname = randomNickname.split('、')[1]
        console.log(`查询QQ昵称失败: ${data}, 显示一个随机昵称：${randomNickname}`)
        pushMsg(`查询QQ昵称失败: ${data}`)
        res.send({
          code: 200,
          data: {
            nick: randomNickname,
          },
          message: '',
        })
      }
    })
    .catch((error) => {
      res.send({
        code: 500,
        data: error,
        message: '查询失败',
      })
    })
})

app.get('/Product/Index/47946', (req, res) => {
  res.redirect('https://haokawx.lot-ml.com/Product/Index/47946')
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).send('Service Error')
})

// 导出 Express app
module.exports = app
