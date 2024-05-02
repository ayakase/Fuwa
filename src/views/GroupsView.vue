<template>
    <div class="container">
        <v-navigation-drawer class="box-view" :rail="rail">
            <div class="message-top-bar">
                <!-- <v-btn v-if="!rail" icon="mdi-sort" variant="text"></v-btn> -->
                <v-btn v-if="!rail" variant="text" icon="fa-solid fa-chevron-left" @click="rail = !rail"></v-btn>
                <v-btn v-if="rail" variant="text" icon="fa-solid fa-chevron-right" @click="rail = !rail"></v-btn>
            </div>
            <v-divider></v-divider>
            <v-list @click="rail = false">
                <v-list-item @click="selectBox(box.id, box.title, box.members, box.existed, box.owner, box.description)"
                    :prepend-avatar="user.photoURL" class="chat-box-container" v-if="boxes.length > 0"
                    v-for="box in boxes" :key="box" :value="box.id">
                    <v-tooltip v-if="rail" activator="parent" location="end">{{
            box.title
        }}</v-tooltip>
                    <div class="chat-box">
                        <p class="box-title" v-if="!rail">{{ box.title }}</p>
                        <button v-if="showDeleteBtn(box.owner)" class="delete-box-button"
                            @click="deleteBox(box.title, box.id)">
                            <v-icon size="small" icon="fa-regular fa-trash-can"></v-icon>
                        </button>
                        <button v-if="showLeaveBtn(box.owner)" class="leave-box-button"
                            @click="leaveBox(box.title, box.id)">
                            <v-icon size="small" icon="fa-solid fa-arrow-right-from-bracket"></v-icon>
                        </button>
                    </div>
                </v-list-item>
                <v-card-subtitle style="text-align: center;" v-else-if="boxes.length == 0 && hasBox == false">You have
                    not
                    joined any
                    chat</v-card-subtitle>
                <LoadingComponent v-else></LoadingComponent>

                <v-dialog width="500">
                    <template v-slot:activator="{ props }">
                        <v-btn class="add-box" v-bind="props">
                            <span v-if="!rail">New Chat</span>
                            <v-icon size="large" color="green-darken-2" icon="fa-solid fa-plus"></v-icon>
                        </v-btn>
                    </template>

                    <template v-slot:default="{ isActive }">
                        <v-card class="new-dialog">
                            <v-card-title style="text-align: center">New Chat Box</v-card-title>
                            <v-text-field variant="underlined" v-model="newBoxTitle" label="Box Name" required
                                hide-details></v-text-field>
                            <v-text-field variant="underlined" v-model="newBoxDescription" label="Box Description"
                                required hide-details></v-text-field>
                            <v-text-field variant="underlined" v-model="newBoxPassword"
                                label="Password (leave blank if you want to let people join freely)" required
                                hide-details></v-text-field>
                            <v-text-field variant="underlined" v-model="newBoxInviteId" label="Invite ID" required
                                hide-details></v-text-field>

                            <v-switch :label="newBoxPublicState" v-model="state" inset></v-switch>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text="Create new chat" @click="addBoxToDb()"> </v-btn>
                            </v-card-actions>
                        </v-card>
                    </template>
                </v-dialog>
            </v-list>
        </v-navigation-drawer>
        <ChatBox :box-id="boxId" :box-name="boxName" :existed-members="existedMembers" :box-members="boxMembers"
            v-if="boxId" :isAdmin="isAdmin" :description="boxDescription"></ChatBox>
        <NoBox v-else></NoBox>
    </div>
</template>
<script setup>
import { db } from "../firebaseConfig";
import {
    collection,
    addDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    deleteDoc,
    orderBy,
    where,
    updateDoc,
    arrayRemove,
    arrayUnion,
} from "firebase/firestore";
import { ref, watch, computed, onMounted } from "vue";
import { useUserStore } from "../stores/userStore";
import LoadingComponent from "../components/LoadingComponent.vue";
import NoBox from "../components/NoBox.vue";
import ChatBox from "../components/ChatBox.vue";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { storeToRefs } from "pinia";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
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
const boxDescription = ref("");
const existedMembers = ref([]);

