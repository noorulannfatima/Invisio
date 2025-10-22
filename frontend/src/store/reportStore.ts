// store/reportStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Report Types
interface SalesReportSummary {
  Total_Sales: number;
  Total_Transactions: number;
  Average_Transaction_Value: number;
  Total_Quantity_Sold: number;
}

interface DailyBreakdown {
  Date: string;
  Sales: number;
  Quantity: number;
  Transactions: number;
  Average_Transaction_Value: number;
}

interface SalesReport {
  Report_Type: string;
  Period: string;
  Summary: SalesReportSummary;
  Daily_Breakdown: DailyBreakdown[];
}

interface SupplierData {
  Supplier_ID: number;
  Supplier_Name: string;
  Supplier_Phone: string;
  Total_Purchase: number;
  Bill_Count: number;
  Average_Bill_Value: number;
  Bills: Bill[];
}

interface Bill {
  Transaction_ID: number;
  Date: string;
  Amount: number;
  Items_Count: number;
  Payment_Mode: string;
}

interface PurchaseReport {
  Report_Type: string;
  Summary: {
    Total_Purchases: number;
    Total_Bills: number;
    Supplier_Count: number;
    Average_Bill_Value: number;
  };
  Suppliers: SupplierData[];
}

interface GSTData {
  Outward_Supplies: number;
  Inward_Supplies?: number;
  Output_GST: number;
  Input_GST?: number;
  Net_GST_Liability?: number;
  Net_GST_Credit?: number;
}

interface GSTReport {
  Report_Type: string;
  Period: {
    Start_Date: string;
    End_Date: string;
  };
  GSTR_1_Data: GSTData;
  GSTR_3B_Data: GSTData;
  Total_Transactions: number;
}

interface ProfitLossReport {
  Report_Type: string;
  Period: {
    Start_Date: string;
    End_Date: string;
  };
  Income: {
    Total_Revenue: number;
    Sales_Count: number;
  };
  Expenses: {
    Cost_of_Goods_Sold: number;
    Purchase_Count: number;
    Operating_Expenses: number;
    Expense_Count: number;
  };
  Profit_Loss: {
    Gross_Profit: number;
    Net_Profit: number;
    Profit_Margin_Percentage: number;
  };
}

