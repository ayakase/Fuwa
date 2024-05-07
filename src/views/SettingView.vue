<template>
    <div class="container">
        <!-- <h1 class="setting-title">Settings</h1> -->
        <div class="setting-container">
            <v-card-title style="padding: 0;font-size: 1.5rem;"> System settings</v-card-title>
            <v-card class="system-setting" variant="tonal">
                <div class="theme-mode">
                    <p>Color theme:</p>
                    <v-btn @click="toggleTheme" :icon="themeState">
                    </v-btn>
                </div>
                <div class="image-themes">
                    <v-card @click="selectTheme(theme.id)" :class="{ 'selected-theme': (themeCheck == theme.id) }"
                        class="each-theme" v-for="theme in  themesArray " variant="flat">
                        <v-card-title>
                            {{ theme.name }}
                        </v-card-title>
                        <v-img v-if="theme.image" cover height="120" :src="theme.image">
                        </v-img>
                    </v-card>
                </div>
                <div>
                    <div style="width: 30%;display: flex; flex-direction: row; align-items: flex-start; gap: 2rem;">
                        <!-- <v-btn @click="showColorPicker = !showColorPicker"> Change Primary color
                        </v-btn> -->
                        <div
                            style="display: flex; flex-direction: column; align-items: center;gap: 1rem;padding:1rem; background-color: var(--main-color); border-radius:.5rem;">
                            <div>Change primary color</div>
                            <div>
                                <v-color-picker v-model="colorCode" show-swatches elevation="15"></v-color-picker>
                            </div>
                            <v-btn @click="confirmColor()">
                                Confirm color change
                            </v-btn>
                        </div>
                    </div>
                    <!-- <v-btn @click="showNotification()">Show Notification</v-btn> -->

                </div>
            </v-card>
            <v-card-title style="padding: 0;font-size: 1.5rem;"> Profile settings</v-card-title>

            <v-card class="profile-setting" variant="tonal" v-if="userStore.userInfo">
                <div style="flex:1">
                    <div class="email-setting">
                        Email:
                    </div>
                    <v-text-field class="email-field" :model-value="userInfo.email" variant="underlined"
                        disabled></v-text-field>
                    <div class="name-setting">
                        Display Name:
                    </div>
                    <div style="display: flex; flex-direction: row;align-items: center;gap: 1rem;">
                        <v-text-field class="name-field" v-model="userInfo.displayName"
                            variant="underlined"></v-text-field>
                        <v-btn style="background-color: green;color: white;" @click="saveName">Save</v-btn>
                    </div>
                    <div class="name-setting">
                        Connection ID:
                    </div>
                    <div style="display: flex; flex-direction: row;align-items: center;gap: 1rem;">
                        <v-text-field class="name-field" v-model="userInfo.cid" variant="underlined"></v-text-field>
                        <v-btn style="background-color: green;color: white;" @click="saveCid">Save</v-btn>
                    </div>
                    <div class="about-setting">
                        About Me:
                    </div>
                    <div style="display: flex; flex-direction: row;align-items: center;gap: 1rem;">
                        <v-textarea class="name-field" v-model="userInfo.about" variant="underlined"></v-textarea>
                        <v-btn style="background-color: green;color: white;" @click="saveAbout">Save</v-btn>
                    </div>

                </div>
                <div style="width: 20rem;">
                    <div class="avatar-field" style="display: flex;flex-direction: column;gap: 1rem;">
                        <img v-if="userInfo.avatar" :src="userInfo.avatar" style="width: 100%;aspect-ratio:1;">
                        <v-dialog>
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-btn v-bind="activatorProps" style="background-color: green;color: white;">Change
                                    avatar</v-btn>
                            </template>
                            <template v-slot:default="{ isActive }">
                                <v-card style="display: flex; flex-direction: column;align-items: center;padding:1rem;">
                                    <v-file-input accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                                        style="width:50%" prepend-icon="" class="img-input" id="formFile"
                                        @change="processImg" label="Image" variant="solo-filled"></v-file-input>
                                    <div style="max-width: 50%;">
                                        <cropper :src="thumbnailSrc" @change="change"
                                            :stencil-props="{ aspectRatio: 1 }" :stencil-component="CircleStencil" />
                                        <!-- <img :src="cropImg" alt=""> -->
                                    </div>
                                    <v-card-actions>
                                        <v-btn color="error" @click="isActive.value = false">
                                            Cancel
                                        </v-btn>
                                        <v-btn color="success" @click="uploadAvatar()">
                                            Save Avatar
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </template>
                        </v-dialog>

                    </div>
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
import { computed, watch } from 'vue';
import { useTheme } from 'vuetify'
import { useCookies } from "vue3-cookies";
import { useToast } from 'vue-toast-notification';
import { signOut, getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router'
import { storeToRefs } from "pinia";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { getStorage, ref as firebaseRef, uploadBytes, getDownloadURL } from "firebase/storage";
const auth = getAuth()
const router = useRouter()
import 'vue-toast-notification/dist/theme-sugar.css';
const toast = useToast();
import { useUserStore } from '../stores/userStore';
const user = ref()
const userStore = useUserStore()
const { userId, userInfo } = storeToRefs(userStore);

// const {  } = storeToRefs(userStore);
let { cookies } = useCookies()
const theme = useTheme()
const emit = defineEmits(['changeBg'])

// const thumbnailImg = ref(null);
const thumbnailSrc = ref();
function processImg(event) {
    if (event.target.files.length) {
        thumbnailSrc.value = URL.createObjectURL(event.target.files[0]);
    }
    // thumbnailImg.value = event.target.files[0];
}
const cropImg = ref()
function change({ coordinates, canvas }) {
    console.log(coordinates, canvas);
    canvas.toBlob((blob) => {
        cropImg.value = blob;
        console.log(cropImg.value);
    });

}
const storage = getStorage();

function uploadAvatar() {
    //   imgUploading.value = true
    let now = new Date();
    let time = now.getTime().toString();
    const storageRef = firebaseRef(storage, 'avatars/' + time + '.png')
    uploadBytes(storageRef, cropImg.value).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            const userRef = doc(db, 'users', userStore.userId);
            await updateDoc(userRef, {
                avatar: downloadURL
            })
            toast.success("Successfully changed avatar", {
                position: 'top-right'
            });
            setTimeout(() => {
                window.location.reload()
            }, 1000);
        })
    });

}
function showNotification() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
    } else if (Notification.permission === "granted") {
        // If notification permission is already granted, show the notification
        var notification = new Notification("Hello, world!");
    } else if (Notification.permission !== 'denied') {
        // Otherwise, request permission from the user
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, show the notification
            if (permission === "granted") {
                var notification = new Notification("Hello, world!");
            }
        });
    }
}

