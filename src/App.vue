<script setup>
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useCookies } from "vue3-cookies";
import { computed } from 'vue';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { useUserStore } from './stores/userStore';
import { db } from './firebaseConfig';
import { doc, collection, addDoc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
const userStore = useUserStore()
let { cookies } = useCookies()
const user = ref()
let rail = ref(true)
let drawer = ref(true)
const router = useRouter()
const route = useRoute();
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
      $toast.success("Logged in as " + auth.currentUser.displayName, {
        position: 'top-right'
      });
    }).catch((error) => {
      console.log(error);
    });
}
function changeSideBar() {
  bgImage.value = cookies.get('bgImage')
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
const userId = ref()
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
      userId.value = doc.id
    });
  }
}
setInterval(async () => {
  if (userId.value) {
    const userRef = doc(db, 'users', userId.value);
    console.log(userId.value)
    await updateDoc(userRef, {
      lastOnline: Date.now()
    })
  }
}, 60000);

// const handleSignOut = () => {
//   signOut(auth).then(() => {
//     user.value = null
//     $toast.info('Signed Out', {
//       position: 'top-right'
//     });

//   }).catch((error) => {

//   });
// }
onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser;
  getUser(firebaseUser)

  // setTimeout(() => {
  //   getUser(firebaseUser)
  // }, 1000);
  // if (firebaseUser) {
  //   console.log('yes');
  // } else {
  //   console.log('no');
  // }
});
const themeValue = cookies.get('theme');
if (themeValue === null) {
  cookies.set('theme', 'dark', 60 * 60 * 24 * 30);
}
theme.global.name.value = cookies.get('theme')

let bgImage = ref(cookies.get('bgImage'))
const colorCode = ref(cookies.get('main-color'))
onMounted(() => {
  document.documentElement.style.setProperty('--main-color', colorCode.value);
})

const toggleSecond = ref(false)
</script>
<template>
  <div>
    <v-card>
      <v-layout>
        <v-navigation-drawer v-if="user && route.meta.showNav" :rail="rail" v-model="drawer" 
          :image="bgImage">
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
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list v-if="user" density="compact" nav>
            <v-list-item prepend-icon="fa-solid fa-earth-americas" title="Explore" value="shared"
              @click="router.push('/explore')">
              <v-tooltip activator="parent" location="start">Explore</v-tooltip>
            </v-list-item>
            <v-list-item prepend-icon="fa-solid fa-home" title="Home" value="home" @click="router.push('/')">
              <v-tooltip activator="parent" location="start">Home</v-tooltip></v-list-item>
            <v-list-item prepend-icon="fa-solid fa-user-group" title="Groups" value="message"
              @click="router.push('/groups')">
              <v-tooltip activator="parent" location="start">Groups</v-tooltip>
            </v-list-item>
            <v-list-item prepend-icon="fa-solid fa-inbox" title="Inbox" value="inbox" @click="router.push('/inbox')">
              <v-tooltip activator="parent" location="start">Inbox</v-tooltip>
            </v-list-item>
            <!-- <v-list-item prepend-icon="mdi-robot-happy-outline" title="Chat Bot" value="chat-bot"
              @click="router.push('/chat-bot')">
              <v-tooltip activator="parent" location="start">Setting</v-tooltip>
            </v-list-item> -->
            <v-list-item prepend-icon="fa-solid fa-gear" title="Setting" value="setting"
              @click="router.push('/setting')">
              <v-tooltip activator="parent" location="start">Setting</v-tooltip>
            </v-list-item>
            <p>
              <!-- {{ $t('message.hello') }} -->
            </p>
            <!-- <v-switch color="orange" label="Switch" v-model="state" @click="toggleTheme">
          </v-switch> -->
            <!-- <v-list-item @click="toggleTheme" title="Dark Mode" :prepend-icon="themeState" value="mode">
              <v-tooltip activator="parent" location="start">Dark Mode</v-tooltip>
            </v-list-item> -->
          </v-list>
          <template v-slot:append>
            <v-btn style="width:100%;height:3rem;" variant="tonal" v-if="rail" @click.stop="rail = false">
              <v-icon size='large' icon="fa-solid fa-chevron-right"></v-icon>
            </v-btn>
            <v-btn style="width:100%;height:3rem;" variant="tonal" v-if="!rail" @click.stop="rail = true">
              <v-icon size='large' icon="fa-solid fa-chevron-left"></v-icon>
            </v-btn>

          </template>
        </v-navigation-drawer>
        <v-main class="main-container">
          <RouterView @changeBg="changeSideBar"></RouterView>
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
