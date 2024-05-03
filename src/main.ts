import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 全量导入 element ui，后续可以优化
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

import './assets/main.css'

app.mount('#app')
