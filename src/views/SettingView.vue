<template>
    <div class="container">
        <!-- <h1 class="setting-title">Settings</h1> -->
        <v-card-title style="padding: 0;font-size: 1.5rem;"> System settings</v-card-title>
        <div class="setting-container">
            <v-card class="system-setting" variant="tonal">
                <div class="theme-mode">
                    <p>Theme:</p>
                    <v-btn @click="toggleTheme" :icon="themeState">
                    </v-btn>
                </div>
            </v-card>
            <v-card-title style="padding: 0;font-size: 1.5rem;"> Profile settings</v-card-title>

            <v-card class="profile-setting" variant="tonal" v-if="userStore.userInfo">
                <div class="email-setting">
                    Email:
                </div>
                <v-text-field class="email-field" :model-value="userInfo.email" variant="underlined"
                    disabled></v-text-field>
                <div class="name-setting">
                    Display Name:
                </div>
                <v-text-field class="name-field" :model-value="userInfo.displayName" variant="underlined"></v-text-field>
                <div class="avatar-setting">
                    Avatar:
                </div>
                <div class="avatar-field" style="display: flex;flex-direction: column;gap: 1rem;">
                    <img v-if="userInfo.avatar" :src="userInfo.avatar" style="width: 10rem;height: 10rem;">
                    <v-btn style="background-color: green;color: white;width: 10rem;">Change avatar</v-btn>
                </div>
            </v-card>
        </div>

        <div class="pa-2 sign-out">
            <v-btn color="error" v-if="user" @click="handleSignOut()" block>
                Sign Out
            </v-btn>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { computed } from 'vue';
import { useTheme } from 'vuetify'
import { useCookies } from "vue3-cookies";
import { useToast } from 'vue-toast-notification';
import { signOut, getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router'
import { storeToRefs } from "pinia";

import 'vue-toast-notification/dist/theme-sugar.css';
const $toast = useToast();
const auth = getAuth()
import { useUserStore } from '../stores/userStore';
const user = ref()
const userStore = useUserStore()
const router = useRouter()
const { userInfo } = storeToRefs(userStore);
const { userId } = storeToRefs(userStore);

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
const handleSignOut = () => {
    signOut(auth).then(() => {
        user.value = null
        $toast.info('Signed Out, redirecting in 3s');
        setTimeout(() => {
            location.reload();
        }, 3000);
    }).catch((error) => {
        console.log(error)
    });
}
onMounted(() => {

    const themeValue = cookies.get('theme');
    if (themeValue === null) {
        // If it doesn't exist, set its value to 'white'
        cookies.set('theme', 'light');
    }
    theme.global.name.value = cookies.get('theme')
    onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
    })
})
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    padding: 2rem;
}

.sign-out {
    width: 10%;
}

.setting-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
}

.theme-mode {
    font-size: larger;
    display: flex;
    align-items: center;
    width: 10rem;
    justify-content: space-between;
}

.system-setting {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

/* .profile-setting {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
} */
.profile-setting {
    display: grid;
    grid-template-columns: 10% 50%;
    grid-template-rows: 20% 20% 50%;
    padding: 1rem;
}

.email-setting {
    grid-column: 1/2;
    grid-row: 1/2;
    display: flex;
    align-items: center;

}

.email-field {
    grid-column: 2/3;
    grid-row: 1/2;
}

.name-setting {
    display: flex;
    align-items: center;
    grid-row: 2/3;
    grid-column: 1/2;
}

.name-field {
    grid-row: 2/3;
    grid-column: 2/3;
}

.avatar-setting {
    display: flex;
    align-items: center;
    grid-row: 3/4;
    grid-column: 1/2;
}

.avatar-field {
    grid-row: 3/4;
    grid-column: 2/3;
}
</style>