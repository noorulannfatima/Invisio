<!-- DashboardLayout.vue -->
<template>
  <div class="dashboard-layout">
    <LeftSidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LeftSidebar from '@/components/Common/Leftsidebar.vue'
</script>

<style lang="scss" scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

.main-content {
  flex: 1;
  width: 100%;
  min-width: 0;
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
}
</style>
