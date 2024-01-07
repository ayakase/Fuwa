
import { defineStore } from 'pinia'

export const useUserStore = defineStore('loginstate', {
    id: 'auth',
    state: () => {
        return { user: {}, userId: "", userInfo: {} }
    },
    actions: {
        async checkUser(user) {
            this.user = user
        },
        async changeUserId(userId) {
            this.userId = userId
        },
        async changeUserInfo(userInfo) {
            this.userInfo = userInfo
        },
        toggleButton(state) {
            this.login = state
        }

    }

})