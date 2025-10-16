<template>
  <div class="dashboard-layout">
    <LeftSidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LeftSidebar from '@/components/LeftSidebar.vue'
</script>

<style lang="scss" scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>
