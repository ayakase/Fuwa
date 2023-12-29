import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ExploreView from '../views/ExploreView.vue'
import FavoriteView from '../views/FavoriteView.vue'
import MessageView from '../views/MessageView.vue'
import SettingView from '../views/SettingView.vue'
import LoginView from '../views/LoginView.vue'
import { getAuth, GoogleAuthProvider, GithubAuthProvider, onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
const auth = getAuth()
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
      }
    },
    {
      path: '/explore',
      name: 'explore',
      component: ExploreView,
      meta: {
        requiresAuth: true,
      }
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessageView,
      meta: {
        requiresAuth: true,
      }
    },
    {
      path: '/favorite',
      name: 'favorite',
      component: FavoriteView,
      meta: {
        requiresAuth: true,
      }
    },
    {
      path: '/setting',
      name: 'setting',
      component: SettingView,
      meta: {
        requiresAuth: true,
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      // meta: {
      //   requiresAuth: false,
      // }
    }
  ]
})
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (getAuth().currentUser) {
      next()
    } else {
      console.log('no auth ')
      next("/login")
    }
  } else {
    next()
  }
})
export default router
