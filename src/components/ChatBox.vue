<template>
  <div class="container">
    <v-app-bar :elevation="2" density="compact">
      <div class="top-bar">
        <v-card-title class="box-name">{{ props.boxName }}</v-card-title>
        <div><v-btn icon="mdi-star"></v-btn>
          <v-btn icon="mdi-magnify"></v-btn>
          <v-btn icon="mdi-dots-vertical" @click="showSetting = !showSetting"></v-btn>
        </div>
      </div>
    </v-app-bar>
    <div v-if="user" class="message-container">

      <div v-if="messageArray" class="each-message" v-for="message in messageArray">
        <v-avatar class="avatar" v-if="!isSender(message.sender) && message.systemMessage == false"
          :image="user.photoURL"></v-avatar>
        <v-card-subtitle v-if="isSender(message.sender) && message.systemMessage == false" style="margin-left: auto;">{{
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
        <v-card :class="messageType(message.sender, message.systemMessage)" :variant="variantType(message.systemMessage)">
          {{ message.content }} <span v-if="message.systemMessage == true"> at {{ convertTime(message.time) }}</span>
        </v-card>
        <v-card-subtitle v-if="!isSender(message.sender) && message.systemMessage == false">{{ convertTime(message.time)
        }}</v-card-subtitle>
      </div>
      <div ref="bottomEl"></div>
    </div>
    <v-card class="send-container">
      <input @keydown.enter="sendMessage()" type="text" class="message-box" v-model="messageContent" id="" />
      <v-btn @click="toggleIcon = !toggleIcon"><v-icon icon="mdi-emoticon-happy-outline"></v-icon>
      </v-btn>
      <v-btn @click="sendMessage">Send <v-icon icon="mdi-send"></v-icon></v-btn>
    </v-card>
    <EmojiPicker class="icon-board" v-if="toggleIcon" :native="true" @select="onSelectEmoji" />
    <v-navigation-drawer location="right" v-if="showSetting">
      <template v-slot:prepend>
        <v-list-item lines="two" prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg" title="Jane Smith"
          subtitle="Logged in"></v-list-item>
      </template>
      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home-city" title="Home" value="home"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="My Account" value="account"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group-outline" title="Users" value="users"></v-list-item>
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
  getDocs,
} from "firebase/firestore";
import EmojiPicker from "vue3-emoji-picker";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "vue3-emoji-picker/css";
import { watch } from "vue";
import { ref, onMounted, toRefs } from "vue";
import { useUserStore } from "../stores/userStore";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const props = defineProps(["boxId", "test", "boxName", "boxMembers"]);
const user = ref();
const { userId } = storeToRefs(userStore);
const showSetting = ref(false)
const auth = getAuth();
const toggleIcon = ref(false);
const messageContent = ref("");
const sentMessages = ref(["hello"]);
const bottomEl = ref(null);
const messageArray = ref([]);
watch(
  () => props.boxId,
  (newBoxId, oldBoxId) => {
    const listQuery = query(
      collection(db, "messages"),
      where("boxRef", "==", doc(db, `box/${props.boxId}`)),
      orderBy("timeSent", "asc")
    );
    onSnapshot(listQuery, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          content: doc.data().content,
          sender: doc.data().senderRef,
          time: doc.data().timeSent,
          systemMessage: doc.data().systemMessage
        });
        messageArray.value = messages;
      });
    });
  }
);

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

function onSelectEmoji(emoji) {
  messageContent.value += emoji.i;
}
async function sendMessage() {
  let checkMessage = messageContent.value.trim();
  if (checkMessage.length === 0) {
  } else {
    try {
      const userDocRef = doc(db, `users/${userStore.userId}`);
      const boxDocRef = doc(db, `box/${props.boxId}`);
      const newMessage = await addDoc(collection(db, "messages"), {
        content: messageContent.value,
        timeSent: Date.now(),
        senderRef: userDocRef,
        boxRef: boxDocRef,
        systemMessage: false,
        
      });
      toggleIcon.value = false;
      messageContent.value = "";
      bottomEl.value.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      console.log(e);
    }
  }
}

async function deleteMessage(id) {
  if (confirm("Delete message") == true) {
    await deleteDoc(doc(db, "messages", id));
  } else {
    console.log("Deletion cancelled");
  }
}
function convertTime(timestamp) {
  const dateTime = new Date(timestamp);
  const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
  return dateTime.toLocaleString('en-GB', options);
}

// async function fetchMembers() {
//   const members = await getDocs();
//   console.log(props.boxMembers[0]);
// }
onMounted(() => {
  // props.boxMembers.forEach(element => {
  //   console.log(element.path)
  // });
  // fetchMembers()
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
  });
  const listQuery = query(
    collection(db, "messages"),
    where("boxRef", "==", doc(db, `box/${props.boxId}`)),
    orderBy("timeSent", "asc")
  );
  onSnapshot(listQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        content: doc.data().content,
        time: doc.data().timeSent,
        sender: doc.data().senderRef,
        systemMessage: doc.data().systemMessage
      });
      messageArray.value = messages;

    });
  });
  setTimeout(() => {
    bottomEl.value.scrollIntoView({ behavior: "smooth" });
  }, 1000);
});
</script>

<style scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
</style>
