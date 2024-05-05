<template>
    <div class="container">
        <v-text-field v-model="searchTerm" class="search-box" label="Search"
            append-inner-icon="fa-solid fa-magnifying-glass" variant="solo-filled" @input="handleInput">
            <template v-slot:loader>
                <v-progress-linear :active="custom" :model-value="progress" height="2"
                    indeterminate></v-progress-linear>
            </template>

        </v-text-field>
        <div class="result-container">
            <v-card class="each-box" v-if="resultBoxes" v-for="box in resultBoxes">
                <img style="position: absolute; top:0; height: 50%; width: 100%; object-fit: cover;filter: brightness(70%)"
                    src="https://static.planetminecraft.com/files/resource_media/screenshot/1216/Minecraft-banner-2_2053463.jpg">
                <div style="position: absolute; top: 0; height: 100%;width:100%; display: flex; align-items: center;">
                    <img style="margin-left: 5%;width: 20%;border-radius: 9999px"
                        src="https://cdn5.vectorstock.com/i/1000x1000/92/89/hipster-avatar-image-vector-19639289.jpg"
                        alt="">
                    <div>{{ box.title }}</div>
                </div>
                <div>
                    <div> {{ box.description }}</div>
                    <div>{{ countMembers(box.members) }} </div>
                </div>
                <v-card-actions>
                    <div style="width: 100%; display: flex; justify-content: flex-end;">
                        <v-btn v-if="!joined(box.members)" @click="joinBox(box.id)">Join</v-btn>
                        <v-btn disabled v-if="joined(box.members)">Joined</v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, getDocs, arrayUnion, query, where, updateDoc, getDoc } from 'firebase/firestore';
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

const value = ref('')
const custom = ref(false)
const progress = computed(() => {
    return Math.min(100, value.value.length * 10)
})

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
        'preset': 'default',
        // 'filter_by': 'isPublic:true'
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
            custom.value = false
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
        }).then(() => {
            console.log("done")
        }).catch((err) => {
            console.log("error")
        });
        // await updateDoc(userDocRef, {
        //     boxes: arrayUnion(boxRef)
        // })
        const newMessage = await addDoc(messageCollectionRef, {
            content: userInfo.value.displayName + " joined this Group ",
            timeSent: Date.now(),
            senderRef: userDocRef,
            messageType: 'system',
        });
        await updateDoc(boxRef, 'latestMessage', `${userInfo.value.displayName}: joined this chat`)
        await updateDoc(boxRef, 'latestChange', Date.now())
    } catch (e) {
        console.error(e);
    }
}
function joined(members) {
    const memberPath = members.map((member) => member.path);
    return memberPath.includes(`users/${userId.value}`);
}
let typingTimeout
function handleInput() {
    custom.value = true
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
    /* align-items: center; */
}

.search-box {
    width: 48%;
    max-height: 5rem;
}

.result-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 2rem;
}

.each-box {
    position: relative;
    min-width: 48%;
    max-width: 48%;
    height: 20rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    /* background-color: var(--main-color) */
}
</style>