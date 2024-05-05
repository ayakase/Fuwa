<template>
    <div class="container">
        <v-navigation-drawer :width="400" class="box-view" :rail="rail" rail-width="80">
            <div class="message-top-bar">
                <!-- <v-btn v-if="!rail" icon="mdi-sort" variant="text"></v-btn> -->
                <v-btn v-if="!rail" variant="text" icon="fa-solid fa-chevron-left" @click="rail = !rail"></v-btn>
                <v-btn v-if="rail" variant="text" icon="fa-solid fa-chevron-right" @click="rail = !rail"></v-btn>
            </div>
            <v-divider></v-divider>
            <v-list @click="rail = false">
                <v-list-item @click="selectBox(box.id, box.title, box.members, box.existed, box.owner, box.description, box.invite)"
                    class="chat-box-container" v-if="boxes.length > 0" v-for="box in  boxes " :key="box"
                    :value="box.id">
                    <v-tooltip v-if="rail" activator="parent" location="end">{{
            box.title
        }}</v-tooltip>
                    <div class="chat-box">
                        <div style="display:flex; align-items: center;gap:1rem">
                            <v-avatar :size="rail ? 40 : 65" :image="user.photoURL"></v-avatar>
                            <div>
                                <p class="box-title" v-if="!rail">{{ box.title }}</p>
                                <p v-if="!rail"
                                    style="color:gray;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width: 15rem;">
                                    {{ box.latestMessage }}</p>
                                <p style="color: gray;font-size: 12px;"> at {{ convertTime(box.latestChange) }}</p>
                            </div>
                        </div>
                        <button v-if="showDeleteBtn(box.owner) && !rail" class="delete-box-button"
                            @click="deleteBox(box.title, box.id)">
                            <v-icon size="small" icon="fa-regular fa-trash-can"></v-icon>
                        </button>
                        <button v-if="showLeaveBtn(box.owner) && !rail" class="leave-box-button"
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

                <v-dialog width="800">
                    <template v-slot:activator="{ props }">
                        <v-btn class="add-box" v-bind="props">
                            <span v-if="!rail">New Chat</span>
                            <v-icon size="large" color="green-darken-2" icon="fa-solid fa-plus"></v-icon>
                        </v-btn>
                    </template>

                    <template v-slot:default="{ isActive }">
                        <v-card class="new-dialog" style="height:90%">
                            <div style="display:flex;flex-direction: column; gap: 1rem;">
                                <v-card-title style="text-align: center">New Chat Box</v-card-title>
                                <v-text-field variant="underlined" v-model="newBoxTitle" label="Box Name" required
                                    hide-details></v-text-field>
                                <v-text-field variant="underlined" v-model="newBoxDescription" label="Box Description"
                                    required hide-details></v-text-field>
                                <v-text-field variant="underlined" v-model="newBoxPassword"
                                    label="Password (leave blank if you want to let people join freely)" required
                                    hide-details></v-text-field>
                                <div style="display:flex; flex-direction: row;align-items:center;gap:1rem;">
                                    <v-text-field variant="underlined" v-model="newBoxInviteId" label="Invite ID"
                                        required hide-details disabled></v-text-field>
                                    <v-btn style="height:3rem;background-color:green;" @click="generateInviteId()">
                                        Random Id</v-btn>
                                    <v-btn style="height:3rem;background-color:red;"
                                        @click="newBoxInviteId = ''">Cancel</v-btn>

                                </div>

                                <v-switch :label="newBoxPublicState" false-value="private" true-value="public"
                                    v-model="newBoxPublicState" inset></v-switch>
                            </div>
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
            v-if="boxId" :isAdmin="isAdmin" :description="boxDescription" :inviteId="boxInviteId"></ChatBox>
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
const { userId, userInfo } = storeToRefs(userStore);
const rail = ref(true);
const boxes = ref([]);
const boxId = ref("");
const boxName = ref("");
const boxMembers = ref([]);
const boxDescription = ref("");
const existedMembers = ref([]);
const boxInviteId = ref("");
const test = ref();
const hasBox = ref(true);
const isAdmin = ref(false)
function selectBox(id, title, members, existed, owner, description, invite) {
    boxId.value = id;
    boxName.value = title;
    boxMembers.value = members;
    existedMembers.value = existed;
    boxDescription.value = description;
    boxInviteId.value = invite
    isAdmin.value = `users/${userId.value}` == owner.path
}
async function fetchBoxes() {
    if (userId.value) {
        const listQuery = query(collection(db, "boxes"),
            where("members", "array-contains", doc(db, "users", userId.value)),
            orderBy("latestChange", "desc")
        )
        onSnapshot(listQuery, (snapshot) => {
            console.log(snapshot.docs)
            const boxesList = [];
            if (snapshot.docs.length > 0) {
                snapshot.forEach((doc) => {
                    // console.log(doc.data().members)
                    boxesList.push({ ...doc.data(), id: doc.id });
                });
                boxes.value = boxesList;

                hasBox.value = true;
            } else {
                boxes.value = [];
                hasBox.value = false;
            }

        })
    }
}

