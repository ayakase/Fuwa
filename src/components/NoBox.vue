<template>
    <div class="container" @click="emit('openMenu')">
        <!-- <v-app-bar :elevation="2" density="compact">
            <div class="top-bar">
            </div>
        </v-app-bar> -->
        <div style="display:flex; flex-direction: column;align-items: center;padding-top:30vh;">
            <v-icon style="font-size: 8rem;color:gray;" icon="fa-regular fa-comment-dots"></v-icon>
            <p class="noti-text">{{ $t('no_box') }}</p>
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(['openMenu'])
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