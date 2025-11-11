<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2>
          <i class="fas fa-file-invoice"></i>
          Transaction Details
        </h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading transaction details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
      </div>

      <!-- Transaction Content -->
      <div v-else-if="transaction" class="modal-body">
        <!-- Transaction Info -->
        <div class="info-section">
          <div class="info-row">
            <span class="label">Transaction ID:</span>
            <span class="value">#{{ transaction.Transaction_ID }}</span>
          </div>
          <div class="info-row">
            <span class="label">Type:</span>
            <span class="value">
              <span :class="['badge', transaction.Transaction_Type === 'Sale' ? 'badge-sale' : 'badge-purchase']">
                {{ transaction.Transaction_Type }}
              </span>
            </span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">{{ formatDate(transaction.Transaction_Date) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">
              <span :class="['badge', getStatusClass(transaction.Payment_Status)]">
                {{ transaction.Payment_Status }}
              </span>
            </span>
          </div>
          <div class="info-row" v-if="transaction.Payment_Method">
            <span class="label">Payment Method:</span>
            <span class="value">{{ transaction.Payment_Method }}</span>
          </div>
        </div>

        <!-- Party Info -->
        <div v-if="transaction.Party" class="info-section">
          <h3>{{ transaction.Transaction_Type === 'Sale' ? 'Customer' : 'Vendor' }} Information</h3>
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">{{ transaction.Party.Party_Name }}</span>
          </div>
          <div class="info-row" v-if="transaction.Party.Email">
            <span class="label">Email:</span>
            <span class="value">{{ transaction.Party.Email }}</span>
          </div>
          <div class="info-row" v-if="transaction.Party.Phone_Number">
            <span class="label">Phone:</span>
            <span class="value">{{ transaction.Party.Phone_Number }}</span>
          </div>
          <div class="info-row" v-if="transaction.Party.Address">
            <span class="label">Address:</span>
            <span class="value">{{ transaction.Party.Address }}</span>
          </div>
        </div>

        <!-- Line Items -->
        <div v-if="transaction.TransactionLineItems && transaction.TransactionLineItems.length > 0" class="line-items-section">
          <h3>Items</h3>
          <div class="table-wrapper">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in transaction.TransactionLineItems" :key="item.Transaction_Line_Item_ID">
                  <td>{{ item.Item_Name }}</td>
                  <td>{{ item.Description || '-' }}</td>
                  <td>{{ item.Quantity }}</td>
                  <td>${{ item.Unit_Price.toFixed(2) }}</td>
                  <td>${{ item.Total_Price.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row" v-if="transaction.Discount_Amount">
            <span>Discount:</span>
            <span>-${{ transaction.Discount_Amount.toFixed(2) }}</span>
          </div>
          <div class="total-row" v-if="transaction.Tax_Amount">
            <span>Tax:</span>
            <span>${{ transaction.Tax_Amount.toFixed(2) }}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Amount:</span>
            <span>${{ transaction.Total_Amount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="transaction.Notes" class="notes-section">
          <h3>Notes</h3>
          <p>{{ transaction.Notes }}</p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          <i class="fas fa-times"></i> Close
        </button>
        <button class="btn btn-primary" @click="$emit('download-pdf', transactionId)">
          <i class="fas fa-download"></i> Download PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTransactionStore } from '@/store/transactionStore';

interface Props {
  transactionId: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'download-pdf']);

const store = useTransactionStore();
const loading = ref(true);
const error = ref('');
const transaction = ref<any>(null);

onMounted(async () => {
  try {
    loading.value = true;
    await store.fetchInvoiceById(props.transactionId);
    transaction.value = store.currentInvoice;
    error.value = '';
  } catch (err: any) {
    error.value = err.message || 'Failed to load transaction details';
  } finally {
    loading.value = false;
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'badge-success';
    case 'pending':
      return 'badge-warning';
    case 'overdue':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;

    i {
      color: #007bff;
    }
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
    transition: color 0.3s ease;

    &:hover {
      color: #dc3545;
    }
  }
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.loading-state,
.error-state {
  padding: 3rem;
  text-align: center;

  i {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #6c757d;
  }
}

.loading-state i {
  color: #007bff;
}

.error-state i {
  color: #dc3545;
}

.info-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1a1a1a;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #495057;
    }

    .value {
      color: #212529;
      text-align: right;
    }
  }
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;

  &.badge-sale {
    background: #d4edda;
    color: #155724;
  }

  &.badge-purchase {
    background: #cce5ff;
    color: #004085;
  }

  &.badge-success {
    background: #d4edda;
    color: #155724;
  }

  &.badge-warning {
    background: #fff3cd;
    color: #856404;
  }

  &.badge-danger {
    background: #f8d7da;
    color: #721c24;
  }

  &.badge-secondary {
    background: #e2e3e5;
    color: #383d41;
  }
}

.line-items-section {
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1a1a1a;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;

    thead {
      background: #007bff;
      color: white;

      th {
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid #e9ecef;

        &:hover {
          background: #f8f9fa;
        }

        td {
          padding: 0.75rem;
        }
      }
    }
  }
}

.totals-section {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 1rem;

    &.grand-total {
      border-top: 2px solid #007bff;
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: #007bff;
    }
  }
}

.notes-section {
  background: #fff3cd;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #ffc107;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #856404;
  }

  p {
    color: #856404;
    line-height: 1.6;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;

  .btn {
    padding: 0.65rem 1.5rem;
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
      }
    }
  }
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 95%;
    max-height: 95vh;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .info-section .info-row {
    flex-direction: column;
    gap: 0.25rem;

    .value {
      text-align: left;
    }
  }

  .items-table {
    font-size: 0.85rem;

    thead th,
    tbody td {
      padding: 0.5rem;
    }
  }

  .modal-footer {
    flex-direction: column;

    .btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>