<template>
  <div class="dashboard-header">
    <h1 class="dashboard-title">Dashboard</h1>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.dashboard-header {
  margin-bottom: 1.5rem;
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #222;
  margin: 0;
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
}
</style>

---
