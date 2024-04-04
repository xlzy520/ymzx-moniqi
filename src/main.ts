console.log(1, '===========打印的 ------ ')
import globalComponents from '@/components'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import { createApp } from 'vue'
import App from './App.vue'
import directive from './directive'
import i18n from './locale'
import './mock'
import router from './router'
import store from './store'

console.log(2, '===========打印的 ------ ')
// Styles are imported via arco-plugin. See config/plugin/arcoStyleImport.ts in the directory for details
// 样式通过 arco-plugin 插件导入。详见目录文件 config/plugin/arcoStyleImport.ts
// https://arco.design/docs/designlab/use-theme-package
import '@/api/interceptor'
import '@/assets/style/global.less'

console.log(3, '===========打印的 ------ ')

const app = createApp(App)

app.use(ArcoVue, {})

app.use(ArcoVueIcon)

app.use(router)
app.use(store)
app.use(i18n)
app.use(globalComponents)
app.use(directive)
console.log(4, '===========打印的 ------ ')

app.mount('#app')
