<template>
    <div class="container">
        <div class="cover-section">

            <div style="width:100%; display: flex;justify-content: center;align-items:center;flex-wrap: wrap;">
                <v-text-field v-model="searchTerm" class="search-box" label="Search" hide-details single-line
                    append-inner-icon="fa-solid fa-magnifying-glass" variant="solo-filled" @input="handleInput">
                    <template v-slot:loader>
                        <v-progress-linear :active="progressBar" :model-value="progress" height="2"
                            indeterminate></v-progress-linear>
                    </template>
                </v-text-field>
                <v-select clearable label="Category" style="max-width:15rem;margin:0;" :items="categoryIcons"
                    return-object single-line hide-details variant="solo-inverted" v-model="category"
                    :append-inner-icon="iconSelect()">
                </v-select>
            </div>
        </div>
        <div style="display:flex; align-items: center;gap:1rem;width: 95%;">
            <h2>
                Explore what people are talking about
            </h2>
            <v-icon icon="fa-regular fa-compass fa-shake" style="font-size:2rem;color:#ff1744;"></v-icon>
        </div>
        <div class="result-container">
            <v-dialog max-width="800" v-if="resultBoxes" v-for="box in resultBoxes">
                <template v-slot:activator="{ props: activatorProps }">
                    <v-card class="each-box" elevation="3" variant="elevated" hover link v-bind="activatorProps">
                        <v-img class="box-cover" :src="box.banner" cover
                            alt="https://ceblog.s3.amazonaws.com/wp-content/uploads/2012/03/cupcakeIpsum.jpg"></v-img>
                        <div
                            style="display: flex;flex-direction: column; transform: translateY(-3rem);padding-left: 1rem;padding-right: 1rem;">
                            <img style="width: 20%;border-radius: 1rem; background-color: whitesmoke;"
                                :src="box.thumbnail" alt="">
                            <div>
                                <h3>{{ box.title }}</h3>
                                <div
                                    style="overflow: hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;">
                                    {{ box.description }}</div>
                                <div>{{ countMembers(box.members) }} </div>
                            </div>
                        </div>
                        <div style="width: 100%; display: flex; justify-content: flex-end;position: absolute;bottom:0;">
                            <v-btn v-if="!joined(box.members)" @click="joinBox(box.id)">Join</v-btn>
                            <v-btn disabled v-if="joined(box.members)">Joined</v-btn>
                        </div>
                    </v-card>
                </template>

                <template v-slot:default="{ isActive }">
                    <v-card class="mx-auto" style="width:100%">
                        <v-img :src="box.banner" cover></v-img>

                        <v-card-title>
                            {{ box.title }}
                        </v-card-title>

                        <v-card-text>
                            {{ box.description }}
                        </v-card-text>

                        <v-card-actions>
                            <v-btn color="orange-lighten-2" text="Explore"></v-btn>

                            <v-spacer></v-spacer>

                            <v-btn :icon="show ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="show = !show"></v-btn>
                        </v-card-actions>

                        <v-expand-transition>
                            <div v-show="show">
                                <v-divider></v-divider>

                                <v-card-text>
                                    I'm a thing. But, like most politicians, he promised more than he could deliver. You
                                    won't have time for sleeping, soldier, not with all the bed making you'll be doing.
                                    Then we'll go with that data file! Hey, you add a one and two zeros to that or we
                                    walk! You're going to do his laundry? I've got to find a way to escape.
                                </v-card-text>
                            </div>
                        </v-expand-transition>
                    </v-card>
                </template>
            </v-dialog>


            <!-- <v-skeleton-loader 
        v-for="x in 10" :key='x'
          class="mx-auto border"
          type="image, article"
          style="width: 48%"
        ></v-skeleton-loader> -->
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAuth } from 'firebase/auth';
import ChatLoading from '@/components/ChatLoading.vue';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, getDocs, arrayUnion, query, where, updateDoc, getDoc } from 'firebase/firestore';
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/userStore';
import Typesense from 'typesense'
const user = ref()
// const auth = getAuth()
const toast = useToast();

const searchTerm = ref("")
const resultBoxes = ref([])
const userStore = useUserStore()
const { userId } = storeToRefs(userStore)
const { userInfo } = storeToRefs(userStore);

const value = ref('')
const progressBar = ref(false)
const progress = computed(() => {
    return Math.min(100, value.value.length * 10)
})
const category = ref({ id: 'all', title: 'All', icon: 'fa-solid fa-earch' })
const categoryIcons = [
    { id: 'all', title: 'All', icon: 'fa-solid fa-earth' },
    { id: 'gaming', title: 'Gaming', icon: 'fa-solid fa-gamepad' },
    { id: 'music', title: 'Music', icon: 'fa-solid fa-music' },
    { id: 'entertainment', title: 'Entertainment', icon: 'fa-solid fa-tv' },
    { id: 'tech', title: 'Science & Tech', icon: 'fa-solid fa-atom' },
    { id: 'education', title: 'Education', icon: 'fa-solid fa-graduation-cap' }
];
function iconSelect() {
    const select = categoryIcons.find(cat => cat.id === category.value.id);
    return select ? select.icon : null;
}
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
            progressBar.value = false
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
        toast.success("Joined", {
            position: 'top-right'
        });
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
    progressBar.value = true
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
    gap: 1.5rem;
    height: 100%;
    display: flex;
    overflow: scroll;
    /* overflow-x: hidden; */
    flex-direction: column;
    align-items: center;
}

.cover-section {
    background-color: red;
    margin-top: 1rem;
    border-radius: 1rem;
    width: 95%;
    min-height: 28rem !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    background-image: url('../assets/search-cover.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: bottom;
}

.search-box {
    max-width: 48%;
    max-height: 5rem;
}

.result-container {
    width: 95%;
    display: grid;
    grid-template-columns: repeat(auto-fill, 25rem);
    justify-content: space-between;
    gap: 2rem;
}

.each-box {
    position: relative;
    /* min-width: 20%; */
    /* max-width: 20%; */
    height: 20rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    /* justify-content: space-between; */
    border-radius: .6rem;
    /* background-color: var(--main-color) */
    transition: all .1s linear;

}

.each-box:hover {
    outline: 4px solid var(--main-color);
    transform: translateY(-0.2rem)
}

.box-cover {
    /* position: absolute;
    top: 0; */
    min-height: 9rem;
    max-height: 9rem;

    /* width: 100%; */
    /* object-fit: cover; */
    filter: brightness(70%);
    transition: transform 0.3s ease;

}

.each-box:hover .box-cover {
    transform: scale(1.05);
}


h2 {
    font-size: 2rem;
    background: linear-gradient(to right,
            #7953cd 20%,
            #00affa 40%,
            #21bd02 60%,
            #0190cd 80%,
            #764ada 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
    background-size: 500% auto;
    animation: textShine 5s ease-in-out infinite alternate;
}

@keyframes textShine {
    0% {
        background-position: 0% 50%;
    }

    100% {
        background-position: 100% 50%;
    }
}

@media (max-width: 800px) {
    .cover-section {
        border-radius: 0;
        margin-top: 0;
        width: 100%;
        min-height: 10rem !important;
    }

    h2 {
        font-size: 1.5rem;
    }
}
</style>