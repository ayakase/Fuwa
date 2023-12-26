<template>
    <div class="container">
        <button @click="signInWithGoogle"> login</button>
    </div>
</template>

<script setup>
import { useUserStore } from '../stores/userStore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
const userStore = useUserStore()
const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(getAuth(), provider)
        .then((result) => {
            userStore.checkUser(result.user)
            console.log(userStore.user)
        }).catch((error) => {
            console.log(error);
        });
}
</script>

<style scoped></style>