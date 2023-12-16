<template>
  <div class="container">
    <div class="left_logo abs"><a href="https://ymzx.qq.com/web202312/index.html" target="_blank" class="absf"></a></div>
    <div class="text-center">
      <video
        controls
        autoplay
        preload="true"
        src="https://ymzx.lv.game.qq.com/dis_kt_051e943d711166e453474838a5ce5254_1702579567/0b53guaaoaaa2yaex4d37rs6onoda42qabya.f0.mp4"
        poster="https://game.gtimg.cn/images/ymzx/web202312pc/main-wdbU1neL.jpg"
      ></video>
    </div>
    <div class="flex items-center mt-1">
      <a-tag color="red">元梦之星会员卡</a-tag>
      <a-tag class="ml-4" color="red">星钻 * 3000</a-tag>
    </div>
    <div class="flex items-center my-2">
      <a-input v-model="nickname" placeholder="请输入玩家昵称"></a-input>
      <a-button type="primary" class="ml-4" :loading="loading" @click="onAdd">兑换</a-button>
    </div>
    <div class="bg-white h-[400px]">
      <a-table :data="data" :scroll="{ y: 400 }">
        <template #columns>
          <a-table-column title="激活名称" data-index="name"></a-table-column>
          <a-table-column title="激活状态" data-index="status">
            <template #cell>
              <a-tag color="green">激活成功</a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import LoginBanner from './components/banner.vue'
// import LoginForm from './components/login-form.vue'

const data = ref([
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
])

const nickname = ref('')
const allNicknames = ref()
const loading = ref(false)

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
  loading.value = true
  // 取出第一个昵称
  // const name = allNicknames.value.shift()
  // 添加到最后一个
  data.value.unshift({ name })
  loading.value = false
  Message.success({
    content: '添加成功',
  })
}

onMounted(() => {
  const nicknames = localStorage.getItem('nicknames') || ''
  allNicknames.value = nicknames.split('\n').filter((item) => item)

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
  max-width: 800px;
  height: 100vh;
  max-height: 100vh;
  overflow: auto;
  margin: auto;
}
#app {
  width: 100%;
  height: 100%;
  background-image: url('https://game.gtimg.cn/images/ymzx/web202312/a1/home_bg-agQLIsSH.jpg');
  background-repeat: repeat;
}
video {
  width: 800px;
  margin: auto;
}
.left_logo {
  position: absolute;
  top: 10px;
  left: 6px;
  z-index: 2;
  width: 104px;
  height: 64px;
  background: url(//game.gtimg.cn/images/ymzx/web202312pc/logo-GKu6Sdbo.png) center / contain no-repeat;
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
