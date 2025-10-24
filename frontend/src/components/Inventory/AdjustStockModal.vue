<!-- AdjustStockModal.vue - RESPONSIVE VERSION -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Adjust Stock</h2>
        <button class="btn-close" @click="closeModal">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="item-info">
          <h3>{{ item.Name }}</h3>
          <span class="current-stock">Current Stock: <strong>{{ item.Current_Stock }} {{ item.Unit }}</strong></span>
        </div>

        <div class="form-group">
          <label>Adjustment Quantity *</label>
          <div class="quantity-input">
            <button type="button" @click="decreaseQuantity" :disabled="isSubmitting">−</button>
            <input
              v-model.number="formData.quantity"
              type="number"
              placeholder="0"
              required
              :disabled="isSubmitting"
            />
            <button type="button" @click="increaseQuantity" :disabled="isSubmitting">+</button>
          </div>
          <span class="helper-text">
            New Stock: <strong :class="getStockClass(item.Current_Stock + formData.quantity)">
              {{ item.Current_Stock + formData.quantity }} {{ item.Unit }}
            </strong>
          </span>
          <span v-if="errors.quantity" class="error-message">{{ errors.quantity }}</span>
        </div>

        <div class="form-group">
          <label>Reason *</label>
          <select v-model="formData.reason" required :disabled="isSubmitting">
            <option value="">Select a reason</option>
            <option value="receipt">Stock Receipt</option>
            <option value="sale">Sale/Deduction</option>
            <option value="damage">Damage/Loss</option>
            <option value="return">Customer Return</option>
            <option value="adjustment">Physical Count Adjustment</option>
            <option value="recount">Recount</option>
            <option value="other">Other</option>
          </select>
          <span v-if="errors.reason" class="error-message">{{ errors.reason }}</span>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea
            v-model="formData.notes"
            placeholder="Add any additional notes..."
            rows="3"
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <div v-if="submitError" class="alert alert-error">
          {{ submitError }}
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="isSubmitting">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-small"></span>
            {{ isSubmitting ? 'Adjusting...' : 'Adjust Stock' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useItemStore } from '@/store/itemStore';
import type { Item } from '@/store/itemStore';

interface Props {
  item: Item;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const itemStore = useItemStore();
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

const formData = reactive({
  quantity: 0,
  reason: '',
  notes: '',
});

const errors = reactive({
  quantity: '',
  reason: '',
});

const validateForm = (): boolean => {
  errors.quantity = '';
  errors.reason = '';

  if (formData.quantity === 0) {
    errors.quantity = 'Adjustment quantity is required and cannot be 0';
  }

  if (!formData.reason) {
    errors.reason = 'Reason is required';
  }

  const newStock = props.item.Current_Stock + formData.quantity;
  if (newStock < 0) {
    errors.quantity = `Cannot reduce stock below zero. Current: ${props.item.Current_Stock}`;
  }

  return Object.values(errors).every((error) => !error);
};

const handleSubmit = async () => {
  submitError.value = null;

  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    await itemStore.adjustStock(props.item.Item_ID, {
      quantity: formData.quantity,
      reason: formData.reason,
      notes: formData.notes || undefined,
    });

    emit('success');
    closeModal();
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Failed to adjust stock';
  } finally {
    isSubmitting.value = false;
  }
};

const increaseQuantity = () => {
  formData.quantity += 1;
};

const decreaseQuantity = () => {
  formData.quantity -= 1;
};

const getStockClass = (stock: number): string => {
  if (stock === 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  padding: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
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
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;

  h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #2d3748;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #718096;
    line-height: 1;
    padding: 0;

    &:hover {
      color: #2d3748;
    }
  }
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.item-info {
  background: #f7fafc;
  border-left: 4px solid #667eea;
  padding: 1rem;
  border-radius: 8px;

  h3 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
    font-size: 1.1rem;
    word-break: break-word;
  }

  .current-stock {
    color: #718096;
    font-size: 0.9rem;

    strong {
      color: #2d3748;
    }
  }
}

.form-group {
  display: flex;
  flex-direction: column;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2d3748;
    font-weight: 600;
    font-size: 0.95rem;
  }

  select,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &:disabled {
      background-color: #f7fafc;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .error-message {
    display: block;
    color: #c53030;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .helper-text {
    display: block;
    color: #718096;
    font-size: 0.9rem;
    margin-top: 0.5rem;

    strong {
      font-weight: 700;

      &.low-stock {
        color: #ed8936;
      }

      &.out-of-stock {
        color: #f56565;
      }

      &.in-stock {
        color: #38a169;
      }
    }
  }
}

