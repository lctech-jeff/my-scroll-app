import { createApp } from 'vue'
import '@/assets/index.scss'
import App from './App.vue'

import eruda from 'eruda'

createApp(App).mount('#app')
eruda.init()
