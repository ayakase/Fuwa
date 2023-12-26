<template>
    <div class="container">
        <div>
            <p>theme</p>
            <button @click="toggleTheme">Toggle</button>
            <v-icon size="large" color="green-darken-2" :icon="themeState"></v-icon>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { computed } from 'vue';
import { useTheme } from 'vuetify'
import { useCookies } from "vue3-cookies";
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
const $toast = useToast();

let { cookies } = useCookies()
const theme = useTheme()
function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    $toast.info("Theme changed to " + theme.global.name.value);
    cookies.set('theme', theme.global.name.value)

}
const themeState = computed(() => {
    if (theme.global.current.value.dark == true) {
        return 'mdi-moon-waning-crescent'

    } else {
        return 'mdi-weather-sunny'
    }
})
onMounted(() => {
    const themeValue = cookies.get('theme');
    console.log(themeValue)
    if (themeValue === null) {
        // If it doesn't exist, set its value to 'white'
        cookies.set('theme', 'light');
    }
    theme.global.name.value = cookies.get('theme')
})
</script>

<style scoped>
.container {
    height: 100%;
    width: 100%;
    padding: 2rem;
}
</style>