interface StockItem {
  Item_ID: number;
  Name: string;
  Unit: string;
  Current_Stock: number;
  Selling_Price: number;
  Inventory_Value: number;
  Status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface StockAlerts {
  Out_of_Stock_Count: number;
  Low_Stock_Count: number;
  Out_of_Stock_Items: { Item_ID: number; Name: string }[];
  Low_Stock_Items: { Item_ID: number; Name: string; Current_Stock: number; Unit: string }[];
}

interface StockSummaryReport {
  Report_Type: string;
  Summary: {
    Total_Items_Variety: number;
    Total_Stock_Units: number;
    Total_Inventory_Value: number;
    Low_Stock_Threshold: number;
  };
  Alerts: StockAlerts;
  Items: StockItem[];
}

interface PartyTransaction {
  Transaction_ID: number;
  Date: string;
  Type: 'Sale' | 'Purchase';
  Amount: number;
  Payment_Mode: string;
}

interface PartyExpense {
  Expense_ID: number;
  Date: string;
  Category: string;
  Amount: number;
}

interface PartyLedgerReport {
  Report_Type: string;
  Party: {
    Party_ID: number;
    Name: string;
    Type: string;
    Email: string;
    Mobile_Number: string;
    GST_Number: string;
  };
  Summary: {
    Total_Purchases: number;
    Total_Sales: number;
    Total_Expenses: number;
    Net_Balance: number;
    Balance_Status: 'Party Owes' | 'You Owe' | 'Settled';
  };
  Transactions: PartyTransaction[];
  Expenses: PartyExpense[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'custom';
  partyId?: number;
  supplierId?: number;
  lowStockThreshold?: number;
}

interface ReportState {
  salesReport: SalesReport | null;
  purchaseReport: PurchaseReport | null;
  gstReport: GSTReport | null;
  profitLossReport: ProfitLossReport | null;
  stockSummaryReport: StockSummaryReport | null;
  partyLedgerReport: PartyLedgerReport | null;
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:3000/api';

export const useReportStore = defineStore('report', () => {
  // State
  const salesReport = ref<SalesReport | null>(null);
  const purchaseReport = ref<PurchaseReport | null>(null);
  const gstReport = ref<GSTReport | null>(null);
  const profitLossReport = ref<ProfitLossReport | null>(null);
  const stockSummaryReport = ref<StockSummaryReport | null>(null);
  const partyLedgerReport = ref<PartyLedgerReport | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const hasError = computed(() => !!error.value);
  const currentReport = computed(() => {
    if (salesReport.value) return salesReport.value;
    if (purchaseReport.value) return purchaseReport.value;
    if (gstReport.value) return gstReport.value;
    if (profitLossReport.value) return profitLossReport.value;
    if (stockSummaryReport.value) return stockSummaryReport.value;
    if (partyLedgerReport.value) return partyLedgerReport.value;
    return null;
  });

  // Helper function for API calls
  const apiCall = async (endpoint: string, params?: Record<string, any>) => {
    try {
      let url = `${API_BASE_URL}${endpoint}`;
      
      if (params) {
        const queryString = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryString.append(key, String(value));
          }
        });
        if (queryString.toString()) {
          url += `?${queryString.toString()}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch report');
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      error.value = errorMsg;
      throw err;
    }
  };

  // Actions
  const fetchSalesReport = async (filters: ReportFilters) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/reports/sales', {
        period: filters.period || 'custom',
        startDate: filters.startDate,
        endDate: filters.endDate,
        partyId: filters.partyId,
      });
      salesReport.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPurchaseReport = async (filters: ReportFilters) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/reports/purchase', {
        startDate: filters.startDate,
        endDate: filters.endDate,
        supplierId: filters.supplierId,
      });
      purchaseReport.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchGSTReport = async (filters: ReportFilters) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/reports/gst', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      gstReport.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProfitLossReport = async (filters: ReportFilters) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/reports/profit-loss', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      profitLossReport.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchStockSummaryReport = async (filters: ReportFilters) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/reports/stock-summary', {
        lowStockThreshold: filters.lowStockThreshold || 10,
      });
      stockSummaryReport.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPartyLedgerReport = async (filters: ReportFilters) => {
    isLoading.value = true;
    error.value = null;

    if (!filters.partyId) {
      error.value = 'Party ID is required for ledger report';
      isLoading.value = false;
      throw new Error('Party ID is required');
    }

    try {
      const response = await apiCall('/reports/party-ledger', {
        partyId: filters.partyId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      partyLedgerReport.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  // Clear individual reports
  const clearSalesReport = () => {
    salesReport.value = null;
  };

  const clearPurchaseReport = () => {
    purchaseReport.value = null;
  };

  const clearGSTReport = () => {
    gstReport.value = null;
  };

  const clearProfitLossReport = () => {
    profitLossReport.value = null;
  };

  const clearStockSummaryReport = () => {
    stockSummaryReport.value = null;
  };

  const clearPartyLedgerReport = () => {
    partyLedgerReport.value = null;
  };

  // Clear all reports
  const clearAllReports = () => {
    salesReport.value = null;
    purchaseReport.value = null;
    gstReport.value = null;
    profitLossReport.value = null;
    stockSummaryReport.value = null;
    partyLedgerReport.value = null;
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    salesReport,
    purchaseReport,
    gstReport,
    profitLossReport,
    stockSummaryReport,
    partyLedgerReport,
    isLoading,
    error,

    // Computed
    hasError,
    currentReport,

    // Actions
    fetchSalesReport,
    fetchPurchaseReport,
    fetchGSTReport,
    fetchProfitLossReport,
    fetchStockSummaryReport,
    fetchPartyLedgerReport,
    clearSalesReport,
    clearPurchaseReport,
    clearGSTReport,
    clearProfitLossReport,
    clearStockSummaryReport,
    clearPartyLedgerReport,
    clearAllReports,
    clearError,
  };
});