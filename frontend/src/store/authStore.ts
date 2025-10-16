// stores/authStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

// Types
interface User {
  User_ID: number;
  Username: string;
  Email: string;
  Mobile_Number: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SignupData {
  Email: string;
  Password: string;
  Username: string;
  Mobile_Number: string;
}

interface LoginData {
  Email: string;
  Password: string;
}

interface AuthResponse {
  User_ID: number;
  Username: string;
  Email: string;
  Mobile_Number: string;
}

// Configure axios defaults
const getApiUrl = (): string => {
  // Try Vite env first
  if (typeof window !== 'undefined' && (window as any).VITE_API_URL) {
    return (window as any).VITE_API_URL;
  }
  // Fallback to process.env for compatibility
  if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }
  return 'http://localhost:5000';
};

axios.defaults.baseURL = getApiUrl();
axios.defaults.withCredentials = true; // Important for cookies

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // Computed
  const isAuthenticated = computed(() => !!user.value);

  // Actions
  const signup = async (data: SignupData): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post<AuthResponse>('/api/auth/signup', data);
      user.value = response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', data);
      user.value = response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await axios.post('/api/auth/logout');
      user.value = null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Logout failed';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      await axios.post('/api/auth/refresh-token');
      return true;
    } catch (err) {
      user.value = null;
      return false;
    }
  };

  const getUserProfile = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get<User>('/api/auth/me');
      user.value = response.data;
      isInitialized.value = true;
    } catch (err: any) {
      user.value = null;
      isInitialized.value = true;
      
      // Don't set error for 401 (just means not logged in)
      if (err.response?.status !== 401) {
        error.value = err.response?.data?.message || 'Failed to get user profile';
      }
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  const reset = (): void => {
    user.value = null;
    error.value = null;
    isLoading.value = false;
  };

  // Initialize auth state on app load
  const initializeAuth = async (): Promise<void> => {
    if (isInitialized.value) return;
    
    try {
      await getUserProfile();
    } catch (err) {
      // Silent fail - user just isn't logged in
      isInitialized.value = true;
    }
  };

  return {
    // State
    user,
    isLoading,
    error,
    isInitialized,
    
    // Computed
    isAuthenticated,
    
    // Actions
    signup,
    login,
    logout,
    refreshToken,
    getUserProfile,
    clearError,
    reset,
    initializeAuth,
  };
});

// Axios interceptor for automatic token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve) => {
          addRefreshSubscriber(() => {
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authStore = useAuthStore();
        const success = await authStore.refreshToken();
        
        if (success) {
          isRefreshing = false;
          onRefreshed('refreshed');
          return axios(originalRequest);
        } else {
          isRefreshing = false;
          authStore.reset();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        isRefreshing = false;
        const authStore = useAuthStore();
        authStore.reset();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);