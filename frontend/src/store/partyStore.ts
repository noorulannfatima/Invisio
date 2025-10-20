import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Party {
  Party_ID: number;
  Company_ID: number;
  Name: string;
  Type: 'Customer' | 'Supplier' | 'Both';
  Mobile: string | null;
  Outstanding_Balance: number;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FilterOptions {
  type?: 'Customer' | 'Supplier' | 'Both';
  search?: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

export const usePartyStore = defineStore('party', () => {
  // State
  const parties = ref<Party[]>([]);
  const currentParty = ref<Party | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const partyCount = computed(() => parties.value.length);
  const customerCount = computed(
    () => parties.value.filter(p => p.Type === 'Customer' || p.Type === 'Both').length
  );
  const supplierCount = computed(
    () => parties.value.filter(p => p.Type === 'Supplier' || p.Type === 'Both').length
  );
  const totalOutstandingBalance = computed(() =>
    parties.value.reduce((sum, p) => sum + (p.Outstanding_Balance || 0), 0)
  );

  // Helper function for API calls
  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
   * Create a new party
   */
  const createParty = async (partyData: {
    Name: string;
    Type: 'Customer' | 'Supplier' | 'Both';
    Mobile?: string;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/party/create', 'POST', partyData);
      parties.value.push(response.party);
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch all parties with optional filters
   */
  const fetchAllParties = async (filters?: FilterOptions) => {
    isLoading.value = true;
    error.value = null;

    try {
      let endpoint = '/party';

      if (filters) {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.search) params.append('search', filters.search);

        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
      }

      const response = await apiCall(endpoint, 'GET');
      parties.value = response.parties || [];
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch single party by ID
   */
  const fetchPartyById = async (partyId: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/party/${partyId}`, 'GET');
      currentParty.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update party details
   */
  const updateParty = async (
    partyId: number,
    partyData: {
      Name?: string;
      Type?: 'Customer' | 'Supplier' | 'Both';
      Mobile?: string | null;
    }
  ) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/party/${partyId}`, 'PUT', partyData);

      // Update in parties array
      const index = parties.value.findIndex(p => p.Party_ID === partyId);
      if (index !== -1) {
        parties.value[index] = response.party;
      }

      // Update current party if it's the same
      if (currentParty.value?.Party_ID === partyId) {
        currentParty.value = response.party;
      }

      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete party (soft delete)
   */
  const deleteParty = async (partyId: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/party/${partyId}`, 'DELETE');

      // Remove from parties array
      parties.value = parties.value.filter(p => p.Party_ID !== partyId);

      // Clear current party if it's the same
      if (currentParty.value?.Party_ID === partyId) {
        currentParty.value = null;
      }

      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Search parties with filters
   */
  const searchParties = async (filters: FilterOptions) => {
    return fetchAllParties(filters);
  };

  /**
   * Get parties by type
   */
  const getPartiesByType = (type: 'Customer' | 'Supplier' | 'Both') => {
    return parties.value.filter(p => p.Type === type || p.Type === 'Both');
  };

  /**
   * Get customers
   */
  const getCustomers = () => {
    return parties.value.filter(p => p.Type === 'Customer' || p.Type === 'Both');
  };

  /**
   * Get suppliers
   */
  const getSuppliers = () => {
    return parties.value.filter(p => p.Type === 'Supplier' || p.Type === 'Both');
  };

  /**
   * Get parties with outstanding balance
   */
  const getPartiesWithOutstandingBalance = () => {
    return parties.value.filter(p => p.Outstanding_Balance > 0);
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
    parties.value = [];
    currentParty.value = null;
    isLoading.value = false;
    error.value = null;
  };

  return {
    // State
    parties,
    currentParty,
    isLoading,
    error,

    // Computed
    partyCount,
    customerCount,
    supplierCount,
    totalOutstandingBalance,

    // Actions
    createParty,
    fetchAllParties,
    fetchPartyById,
    updateParty,
    deleteParty,
    searchParties,
    getPartiesByType,
    getCustomers,
    getSuppliers,
    getPartiesWithOutstandingBalance,
    clearError,
    reset,
  };
});