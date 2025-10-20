<!--DashboardQuickStats.vue-->
<template>
  <div class="quick-stats-row">
    <DashboardStatCard icon="parties" label="Parties" :value="0" />
    <DashboardStatCard icon="items" label="Items" :value="itemStore.itemCount" />
    <DashboardStatCard icon="transactions" label="Transactions" :value="0" />
    <DashboardStatCard icon="expenses" label="Expenses" :value="0" />
  </div>
</template>

<script setup lang="ts">
import { useItemStore } from '@/store/itemStore';
import DashboardStatCard from './DashboardStatCard.vue';

const itemStore = useItemStore();
</script>

<style scoped lang="scss">
.quick-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

@media (max-width: 768px) {
  .quick-stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }
}

@media (max-width: 480px) {
  .quick-stats-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

