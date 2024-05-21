import { createI18n } from 'vue-i18n'

const language = createI18n({
    locale: 'en',
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
export default language;
