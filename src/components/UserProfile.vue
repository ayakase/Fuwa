<template>
    <v-dialog max-width="800">
        <template v-slot:activator="{ props: activatorProps }">
            <v-list-item :prepend-avatar="props.avatar" v-bind="activatorProps" color="surface-variasdaant">
                <p>
                    {{ props.name }}
                </p>
                <p>
                    {{ props.cid }}
                </p>
            </v-list-item>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card class="container" v-if="memberInfo">
                <v-card-item>
                    <v-img class="avatar" :src="memberInfo.avatar"></v-img>
                </v-card-item>
                <v-card-text style="font-size: xx-large;">
                    {{ memberInfo.displayName }}
                </v-card-text>
                <v-divider style="width: 100%;"></v-divider>
                <v-card-text style="font-size: larger;">
                    {{ memberInfo.about }}
                </v-card-text>
                <!-- <v-text-field clearable label="Leave them a message" variant="outlined"
                    style="width: 100%;"></v-text-field> -->
                <v-card-actions style="width: 100%">
                    <div style="width: 100%;display: flex; justify-content: space-between;">
                        <v-btn text=" Close" @click="isActive.value = false"></v-btn>
                        <v-btn style="background-color: var(--main-color)" @click="isActive.value = false">
                            Inbox &nbsp; <v-icon icon="fa-regular fa-paper-plane"></v-icon>
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
            <LoadingComponent v-else></LoadingComponent>
        </template>
    </v-dialog>
</template>

<script setup>
const props = defineProps(["id", "name", "avatar", "cid"]);
import { db } from "../firebaseConfig";
import { getDoc, doc } from 'firebase/firestore';
import { ref, onMounted } from 'vue';
import LoadingComponent from '../components/LoadingComponent.vue'
const userDocRef = doc(db, 'users', props.id);
const memberInfo = ref('')
async function getUserInfo() {
    let userInfo = await getDoc(userDocRef)
    memberInfo.value = userInfo.data()
}
onMounted(() => {
    getUserInfo()
})
</script>

<style scoped>
.container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar {
    width: 10rem;
    border-radius: 50rem;
    border: 4px solid var(--main-color);
}
</style>