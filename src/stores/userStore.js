
import { defineStore } from 'pinia'

export const useUserStore = defineStore('loginstate', {
    id: 'auth',
    state: () => {
        return { user: {}, userId: "" }
    },
    actions: {
        async checkUser(user) {
            this.user = user
        },
        async changeUserId(userId) {
            this.userId = userId
        },
        toggleButton(state) {
            this.login = state
        }

    }

})