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

// API Service
const API_BASE_URL = '/api/transaction';

const transactionAPI = {
  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to create invoice');
    const data = await response.json();
    return data.invoice;
  },

  async createPurchaseBill(payload: CreateInvoicePayload): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/bill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to create purchase bill');
    const data = await response.json();
    return data.bill;
  },

  async getInvoiceById(transactionId: number): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/${transactionId}`);
    if (!response.ok) throw new Error('Failed to fetch invoice');
    return response.json();
  },

  async getAllInvoices(filters?: TransactionFilters): Promise<{ count: number; transactions: Invoice[] }> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.Party_ID) params.append('Party_ID', filters.Party_ID.toString());
      if (filters.Type) params.append('Type', filters.Type);
      if (filters.Status) params.append('Status', filters.Status);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  },

  async getGSTSummary(startDate?: string, endDate?: string): Promise<GSTSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/gst-summary?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch GST summary');
    return response.json();
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
      error.value = err instanceof Error ? err.message : 'Unknown error';
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
      error.value = err instanceof Error ? err.message : 'Unknown error';
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
      error.value = err instanceof Error ? err.message : 'Unknown error';
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
      error.value = err instanceof Error ? err.message : 'Unknown error';
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
      error.value = err instanceof Error ? err.message : 'Unknown error';
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
    setFilters,
    clearFilters,
    clearError,
    clearCurrentInvoice
  };
});