<!-- EditCompanyModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit Company</h2>
        <button class="btn-close" @click="closeModal">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="edit-company-name">Company Name *</label>
          <input
            id="edit-company-name"
            v-model="formData.Name"
            type="text"
            placeholder="Enter company name"
            required
            :disabled="isSubmitting"
            class="form-control"
          />
          <span v-if="errors.Name" class="error-message">{{ errors.Name }}</span>
          <span class="form-hint">{{ formData.Name.length }}/100 characters</span>
        </div>

        <div class="form-group">
          <label for="edit-company-address">Address</label>
          <textarea
            id="edit-company-address"
            v-model="formData.Address"
            placeholder="Enter company address"
            :disabled="isSubmitting"
            class="form-control"
            rows="3"
          ></textarea>
          <span v-if="errors.Address" class="error-message">{{ errors.Address }}</span>
        </div>

        <div class="form-group">
          <label for="edit-company-email">Email</label>
          <input
            id="edit-company-email"
            v-model="formData.Email"
            type="email"
            placeholder="Enter company email"
            :disabled="isSubmitting"
            class="form-control"
          />
          <span v-if="errors.Email" class="error-message">{{ errors.Email }}</span>
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
            {{ isSubmitting ? 'Updating...' : 'Update Company' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useCompanyStore } from '@/store/companyStore';

interface FormData {
  Name: string;
  Address: string | null;
  Email: string | null;
}

interface FormErrors {
  Name?: string;
  Address?: string;
  Email?: string;
}

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const companyStore = useCompanyStore();
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

const formData = reactive<FormData>({
  Name: '',
  Address: null,
  Email: null,
});

const errors = reactive<FormErrors>({});

onMounted(() => {
  if (companyStore.company) {
    formData.Name = companyStore.company.Name;
    formData.Address = companyStore.company.Address || null;
    formData.Email = companyStore.company.Email || null;
  }
});

const validateForm = (): boolean => {
  errors.Name = '';
  errors.Address = '';
  errors.Email = '';

  if (!formData.Name.trim()) {
    errors.Name = 'Company name is required';
  } else if (formData.Name.length < 2) {
    errors.Name = 'Company name must be at least 2 characters';
  } else if (formData.Name.length > 100) {
    errors.Name = 'Company name must not exceed 100 characters';
  }

  if (formData.Address && formData.Address.length > 500) {
    errors.Address = 'Address must not exceed 500 characters';
  }

  if (formData.Email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      errors.Email = 'Please enter a valid email address';
    }
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
    await companyStore.updateCompany({
      Name: formData.Name,
      Address: formData.Address,
      Email: formData.Email,
    });

    emit('success');
    closeModal();
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Failed to update company';
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
  max-width: 500px;
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
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #2d3748;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #718096;
    transition: color 0.3s ease;
    line-height: 1;

    &:hover {
      color: #2d3748;
    }
  }
}

.modal-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;

  &:last-of-type {
    margin-bottom: 2rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2d3748;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .form-control {
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

  .form-hint {
    display: block;
    color: #a0aec0;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
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
  padding: 2rem;
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
  font-size: 1rem;

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
  .modal-content {
    width: 95%;
  }

  .modal-header,
  .modal-form,
  .modal-footer {
    padding: 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }
}
</style>
