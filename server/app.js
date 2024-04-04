const fs = require('fs')
const path = require('path')
const express = require('express')
const axios = require('axios')
const qs = require('qs')
const dayjs = require('dayjs')
const cors = require('cors')
const app = express()
const ConfigDataModel = require('./modules/data')
const VideoModel = require('./modules/video')

const isDev = process.env.mode === 'dev'

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

function hex2int(hex) {
  const len = hex.length
  const a = new Array(len)
  let code
  for (let i = 0; i < len; i++) {
    code = hex.charCodeAt(i)
    if (code >= 48 && code < 58) {
      code -= 48
    } else {
      code = (code & 0xdf) - 65 + 10
    }
    a[i] = code
  }

  return a.reduce((acc, c) => {
    acc = 16 * acc + c
    return acc
  }, 0)
}

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

const postDanmu = ({ mid, csrf, cookie, cid, aid, message, progress, fontsize = 25, color = 16777215, mode = 5 }) => {
  const formdata = {
    color,
    fontsize,
    pool: 0,
    mode,
    type: 1,
    oid: cid,
    msg: message,
    aid,
    progress,
    rnd: 2,
    plat: 1,
    checkbox_type: 0,
    polaris_appid: 100,
    polaris_platfrom: 5,
    spmid: '333.788.0.0',
    from_spmid: '333.999.0.0',
    csrf,
  }
  const data = qs.stringify(formdata)
  return axios.post(`https://api.bilibili.com/x/v2/dm/post`, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      cookie,
    },
  })
}

let stop = true
let currentVideo = null

const runVideoDanmu = async () => {
  const result = await VideoModel.findAndCountAll({
    where: {
      status: null,
    },
  })
  if (result.rows.length) {
    const firstVideo = result.rows[0]
    currentVideo = firstVideo
    console.log(`${currentTime()} 发送弹幕给视频 ${firstVideo.title} - ${firstVideo.bvid}`)
    const { title, cid, aid } = firstVideo
    const accountsStr = (await ConfigDataModel.findOne({ key: 'userList' })).value
    let accounts = []
    try {
      const accountsJSON = JSON.parse(accountsStr)
      accounts = accountsJSON.filter((item) => item.danmu)
    } catch (e) {
      console.log(e)
    }
    const danmuList = (await ConfigDataModel.findOne({ key: 'danmuList' })).value
    const danmuListJSON = JSON.parse(danmuList)
    const danmuSendMode = (await ConfigDataModel.findOne({ key: 'danmuSendMode' }))?.value || 'queue'
    console.log(`${currentTime()} 弹幕发送模式：${danmuSendMode}`)
    const danmuInterval = (await ConfigDataModel.findOne({ key: 'danmuInterval' }))?.value || 0.5
    let danmiuConfig
    let index = 0
    if (danmuSendMode === 'queue') {
      danmiuConfig = danmuListJSON[index]
      index++
    } else if (danmuSendMode === 'random') {
      danmiuConfig = danmuListJSON[Math.floor(Math.random() * danmuListJSON.length)]
    }
    let danmuCount = 0
    if (!accounts.length) {
      console.log('没有可用的账号')
      stop = true
      return
    }

    for (const account of accounts) {
      console.log(`${currentTime()} 发送弹幕 ${account.mid} - ${account.nickname}`)
      if (!danmiuConfig) {
        break
      }
      const { mid, csrf, originCookie } = account
      const { content: message, progress, fontsize, color, mode } = danmiuConfig
      console.log(`${currentTime()} 发送弹幕 ${account.mid} - ${message}`)
      try {
        await postDanmu({
          mid,
          csrf,
          cookie: originCookie,
          cid,
          aid,
          message,
          progress: (progress || 0) * 1000,
          fontsize,
          color: hex2int(color?.replace('#', '')),
          mode,
        }).then(async (res) => {
          if (res.data.code !== 0) {
            throw new Error(res.data.message)
          }
          danmuCount++
          console.log(`${currentTime()} 发送弹幕成功，更新状态 ${account.mid} - ${message} ${danmuCount}`)
          await VideoModel.update({
            id: firstVideo.id,
            status: 1,
            danmuCount: danmuCount,
            postAt: new Date(),
          })
        })
      } catch (err) {
        console.log(`${currentTime()} 发送弹幕失败，失败原因：${err.message} ${account.mid} - ${message}`)
        await VideoModel.update({
          id: firstVideo.id,
          status: -1,
          reason: err.message,
        })
      }
      console.log(`${currentTime()} 等待 ${danmuInterval} 秒后继续发送弹幕`)
      await sleep(danmuInterval * 1000)
    }
  } else {
    console.log('没有需要处理的数据')
    stop = true
    await ConfigDataModel.update({ value: 'stop' }, { key: 'danmuRunStatus' })
  }
  if (!stop) {
    const videoInterval = (await ConfigDataModel.findOne({ key: 'videoInterval' }))?.value || 20
    console.log(videoInterval, '===========打印的 ------ runVideoDanmu')
    await sleep(videoInterval * 1000)
    runVideoDanmu()
  }
}

let timer = null

app.get('/api/startDanmu', async (req, res) => {
  if (!stop) {
    res.send({
      code: 500,
      data: null,
      message: '弹幕发送已开始',
    })
    return
  }
  stop = false
  runVideoDanmu()
  await ConfigDataModel.update({ value: 'running' }, { key: 'danmuRunStatus' })
  res.send({
    code: 200,
    data: 'running',
    message: '弹幕发送已开始',
  })
})

app.get('/api/stopDanmu', async (req, res) => {
  if (stop) {
    res.send({
      code: 500,
      data: null,
      message: '弹幕发送已暂停',
    })
    return
  }
  stop = true
  await ConfigDataModel.update({ value: 'stop' }, { key: 'danmuRunStatus' })
  res.send({
    code: 200,
    data: 'stop',
    message: '弹幕发送已暂停',
  })
})

app.get('/api/getDanmuStatus', async (req, res) => {
  if (!stop) {
    res.send({
      code: 200,
      data: {
        status: 'running',
        currentVideo,
      },
      message: '弹幕发送中',
    })
  } else {
    res.send({
      code: 200,
      data: {
        status: 'stop',
        currentVideo,
      },
      message: '弹幕发送已暂停',
    })
  }
})

app.get('/test', (req, res) => {
  res.send('test')
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
