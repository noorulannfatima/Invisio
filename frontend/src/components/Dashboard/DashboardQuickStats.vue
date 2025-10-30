<!--DashboardQuickStats.vue-->
<template>
  <div class="quick-stats-row">
    <DashboardStatCard icon="parties" label="Parties" :value="partyStore.partyCount" />
    <DashboardStatCard icon="items" label="Items" :value="itemStore.itemCount" />
    <DashboardStatCard icon="transactions" label="Transactions" :value="transactionStore.totalInvoices" />
    <DashboardStatCard icon="expenses" label="Expenses" :value="expenseStore.expenseCount" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePartyStore } from '@/store/partyStore';
import { useItemStore } from '@/store/itemStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useExpenseStore } from '@/store/expenseStore';
import DashboardStatCard from './DashboardStatCard.vue';

const partyStore = usePartyStore();
const itemStore = useItemStore();
const transactionStore = useTransactionStore();
const expenseStore = useExpenseStore();

// Fetch data on component mount if not already loaded
onMounted(async () => {
  try {
    // Only fetch if data is not already loaded
    if (partyStore.partyCount === 0) {
      await partyStore.fetchAllParties();
    }
    if (itemStore.itemCount === 0) {
      await itemStore.fetchAllItems();
    }
    if (transactionStore.totalInvoices === 0) {
      await transactionStore.fetchAllInvoices();
    }
    if (expenseStore.expenseCount === 0) {
      await expenseStore.fetchAllExpenses();
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
});
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