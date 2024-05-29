<template>
    <div class="container">
        <v-navigation-drawer :width="400" class="box-view" :rail="rail" rail-width="80" v-model="showSidebar"
            absolute="false">
            <div class="message-top-bar">
                <!-- <v-btn v-if="!rail" icon="mdi-sort" variant="text"></v-btn> -->

                <!-- <v-btn v-if="!rail" variant="text" icon="fa-solid fa-rotate-right" @click="reloadBoxes()"></v-btn> -->

            </div>
            <div style="padding-left: 1rem; padding-right:1rem;margin-top: 1rem;">
                <v-text-field v-model="searchCid" label="Connection ID" prepend-icon="fa-solid fa-magnifying-glass"
                    variant="underlined" @input="handleInput"></v-text-field>
            </div>
            <v-list>
                <UserProfile v-if="userResult" v-for="user in userResult" :id="user.id" :name="user.name"
                    :cid="user.cid" :avatar="user.avatar"></UserProfile>
            </v-list>
            <v-divider></v-divider>
            <v-list style="display: flex; flex-direction: column;gap:.2rem; padding-left: .2rem;padding-right: .2rem;">
                <!-- <v-list-item v-for="inbox in inboxes" :key="inbox" @click='selectInbox()'>
                    <div>{{ inbox.id }}</div>
                    <div>{{ inbox.receiver.displayName }}</div>
                </v-list-item> -->
                <v-list-item class="chat-box-container" v-if="inboxes.length > 0" v-for="inbox in  inboxes "
                    :key="inbox" :value="inbox.id" @click="selectInbox(inbox.id, inbox.members)"
                    style="overflow:hidden;border-radius: .5rem;">
                    <v-tooltip v-if="rail" activator="parent" location="end">
                        <p>
                            {{ inbox.receiver.displayName }}
                        </p>
                    </v-tooltip>
                    <div class="chat-box">
                        <div style="display:flex; align-items: center;gap:1rem;position:relative">
                            <img :src="inbox.receiver.avatar" alt=""
                                style="width:4rem;transition: width 0.3s ease;border-radius:9999px;"
                                :style="getStyle(rail)">

                            <div>
                                <p class="box-title" v-if="!rail">
                                    {{ inbox.receiver.displayName }}
                                </p>
                                <p v-if="!rail"
                                    style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width: 15rem;">
                                    {{ inbox.latestMessage }} </p>
                                <p style="font-size: 12px;"> at {{ convertTime(inbox.latestChange) }}</p>

                            </div>
                        </div>
                        <!-- <v-menu location="end" transition="scale-transition">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" icon="fa-solid fa-ellipsis" size="small">
                                </v-btn>
                            </template>
<v-card style="width:10rem;">
    <div style="width:100%">
        <button class="leave-box-button" @click="pinBox(box.id)">
            Pin to top
            <v-icon size="small" icon="fa-solid fa-thumbtack"></v-icon>
        </button>
        <button v-if="showDeleteBtn(box.owner) && !rail" class="delete-box-button"
            @click="deleteBox(box.title, box.id)">
            Delete group
            <v-icon size="small" icon="fa-regular fa-trash-can"></v-icon>
        </button>
        <button v-if="showLeaveBtn(box.owner) && !rail" class="leave-box-button" @click="leaveBox(box.title, box.id)">
            Leave group
            <v-icon size="small" icon="fa-solid fa-arrow-right-from-bracket"></v-icon>
        </button>
    </div>
