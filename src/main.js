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
import { createI18n } from 'vue-i18n'
const vuetify = createVuetify({
    components,
    directives,
})
const i18n = createI18n({
    locale: 'ja',
    fallbackLocale: 'en',
    messages: {
        en: {
            mesasge: {
                hello: 'hello world',
            },
        },
        ja: {
            message: {
                hello: 'こんにちは、世界',
            },
        },
    },
});
const app = createApp(App)
app.use(vuetify)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ToastPlugin);

app.mount('#app')
