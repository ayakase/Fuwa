<script setup >
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useCookies } from "vue3-cookies";
import { computed } from 'vue';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { useUserStore } from './stores/userStore';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
const userStore = useUserStore()
let { cookies } = useCookies()
const user = ref()
let rail = ref(true)
let drawer = ref(true)
const router = useRouter()
const theme = useTheme()
const auth = getAuth()
const $toast = useToast();

import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
    .then((result) => {
      userStore.checkUser(result.user)
      user.value = result.user
      console.log(auth.currentUser)
      addUserToDb(auth.currentUser)
      $toast.success("Logged in as " + auth.currentUser.displayName);
    }).catch((error) => {
      console.log(error);
    });
}
// const signInWithGithub = () => {
//   const provider = new GithubAuthProvider()
//   signInWithPopup(auth, provider)
//     .then((result) => {
//       // This gives you a GitHub Access Token. You can use it to access the GitHub API.
//       const credential = GithubAuthProvider.credentialFromResult(result);
//       const token = credential.accessToken;

//       // The signed-in user info.
//       const user = result.user;
//       // IdP data available using getAdditionalUserInfo(result)
//       // ...
//     }).catch((error) => {
//       // Handle Errors here.
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       // The email of the user's account used.
//       const email = error.customData.email;
//       // The AuthCredential type that was used.
//       const credential = GithubAuthProvider.credentialFromError(error);
//       console.log(error)
//       // ...
//     });
// }
async function addUserToDb(user) {
  try {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
    console.log(querySnapshot)
    if (!querySnapshot.empty) {
      console.log("Email already exists in the database.");
      return;
    } else {
      const docRef = await addDoc(collection(db, "users"), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
      console.log("Document written with ID: ", docRef.id);
    }
  }
  catch (e) {
    console.error("Error adding document: ", e);

  }
}
async function getUser(user) {
  const querySnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
  querySnapshot.forEach((doc) => {
    userStore.changeUserId(doc.id)
  });
}
const handleSignOut = () => {
  signOut(auth).then(() => {
    user.value = null
    $toast.info('Signed Out');

  }).catch((error) => {

  });
}
onMounted(() => {
  console.log(import.meta.env.VITE_HE)
  userStore.checkUser(auth.currentUser)
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    getUser(firebaseUser)
  });
  const themeValue = cookies.get('theme');
  console.log(themeValue)
  if (themeValue === null) {
    // If it doesn't exist, set its value to 'white'
    cookies.set('theme', 'light');
  }
  theme.global.name.value = cookies.get('theme')
})


// function toggleAll() {
//   rail.value = true
//   toggleSecond.value = false
// }
const toggleSecond = ref(false)
</script>
<template>
  <div>
    <v-card>
      <v-layout>
        <v-navigation-drawer :rail="rail" v-model="drawer" @click="rail = false">
          <v-list>
            <v-list-item v-if="!user">
              <v-menu location="end">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" dark v-bind="props">
                    Login
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item>
                    <v-btn @click="signInWithGoogle">Sign In With Google</v-btn>
                  </v-list-item>
                  <!-- <v-list-item>
                    <v-btn @click="signInWithGithub">Sign In With Github</v-btn>
                  </v-list-item> -->
                </v-list>
              </v-menu>
            </v-list-item>
            <v-list-item :prepend-avatar="user.photoURL" v-if="user" :title="user.displayName" :subtitle="user.email">
              <template v-slot:append>
                <v-btn variant="text" icon="mdi-chevron-left" @click.stop="rail = !rail"></v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list v-if="user" density="compact" nav>
            <v-list-item prepend-icon="mdi-home" title="Home" value="home" @click="router.push('/')">
              <v-tooltip activator="parent" location="start">Home</v-tooltip></v-list-item>
            <v-list-item prepend-icon="mdi-earth" title="Explore" value="shared" @click="router.push('/explore')">
              <v-tooltip activator="parent" location="start">Explore</v-tooltip>
            </v-list-item>
            <v-list-item prepend-icon="mdi-message-processing-outline" title="Message" value="message"
              @click="router.push('/messages')">
              <v-tooltip activator="parent" location="start">Message</v-tooltip>
            </v-list-item>
            <v-list-item prepend-icon="mdi-star" title="Favorite" value="starred">
              <v-tooltip activator="parent" location="start">Favorite</v-tooltip>
            </v-list-item>
            <v-list-item prepend-icon="mdi-cog" title="Setting" value="setting" @click="router.push('/setting')">
              <v-tooltip activator="parent" location="start">Setting</v-tooltip>
            </v-list-item>
            <!-- <v-switch color="orange" label="Switch" v-model="state" @click="toggleTheme">
          </v-switch> -->
            <!-- <v-list-item @click="toggleTheme" title="Dark Mode" :prepend-icon="themeState" value="mode">
              <v-tooltip activator="parent" location="start">Dark Mode</v-tooltip>
            </v-list-item> -->
          </v-list>


        </v-navigation-drawer>
        <!-- <div v-if="toggleSecond">
          <v-navigation-drawer>
            <v-list>
              <v-list-item v-for="x in 5" :key="x" class="chat-title" :title="`box vui ve ${x}`" :value="`${x}`"
                @click="router.push('')"></v-list-item>
            </v-list>
          </v-navigation-drawer>
        </div> -->
        <v-main class="main-container">
          <RouterView></RouterView>
        </v-main>
      </v-layout>
    </v-card>
  </div>
</template>
<style scoped>
.main-container {
  height: 100vh;
}

/* .chat-title:hover {
  background-color: lightgreen;
} */
</style>
