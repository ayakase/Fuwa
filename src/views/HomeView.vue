<script setup >
import { ref, onMounted } from 'vue';
const user = ref()
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const auth = getAuth()
onMounted(() => {
  onAuthStateChanged(auth, (firebaseUser) => {
    console.log(firebaseUser.uid)
  })
})
</script>

<template>
  <div class="container">
    Home
    <div v-if="user">{{ JSON.stringify(user) }}</div>
  </div>
</template>
<style scoped>
.container {
  height: 100%;
  width: 100%;
  padding: 2rem;
}
</style>
