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

import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
const $toast = useToast();

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
    .then((result) => {
      userStore.checkUser(result.user)
      user.value = result.user
      addUserToDb(auth.currentUser)
      $toast.success("Logged in as " + auth.currentUser.displayName);
    }).catch((error) => {
      console.log(error);
    });
}

// async function addUserToDb(user) {
//   try {
//     const querySnapshot = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
//     if (!querySnapshot.empty) {
//       return;
//     } else {
//       const docRef = await addDoc(collection(db, "users"), {
//         uid: user.uid,
//         displayName: user.displayName,
//         email: user.email,
//       });
//     }
//   }
//   catch (e) {
//     console.error("Error adding document: ", e);

//   }
// }
const userInfo = ref()
async function getUser(user) {
  const querySnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
  querySnapshot.forEach((doc) => {
    userInfo.value = doc.data();
    userStore.changeUserInfo(userInfo.value);
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
onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser;
  console.log(firebaseUser)
  getUser(firebaseUser)
  // if (firebaseUser) {
  //   console.log('yes');
  // } else {
  //   console.log('no');
  // }
});
const themeValue = cookies.get('theme');
if (themeValue === null) {
  cookies.set('theme', 'light');
}
theme.global.name.value = cookies.get('theme')

onMounted(() => {


})

const toggleSecond = ref(false)
</script>
<template>
  <div>
    <v-card>
      <v-layout>
        <v-navigation-drawer v-if="user" :rail="rail" v-model="drawer" @click="rail = false">
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
            <v-list-item v-if="userInfo" :prepend-avatar="userInfo.avatar" :title="userInfo.displayName"
              :subtitle="user.email">
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
            <v-list-item prepend-icon="mdi-message-processing-outline" title="Groups" value="message"
              @click="router.push('/groups')">
              <v-tooltip activator="parent" location="start">Groups</v-tooltip>
            </v-list-item>
            <v-list-item prepend-icon="mdi-star" title="Favorite" value="starred" @click="router.push('/favorite')">
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

          <!-- <template v-slot:append>
            <div class="pa-2">
              <v-btn v-if="user" @click="handleSignOut()" class="" block>
                Logout
              </v-btn>
            </div>
          </template> -->
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
