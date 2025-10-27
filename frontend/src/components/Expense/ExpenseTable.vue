<!-- components/Expense/ExpenseTable.vue -->
<template>
  <div class="table-section">
    <div v-if="expenseStore.expenses.length > 0" class="table-wrapper">
      <table class="expenses-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Payment Mode</th>
            <th>Vendor</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenseStore.expenses" :key="expense.Expense_ID">
            <td class="date-cell">
              <i class="fas fa-calendar"></i>
              {{ formatDate(expense.Date) }}
            </td>
            <td>
              <span class="badge" :class="getCategoryClass(expense.Category)">
                {{ expense.Category }}
              </span>
            </td>
            <td class="amount-cell">
              ₹{{ formatCurrency(expense.Amount) }}
            </td>
            <td class="payment-cell">
              <span v-if="expense.Payment_Mode" class="payment-badge">
                <i :class="getPaymentIcon(expense.Payment_Mode)"></i>
                {{ expense.Payment_Mode }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <span v-if="expense.Party_ID && expense.Vendor" class="vendor-name">
                {{ expense.Vendor.Name }}
              </span>
              <span v-else class="text-muted-error">No Vendor</span>
            </td>
            <td class="description-cell">
              {{ expense.Description || '—' }}
            </td>
            <td class="actions-cell">
              <button
                class="btn-action edit"
                title="Edit"
                @click="$emit('edit', expense.Expense_ID)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn-action delete"
                title="Delete"
                @click="$emit('delete', expense.Expense_ID)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="no-data">
      <i class="fas fa-inbox"></i>
      <p>No expenses found</p>
      <span class="hint">Create your first expense to get started</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpenseStore } from '@/store/expenseStore';

const expenseStore = useExpenseStore();

defineEmits<{
  edit: [expenseId: number];
  delete: [expenseId: number];
}>();

const formatCurrency = (amount: number): string => {
  return (amount ?? 0).toFixed(2);
};

const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return '—';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '—';
    
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '—';
  }
};

const getCategoryClass = (category: string | undefined): string => {
  if (!category) return 'category-default';
  
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

const getPaymentIcon = (mode: string | undefined): string => {
  if (!mode) return 'fas fa-wallet';
  
  const iconMap: { [key: string]: string } = {
    cash: 'fas fa-money-bill',
    'bank transfer': 'fas fa-university',
    'credit card': 'fas fa-credit-card',
    cheque: 'fas fa-receipt',
    other: 'fas fa-coins'
  };
  return iconMap[mode.toLowerCase()] || 'fas fa-wallet';
};
</script>

<style scoped lang="scss">
.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.expenses-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-bottom: 2px solid #cbd5e0;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 700;
    color: #2d3748;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 1.25rem 1rem;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.9rem;
    color: #2d3748;
  }

  tbody tr {
    transition: all 0.3s ease;

    &:hover {
      background: #f7fafc;
      box-shadow: inset 0 0 8px rgba(102, 126, 234, 0.05);
    }
  }
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #4a5568;
  white-space: nowrap;

  i {
    color: #667eea;
    font-size: 0.85rem;
  }
}

.amount-cell {
  font-weight: 700;
  color: #27ae60;
  font-size: 1rem;
}

.payment-cell {
  .payment-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: #edf2f7;
    color: #2d3748;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;

    i {
      font-size: 0.8rem;
    }
  }
}

.description-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #718096;

  @media (max-width: 1024px) {
    max-width: 150px;
  }
}

.vendor-name {
  font-weight: 500;
  color: #2d3748;
  background: rgba(102, 126, 234, 0.08);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  display: inline-block;
}

.text-muted {
  color: #cbd5e0;
  font-weight: 500;
}

.text-muted-error {
  color: #f56565;
  font-weight: 600;
  background: rgba(245, 101, 101, 0.05);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  display: inline-block;
  font-size: 0.85rem;
}

.badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;

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

.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  white-space: nowrap;
}

.btn-action {
  width: 36px;
  height: 36px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &.edit {
    color: #48bb78;
    border-color: #48bb78;

    &:hover {
      background: rgba(72, 187, 120, 0.1);
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
    }
  }

  &.delete {
    color: #f56565;
    border-color: #f56565;

    &:hover {
      background: rgba(245, 101, 101, 0.1);
      box-shadow: 0 4px 12px rgba(245, 101, 101, 0.2);
    }
  }
}

.no-data {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;

  i {
    font-size: 3rem;
    color: #cbd5e0;
    margin-bottom: 1rem;
    display: block;
  }

  p {
    margin: 1rem 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
  }

  .hint {
    display: block;
    font-size: 0.9rem;
    color: #a0aec0;
  }
}

@media (max-width: 768px) {
  .expenses-table {
    font-size: 0.8rem;

    th {
      padding: 0.75rem 0.5rem;
      font-size: 0.75rem;
    }

    td {
      padding: 0.75rem 0.5rem;
    }
  }

  .actions-cell {
    flex-direction: column;
  }

  .btn-action {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style>