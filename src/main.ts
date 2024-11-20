import { createApp } from 'vue'
import '@/assets/index.scss'
import App from './App.vue'

import eruda from 'eruda'

const app = createApp(App)
app.mount('#app')
eruda.init()
