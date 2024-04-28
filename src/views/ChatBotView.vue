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
        <div class="message-container">
            <div v-html="botAnswer">
            </div>
            <div ref="bottomEl"></div>
        </div>
        <v-card class="send-container">
            <input @keydown.enter="askBot()" type="text" class="message-box" v-model="question" id="" autofocus />
            <v-btn @click="toggleIcon = !toggleIcon"><v-icon icon="mdi-emoticon-happy-outline"></v-icon>
            </v-btn>
            <v-btn @click="askBot()">Send <v-icon icon="mdi-send"></v-icon></v-btn>
        </v-card>
        <EmojiPicker class="icon-board" v-if="toggleIcon" :native="true" @select="onSelectEmoji" />
        <v-navigation-drawer location="right" v-if="showSetting">
            <template v-slot:prepend>
                <v-list-item lines="two" prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg"
                    title="Jane Smith" subtitle="Logged in"></v-list-item>
            </template>
            <v-divider></v-divider>

            <v-list density="compact" nav>
                <!-- <v-list-item prepend-icon="mdi-home-city" title="Home" value="home"></v-list-item>
                <v-list-item prepend-icon="mdi-account" title="My Account" value="account"></v-list-item> -->
                <v-list-item prepend-icon="mdi-account-group-outline" @click="toggleMember = !toggleMember"
                    title="Members" value="members">
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

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

const userStore = useUserStore();
const props = defineProps(["boxId", "test", "boxName", "boxMembers"]);
const user = ref();
const { userId } = storeToRefs(userStore);
const showSetting = ref(false)
const auth = getAuth();
const toggleIcon = ref(false);
const messageContent = ref("");
const question = ref("");
const bottomEl = ref(null);
const toggleMember = ref(false);
const botAnswer = ref("")
function askBot() {
    let checkMessage = question.value.trim();
    if (checkMessage.length === 0) {

    } else {
        try {
            callApi(checkMessage)
        } catch (e) {
            console.log(e.message)
        }
    }
}
async function callApi(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    botAnswer.value = result.response.text()
}
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
