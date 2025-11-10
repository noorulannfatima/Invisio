<template>
  <div class="card finance-card">
    <div class="card-header">
      <h3>Finance Overview</h3>
      <button class="btn-icon" @click="refreshData" :disabled="isRefreshing || isLoading">
        <i class="fas fa-sync"></i>
      </button>
    </div>

    <div class="card-body">
      <div class="finance-item">
        <span class="label">Total Revenue</span>
        <span class="value">Rs   {{ formatCurrency(totalRevenue) }}</span>
      </div>

      <div class="finance-item">
        <span class="label">Total Expenses</span>
        <span class="value">Rs  {{ formatCurrency(totalExpenses) }}</span>
      </div>

      <div class="finance-item">
        <span class="label">Net Profit</span>
        <span :class="['value', netProfit >= 0 ? 'positive' : 'negative']">
          Rs   {{ formatCurrency(netProfit) }}
        </span>
      </div>

      <div class="finance-item">
        <span class="label">Inventory Value</span>
        <span class="value highlight">Rs    {{ formatCurrency(totalInventoryValue) }}</span>
      </div>

      <router-link to="/inventory" class="view-link">
        View Details <i class="fas fa-arrow-right"></i>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTransactionStore } from '@/store/transactionStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useReportStore } from '@/store/reportStore';

interface Props {
  isRefreshing: boolean;
}
defineProps<Props>();

defineEmits<{ refresh: [] }>();

// Stores
const transactionStore = useTransactionStore();
const expenseStore = useExpenseStore();
const reportStore = useReportStore();

// Computed values
const totalRevenue = computed(() => transactionStore.totalSalesAmount || 0);
const totalExpenses = computed(() => expenseStore.totalExpenses || 0);
const totalInventoryValue = computed(() =>
  reportStore.stockSummaryReport?.Summary?.Total_Inventory_Value || 0
);

const netProfit = computed(() => {
  // Prefer profit-loss report if loaded
  const report = reportStore.profitLossReport;
  if (report?.Profit_Loss?.Net_Profit !== undefined) {
    return report.Profit_Loss.Net_Profit;
  }
  // Fallback computation
  return totalRevenue.value - totalExpenses.value;
});

const isLoading = computed(
  () => transactionStore.loading || expenseStore.isLoading || reportStore.isLoading
);

const formatCurrency = (value: number): string =>
  value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Fetch data when mounted
const refreshData = async () => {
  try {
    await Promise.all([
      transactionStore.fetchAllInvoices(),
      expenseStore.fetchAllExpenses(),
      reportStore.fetchStockSummaryReport({}),
      reportStore.fetchProfitLossReport({})
    ]);
  } catch (err) {
    console.error('Failed to refresh finance data:', err);
  }
};

onMounted(refreshData);
</script>

<style scoped lang="scss">
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #2d3748;
    font-weight: 600;
  }

  .btn-icon {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #718096;
    transition: color 0.3s ease, transform 0.3s ease;

    &:hover:not(:disabled) {
      color: #667eea;
      transform: rotate(180deg);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.card-body {
  padding: 1.5rem;
}

.finance-card {
  .finance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #f0f4f8;
    gap: 1rem;

    &:last-of-type {
      border-bottom: none;
    }

    .label {
      color: #718096;
      font-weight: 500;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .value {
      color: #2d3748;
      font-weight: 700;
      font-size: 1.1rem;
      text-align: right;
      word-break: break-word;

      &.positive {
        color: #38a169;
      }

      &.negative {
        color: #e53e3e;
      }

      &.highlight {
        color: #667eea;
        font-size: 1.2rem;
      }
    }
  }

  .view-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: #764ba2;
    }

    i {
      font-size: 0.9rem;
    }
  }
}

@media (max-width: 768px) {
  .card-header {
    padding: 1rem;

    h3 {
      font-size: 1rem;
    }
  }

  .card-body {
    padding: 1rem;
  }

  .finance-card .finance-item {
    flex-direction: column;
    align-items: flex-start;

    .label {
      width: 100%;
    }

    .value {
      width: 100%;
      text-align: left;
    }
  }
}
</style>
