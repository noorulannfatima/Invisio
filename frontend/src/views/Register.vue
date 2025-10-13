<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Join Invisio and get started today</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                placeholder="Enter your first name"
                required
                :disabled="loading"
              />
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                placeholder="Enter your last name"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Create a strong password"
              required
              :disabled="loading"
            />
            <div class="password-requirements">
              <small>Password must be at least 8 characters long</small>
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
              :disabled="loading"
            />
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="form.acceptTerms" type="checkbox" required>
              <span>I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a></span>
            </label>
          </div>

          <button type="submit" class="auth-button" :disabled="loading || !isFormValid">
            <span v-if="loading">Creating Account...</span>
            <span v-else>Create Account</span>
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <div class="auth-footer">
          <p>Already have an account? 
            <router-link to="/login" class="auth-link">Sign in</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Computed property for form validation
const isFormValid = computed(() => {
  return form.firstName.trim() !== '' &&
         form.lastName.trim() !== '' &&
         form.email.trim() !== '' &&
         form.password.length >= 8 &&
         form.password === form.confirmPassword &&
         form.acceptTerms
})

// Handle registration
const handleRegister = async () => {
  if (!isFormValid.value) {
    error.value = 'Please fill all fields correctly'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // TODO: Replace with actual API call
    console.log('Registration data:', {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // On success, redirect to login or dashboard
    router.push('/login')
  } catch (err) {
    error.value = 'Registration failed. Please try again.'
    console.error('Registration error:', err)
  } finally {
    loading.value = false
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
  width: 100%;
  max-width: 480px;
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
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6b7280;
    font-size: 1rem;
  }
}

.auth-form {
  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 0;
    }

    .form-group {
      flex: 1;
      margin-bottom: 0;

      @media (max-width: 768px) {
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