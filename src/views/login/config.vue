<template>
  <div class="container bg-white p-4">
    <div class="text-red-500 font-5">配置昵称列表, 换行分割</div>
    <a-button type="primary" @click="onAdd" class="my-2">添加</a-button>
    <a-textarea v-model="nicknames" :auto-size="{ minRows: 15, maxRows: 30 }" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import LoginBanner from './components/banner.vue'
// import LoginForm from './components/login-form.vue'

const nicknames = ref('')

const onAdd = () => {
  console.log(nicknames.value, '===========打印的 ------ onAdd')
  localStorage.setItem('nicknames', nicknames.value)
  Message.success({
    content: '添加成功',
  })
}

onMounted(() => {
  const nicknameStr = localStorage.getItem('nicknames') || ''
  nicknames.value = nicknameStr
})
</script>

<style lang="less">
* {
  padding: 0;
  margin: 0;
}
.container {
  max-width: 800px;
  height: 100%;
  min-height: 100vh;
  margin: auto;
}
#app {
  width: 100%;
  height: 100%;
  background-image: url('https://game.gtimg.cn/images/ymzx/web202312/a1/home_bg-agQLIsSH.jpg');
}
video {
  width: 80%;
}
.left_logo {
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
