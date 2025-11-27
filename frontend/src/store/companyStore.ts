// store/companyStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  User_ID: number;
  Username: string;
  Email: string;
  Mobile_Number: string;
}

interface Company {
  Company_ID: number;
  User_ID: number;
  Name: string;
  Address: string | null;
  Email: string | null;
  Owner?: User;
  createdAt?: string;
  updatedAt?: string;
}

interface CompanyState {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:3000/api';

export const useCompanyStore = defineStore('company', () => {
  // State
  const company = ref<Company | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isCompanyCreated = computed(() => !!company.value);
  const companyName = computed(() => company.value?.Name || '');
  const companyId = computed(() => company.value?.Company_ID || null);
  const companyOwner = computed(() => company.value?.Owner || null);

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

  /**
   * Create a new company
   */
  const createCompany = async (companyData: {
    Name: string;
    Address?: string;
    Email?: string;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/company/create', 'POST', companyData);
      company.value = response.company;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch the logged-in user's company
   */
  const fetchMyCompany = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/company/me', 'GET');
      company.value = response;
      return response;
    } catch (err) {
      // If company is not found, it's not an error state for the UI, 
      // just means the user hasn't created one yet.
      if (err instanceof Error && err.message === 'Company not found') {
        company.value = null;
        return null;
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update company details
   */
  const updateCompany = async (companyData: {
    Name?: string;
    Address?: string | null;
    Email?: string | null;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/company/update', 'PUT', companyData);
      company.value = response.company;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete (soft delete) the company
   */
  const deleteCompany = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/company/delete', 'DELETE');
      company.value = null;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update only the company name
   */
  const updateCompanyName = async (name: string) => {
    return updateCompany({ Name: name });
  };

  /**
   * Update only the company address
   */
  const updateCompanyAddress = async (address: string | null) => {
    return updateCompany({ Address: address });
  };

  /**
   * Update only the company email
   */
  const updateCompanyEmail = async (email: string | null) => {
    return updateCompany({ Email: email });
  };

  /**
   * Clear company state
   */
  const clearCompany = () => {
    company.value = null;
    error.value = null;
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Reset store to initial state
   */
  const reset = () => {
    company.value = null;
    isLoading.value = false;
    error.value = null;
  };

  return {
    // State
    company,
    isLoading,
    error,

    // Computed
    isCompanyCreated,
    companyName,
    companyId,
    companyOwner,

    // Actions
    createCompany,
    fetchMyCompany,
    updateCompany,
    deleteCompany,
    updateCompanyName,
    updateCompanyAddress,
    updateCompanyEmail,
    clearCompany,
    clearError,
    reset,
  };
});