function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    toast.info("Theme changed to " + theme.global.name.value, {
        position: 'top-right'
    });
    cookies.set('theme', theme.global.name.value, 60 * 60 * 24 * 30)
}
const themeState = computed(() => {
    if (theme.global.current.value.dark == true) {
        return 'fa-regular fa-moon'
    } else {
        return 'fa-regular fa-sun'
    }
})

const colorCode = ref(cookies.get('main-color'))
function confirmColor() {
    document.documentElement.style.setProperty('--main-color', colorCode.value);
    cookies.set('main-color', colorCode.value, 60 * 60 * 24 * 30)
}

const themesArray = [
    {
        id: 0,
        name: 'Basic Dark',
        image: "",
        themeMode: "dark"
    },
    {
        id: 1,
        name: 'Night City',
        image: "https://images.unsplash.com/photo-1432847712612-926caafaa802?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D",
        themeMode: "dark"
    },
    {
        id: 2,
        name: "Azure Mist",
        image: "https://t4.ftcdn.net/jpg/04/61/47/03/360_F_461470323_6TMQSkCCs9XQoTtyer8VCsFypxwRiDGU.jpg",
        themeMode: "dark"
    },
    {
        id: 3,
        name: "Retro",
        image: "https://c4.wallpaperflare.com/wallpaper/1015/936/992/new-retro-wave-neon-synthwave-retro-style-wallpaper-preview.jpg",
        themeMode: "dark"
    },
    {
        id: 4,
        name: "Monokai",
        image: "https://i.pinimg.com/originals/7b/54/0f/7b540fe9d8a5f87b3388713f87c63ed7.jpg",
        themeMode: "dark"
    },
    {
        id: 5,
        name: "Basic Light",
        image: "",
        themeMode: "light"
    },
    {
        id: 6,
        name: "Luminosity",
        image: "https://img.freepik.com/free-vector/abstract-style-bokeh-background_23-2148459410.jpg?size=626&ext=jpg&ga=GA1.1.553209589.1713830400&semt=ais",
        themeMode: "light"
    },
    {
        id: 7,
        name: "Arid expanse",
        image: "https://images.pexels.com/photos/210307/pexels-photo-210307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        themeMode: "light"
    },
    {
        id: 8,
        name: "Aether",
        image: "https://images6.alphacoders.com/132/1327974.png",
        themeMode: "light"
    },
    {
        id: 9,
        name: "Marine",
        image: "https://wallpapers.com/images/hd/water-background-74ofenln6env6puh.jpg",
        themeMode: "light"
    },

]
async function saveName() {
    if (userInfo.value.displayName.length < 4 || userInfo.value.displayName.length > 30) {
        toast.error("Display name must have more than 4 characters and less than 30 characters", {
            position: 'top-right'
        });
    } else {
        const userRef = doc(db, "users", userId.value)
        await updateDoc(userRef, {
            displayName: userInfo.value.displayName
        })
        toast.success("Successfully changed your display name", {
            position: 'top-right'
        });
    }
}
async function saveCid() {
    const regex = /^[a-zA-Z]+#\d+$/;
    const connectionId = userInfo.value.cid.trim();

    if (connectionId === "") {
        const userRef = doc(db, "users", userId.value);
        await updateDoc(userRef, { cid: "" });
        toast.success("Successfully cleared your Connection Id", {
            position: 'top-right'
        });
    } else if (!regex.test(connectionId)) {
        toast.error("Connection Id must follow text#number format", {
            position: 'top-right'
        });
    } else {
        const userRef = doc(db, "users", userId.value);
        await updateDoc(userRef, { cid: connectionId });
        toast.success("Successfully changed your Connection Id", {
            position: 'top-right'
        });
    }
}

