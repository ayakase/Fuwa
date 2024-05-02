<template>
    <div class="container">
        <v-card>
            <v-layout>
                <v-navigation-drawer :width="400" v-model="drawer" :rail="rail" permanent @click="rail = false"
                    location="right">
                    <v-list-item prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg" title="John Leider"
                        nav>
                        <template v-slot:append>
                            <v-btn icon="mdi-chevron-left" variant="text" @click.stop="rail = !rail"></v-btn>
                        </template>
                    </v-list-item>

                    <v-divider></v-divider>

                    <v-list density="compact" nav>
                        <v-list-item prepend-icon="mdi-home-city" title="Home" value="home"></v-list-item>
                        <v-list-item prepend-icon="mdi-account" title="My Account" value="account"></v-list-item>
                        <v-list-item prepend-icon="mdi-account-group-outline" title="Users" value="users"></v-list-item>
                    </v-list>
                </v-navigation-drawer>
                <v-main style="height: 100vh; padding: 1rem;">
                    <h2>{{ route.params.id }}</h2>
                    <div>
                        <video @click="videoFocused = !videoFocused" :class="{ 'video-focused': videoFocused }"
                            ref="videoElement" autoplay></video>
                    </div>

                    <div class="control-buttons">
                        <v-btn elevation="10" @click="hangUp" icon="mdi-phone-hangup" size="large"
                            style="background-color: red; font-size: larger;"></v-btn>
                        <!-- <v-btn elevation="10" @click="toggleCamera" icon="mdi-camera-off" size="large"
                            style="font-size: larger;"></v-btn>
                        <v-btn elevation="10" @click="toggleMic" icon="mdi-microphone-off" size="large"
                            style="font-size: larger;"></v-btn> -->
                        <v-btn elevation="10" icon="mdi-account-supervisor" size="large"
                            style="font-size: larger;"></v-btn>
                    </div>

                </v-main>
            </v-layout>
        </v-card>
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'
const route = useRoute()
const videoElement = ref(null);
let stream = null;
const videoFocused = ref(false)
const drawer = ref(true)
const rail = ref(true)
const openCamera = async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoElement.value.srcObject = stream;
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}

const hangUp = () => {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }
}

onMounted(() => {
    openCamera();
})
</script>

<style scoped>
.container {
    position: relative;
    height: 100vh;
}

video {
    border-radius: 1rem;
    width: 25%;
    transition: all .5s ease-in-out;
}

.video-focused {
    left: 0;
    width: 50%;
    height: 50%;
}

.control-buttons {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    position: absolute;
    gap: 1rem;
    bottom: 2rem;
}
</style>
