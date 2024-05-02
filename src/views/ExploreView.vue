<template>
    <div class="container">
        <v-text-field v-model="searchTerm" class="search-box" label="Search" prepend-icon="fa-solid fa-magnifying-glass"
            variant="underlined" @input="handleInput"></v-text-field>
        <div class="result-container">
            <v-card image="https://cdn.vuetifyjs.com/docs/images/cards/dark-beach.jpg" class="each-box"
                v-if="resultBoxes" v-for="box in resultBoxes" :title="box.title" :text="box.description">
                <v-card-text> {{ countMembers(box.members) }}</v-card-text>
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
import Typesense from 'typesense'

const user = ref()
const auth = getAuth()
const searchTerm = ref("")
const resultBoxes = ref([])
const userStore = useUserStore()
const { userId } = storeToRefs(userStore)
const { userInfo } = storeToRefs(userStore);

let client = new Typesense.Client({
    'nodes': [{
        'host': import.meta.env.VITE_TYPESENSE_HOST,
        'port': '443',
        'protocol': 'https'
    }],
    'apiKey': import.meta.env.VITE_TYPESENSE_API,
    'connectionTimeoutSeconds': 2
})
function performSearch() {


}
async function fetchBoxes() {
    let resultArray = []
    let search = {
        'q': searchTerm.value,
        'preset': 'default'

    }
    client.collections('boxes')
        .documents()
        .search(search)
        .then(function (searchResults) {
            // console.log(searchResults.hits)
            searchResults.hits.forEach(result => {
                resultArray.push(result.document)
            });
            resultBoxes.value = resultArray
        })
    // const response = []
    // const querySnapshot = await getDocs(
    //     query(
    //         collection(db, "boxes"),
    //         where("isPublic", "==", true),
    //         // where("title", "array-contains", searchTerm.value)
    //         where("title", ">=", searchTerm.value),
    //         where("title", "<=", searchTerm.value + '\uf8ff')
    //     )
    // );
    // querySnapshot.forEach((doc) => {
    //     response.push({
    //         title: doc.data().title,
    //         description: doc.data().description,
    //         id: doc.id

    //     });
    // });
    // resultBoxes.value = response
}
async function joinBox(id) {
    const boxRef = doc(db, "boxes", id)
    const userDocRef = doc(db, "users", userId.value);
    const messageCollectionRef = collection(boxRef, "messages");
    try {
        await updateDoc(boxRef, {
            members: arrayUnion(userDocRef),
            existed: arrayUnion(userDocRef),
        });
        await updateDoc(userDocRef, {
            boxes: arrayUnion(boxRef)
        })
        const newMessage = await addDoc(messageCollectionRef, {
            content: userInfo.value.displayName + " joined this Group ",
            timeSent: Date.now(),
            senderRef: userDocRef,
            messageType: 'system',
        });
    } catch (e) {
        console.error(e);
    }
}
let typingTimeout
function handleInput() {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        fetchBoxes();
    }, 200);
}
function countMembers(members) {
    return members.length
}
onMounted(() => {
    fetchBoxes()
})

</script>

<style scoped>
.container {
    padding: 2rem;
    height: 100%;
    display: flex;
    overflow: scroll;
    overflow-x: hidden;
    flex-direction: column;
    align-items: center;
}

.search-box {
    width: 30%;
    max-height: 5rem;
}

.result-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 2rem;
}

.each-box {
    width: 100%;
    height: 15rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}
</style>