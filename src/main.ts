import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import '@fontsource/zalando-sans-expanded/400.css'
import '@fontsource/zalando-sans-expanded/700.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
