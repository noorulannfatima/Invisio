<template>
  <div class="expense-container">
    <!-- Header -->
    <ExpenseHeader @add-expense="openCreateModal" />

    <!-- Filters Section -->
    <ExpenseFilters 
      :filters="filters"
      @update-filters="updateFilters"
      @apply="applyFilters"
      @clear="clearFilters"
    />

    <!-- Error Message -->
    <div v-if="expenseStore.error" class="error-message">
      {{ expenseStore.error }}
      <button @click="expenseStore.clearError" aria-label="Close error">✕</button>
    </div>

    <!-- Loading State -->
    <div v-if="expenseStore.isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>

    <!-- Expenses Table -->
    <ExpenseTable
      v-else
      @edit="editExpense"
      @delete="confirmDelete"
    />

    <!-- Monthly Report Section -->
    <ExpenseReport v-if="expenseStore.expenseReport" />

    <!-- Create/Edit Modal -->
    <ExpenseForm
      v-if="showCreateModal"
      :editing-id="editingExpenseId"
      :initial-data="formData"
      @save="saveExpense"
      @close="closeModal"
    />

    <!-- View Details Modal -->
    <ExpenseDetailsModal
      v-if="showDetailsModal && currentExpenseDetails"
      :expense="currentExpenseDetails"
      @close="closeDetailsModal"
      @edit="editFromDetails"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showDeleteConfirm"
      :item-name="`Expense #${deleteExpenseId}`"
      @confirm="performDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useExpenseStore } from '@/store/expenseStore';
import { usePartyStore } from '@/store/partyStore';

// Import components
import ExpenseHeader from '@/components/Expense/ExpenseHeader.vue';
import ExpenseFilters from '@/components/Expense/ExpenseFilters.vue';
import ExpenseTable from '@/components/Expense/ExpenseTable.vue';
import ExpenseReport from '@/components/Expense/ExpenseReport.vue';
import ExpenseForm from '@/components/Expense/ExpenseForm.vue';
import ExpenseDetailsModal from '@/components/Expense/ExpenseDetailsModal.vue';
import ConfirmDeleteModal from '@/components/Common/ConfirmDeleteModal.vue';

const expenseStore = useExpenseStore();
const partyStore = usePartyStore();

// Type Definition
type FilterState = {
  startDate: string;
  endDate: string;
  Category: string;
  sortBy: 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'category' | '';
};

// State
const showCreateModal = ref(false);
const showDetailsModal = ref(false);
const showDeleteConfirm = ref(false);
const editingExpenseId = ref<number | null>(null);
const deleteExpenseId = ref<number | null>(null);
const currentExpenseDetails = ref<any>(null);

const filters = ref<FilterState>({
  startDate: '',
  endDate: '',
  Category: '',
  sortBy: ''
});

const formData = ref({
  Date: new Date().toISOString().split('T')[0],
  Category: '',
  Amount: 0,
  Description: '',
  Payment_Mode: '',
  Party_ID: null as number | null
});

// Lifecycle
onMounted(async () => {
  try {
    await expenseStore.fetchAllExpenses();
    await partyStore.fetchAllParties();
    
    const now = new Date();
    await expenseStore.getExpenseReport(now.getFullYear(), now.getMonth() + 1);
  } catch (err) {
    console.error('Error loading expense data:', err);
  }
});

// Methods
const resetForm = () => {
  formData.value = {
    Date: new Date().toISOString().split('T')[0],
    Category: '',
    Amount: 0,
    Description: '',
    Payment_Mode: '',
    Party_ID: null
  };
  editingExpenseId.value = null;
};

const openCreateModal = () => {
  resetForm();
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  resetForm();
};

const saveExpense = async (data: any) => {
  try {
    if (editingExpenseId.value) {
      await expenseStore.updateExpense(editingExpenseId.value, data);
    } else {
      await expenseStore.createExpense(data);
    }
    closeModal();
    await expenseStore.fetchAllExpenses();
    const now = new Date();
    await expenseStore.getExpenseReport(now.getFullYear(), now.getMonth() + 1);
  } catch (error) {
    console.error('Error saving expense:', error);
  }
};