watch(
    () => userId.value,
    (newUserId, oldUserId) => {
        if (newUserId) {
            fetchBoxes();
        }
    },
    { immediate: true }

);
const toggleBox = ref(true);

const newBoxPublicState = ref("private");

const newBoxTitle = ref("");
const newBoxDescription = ref("");
const newBoxPassword = ref("");
const newBoxThumbnail = ref("");
const newBoxInviteId = ref("");
function generateInviteId() {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    newBoxInviteId.value = result
}
async function addBoxToDb() {
    try {
        const userDocRef = doc(db, 'users', userStore.userId);
        const newBox = await addDoc(collection(db, "boxes"), {
            title: newBoxTitle.value,
            owner: userDocRef,
            members: [userDocRef],
            existed: [userDocRef],
            description: newBoxDescription.value,
            isPublic: (newBoxPublicState.value === 'public') ? true : false,
            password: newBoxPassword.value,
            invite: newBoxInviteId.value,
            thumbnail: newBoxThumbnail.value,
            dateCreated: Date.now(),
        });
        const boxDocRef = doc(db, "boxes", newBox.id);
        // await updateDoc(userDocRef, {
        //     boxes: arrayUnion(boxDocRef)
        // })
        await updateDoc(boxDocRef, {
            latestMessage: `${userInfo.value.displayName} created this chat`,
            latestChange: Date.now()
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
        // setTimeout(() => {
        //     fetchBoxes()
        // }, 3000);
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
        const boxDocRef = doc(db, 'boxes', id)
        try {
            await deleteDoc(boxDocRef);
            // await updateDoc(doc(db, "users", userId.value), {
            //     boxes: arrayRemove(doc(db, "boxes", id))
            // })
            await updateDoc(boxDocRef, {
                latestMessage: `${userInfo.value.displayName} deleted this chat`,
                latestChange: Date.now()
            })
        } catch (e) {
            console.error(e.message)
        }
        // fetchBoxes();
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

        // await updateDoc(doc(db, "users", userId.value), {
        //     boxes: arrayRemove(doc(db, "boxes", id))
        // })

        await updateDoc(boxDocRef, {
            members: arrayRemove(doc(db, "users", userId.value)),
            latestMessage: `${userInfo.value.displayName} left this chat`,
            latestChange: Date.now()
        })
        const newMessage = await addDoc(messageCollectionRef, {
            content: userInfo.value.displayName + " left this Group ",
            timeSent: Date.now(),
            senderRef: userDocRef,
            messageType: 'system',
        });
        // fetchBoxes();
        $toast.info("Left " + title, {
            position: 'top-right'
        });
    } else {
        console.log("Deletion cancelled");
    }
}
function convertTime(timestamp) {
    const dateTime = new Date(timestamp);
    const today = new Date();
    const sameDay = dateTime.getDate() === today.getDate() &&
        dateTime.getMonth() === today.getMonth() &&
        dateTime.getFullYear() === today.getFullYear();

    let options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    if (!sameDay) {
        options = { day: 'numeric', month: 'numeric', year: 'numeric', ...options };
    }

    return dateTime.toLocaleString('en-GB', options);
}
onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
    });
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
    height: 5rem;
    width: 100%;
    display: flex !important;
    flex-direction: row !important;
    align-items: center;
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
    font-size: larger;
    white-space: nowrap;
    width: 100%;
    font-weight: bolder;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
