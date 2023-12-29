<template>
    <div class="container">
        <img class="login-bg" src="../assets/login-bg.png">
        <div class="login-btn-container">
            <img class="name-logo" src="../assets/logo.png" alt="">
            <v-btn class="login-btn" @click="signInWithGoogle"> Sign in with google
                <img src="../assets/google-icon.png" class="icon" alt="">
            </v-btn>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from '../stores/userStore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification';
const $toast = useToast();
const router = useRouter()
const userStore = useUserStore()
const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(getAuth(), provider)
        .then((result) => {
            userStore.checkUser(result.user)
            console.log(userStore.user)
            $toast.success('Logged in as ' + result.user.displayName);
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
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    /* background-color: #202124; */
}

.login-btn {
    height: 3rem !important;
    font-size: large;
}

.icon {
    height: 3rem;
}

.login-bg {
    height: 100vh;
    width: 50%;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.login-btn-container {
    width: 100%;
    height: 100%;
    margin-top: 30%;
    display: flex;
    flex-direction: column;
    align-items: center;
}


.name-logo {
    height: 10rem;
    width: 10rem;
    /* transform: translateY(-100px); */

}

.name-logo:hover {
    /* Start the shake animation and make the animation last for 0.5 seconds */
    animation: shake 0.5s;

    /* When the animation is finished, start again */
    animation-iteration-count: infinite;
}

@keyframes shake {
    0% {
        transform: translate(1px, 1px) rotate(0deg);
    }

    10% {
        transform: translate(-1px, -2px) rotate(-1deg);
    }

    20% {
        transform: translate(-3px, 0px) rotate(1deg);
    }

    30% {
        transform: translate(3px, 2px) rotate(0deg);
    }

    40% {
        transform: translate(1px, -1px) rotate(1deg);
    }

    50% {
        transform: translate(-1px, 2px) rotate(-1deg);
    }

    60% {
        transform: translate(-3px, 1px) rotate(0deg);
    }

    70% {
        transform: translate(3px, 1px) rotate(-1deg);
    }

    80% {
        transform: translate(-1px, -1px) rotate(1deg);
    }

    90% {
        transform: translate(1px, 2px) rotate(0deg);
    }

    100% {
        transform: translate(1px, -2px) rotate(-1deg);
    }
}

@media only screen and (max-width: 800px) {
    .login-bg {
        display: none;
    }
}
</style>