const boxOwner = ref();
const test = ref();
const hasBox = ref(true);
const isAdmin = ref(false)
function selectBox(id, title, members, existed, owner, description) {
    boxId.value = id;
    boxName.value = title;
    boxMembers.value = members;
    existedMembers.value = existed;
    boxDescription.value = description;
    isAdmin.value = `users/${userId.value}` == owner.path
}
async function fetchBoxes() {
    // let boxRefArray = userInfo.value.boxes
    // if (boxRefArray && boxRefArray.length > 0) {
    //     try {
    //         const boxesDocs = await Promise.all(boxRefArray.map(ref => getDoc(ref)));
    //         boxes.value = boxesDocs.map(doc => {
    //             if (doc.exists()) {
    //                 const data = { ...doc.data(), id: doc.id };
    //                 return data;
    //             } else {
    //                 return null;
    //             }
    //         }).filter(item => item !== null)
    //         if (boxes.value.length > 0) {
    //             hasBox.value = true;
    //         } else {
    //             hasBox.value = false;
    //         }


    //     } catch (e) {
    //         console.log(e)
    //     }
    // } else {
    //     boxes.value = [];
    // }
    if (userId.value) {
        const listQuery = query(collection(db, "boxes"),
            where("members", "array-contains", doc(db, "users", userId.value)),
            orderBy("dateCreated", "desc")
        )
        const boxesList = [];
        const snapshot = await getDocs(listQuery)
        // console.log(result.docs[0].data())
        if (snapshot.docs.length > 0) {
            snapshot.forEach((doc) => {
                // console.log(doc.data().members)
                boxesList.push({
                    id: doc.id,
                    title: doc.data().title,
                    owner: doc.data().owner,
                    members: doc.data().members,
                    description: doc.data().description,
                    existed: doc.data().existed
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
        // getDocs(listQuery, (snapshot) => {
        //     console.log(snapshot)
        // const boxesList = [];
        // if (snapshot.docs.length > 0) {
        //     snapshot.forEach((doc) => {
        //         // console.log(doc.data().members)
        //         boxesList.push({
        //             id: doc.id,
        //             title: doc.data().title,
        //             owner: doc.data().owner,
        //             members: doc.data().members
        //         });
        //     });
        //     boxes.value = boxesList;
        //     boxId.value = boxes.value[0].id;
        //     boxName.value = boxes.value[0].title;
        //     boxMembers.value = boxes.value[0].members
        //     hasBox.value = true;
        // } else {
        //     boxes.value = [];
        //     hasBox.value = false;
        // }

        // });
    }
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
        fetchBoxes();
    },
    { immediate: true }

);
onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
    });

});
const toggleBox = ref(true);
const state = ref(false);
const newBoxPublicState = ref("private");
const newBoxTitle = ref("");
const newBoxDescription = ref("");
const newBoxPassword = ref("");
const newBoxInviteId = ref("");
const newBoxThumbnail = ref("");
watch(state, async (newValue, oldValue) => {
    if (newValue == true) {
        newBoxPublicState.value = "public";
    } else {
        newBoxPublicState.value = "private";
    }
});

async function addBoxToDb() {
    try {
        const userDocRef = doc(db, 'users', userStore.userId);
        const newBox = await addDoc(collection(db, "boxes"), {
            title: newBoxTitle.value,
            owner: userDocRef,
            members: [userDocRef],
            existed: [userDocRef],
            description: newBoxDescription.value,
            isPublic: state.value,
            password: newBoxPassword.value,
            invite: newBoxInviteId.value,
            thumbnail: newBoxThumbnail.value,
            dateCreated: Date.now(),
        });
        const boxDocRef = doc(db, "boxes", newBox.id);
        await updateDoc(userDocRef, {
            boxes: arrayUnion(boxDocRef)
        })
        const messageCollectionRef = collection(boxDocRef, "messages");
        const newMessage = await addDoc(messageCollectionRef, {
            content: userInfo.value.displayName + " created this Group ",
            timeSent: Date.now(),
            senderRef: userDocRef,
            messageType: 'system',
        });
        $toast.success("Created box chat " + newBoxTitle.value, {
            position: 'top-right'
        });
        setTimeout(() => {
            fetchBoxes()
        }, 3000);
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
        try {
            await deleteDoc(doc(db, "boxes", id));
            await updateDoc(doc(db, "users", userId.value), {
                boxes: arrayRemove(doc(db, "boxes", id))
            })
        } catch (e) {
            console.error(e.message)
        }
        fetchBoxes();
        $toast.info("Deleted box chat " + title, {
            position: 'top-right'
        });
    } else {
        console.log("Deletion cancelled");
    }
}
async function leaveBox(title, id) {
    if (confirm("Delete box: " + title + " ?") == true) {
        const userDocRef = doc(db, `users/${userStore.userId}`);
        const boxDocRef = doc(db, "boxes", id);
        const messageCollectionRef = collection(boxDocRef, "messages");

        await updateDoc(doc(db, "users", userId.value), {
            boxes: arrayRemove(doc(db, "boxes", id))
        })
        await updateDoc(doc(db, "boxes", id), {
            members: arrayRemove(doc(db, "users", userId.value))
        })
        const newMessage = await addDoc(messageCollectionRef, {
            content: userInfo.value.displayName + " left this Group ",
            timeSent: Date.now(),
            senderRef: userDocRef,
            messageType: 'system',
        });
        fetchBoxes();
        $toast.info("Left " + title, {
            position: 'top-right'
        });
    } else {
        console.log("Deletion cancelled");
    }
}
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

.delete-box-button,
.leave-box-button {
    border-radius: 0.2rem;
    width: 1.5rem;
}

.delete-box-button:hover,
.leave-box-button:hover {
    color: var(--main-color);
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
