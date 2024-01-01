<template>
  <div class="container">
    <v-app-bar :elevation="2" density="compact">
      <div class="top-bar">
        <v-btn icon="mdi-star"></v-btn>
        <v-btn icon="mdi-magnify"></v-btn>
        <v-btn icon="mdi-dots-vertical"></v-btn>
      </div>
    </v-app-bar>
    <div v-if="user" class="message-container">
      <div class="each-message" v-for="x in 10">
        <img :src="user.photoURL" class="avatar">
        <v-card class="message-received">
          xin chao xin chao xin chao xin chao xin chao xin chao xin chao xin chao xin chao xin chao xin chao xin chao xin
          chao xin chao
        </v-card>
      </div>
      <div class="each-message-sent" v-for="message in sentMessages">
        <v-card class="message-received">
          {{ message }}
        </v-card>
        <div v-if="boxId">{{ boxId }}</div>
        <!-- <img :src="user.photoURL" class="avatar"> -->
      </div>
      <div ref="bottomEl"></div>
    </div>
    <v-card class="send-container">
      <input @keydown.enter="sendMessage()" type="text" class="message-box" v-model="messageContent" id="">
      <v-btn @click="toggleIcon = !toggleIcon"><v-icon icon="mdi-emoticon-happy-outline"></v-icon>
      </v-btn>
      <v-btn @click="sendMessage">Send <v-icon icon="mdi-send"></v-icon></v-btn>
    </v-card>
    <EmojiPicker class="icon-board" v-if="toggleIcon" :native="true" @select="onSelectEmoji" />
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const auth = getAuth()
const user = ref()
import 'vue3-emoji-picker/css'
import { watch } from 'vue';
const toggleIcon = ref(false)
const messageContent = ref("")
const sentMessages = ref(["hello"])
const bottomEl = ref(null)
const { boxId, test } = defineProps(['boxId', 'test']);
watch(boxId, async (newValue, oldValue) => {
  console.log(newValue)
})
function onSelectEmoji(emoji) {
  console.log(emoji.i)
  messageContent.value += emoji.i
}
function sendMessage() {
  let checkMessage = messageContent.value.trim()
  if (checkMessage.length === 0) {
    console.log("Empty Message")
  } else {
    sentMessages.value.push(messageContent.value)
    toggleIcon.value = false
    messageContent.value = ''
    setTimeout(() => {
      bottomEl.value.scrollIntoView({ behavior: 'smooth' })
    }, 200);
  }
}
onMounted(() => {
  onAuthStateChanged(auth, (firebaseUser) => {
    console.log(firebaseUser)
    user.value = firebaseUser
  })
  setTimeout(() => {
    bottomEl.value.scrollIntoView({ behavior: 'smooth' })
  }, 1000);
})
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
  justify-content: flex-end !important;
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
  background: #13bead;
  border-radius: 2px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #b30000;
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

.message-received {
  max-width: 50%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.each-message {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 1rem;
}

.avatar {
  height: 3rem;
  border-radius: 2rem;

}

.each-message-sent {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}
</style>