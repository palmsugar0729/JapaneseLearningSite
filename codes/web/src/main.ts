import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/reset.scss'
import './styles/theme.scss'
import './styles/global.scss'

createApp(App).use(router).mount('#app')
