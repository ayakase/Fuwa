<template>
    <v-dialog max-width="800">
        <template v-slot:activator="{ props: activatorProps }">
            <v-list-item style="position: relative;" v-if="memberInfo" :prepend-avatar="memberInfo.avatar"
                v-bind="activatorProps" color="surface-variant">
                <p>
                    {{ memberInfo.displayName }}
                </p>
                <p>
                    {{ memberInfo.cid }}
                </p>
                <div style="position: absolute;top:0;right: 0; height: 100%;width:3rem;display: flex;align-items: center;justify-content: center;"
                    v-if="memberInfo && memberInfo.lastOnline && online(memberInfo.lastOnline)">
                    <v-icon style="color: lawngreen;" size="smaller" icon="fa-solid fa-circle"></v-icon>
                </div>
            </v-list-item>
            <v-skeleton-loader v-else class="mx-auto border" style="width:100%"
                type="avatar, list-item-two-line"></v-skeleton-loader>
        </template>

        <template v-slot:default="{ isActive }" v-if="senderId !== receiverId">
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
                <v-text-field clearable label="Leave them a message" variant="outlined" v-model="newMessage"
                    style="width: 100%;"></v-text-field>
                <v-card-actions style="width: 100%">
                    <div style="width: 100%;display: flex; justify-content: space-between;">
                        <v-btn text=" Close" @click="isActive.value = false"></v-btn>
                        <v-btn style="background-color: var(--main-color)"
                            @click="checkBox() && (isActive.value = false)">
                            Inbox &nbsp; <v-icon icon="fa-regular fa-paper-plane"></v-icon>
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup>
const props = defineProps(["id"]);
import { db } from "../firebaseConfig";
import { getDoc, getDocs, doc, addDoc, collection, updateDoc, query, where } from 'firebase/firestore';
import { ref, onMounted } from 'vue';
import LoadingComponent from '../components/LoadingComponent.vue'
import { useUserStore } from "../stores/userStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
const router = useRouter()
const userStore = useUserStore();
const { userId, userInfo } = storeToRefs(userStore);

const memberInfo = ref('')
function online(lastOnline) {
    if (((Date.now() - lastOnline) / 1000) > 60) {
        return false
    } else {
        return true
    }
}
const newMessage = ref("")
const receiverRef = doc(db, 'users', props.id);
const senderRef = doc(db, 'users', userStore.userId);
const receiverId = receiverRef.id.toString()
const senderId = senderRef.id.toString()
async function checkBox() {
    try {
        console.log("sender " + senderId, "receiver " + receiverId)
        let findInbox = await getDocs(query(collection(db, "inboxes"),
            where(`memberMap.${receiverId}`, '==', true),
            where(`memberMap.${senderId}`, '==', true)
        ))
        if (findInbox.empty) {
            console.log("empty")
            const newInbox = await addDoc(collection(db, "inboxes"), {
                members: [senderRef, receiverRef],
                memberMap: {
                    [receiverId]: true,
                    [senderId]: true
                },
                dateCreated: Date.now(),
            });
            const inboxRef = doc(db, 'inboxes', newInbox.id);
            sendMessage(inboxRef)
        } else {
            const inboxRef = doc(db, 'inboxes', findInbox.docs[0].id);
            sendMessage(inboxRef)
        }
    } catch (e) {
        console.error(e)
    }
}
async function sendMessage(ibRef) {
    await updateDoc(ibRef, {
        latestMessage: newMessage.value,
        latestChange: Date.now()
    })
    const message = await addDoc(collection(ibRef, "messages"), {
        content: newMessage.value,
        timeSent: Date.now(),
        senderRef: senderRef,
    });
    router.push('/inbox')
}
async function getUserInfo() {
    let userInfo = await getDoc(receiverRef)
    memberInfo.value = userInfo.data()
}
onMounted(() => {
    getUserInfo()
    const intervalId = setInterval(() => {
        getUserInfo()
    }, 60000)

    return () => {
        clearInterval(intervalId)
    }
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