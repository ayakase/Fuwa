<template>
  <div class="container">
    <v-app-bar :elevation="2" density="compact">
      <div class="top-bar">
        <v-card-title class="box-name">{{ props.boxName }}</v-card-title>
        <v-btn @click="loadMoreMessages()">Load More</v-btn>

        <div><v-btn icon="mdi-star"></v-btn>
          <v-btn icon="mdi-magnify"></v-btn>
          <v-btn icon="mdi-dots-vertical" @click="showSetting = !showSetting"></v-btn>
        </div>
      </div>
    </v-app-bar>
    <div v-if="user" class="message-container">
      <div v-for="message in messageArray">
        <v-card-subtitle style="padding: 0;font-size: small;"
          v-if="!isSender(message.sender) && message.systemMessage == false">
          {{ nameMap(message.sender) }}
        </v-card-subtitle>
        <div v-if="messageArray" class="each-message">
          <v-avatar class="avatar" v-if="!isSender(message.sender) && message.systemMessage == false"
            :image="avatarMap(message.sender)"></v-avatar>
          <v-card-subtitle v-if="isSender(message.sender) && message.systemMessage == false"
            style="margin-left: auto;">{{
      convertTime(message.time)
    }}</v-card-subtitle>
          <v-menu transition="scale-transition" location="start"
            v-if="isSender(message.sender) && message.systemMessage == false">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" class="message-operation" size="small" icon="mdi-dots-vertical"></v-icon>
            </template>
            <v-list>
              <v-list-item class="message-option" @click="deleteMessage(message.id)">
                <v-list-item-title>Delete Message</v-list-item-title>
              </v-list-item>
              <v-list-item class="message-option">
                <v-list-item-title>Edit Message</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-card style="display:flex;" :class="messageType(message.sender, message.systemMessage)"
            :variant="variantType(message.systemMessage)">
            <span v-html="parseMarkdown(message.content)"> </span>
            <!-- <span>{{ parseMarkdown(message.content) }}</span> -->
            <span>
            </span>
            <span v-if="message.systemMessage == true">&nbsp;at {{ convertTime(message.time) }}</span>
          </v-card>

          <v-card-subtitle v-if="!isSender(message.sender) && message.systemMessage == false">{{
      convertTime(message.time)
    }}</v-card-subtitle>
        </div>
      </div>
      <div>

      </div>
      <BotLoading v-if="showLoading"></BotLoading>

      <div ref="bottomEl"></div>
    </div>

    <v-card class="send-container">
      <Transition name="slide-fade">
        <div v-if="displayBot" style="width: 3rem;display:flex; justify-content: center;">
          <v-icon icon="mdi-robot-outline"></v-icon>
        </div>
      </Transition>

      <input @keydown.enter="sendMessage()" type="text" class="message-box" v-model="messageContent" id="" autofocus />

      <v-btn @click="toggleImageSelect = !toggleImageSelect"><v-icon icon="mdi-image"></v-icon>
      </v-btn>

      <v-btn @click="toggleIcon = !toggleIcon"><v-icon icon="mdi-emoticon-happy-outline"></v-icon>
      </v-btn>
      <v-btn @click="sendMessage"><v-icon style="transform: rotate(270deg);" icon="mdi-send"></v-icon></v-btn>
    </v-card>
    <Transition name="slide-fade-bottom">
      <EmojiPicker class="icon-board" v-show="toggleIcon" :native="true" @select="onSelectEmoji" />
    </Transition>
    <Transition name="slide-fade-bottom">
      <div class="image-send-board" v-if="toggleImageSelect">
        <!-- <input class="img-input" accept="image/*" type="file" id="formFile" @change="processImg" /> -->
        <v-file-input class="img-input" id="formFile" @change="processImg" label="Image"
          variant="solo-filled"></v-file-input>
        <div style="width: 20rem; margin-top: 1rem">
          <img :src="thumbnailSrc" alt="" style="width: 100%" />
        </div>
        <div style="display: flex; width: 100%; justify-content: space-between;">
          <v-btn style="background-color: red;" @click="thumbnailImg = ''; thumbnailSrc = ''">
            <v-icon icon="mdi-close-circle"></v-icon>
          </v-btn>
          <v-btn style="background-color: green;" @click="sendImg()"><v-icon icon="mdi-cloud-upload"></v-icon>
          </v-btn>
        </div>
      </div>
    </Transition>
    <v-navigation-drawer location="right" v-if="showSetting">
      <template v-slot:prepend>
        <v-list-item lines="two" prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg" title="Jane Smith"
          subtitle="Logged in"></v-list-item>
      </template>
      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home-city" title="Home" value="home"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="My Account" value="account"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group-outline" @click="toggleMember = !toggleMember" title="Members"
          value="members">
        </v-list-item>
        <v-list-item v-for="member in memberArray" :key="member" :prepend-avatar="member.avatar">
          <div>
            {{ member.displayName }}
          </div>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>
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
  limit,
  getDoc,
  DocumentReference,
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

