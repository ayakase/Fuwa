<template>
    <div class="container">
        <v-navigation-drawer class="box-view" :rail="rail">
            <div class="message-top-bar">
                <v-btn v-if="!rail" icon="mdi-sort" variant="text"></v-btn>
                <v-btn v-if="!rail" variant="text" icon="mdi-chevron-left" @click="rail = !rail"></v-btn>
                <v-btn v-if="rail" variant="text" icon="mdi-chevron-right" @click="rail = !rail"></v-btn>
            </div>
            <v-divider></v-divider>
            <v-list>
                <v-list-item @click="selectBox(box.id, box.title, box.members)" :prepend-avatar="user.photoURL"
                    class="chat-box-container" v-if="boxes.length > 0" v-for="box in boxes" :key="box" :value="box.id">
                    <v-tooltip v-if="rail" activator="parent" location="end">{{
                        box.title
                    }}</v-tooltip>
                    <div class="chat-box">
                        <p class="box-title" v-if="!rail">{{ box.title }}</p>
                        <button v-if="showDeleteBtn(box.owner)" class="delete-box-button"
                            @click="deleteBox(box.title, box.id)">
                            <v-icon size="small" icon="mdi-trash-can-outline"></v-icon>
                        </button>
                        <button v-if="showLeaveBtn(box.owner)" class="leave-box-button"
                            @click="leaveBox(box.title, box.id)">
                            <v-icon size="small" icon="mdi-exit-to-app"></v-icon>
                        </button>
                    </div>
                </v-list-item>
                <v-card-subtitle style="text-align: center;" v-else-if="boxes.length == 0 && hasBox == false">You have not
                    joined any
                    chat</v-card-subtitle>
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
                            <v-card-title style="text-align: center">New Chat Box</v-card-title>
                            <v-text-field variant="underlined" v-model="boxTitle" label="Box Name" required
                                hide-details></v-text-field>
                            <v-text-field variant="underlined" v-model="boxDescription" label="Box Description" required
                                hide-details></v-text-field>
                            <v-text-field variant="underlined" v-model="boxPassword"
                                label="Password (leave blank if you want to let people join freely)" required
                                hide-details></v-text-field>
                            <v-text-field variant="underlined" v-model="boxTitle" label="Box Name" required
                                hide-details></v-text-field>

                            <v-switch :label="publicState" v-model="state" inset></v-switch>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text="Create new chat" @click="addBox()"> </v-btn>
                            </v-card-actions>
                        </v-card>
                    </template>
                </v-dialog>
            </v-list>
            <!-- <div style="background-color: rebeccapurple;" @click="rail = false; console.log(rail)">ba</div> -->
        </v-navigation-drawer>
        <ChatBox :box-id="boxId" :box-name="boxName" :box-members="boxMembers" :test="test" v-if="boxId"></ChatBox>
    </div>
</template>
<script setup>
import { db } from "../firebaseConfig";
import {
    collection,
    addDoc,
    doc,
    onSnapshot,
    query,
    deleteDoc,
    orderBy,
    where,
    updateDoc,
    arrayRemove,
} from "firebase/firestore";
import { ref, watch, onMounted } from "vue";
import { useUserStore } from "../stores/userStore";
import LoadingComponent from "../components/LoadingComponent.vue";
import ChatBox from "../components/ChatBox.vue";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { storeToRefs } from "pinia";
const $toast = useToast();
const userStore = useUserStore();
const user = ref();
const auth = getAuth();
const { userId } = storeToRefs(userStore);
const { userInfo } = storeToRefs(userStore);
const rail = ref(true);
const boxes = ref([]);
const boxId = ref("");
const boxName = ref("");
const boxMembers = ref([]);
const test = ref();
const hasBox = ref(true);
function selectBox(id, title, members) {
    boxId.value = id;
    boxName.value = title;
    boxMembers.value = members;
}
async function retrieveDoc() {
    // const listQuery = query(collection(db, "boxes"),
    //     or(
    //         where("owner", "==", doc(db, `users/${userId.value}`)),
    //         where("members", "array-contains", doc(db, `users/${userId.value}`))
    //     )
    // );
    const listQuery = query(collection(db, "boxes"),
        where("members", "array-contains", doc(db, `users/${userId.value}`)),
        orderBy("dateCreated", "desc")
    )
    onSnapshot(listQuery, (snapshot) => {
        const boxesList = [];
        if (snapshot.docs.length > 0) {
            snapshot.forEach((doc) => {
                // console.log(doc.data().members)
                boxesList.push({
                    id: doc.id,
                    title: doc.data().title,
                    owner: doc.data().owner,
                    members: doc.data().members
                });
            });
            boxes.value = boxesList;
            boxId.value = boxes.value[0].id;
            boxName.value = boxes.value[0].title;
            boxMembers.value = boxes.value[0].members
            hasBox.value = true;
        } else {
            boxes.value = [];
            hasBox.value = false;
        }

    });
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
watch(
    () => userId.value,
    (newUserId, oldUserId) => {
        console.log(newUserId)
        retrieveDoc();
    },
    { immediate: true }

);
onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
    });

});
const toggleBox = ref(true);
function addBox() {
    addBoxToDb();
}

async function addBoxToDb() {
    try {
        const userDocRef = doc(db, `users/${userStore.userId}`);
        const newBox = await addDoc(collection(db, "boxes"), {
            title: boxTitle.value,
            owner: userDocRef,
            members: [userDocRef],
            description: boxDescription.value,
            isPublic: state.value,
            password: boxPassword.value,
            dateCreated: Date.now(),
        });

        const boxDocRef = doc(db, `box/${newBox.id}`);
        const newMessage = await addDoc(collection(db, "messages"), {
            content: userInfo.value.displayName + " created this Group ",
            timeSent: Date.now(),
            senderRef: userDocRef,
            boxRef: boxDocRef,
            systemMessage: true,
        });
        $toast.success("Created box chat " + boxTitle.value);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
function showDeleteBtn(owner) {
    return (`users/${userId.value}` == owner.path)
}
function showLeaveBtn(owner) {
    return !(`users/${userId.value}` == owner.path)
}
async function deleteBox(title, id) {
    if (confirm("Delete box: " + title + " ?") == true) {
        await deleteDoc(doc(db, "boxes", id));
        $toast.info("Deleted box chat " + title);
    } else {
        console.log("Deletion cancelled");
    }
}
async function leaveBox(title, id) {
    if (confirm("Delete box: " + title + " ?") == true) {
        console.log(title, userId.value)
        await updateDoc(doc(db, "boxes", id), {
            members: arrayRemove(doc(db, "users", userId.value))
        })
        $toast.info("Left " + title);
    } else {
        console.log("Deletion cancelled");
    }
}
const state = ref(false);
const publicState = ref("private");
const boxTitle = ref("");
const boxDescription = ref("");
const boxPassword = ref("");
watch(state, async (newValue, oldValue) => {
    if (newValue == true) {
        publicState.value = "Public";
    } else {
        publicState.value = "Private";
    }
});
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

.delete-box-button, .leave-box-button {
    border-radius: 0.2rem;
    width: 1.5rem;
}

.delete-box-button:hover, .leave-box-button:hover {
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
