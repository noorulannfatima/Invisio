<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Join Invisio and get started today</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <!-- Row 1: Name  -->
          <div class="form-row">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Enter your full name"
                required
                :disabled="authStore.isLoading"
              />
              <div v-if="validationErrors.name" class="validation-error">
                <small>{{ validationErrors.name }}</small>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Enter your email"
                required
                :disabled="authStore.isLoading"
              />
              <div v-if="validationErrors.email" class="validation-error">
                <small>{{ validationErrors.email }}</small>
              </div>
            </div>
          </div>

          <!-- Row 2: Mobile Number -->
          <div class="form-row">
            <div class="form-group">
              <label for="mobileNumber">Mobile Number</label>
              <input
                id="mobileNumber"
                v-model="form.mobileNumber"
                type="tel"
                placeholder="Enter mobile number"
                required
                :disabled="authStore.isLoading"
                minlength="10"
                maxlength="20"
              />
              <div v-if="validationErrors.mobileNumber" class="validation-error">
                <small>{{ validationErrors.mobileNumber }}</small>
              </div>
            </div>
          </div>

          <!-- Row 3: Password and Confirm Password -->
          <div class="form-row">
            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Create a strong password"
                required
                :disabled="authStore.isLoading"
                minlength="8"
              />
              <div class="password-requirements">
                <small>At least 8 characters</small>
              </div>
              <div v-if="validationErrors.password" class="validation-error">
                <small>{{ validationErrors.password }}</small>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                :disabled="authStore.isLoading"
              />
              <div v-if="validationErrors.confirmPassword" class="validation-error">
                <small>{{ validationErrors.confirmPassword }}</small>
              </div>
            </div>
          </div>

          <!-- Terms Checkbox -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="form.acceptTerms" type="checkbox" required />
              <span>
                I agree to the
                <a href="#" class="terms-link">Terms of Service</a> and
                <a href="#" class="terms-link">Privacy Policy</a>
              </span>
            </label>
            <div v-if="validationErrors.acceptTerms" class="validation-error">
              <small>{{ validationErrors.acceptTerms }}</small>
            </div>
          </div>

          <button
            type="submit"
            class="auth-button"
            :disabled="authStore.isLoading || !isFormValid"
          >
            <span v-if="authStore.isLoading">Creating Account...</span>
            <span v-else>Create Account</span>
          </button>

          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
        </form>

        <div class="auth-footer">
          <p>
            Already have an account?
            <router-link to="/login" class="auth-link">Sign in</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const successMessage = ref<string>('')

const form = reactive({
  name: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const validationErrors = reactive({
  name: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

// Validate individual fields
const validateField = (fieldName: string): string => {
  switch (fieldName) {
    case 'name':
      if (!form.name.trim()) return 'Full name is required'
      if (form.name.trim().length < 3) return 'Name must be at least 3 characters'
      if (form.name.trim().length > 50) return 'Name must not exceed 50 characters'
      return ''

    case 'email':
      if (!form.email.trim()) return 'Email is required'
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email.trim())) return 'Please enter a valid email'
      return ''

    case 'mobileNumber':
      if (!form.mobileNumber.trim()) return 'Mobile number is required'
      if (form.mobileNumber.trim().length < 10) return 'Mobile number must be at least 10 digits'
      if (form.mobileNumber.trim().length > 20) return 'Mobile number must not exceed 20 digits'
      if (!/^\d+$/.test(form.mobileNumber.trim())) return 'Mobile number must contain only digits'
      return ''

    case 'password':
      if (!form.password) return 'Password is required'
      if (form.password.length < 8) return 'Password must be at least 8 characters'
      return ''

    case 'confirmPassword':
      if (!form.confirmPassword) return 'Please confirm your password'
      if (form.password !== form.confirmPassword) return 'Passwords do not match'
      return ''

    case 'acceptTerms':
      if (!form.acceptTerms) return 'You must accept the terms and privacy policy'
      return ''

    default:
      return ''
  }
}

// Validate all fields
const validateForm = (): boolean => {
  validationErrors.name = validateField('name')
  validationErrors.email = validateField('email')
  validationErrors.mobileNumber = validateField('mobileNumber')
  validationErrors.password = validateField('password')
  validationErrors.confirmPassword = validateField('confirmPassword')
  validationErrors.acceptTerms = validateField('acceptTerms')

  return !Object.values(validationErrors).some(err => err !== '')
}

// Computed property for form validation
const isFormValid = computed(() => {
  return (
    form.name.trim().length >= 3 &&
    form.name.trim().length <= 50 &&
    form.email.trim() !== '' &&
    form.mobileNumber.trim().length >= 10 &&
    form.mobileNumber.trim().length <= 20 &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword &&
    form.acceptTerms
  )
})

// Clear errors on mount/unmount
onMounted(() => {
  authStore.clearError()
  successMessage.value = ''
})

onUnmounted(() => {
  authStore.clearError()
})

// Handle registration
const handleRegister = async () => {
  // Clear previous messages
  successMessage.value = ''
  authStore.clearError()

  // Validate form before submission
  if (!validateForm()) {
    return
  }

  try {
    // Call authStore signup action
    await authStore.signup({
      Username: form.name.trim(),
      Email: form.email.trim(),
      Mobile_Number: form.mobileNumber.trim(),
      Password: form.password
    })

    // Show success message
    successMessage.value = 'Account created successfully! Redirecting...'

    // Redirect to dashboard after brief delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err: any) {
    console.error('Registration failed:', err)
    // Error is already set in authStore.error by the signup action
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-container {
  margin-top: 5%;
  width: 100%;
  max-width: 520px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #1a202c;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #052f56 0%, #2563eb 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #6b7280;
    font-size: 1rem;
  }
}

.auth-form {
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
      gap: 0;
      margin-bottom: 0;
    }

    .form-group {
      margin-bottom: 0;

      @media (max-width: 640px) {
        margin-bottom: 1.5rem;
      }
    }
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="password"] {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #f9fafb;

      &:focus {
        outline: none;
        border-color: #2563eb;
        background: white;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .password-requirements {
      margin-top: 0.5rem;

      small {
        color: #6b7280;
        font-size: 0.8rem;
      }
    }

    .validation-error {
      margin-top: 0.5rem;

      small {
        color: #dc2626;
        font-size: 0.8rem;
      }
    }

    &.checkbox-group {
      .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        font-weight: normal;

        input[type="checkbox"] {
          margin-top: 0.25rem;
          width: 18px;
          height: 18px;
          color: #2563eb;
        }

        span {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.5;

          .terms-link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
  }

  .auth-button {
    width: 100%;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
    margin-top: 1rem;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  .error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    text-align: center;
    border: 1px solid #fca5a5;
    margin-bottom: 1rem;
  }

  .success-message {
    background: #dcfce7;
    color: #16a34a;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    text-align: center;
    border: 1px solid #86efac;
    margin-bottom: 1rem;
  }
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;

  p {
    color: #6b7280;
    font-size: 0.9rem;

    .auth-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>