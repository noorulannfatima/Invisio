<!-- EditPartyModal.vue - Updated -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit Party</h2>
        <button class="btn-close" @click="closeModal" aria-label="Close modal">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="edit-party-name">Party Name <span class="required">*</span></label>
          <input
            id="edit-party-name"
            v-model="formData.Name"
            type="text"
            placeholder="Enter party name"
            required
            :disabled="isSubmitting"
            maxlength="100"
          />
          <span v-if="errors.Name" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.Name }}
          </span>
        </div>

        <div class="form-group">
          <label for="edit-party-type">Party Type <span class="required">*</span></label>
          <select 
            id="edit-party-type"
            v-model="formData.Type" 
            required 
            :disabled="isSubmitting"
          >
            <option value="Customer">Customer</option>
            <option value="Supplier">Supplier</option>
            <option value="Both">Both</option>
          </select>
          <span v-if="errors.Type" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.Type }}
          </span>
        </div>

        <div class="form-group">
          <label for="edit-party-phone">Phone Number</label>
          <input
            id="edit-party-phone"
            v-model="formData.Mobile"
            type="tel"
            placeholder="Enter phone number (e.g., 03001234567)"
            :disabled="isSubmitting"
            maxlength="20"
          />
          <span v-if="errors.Mobile" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.Mobile }}
          </span>
        </div>

        <div class="form-group">
          <label for="edit-party-balance">Outstanding Balance</label>
          <div class="input-with-currency">
            <span class="currency-symbol">PKR</span>
            <input
              id="edit-party-balance"
              v-model.number="formData.Outstanding_Balance"
              type="number"
              placeholder="Enter outstanding balance"
              :disabled="isSubmitting"
              min="0"
              step="0.01"
            />
          </div>
          <span v-if="errors.Outstanding_Balance" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.Outstanding_Balance }}
          </span>
        </div>

        <div v-if="submitError" class="alert alert-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ submitError }}</span>
        </div>

        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="closeModal" 
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner-small"></span>
            {{ isSubmitting ? 'Updating...' : 'Update Party' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { usePartyStore } from '@/store/partyStore';
import type { Party } from '@/store/partyStore';

interface Props {
  party: Party;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const partyStore = usePartyStore();
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

const formData = reactive({
  Name: '',
  Type: '' as 'Customer' | 'Supplier' | 'Both',
  Mobile: '',
  Outstanding_Balance: 0,
});

const errors = reactive({
  Name: '',
  Type: '',
  Mobile: '',
  Outstanding_Balance: '',
});

onMounted(() => {
  formData.Name = props.party.Name;
  formData.Type = props.party.Type as 'Customer' | 'Supplier' | 'Both';
  formData.Mobile = props.party.Mobile || '';
  formData.Outstanding_Balance = props.party.Outstanding_Balance || 0;
});

const validateForm = (): boolean => {
  errors.Name = '';
  errors.Type = '';
  errors.Mobile = '';
  errors.Outstanding_Balance = '';

  if (!formData.Name.trim()) {
    errors.Name = 'Party name is required';
  } else if (formData.Name.length < 2 || formData.Name.length > 100) {
    errors.Name = 'Party name must be between 2 and 100 characters';
  }

  if (!formData.Type) {
    errors.Type = 'Party type is required';
  }

  if (formData.Mobile && (formData.Mobile.length < 10 || formData.Mobile.length > 20)) {
    errors.Mobile = 'Phone number must be between 10 and 20 characters';
  }

  if (formData.Outstanding_Balance < 0) {
    errors.Outstanding_Balance = 'Outstanding balance cannot be negative';
  }

  return Object.values(errors).every(error => !error);
};

const handleSubmit = async () => {
  submitError.value = null;

  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    await partyStore.updateParty(props.party.Party_ID, {
      Name: formData.Name.trim(),
      Type: formData.Type,
      Mobile: formData.Mobile?.trim() || null,
      Outstanding_Balance: formData.Outstanding_Balance || 0,
    });

    emit('success');
    closeModal();
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Failed to update party. Please try again.';
    console.error('Update party error:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.input-with-currency {
  position: relative;
  display: flex;
  align-items: center;

  .currency-symbol {
    position: absolute;
    left: 0.75rem;
    color: #718096;
    font-weight: 600;
    font-size: 0.9rem;
  }

  input {
    padding-left: 3.5rem;
  }
}

// Include all the styles from EditPartyModal.vue
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
  overflow-y: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

@keyframes modalSlideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
    font-weight: 700;
    color: #1a202c;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #718096;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    border-radius: 4px;

    &:hover {
      color: #2d3748;
      background: #f7fafc;
    }
  }
}

.modal-form {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2d3748;
    font-weight: 600;
    font-size: 0.95rem;

    .required {
      color: #f56565;
    }
  }

  input,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    box-sizing: border-box;

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

    &::placeholder {
      color: #cbd5e0;
    }
  }

  select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232d3748' d='M1.5 4.5L6 9l4.5-4.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.5rem;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #c53030;
    font-size: 0.85rem;
    margin-top: 0.5rem;

    i {
      font-size: 0.75rem;
      flex-shrink: 0;
    }
  }
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &.alert-error {
    background-color: #fed7d7;
    color: #c53030;
    border: 1px solid #fc8181;

    i {
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    span {
      font-size: 0.95rem;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f7fafc;
  flex-shrink: 0;
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
  font-size: 1rem;
  white-space: nowrap;

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
    border: 1px solid #e2e8f0;

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
  to { transform: rotate(360deg); }
}
</style>
