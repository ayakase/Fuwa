<template>
    <div class="container">
        {{ inviteId }}
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const inviteId = ref(route.params.id)
onMounted(() => {
    // inviteId.value = 
})
</script>

<style scoped></style>