</v-card>
</v-menu> -->

                    </div>
                </v-list-item>
                <!-- <v-card-subtitle style="text-align: center;" v-else-if="inboxes.length == 0 && hasInboxes == false">You
                    have
                    not
                    joined any
                    chat</v-card-subtitle> -->
                <ChatLoading v-else></ChatLoading>

            </v-list>
            <div style="position:absolute;bottom:0;width:100%;">
                <v-btn style="width:100%;height:3rem;" variant="tonal" v-if="rail" @click.stop="rail = false">
                    <v-icon size='large' icon="fa-solid fa-chevron-right"></v-icon>
                </v-btn>
                <v-btn style="width:100%;height:3rem;" variant="tonal" v-if="!rail" @click.stop="rail = true">
                    <v-icon size='large' icon="fa-solid fa-chevron-left"></v-icon>
                </v-btn>
            </div>
        </v-navigation-drawer>
        <InboxBox @openMenu="openGroups()" v-if="boxId" :box-id="boxId" :box-members="inboxMembers"></InboxBox>
        <NoBox @openMenu="openGroups()" v-else></NoBox>
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
    getDocs,
    orderBy,
    where,
    updateDoc,
    arrayRemove,
    arrayUnion,
    getDoc,
} from "firebase/firestore";
import { ref, watch, computed, onMounted } from "vue";
import { useUserStore } from "../stores/userStore";
import LoadingComponent from "../components/LoadingComponent.vue";
import ChatLoading from "../components/ChatLoading.vue";
import NoBox from "../components/NoBox.vue";
import InboxBox from "../components/InboxBox.vue";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { storeToRefs } from "pinia";
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { getStorage, ref as firebaseRef, uploadBytes, getDownloadURL } from "firebase/storage";
import UserProfile from "../components/UserProfile.vue";

const storage = getStorage();

const $toast = useToast();
const userStore = useUserStore();
const user = ref();
const auth = getAuth();
const { userId, userInfo } = storeToRefs(userStore);
const rail = ref(false);
const boxId = ref("");
const boxName = ref("");
const inboxMembers = ref([]);
const boxDescription = ref("");
const existedMembers = ref([]);
const boxInviteId = ref("");
const test = ref();
const hasInboxes = ref(true);
const isAdmin = ref(false)

let typingTimeout
function handleInput() {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        findUsers();
    }, 200);
}
let searchCid = ref('')
let userResult = ref([])
async function findUsers() {
    if (searchCid.value && searchCid.value.includes('#')) {
        console.log(searchCid.value)
        let response = []
        const userRef = collection(db, 'users')
        const users = await getDocs(query(userRef, where('cid', '>=', searchCid.value.trim()), where('cid', '<=', searchCid.value.trim() + '\uf8ff')))
        users.forEach((doc) => {
            response.push({
                avatar: doc.data().avatar,
                name: doc.data().displayName,
                cid: doc.data().cid,
                id: doc.id
            })
        });
        userResult.value = response
    } else {
        userResult.value = []
    }
}

function selectInbox(id, members) {
    boxId.value = id;
    inboxMembers.value = members
    if (window.matchMedia("(max-width: 600px)").matches) {
        showSidebar.value = false
    }
}
const inboxes = ref([]);

async function fetchInboxes() {
    if (userId.value) {
        const listQuery = query(
            collection(db, "inboxes"),
            where("members", "array-contains", doc(db, "users", userId.value)),
            orderBy("latestChange", "desc")
        );

        onSnapshot(listQuery, async (snapshot) => {
            let userDocRef = doc(db, 'users', userStore.userId);
            const inboxesList = [];
            if (snapshot.docs.length > 0) {
                await Promise.all(snapshot.docs.map(async (doc) => {
                    let member = doc.data().members.find((member) => {
                        return member.path !== userDocRef.path;
                    });
                    const receiver = await getDoc(member);
                    inboxesList.push({ receiver: receiver.data(), ...doc.data(), id: doc.id });
                }));
                inboxes.value = inboxesList;
                hasInboxes.value = true;
            } else {
                inboxes.value = [];
                hasInboxes.value = false;
            }
        });
    }
}

// async function fetchInboxes() {
//     if (userId.value) {
//         const listQuery = query(collection(db, "inboxes"),
//             where("members", "array-contains", doc(db, "users", userId.value)),
//             orderBy("latestChange", "desc")
//         )
//         onSnapshot(listQuery, (snapshot) => {
//             let userDocRef = doc(db, 'users', userStore.userId)
//             const inboxesList = [];
//             if (snapshot.docs.length > 0) {
//                 snapshot.forEach(async (doc) => {
//                     let member = doc.data().members.find((member) => {
//                         return member.path !== userDocRef.path
//                     })
//                     const receiver = await getDoc(member)
//                     console.log(receiver.data())
//                     inboxesList.push({ receiver: receiver.data(), ...doc.data(), id: doc.id });
//                 });
//                 inboxes.value = inboxesList;
//                 hasInboxes.value = true;
//             } else {
//                 inboxes.value = [];
//                 hasInboxes.value = false;
//             }

