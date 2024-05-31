<template>
  <div class="container" ref="bgContainer">
    <v-app-bar :elevation="2" density="compact">
      <div class="top-bar">
        <v-btn icon="fa-solid fa-bars" @click="emit('openMenu')"></v-btn>
        <v-avatar :image="props.thumbnail"></v-avatar>
        <v-card-title class="box-name">{{ props.boxName }}</v-card-title>
        <div>
          <!-- <router-link to="/video-call" target="_blank">
            <v-icon icon="mdi-phone"></v-icon>
          </router-link> -->
          <!-- <router-link :to="'/video-call/' + props.boxId" target="_blank">
            <v-icon icon="fa-solid fa-video"></v-icon>
          </router-link> -->
          <!-- <v-btn icon="mdi-phone" @click="router.push('/video-call')" target="_blank">
          </v-btn> -->
          <!-- <v-btn icon="mdi-webcam" @click="showSetting = !showSetting"></v-btn> -->
          <!-- <v-btn icon="fa-solid fa-phone" @click="router.push('/video-call')" target="_blank"></v-btn>
          <v-btn icon="fa-solid fa-video" @click="router.push('/video-call')" target="_blank"></v-btn> -->
          <v-btn icon="fa-solid fa-ellipsis" @click="showSetting = !showSetting"></v-btn>
        </div>
      </div>
    </v-app-bar>
    <div v-if="user" class="message-container" @scroll="handleScroll()" ref="messageContainer">
      <div
        style="position:absolute; display:flex; flex-direction: row; justify-content:center;width:100%; top: 1rem;z-index: 999;">
        <Transition name="slide-fade-bottom">
          <v-btn v-show="showLoadMore" @click="loadMoreMessages()" prepend-icon="fa-solid fa-angles-up">
            {{ $t('load_more_msg') }}
          </v-btn>
        </Transition>
      </div>
      <div v-for="message in messageArray">
        <v-card-subtitle style="padding: 0;font-size: small;"
          v-if="!isSender(message.sender) && message.messageType !== 'system' && message.messageType !== 'bot'">
          {{ nameMap(message.sender) }}
        </v-card-subtitle>
        <v-card-subtitle style="padding: 0;font-size: small;" v-if="message.messageType == 'bot'">
          Gemini Bot
        </v-card-subtitle>
        <div v-if="messageArray" class="each-message">
          <v-avatar class="avatar"
            v-if="!isSender(message.sender) && message.messageType !== 'system' && message.messageType !== 'bot'"
            :image="avatarMap(message.sender)"></v-avatar>
          <v-avatar class="avatar" v-if="message.messageType == 'bot'"
            image="https://i.imgur.com/horI1zX.png"></v-avatar>
          <v-card-subtitle
            v-if="isSender(message.sender) && message.messageType !== 'system' && message.messageType !== 'bot'"
            style="margin-left: auto;">{{
      convertTime(message.time)
    }}</v-card-subtitle>
          <v-menu transition="scale-transition" location="start"
            v-if="isSender(message.sender) && message.messageType !== 'system' && message.messageType !== 'bot'">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" class="message-operation" size="small"
                icon="fa-solid fa-ellipsis-vertical"></v-icon>
            </template>
            <v-list>
              <v-list-item class="message-option" @click="deleteMessage(message.id)">
                <v-list-item-title>Unsend Message</v-list-item-title>
              </v-list-item>
              <v-list-item class="message-option">
                <v-list-item-title>Copy Message</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <div v-if="message.messageType !== 'system' && (!isSender(message.sender) || message.messageType == 'bot')"
            class="triangle-left"></div>
          <v-card style="display:flex; flex-wrap: wrap;"
            :class="messageType(message.sender, message.messageType, message.botMessage)"
            :variant="variantType(message.messageType)">
            <span v-if="message.messageType !== 'image'" v-html="parseMarkdown(message.content)"> </span>
            <v-dialog v-if="message.messageType == 'image'">
              <template v-slot:activator="{ props: activatorProps }">
                <!-- <v-btn v-bind="activatorProps" color="surface-variant" text="Open Dialog" variant="flat"></v-btn> -->
                <img class="" v-bind="activatorProps" style="max-width: 100%;" v-if="message.messageType == 'image'"
                  :src="message.content">
              </template>
              <template v-slot:default="{ isActive }">
                <v-card style="position:relative;" color="transparent">
                  <img :src="message.content" alt="">
                  <div @click="isActive.value = false"
                    style="position:fixed; top:1rem;right:1.5rem;z-index: 99;display: flex; align-items: center;cursor:pointer;">
                    <v-icon icon="fa-solid fa-x" size="x-large" color="error">
                    </v-icon>
                    <span style="font-size: 1.3rem"> &nbsp; or Esc</span>
                  </div>
                </v-card>
              </template>
            </v-dialog>
            <span>
            </span>
            <span v-if="message.messageType == 'system'">&nbsp;at {{ convertTime(message.time) }}</span>
          </v-card>
          <div v-if="message.messageType !== 'system' && isSender(message.sender) && message.messageType !== 'bot'"
            class="triangle-right"></div>
          <v-menu transition="scale-transition" location="start"
            v-if="isSender(message.sender) && message.messageType !== 'system' && message.messageType == 'bot'">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" class="message-operation" size="small"
                icon="fa-solid fa-ellipsis-vertical"></v-icon>
            </template>
            <v-list>
              <v-list-item class="message-option" @click="deleteMessage(message.id)">
                <v-list-item-title>Unsend Message</v-list-item-title>
              </v-list-item>
              <v-list-item class="message-option">
                <v-list-item-title>Copy Message</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-card-subtitle
            v-if="(!isSender(message.sender) && message.messageType == 'common') || message.messageType == 'bot'">{{
      convertTime(message.time)
    }}</v-card-subtitle>
        </div>
      </div>
      <div>

      </div>
      <BotLoading v-if="showLoading"></BotLoading>
      <div ref="bottomEl" style="height: .5rem;">
      </div>
    </div>
    <v-card class="send-container">
      <Transition name="slide-fade">
        <div v-if="displayBot" style="width: 3rem;display:flex; justify-content: center;">
          <v-icon icon="fa-solid fa-robot fa-bounce"></v-icon>
        </div>
      </Transition>
      <input @keydown.enter="sendMessage()" type="text" class="message-box" v-model="messageContent" id=""
        placeholder="@bot" />
      <v-btn style="color: var(--main-color)" @click="toggleImageSelect = !toggleImageSelect"><v-icon
          icon="fa-regular fa-image"></v-icon>
      </v-btn>
      <v-btn class="icon-button" style="color: var(--main-color)" @click="toggleIcon = !toggleIcon"><v-icon
          icon="fa-regular fa-face-smile"></v-icon>
      </v-btn>
      <v-btn style="color: var(--main-color)" @click="sendMessage"><v-icon size="large"
          icon="fa-solid fa-paper-plane"></v-icon></v-btn>
    </v-card>
    <Transition name="slide-fade-bottom">
      <EmojiPicker class="icon-board" v-show="toggleIcon" :native="true" @select="onSelectEmoji" />
    </Transition>
    <Transition name="slide-fade-bottom">
      <v-card class="image-send-board" v-if="toggleImageSelect" variant="flat" style="width: 20rem;">
        <div
          style='position: relative;border: dashed 2px gray;height: 10rem;display: flex;justify-content: center;align-items: center;overflow: hidden;'>
          <input type="file" @change="processImg" label="Image"
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
            style="height: 100%; width: 100%;position: absolute;top:0;opacity: 0;z-index:10;">
          <div
            style="height: 100%; width: 100%;position: absolute;top:0;display: flex;justify-content: center;align-items: center;">
            <v-icon icon="fa-solid fa-paperclip" size="4rem" style="opacity: 70%;">
            </v-icon>
          </div>
          <img v-if="thumbnailSrc" :src="thumbnailSrc" alt="" style="width: 100%; height: 100%;object-fit: contain;" />
        </div>
        <div style=" display: flex; width: 100%; justify-content: space-between;">
          <v-btn style="background-color: red;flex:1;" @click="thumbnailImg = ''; thumbnailSrc = ''; toggleImageSelect = false
      ">
            <v-icon icon="fa-solid fa-x"></v-icon>
          </v-btn>
          <v-btn :loading='imgUploading' style="background-color: green;flex:1;" @click="sendImg()">
            <v-icon icon="fa-solid fa-cloud-arrow-up"></v-icon>
          </v-btn>
        </div>
        <!-- <v-file-input class="img-input" id="formFile" @change="processImg" label="Image" hide-input loading
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp" variant="solo-filled"
          prepend-icon="fa-solid fa-paperclip" style="border: dashed 2px gray;"></v-file-input> -->

      </v-card>
    </Transition>
    <v-navigation-drawer location="right" v-if="showSetting">

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <GroupInfo :box-id="props.boxId" :box-name="props.boxName" v-if="props.boxId" :isAdmin="props.isAdmin"
          :description="props.description" :inviteId="props.inviteId" :isPublic="props.isPublic"></GroupInfo>
        <v-list-item prepend-icon="fa-solid fa-link" v-if="props.inviteId !== ''" @click="getInvite(props.inviteId)"
          :title="$t('invite_link')" value="account"></v-list-item>
        <v-divider></v-divider>
        <v-list-item prepend-icon="fa-solid fa-user-group" @click="toggleMember = !toggleMember"
          :title="$t('members_list')" value="members" :append-icon="expandIcon()">
        </v-list-item>
        <UserProfile v-if="toggleMember" v-for="member in memberArray" :id="member.id"></UserProfile>
        <v-list-item prepend-icon="fa-solid fa-images" @click="fetchImages()" :title="$t('images_grid')" value="images"
          append-icon="fa-solid fa-arrows-rotate">
        </v-list-item>
        <v-list-item>
          <div class="image-grid">
            <div v-for="image in imageGrid" :key='image'>
              <v-dialog>
                <template v-slot:activator="{ props: activatorProps }">
                  <v-img v-bind="activatorProps" :src="image.content" cover
                    style="aspect-ratio: 1 / 1; cursor: pointer;">
                  </v-img>
                </template>
                <template v-slot:default="{ isActive }">
                  <v-card style="position:relative;" color="transparent">
                    <img :src="image.content" alt="">
                    <div @click="isActive.value = false"
                      style="position:fixed; top:1rem;right:1.5rem;z-index: 99;display: flex; align-items: center;cursor:pointer;">
                      <v-icon icon="fa-solid fa-x" size="x-large" color="error">
                      </v-icon>
                      <span style="font-size: 1.3rem"> &nbsp; or Esc</span>
                    </div>
                  </v-card>
                </template>
              </v-dialog>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <div class="scroll-bottom">
      <Transition name="slide-fade-bottom">
        <v-btn v-show="showScrollDown" style="font-size:small;" icon="fa-solid fa-arrow-down-long"
          @click="scrollToBottom()"></v-btn>
      </Transition>
    </div>
  </div>
