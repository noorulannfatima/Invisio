// store/settingStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios, { AxiosError } from 'axios';

// Types
interface User {
  User_ID: number;
  Username: string;
  Email: string;
  Mobile_Number: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  Company_ID: number;
  User_ID: number;
  Name: string;
  Address: string | null;
  Email: string | null;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  Owner?: User;
}

interface CompanyStats {
  companyName: string;
  partiesCount: number;
  transactionsCount: number;
  expensesCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// API client configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handler
const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<void>>;
    return axiosError.response?.data?.message || 
           axiosError.message || 
           'An error occurred';
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

export const useSettingStore = defineStore('settings', () => {
  // ========== STATE ==========
  const userProfile = ref<User | null>(null);
  const company = ref<Company | null>(null);
  const companyStats = ref<CompanyStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);

  // ========== COMPUTED ==========
  const isUserLoaded = computed(() => userProfile.value !== null);
  const isCompanyLoaded = computed(() => company.value !== null);
  const isCompanyStatsLoaded = computed(() => companyStats.value !== null);

  // ========== HELPER FUNCTIONS ==========
  const setLoading = (state: boolean) => {
    loading.value = state;
  };

  const setError = (message: string | null) => {
    error.value = message;
    if (message) {
      console.error('Settings Store Error:', message);
    }
  };

  const setSuccess = (message: string | null) => {
    success.value = message;
  };

  const clearMessages = () => {
    error.value = null;
    success.value = null;
  };

  // ========== USER PROFILE ACTIONS ==========

  /**
   * Fetch user profile
   */
  const fetchUserProfile = async (): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await apiClient.get<ApiResponse<User>>('/settings/profile');

      if (response.data?.success && response.data?.data) {
        userProfile.value = response.data.data;
        return true;
      } else {
        setError(response.data?.message || 'Failed to fetch profile');
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (payload: {
    Email?: string;
    Mobile_Number?: string;
    Username?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      clearMessages();

      const response = await apiClient.put<ApiResponse<User>>(
        '/settings/profile',
        payload
      );

      if (response.data?.success && response.data?.data) {
        userProfile.value = response.data.data;
        setSuccess(response.data.message || 'Profile updated successfully');
        return true;
      } else {
        setError(response.data?.message || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (payload: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      clearMessages();

      const response = await apiClient.put<ApiResponse<void>>(
        '/settings/change-password',
        payload
      );

      if (response.data?.success) {
        setSuccess(response.data.message || 'Password changed successfully');
        return true;
      } else {
        setError(response.data?.message || 'Failed to change password');
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete user account
   */
  const deleteUserAccount = async (password: string): Promise<boolean> => {
    try {
      setLoading(true);
      clearMessages();

      const response = await apiClient.delete<ApiResponse<void>>(
        '/settings/delete-account',
        { data: { password } }
      );

      if (response.data?.success) {
        userProfile.value = null;
        company.value = null;
        setSuccess(response.data.message || 'Account deleted successfully');
        return true;
      } else {
        setError(response.data?.message || 'Failed to delete account');
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========== COMPANY SETTINGS ACTIONS ==========

  /**
   * Fetch company details
   */
  const fetchCompanyDetails = async (): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await apiClient.get<ApiResponse<Company>>(
        '/settings/company'
      );

      if (response.data?.success && response.data?.data) {
        company.value = response.data.data;
        return true;
      } else {
        setError(response.data?.message || 'Failed to fetch company details');
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    }
  };

  /**
   * Update company details
   */
  const updateCompanyDetails = async (payload: {
    Name?: string;
    Address?: string;
    Email?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      clearMessages();

      const response = await apiClient.put<ApiResponse<Company>>(
        '/settings/company',
        payload
      );

      if (response.data?.success && response.data?.data) {
        company.value = response.data.data;
        setSuccess(response.data.message || 'Company details updated successfully');
        return true;
      } else {
        setError(response.data?.message || 'Failed to update company');
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete company
   */
  const deleteCompany = async (password: string): Promise<boolean> => {
    try {
      setLoading(true);
      clearMessages();

      const response = await apiClient.delete<ApiResponse<void>>(
        '/settings/company',
        { data: { password } }
      );

      if (response.data?.success) {
        company.value = null;
        companyStats.value = null;
        setSuccess(response.data.message || 'Company deleted successfully');
        return true;
      } else {
        setError(response.data?.message || 'Failed to delete company');
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch company statistics
   */
  const fetchCompanyStats = async (): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await apiClient.get<ApiResponse<CompanyStats>>(
        '/settings/company/stats'
      );

      if (response.data?.success && response.data?.data) {
        companyStats.value = response.data.data;
        return true;
      } else {
        setError(response.data?.message || 'Failed to fetch company stats');
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    }
  };

  /**
   * Load all settings (user profile, company details, and stats)
   */
  const loadAllSettings = async (): Promise<boolean> => {
    try {
      setLoading(true);
      clearMessages();

      // Fetch all data in parallel with error handling for each
      const [userResult, companyResult, statsResult] = await Promise.allSettled([
        fetchUserProfile(),
        fetchCompanyDetails(),
        fetchCompanyStats()
      ]);

      // Check if all succeeded
      const userSuccess = userResult.status === 'fulfilled' && userResult.value;
      const companySuccess = companyResult.status === 'fulfilled' && companyResult.value;
      const statsSuccess = statsResult.status === 'fulfilled' && statsResult.value;

      if (userSuccess || companySuccess || statsSuccess) {
        setSuccess('Settings loaded successfully');
        return true;
      } else {
        // At least one failed, but we don't want to overwrite the error
        return false;
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset store state
   */
  const resetStore = () => {
    userProfile.value = null;
    company.value = null;
    companyStats.value = null;
    clearMessages();
  };

  return {
    // State
    userProfile,
    company,
    companyStats,
    loading,
    error,
    success,

    // Computed
    isUserLoaded,
    isCompanyLoaded,
    isCompanyStatsLoaded,

    // Helper methods
    clearMessages,
    resetStore,

    // User actions
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    deleteUserAccount,

    // Company actions
    fetchCompanyDetails,
    updateCompanyDetails,
    deleteCompany,
    fetchCompanyStats,

    // Utility
    loadAllSettings
  };
});