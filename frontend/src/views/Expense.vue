<template>
  <div class="expense-container">
    <!-- Header -->
    <ExpenseHeader @add-expense="openCreateModal" />

    <!-- Summary Cards -->
    <ExpenseSummaryCards />

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
      <button @click="expenseStore.clearError">✕</button>
    </div>

    <!-- Loading State -->
    <div v-if="expenseStore.isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>

    <!-- Expenses Table -->
    <ExpenseTable
      v-else
      @view="viewExpense"
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
import ExpenseSummaryCards from '@/components/Expense/ExpenseSummaryCards.vue';
import ExpenseFilters from '@/components/Expense/ExpenseFilters.vue';
import ExpenseTable from '@/components/Expense/ExpenseTable.vue';
import ExpenseReport from '@/components/Expense/ExpenseReport.vue';
import ExpenseForm from '@/components/Expense/ExpenseForm.vue';
import ExpenseDetailsModal from '@/components/Expense/ExpenseDetailsModal.vue';
import ConfirmDeleteModal from '@/components/Common/ConfirmDeleteModal.vue';

const expenseStore = useExpenseStore();
const partyStore = usePartyStore();

// State
const showCreateModal = ref(false);
const showDetailsModal = ref(false);
const showDeleteConfirm = ref(false);
const editingExpenseId = ref<number | null>(null);
const deleteExpenseId = ref<number | null>(null);
const currentExpenseDetails = ref(null);

const filters = ref({
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
  await expenseStore.fetchAllExpenses();
  await partyStore.fetchAllParties();
  
  const now = new Date();
  await expenseStore.getExpenseReport(now.getFullYear(), now.getMonth() + 1);
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

const updateFilters = (newFilters: any) => {
  filters.value = newFilters;
};

const applyFilters = async () => {
  try {
    await expenseStore.fetchAllExpenses(filters.value);
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
  background: #f5f6fa;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
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

    &:hover {
      background: rgba(245, 101, 101, 0.1);
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

  i {
    margin-right: 0.75rem;
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .expense-container {
    margin-left: 0;
  }
}
</style>