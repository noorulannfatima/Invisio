<template>
  <div class="page finance">
    <!-- Header -->
    <div class="finance-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-chart-line"></i>
          Finance Overview
        </h1>
        <p class="header-subtitle">Manage your sales, purchases, and financial metrics</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateInvoice = true">
          <i class="fas fa-plus"></i> Create Invoice
        </button>
        <button class="btn btn-secondary" @click="showCreateBill = true">
          <i class="fas fa-file-invoice"></i> Create Bill
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <FinanceDateFilter @apply-filter="applyDateFilter" />

    <!-- Summary Cards -->
    <FinanceSummaryCards 
      :sales-total="totalSalesAmount"
      :purchase-total="totalPurchaseAmount"
      :net-profit="netProfit"
      :pending-count="pendingInvoices.length"
    />

    <!-- Charts Section -->
    <div class="charts-section">
      <FinanceRevenueChart :invoices="salesInvoices" />
      <FinanceExpenseChart :invoices="purchaseInvoices" />
    </div>

    <!-- Transactions Table -->
    <FinanceTransactionTable 
      :transactions="invoices"
      :loading="loading"
      @view-details="viewTransactionDetails"
      @refresh="fetchAllInvoices"
    />

    <!-- GST Summary -->
    <FinanceGSTSummary 
      v-if="gstSummary"
      :gst-data="gstSummary"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTransactionStore, type TransactionFilters } from '@/store/transactionStore';
import FinanceSummaryCards from '@/components/Transaction/FinanceSummaryCards.vue';
import FinanceRevenueChart from '@/components/Transaction/FinanceRevenueChart.vue';
import FinanceExpenseChart from '@/components/Transaction/FinanceExpenseChart.vue';
import FinanceTransactionTable from '@/components/Transaction/FinanceTransactionTable.vue';
import FinanceDateFilter from '@/components/Transaction/FinanceDateFilter.vue';
import FinanceGSTSummary from '@/components/Transaction/FinanceGSTSummary.vue';

const store = useTransactionStore();
const showCreateInvoice = ref(false);
const showCreateBill = ref(false);

// Computed properties from store
const invoices = computed(() => store.invoices);
const loading = computed(() => store.loading);
const salesInvoices = computed(() => store.salesInvoices);
const purchaseInvoices = computed(() => store.purchaseInvoices);
const totalSalesAmount = computed(() => store.totalSalesAmount);
const totalPurchaseAmount = computed(() => store.totalPurchaseAmount);
const pendingInvoices = computed(() => store.pendingInvoices);
const gstSummary = computed(() => store.gstSummary);

const netProfit = computed(() => totalSalesAmount.value - totalPurchaseAmount.value);

onMounted(async () => {
  await fetchAllInvoices();
  await store.fetchGSTSummary();
});

const fetchAllInvoices = async () => {
  await store.fetchAllInvoices();
};

const applyDateFilter = async (filters: TransactionFilters) => {
  await store.fetchAllInvoices(filters);
  await store.fetchGSTSummary(filters.startDate, filters.endDate);
};

const viewTransactionDetails = async (transactionId: number) => {
  await store.fetchInvoiceById(transactionId);
  // Could open a modal here
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.page {
  margin-left: 260px;
  margin-top: 70px;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
  min-height: calc(100vh - 70px);

  .finance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: #fff;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .header-content {
      .page-title {
        font-size: 1.8rem;
        font-weight: 700;
        color: #1a1a1a;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        margin-bottom: 0.3rem;

        i {
          color: #007bff;
        }
      }

      .header-subtitle {
        color: #666;
        font-size: 0.95rem;
      }
    }

    .header-actions {
      display: flex;
      gap: 1rem;

      .btn {
        padding: 0.65rem 1.2rem;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &.btn-primary {
          background: #007bff;
          color: white;

          &:hover {
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
          }
        }

        &.btn-secondary {
          background: #6c757d;
          color: white;

          &:hover {
            background: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
          }
        }
      }
    }
  }

  .charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }
}

@media (max-width: 1024px) {
  .page {
    margin-left: 0;

    .finance-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;

      .header-actions {
        width: 100%;

        .btn {
          flex: 1;
          justify-content: center;
        }
      }
    }

    .charts-section {
      grid-template-columns: 1fr;
    }
  }
}
</style>