</template>
<script setup>
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  deleteDoc,
  orderBy,
  where,
  limit,
  getDoc,
  getDocs
} from "firebase/firestore";
import EmojiPicker from "vue3-emoji-picker";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "vue3-emoji-picker/css";
import { watch } from "vue";
import { ref, onMounted, toRefs } from "vue";
import { useUserStore } from "../stores/userStore";
import { storeToRefs } from "pinia";
import { GoogleGenerativeAI } from "@google/generative-ai"
import BotLoading from "../components/BotLoading.vue";
import { useToast } from 'vue-toast-notification';
import UserProfile from "../components/UserProfile.vue";
import GroupInfo from "../components/GroupInfo.vue";
import MarkdownIt from 'markdown-it';
import { useCookies } from "vue3-cookies";
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { getStorage, ref as firebaseRef, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';

const router = useRouter()

let { cookies } = useCookies()

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);
const userStore = useUserStore();
const props = defineProps(["boxId", "boxName", "boxMembers", "existedMembers", "isAdmin", "description", "inviteId", "thumbnail", "isPublic"]);
const user = ref();
const { userId, userInfo } = storeToRefs(userStore);

const showSetting = ref(false)
const auth = getAuth();
const toggleIcon = ref(false);
const messageContent = ref("");
const bottomEl = ref(null);
const messageArray = ref([]);
const toggleMember = ref(false);
const toggleImageSelect = ref(false);
const toast = useToast();
const emit = defineEmits(['openMenu'])

