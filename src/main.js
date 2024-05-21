import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ToastPlugin from 'vue-toast-notification';
import language from './utils/language'
const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App)
app.use(vuetify)
app.use(createPinia())
app.use(router)
app.use(ToastPlugin);
app.use(language)
app.mount('#app')
