<template>
  <div class="w-full h-full">
    <div v-if="hasAuth" class="jcc-container" @click="showGiftImg">
      <video src="https://zhibi-share.oss-cn-shanghai.aliyuncs.com/RPReplay_Final1712368486.MP4" autoplay loop></video>
      <!--      <video src="https://zhibi-share.oss-cn-shanghai.aliyuncs.com/mmexport1712371678046.mp4" autoplay loop></video>-->
      <div v-if="showGift" class="img-container">
        <img
          src="https://i0.hdslb.com/bfs/article/6a172c5beb4a86ff2c346e7208f39f171557431.jpg"
          referrerpolicy="no-referrer"
          alt="Overlay Image"
        />
        <div class="nickname-box">
          <input v-model="nickname" @click.stop="clickInput" class="nickname-input" placeholder="请输入昵称" />
          <icon-search @click="onSearch" class="nickname-search-icon" />
        </div>
        <div class="close-btn" @click="close"></div>
        <div v-if="hasSend" class="list-box">
          <div class="list-item">
            <div class="flex items-center">
              <div class="avatar">
                <img :src="avatar" alt="avatar" />
              </div>
              <div class="name">{{ nickname }}</div>
            </div>
            <div class="select-btn" @click="onSelect">
              <img src="https://i0.hdslb.com/bfs/article/d52f5e6b74637e83a6b37de70dfe14fc1557431.jpg" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div v-if="showGiftImg2" class="img-container img-container2">
        <img
          src="https://i0.hdslb.com/bfs/article/a38bb9b622cf94c612d4896678246f791557431.png"
          referrerpolicy="no-referrer"
          alt="Overlay Image"
        />
        <div class="list-box2">
          <div class="flex items-center">
            <div class="avatar">
              <img :src="avatar" alt="avatar" />
            </div>
            <div class="name">{{ nickname }}</div>
          </div>
        </div>
        <div class="send-box" @click="confirmSend"></div>
      </div>
      <div v-if="showGiftResult" @click="reci" class="img-container img-container3">
        <img
          src="https://i0.hdslb.com/bfs/article/99ae69bf0daad920565556d5751b9a0a1557431.jpg"
          referrerpolicy="no-referrer"
          alt="Overlay Image"
        />
      </div>
    </div>
    <div v-else>加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconClose } from '@arco-design/web-vue/es/icon'
import dayjs from 'dayjs'
import { avatars } from '@/views/login/data'
import axios from 'axios'
// import LoginBanner from './components/banner.vue'
// import LoginForm from './components/login-form.vue'

const service = axios.create({})

const data = ref([
  // {
  //   name: '传火',
  //   time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  //   avatar: avatars[Math.floor(Math.random() * avatars.length)],
  // },
])

const nickname = ref('')
const allNicknames = ref()
const loading = ref(false)
const rest = ref(500)
const hasAuth = ref(false)
const showGift = ref(false)
const avatar = ref(avatars[Math.floor(Math.random() * avatars.length)])
const hasSend = ref(false)
const showGiftImg2 = ref(false)
const showGiftResult = ref(false)

const showGiftImg = () => {
  showGiftResult.value = false
  showGift.value = true
  const video = document.querySelector('video')
  if (video) {
    video.play()
    if (showGift.value) {
      // video.pause()
    } else {
    }
  }
}

const close = (evt) => {
  evt.stopPropagation()
  showGift.value = false
  hasSend.value = false
  showGiftImg2.value = false
  nickname.value = ''
}

const clickInput = (e) => {
  e.stopPropagation()
}

const onSearch = (evt) => {
  evt.stopPropagation()
  if (!nickname.value) {
    Message.error({
      content: '请输入昵称',
    })
    return
  }
  hasSend.value = true
  avatar.value = avatars[Math.floor(Math.random() * avatars.length)]
}

const onSelect = (evt) => {
  evt.stopPropagation()
  showGiftImg2.value = true
  showGift.value = false
}

const confirmSend = (evt) => {
  console.log(222, '===========打印的 ------ confirmSend')
  evt.stopPropagation()
  showGiftImg2.value = false
  showGiftResult.value = true
}

const reci = (evt) => {
  evt.stopPropagation()
  showGiftResult.value = false
  showGift.value = false
  nickname.value = ''
  hasSend.value = false
  showGiftImg2.value = false
  nextTick(() => {
    showGiftResult.value = false
  })
}

const onAdd = () => {
  const name = nickname.value
  if (!name) {
    Message.error({
      content: '请输入昵称',
    })
    return
  }
  // 判断是否已经存在
  if (data.value.find((item) => item.name === name)) {
    Message.error({
      content: '昵称已存在',
    })
    return
  }
  const avatar = avatars[Math.floor(Math.random() * avatars.length)]
  avatars.splice(avatars.indexOf(avatar), 1)
  loading.value = true
  // 如果视频没有播放，就播放视频
  const video = document.querySelector('#video')
  if (video && video.paused) {
    video.play()
  }
  nickname.value = ''
  setTimeout(() => {
    rest.value -= 1
    data.value.unshift({ name, avatar, time: dayjs().format('YYYY-MM-DD HH:mm:ss') })
    loading.value = false
    Message.success({
      content: '添加成功',
    })
  }, 600)
}

const allowKey = ['wRFtz$ZC3Q&J', '89sKCEKDA^HA', 'tyr59p7TEBuM', 'snerjFSgwq8&']

