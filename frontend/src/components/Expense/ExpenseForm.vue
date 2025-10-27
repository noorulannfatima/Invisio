<!-- components/Expense/ExpenseForm.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h2>
          <i :class="editingId ? 'fas fa-edit' : 'fas fa-plus'"></i>
          {{ editingId ? 'Edit Expense' : 'Create New Expense' }}
        </h2>
        <button class="btn-close" @click="closeModal">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label for="date">Date</label>
            <input
              id="date"
              v-model="formState.Date"
              type="date"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="category">Category <span class="required">*</span></label>
            <input
              id="category"
              v-model="formState.Category"
              type="text"
              placeholder="e.g., Rent, Office Supplies"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="amount">Amount <span class="required">*</span></label>
            <div class="amount-wrapper">
              <span class="currency">Rs</span>
              <input
                id="amount"
                v-model.number="formState.Amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="payment-mode">Payment Mode</label>
            <select v-model="formState.Payment_Mode" id="payment-mode" class="form-input">
              <option value="">Select Payment Mode</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="vendor">Vendor <span class="required">*</span></label>
          <select 
            v-model.number="formState.Party_ID" 
            id="vendor" 
            class="form-input"
            required
          >
            <option :value="null" disabled>Select Vendor</option>
            <option v-for="vendor in vendors" :key="vendor.Party_ID" :value="vendor.Party_ID">
              {{ vendor.Name }}
            </option>
          </select>
          <span v-if="!formState.Party_ID" class="error-hint">Vendor is required</span>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formState.Description"
            placeholder="Add notes or details about this expense..."
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>

        <div class="form-footer">
          <button type="button" class="btn-secondary" @click="closeModal">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="!isFormValid"
          >
            <i :class="editingId ? 'fas fa-save' : 'fas fa-plus'"></i>
            {{ editingId ? 'Update Expense' : 'Create Expense' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePartyStore } from '@/store/partyStore';

interface ExpenseFormState {
  Date: string;
  Category: string;
  Amount: number;
  Description: string;
  Payment_Mode: string;
  Party_ID: number | null;
}

const props = defineProps<{
  editingId: number | null;
  initialData: ExpenseFormState;
}>();

const emit = defineEmits<{
  save: [data: ExpenseFormState];
  close: [];
}>();

const partyStore = usePartyStore();

const formState = ref<ExpenseFormState>({ ...props.initialData });

const vendors = computed(() => partyStore.parties || []);

const isFormValid = computed(() => {
  return (
    formState.value.Category?.trim().length > 0 &&
    (formState.value.Amount ?? 0) > 0 &&
    formState.value.Party_ID !== null &&
    formState.value.Party_ID !== undefined
  );
});

watch(() => props.initialData, (newData) => {
  formState.value = { ...newData };
}, { deep: true });

const handleSubmit = () => {
  if (!isFormValid.value) {
    return;
  }
  emit('save', formState.value);
};

const closeModal = () => {
  emit('close');
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
  max-width: 600px;
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
    padding: 0;

    &:hover {
      color: #2d3748;
    }
  }
}

.modal-body {
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2d3748;

    .required {
      color: #f56565;
      margin-left: 0.25rem;
    }
  }
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #2d3748;
  transition: all 0.3s ease;
  font-family: inherit;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #bbc6de;
  }

  &:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.amount-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .currency {
    position: absolute;
    left: 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: #717481;
    pointer-events: none;
  }

  .form-input {
    padding-left: 2.5rem;
    padding-right: 1rem;
  }
}

.error-hint {
  font-size: 0.8rem;
  color: #f56565;
  font-weight: 500;
  margin-top: 0.25rem;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #edf2f7;
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

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
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

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-footer {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>