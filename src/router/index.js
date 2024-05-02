import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ExploreView from '../views/ExploreView.vue'
import FavoriteView from '../views/FavoriteView.vue'
import GroupsView from '../views/GroupsView.vue'
import InboxView from '../views/InboxView.vue'
import VideoRoom from '../views/VideoRoom.vue'
import SettingView from '../views/SettingView.vue'
import LoginView from '../views/LoginView.vue'
import InviteView from '../views/InviteView.vue'
// import ChatBotView from '@/views/ChatBotView.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
        showNav: true,
      }
    },
    {
      path: '/explore',
      name: 'explore',
      component: ExploreView,
      meta: {
        requiresAuth: true,
        showNav: true,
      }
    },
    {
      path: '/groups',
      name: 'groups',
      component: GroupsView,
      meta: {
        requiresAuth: true,
        showNav: true,

      }
    },
    {
      path: '/inbox',
      name: 'inbox',
      component: InboxView,
      meta: {
        requiresAuth: true,
        showNav: true,

      }
    }, {
      path: '/video-call/:id',
      name: 'video call',
      component: VideoRoom,
      meta: {
        requiresAuth: true,
        showNav: false,

      }
    },
    {
      path: '/favorite',
      name: 'favorite',
      component: FavoriteView,
      meta: {
        requiresAuth: true,
        showNav: true,

      }
    },
    {
      path: '/setting',
      name: 'setting',
      component: SettingView,
      meta: {
        requiresAuth: true,
        showNav: true,

      }
    },
    // {
    //   path: '/chat-bot',
    //   name: 'chatbot',
    //   component: ChatBotView,
    //   meta: {
    //     requiresAuth: true,

    //   }
    // },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      // meta: {
      //   requiresAuth: false,
      // }
    },
    {
      path: '/invite/:id',
      name: 'invite',
      component: InviteView,
      // meta: {
      //   requiresAuth: false,
      // }
    }
  ]
})
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(), (user) => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()) {
      next()
    } else {
      next("/login")
    }
  } else {
    next()
  }
})
export default router
