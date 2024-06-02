<template>
    <div class="container">
        <div class="cover-section">
            <div
                style="width:100%; display: flex;align-items:center;flex-wrap: wrap; flex-direction: column;gap: .2rem;">
                <v-text-field v-model="searchTerm" class="search-box" :label="$t('search_placeholder')
                    " hide-details single-line append-inner-icon="fa-solid fa-magnifying-glass" variant="solo-filled"
                    @input="handleInput">
                    <template v-slot:loader>
                        <v-progress-linear :active="progressBar" :model-value="progress" height="2"
                            indeterminate></v-progress-linear>
                    </template>
                </v-text-field>
            </div>
        </div>
        <div style="display:flex; align-items: center;gap:1rem;width: 95%;">
            <h2>
                {{
                    $t('explore_title')
                }}
            </h2>
            <v-icon icon="fa-regular fa-compass fa-shake" style="font-size:2rem;color:#ff1744;"></v-icon>
        </div>
        <div class="result-container" v-if="resultBoxes">
            <v-dialog max-width="800" v-for="box in resultBoxes">
                <template v-slot:activator="{ props: activatorProps }">
                    <v-card class="each-box" elevation="3" variant="elevated" hover link v-bind="activatorProps">
                        <v-img class="box-cover" :src="box.banner" cover
                            alt="https://ceblog.s3.amazonaws.com/wp-content/uploads/2012/03/cupcakeIpsum.jpg"></v-img>
                        <div
                            style="display: flex;flex-direction: column; transform: translateY(-3rem);padding-left: 1rem;padding-right: 1rem;">
                            <v-card class="preview-thumbnail" variant="flat" border="background lg">
                                <v-img :src="box.thumbnail" alt=""></v-img>
                            </v-card>
                            <div>
                                <h3>{{ box.title }}</h3>
                                <div class="box-description">
                                    {{ box.description }}</div>
                            </div>
                        </div>
                        <div
                            style="display: flex;align-items: center; justify-content:space-between;position: absolute;bottom:.6rem;padding-left: 1rem;padding-right: 1rem;width:100%;">
                            <div>
                                <v-icon icon="fas fa-user-group" size="xm"></v-icon>
                                <span style="margin-left: .8rem">{{ countMembers(box.members) }} members</span>
                            </div>
                            <div v-if="joined(box.members)"
                                style="color: chartreuse;background-color: green;padding-left: .6rem;padding-right: .6rem;border-radius: 1rem;">
                                Joined
                            </div>

                        </div>
                    </v-card>
                </template>

                <template v-slot:default="{ isActive }">
                    <v-card class="mx-auto" style="width:100%">
                        <v-img class="" :src="box.banner" cover
                            alt="https://ceblog.s3.amazonaws.com/wp-content/uploads/2012/03/cupcakeIpsum.jpg"></v-img>
                        <div
                            style="display: flex;flex-direction: column; transform: translateY(-7rem);padding-left: 1rem;padding-right: 1rem;">
                            <div style="width:100%;display: flex;justify-content: center;">
                                <v-card variant="flat" style="width: 25%;border-radius: 9999px;" border="background xl">
                                    <!-- <v-img :src="box.thumbnail" alt="s"></v-img> -->
                                    <img :src="box.thumbnail" alt=""
                                        style="width: 100%;height: 100%;object-fit: cover;">
                                </v-card>
                            </div>
                            <div>
                                <h3>{{ box.title }}</h3>
                                <div>
                                    {{ box.description }}</div>
                                <div style="display: flex;align-items: center;gap: 1rem;"> <v-icon
                                        icon="fas fa-user-group" size="xm"></v-icon>{{
                    countMembers(box.members)
                }} members </div>
                            </div>
                        </div>
                        <div
                            style="width: 100%; display: flex; justify-content: center;position: absolute;bottom:1rem;">
                            <v-btn style="height: 4rem;font-size: large;" v-if="!joined(box.members)"
                                @click="joinBox(box.id)">
                                {{ $t('join') }}
                                &nbsp; <i class="fa-solid fa-arrow-right-to-bracket"></i>
                            </v-btn>
                            <v-btn style="height: 4rem;font-size: large;" disabled
                                v-if="joined(box.members)">Joined</v-btn>
                        </div>
                    </v-card>
                </template>
            </v-dialog>

        </div>
        <div class="result-container" v-else>
            <v-skeleton-loader v-for="x in perPage" :key='x' class="mx-auto border"
                style="width: 100%; border-radius: .6rem;overflow: hidden" type="image, article"></v-skeleton-loader>
        </div>
        <v-pagination v-if="totalPages" prev-icon="fa-solid fa-chevron-left" next-icon="fa-solid fa-chevron-right"
            v-model="page" :length="totalPages" class="my-4" @click="fetchBoxes" :total-visible="2"></v-pagination>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/userStore';
import Typesense from 'typesense'
import router from '@/router';
const toast = useToast();

const searchTerm = ref("")
const resultBoxes = ref()
const userStore = useUserStore()
const { userId } = storeToRefs(userStore)
const { userInfo } = storeToRefs(userStore);
const value = ref('')
const progressBar = ref(false)
const progress = computed(() => {
    return Math.min(100, value.value.length * 10)
})
// const category = ref({ id: 'all', title: 'All', icon: 'fa-solid fa-earch' })
// const categoryIcons = [
//     { id: 'all', title: 'All', icon: 'fa-solid fa-earth' },
//     { id: 'gaming', title: 'Gaming', icon: 'fa-solid fa-gamepad' },
//     { id: 'music', title: 'Music', icon: 'fa-solid fa-music' },
//     { id: 'entertainment', title: 'Entertainment', icon: 'fa-solid fa-tv' },
//     { id: 'tech', title: 'Science & Tech', icon: 'fa-solid fa-atom' },
//     { id: 'education', title: 'Education', icon: 'fa-solid fa-graduation-cap' }
// ];
// function iconSelect() {
//     const select = categoryIcons.find(cat => cat.id === category.value.id);
//     return select ? select.icon : null;
// }
let client = new Typesense.Client({
    'nodes': [{
        'host': import.meta.env.VITE_TYPESENSE_HOST,
        'port': '443',
        'protocol': 'https'
    }],
    'apiKey': import.meta.env.VITE_TYPESENSE_API,
    'connectionTimeoutSeconds': 2
})
const page = ref(1)
const totalPages = ref(0)
const perPage = ref(8)
async function fetchBoxes() {
    resultBoxes.value = null
    let resultArray = []
    let search = {
        'q': searchTerm.value,
        'preset': 'default',
        'per_page': perPage.value,
        'page': page.value
        // 'filter_by': 'isPublic:true'
    }
    client.collections('boxes')
        .documents()
        .search(search)
        .then(function (searchResults) {
            console.log(Math.ceil(searchResults.found / perPage.value))
            searchResults.hits.forEach(result => {
                resultArray.push(result.document)
            });
            totalPages.value = Math.ceil(searchResults.found / perPage.value)
            resultBoxes.value = resultArray
            progressBar.value = false
        })
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
        router.push('/groups')
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
    width: 48%;
    max-height: 5rem;
}

.result-container {
    padding: auto;
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

.box-description {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.each-box:hover .box-cover {
    /* transform: scale(1.05); */
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

.preview-thumbnail {
    width: 20%;
    border-radius: 1rem;

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

@media all and (max-width:1280px) {
    .result-container {
        justify-content: center;
    }

    .each-box {
        height: 14rem;

    }

    .box-cover {
        min-height: 6rem;
        max-height: 6rem;
    }



    .box-description {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    }

    .search-box {
        width: 80%;
    }
}
</style>