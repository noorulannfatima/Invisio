import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Vendor {
  Party_ID: number;
  Name: string;
  Mobile?: string;
}

export interface Expense {
  Expense_ID: number;
  Company_ID: number;
  Party_ID: number | null;
  Date: string;
  Category: string;
  Amount: number;
  Description: string | null;
  Payment_Mode: string | null;
  Vendor?: Vendor | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseReport {
  Report_Period: {
    Year: number;
    Month: number;
    Month_Name: string;
    Start_Date: string;
    End_Date: string;
  };
  Summary: {
    Total_Expenses: number;
    Expense_Count: number;
    Category_Count: number;
  };
  Category_Breakdown: CategoryBreakdown[];
  Top_Categories: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  Category: string;
  Amount: number;
  Percentage: number;
}

export interface CategoryData {
  Category: string;
  Total: number;
  Count: number;
  Average: number;
}

interface FilterOptions {
  startDate?: string;
  endDate?: string;
  Category?: string;
  Party_ID?: number;
  Payment_Mode?: string;
  sortBy?: 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'category';
}

const API_BASE_URL = 'http://localhost:3000/api';

export const useExpenseStore = defineStore('expense', () => {
  // State
  const expenses = ref<Expense[]>([]);
  const currentExpense = ref<Expense | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const expenseReport = ref<ExpenseReport | null>(null);
  const categoryData = ref<CategoryData[]>([]);

  // Computed
  const expenseCount = computed(() => expenses.value.length);
  const totalExpenses = computed(() =>
    expenses.value.reduce((sum, exp) => sum + exp.Amount, 0)
  );
  const averageExpense = computed(() =>
    expenseCount.value > 0 ? totalExpenses.value / expenseCount.value : 0
  );
  const expensesByCategory = computed(() => {
    const grouped: { [key: string]: number } = {};
    expenses.value.forEach(exp => {
      if (!grouped[exp.Category]) {
        grouped[exp.Category] = 0;
      }
      grouped[exp.Category] += exp.Amount;
    });
    return grouped;
  });
  const highestExpense = computed(() => {
    if (expenses.value.length === 0) return null;
    return expenses.value.reduce((max, exp) => 
      exp.Amount > max.Amount ? exp : max
    );
  });
  const lowestExpense = computed(() => {
    if (expenses.value.length === 0) return null;
    return expenses.value.reduce((min, exp) => 
      exp.Amount < min.Amount ? exp : min
    );
  });

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
   * Create a new expense
   */
  const createExpense = async (expenseData: {
    Date?: string;
    Category: string;
    Amount: number;
    Description?: string;
    Payment_Mode?: string;
    Party_ID?: number;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/expense/create', 'POST', expenseData);
      
      // Map response fields to match Expense interface
      const mappedVendor: Vendor | null = response.expense.Vendor ? {
        Party_ID: response.expense.Vendor.Party_ID,
        Name: response.expense.Vendor.Name,
        Mobile: response.expense.Vendor.Mobile
      } : null;

      const expense: Expense = {
        Expense_ID: response.expense.Expense_ID,
        Company_ID: response.expense.Company_ID,
        Party_ID: response.expense.Party_ID,
        Date: response.expense.Date || response.expense.Expense_Date,
        Category: response.expense.Category,
        Amount: response.expense.Amount,
        Description: response.expense.Description,
        Payment_Mode: response.expense.Payment_Mode,
        Vendor: mappedVendor,
        createdAt: response.expense.createdAt
      };
      
      expenses.value.push(expense);
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch all expenses with optional filters
   */
  const fetchAllExpenses = async (filters?: FilterOptions) => {
    isLoading.value = true;
    error.value = null;

    try {
      let endpoint = '/expense';

      if (filters) {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.Category) params.append('Category', filters.Category);
        if (filters.Party_ID) params.append('Party_ID', filters.Party_ID.toString());
        if (filters.Payment_Mode) params.append('Payment_Mode', filters.Payment_Mode);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
      }

      const response = await apiCall(endpoint, 'GET');
      
      // Map response expenses to match Expense interface
      expenses.value = (response.expenses || []).map((exp: any) => {
        const mappedVendor: Vendor | null = exp.Vendor ? {
          Party_ID: exp.Vendor.Party_ID,
          Name: exp.Vendor.Name,
          Mobile: exp.Vendor.Mobile
        } : null;

        return {
          Expense_ID: exp.Expense_ID,
          Company_ID: exp.Company_ID,
          Party_ID: exp.Party_ID,
          Date: exp.Date || exp.Expense_Date,
          Category: exp.Category,
          Amount: exp.Amount,
          Description: exp.Description,
          Payment_Mode: exp.Payment_Mode,
          Vendor: mappedVendor,
          createdAt: exp.createdAt
        };
      });
      
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch single expense by ID
   */
  const fetchExpenseById = async (expenseId: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/expense/${expenseId}`, 'GET');
      
      // Map response to Expense interface
      const mappedVendor: Vendor | null = response.Vendor ? {
        Party_ID: response.Vendor.Party_ID,
        Name: response.Vendor.Name,
        Mobile: response.Vendor.Mobile
      } : null;

      currentExpense.value = {
        Expense_ID: response.Expense_ID,
        Company_ID: response.Company_ID,
        Party_ID: response.Party_ID,
        Date: response.Date || response.Expense_Date,
        Category: response.Category,
        Amount: response.Amount,
        Description: response.Description,
        Payment_Mode: response.Payment_Mode,
        Vendor: mappedVendor,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      };
      
      return currentExpense.value;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get expense report by month
   */
  const getExpenseReport = async (year?: number, month?: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      let endpoint = '/expense/report';
      const params = new URLSearchParams();

      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await apiCall(endpoint, 'GET');
      expenseReport.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get expenses by category with optional date range
   */
  const getExpensesByCategory = async (startDate?: string, endDate?: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      let endpoint = '/expense/by-category';
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await apiCall(endpoint, 'GET');
      categoryData.value = response.Categories || [];
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Assign expense to vendor (Party)
   */
  const assignExpenseToVendor = async (expenseId: number, partyId: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(
        `/expense/${expenseId}/assign-vendor`,
        'POST',
        { Party_ID: partyId }
      );

      // Map and update in expenses array
      const mappedVendor: Vendor | null = response.expense.Vendor ? {
        Party_ID: response.expense.Vendor.Party_ID,
        Name: response.expense.Vendor.Name,
        Mobile: response.expense.Vendor.Mobile
      } : null;

      const mappedExpense: Expense = {
        Expense_ID: response.expense.Expense_ID,
        Company_ID: response.expense.Company_ID,
        Party_ID: response.expense.Party_ID,
        Date: response.expense.Date || response.expense.Expense_Date,
        Category: response.expense.Category,
        Amount: response.expense.Amount,
        Description: response.expense.Description,
        Payment_Mode: response.expense.Payment_Mode,
        Vendor: mappedVendor
      };

      const index = expenses.value.findIndex(exp => exp.Expense_ID === expenseId);
      if (index !== -1) {
        expenses.value[index] = mappedExpense;
      }

      if (currentExpense.value?.Expense_ID === expenseId) {
        currentExpense.value = mappedExpense;
      }

      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update expense details
   */
  const updateExpense = async (
    expenseId: number,
    expenseData: {
      Date?: string;
      Category?: string;
      Amount?: number;
      Description?: string | null;
      Payment_Mode?: string | null;
      Party_ID?: number | null;
    }
  ) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(
        `/expense/${expenseId}`,
        'PUT',
        expenseData
      );

      // Map and update in expenses array
      const mappedVendor: Vendor | null = response.expense.Vendor ? {
        Party_ID: response.expense.Vendor.Party_ID,
        Name: response.expense.Vendor.Name,
        Mobile: response.expense.Vendor.Mobile
      } : null;

      const mappedExpense: Expense = {
        Expense_ID: response.expense.Expense_ID,
        Company_ID: response.expense.Company_ID,
        Party_ID: response.expense.Party_ID,
        Date: response.expense.Date || response.expense.Expense_Date,
        Category: response.expense.Category,
        Amount: response.expense.Amount,
        Description: response.expense.Description,
        Payment_Mode: response.expense.Payment_Mode,
        Vendor: mappedVendor
      };

      const index = expenses.value.findIndex(exp => exp.Expense_ID === expenseId);
      if (index !== -1) {
        expenses.value[index] = mappedExpense;
      }

      if (currentExpense.value?.Expense_ID === expenseId) {
        currentExpense.value = mappedExpense;
      }

      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete expense (soft delete)
   */
  const deleteExpense = async (expenseId: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/expense/${expenseId}`, 'DELETE');

      expenses.value = expenses.value.filter(exp => exp.Expense_ID !== expenseId);

      if (currentExpense.value?.Expense_ID === expenseId) {
        currentExpense.value = null;
      }

      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Search expenses with filters
   */
  const searchExpenses = async (filters: FilterOptions) => {
    return fetchAllExpenses(filters);
  };

  /**
   * Get expenses for a specific vendor
   */
  const getExpensesByVendor = (vendorId: number) => {
    return expenses.value.filter(exp => exp.Party_ID === vendorId);
  };

  /**
   * Get expenses within date range
   */
  const getExpensesByDateRange = (startDate: string, endDate: string) => {
    return expenses.value.filter(
      exp => exp.Date >= startDate && exp.Date <= endDate
    );
  };

  /**
   * Get expenses by payment mode
   */
  const getExpensesByPaymentMode = (paymentMode: string) => {
    return expenses.value.filter(exp => exp.Payment_Mode === paymentMode);
  };

  /**
   * Get expenses above a certain amount
   */
  const getExpensesAboveAmount = (amount: number) => {
    return expenses.value.filter(exp => exp.Amount > amount);
  };

  /**
   * Get expenses below a certain amount
   */
  const getExpensesBelowAmount = (amount: number) => {
    return expenses.value.filter(exp => exp.Amount < amount);
  };

  /**
   * Clear current expense
   */
  const clearCurrentExpense = () => {
    currentExpense.value = null;
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
    expenses.value = [];
    currentExpense.value = null;
    expenseReport.value = null;
    categoryData.value = [];
    isLoading.value = false;
    error.value = null;
  };

  return {
    // State
    expenses,
    currentExpense,
    isLoading,
    error,
    expenseReport,
    categoryData,

    // Computed
    expenseCount,
    totalExpenses,
    averageExpense,
    expensesByCategory,
    highestExpense,
    lowestExpense,

    // Actions
    createExpense,
    fetchAllExpenses,
    fetchExpenseById,
    getExpenseReport,
    getExpensesByCategory,
    assignExpenseToVendor,
    updateExpense,
    deleteExpense,
    searchExpenses,
    getExpensesByVendor,
    getExpensesByDateRange,
    getExpensesByPaymentMode,
    getExpensesAboveAmount,
    getExpensesBelowAmount,
    clearCurrentExpense,
    clearError,
    reset,
  };
});