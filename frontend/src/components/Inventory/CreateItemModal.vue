<!-- CreateItemModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Create New Item</h2>
        <button class="btn-close" @click="closeModal">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label>Item Name *</label>
          <input
            v-model="formData.Name"
            type="text"
            placeholder="Enter item name"
            required
            :disabled="isSubmitting"
          />
          <span v-if="errors.Name" class="error-message">{{ errors.Name }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Unit *</label>
            <input
              v-model="formData.Unit"
              type="text"
              placeholder="e.g., pcs, kg, ltr"
              required
              :disabled="isSubmitting"
            />
            <span v-if="errors.Unit" class="error-message">{{ errors.Unit }}</span>
          </div>

          <div class="form-group">
            <label>Current Stock</label>
            <input
              v-model.number="formData.Current_Stock"
              type="number"
              placeholder="0"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="formData.Description"
            placeholder="Enter item description"
            rows="3"
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Purchase Price *</label>
            <input
              v-model.number="formData.Purchase_Price"
              type="number"
              placeholder="0.00"
              step="0.01"
              required
              :disabled="isSubmitting"
            />
            <span v-if="errors.Purchase_Price" class="error-message">
              {{ errors.Purchase_Price }}
            </span>
          </div>

          <div class="form-group">
            <label>Selling Price *</label>
            <input
              v-model.number="formData.Selling_Price"
              type="number"
              placeholder="0.00"
              step="0.01"
              required
              :disabled="isSubmitting"
            />
            <span v-if="errors.Selling_Price" class="error-message">
              {{ errors.Selling_Price }}
            </span>
          </div>
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
            {{ isSubmitting ? 'Creating...' : 'Create Item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useItemStore } from '@/store/itemStore';

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const itemStore = useItemStore();
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

const formData = reactive({
  Name: '',
  Unit: '',
  Description: '',
  Purchase_Price: 0,
  Selling_Price: 0,
  Current_Stock: 0,
});

const errors = reactive({
  Name: '',
  Unit: '',
  Purchase_Price: '',
  Selling_Price: '',
});

const validateForm = (): boolean => {
  errors.Name = '';
  errors.Unit = '';
  errors.Purchase_Price = '';
  errors.Selling_Price = '';

  if (!formData.Name.trim()) {
    errors.Name = 'Item name is required';
  } else if (formData.Name.length < 2 || formData.Name.length > 150) {
    errors.Name = 'Item name must be between 2 and 150 characters';
  }

  if (!formData.Unit.trim()) {
    errors.Unit = 'Unit is required';
  } else if (formData.Unit.length < 1 || formData.Unit.length > 20) {
    errors.Unit = 'Unit must be between 1 and 20 characters';
  }

  if (formData.Purchase_Price < 0) {
    errors.Purchase_Price = 'Purchase price must be positive';
  }

  if (formData.Selling_Price < 0) {
    errors.Selling_Price = 'Selling price must be positive';
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
    await itemStore.createItem({
      Name: formData.Name,
      Unit: formData.Unit,
      Description: formData.Description || undefined,
      Purchase_Price: formData.Purchase_Price,
      Selling_Price: formData.Selling_Price,
      Current_Stock: formData.Current_Stock,
    });

    emit('success');
    closeModal();
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Failed to create item';
  } finally {
    isSubmitting.value = false;
  }
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
  max-width: 600px;
  width: 90%;
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

    &:hover {
      color: #2d3748;
    }
  }
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2d3748;
    font-weight: 600;
    font-size: 0.95rem;
  }

  input,
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
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;

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
  gap: 0.5rem;

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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

