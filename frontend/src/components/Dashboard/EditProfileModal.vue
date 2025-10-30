<!-- EditProfileModal.vue  delete.-->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>Edit Profile</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <!-- Username Field -->
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="form-input"
              placeholder="Enter your username"
            />
            <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              placeholder="Enter your email"
            />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <!-- Mobile Number Field -->
          <div class="form-group">
            <label for="mobile">Mobile Number</label>
            <input
              id="mobile"
              v-model="formData.mobile"
              type="tel"
              class="form-input"
              placeholder="Enter your mobile number"
            />
            <span v-if="errors.mobile" class="error-text">{{ errors.mobile }}</span>
          </div>

          <!-- General Error Message -->
          <div v-if="errors.general" class="error-message">
            {{ errors.general }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-small"></span>
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore';

defineEmits<{
  close: [];
  success: [];
}>();

const authStore = useAuthStore();
const isLoading = ref(false);

const formData = reactive({
  username: '',
  email: '',
  mobile: '',
});

const errors = reactive({
  username: '',
  email: '',
  mobile: '',
  general: '',
});

onMounted(() => {
  if (authStore.user) {
    formData.username = authStore.user.Username || '';
    formData.email = authStore.user.Email || '';
    formData.mobile = authStore.user.Mobile_Number || '';
  }
});

const validateForm = (): boolean => {
  errors.username = '';
  errors.email = '';
  errors.mobile = '';
  errors.general = '';

  if (!formData.username.trim()) {
    errors.username = 'Username is required';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.mobile.trim()) {
    errors.mobile = 'Mobile number is required';
  }

  return !errors.username && !errors.email && !errors.mobile;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const submitForm = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    // Call your auth store update method here
    await authStore.updateProfile({
      Username: formData.username,
      Email: formData.email,
      Mobile_Number: formData.mobile,
    });

    // Emit success event
    defineEmits<{ success: [] }>()('success');
  } catch (err: any) {
    console.error('Failed to update profile:', err);
    errors.general = err?.message || 'Failed to update profile. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
// Modal Overlay
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
  z-index: 1100;
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

// Modal Content
.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.16);
  width: 90%;
  max-width: 500px;
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

// Modal Header
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
    font-weight: 600;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #718096;
    transition: color 0.3s ease;

    &:hover {
      color: #2d3748;
    }
  }
}

// Modal Body
.modal-body {
  padding: 2rem;
}

// Form Group
.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2d3748;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
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
    }
  }

  .error-text {
    display: block;
    margin-top: 0.5rem;
    color: #c53030;
    font-size: 0.85rem;
    font-weight: 500;
  }
}

// Error Message
.error-message {
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

// Form Actions
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

// Button Styles
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

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &.btn-secondary {
    background: #edf2f7;
    color: #2d3748;

    &:hover {
      background: #e2e8f0;
    }
  }
}

// Spinner Small
.spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: 100%;
  }

  .modal-header {
    padding: 1.25rem;

    h2 {
      font-size: 1.1rem;
    }
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;

    .btn {
      width: 100%;
      justify-content: center;
    }
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 1rem;

    h2 {
      font-size: 1rem;
    }

    .btn-close {
      font-size: 1.25rem;
    }
  }

  .modal-body {
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 1.25rem;

    label {
      font-size: 0.9rem;
    }

    .form-input {
      padding: 0.65rem 0.9rem;
      font-size: 0.95rem;
    }
  }

  .form-actions {
    gap: 0.75rem;

    .btn {
      padding: 0.65rem 1.25rem;
      font-size: 0.95rem;
    }
  }
}
</style>