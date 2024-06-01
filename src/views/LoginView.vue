<template>
    <div class="container">
        <img class="login-bg" src="../assets/login-bg.png">
        <div class="left-section">
            <img class="name-logo" src="../assets/logo.png" alt="">

            <v-card width="450" elevation="5" style="background-color: white;color:black">
                <v-tabs v-model="tab" grow color="light-green-darken-1">
                    <v-tab value="one">Sign in</v-tab>
                    <v-tab value="two">Sign up</v-tab>
                </v-tabs>

                <v-card-text>
                    <v-tabs-window v-model="tab">
                        <v-tabs-window-item value="one">
                            <div style="display: flex;flex-direction: column;gap:1rem;padding-bottom: .2rem;">
                                <v-text-field v-model="loginEmail" label="Email" variant="outlined" single-line
                                    hide-details></v-text-field>
                                <v-text-field v-model="loginPassword" label="Password" variant="outlined" single-line
                                    hide-details></v-text-field>
                                <v-dialog max-width="500">
                                    <template v-slot:activator="{ props: activatorProps }">
                                        <a v-bind="activatorProps" href="" @click.prevent="">Forgot password ?</a>
                                    </template>
                                    <template v-slot:default="{ isActive }">
                                        <v-card title="Receive password reset link">
                                            <v-card-item>
                                                <v-text-field v-model="resetEmail" label="Your email" variant="outlined"
                                                    single-line hide-details></v-text-field>
                                            </v-card-item>

                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn @click="sendResetLink" text="Send reset link"></v-btn>
                                                <!-- <v-btn text="Close Dialog" @click="isActive.value = false"></v-btn> -->
                                            </v-card-actions>
                                        </v-card>
                                    </template>
                                </v-dialog>

                                <v-btn class="login-btn" @click="loginWithEmailAndPassword"> Sign in
                                </v-btn>
                                <v-btn class=" login-btn" @click="signInWithGoogle"> Sign in with google
                                    <img src="../assets/google-icon.png" class="icon" alt="">
                                </v-btn>
                                <v-btn class="login-btn" @click="signInWithGithub"> Sign in with github
                                    <img src="../assets/github.png" class="icon" alt="">
                                </v-btn>
                                <a href="" @click.prevent="tab = 'two'">Don't have an account ? Sign up right now</a>
                            </div>

                        </v-tabs-window-item>

                        <v-tabs-window-item value="two">
                            <div style="display: flex;flex-direction: column;gap:1rem;padding-bottom: .2rem;">
                                <v-text-field v-model="registerEmail" label="Email" variant="outlined" single-line
                                    hide-details></v-text-field>
                                <v-text-field v-model="registerPassword" label="Password" variant="outlined" single-line
                                    hide-details></v-text-field>
                                <v-btn class="login-btn" @click="registerWithEmailAndPassword"> Sign up
                                </v-btn>
                                <!-- <v-btn class=" login-btn" @click="signInWithGoogle"> Sign in with google
                                    <img src="../assets/google-icon.png" class="icon" alt="">
                                </v-btn>
                                <v-btn class="login-btn" @click="signInWithGithub"> Sign in with github
                                    <img src="../assets/github.png" class="icon" alt="">
                                </v-btn> -->
                                <a href="" @click.prevent="tab = 'one'">Already have an account ? Sign in</a>
                            </div>
                        </v-tabs-window-item>

                    </v-tabs-window>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from '../stores/userStore';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    GithubAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification';
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator'
const auth = getAuth()
const toast = useToast();
const router = useRouter()
const userStore = useUserStore()
const tab = ref('one')
function generateName() {
    const shortName = uniqueNamesGenerator({
        dictionaries: [colors, animals], // colors can be omitted here as not used
        length: 2,
        separator: ' '
    });
    console.log(shortName)
    return shortName
}
async function addUserToDb(user) {
    try {
        const querySnapshot = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
        if (!querySnapshot.empty) {
            return;
        } else {
            const docRef = await addDoc(collection(db, "users"), {
                uid: user.uid,
                displayName: user.displayName || generateName(),
                email: user.email,
                avatar: user.photoURL,
                about: '',
                boxes: [],
                cid: '',
            });
        }
    }
    catch (e) {
        console.error("Error adding document: ", e);

    }
}
async function getUser(user) {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
    querySnapshot.forEach((doc) => {
        userInfo.value = doc.data();
        userStore.changeUserInfo(userInfo.value);
        userStore.changeUserId(doc.id)
    });
}
const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(getAuth(), provider)
        .then((result) => {
            userStore.checkUser(result.user)
            addUserToDb(auth.currentUser)
            // console.log(auth.currentUser)
            toast.success('Logged in as ' + result.user.displayName, {
                position: 'top-right'
            });
            // window.location.reload();
            router.push('/explore')
        }).catch((error) => {
            console.log(error);
        });
}
const signInWithGithub = () => {
    const provider = new GithubAuthProvider()
    signInWithPopup(getAuth(), provider)
        .then((result) => {
            userStore.checkUser(result.user)
            addUserToDb(auth.currentUser)
            // console.log(auth.currentUser)
            toast.success('Logged in as ' + result.user.displayName, {
                position: 'top-right'
            });
            // window.location.reload();
            router.push('/explore')
        }).catch((error) => {
            console.log(error);
        });
}

const registerEmail = ref('')
const registerPassword = ref('')
const registerWithEmailAndPassword = () => {
    // toast.success(registerEmail.value + ' ' + registerPassword.value, {
    //     position: 'top-right'
    // });
    createUserWithEmailAndPassword(getAuth(), registerEmail.value, registerPassword.value)
        .then((result) => {
            userStore.checkUser(result.user)
            addUserToDb(auth.currentUser)
            // console.log(auth.currentUser)
            toast.success('Logged in as ' + result.user.displayName, {
                position: 'top-right'
            });
            // window.location.reload();
            router.push('/explore')
        }).catch((error) => {
            console.log(error.message);
            toast.error(error.message, {
                position: 'top-right'
            });
        });
}
const loginEmail = ref('')
const loginPassword = ref('')
const loginWithEmailAndPassword = () => {
    // toast.success(registerEmail.value + ' ' + registerPassword.value, {
    //     position: 'top-right'
    // });
    signInWithEmailAndPassword(getAuth(), loginEmail.value, loginPassword.value)
        .then((result) => {
            userStore.checkUser(result.user)
            addUserToDb(auth.currentUser)
            // console.log(auth.currentUser)
            toast.success('Logged in', {
                position: 'top-right'
            });
            // window.location.reload();
            router.push('/explore')
        }).catch((error) => {
            console.log(error.message);
            toast.error(error.message, {
                position: 'top-right'
            });
        });
}
const resetEmail = ref('')
const sendResetLink = () => {
    toast.success(resetEmail.value, {
        position: 'top-right'
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
    background-color: white;
}

a {
    color: green;
}

.login-btn {
    height: 3rem !important;
    /* width: 30%; */
    font-size: large;
    background-color: white;
    color: black;
}

.icon {
    height: 3rem;
}

.login-bg {
    height: 100vh;
    width: 50%;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.left-section {
    width: 100%;
    height: 100%;
    gap: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 5%;
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