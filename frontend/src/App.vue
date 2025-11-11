<template>
  <div>
    <!-- Navbar -->
    <Navbar />
    
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Common/Navbar.vue'

const route = useRoute()

// Scroll to top when route changes to auth pages
watch(
  () => route.path,
  () => {
    if (route.meta.layout === 'auth') {
      window.scrollTo(0, 0)
    }
  }
)
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>