//         })
//     }
// }

// async function getUser(user) {
//     if (user) {
//         const querySnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
//         querySnapshot.forEach((doc) => {
//             userInfo.value = doc.data();
//             userStore.changeUserInfo(userInfo.value);
//             userStore.changeUserId(doc.id);
//             userId.value = doc.id
//         });
//     }
// }
// async function reloadBoxes() {
//     await getUser(user.value)
//     await fetchBoxes();

// }
watch(
    () => userId.value,
    (newUserId, oldUserId) => {
        if (newUserId) {
            fetchInboxes();
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
const newBoxBanner = ref("")
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
const thumbnailSrc = ref();
const previewThumnail = ref();
const croppedThumbnail = ref()

function getThumbnailUrl(event) {
    if (event.target.files.length) {
        thumbnailSrc.value = URL.createObjectURL(event.target.files[0]);
    }
}
function getPreviewThumnail({ coordinates, canvas }) {
    console.log(coordinates, canvas);
    canvas.toBlob((blob) => {
        croppedThumbnail.value = blob;
    });
    previewThumnail.value = canvas.toDataURL();

}
async function uploadThumbnail() {
    let now = new Date();
    let time = now.getTime().toString();
    const storageRef = firebaseRef(storage, 'thumbnails/' + time + '.png');
    try {
        const snapshot = await uploadBytes(storageRef, croppedThumbnail.value);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading thumbnail:", error);
        throw error;
    }
}
const bannerSrc = ref();
const previewBanner = ref()
const croppedBanner = ref()
function getBannerUrl(event) {
    if (event.target.files.length) {
        bannerSrc.value = URL.createObjectURL(event.target.files[0]);
    }
}
function getPreviewBanner({ coordinates, canvas }) {
    console.log(coordinates, canvas);
    canvas.toBlob((blob) => {
        croppedBanner.value = blob;
    });
    previewBanner.value = canvas.toDataURL();

}
async function uploadBanner() {
    let now = new Date();
    let time = now.getTime().toString();
    const storageRef = firebaseRef(storage, 'thumbnails/' + time + '.png');
    try {
        const snapshot = await uploadBytes(storageRef, croppedBanner.value);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading thumbnail:", error);
        throw error;
    }
}
const btnLoading = ref(false)
async function addBoxToDb() {
    try {
        btnLoading.value = true
        const userDocRef = doc(db, 'users', userStore.userId);
        newBoxThumbnail.value = await uploadThumbnail()
        newBoxBanner.value = await uploadBanner()
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
            banner: newBoxBanner.value,
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
        btnLoading.value = false

        $toast.success("Created box chat " + newBoxTitle.value, {
            position: 'top-right'
        });
        // setTimeout(() => {
        //     fetchBoxes()
        // }, 3000);
    } catch (e) {
        btnLoading.value = false
        console.error("Error adding document: ", e);
    }
}
function getStyle(rail) {
    return { width: rail ? '2.5rem' : '4rem' }
}
function showDeleteBtn(owner) {
    return (`users/${userId.value}` == owner.path)
}
function showLeaveBtn(owner) {
    return !(`users/${userId.value}` == owner.path)
}

async function pinBox(id) {
    const boxDocRef = doc(db, 'boxes', id)
    const userDocRef = doc(db, 'users', userStore.userId);
    try {
        await updateDoc(userDocRef, {
            pin: boxDocRef
        })
        reloadBoxes()
    } catch (e) {
        console.log(e)
    }
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
const showSidebar = ref(true)
function openGroups() {
    showSidebar.value = true;
    // sideBreakpoint.value = sideBreakpoint.value === 'md' ? '0' : 'md';
    // rail.value = true;
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
    height: 3rem;
    width: 100%;
}

.delete-box-button:hover,
.leave-box-button:hover {
    background-color: var(--main-color);
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

/* .chat-box-container:active {
    transition: all .5s linear;
    transform: scale(1.2);
} */
.active {
    /* animation: shake 5s;
    animation-iteration-count: infinite; */
    transition: all .2s linear;
}

.box-view {
    height: calc(100vh - 60px) !important;
}

@media all and (min-width: 1280px) {
    .box-view {
        height: 100vh !important;
    }
}
</style>
