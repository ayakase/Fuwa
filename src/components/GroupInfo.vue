<template>
    <v-dialog v-if="showSetting" max-width="1000">
        <template v-slot:activator="{ props: activatorProps }">
            <v-list-item prepend-icon="fa-solid fa-sliders" v-bind="activatorProps" color="surface-variasdaant">
                Group Management
            </v-list-item>
        </template>

        <template v-slot:default="{ isActive }">
            <div>somethng</div>
            <v-card class="container" style="display: flex;flex-direction: column;gap:1rem;">
                <div style="width:100%;display:flex; flex-direction: row;align-items:center;gap:1rem;">
                    <v-text-field style="width: 100%;" v-model="boxName" label="Label" hide-details
                        variant="outlined"></v-text-field>
                    <v-btn style="height:3rem;background-color:green;" @click="updateBoxTitle()">Update</v-btn>
                </div>

                <div style="width: 100%;">
                    <v-textarea style="width: 100%;" v-model="boxDescription" label="Label" hide-details
                        variant="outlined"></v-textarea>
                    <v-btn style="height:3rem;background-color:green;margin-top: 1rem;float:right;"
                        @click="updateBoxDescription()">Update</v-btn>

                </div>

                <div style="width:100%;display:flex; flex-direction: row;align-items:center;gap:1rem;">
                    <v-text-field variant="outlined" v-model="boxInviteId" label="Invite ID" required hide-details
                        disabled></v-text-field>
                    <v-btn style="height:3rem;background-color:green;" @click="generateInviteId()">
                        Random Id</v-btn>
                    <v-btn style="height:3rem;background-color:red;" @click="boxInviteId = ''">Clear</v-btn>
                    <v-btn style="height:3rem;background-color:green;" @click="updateBoxInviteId()">
                        Update</v-btn>
                </div>
                <!-- <v-divider style="width: 100%;"></v-divider>
                <v-card-text style="font-size: larger;">
                    {{ memberInfo.about }}
                </v-card-text>
                <v-text-field clearable label="Leave them a message" variant="outlined"
                    style="width: 100%;"></v-text-field>
                <v-card-actions style="width: 100%">
                    <div style="width: 100%;display: flex; justify-content: space-between;">
                        <v-btn text=" Close" @click="isActive.value = false"></v-btn>
                        <v-btn style="background-color: var(--main-color)" @click="isActive.value = false">
                            Inbox &nbsp; <v-icon icon="fa-regular fa-paper-plane"></v-icon>
                        </v-btn>
                    </div>
                </v-card-actions> -->
            </v-card>
            <!-- <LoadingComponent v-else></LoadingComponent> -->
        </template>
    </v-dialog>
</template>

<script setup>
import { db } from "../firebaseConfig";
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, onMounted } from 'vue';
import LoadingComponent from '../components/LoadingComponent.vue'
import { watch } from "vue";
// const userDocRef = doc(db, 'users', props.id);
const props = defineProps(["boxId", "boxName", "isAdmin", "description", "inviteId"]);
const showSetting = ref(false)
const boxName = ref('')
const boxDescription = ref('');
const boxInviteId = ref('');
function generateInviteId() {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    boxInviteId.value = result
}
async function updateBoxTitle() {
    const boxDocRef = doc(db, "boxes", props.boxId);
    await updateDoc(boxDocRef, {
        title: boxName.value,
    })
}
async function updateBoxDescription() {
    const boxDocRef = doc(db, "boxes", props.boxId);
    await updateDoc(boxDocRef, {
        description: boxDescription.value,
    })
}
async function updateBoxInviteId() {
    const boxDocRef = doc(db, "boxes", props.boxId);
    await updateDoc(boxDocRef, {
        invite: boxInviteId.value,
    })
}
watch(
    () => props.boxId,
    (newBoxId, oldBoxId) => {
        showSetting.value = props.isAdmin;
        boxName.value = props.boxName;
        boxDescription.value = props.description;
        boxInviteId.value = props.inviteId;
    },
    { immediate: true }
);
onMounted(() => {

})
</script>

<style scoped>
.container {
    padding: 1rem;
    width: 100%;
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