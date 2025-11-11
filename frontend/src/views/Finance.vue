<!-- /views/Finance.vue-->
<template>
  <div class="page finance">
    <!-- Header -->
    <div class="finance-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-chart-line"></i>
          Transaction Overview
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
    <DateFilter @apply-filter="applyDateFilter" />

    <!-- Error State -->
    <div v-if="store.error" class="error-alert">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ store.error }}</span>
      <button @click="store.clearError" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-alert">
      <i class="fas fa-check-circle"></i>
      <span>{{ successMessage }}</span>
      <button @click="successMessage = ''" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Transactions Table -->
    <TransactionTable 
      :transactions="invoices"
      :loading="loading"
      @view-details="viewTransactionDetails"
      @download-pdf="handleDownloadPDF"
      @refresh="fetchAllInvoices"
    />

    <!-- Create Invoice Modal -->
    <CreateInvoiceModal 
      v-if="showCreateInvoice"
      @close="showCreateInvoice = false"
      @invoice-created="onInvoiceCreated"
    />

    <!-- Create Bill Modal -->
    <CreateBillModal 
      v-if="showCreateBill"
      @close="showCreateBill = false"
      @bill-created="onBillCreated"
    />

    <!-- Transaction Details Modal -->
    <TransactionDetailsModal
      v-if="showDetailsModal"
      :transactionId="selectedTransactionId!"
      @close="closeDetailsModal"
      @download-pdf="handleDownloadPDF"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTransactionStore, type TransactionFilters } from '@/store/transactionStore';
import TransactionTable from '@/components/Transaction/TransactionTable.vue';
import DateFilter from '@/components/Transaction/DateFilter.vue';
import CreateInvoiceModal from '@/components/Transaction/CreateInvoiceModal.vue';
import CreateBillModal from '@/components/Transaction/CreateBillModal.vue';
import TransactionDetailsModal from '@/components/Transaction/TransactionDetailsModal.vue';
import { generateTransactionPDF } from '@/utils/pdfGenerator';

const store = useTransactionStore();
const showCreateInvoice = ref(false);
const showCreateBill = ref(false);
const showDetailsModal = ref(false);
const selectedTransactionId = ref<number | null>(null);
const successMessage = ref('');

// Computed properties from store
const invoices = computed(() => store.invoices);
const loading = computed(() => store.loading);

// Company info for PDF (you may want to fetch this from a company store)
const companyInfo = ref({
  name: 'Your Company Name',
  address: '123 Business Street, City, State 12345',
  email: 'info@yourcompany.com'
});

onMounted(async () => {
  await fetchAllInvoices();
  // TODO: Fetch company info from company store
});

const fetchAllInvoices = async () => {
  try {
    await store.fetchAllInvoices();
  } catch (err) {
    console.error('Failed to fetch invoices:', err);
  }
};

const applyDateFilter = async (filters: TransactionFilters) => {
  try {
    await store.fetchAllInvoices(filters);
  } catch (err) {
    console.error('Failed to apply filters:', err);
  }
};

const viewTransactionDetails = async (transactionId: number) => {
  selectedTransactionId.value = transactionId;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedTransactionId.value = null;
  store.clearCurrentInvoice();
};

const handleDownloadPDF = async (transactionId: number) => {
  try {
    // Fetch transaction details if not already loaded
    if (store.currentInvoice?.Transaction_ID !== transactionId) {
      await store.fetchInvoiceById(transactionId);
    }

    const transaction = store.currentInvoice;
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    await generateTransactionPDF(transaction, companyInfo.value);
    successMessage.value = 'PDF downloaded successfully!';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    store.error = 'Failed to generate PDF. Please try again.';
  }
};

const onInvoiceCreated = async () => {
  showCreateInvoice.value = false;
  await fetchAllInvoices();
  successMessage.value = 'Invoice created successfully!';
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

const onBillCreated = async () => {
  showCreateBill.value = false;
  await fetchAllInvoices();
  successMessage.value = 'Purchase bill created successfully!';
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};
</script>
<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

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

  .error-alert,
  .success-alert {
    border-radius: 8px;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: slideDown 0.3s ease;

    i {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .close-btn {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 0.7;
      }
    }
  }

  .error-alert {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid #dc3545;
    color: #dc3545;

    .close-btn {
      color: #dc3545;
    }
  }

  .success-alert {
    background: rgba(40, 167, 69, 0.1);
    border: 1px solid #28a745;
    color: #28a745;

    .close-btn {
      color: #28a745;
    }
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
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
  }
}

@media (max-width: 768px) {
  .page {
    padding: 1rem;
    margin-top: 60px;

    .finance-header {
      padding: 1rem;

      .page-title {
        font-size: 1.4rem;
      }
    }
  }
}
</style>