function expandIcon() {
  if (toggleMember.value) {
    return 'fa-solid fa-angle-up'
  } else {
    return 'fa-solid fa-angle-down'
  }
}
const parseMarkdown = (content) => {
  const md = new MarkdownIt();
  return md.render(content);
};
function isSender(sender) {
  return (`users/${userId.value}` == sender.path)
}
function messageType(sender, type) {
  if (type == 'system') {
    return 'system-message';
  } else if (type == 'bot') {
    return 'received-message';
  } else if (type == 'common' && sender.path == `users/${userId.value}` && type !== 'system') {
    return 'sender-message';
  } else {
    return 'received-message';
  }
}

function variantType(type) {
  if (type == 'system') {
    return 'plain'
  } else {
    return 'flat'
  }
}

function onSelectEmoji(emoji) {
  messageContent.value += emoji.i;
}
async function callApi(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
const showLoading = ref(false)
async function sendMessage() {
  toggleIcon.value = false;
  let checkMessage = messageContent.value.trim();
  if (checkMessage.length === 0) {
  } else {
    try {
      const userDocRef = doc(db, 'users', userStore.userId);
      const boxDocRef = doc(db, "boxes", props.boxId);
      const messageCollectionRef = collection(boxDocRef, "messages");
      const newMessage = await addDoc(messageCollectionRef, {
        content: messageContent.value,
        timeSent: Date.now(),
        senderRef: userDocRef,
        messageType: 'common',
      });
      await updateDoc(boxDocRef, {
        latestMessage: `${userInfo.value.displayName}: ${messageContent.value}`,
        latestChange: Date.now()
      })
      if (messageContent.value.toLowerCase().includes('@bot')) {
        showLoading.value = true;
        let prompt = messageContent.value.replace('@bot', '')
        messageContent.value = "";
        const aiRes = await callApi(prompt)
        await addDoc(messageCollectionRef, {
          content: aiRes,
          timeSent: Date.now(),
          senderRef: userDocRef,
          messageType: 'bot',
        });

        await updateDoc(boxDocRef, {
          latestMessage: `Bot: ${aiRes}`,
          latestChange: Date.now()
        })
      }
      messageContent.value = "";
      showLoading.value = false;
    } catch (e) {
      console.log(e);
      showLoading.value = false;
    }
  }
}

async function deleteMessage(id) {
  if (confirm("Delete message") == true) {
    // await deleteDoc(doc(db, "messages", id));
    const boxDocRef = doc(db, "boxes", props.boxId);
    const messageRef = doc(boxDocRef, "messages", id);
    await deleteDoc(messageRef);
    await updateDoc(boxDocRef, {
      latestMessage: `${userInfo.value.displayName} unsent a message`,
      latestChange: Date.now()
    })
    toast.info('Message unsent', {
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
function getInvite(id) {
  console.log(`${window.location.host}/invite/${id}`)
  navigator.clipboard.writeText(`${window.location.host}/invite/${id}`)
  toast.info('Invite link copied to the clipboard', {
    position: 'bottom-right'
  });
}
const memberArray = ref()
async function fetchMembers() {
  memberArray.value = null;
  const userRefArray = props.boxMembers;
  try {
    const userDocs = await Promise.all(userRefArray.map(ref => getDoc(ref)));
    memberArray.value = userDocs
      .filter(doc => doc.exists())
      .map(doc => {
        const data = { ...doc.data(), id: doc.id };
        return data;
      });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}
const existedMembers = ref()
const existedMapArray = ref()
async function fetchExisted() {
  existedMembers.value = null
  const existedRefArray = props.existedMembers
  try {
    const userDocs = await Promise.all(existedRefArray.map(ref => getDoc(ref)));
    existedMembers.value = userDocs.map(doc => {
      if (doc.exists()) {
        return doc.data();
      } else {
        return null;
      }
    });
    existedMapArray.value = userDocs
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}
function avatarMap(member) {
  try {
    if (existedMapArray.value) {
      const matchingMember = existedMapArray.value.find(element => member.path.includes(element.id));
      if (matchingMember) {
        return matchingMember.data().avatar;
      }
    }
    return null;
  } catch (error) {
    console.error(error)
  }
}
function nameMap(member) {
  try {
    if (existedMapArray.value) {
      const matchingMember = existedMapArray.value.find(element => member.path.includes(element.id));
      if (matchingMember) {
        return matchingMember.data().displayName;
      }
    }
    return null;
  } catch (error) {
    console.error(error)
  }
}
// function avatarMap(member) {
//   for (const element of memberMapArray.value) {
//     if (member.path.includes(element.id)) {
//       return element.data().avatar;
//     }
//   }
//   return "nothing";
// }
let thumbnailImg = ref(null);
const thumbnailSrc = ref();
const storage = getStorage();
const imgUploading = ref(false)
function processImg(event) {
  if (event.target.files.length) {
    thumbnailSrc.value = URL.createObjectURL(event.target.files[0]);
  }
  thumbnailImg.value = event.target.files[0];
}
async function sendImg() {
  imgUploading.value = true
  let now = new Date();
  let time = now.getTime().toString();
  const storageRef = firebaseRef(storage, 'images/' + time + '.png');
  try {
    const compressed = await imageCompression(thumbnailImg.value, {
      maxSizeMB: 1,
      useWebWorker: true,
    })
    const snapshot = await uploadBytes(storageRef, compressed);
    const downloadURL = await getDownloadURL(snapshot.ref);
    const userDocRef = doc(db, 'users', userStore.userId);
    const boxDocRef = doc(db, "boxes", props.boxId);
    const messageCollectionRef = collection(boxDocRef, "messages");
    await addDoc(messageCollectionRef, {
      content: downloadURL,
      timeSent: Date.now(),
      senderRef: userDocRef,
      messageType: 'image',
    });

    toggleImageSelect.value = false;
    thumbnailImg.value = '';
    thumbnailSrc.value = '';
    imgUploading.value = false;

    await updateDoc(boxDocRef, {
      latestMessage: `${userInfo.value.displayName}: *image*`,
      latestChange: Date.now(),
    });

    fetchImages();
  } catch (error) {
    console.error('Error:', error);
    imgUploading.value = false;
  }
}

const displayBot = ref(false)
watch(() => messageContent.value, (newValue, oldValue) => {
  if (newValue.includes('@bot')) {
    displayBot.value = true;
  } else {
    displayBot.value = false;
  }
})
let currentListener = ref(null);


const defaultLimit = 15;
let currentLimit = defaultLimit;

let currenBoxId = ref('')
function loadMoreMessages() {
  currentLimit += defaultLimit; // Increase the limit by defaultLimit
  getMessage(currenBoxId.value)
}
function getMessage(id) {
  if (currentListener.value) {
    (currentListener.value)();
    currentListener.value = null;
  }
  currenBoxId.value = id
  const listQuery = query(
    collection(db, "boxes", id, 'messages'),
    orderBy("timeSent", "desc"),
    limit(currentLimit)
  );
  currentListener.value = onSnapshot(listQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        content: doc.data().content,
        sender: doc.data().senderRef,
        time: doc.data().timeSent,
        messageType: doc.data().messageType
      });
    });
    messageArray.value = messages.reverse();
    setTimeout(() => {
      if (scrolledToBottom.value) {
        scrollToBottom()
      }
    }, 500);
  });
}
const showScrollDown = ref(false)
const showLoadMore = ref(false)
const scrolledToBottom = ref(true)
const messageContainer = ref()
function handleScroll() {
  if (messageContainer.value.scrollTop < 200) {
    showLoadMore.value = true
  } else {
    showLoadMore.value = false
  }
  // console.log(messageContainer.value.offsetHeight + messageContainer.value.scrollTop)
  // console.log(messageContainer.value.scrollHeight);
  // console.log(messageContainer.value.offsetHeight + messageContainer.value.scrollTop - messageContainer.value.scrollHeight >= -200)
  if (messageContainer.value.offsetHeight + messageContainer.value.scrollTop - messageContainer.value.scrollHeight >= -200) {
    scrolledToBottom.value = true
    showScrollDown.value = false
  } else {
    scrolledToBottom.value = false
    showScrollDown.value = true

  }
}
function scrollToBottom() {
  bottomEl.value?.scrollIntoView({ behavior: "smooth" });

}
watch(
  () => props.boxId,
  (newBoxId, oldBoxId) => {
    if (newBoxId) {
      getMessage(newBoxId)
      fetchMembers();
      fetchExisted();
      fetchImages()
    }

  },
  { immediate: true }
);
const bgContainer = ref(null)
const imageGrid = ref([])
async function fetchImages() {
  let imageArray = []
  const imageQuery = query(
    collection(db, "boxes", currenBoxId.value, 'messages'),
    where('messageType', '==', 'image'),
    orderBy("timeSent", "desc"),
    limit(10)
  );
  const images = await getDocs(imageQuery)
  images.forEach(element => {
    imageArray.push(element.data());
  });
  imageGrid.value = imageArray
}

onMounted(() => {
  fetchMembers();
  fetchExisted();
  bgContainer.value.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url(${cookies.get('bgImage')})`
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
  });

});
</script>

<style scoped>
p {
  margin: 0;
  padding: 0;
}

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  background-size: cover;
  /* filter: brightness(50%); */

}

.message-container {
  padding-left: 0.4rem;
  padding-right: 0.4rem;
  padding-bottom: 1rem;
  height: 100%;
  overflow: scroll;
  overflow-x: hidden;
}

.top-bar {
  width: 100%;
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between;
  align-items: center
}

/* width */
::-webkit-scrollbar {
  width: 10px;
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

.send-container {
  height: 50px;
  width: 100%;
  padding: 0.4rem;
  display: flex;
  gap: 0.2rem;
  align-items: center;
  box-sizing: border-box;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

.message-box {
  height: 100%;
  border: 2px solid var(--main-color);
  border-radius: 0.2rem;
  width: 100%;
  padding-left: 1rem;
  transition: all .5s linear;
  box-sizing: border-box;
}

.message-box:focus {
  outline: none;
  /* border: 2px solid rgb(183, 183, 183); */

}

.icon-board {
  position: absolute;
  bottom: 4rem;
  right: 2rem;
  /* z-index: 99; */
}

@media all and (max-width: 600px) {
  .icon-button {
    display: none;
  }
}

.image-send-board {
  padding: 1rem;
  position: absolute;
  right: 1rem;
  bottom: 3rem;
  z-index: 999;
  /* background-color: rgb(92, 92, 92); */
  border-top-left-radius: .5rem;
  border-top-right-radius: .5rem;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.each-message {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.received-message {
  max-width: 70%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: var(--main-color);
}

.sender-message {
  max-width: 70%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: var(--main-color);

}

.system-message {
  padding: 0.5rem;
  margin: auto;
  padding: auto;
}

.avatar {
  border-radius: 2rem;
}

.box-name {
  margin-right: auto;
}

.message-operation {
  color: rgb(92, 92, 92);
  border-radius: 1rem;
}

.message-operation:hover {
  background-color: rgb(130, 130, 130);
}

.message-option:hover {
  background-color: rgb(131, 131, 131);
  cursor: pointer;
}

.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}



.slide-fade-bottom-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-bottom-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-bottom-enter-from,
.slide-fade-bottom-leave-to {
  transform: translateY(40px);
  opacity: 0;
}

.each-member:hover {
  cursor: pointer;
  transition: all .2s linear;
  background-color: #68b16ab5;
}

.triangle-left {
  margin-left: .5rem;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid var(--main-color);
}

.triangle-right {
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid var(--main-color);
}

.scroll-bottom {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  bottom: 4rem;
  width: 100%;
}

a {
  /* Reset all styles to default */
  color: inherit;
  text-decoration: none;
}

.img-input {
  margin-top: 1rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  gap: 4px;
}
</style>
