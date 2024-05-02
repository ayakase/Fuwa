<template>
  <div class="container">
    <h1
      style="text-align: center;padding: 2rem;display: flex; flex-direction: row;justify-content: center; align-items: center;gap:1rem;">
      Updates
      Feed
      <v-icon icon="fa-solid fa-rss"></v-icon>
    </h1>
    <div v-for="item in update" :key="item.id">
      <v-card variant="plain">
        <div style="display: flex;align-items: center;padding-bottom: 1rem;">
          <v-card-title style="font-size: x-large;">
            {{ item.title }}
          </v-card-title>
          <v-icon :icon="item.icon"></v-icon>

        </div>
        <v-card-subtitle style="font-size: larger;padding-bottom: 1rem;">
          {{ item.content }}
        </v-card-subtitle>
        <v-card-text style="font-size: large;">
          {{ item.description }}
        </v-card-text>

        <v-divider style="margin-top: 2rem; margin-bottom: 2rem;" :thickness="2"></v-divider>
      </v-card>
    </div>
  </div>
  <div class="area">
    <ul class="circles">
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
</template>

<script setup>
let update = [
  {
    id: 11,
    title: 'Messages lazyload added (April 26, 2024)',
    content: 'No longer get you machine overloaded by the amount of messages',
    description: 'We divided messages into smaller chunks to reduce the heavy workload of both clients and server, you can load previous messages by scrolling up',
    icon: 'fa-solid fa-arrows-split-up-and-left'
  },
  {
    id: 10,
    title: 'Increase search performance (April 25, 2024)',
    content: 'Never miss out what you\'re looking for with our enhanced search capabilities.',
    description: 'This update significantly boosts the searching ability for public communities. We\'ve upgraded from Firestore default search to Typesense, empowering users to perform full-text searches with typo tolerance. Additionally, we\'ve increased fuzziness for search keywords to ensure more comprehensive results.',
    icon: 'fa-solid  fa-magnifying-glass'
  },
  {
    id: 9,
    title: 'Chatbot added (April 22, 2024)',
    content: 'Introducing our new chatbot feature! Easily retrieve information by tagging your bot.',
    description: 'Inside your chat box, you can now include `@bot` to send a question and get an instant answer. Leveraging Google\'s Generative AI API, our chatbot provides accurate responses to your queries, enhancing your overall chat experience.',
    icon: 'fa-solid fa-robot'
  },
  {
    id: 8,
    title: 'Performance improvements (April 20, 2024)',
    content: 'Enjoy a smoother experience with our latest performance optimizations.',
    description: 'In response to user feedback, we\'ve dedicated efforts to optimize the app for faster loading times and improved responsiveness across all devices. This update addresses reported performance issues and reduces passive data fetching, ensuring a more seamless user experience.',
    icon: 'fa-solid fa-gauge-high'
  },
  {
    id: 7,
    title: 'Darkmode added (April 18, 2024)',
    content: 'Protect your eyes from strain with our new dark mode feature.',
    description: 'Responding to user requests, we\'ve introduced dark mode to the app. You can now toggle dark mode on/off in the settings menu for a more comfortable viewing experience, especially in low-light environments. Additionally, we\'ve fixed a UI bug that caused double scrollbars, ensuring a smoother interface.',
    icon: 'fa-solid fa-moon'
  },
  {
    id: 6,
    title: 'Bug fixes and security updates (April 18, 2024)',
    content: 'Rest assured with our latest bug fixes and security enhancements.',
    description: 'This update addresses a minor bug that previously caused all clients to listen to the same messages collection, resulting in unexpected DOM reloading. Our team has implemented necessary security updates to ensure your chats remain secure and reliable, maintaining the integrity of your conversations.',
    icon: 'fa-solid fa-lock'
  },
  {
    id: 5,
    title: 'New emoji pack available! (April 15, 2024)',
    content: 'Express yourself with our diverse collection of emojis!',
    description: 'We\'re excited to introduce a fresh set of fun and expressive emojis to enhance your chat experience. Whether you\'re celebrating, expressing emotions, or simply spicing up your conversations, our new emoji pack has something for everyone. Explore them today within the emoji picker!',
    icon: 'fa-regular fa-face-smile'
  },
  {
    id: 4,
    title: 'Introducing custom chat backgrounds (April 10, 2024)',
    content: 'Personalize your chat environment with custom backgrounds!',
    description: 'Make your chat experience uniquely yours with our latest feature addition. Choose from a selection of pre-designed backgrounds or upload your own images to customize your chat interface. Whether you prefer vibrant patterns or serene landscapes, you can now reflect your style through personalized chat backgrounds.',
    icon: 'fa-regular fa-image'
  },
  {
    id: 3,
    title: 'Improved group chat management (April 5, 2024)',
    content: 'Take control of your group chats with enhanced management features.',
    description: 'We\'ve introduced new functionalities for group chat admins, empowering them to manage their communities more efficiently. With the ability to add and remove members, as well as modify group information, admins can now streamline communication and ensure a smooth group chat experience for all members.',
    icon: 'fa-solid fa-user-group'
  },
  {
    id: 2,
    title: 'Chat boxes added (February 5, 2024)',
    content: 'Create your own communities and engage with like-minded individuals.',
    description: 'With the addition of chat boxes, you can now create and join public communities based on shared interests. Enjoy features such as creating and deleting boxes, as well as joining public boxes to connect with others who share your passions. Start building vibrant communities and sparking meaningful conversations today!',
    icon: 'fa-solid fa-envelope'
  },
  {
    id: 1,
    title: 'Welcome to the new update feed! (January 31, 2024)',
    content: 'Stay informed about all the latest changes with our update feed.',
    description: 'Get instant access to all the latest updates and improvements with our new update feed feature. From real-time chatting to seamless navigation, we\'ve initialized the app with enhanced functionalities to elevate your user experience. Explore the latest updates and stay ahead with our update feed!',
    icon: 'fa-solid fa-rss'
  },
];


