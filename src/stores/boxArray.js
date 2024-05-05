import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
export const boxArray = defineStore('boxarray', {
    state: () => {
        return { boxarray: [] }
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