import MarkdownIt from 'markdown-it';
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);
const userStore = useUserStore();
const props = defineProps(["boxId", "boxName", "boxMembers", "existedMembers"]);
const user = ref();
const { userId } = storeToRefs(userStore);
const showSetting = ref(false)
const auth = getAuth();
const toggleIcon = ref(false);
const messageContent = ref("");
const sentMessages = ref(["hello"]);
const bottomEl = ref(null);
const messageArray = ref([]);
const toggleMember = ref(false);
const toggleImageSelect = ref(false);
const parseMarkdown = (content) => {
  const md = new MarkdownIt();
  return md.render(content);
};
function isSender(sender) {
  return (`users/${userId.value}` == sender.path)
}
function messageType(sender, isSystemMessage) {
  if (isSystemMessage == true) {
    return 'system-message';
  } else if (sender.path == `users/${userId.value}` && isSystemMessage == false) {
    return 'sender-message';
  } else {
    return 'received-message';
  }
}
function variantType(isSystemMessage) {
  if (isSystemMessage == true) {
    return 'plain'
  } else {
    return 'elevated'
  }
}
function mapMembers() {
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
        systemMessage: false,
      });
      if (messageContent.value.toLowerCase().includes('/bot')) {
        showLoading.value = true;
        let prompt = messageContent.value.replace('/bot', '')
        messageContent.value = "";
        const aiRes = await callApi(prompt)
        await addDoc(messageCollectionRef, {
          content: `🤖💬: ${aiRes}`,
          timeSent: Date.now(),
          senderRef: userDocRef,
          systemMessage: false,
        });
      }
      messageContent.value = "";
      showLoading.value = false;
    } catch (e) {
      console.log(e);
    }
  }
}

async function deleteMessage(id) {
  if (confirm("Delete message") == true) {
    // await deleteDoc(doc(db, "messages", id));
    const boxDocRef = doc(db, "boxes", props.boxId);
    const messageRef = doc(boxDocRef, "messages", id);
    await deleteDoc(messageRef);
  } else {
    console.log("Deletion cancelled");
  }
}
function convertTime(timestamp) {
  const dateTime = new Date(timestamp);
  const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
  return dateTime.toLocaleString('en-GB', options);
}
const memberArray = ref()
const memberMapArray = ref()
async function fetchMembers() {
  memberArray.value = null
  const userRefArray = props.boxMembers
  try {
    const userDocs = await Promise.all(userRefArray.map(ref => getDoc(ref)));
    memberArray.value = userDocs.map(doc => {
      if (doc.exists()) {
        return doc.data();
      } else {
        return null;
      }
    });
    // memberMapArray.value = userDocs
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}
const existedMembers = ref()
const existedMapArray = ref()
async function fetchExisted() {
  existedMembers.value = null
  console.log(props)
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
    const matchingMember = existedMapArray.value.find(element => member.path.includes(element.id));
    if (matchingMember) {
      return matchingMember.data().avatar;
    }
    return null;
  } catch (error) {
    console.error(error)
  }
}
function nameMap(member) {
  try {
    const matchingMember = existedMapArray.value.find(element => member.path.includes(element.id));
    if (matchingMember) {
      return matchingMember.data().displayName;
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
function processImg(event) {
  if (event.target.files.length) {
    thumbnailSrc.value = URL.createObjectURL(event.target.files[0]);
  }
  thumbnailImg.value = event.target.files[0];
}
function sendImg() {
  console.log(thumbnailImg.value);
  console.log(thumbnailSrc.value);
}
let currentListener = ref(null);
const displayBot = ref(false)
watch(() => messageContent.value, (newValue, oldValue) => {
  if (newValue.includes('/bot')) {
    displayBot.value = true;
  } else {
    displayBot.value = false;
  }
})

watch(
  () => props.boxId,
  (newBoxId, oldBoxId) => {
    if (currentListener.value) {
      (currentListener.value)();
      currentListener.value = null;
    }

    const listQuery = query(
      collection(db, "boxes", newBoxId, 'messages'),
      orderBy("timeSent", "desc"),
      limit(15)
    );

    currentListener.value = onSnapshot(listQuery, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          content: doc.data().content,
          sender: doc.data().senderRef,
          time: doc.data().timeSent,
          systemMessage: doc.data().systemMessage
        });
      });
      messageArray.value = messages.reverse();
      setTimeout(() => {
        bottomEl.value?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    });
    fetchMembers();
    fetchExisted();
  },
  { immediate: true }
);
onMounted(() => {
  console.log(props.existedMembers)
  fetchMembers();
  fetchExisted();
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
  });
  const listQuery = query(
    collection(db, "boxes", props.boxId, 'messages'),
    // where("boxRef", "==", doc(db, `box/${props.boxId}`)),
    orderBy("timeSent", "asc")
  )
  console.log(props.boxId)

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
  background: #68b16b;
  border-radius: 2px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #579359;
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
  border: 2px solid rgb(183, 183, 183);
  border-radius: 0.5rem;
  width: 100%;
  padding-left: 1rem;
}

.icon-board {
  position: absolute;
  bottom: 4rem;
  right: 2rem;
  /* z-index: 99; */
}

.image-send-board {
  padding: 1rem;
  position: absolute;
  right: 5rem;
  bottom: 4rem;
  background-color: rgb(92, 92, 92);
  border-radius: 0.5rem;

}

.each-message {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

}

.received-message {
  max-width: 50%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #68b16b;
}

.sender-message {
  max-width: 50%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #68b16b;

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
</style>
