<template>
    <div class="container">
        <v-navigation-drawer :width="400" :rail="rail" rail-width="80" v-model="showSidebar">
            <div class="box-view">
                <div class="message-top-bar" style='height: 3rem;'>
                    <v-btn variant="flat" icon="fa-solid fa-bars" @click="showSidebar = false" style="height:100%">
                    </v-btn>
                    <v-dialog width="800" v-if="!rail">
                        <template v-slot:activator="{ props }">
                            <v-btn style="height: 100%;flex:1;" variant="flat" class="add-box" v-bind="props">
                                Create
                                <v-icon icon="fa-solid fa-plus"></v-icon>
                            </v-btn>
                        </template>
                        <template v-slot:default="{ isActive }">
                            <v-card class="new-dialog">
                                <div style="display:flex;flex-direction: column; gap: 1rem;">
                                    <v-card-title style="text-align: center">{{ $t('new_chat_title') }}</v-card-title>
                                    <v-text-field variant="underlined" v-model="newBoxTitle" :label="$t('new_box_name')"
                                        required hide-details></v-text-field>
                                    <v-text-field variant="underlined" v-model="newBoxDescription"
                                        :label="$t('new_box_description')" required hide-details></v-text-field>
                                    <div
                                        style="display:flex; flex-direction: row;align-items:center;gap:1rem;flex-wrap: wrap;">
                                        <v-text-field style="min-width: 50%" variant="underlined"
                                            v-model="newBoxInviteId" :label="$t('new_box_invite_id')" required
                                            hide-details disabled></v-text-field>
                                        <v-btn style="height:3rem;background-color:green;" @click="generateInviteId()">
                                            {{ $t('random_id') }}</v-btn>
                                        <v-btn style="height:3rem;background-color:red;" @click="newBoxInviteId = ''">{{
            $t('cancel') }}</v-btn>
                                    </div>
                                    <div style="display:flex; flex-direction:column;align-items: center;gap:1rem">
                                        <v-dialog>
                                            <template v-slot:activator="{ props: activatorProps }">
                                                <v-btn v-bind="activatorProps"
                                                    style="background-color: green;color: white;width:15rem;">{{
            $t('select_thumbnail')
        }}</v-btn>
                                            </template>
                                            <template v-slot:default="{ isActive }">
                                                <v-card
                                                    style="display: flex; flex-direction: column;align-items: center;padding:1rem;">
                                                    <v-file-input
                                                        accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                                                        style="width:50%" prepend-icon="" class="img-input"
                                                        id="formFile" @change="getThumbnailUrl" label="Image"
                                                        variant="solo-filled"></v-file-input>
                                                    <div style="max-width: 50%;">
                                                        <cropper :src="thumbnailSrc" @change="getPreviewThumnail"
                                                            :stencil-props="{ aspectRatio: 1 }"
                                                            :stencil-component="CircleStencil" />
                                                        <!-- <img :src="croppedThumbnail" alt=""> -->
                                                    </div>
                                                    <v-card-actions>
                                                        <v-btn color="success" @click="isActive.value = false">
                                                            {{ $t('save') }}
                                                        </v-btn>

                                                    </v-card-actions>
                                                </v-card>
                                            </template>
                                        </v-dialog>
                                        <img style="width: 50%;border-radius: 9999px;" :src="previewThumnail" alt="">
                                    </div>
                                    <div style="display:flex; flex-direction:column;align-items: center;gap:1rem">
                                        <v-dialog>
                                            <template v-slot:activator="{ props: activatorProps }">
                                                <v-btn v-bind="activatorProps"
                                                    style="background-color: green;color: white;width:15rem;">
                                                    {{ $t('select_banner') }}</v-btn>
                                            </template>
                                            <template v-slot:default="{ isActive }">
                                                <v-card
                                                    style="display: flex; flex-direction: column;align-items: center;padding:1rem;">
                                                    <v-file-input
                                                        accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                                                        style="width:50%" prepend-icon="" class="img-input"
                                                        id="formFile" @change="getBannerUrl" label="Image"
                                                        variant="solo-filled"></v-file-input>
                                                    <div style="max-width: 50%;">
                                                        <cropper :src="bannerSrc" @change="getPreviewBanner"
                                                            :stencil-props="{ aspectRatio: 12 / 3 }" />
                                                    </div>
                                                    <v-card-actions>
                                                        <v-btn color="success" @click="isActive.value = false">
                                                            {{ $t('save') }}
                                                        </v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </template>
                                        </v-dialog>
                                        <img style="width: 80%" :src="previewBanner" alt="">
                                    </div>
                                    <div style="display: flex; align-items: center;gap: 1rem;">
                                        <v-switch :label="newBoxPublicState" false-value="Private" true-value="Public"
                                            hide-details v-model="newBoxPublicState" inset></v-switch>
                                        <v-icon v-if="newBoxPublicState == 'Private'" icon="fa-solid fa-lock">
                                        </v-icon>
                                        <v-icon v-else icon="fa-solid fa-earth-americas"></v-icon>
                                    </div>

                                </div>
                                <v-card-actions>
                                    <v-btn variant="outlined" color="error" :text="$t('cancel')"
                                        @click="isActive.value = false">
                                    </v-btn>
                                    <v-btn :loading="btnLoading" variant="outlined" color="success"
                                        :text="$t('new_chat_btn')" @click="addBoxToDb()">
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </template>
                    </v-dialog>
                    <v-btn variant="text" @click="boxes = []; reloadBoxes()" style="height:100%;flex:1;" v-if="!rail">
                        Reload
                        <v-icon icon="fa-solid fa-arrow-rotate-right">
                        </v-icon>
                    </v-btn>

                </div>
                <v-list
                    style="display: flex; flex-direction: column;gap:.2rem; padding-left: .2rem;padding-right: .2rem;overflow:scroll;overflow-x: hidden;flex:1;padding:0;">
                    <!-- <v-divider></v-divider> -->
                    <v-list-item :class="{ active: box.id == boxId }"
                        @click="selectBox(box.id, box.title, box.members, box.existed, box.owner, box.description, box.invite, box.thumbnail, box.isPublic)"
                        class="chat-box-container" v-if="boxes.length > 0" v-for="box in  boxes " :key="box"
                        :value="box.id" style="overflow:hidden;border-radius: .5rem;">
                        <img :src="box.banner" alt="" v-if="!rail"
                            style="position:absolute;left:0;top:0;z-index: -1;width: 100%;filter:  brightness(40%);background-color: gray;">
                        <v-tooltip v-if="rail" activator="parent" location="end">
                            <p>
                                {{ box.title }}
                            </p>
                            <p>
                                {{ box.latestMessage }}
                            </p>
                        </v-tooltip>
                        <div class="chat-box">
                            <div style="display:flex; align-items: center;gap:1rem;position:relative;color:whitesmoke;">
                                <img :src="box.thumbnail" alt=""
                                    style="width:4rem;transition: width 0.3s ease;border-radius:9999px;"
                                    :style="getStyle(rail)">
                                <div>
                                    <p style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width: 12rem;"
                                        class="box-title" v-if="!rail">{{ box.title }}</p>
                                    <p v-if="!rail"
                                        style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width: 12rem;">
                                        {{ box.latestMessage }}</p>
                                    <p style="font-size: 12px;"> at {{ convertTime(box.latestChange) }}</p>
                                </div>
                            </div>
                            <v-icon size="small" v-if="box.pinned"
                                style="position: absolute; top:.5rem;left:.5rem;color:#f44336;"
                                icon="fa-solid fa-thumbtack"></v-icon>

                            <v-menu location="end" transition="scale-transition">
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
                                        <button v-if="showLeaveBtn(box.owner) && !rail" class="leave-box-button"
                                            @click="leaveBox(box.title, box.id)">
                                            Leave group
                                            <v-icon size="small" icon="fa-solid fa-arrow-right-from-bracket"></v-icon>
                                        </button>
                                    </div>
                                </v-card>
                            </v-menu>

                        </div>
                    </v-list-item>
                    <v-card-subtitle style="text-align: center;" v-else-if="boxes.length == 0 && hasBox == false">You
                        have
                        not
                        joined any
                        chat</v-card-subtitle>
                    <ChatLoading v-else></ChatLoading>
                </v-list>
                <div style="width:100%;">
                    <v-btn style="width:100%;height:3rem;" variant="tonal" v-if="rail" @click.stop="rail = false">
                        <v-icon size='large' icon="fa-solid fa-chevron-right"></v-icon>
                    </v-btn>
                    <v-btn style="width:100%;height:3rem;" variant="tonal" v-if="!rail" @click.stop="rail = true">
                        <v-icon size='large' icon="fa-solid fa-chevron-left"></v-icon>
                    </v-btn>
                </div>
            </div>
        </v-navigation-drawer>
        <ChatBox @openMenu="openGroups()" :box-id="boxId" :box-name="boxName" :existed-members="existedMembers"
            :box-members="boxMembers" v-if="boxId" :isAdmin="isAdmin" :description="boxDescription" :isPublic="isPublic"
            :inviteId="boxInviteId" :thumbnail="boxThumbnail"></ChatBox>
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
    runTransaction
} from "firebase/firestore";
import { ref, watch, computed, onMounted } from "vue";
import { useUserStore } from "../stores/userStore";
import ChatLoading from "../components/ChatLoading.vue";
import NoBox from "../components/NoBox.vue";
import ChatBox from "../components/ChatBox.vue";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { storeToRefs } from "pinia";
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { getStorage, ref as firebaseRef, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';

const storage = getStorage();

const $toast = useToast();
const userStore = useUserStore();
const user = ref();
const auth = getAuth();
const { userId, userInfo } = storeToRefs(userStore);
const rail = ref(false);
const boxes = ref([]);
const boxId = ref("");
const boxName = ref("");
const boxMembers = ref([]);
const boxDescription = ref("");
const existedMembers = ref([]);
const boxInviteId = ref("");
const boxThumbnail = ref("");
const hasBox = ref(true);
const isAdmin = ref(false)
const isPublic = ref(false)
function selectBox(id, title, members, existed, owner, description, invite, thumbnail, publicState) {
    boxId.value = id;
    boxName.value = title;
    boxMembers.value = members;
    existedMembers.value = existed;
    boxDescription.value = description;
    boxInviteId.value = invite
    boxThumbnail.value = thumbnail
    isPublic.value = publicState
    isAdmin.value = `users/${userId.value}` == owner.path
    if (window.matchMedia("(max-width: 600px)").matches) {
        showSidebar.value = false
    }
}
async function fetchBoxes() {
    if (userId.value) {
        const listQuery = query(collection(db, "boxes"),
            where("members", "array-contains", doc(db, "users", userId.value)),
            orderBy("latestChange", "desc")
        )
        onSnapshot(listQuery, (snapshot) => {
            const boxesList = [];
            if (snapshot.docs.length > 0) {
                snapshot.forEach((doc) => {
                    if (userInfo.value.pin && userInfo.value.pin.path == doc.ref.path) {
                        boxesList.unshift({ ...doc.data(), id: doc.id, pinned: true })
                    } else {
                        boxesList.push({ ...doc.data(), id: doc.id, pinned: false });
                    }
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
async function getUser(user) {
    if (user) {
        const querySnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
        querySnapshot.forEach((doc) => {
            userInfo.value = doc.data();
            userStore.changeUserInfo(userInfo.value);
            userStore.changeUserId(doc.id);
            userId.value = doc.id
        });
    }
}
async function reloadBoxes() {
    await getUser(user.value)
    await fetchBoxes();

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

const newBoxPublicState = ref("Private");
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
        const compressed = await imageCompression(croppedThumbnail.value, {
            maxSizeMB: .1,
            useWebWorker: true,
        })
        const snapshot = await uploadBytes(storageRef, compressed);
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
    canvas.toBlob((blob) => {
        croppedBanner.value = blob;
    });
    previewBanner.value = canvas.toDataURL();
}

async function uploadBanner() {
    let now = new Date();
    let time = now.getTime().toString();
    const storageRef = firebaseRef(storage, 'banners/' + time + '.png');
    try {
        const compressed = await imageCompression(croppedBanner.value, {
            maxSizeMB: .5,
            useWebWorker: true,
        })
        const snapshot = await uploadBytes(storageRef, compressed);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading thumbnail:", error);
        throw error;
    }
}
const btnLoading = ref(false)
async function addBoxToDb() {
    if (!newBoxTitle.value || !newBoxDescription.value || !croppedThumbnail.value || !croppedBanner.value) {
        $toast.error("Do not leave title, description, thumbnail and banner empty", {
            position: 'top'
        });
    } else {
        try {
            btnLoading.value = true;
            await runTransaction(db, async (transaction) => {
                const userDocRef = doc(db, 'users', userStore.userId);
                newBoxThumbnail.value = await uploadThumbnail();
                newBoxBanner.value = await uploadBanner();
                const newBox = await addDoc(collection(db, "boxes"), {
                    title: newBoxTitle.value,
                    owner: userDocRef,
                    members: [userDocRef],
                    existed: [userDocRef],
                    description: newBoxDescription.value,
                    isPublic: (newBoxPublicState.value === 'Public') ? true : false,
                    password: newBoxPassword.value,
                    invite: newBoxInviteId.value,
                    thumbnail: newBoxThumbnail.value,
                    banner: newBoxBanner.value,
                    dateCreated: Date.now(),
                });
                const boxDocRef = doc(db, "boxes", newBox.id);
                await updateDoc(boxDocRef, {
                    latestMessage: `${userInfo.value.displayName} created this chat`,
                    latestChange: Date.now()
                });
                await addDoc(collection(boxDocRef, "messages"), {
                    content: userInfo.value.displayName + " created this Group ",
                    timeSent: Date.now(),
                    senderRef: userDocRef,
                    messageType: 'system',
                });
            });
            btnLoading.value = false;
            $toast.success("Created box chat " + newBoxTitle.value, {
                position: 'top'
            });
        } catch (e) {
            btnLoading.value = false;
            console.error("Error adding document: ", e);
        }
    }
}

function getStyle(rail) {
    return { width: rail ? '2.2rem' : '4rem' }
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
            // await updateDoc(boxDocRef, {
            //     latestMessage: `${userInfo.value.displayName} deleted this chat`,
            //     latestChange: Date.now()
            // })
        } catch (e) {
            console.error(e.message)
        }
        // fetchBoxes();
        $toast.info("Deleted box chat " + title, {
            position: 'top'
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
            position: 'top'
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
.container {
    width: 100%;
    height: 100%;
}

.add-box {
    /* margin-top: 1rem;
    width: 100%; */
}

.new-dialog {
    padding: 1rem;
    padding-top: 0;
    max-height: 80vh !important;
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
    align-items: center;
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-x: hidden;
    height: calc(100vh - 60px) !important;
}

@media all and (min-width: 1280px) {
    .box-view {
        height: 100vh !important;
    }
}

::-webkit-scrollbar {
    width: 4px;
}

/* Track */
::-webkit-scrollbar-track {
    border-radius: 2px;
    background-color: rgb(229, 229, 229);
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: gray;
    border-radius: 2px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    /* background: #579359; */
}
</style>
