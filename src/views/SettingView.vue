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
                <div class="image-themes">
                    <v-card class="each-them" v-for="item in imageThemes" title="Card title" text="" variant="tonal">
                        <v-img :src="item.image">

                        </v-img>
                    </v-card>
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
                <div style="display: flex; flex-direction: row;align-items: center;gap: 1rem;">
                    <v-text-field class="name-field" v-model="userInfo.displayName" variant="underlined"></v-text-field>
                    <v-btn style="background-color: green;color: white;" @click="saveName">Save</v-btn>
                </div>
                <div class="about-setting">
                    About Me:
                </div>
                <div style="display: flex; flex-direction: row;align-items: center;gap: 1rem;">
                    <v-text-field class="name-field" v-model="userInfo.about" variant="underlined"></v-text-field>
                    <v-btn style="background-color: green;color: white;" @click="saveAbout">Save</v-btn>
                </div>
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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

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
    cookies.set('theme', theme.global.name.value, 60 * 60 * 24 * 30)

}
const themeState = computed(() => {
    if (theme.global.current.value.dark == true) {
        return 'mdi-moon-waning-crescent'

    } else {
        return 'mdi-weather-sunny'
    }
})
const imageThemes = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1432847712612-926caafaa802?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D",
        themeMode: ""
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1432847712612-926caafaa802?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D",
        themeMode: ""
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1432847712612-926caafaa802?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D",
        themeMode: ""
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1432847712612-926caafaa802?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D",
        themeMode: ""
    },
    {
        id: 5,
        image: "https://images.unsplash.com/photo-1432847712612-926caafaa802?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D",
        themeMode: ""
    },

]
async function saveName() {
    if (userInfo.value.displayName.length < 2 || userInfo.value.displayName.length > 30) {
        $toast.error("Display name must have more than 2 characters and less than 30 characters");
    } else {
        console.log(userInfo.value.displayName)
        const userRef = doc(db, "users", userId.value)
        await updateDoc(userRef, {
            displayName: userInfo.value.displayName
        })
        $toast.success("Successfully changed your display name");
    }
}
async function saveAbout() {
    if (userInfo.value.about.length < 2 || userInfo.value.about.length > 30) {
        $toast.error("Display name must have more than 2 characters and less than 30 characters");
    } else {
        console.log(userInfo.value.about)
        const userRef = doc(db, "users", userId.value)
        await updateDoc(userRef, {
            about: userInfo.value.about
        })
        $toast.success("Successfully changed your about profile");
    }
}
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
        cookies.set('theme', 'light', 60 * 60 * 24 * 30);
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
    display: flex;
    flex-direction: column;
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

.image-themes {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}
</style>