async function saveAbout() {
    if (userInfo.value.about.length < 2 || userInfo.value.about.length > 1000) {
        toast.error("Description must have more than 1 characters and less than 1000 characters", {
            position: 'top-right'
        });
    } else {
        const userRef = doc(db, "users", userId.value)
        await updateDoc(userRef, {
            about: userInfo.value.about
        })
        toast.success("Successfully changed your about profile", {
            position: 'top-right'
        });
    }
}
const handleSignOut = () => {
    signOut(auth).then(() => {
        user.value = null
        toast.info('Signed Out, redirecting in 3s', {
            position: 'top-right'
        });
        setTimeout(() => {
            location.reload();
        }, 3000);
    }).catch((error) => {
        console.log(error)
    });
}
let themeCheck = ref(cookies.get('themeId'))
function selectTheme(id) {
    cookies.set('themeId', id, 60 * 60 * 24 * 30);
    cookies.set('theme', themesArray[id].themeMode, 60 * 60 * 24 * 30)
    theme.global.name.value = themesArray[id].themeMode
    cookies.set('bgImage', themesArray[id].image, 60 * 60 * 24 * 30)
    emit('changeBg')
    toast.success(`Theme changed to ${themesArray[id].name}`, {
        position: 'top-right'
    });
    themeCheck.value = cookies.get('themeId')
}
async function getUser(user) {
    if (user) {
        const querySnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
        if (querySnapshot.empty) {
            await new Promise(resolve => setTimeout(resolve, 200));
            await getUser(user);
            return;
        }

        querySnapshot.forEach((doc) => {
            userInfo.value = doc.data();
            userStore.changeUserInfo(userInfo.value);
            userStore.changeUserId(doc.id);
        });
    }
}
onMounted(() => {
    console.log(userInfo.displayName)
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
    overflow: scroll;
    overflow-x: hidden;
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
    flex-direction: row;
    gap: 2rem;
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
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: space-between
}

.each-theme {
    width: 16%;
    padding: 1rem;
}

img {
    object-fit: cover;
}

.selected-theme {
    transition: all 0.2s linear;
    background-color: var(--main-color);
    transform: scale(1.05);
    color: white;
}
</style>