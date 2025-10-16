<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Invisio account</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
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
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="form.rememberMe" type="checkbox">
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" class="auth-button" :disabled="authStore.isLoading">
            <span v-if="authStore.isLoading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>

          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? 
            <router-link to="/register" class="auth-link">Sign up</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Clear any previous errors when component mounts
onMounted(() => {
  authStore.clearError()
})

// Clear errors when component unmounts
onUnmounted(() => {
  authStore.clearError()
})

const handleLogin = async (): Promise<void> => {
  try {
    // Clear any previous errors
    authStore.clearError()

    // Attempt login with the auth store
    await authStore.login({
      Email: form.email,
      Password: form.password
    })
    
    // On successful login, redirect to dashboard
    router.push('/dashboard')
    
  } catch (err) {
    // Error is already set in the store, just log it
    console.error('Login failed:', err)
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
  max-width: 400px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
    color: #64748b;
    font-size: 1rem;
  }
}

.auth-form {
  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;

      &:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      &:disabled {
        background: #f3f4f6;
        cursor: not-allowed;
      }

      &::placeholder {
        color: #9ca3af;
      }
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    .checkbox-label {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      color: #374151;
      cursor: pointer;

      input {
        width: auto;
        margin-right: 0.5rem;
      }
    }

    .forgot-password {
      color: #2563eb;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .auth-button {
    width: 100%;
    background: linear-gradient(135deg, #2563eb 0%, #052f56 100%);
    color: white;
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1rem;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
  }

  .error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    border: 1px solid #fecaca;
  }
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;

  p {
    color: #64748b;
    font-size: 0.9rem;
  }

  .auth-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
}
</style>