</script>

<style scoped>
.container {
  padding-left: 5rem;
  padding-right: 5rem;
  display: flex;
  height: 100%;
  flex-direction: column;
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


.area {
  background: #4e54c8;
  width: 100%;
  height: 100vh;
  z-index: -1;
}

.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;

}

.circles li {
  position: absolute;
  display: block;
  list-style: none;
  width: 20px;
  height: 20px;
  /* background: rgba(255, 255, 255, 0.2); */
  background-color: rgba(95, 95, 95, 0.412);
  animation: animate 25s linear infinite;
  bottom: -150px;

}

.circles li:nth-child(1) {
  left: 25%;
  width: 80px;
  height: 80px;
  animation-delay: 0s;
}


.circles li:nth-child(2) {
  left: 10%;
  width: 20px;
  height: 20px;
  animation-delay: 2s;
  animation-duration: 12s;
}

.circles li:nth-child(3) {
  left: 70%;
  width: 20px;
  height: 20px;
  animation-delay: 4s;
}

.circles li:nth-child(4) {
  left: 40%;
  width: 60px;
  height: 60px;
  animation-delay: 0s;
  animation-duration: 18s;
}

.circles li:nth-child(5) {
  left: 65%;
  width: 20px;
  height: 20px;
  animation-delay: 0s;
}

.circles li:nth-child(6) {
  left: 75%;
  width: 110px;
  height: 110px;
  animation-delay: 3s;
}

.circles li:nth-child(7) {
  left: 35%;
  width: 150px;
  height: 150px;
  animation-delay: 7s;
}

.circles li:nth-child(8) {
  left: 50%;
  width: 25px;
  height: 25px;
  animation-delay: 15s;
  animation-duration: 45s;
}

.circles li:nth-child(9) {
  left: 20%;
  width: 15px;
  height: 15px;
  animation-delay: 2s;
  animation-duration: 35s;
}

.circles li:nth-child(10) {
  left: 85%;
  width: 150px;
  height: 150px;
  animation-delay: 0s;
  animation-duration: 11s;
}



@keyframes animate {

  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }

  100% {
    transform: translateY(-1300px) rotate(720deg) scale(1.5);
    opacity: 0;
    border-radius: 100%;
  }

}
</style>