.quantity-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  button {
    width: 40px;
    height: 40px;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 1.2rem;
    color: #667eea;
    font-weight: bold;
    transition: all 0.3s ease;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      border-color: #667eea;
      background: #f0f4ff;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 1rem;
    text-align: center;
    font-weight: 600;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &:disabled {
      background-color: #f7fafc;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

.alert {
  padding: 1rem;
  border-radius: 8px;

  &.alert-error {
    background-color: #fed7d7;
    color: #c53030;
    border: 1px solid #fc8181;
  }
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f7fafc;
  border-radius: 0 0 12px 12px;
  flex-shrink: 0;
  flex-wrap: wrap-reverse;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  min-height: 40px;

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }

  &.btn-secondary {
    background: #edf2f7;
    color: #2d3748;

    &:hover:not(:disabled) {
      background: #e2e8f0;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Tablet (1024px and below)
@media (max-width: 1024px) {
  .modal-overlay {
    padding: 1rem;
  }

  .modal-content {
    max-width: 450px;
  }

  .modal-header {
    padding: 1.25rem;

    h2 {
      font-size: 1.15rem;
    }
  }

  .modal-form {
    padding: 1.25rem;
  }
}

// Mobile (768px and below)
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.75rem;
    align-items: flex-end;
  }

  .modal-content {
    max-width: 100%;
    width: 100%;
    max-height: 85vh;
    border-radius: 12px 12px 0 0;
  }

  .modal-header {
    padding: 1rem;

    h2 {
      font-size: 1.1rem;
    }

    .btn-close {
      font-size: 1.75rem;
    }
  }

  .modal-form {
    padding: 1rem;
    gap: 1.25rem;
  }

  .item-info {
    padding: 0.75rem;

    h3 {
      font-size: 1rem;
    }

    .current-stock {
      font-size: 0.85rem;
    }
  }

  .form-group {
    label {
      font-size: 0.9rem;
    }

    select,
    textarea {
      padding: 0.65rem;
      font-size: 16px; // Prevents zoom on iOS
    }
  }

  .quantity-input {
    button {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }
  }

  .modal-footer {
    padding: 1rem;
    gap: 0.75rem;
  }

  .btn {
    flex: 1;
    padding: 0.65rem 1rem;
    font-size: 0.9rem;
  }
}

// Small Mobile (480px and below)
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-header {
    padding: 0.875rem;

    h2 {
      font-size: 1rem;
    }

    .btn-close {
      font-size: 1.5rem;
    }
  }

  .modal-form {
    padding: 0.875rem;
    gap: 1rem;
  }

  .item-info {
    padding: 0.625rem;

    h3 {
      font-size: 0.95rem;
    }

    .current-stock {
      font-size: 0.8rem;
    }
  }

  .form-group {
    label {
      font-size: 0.85rem;
    }

    select,
    textarea {
      padding: 0.6rem;
      font-size: 16px;
    }

    .helper-text,
    .error-message {
      font-size: 0.8rem;
    }
  }

  .quantity-input {
    gap: 0.25rem;

    button {
      width: 32px;
      height: 32px;
      font-size: 0.9rem;
    }

    input {
      font-size: 0.9rem;
    }
  }

  .modal-footer {
    padding: 0.875rem;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.6rem 0.875rem;
    font-size: 0.85rem;
  }

  .alert {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}
</style>