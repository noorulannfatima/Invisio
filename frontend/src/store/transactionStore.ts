import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Types
export interface LineItem {
  Item_ID: number;
  Item_Name: string;
  Quantity: number;
  Rate: number;
  Discount: number;
  Line_Total: number;
}

export interface TransactionLineItem extends LineItem {
  Line_ID: number;
}

export interface Party {
  Party_ID: number;
  Name: string;
  Type: 'Customer' | 'Supplier' | 'Both';
  Email?: string;
  Mobile_Number?: string;
  Address?: string;
  GST_Number?: string;
}

export interface Invoice {
  Transaction_ID: number;
  Company_ID: number;
  Party_ID: number;
  Party_Name: string;
  Date: string;
  Type: 'Sale' | 'Purchase' | 'Estimate';
  Status: 'Pending' | 'Completed' | 'Cancelled';
  Payment_Mode?: string;
  Subtotal: number;
  GST_Rate: number;
  Tax_Amount: number;
  Total_Amount: number;
  Line_Items: TransactionLineItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GSTSummary {
  Period: {
    Start_Date: string;
    End_Date: string;
  };
  Outward_Supplies: number;
  Inward_Supplies: number;
  Output_GST: number;
  Input_GST: number;
  Net_GST_Liability: number;
  Net_GST_Credit: number;
  Total_Transactions: number;
}

export interface CreateInvoicePayload {
  Party_ID: number;
  Date?: string;
  Payment_Mode?: string;
  Line_Items: LineItem[];
  GST_Rate: number;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  Party_ID?: number;
  Type?: 'Sale' | 'Purchase' | 'Estimate';
  Status?: 'Pending' | 'Completed' | 'Cancelled';
  sortBy?: 'date-newest' | 'date-oldest' | 'amount-high' | 'amount-low';
}

// API Service with proper error handling
const API_BASE_URL = 'http://localhost:3000/api/transaction';

const transactionAPI = {
  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    try {
      const response = await fetch(`${API_BASE_URL}/invoice`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}). Check if API endpoint exists.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data.invoice;
    } catch (error) {
      console.error('createInvoice API error:', error);
      throw error;
    }
  },

  async createPurchaseBill(payload: CreateInvoicePayload): Promise<Invoice> {
    try {
      const response = await fetch(`${API_BASE_URL}/bill`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}). Check if API endpoint exists.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data.bill;
    } catch (error) {
      console.error('createPurchaseBill API error:', error);
      throw error;
    }
  },

  async getInvoiceById(transactionId: number): Promise<Invoice> {
    try {
      const response = await fetch(`${API_BASE_URL}/${transactionId}`, {
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}). Check if API endpoint exists.`);
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch invoice');
      }

      return response.json();
    } catch (error) {
      console.error('getInvoiceById API error:', error);
      throw error;
    }
  },

  async getAllInvoices(filters?: TransactionFilters): Promise<{ count: number; transactions: Invoice[] }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.Party_ID) params.append('Party_ID', filters.Party_ID.toString());
        if (filters.Type) params.append('Type', filters.Type);
        if (filters.Status) params.append('Status', filters.Status);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
      }

      const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}). Check if API endpoint exists at ${url}`);
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch invoices');
      }

      return response.json();
    } catch (error) {
      console.error('getAllInvoices API error:', error);
      throw error;
    }
  },

  async getGSTSummary(startDate?: string, endDate?: string): Promise<GSTSummary> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${API_BASE_URL}/gst-summary${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}). Check if API endpoint exists.`);
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch GST summary');
      }

      return response.json();
    } catch (error) {
      console.error('getGSTSummary API error:', error);
      throw error;
    }
  },

  async deleteTransaction(transactionId: number): Promise<{ message: string; deleted: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/${transactionId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}). Check if API endpoint exists.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('deleteTransaction API error:', error);
      throw error;
    }
  },

  async updateTransactionStatus(transactionId: number, status: string): Promise<{ message: string; transaction: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/${transactionId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ Status: status })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}). Check if API endpoint exists.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('updateTransactionStatus API error:', error);
      throw error;
    }
  }
};

// Pinia Store
export const useTransactionStore = defineStore('transaction', () => {
  // State
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);
  const gstSummary = ref<GSTSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<TransactionFilters>({});

  // Computed
  const totalInvoices = computed(() => invoices.value.length);

  const salesInvoices = computed(() => 
    invoices.value.filter(inv => inv.Type === 'Sale')
  );

  const purchaseInvoices = computed(() => 
    invoices.value.filter(inv => inv.Type === 'Purchase')
  );

  const completedInvoices = computed(() => 
    invoices.value.filter(inv => inv.Status === 'Completed')
  );

  const pendingInvoices = computed(() => 
    invoices.value.filter(inv => inv.Status === 'Pending')
  );

  const totalSalesAmount = computed(() => 
    salesInvoices.value.reduce((sum, inv) => sum + inv.Total_Amount, 0)
  );

  const totalPurchaseAmount = computed(() => 
    purchaseInvoices.value.reduce((sum, inv) => sum + inv.Total_Amount, 0)
  );

  // Actions
  const createInvoice = async (payload: CreateInvoicePayload): Promise<Invoice> => {
    loading.value = true;
    error.value = null;
    try {
      const invoice = await transactionAPI.createInvoice(payload);
      invoices.value.unshift(invoice);
      return invoice;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      error.value = errorMsg;
      console.error('Store createInvoice error:', errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPurchaseBill = async (payload: CreateInvoicePayload): Promise<Invoice> => {
    loading.value = true;
    error.value = null;
    try {
      const bill = await transactionAPI.createPurchaseBill(payload);
      invoices.value.unshift(bill);
      return bill;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      error.value = errorMsg;
      console.error('Store createPurchaseBill error:', errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchInvoiceById = async (transactionId: number): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      currentInvoice.value = await transactionAPI.getInvoiceById(transactionId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      error.value = errorMsg;
      console.error('Store fetchInvoiceById error:', errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAllInvoices = async (newFilters?: TransactionFilters): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      if (newFilters) {
        filters.value = newFilters;
      }
      const data = await transactionAPI.getAllInvoices(filters.value);
      invoices.value = data.transactions;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      error.value = errorMsg;
      console.error('Store fetchAllInvoices error:', errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchGSTSummary = async (startDate?: string, endDate?: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      gstSummary.value = await transactionAPI.getGSTSummary(startDate, endDate);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      error.value = errorMsg;
      console.error('Store fetchGSTSummary error:', errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Soft delete a transaction (marks as deleted, reverses stock)
   * @param transactionId - The ID of the transaction to delete
   * @returns Promise that resolves when deletion is complete
   */
  const deleteTransaction = async (transactionId: number): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const result = await transactionAPI.deleteTransaction(transactionId);
      
      // Remove from local state
      invoices.value = invoices.value.filter(inv => inv.Transaction_ID !== transactionId);
      
      // Clear current invoice if it was deleted
      if (currentInvoice.value?.Transaction_ID === transactionId) {
        currentInvoice.value = null;
      }
      
      console.log('Transaction deleted successfully:', result.message);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      error.value = errorMsg;
      console.error('Store deleteTransaction error:', errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTransactionStatus = async (transactionId: number, status: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const result = await transactionAPI.updateTransactionStatus(transactionId, status);
      
      // Update local state
      const invoice = invoices.value.find(inv => inv.Transaction_ID === transactionId);
      if (invoice) {
        invoice.Status = result.transaction.Status;
      }
      
      if (currentInvoice.value?.Transaction_ID === transactionId) {
        currentInvoice.value.Status = result.transaction.Status;
      }
      
      console.log('Transaction status updated successfully:', result.message);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      error.value = errorMsg;
      console.error('Store updateTransactionStatus error:', errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setFilters = (newFilters: TransactionFilters): void => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const clearFilters = (): void => {
    filters.value = {};
  };

  const clearError = (): void => {
    error.value = null;
  };

  const clearCurrentInvoice = (): void => {
    currentInvoice.value = null;
  };

  return {
    // State
    invoices,
    currentInvoice,
    gstSummary,
    loading,
    error,
    filters,

    // Computed
    totalInvoices,
    salesInvoices,
    purchaseInvoices,
    completedInvoices,
    pendingInvoices,
    totalSalesAmount,
    totalPurchaseAmount,

    // Actions
    createInvoice,
    createPurchaseBill,
    fetchInvoiceById,
    fetchAllInvoices,
    fetchGSTSummary,
    deleteTransaction,
    updateTransactionStatus,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentInvoice
  };
});