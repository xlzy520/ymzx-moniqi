// @ts-nocheck
import axios from 'axios'
import Cookie from 'cookie'
import dayjs from 'dayjs'
import qs from 'qs'
import { isObject } from 'lodash'

const isDev = import.meta.env.DEV
export const baseURL = isDev ? 'http://localhost:5005' : 'http://api.flsk.cc'

export const service = axios.create({
  baseURL,
})

service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const setLocalValue = (key, value) => {
  const data = isObject(value) ? JSON.stringify(value) : value
  return service.post('/api/setLocalValue', {
    key,
    value: data,
  })
}

export const getLocalValue = (key) => {
  return service
    .post('/api/getLocalValue', {
      key,
    })
    .then((res) => {
      const value = res.data?.value
      console.log(res, '===========打印的 ------ ')
      try {
        return JSON.parse(value)
      } catch (error) {
        return value
      }
    })
}

export const getSpaceInfo = (cookie) => {
  return service
    .post('/api/myinfo', {
      cookie,
    })
    .then((res) => res.data.data)
}

export const postDanmuLocal = ({ mid, csrf, cid, aid, message, progress, fontsize = 25, color = 16777215, mode = 5 }) => {
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
  return service.post(`/x/v2/dm/post?_mid=${mid}`, data)
}

export const getAccountList = async () => {
  return getLocalValue('userList')
}

export const DefaultReplaceTexts = ['cookie:', '卡号:', '卡密:', '卡密：', '卡号：']

export const parseImportCookie = async (text: string, replaceTexts: string[]) => {
  const accounts = text.replaceAll('\r', '').split('\n')
  const newUsers = []
  for (let accountStr of accounts) {
    if (accountStr.length > 5) {
      DefaultReplaceTexts.forEach((item) => {
        accountStr = accountStr.replace(item, '')
      })
      let [, , cookie] = accountStr.split('----')
      if (!cookie) {
        cookie = accountStr
      }

      const cookieObj = Cookie.parse(cookie)
      const accountObj = {
        mid: cookieObj.DedeUserID,
        csrf: cookieObj.bili_jct,
        account: cookieObj.DedeUserID,
        originCookie: cookie,
      }
      newUsers.push(accountObj)
    }
  }
  return newUsers
}

export const saveOrUpdateUser = async (user) => {
  const userList = (await getLocalValue('userList')) || []
  const index = userList.findIndex((item) => String(item.mid) === String(user.mid))
  user.mid = String(user.mid)
  if (index > -1) {
    const oldUser = userList[index]
    userList[index] = {
      ...oldUser,
      ...user,
    }
  } else {
    userList.push(user)
  }
  await setLocalValue('userList', userList)
}

export const removeUser = async (user) => {
  const userList = (await getLocalValue('userList')) || []
  const index = userList.findIndex((item) => item.mid === user.mid)
  if (index > -1) {
    userList.splice(index, 1)
    await setLocalValue('userList', userList)
  }
}

export const exportJson = async (userList: any) => {
  if (!userList) {
    userList = (await getLocalValue('userList')) || []
  }
  const text = userList
    .map((item) => {
      return item.originCookie
    })
    .join('\n')
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = dayjs().format('YYYY-MM-DD')
  a.download = `B站执笔导出账号CK-${userList.length}个-${date}.txt`
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export const getSimpleCookie = (record) => {
  let ck = record.originCookie
  const parsedCookie = Cookie.parse(ck)
  ck = Object.keys(parsedCookie)
    .map((key) => {
      return `${key}=${parsedCookie[key]}`
    })
    .join('; ')
  return ck
}

export const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export const getBVIDFromURL = (url: string) => {
  if (url.includes('/')) {
    const pathname = new URL(url).pathname
    return pathname.split('/')[2]
  }
  return url
}

export const getVideoInfo = (id, type = 'bvid') => {
  return service.get(`/api/getVideoInfo?${type}=${id}`).then((res) => {
    return res.data.data
  })
}

export const getVideoList = async () => {
  return service.get(`/api/getVideoList`).then((res) => {
    return res.data.rows
  })
}

export const updateVideo = async (video) => {
  return service.post(`/api/updateVideo`, video)
}

export const deleteVideo = async (id) => {
  return service.post(`/api/deleteVideo`, { id })
}

export const addVideo = async (video) => {
  return service.post(`/api/addVideo`, video)
}

export const startDanmu = async () => {
  return service.get(`/api/startDanmu`)
}

export const stopDanmu = async () => {
  return service.get(`/api/stopDanmu`)
}

export const getDanmuStatus = async () => {
  return service.get(`/api/getDanmuStatus`)
}
