<template>
    <v-dialog v-if="showSetting" max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
            <v-list-item prepend-icon="fa-solid fa-sliders" v-bind="activatorProps" color="surface-variasdaant">
                Group Management
            </v-list-item>
        </template>

        <template v-slot:default="{ isActive }">
            <div>somethng</div>
            <v-card class="container">
                <v-text-field style="width: 100%;" v-model="boxName" label="Label" variant="outlined"></v-text-field>
                <v-text-field style="width: 100%;" v-model="boxDescription" label="Label"
                    variant="outlined"></v-text-field>
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
import { getDoc, doc } from 'firebase/firestore';
import { ref, onMounted } from 'vue';
import LoadingComponent from '../components/LoadingComponent.vue'
import { watch } from "vue";
// const userDocRef = doc(db, 'users', props.id);
const props = defineProps(["boxId", "boxName", "isAdmin", "description"]);
const showSetting = ref(false)
const boxName = ref('')
const isAdmin = ref(false);
const boxDescription = ref('');
watch(
    () => props.boxId,
    (newBoxId, oldBoxId) => {
        showSetting.value = props.isAdmin;
        boxName.value = props.boxName;
        boxDescription.value = props.description;
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