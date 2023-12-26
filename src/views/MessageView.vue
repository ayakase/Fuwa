<template>
    <div class="container">
        <v-navigation-drawer class="box-view" :rail="rail">
            <div class="message-top-bar">
                <v-btn v-if="!rail" icon="mdi-sort" variant="text"></v-btn>
                <v-btn v-if="!rail" variant="text" icon="mdi-chevron-left" @click="rail = !rail; console.log(rail)"></v-btn>
                <v-btn v-if="rail" variant="text" icon="mdi-chevron-right" @click="rail = !rail; console.log(rail)"></v-btn>
            </div>
            <v-divider></v-divider>
            <v-list>
                <v-list-item :prepend-avatar="user.photoURL" class="chat-box-container" v-if="boxes.length > 0"
                    v-for="box in boxes" :key="box" :value="box.id">
                    <v-tooltip v-if="rail" activator="parent" location="end">{{ box.title }}</v-tooltip>
                    <div class="chat-box">
                        <p class="box-title" v-if="!rail">{{ box.title }}</p>
                        <button class="delete-box-button" @click="deleteBox(box.title, box.id)"> <v-icon size="small"
                                icon="mdi-trash-can-outline"></v-icon>
                        </button>
                    </div>
                </v-list-item>
                <LoadingComponent v-else></LoadingComponent>
                <v-dialog width="500">
                    <template v-slot:activator="{ props }">
                        <v-btn class="add-box" v-bind="props">
                            <span v-if="!rail">New Chat</span>
                            <v-icon size="large" color="green-darken-2" icon="mdi-plus"></v-icon>
                        </v-btn>
                    </template>

                    <template v-slot:default="{ isActive }">
                        <v-card class="new-dialog">
                            <v-card-title style="text-align: center;">New Chat Box</v-card-title>
                            <v-text-field variant="underlined" v-model="boxTitle" label="Box Name" required
                                hide-details></v-text-field>
                            <v-text-field variant="underlined" v-model="boxPassword"
                                label="Password (leave blank if you want to let people join freely)" required
                                hide-details></v-text-field>
                            <v-text-field variant="underlined" v-model="boxTitle" label="Box Name" required
                                hide-details></v-text-field>

                            <v-switch :label="publicState" v-model="state" inset></v-switch>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text="Create new chat" @click="addBox();">
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </template>
                </v-dialog>
            </v-list>
            <!-- <div style="background-color: rebeccapurple;" @click="rail = false; console.log(rail)">ba</div> -->
        </v-navigation-drawer>
        <ChatBox></ChatBox>
    </div>
</template>
<!-- isActive.value = false -->
<script setup >
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, onSnapshot, query, deleteDoc, orderBy, where, getDocs } from 'firebase/firestore';
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore';
import LoadingComponent from '../components/LoadingComponent.vue';
import ChatBox from '../components/ChatBox.vue';
const userStore = useUserStore()
const user = ref()
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const auth = getAuth()
// const userId = ref()
const boxes = ref([])
import { storeToRefs } from 'pinia'
const { userId } = storeToRefs(userStore)
const rail = ref(true)
async function retrieveDoc() {
    const listQuery = query(collection(db, "boxes"), where('owner', '==', doc(db, `users/${userId.value}`)), orderBy('dateCreated', 'desc'))
    onSnapshot(listQuery, (snapshot) => {
        const boxesList = []
        snapshot.forEach((doc) => {
            boxesList.push({
                id: doc.id,
                title: doc.data().title
            });
            boxes.value = boxesList
        });
    })
}
// watch(userId, async (newValue, oldValue) => {
//     const listQuery = query(collection(db, "boxes"), where('owner', '==', doc(db, `users/${newValue}`)), orderBy('dateCreated', 'desc'))
//     onSnapshot(listQuery, (snapshot) => {
//         const boxesList = []
//         snapshot.forEach((doc) => {
//             console.log(doc.data())
//             console.log(doc.data().id)
//             boxesList.push({
//                 id: doc.id,
//                 title: doc.data().title
//             });
//             boxes.value = boxesList
//         });
//     })
// })
onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
    })
    setTimeout(() => {
        retrieveDoc()
    }, 3000);


})
const toggleBox = ref(true)
function addBox() {
    console.log(boxTitle.value)
    console.log(state.value)
    addBoxToDb()
}

async function addBoxToDb() {
    try {

        const userDocRef = doc(db, `users/${userStore.userId}`);
        const docRef = await addDoc(collection(db, "boxes"), {
            title: boxTitle.value,
            owner: userDocRef,
            isPublic: state.value,
            dateCreated: Date.now()
        });
        console.log("Document written with ID: ", docRef.id);

    }
    catch (e) {
        console.error("Error adding document: ", e);

    }
}
async function deleteBox(title, id) {
    if (confirm("Delete box: " + title + " ?") == true) {
        console.log("Document deleted");
        await deleteDoc(doc(db, "boxes", id));
    } else {
        console.log("Deletion cancelled");
    }
}
const state = ref(false)
const publicState = ref("private")
const boxTitle = ref("")
watch(state, async (newValue, oldValue) => {
    if (newValue == true) {
        publicState.value = "Public"
    } else {
        publicState.value = "Private"
    }
})

</script>

<style scoped>
.box-view {}

.container {
    width: 100%;
    height: 100%;
}

.add-box {
    margin-top: 1rem;
    width: 100%;
}

.new-dialog {
    padding: 1rem;
    padding-top: 0;
}

.chat-box {
    height: 100%;
    width: 100%;
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between;
}


.delete-box-button {
    border-radius: 0.2rem;
    width: 1.5rem;
}

.delete-box-button:hover {
    color: rgb(255, 54, 54);
}

.message-top-bar {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
}

.box-title {
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>