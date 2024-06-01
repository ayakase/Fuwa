<template>
    <v-infinite-scroll :items="news" :onLoad="load" class="news-container">
        <h1 style="text-align: center;"> {{ $t('greeting') }}, {{ userInfo.displayName }} !
        </h1>
        <p style="text-align: center;">{{ currentTime }}</p>
        <template v-for="(item, index) in news" :key="item">
            <div>
                <v-card class="each-post">
                    <v-img class="cover-img" cover :src="item.urlToImage"></v-img>
                    <div>
                        <v-card-title>{{ item.title }}</v-card-title>
                        <v-card-subtitle>
                            {{ item.description }}
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

    </v-infinite-scroll>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useUserStore } from '../stores/userStore';
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore);
import axios from "axios";
import { ref, onMounted } from "vue";
import { languages } from "unique-names-generator";
const news = ref([])
const currentPage = ref(1)
async function load({ done }) {
    console.log('he')
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
            // country: 'en',
            language: 'en',
            pageSize: 5,
            page: currentPage.value,
        },
        headers: {
            'X-Api-Key': import.meta.env.VITE_NEWS_API
        }
    })
    news.value.push(...response.data.articles)
    currentPage.value += 1
    done('ok')
}
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
onMounted(() => {
    getTime()
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
</style>