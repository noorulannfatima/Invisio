<!-- components/Expense/ExpenseDetailsModal.vue -->
<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2>
          <i class="fas fa-receipt"></i>
          Expense Details
        </h2>
        <button class="btn-close" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div class="details-grid">
          <div class="detail-card">
            <div class="detail-label">
              <i class="fas fa-calendar"></i>
              Date
            </div>
            <div class="detail-value">{{ formatDate(expense.Date) }}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">
              <i class="fas fa-tag"></i>
              Category
            </div>
            <div class="detail-value">
              <span class="badge" :class="getCategoryClass(expense.Category)">
                {{ expense.Category }}
              </span>
            </div>
          </div>

          <div class="detail-card highlight">
            <div class="detail-label">
              <i class="fas fa-money-bill"></i>
              Amount
            </div>
            <div class="detail-value amount">₹{{ formatCurrency(expense.Amount) }}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">
              <i class="fas fa-wallet"></i>
              Payment Mode
            </div>
            <div class="detail-value">
              <span v-if="expense.Payment_Mode" class="payment-badge">
                <i :class="getPaymentIcon(expense.Payment_Mode)"></i>
                {{ expense.Payment_Mode }}
              </span>
              <span v-else class="text-muted">Not specified</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-label">
              <i class="fas fa-store"></i>
              Vendor
            </div>
            <div class="detail-value">
              <span v-if="expense.Vendor" class="vendor-badge">
                {{ expense.Vendor.Name }}
              </span>
              <span v-else class="text-muted">No vendor assigned</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-label">
              <i class="fas fa-clock"></i>
              Created Date
            </div>
            <div class="detail-value">{{ formatDate(expense.createdAt) }}</div>
          </div>
        </div>

        <div v-if="expense.Description" class="description-section">
          <h3>Description</h3>
          <div class="description-text">{{ expense.Description }}</div>
        </div>

        <div v-if="expense.Vendor" class="vendor-section">
          <h3>Vendor Information</h3>
          <div class="vendor-details">
            <div class="vendor-item" v-if="expense.Vendor.Mobile_Number">
              <span class="label">
                <i class="fas fa-phone"></i>
                Mobile
              </span>
              <span class="value">{{ expense.Vendor.Mobile_Number }}</span>
            </div>
            <div class="vendor-item" v-if="expense.Vendor.Email">
              <span class="label">
                <i class="fas fa-envelope"></i>
                Email
              </span>
              <span class="value">{{ expense.Vendor.Email }}</span>
            </div>
            <div class="vendor-item" v-if="expense.Vendor.Address">
              <span class="label">
                <i class="fas fa-map-marker-alt"></i>
                Address
              </span>
              <span class="value">{{ expense.Vendor.Address }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="close">
          <i class="fas fa-times"></i>
          Close
        </button>
        <button class="btn-primary" @click="$emit('edit')">
          <i class="fas fa-edit"></i>
          Edit Expense
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  expense: any;
}>();

defineEmits<{
  close: [];
  edit: [];
}>();

const formatCurrency = (amount: number) => {
  return amount.toFixed(2);
};

const formatDate = (date: string | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getCategoryClass = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    rent: 'category-rent',
    utilities: 'category-utilities',
    supplies: 'category-supplies',
    travel: 'category-travel',
    food: 'category-food',
    maintenance: 'category-maintenance'
  };
  return categoryMap[category.toLowerCase()] || 'category-default';
};

const getPaymentIcon = (mode: string) => {
  const iconMap: { [key: string]: string } = {
    cash: 'fas fa-money-bill',
    'bank transfer': 'fas fa-university',
    'credit card': 'fas fa-credit-card',
    cheque: 'fas fa-receipt',
    other: 'fas fa-coins'
  };
  return iconMap[mode.toLowerCase()] || 'fas fa-wallet';
};

const close = () => {
  window.dispatchEvent(new CustomEvent('close'));
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #edf2f7;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);

  h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    i {
      color: #667eea;
      font-size: 1.2rem;
    }
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #a0aec0;
    line-height: 1;
    transition: color 0.3s ease;

    &:hover {
      color: #2d3748;
    }
  }
}

.modal-body {
  padding: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-card {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  transition: all 0.3s ease;

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
  }

  &.highlight {
    background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
    border: 2px solid rgba(102, 126, 234, 0.2);
  }

  .detail-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;

    i {
      font-size: 0.75rem;
      color: #667eea;
    }
  }

  .detail-value {
    font-size: 1rem;
    font-weight: 500;
    color: #2d3748;

    &.amount {
      font-size: 1.5rem;
      color: #27ae60;
      font-weight: 700;
    }
  }
}

.badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;

  &.category-rent {
    background: #fff5f5;
    color: #f56565;
  }

  &.category-utilities {
    background: #fef3c7;
    color: #d97706;
  }

  &.category-supplies {
    background: #dbeafe;
    color: #1976d2;
  }

  &.category-travel {
    background: #dcfce7;
    color: #16a34a;
  }

  &.category-food {
    background: #fce7f3;
    color: #db2777;
  }

  &.category-maintenance {
    background: #ede9fe;
    color: #7c3aed;
  }

  &.category-default {
    background: #f3f4f6;
    color: #4b5563;
  }
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: #edf2f7;
  color: #2d3748;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;

  i {
    font-size: 0.8rem;
  }
}

.vendor-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.text-muted {
  color: #a0aec0;
  font-style: italic;
}

.description-section,
.vendor-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;

  h3 {
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #2d3748;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.description-text {
  color: #2d3748;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.vendor-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.vendor-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  .label {
    font-weight: 600;
    color: #2d3748;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 100px;

    i {
      font-size: 0.85rem;
      color: #667eea;
    }
  }

  .value {
    color: #4a5568;
    word-break: break-word;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #edf2f7;
  background: #f7fafc;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }
}

.btn-secondary {
  background: #edf2f7;
  color: #2d3748;
  border: 1px solid #cbd5e0;

  &:hover {
    background: #e2e8f0;
    border-color: #a0aec0;
  }
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>