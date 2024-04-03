<template>
  <div>
    <div v-if="hasAuth" class="container">
      <div class="left_logo abs"><a href="https://ymzx.qq.com/web202312/index.html" target="_blank" class="absf"></a></div>
      <!--    <div class="text-center">-->
      <!--      <video-->
      <!--        id="video"-->
      <!--        controls-->
      <!--        autoplay-->
      <!--        preload="true"-->
      <!--        src="https://ymzx.lv.game.qq.com/dis_kt_051e943d711166e453474838a5ce5254_1702579567/0b53guaaoaaa2yaex4d37rs6onoda42qabya.f0.mp4"-->
      <!--        poster="https://game.gtimg.cn/images/ymzx/web202312pc/main-wdbU1neL.jpg"-->
      <!--      ></video>-->
      <!--    </div>-->
      <div style="margin-top: 20vh">
        <div class="flex items-center justify-center mt-1 text-center w-full">
          <a-tag color="red" size="large">永劫无间测试资格</a-tag>
          <!--      <a-tag class="ml-4" color="red">元梦星宝会员卡</a-tag>-->
          <!--      <a-tag class="ml-4" color="red">星钻 * 3000</a-tag>-->
        </div>
        <div class="flex items-center justify-center mt-2">
          <a-tag size="large" :color="rest < 100 ? 'red' : 'green'">剩余名额 {{ rest }} 个</a-tag>
        </div>
        <div class="flex items-center my-2">
          <a-input v-model="nickname" placeholder="请输入游戏ID"></a-input>
          <a-button type="primary" class="ml-4" :loading="loading" @click="onAdd">提交</a-button>
        </div>
        <div class="bg-white h-[500px]">
          <a-table :data="data" :scroll="{ y: 400 }">
            <template #columns>
              <a-table-column title="游戏ID" data-index="name">
                <template #cell="{ record }">
                  <a-avatar shape="circle">
                    <img :src="record.avatar" />
                  </a-avatar>
                  <span class="ml-2">{{ record.name }}</span>
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status">
                <template #cell>
                  <a-tag color="green">成功</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="时间" data-index="time"></a-table-column>
            </template>
          </a-table>
        </div>
      </div>
    </div>
    <div v-else>未授权或设备记录已上限</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
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
        type: 'yjwj',
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
            content: '将链接转成二维码，QQ扫码打开，效果更佳',
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
  background-image: url('https://zhibi-share.oss-cn-shanghai.aliyuncs.com/b644c3c691b385a07cc6a82446b2b6241557431.png');
}
video {
  width: 800px;
  margin: auto;
  border-radius: 10px;
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
</style>
