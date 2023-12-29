<template>
    <div class="container">
        <v-btn class="login-btn" @click="signInWithGoogle"> Sign in with google
            <img src="../assets/google-icon.png" class="icon" alt="">
        </v-btn>
    </div>
</template>

<script setup>
import { useUserStore } from '../stores/userStore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'vue-router'
const router = useRouter()

const userStore = useUserStore()
const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(getAuth(), provider)
        .then((result) => {
            userStore.checkUser(result.user)
            console.log(userStore.user)
            router.push('/')
        }).catch((error) => {
            console.log(error);
        });
}
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    transform: translateY(-100px);
}

.login-btn {
    height: 3rem !important;
    font-size: large;

}

.icon {
    height: 3rem;
}
</style>