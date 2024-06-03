<template>
    <v-card style="width: 100%; height: 100%;padding-top: 1rem;">
        <Transition name="slide-fade">
            <div v-if="show" style="display: flex;flex-direction: column;justify-content: center;align-items:center;">
                <p style="text-align: center;">{{ currentTime }}</p>
                <img class="illustration" src="../assets/illustration.png" alt="">
                <h1 style="text-align: center;margin: 0;padding: 0;"> {{ $t('greeting') }}, {{ userInfo.displayName }}!
                </h1>
            </div>
        </Transition>
        <Transition name="slide-fade">
            <div class="button-container" v-if="showBtn">
                <v-card class="nav-button" id="btn1" @click="router.push('/groups')">
                    <v-card-title style="font-size: x-large; font-weight: bolder;color: black;">Groups</v-card-title>
                    <v-icon icon="fas fa-arrow-right" style="color:black"></v-icon>
                </v-card>
                <v-card class="nav-button" id="btn2" @click="router.push('/inbox')">
                    <v-card-title style="font-size: x-large; font-weight: bolder;color: white;">Inboxes</v-card-title>
                    <v-icon icon="fas fa-arrow-right" style="color:white"></v-icon>
                </v-card>
                <v-card class="nav-button" id="btn3" @click="router.push('/explore')">
                    <v-card-title style="font-size: x-large; font-weight: bolder;color: white;">Explore</v-card-title>
                    <v-icon icon="fas fa-arrow-right" style="color:white"></v-icon>
                </v-card>
                <v-card class="nav-button" id="btn4" @click="router.push('/setting')">
                    <v-card-title style="font-size: x-large; font-weight: bolder;color: black;">Settings</v-card-title>
                    <v-icon icon="fas fa-arrow-right" style="color:black"></v-icon>
                </v-card>
            </div>
        </Transition>
        <!-- <div v-if="quote" style="padding-left: 1rem;padding-bottom: 1rem;">
            <p> {{ quote.quote }}</p>
            <p> ~ {{ quote.author }} ~</p>
        </div>
        <v-skeleton-loader v-else class="mx-auto" type="list-item-three-line"></v-skeleton-loader> -->
    </v-card>


    <!-- <v-infinite-scroll :items="news" :onLoad="load" class="news-container">
       
        <template v-for="(item, index) in news" :key="item">
            <div>
                <v-card class="each-post">
                    <v-img class="cover-img" cover :src="item.urlToImage"></v-img>
                    <div>
                        <v-card-title>{{ item.title }}</v-card-title>
                        <v-card-subtitle>
                            {{ item.description }}
                        </v-card-subtitle>
                        <v-card-subtitle>
                            {{ item.author }}
                        </v-card-subtitle>
                        <v-card-subtitle>
                            {{ item.publishedAt }}
                        </v-card-subtitle>
                    </div>
                </v-card>
            </div>
        </template>
<template v-slot:loading>
            <div style="width: 100%; display:flex;flex-direction: column;gap:1rem">
                <v-skeleton-loader v-for="x in 5" :key='x' class="mx-auto border" style="width: 100%;"
                    type="image, article"></v-skeleton-loader>
            </div>
        </template>

