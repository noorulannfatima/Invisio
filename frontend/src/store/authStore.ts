// store/authStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  User_ID: number;
  Username: string;
  Email: string;
  Mobile_Number: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:3000/api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const userName = computed(() => user.value?.Username || '');

  // Helper function for API calls
  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in requests
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      error.value = errorMsg;
      throw err;
    }
  };

  // Actions
  const signup = async (userData: {
    Email: string;
    Password: string;
    Username: string;
    Mobile_Number: string;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/auth/signup', 'POST', userData);
      user.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (credentials: { Email: string; Password: string }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/auth/login', 'POST', credentials);
      user.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await apiCall('/auth/logout', 'POST');
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const refreshTokens = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await apiCall('/auth/refresh-token', 'POST');
      // Token is automatically set as a cookie by the backend
      return true;
    } catch (err) {
      // If refresh fails, user is no longer authenticated
      user.value = null;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getProfile = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/auth/me', 'GET');
      user.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Initialize auth state (call on app startup)
  const initializeAuth = async () => {
    try {
      await getProfile();
    } catch {
      // User not authenticated
      user.value = null;
    }
  };

  return {
    // State
    user,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    userName,

    // Actions
    signup,
    login,
    logout,
    refreshTokens,
    getProfile,
    clearError,
    initializeAuth,
  };
});