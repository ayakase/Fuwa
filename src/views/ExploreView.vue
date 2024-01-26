<template>
    <div class="container">
        <div v-if="userId"> {{ userId }}</div>
        <v-text-field v-model="searchTerm" class="search-box" label="Search" prepend-icon="mdi-magnify" variant="underlined"
            @input="handleInput"></v-text-field>
        <div class="result-container">
            <v-card class="each-box" v-if="resultBoxes" v-for="box in resultBoxes" :title="box.title"
                :text="box.description">
                <v-card-actions>
                    <v-btn @click="joinBox(box.id)">Join</v-btn>
                </v-card-actions>
            </v-card>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, getDocs, arrayUnion, query, where, updateDoc } from 'firebase/firestore';
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/userStore';

const user = ref()
const auth = getAuth()
const searchTerm = ref("")
const resultBoxes = ref([])
const userStore = useUserStore()
const { userId } = storeToRefs(userStore)
async function fetchBoxes() {
    const response = []
    const querySnapshot = await getDocs(
        query(
            collection(db, "boxes"),
            where("isPublic", "==", true),
            // where("title", "array-contains", searchTerm.value)
            where("title", ">=", searchTerm.value),
            where("title", "<=", searchTerm.value + '\uf8ff')
        )
    );
    querySnapshot.forEach((doc) => {
        response.push({
            title: doc.data().title,
            description: doc.data().description,
            id: doc.id

        });
    });
    resultBoxes.value = response
}
async function joinBox(id) {
    const boxRef = doc(db, "boxes", id)
    const userDocRef = doc(db, "users", userId.value);
    await updateDoc(boxRef, {
        members: arrayUnion(userDocRef)
    });
    const newMessage = await addDoc(collection(db, "messages"), {
        content: user.value.displayName + " joined this Group ",
        timeSent: Date.now(),
        senderRef: userDocRef,
        boxRef: boxDocRef,
        systemMessage: true,
    });
}
let typingTimeout
function handleInput() {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        fetchBoxes();
    }, 1000);
}
onMounted(() => {
    fetchBoxes()
})

</script>

<style scoped>
.container {
    padding: 2rem;
    height: 100%;
}

.search-box {
    width: 30%;
}

.result-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2rem;
}

.each-box {
    width: 30%;
    height: 15rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}
</style>