const viewExpense = async (expenseId: number) => {
  try {
    await expenseStore.fetchExpenseById(expenseId);
    currentExpenseDetails.value = expenseStore.currentExpense;
    showDetailsModal.value = true;
  } catch (error) {
    console.error('Error fetching expense:', error);
  }
};

const editExpense = async (expenseId: number) => {
  try {
    await expenseStore.fetchExpenseById(expenseId);
    const expense = expenseStore.currentExpense;
    if (expense) {
      formData.value = {
        Date: expense.Date,
        Category: expense.Category,
        Amount: expense.Amount,
        Description: expense.Description || '',
        Payment_Mode: expense.Payment_Mode || '',
        Party_ID: expense.Party_ID
      };
      editingExpenseId.value = expenseId;
      showDetailsModal.value = false;
      showCreateModal.value = true;
    }
  } catch (error) {
    console.error('Error editing expense:', error);
  }
};

const editFromDetails = () => {
  if (currentExpenseDetails.value) {
    editExpense(currentExpenseDetails.value.Expense_ID);
  }
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  currentExpenseDetails.value = null;
};

const confirmDelete = (expenseId: number) => {
  deleteExpenseId.value = expenseId;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteExpenseId.value = null;
};

const performDelete = async () => {
  if (deleteExpenseId.value) {
    try {
      await expenseStore.deleteExpense(deleteExpenseId.value);
      cancelDelete();
      await expenseStore.fetchAllExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }
};

const updateFilters = (newFilters: FilterState) => {
  filters.value = newFilters;
};

const applyFilters = async () => {
  try {
    const { sortBy, ...rest } = filters.value;
    const apiFilters = {
      ...rest,
      sortBy: sortBy === '' ? undefined : (sortBy as 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'category')
    };
    await expenseStore.fetchAllExpenses(apiFilters);
  } catch (error) {
    console.error('Error applying filters:', error);
  }
};

const clearFilters = async () => {
  filters.value = {
    startDate: '',
    endDate: '',
    Category: '',
    sortBy: ''
  };
  await expenseStore.fetchAllExpenses();
};
</script>

<style scoped lang="scss">
.expense-container {
  padding: 2rem;
  margin-left: 260px;
  margin-top: 70px;
  background: #f5f6fa;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    margin-left: 80px;
  }

  @media (max-width: 768px) {
    margin-left: 80px;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    margin-left: 70px;
    padding: 1rem;
    margin-top: 50px;
  }
}

.error-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
  color: #c53030;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #f56565;
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.1);
  animation: slideInDown 0.3s ease-out;

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    margin-bottom: 1rem;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.875rem;
    margin-bottom: 0.75rem;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #f56565;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    transition: all 0.3s ease;
    flex-shrink: 0;

    &:hover {
      background: rgba(245, 101, 101, 0.1);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }

    @media (max-width: 480px) {
      width: 28px;
      height: 28px;
      font-size: 1.25rem;
    }
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease-in;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0.75rem;
    font-size: 0.95rem;
  }

  i {
    margin-right: 0.75rem;
    font-size: 1.5rem;

    @media (max-width: 480px) {
      margin-right: 0.5rem;
      font-size: 1.25rem;
    }
  }
}

// Animations
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Responsive utility adjustments
@media (max-width: 1023px) {
  .expense-container {
    transition: all 0.3s ease;
  }
}

// High DPI screens (Retina displays)
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .error-message {
    box-shadow: 0 2px 8px rgba(245, 101, 101, 0.15);
  }
}

// Print styles
@media print {
  .expense-container {
    margin-left: 0;
    margin-top: 0;
    padding: 0;
    background: white;
  }

  .error-message {
    display: none;
  }

  .loading {
    display: none;
  }
}
</style>