onMounted(() => {
  let deviceID = localStorage.getItem('deviceID')
  if (!deviceID) {
    deviceID = Math.random().toString(36).substr(2)
  }
  const key = new URLSearchParams(location.href.split('?')[1]).get('key')
  service
    .get('https://wj.xlzy520.cn/license/bind', {
      params: {
        key,
        deviceID,
        type: 'jcc',
      },
    })
    .then((res) => {
      if (res.data.code === 20000) {
        hasAuth.value = true
        localStorage.setItem('deviceID', deviceID)
        const viaBrowserDialog = localStorage.getItem('viaBrowserDialog')
        if (!viaBrowserDialog) {
          Modal.info({
            title: '温馨提示',
            content: '建议开播之前，先走一遍流程，调整一下浏览器高度宽度进行适配',
            okText: '知道了',
            onOk(e) {
              localStorage.setItem('viaBrowserDialog', 'true')
            },
          })
        }
      } else {
        const message = res.data.message
        Modal.info({
          title: '提示',
          content: `${message}，请联系微信：appl532978`,
          okText: '知道了',
        })
      }
    })
  // if (allowKey.some((item) => window.location.href.includes(item))) {
  //   const nicknames = localStorage.getItem('nicknames') || ''
  //   allNicknames.value = nicknames.split('\n').filter((item) => item)
  //   const video = document.querySelector('#video') as HTMLVideoElement
  //   // 循环播放
  //   if (video) {
  //     video.addEventListener('ended', () => {
  //       video.play()
  //     })
  //   }
  //   // return
  // }
  // alert('非法访问')
  // location.href = 'https://ymzx.qq.com/web202312/index.html'
  // setInterval(() => {
  //   onAdd()
  // }, 5000)
})
</script>

<style lang="less">
* {
  padding: 0;
  margin: 0;
}
.container {
  padding: 30px 0;
  max-width: 70vw;
  height: 100vh;
  max-height: 100vh;
  overflow: auto;
  margin: auto;
  font-size: 40px;
}
#app {
  width: 100%;
  height: 100%;
  //background-image: url('https://zhibi-share.oss-cn-shanghai.aliyuncs.com/b644c3c691b385a07cc6a82446b2b6241557431.png');
}
video {
}
.left_logo {
  position: absolute;
  top: 10px;
  left: 6px;
  z-index: 2;
  width: 104px;
  height: 64px;
  background: url(https://images.weserv.nl/?url=https://i0.hdslb.com/bfs/article/aa13902a25cb4e8ffa759708cb3b01741557431.png) center /
    contain no-repeat;
  animation: slideDown 0.5s 1s ease-in-out both;
}
.absf {
  left: 0;
  top: 0;
  position: absolute;
  width: 100%;
  height: 100%;
}
.jcc-container {
  position: relative;
  width: 100%;
  height: 100%;
}
.jcc-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.img-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  height: 75%;
  display: flex;
  justify-content: center;
  object-fit: cover;
  cursor: pointer;
}
.img-container2 {
  height: 100%;
}
.img-container3 {
  height: 80%;
}
.img-container img {
  height: 100%;
  border-radius: 10px;
}
.nickname-box {
  position: absolute;
  right: 270px;
  top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.nickname-input {
  width: 300px;
  height: 32px;
  border-radius: 20px;
  background: #1b1c29;
  color: #fff;
  text-align: left;
  border: none;
  font-size: 20px;
  padding: 10px 20px;
  outline: none;
  transition: all 0.3s;
}
.nickname-search-icon {
  font-size: 24px;
  margin-left: -40px;
  color: #c0ae77;
}
.nickname-cloe-icon {
  font-size: 24px;
  margin-left: -40px;
  color: #c0ae77;
}
.list-box {
  position: absolute;
  left: 45%;
  top: 100px;
  width: 450px;
  height: 300px;
  background: #1b1c29;
}
.list-box2 {
  color: #ffffff;
  position: absolute;
  left: 45%;
  top: 300px;
  font-weight: bolder;
  font-size: 24px;
}
.send-box {
  width: 100%;
  height: 140px;
  position: absolute;
  bottom: 100px;
}
.list-item {
  display: flex;
  align-items: center;
  color: #ffffff;
  font-weight: bolder;
  font-size: 24px;
  justify-content: space-between;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}
.select-btn img {
  width: 80px;
  border-radius: 0px;
}
.close-btn {
  position: absolute;
  right: 210px;
  top: 15px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 333;
}

@media screen and (min-width: 1100px) {
  .nickname-box {
    right: 242px;
    top: 14px;
  }
  .close-btn {
    right: 190px;
    top: 11px;
  }
}
@media screen and (min-width: 1240px) {
  .nickname-box {
    right: 300px;
    top: 20px;
  }
  .close-btn {
    right: 238px;
    top: 20px;
  }
}
@media screen and (min-width: 1440px) {
  .nickname-box {
    right: 300px;
    top: 20px;
  }
  .close-btn {
    right: 238px;
    top: 20px;
  }
}
@media screen and (min-width: 1560px) {
  .nickname-box {
    right: 330px;
    top: 22px;
    height: 40px;
  }
  .nickname-input {
    height: 40px;
    font-size: 24px;
  }
  .close-btn {
    right: 268px;
    top: 20px;
  }
  .list-box {
    left: 42%;
    top: 130px;
    width: 600px;
  }
  .list-box2 {
    top: 400px;
  }
  .send-box {
    bottom: 120px;
  }
}
@media screen and (min-width: 1799px) {
  .nickname-box {
    right: 368px;
    top: 26px;
    height: 40px;
  }
  .nickname-input {
    height: 40px;
    font-size: 24px;
  }
  .close-btn {
    right: 303px;
    top: 25px;
  }
  .list-box {
    left: 42%;
    top: 130px;
    width: 700px;
  }
  .list-box2 {
    top: 450px;
  }
  .send-box {
    bottom: 120px;
  }
}
</style>
