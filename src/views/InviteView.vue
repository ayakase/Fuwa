<template>
    <div class="container">
        <v-card style="width: 80%;height: 100%;position: relative;" v-if="boxInfo" elevation="20">
            <img style="top:0; height: 30%; width: 100%; object-fit: cover;filter: brightness(70%)"
                :src="boxInfo.banner" alt="https://ceblog.s3.amazonaws.com/wp-content/uploads/2012/03/cupcakeIpsum.jpg">
            <div style="display: flex;justify-content: center; transform: translateY(-10rem)">
                <img class="thumbnail" :src="boxInfo.thumbnail" alt="">
            </div>
            <v-card-title style="font-size: xx-large;">
                {{ boxInfo.title }}
            </v-card-title>

            <v-card-subtitle>
                {{ boxInfo.description }}
            </v-card-subtitle>
            <v-card-actions>

                <div style="display: flex;justify-content: center;width: 100%;">
                    <v-btn size="x-large" v-if="user"> Join us! &nbsp; <v-icon
                            icon="fa-solid fa-arrow-right-to-bracket fa-beat-fade"></v-icon>
                    </v-btn>
                    <v-btn @click="router.push('/login')" size="x-large" v-if="!user"> Sign up, login and join us!
                        &nbsp; <v-icon icon="fa-solid fa-arrow-right-to-bracket fa-beat-fade"></v-icon>
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
        <div v-else>
            <div class="loader"></div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db } from "../firebaseConfig";
import LoadingComponent from "../components/LoadingComponent.vue"
import { useRouter } from 'vue-router';
const router = useRouter()
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDocs, collection, where, query, arrayUnion } from 'firebase/firestore'
const route = useRoute();
const inviteId = ref(route.params.id)
const boxInfo = ref()
const auth = getAuth()
const user = ref()
const q = query(collection(db, "boxes"), where("invite", '==', inviteId.value))
async function fetchBox() {
    let box = await getDocs(q)
    boxInfo.value = box.docs[0].data()
    console.log(boxInfo.value)
}
onMounted(() => {
    fetchBox()
    onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
    })
})
</script>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loader {
    width: 100px;
    aspect-ratio: 1;
    display: grid;
    border: 8px solid #0000;
    border-radius: 50%;
    border-color: #ccc #0000;
    animation: l16 1s infinite linear;
}

.loader::before,
.loader::after {
    content: "";
    grid-area: 1/1;
    margin: 2px;
    border: inherit;
    border-radius: 50%;
}

.loader::before {
    border-color: #f03355 #0000;
    animation: inherit;
    animation-duration: .5s;
    animation-direction: reverse;
}

.loader::after {
    margin: 8px;
}

@keyframes l16 {
    100% {
        transform: rotate(1turn)
    }
}

.thumbnail {
    width: 20%;
    border-radius: 9999px;
    background-color: whitesmoke;
}
</style>