</v-infinite-scroll> -->
</template>
<script setup>
import { storeToRefs } from "pinia";
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore';
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore);
import axios from "axios";
import { ref, onMounted } from "vue";
const router = useRouter()
// const news = ref([])
// const currentPage = ref(1)
// async function load({ done }) {
//     console.log('he')
//     const response = await axios.get('https://newsapi.org/v2/top-headlines', {
//         params: {
//             // country: 'en',
//             language: 'en',
//             pageSize: 5,
//             page: currentPage.value,
//         },
//         headers: {
//             'X-Api-Key': import.meta.env.VITE_NEWS_API
//         }
//     })
//     news.value.push(...response.data.articles)
//     currentPage.value += 1
//     done('ok')
// }
const currentTime = ref('')
function getTime() {
    var currentdate = new Date();

    currentTime.value = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
}
const show = ref(false)
const showBtn = ref(false)
const quote = ref('')
// function getQuote() {
//     axios.get('https://api.api-ninjas.com/v1/quotes', {
//         headers: {
//             'X-Api-Key': import.meta.env.VITE_NEWS_API
//         }
//     }).then((response) => {
//         console.log(response.data);
//         quote.value = response.data[0]
//     })
// }
onMounted(() => {
    getTime()
    // getQuote()
    setTimeout(() => {
        show.value = true
        showBtn.value = true
    }, 200);
})
let update = [
    {
        id: 11,
        title: 'Messages lazyload added',
        content: 'No longer get you machine overloaded by the amount of messages',
        description: 'We divided messages into smaller chunks to reduce the heavy workload of both clients and server, you can load previous messages by scrolling up',
        icon: 'fa-solid fa-arrows-split-up-and-left',
        date: 'April 26, 2024'
    },
    {
        id: 10,
        title: 'Increase search performance',
        content: 'Never miss out what you\'re looking for with our enhanced search capabilities.',
        description: 'This update significantly boosts the searching ability for public communities. We\'ve upgraded from Firestore default search to Typesense, empowering users to perform full-text searches with typo tolerance. Additionally, we\'ve increased fuzziness for search keywords to ensure more comprehensive results.',
        icon: 'fa-solid  fa-magnifying-glass',
        date: 'April 25, 2024'
    },
    {
        id: 9,
        title: 'Chatbot added',
        content: 'Introducing our new chatbot feature! Easily retrieve information by tagging your bot.',
        description: 'Inside your chat box, you can now include `@bot` to send a question and get an instant answer. Leveraging Google\'s Generative AI API, our chatbot provides accurate responses to your queries, enhancing your overall chat experience.',
        icon: 'fa-solid fa-robot',
        date: 'April 22, 2024'
    },
    {
        id: 8,
        title: 'Performance improvements',
        content: 'Enjoy a smoother experience with our latest performance optimizations.',
        description: 'In response to user feedback, we\'ve dedicated efforts to optimize the app for faster loading times and improved responsiveness across all devices. This update addresses reported performance issues and reduces passive data fetching, ensuring a more seamless user experience.',
        icon: 'fa-solid fa-gauge-high',
        date: 'April 20, 2024'
    },
    {
        id: 7,
        title: 'Darkmode added',
        content: 'Protect your eyes from strain with our new dark mode feature.',
        description: 'Responding to user requests, we\'ve introduced dark mode to the app. You can now toggle dark mode on/off in the settings menu for a more comfortable viewing experience, especially in low-light environments. Additionally, we\'ve fixed a UI bug that caused double scrollbars, ensuring a smoother interface.',
        icon: 'fa-solid fa-moon',
        date: 'April 18, 2024'
    },
    {
        id: 6,
        title: 'Bug fixes and security updates',
        content: 'Rest assured with our latest bug fixes and security enhancements.',
        description: 'This update addresses a minor bug that previously caused all clients to listen to the same messages collection, resulting in unexpected DOM reloading. Our team has implemented necessary security updates to ensure your chats remain secure and reliable, maintaining the integrity of your conversations.',
        icon: 'fa-solid fa-lock',
        date: 'April 18, 2024'
    },
    {
        id: 5,
        title: 'New emoji pack available!',
        content: 'Express yourself with our diverse collection of emojis!',
        description: 'We\'re excited to introduce a fresh set of fun and expressive emojis to enhance your chat experience. Whether you\'re celebrating, expressing emotions, or simply spicing up your conversations, our new emoji pack has something for everyone. Explore them today within the emoji picker!',
        icon: 'fa-regular fa-face-smile',
        date: 'April 15, 2024'
    },
    {
        id: 4,
        title: 'Introducing custom chat backgrounds',
        content: 'Personalize your chat environment with custom backgrounds!',
        description: 'Make your chat experience uniquely yours with our latest feature addition. Choose from a selection of pre-designed backgrounds or upload your own images to customize your chat interface. Whether you prefer vibrant patterns or serene landscapes, you can now reflect your style through personalized chat backgrounds.',
        icon: 'fa-regular fa-image',
        date: 'April 10, 2024'
    },
    {
        id: 3,
        title: 'Improved group chat management',
        content: 'Take control of your group chats with enhanced management features.',
        description: 'We\'ve introduced new functionalities for group chat admins, empowering them to manage their communities more efficiently. With the ability to add and remove members, as well as modify group information, admins can now streamline communication and ensure a smooth group chat experience for all members.',
        icon: 'fa-solid fa-user-group',
        date: 'April 5, 2024'
    },
    {
        id: 2,
        title: 'Chat boxes added',
        content: 'Create your own communities and engage with like-minded individuals.',
        description: 'With the addition of chat boxes, you can now create and join public communities based on shared interests. Enjoy features such as creating and deleting boxes, as well as joining public boxes to connect with others who share your passions. Start building vibrant communities and sparking meaningful conversations today!',
        icon: 'fa-solid fa-envelope',
        date: 'February 5, 2024'
    },
    {
        id: 1,
        title: 'Welcome to the new update feed!',
        content: 'Stay informed about all the latest changes with our update feed.',
        description: 'Get instant access to all the latest updates and improvements with our new update feed feature. From real-time chatting to seamless navigation, we\'ve initialized the app with enhanced functionalities to elevate your user experience. Explore the latest updates and stay ahead with our update feed!',
        icon: 'fa-solid fa-rss',
        date: 'January 31, 2024'
    }
];



</script>

<style scoped>
.container {
    display: flex;
    padding-left: 1rem;
    padding-right: 1rem;
    height: 100%;
    flex-direction: column;
    align-items: center;
    overflow: scroll;
    overflow-x: hidden;
}

* {
    margin: 0px;
    padding: 0px;
}



.context {
    width: 100%;
    position: absolute;
    top: 50vh;

}

.context h1 {
    text-align: center;
    color: #fff;
    font-size: 50px;
}


.each-post {
    width: 100%;
    height: 18rem;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: row;
}


.news-container {
    /* background-image: url('../assets/home-bg.jpg');
    background-size: cover; */
    width: 100%;
    height: 100vh;
    padding: 1rem;
}

.each-post-skeleton {
    width: 100%;

}

.cover-img {
    max-width: 20%;
    min-width: 20%;
    height: 100%;
    object-fit: cover;
}

@media all and (max-width: 1280px) {
    .each-post {
        flex-direction: column;
    }

    .cover-img {
        height: 25%;
        min-width: 100%;
        max-width: 100%;
    }
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


.bounce-enter-active {
    animation: bounce-in 0.5s;
}

.bounce-leave-active {
    animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.25);
    }

    100% {
        transform: scale(1);
    }
}

.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
}

.illustration {
    width: 30%;
}

.button-container {
    width: 35%;
    margin-top: 1rem !important;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: auto;
    gap: 1rem;
}

.nav-button {
    border-radius: 1rem;
    background-size: cover;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 6rem;
    width: 100%;
}

#btn1 {
    background-image: url('../assets/group.jpg');
}

#btn2 {
    background-image: url('../assets/inbox.jpg');
}

#btn3 {
    background-image: url('../assets/search.jpg');
}

#btn4 {
    background-image: url('../assets/setting.jpg');
}

@media all and (max-width: 1000px) {
    .illustration {
        width: 50%;
    }

    .button-container {
        width: 95%;
    }
}

@media all and (max-width: 600px) {
    .illustration {
        width: 90%;
    }
}
</style>