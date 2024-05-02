<template>
    <div class="container">
        <v-app-bar :elevation="2" density="compact">
            <div class="top-bar">
                <!-- <v-card-title class="box-name">{{ props.boxName }}</v-card-title> -->
                <!-- <div><v-btn icon="mdi-star"></v-btn>
                    <v-btn icon="mdi-magnify"></v-btn>
                    <v-btn icon="mdi-dots-vertical" @click="showSetting = !showSetting"></v-btn>
                </div> -->
            </div>
        </v-app-bar>
        <div style="display:flex; flex-direction: column;align-items: center;padding-top:30vh;">
            <v-icon style="font-size: 8rem;color:gray;" icon="fa-regular fa-comment-dots"></v-icon>
            <p class="noti-text">No box selected, select or join a box to begin conversation</p>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.noti-text {
    font-size: 2rem;
    color: gray;
    text-align: center;
}

@media screen and (max-width: 855px) {
    .noti-text {
        font-size: 1.5rem;

    }
}
</style>