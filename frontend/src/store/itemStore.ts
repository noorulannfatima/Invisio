// store/itemStore.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Item {
  Item_ID: number;
  Company_ID: number;
  Name: string;
  Unit: string;
  Description: string | null;
  Selling_Price: number;
  Purchase_Price: number;
  Current_Stock: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ItemValuation {
  Item_ID: number;
  Name: string;
  Unit: string;
  Current_Stock: number;
  Purchase_Price: number;
  Selling_Price: number;
  Inventory_Value: number;
  Purchase_Value: number;
  Profit: number;
}

interface LowStockItem {
  Item_ID: number;
  Name: string;
  Current_Stock: number;
  Unit: string;
}

interface OutOfStockItem {
  Item_ID: number;
  Name: string;
  Unit: string;
}

interface InventoryValuationSummary {
  Summary: {
    Total_Items: number;
    Total_Inventory_Value: number;
    Total_Purchase_Value: number;
    Total_Profit: number;
  };
  Warnings: {
    Low_Stock_Threshold: number;
    Low_Stock_Items: LowStockItem[];
    Out_Of_Stock_Items: OutOfStockItem[];
    Total_Low_Stock: number;
    Total_Out_Of_Stock: number;
  };
  Items: ItemValuation[];
}

interface StockAdjustment {
  Item_ID: number;
  Item_Name: string;
  Reason: string;
  Notes: string | null;
  Previous_Stock: number;
  Adjusted_Quantity: number;
  New_Stock: number;
  Timestamp: string;
}

interface FilterOptions {
  stockFilter?: 'low' | 'out' | 'in';
  search?: string;
  sortBy?: 'name' | 'price-high' | 'price-low' | 'stock-low' | 'stock-high';
}

const API_BASE_URL = 'http://localhost:3000/api';

export const useItemStore = defineStore('item', () => {
  // State
  const items = ref<Item[]>([]);
  const currentItem = ref<Item | null>(null);
  const inventoryValuation = ref<InventoryValuationSummary | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const itemCount = computed(() => items.value.length);
  const lowStockItems = computed(() =>
    items.value.filter((item) => item.Current_Stock < 10 && item.Current_Stock > 0)
  );
  const outOfStockItems = computed(() =>
    items.value.filter((item) => item.Current_Stock === 0)
  );
  const totalInventoryValue = computed(
    () => inventoryValuation.value?.Summary.Total_Inventory_Value || 0
  );
  const totalProfit = computed(() => inventoryValuation.value?.Summary.Total_Profit || 0);

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
   * Create a new item
   */
  const createItem = async (itemData: {
    Name: string;
    Unit: string;
    Selling_Price: number;
    Purchase_Price: number;
    Description?: string;
    Current_Stock?: number;
    GST_Rate?: number;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall('/item/create', 'POST', itemData);
      items.value.push(response.item);
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch all items with optional filters
   */
  const fetchAllItems = async (filters?: FilterOptions) => {
    isLoading.value = true;
    error.value = null;

    try {
      let endpoint = '/item';

      if (filters) {
        const params = new URLSearchParams();
        if (filters.stockFilter) params.append('stockFilter', filters.stockFilter);
        if (filters.search) params.append('search', filters.search);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
      }

      const response = await apiCall(endpoint, 'GET');
      items.value = response.items || [];
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch single item by ID
   */
  const fetchItemById = async (itemId: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/item/${itemId}`, 'GET');
      currentItem.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update item details
   */
  const updateItem = async (
    itemId: number,
    itemData: {
      Name?: string;
      Unit?: string;
      Description?: string;
      Selling_Price?: number;
      Purchase_Price?: number;
    }
  ) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/item/${itemId}`, 'PUT', itemData);

      // Update in items array
      const index = items.value.findIndex((item) => item.Item_ID === itemId);
      if (index !== -1) {
        items.value[index] = response.item;
      }

      // Update current item if it's the same
      if (currentItem.value?.Item_ID === itemId) {
        currentItem.value = response.item;
      }

      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Adjust stock for an item
   */
  const adjustStock = async (
    itemId: number,
    adjustmentData: {
      quantity: number;
      reason: string;
      notes?: string;
    }
  ): Promise<StockAdjustment> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/item/${itemId}/adjust-stock`, 'POST', adjustmentData);

      // Update stock in items array
      const itemIndex = items.value.findIndex((item) => item.Item_ID === itemId);
      if (itemIndex !== -1) {
        items.value[itemIndex].Current_Stock = response.adjustment.New_Stock;
      }

      // Update current item if it's the same
      if (currentItem.value?.Item_ID === itemId) {
        currentItem.value.Current_Stock = response.adjustment.New_Stock;
      }

      return response.adjustment;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch inventory valuation summary
   */
  const fetchInventoryValuation = async (lowStockThreshold?: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      let endpoint = '/item/valuation';

      if (lowStockThreshold) {
        endpoint += `?lowStockThreshold=${lowStockThreshold}`;
      }

      const response = await apiCall(endpoint, 'GET');
      inventoryValuation.value = response;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete item (soft delete)
   */
  const deleteItem = async (itemId: number) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiCall(`/item/${itemId}`, 'DELETE');

      // Remove from items array
      items.value = items.value.filter((item) => item.Item_ID !== itemId);

      // Clear current item if it's the same
      if (currentItem.value?.Item_ID === itemId) {
        currentItem.value = null;
      }

      return response;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Search items with filters
   */
  const searchItems = async (filters: FilterOptions) => {
    return fetchAllItems(filters);
  };

  /**
   * Get low stock items
   */
  const getLowStockItems = () => {
    return lowStockItems.value;
  };

  /**
   * Get out of stock items
   */
  const getOutOfStockItems = () => {
    return outOfStockItems.value;
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
    items.value = [];
    currentItem.value = null;
    inventoryValuation.value = null;
    isLoading.value = false;
    error.value = null;
  };

  return {
    // State
    items,
    currentItem,
    inventoryValuation,
    isLoading,
    error,

    // Computed
    itemCount,
    lowStockItems,
    outOfStockItems,
    totalInventoryValue,
    totalProfit,

    // Actions
    createItem,
    fetchAllItems,
    fetchItemById,
    updateItem,
    adjustStock,
    fetchInventoryValuation,
    deleteItem,
    searchItems,
    getLowStockItems,
    getOutOfStockItems,
    clearError,
    reset,
  };
});