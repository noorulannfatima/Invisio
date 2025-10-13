<template>
  <div>
    <Navbar />
    <main>
      <!-- Router View will render Home or other pages -->
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from "@/components/layout/Navbar.vue";
</script>
