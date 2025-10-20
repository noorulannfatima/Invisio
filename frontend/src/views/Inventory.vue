<template>
  <div class="inventory">
    <!-- Page Header -->
    <div class="inventory-header">
      <div class="header-content">
        <h1 class="page-title">Inventory Management</h1>
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i class="fas fa-plus"></i>
          Add New Item
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-icon total"><i class="fas fa-box"></i></span>
        <div class="stat-content">
          <span class="stat-label">Total Items</span>
          <span class="stat-value">{{ itemStore.itemCount }}</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon value"><i class="fas fa-dollar-sign"></i></span>
        <div class="stat-content">
          <span class="stat-label">Inventory Value</span>
          <span class="stat-value">${{ formatCurrency(itemStore.totalInventoryValue) }}</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon profit"><i class="fas fa-chart-line"></i></span>
        <div class="stat-content">
          <span class="stat-label">Total Profit</span>
          <span class="stat-value">{{ formatCurrency(itemStore.totalProfit) }}</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon warning"><i class="fas fa-exclamation-triangle"></i></span>
        <div class="stat-content">
          <span class="stat-label">Low Stock</span>
          <span class="stat-value">{{ itemStore.lowStockItems.length }}</span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search items..."
          @input="handleSearch"
        />
      </div>

      <div class="filter-controls">
        <select v-model="selectedFilter" @change="handleFilter" class="filter-select">
          <option value="">All Items</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <select v-model="selectedSort" @change="handleSort" class="filter-select">
          <option value="">Sort By</option>
          <option value="name">Name (A-Z)</option>
          <option value="price-high">Price (High)</option>
          <option value="price-low">Price (Low)</option>
          <option value="stock-low">Stock (Low)</option>
          <option value="stock-high">Stock (High)</option>
        </select>

        <button class="btn-refresh" @click="refreshItems" :disabled="itemStore.isLoading">
          <i class="fas fa-sync" :class="{ 'spin': itemStore.isLoading }"></i>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="itemStore.error" class="error-alert">
      <i class="fas fa-exclamation-circle"></i>
      {{ itemStore.error }}
      <button class="btn-close" @click="itemStore.clearError">×</button>
    </div>

    <!-- Loading State -->
    <div v-if="itemStore.isLoading && itemStore.items.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Loading inventory...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="itemStore.items.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <h3>No Items Found</h3>
      <p>Start by adding your first item to the inventory.</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <i class="fas fa-plus"></i>
        Add Item
      </button>
    </div>

    <!-- Items Table -->
    <div v-else class="table-container">
      <table class="items-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Unit</th>
            <th class="text-right">Stock</th>
            <th class="text-right">Purchase Price</th>
            <th class="text-right">Selling Price</th>
            <th class="text-center">Status</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in itemStore.items" :key="item.Item_ID" class="table-row">
            <td class="item-name">
              <div class="name-cell">
                <span class="name">{{ item.Name }}</span>
                <span v-if="item.Description" class="description">{{ item.Description }}</span>
              </div>
            </td>
            <td class="text-center">{{ item.Unit }}</td>
            <td class="text-right">
              <span class="stock-badge" :class="getStockClass(item.Current_Stock)">
                {{ item.Current_Stock }}
              </span>
            </td>
            <td class="text-right">${{ formatCurrency(item.Purchase_Price) }}</td>
            <td class="text-right">${{ formatCurrency(item.Selling_Price) }}</td>
            <td class="text-center">
              <span :class="['status-badge', getStatusClass(item.Current_Stock)]">
                {{ getStatusText(item.Current_Stock) }}
              </span>
            </td>
            <td class="text-center actions-cell">
              <button
                class="btn-action view"
                @click="openItemDetails(item)"
                title="View Details"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button
                class="btn-action edit"
                @click="openEditModal(item)"
                title="Edit"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn-action adjust"
                @click="openAdjustStockModal(item)"
                title="Adjust Stock"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
              <button
                class="btn-action delete"
                @click="confirmDelete(item)"
                title="Delete"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Item Details Modal -->
    <ItemDetailsModal
      v-if="showDetailsModal && selectedItem"
      :item="selectedItem"
      @close="showDetailsModal = false"
    />

    <!-- Create Item Modal -->
    <CreateItemModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @success="onItemCreated"
    />

    <!-- Edit Item Modal -->
    <EditItemModal
      v-if="showEditModal && selectedItem"
      :item="selectedItem"
      @close="showEditModal = false"
      @success="onItemUpdated"
    />

    <!-- Adjust Stock Modal -->
    <AdjustStockModal
      v-if="showAdjustStockModal && selectedItem"
      :item="selectedItem"
      @close="showAdjustStockModal = false"
      @success="onStockAdjusted"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showDeleteConfirm && selectedItem"
      :item-name="selectedItem.Name"
      @confirm="deleteItem"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useItemStore } from '@/store/itemStore';
import ItemDetailsModal from '@/components/Inventory/ItemDetailsModal.vue';
import CreateItemModal from '@/components/Inventory/CreateItemModal.vue';
import EditItemModal from '@/components/Inventory/EditItemModal.vue';
import AdjustStockModal from '@/components/Inventory/AdjustStockModal.vue';
import ConfirmDeleteModal from '@/components/Common/ConfirmDeleteModal.vue';
import type { Item } from '@/store/itemStore';

const itemStore = useItemStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const showAdjustStockModal = ref(false);
const showDeleteConfirm = ref(false);

const selectedItem = ref<Item | null>(null);
const searchQuery = ref('');
const selectedFilter = ref('');
const selectedSort = ref('');

onMounted(async () => {
  await loadItems();
});

const loadItems = async () => {
  try {
    await itemStore.fetchAllItems();
  } catch (err) {
    console.error('Failed to load items:', err);
  }
};

const refreshItems = async () => {
  await loadItems();
};

const handleSearch = async () => {
  if (searchQuery.value.length > 0) {
    try {
      await itemStore.searchItems({
        search: searchQuery.value,
        stockFilter: selectedFilter.value as 'low' | 'out' | 'in' | undefined,
        sortBy: selectedSort.value as any,
      });
    } catch (err) {
      console.error('Search failed:', err);
    }
  } else {
    await loadItems();
  }
};

const handleFilter = async () => {
  try {
    await itemStore.searchItems({
      search: searchQuery.value || undefined,
      stockFilter: selectedFilter.value as 'low' | 'out' | 'in' | undefined,
      sortBy: selectedSort.value as any,
    });
  } catch (err) {
    console.error('Filter failed:', err);
  }
};

const handleSort = async () => {
  try {
    await itemStore.searchItems({
      search: searchQuery.value || undefined,
      stockFilter: selectedFilter.value as 'low' | 'out' | 'in' | undefined,
      sortBy: selectedSort.value as any,
    });
  } catch (err) {
    console.error('Sort failed:', err);
  }
};

const openItemDetails = (item: Item) => {
  selectedItem.value = item;
  showDetailsModal.value = true;
};

const openEditModal = (item: Item) => {
  selectedItem.value = item;
  showEditModal.value = true;
};

const openAdjustStockModal = (item: Item) => {
  selectedItem.value = item;
  showAdjustStockModal.value = true;
};

const confirmDelete = (item: Item) => {
  selectedItem.value = item;
  showDeleteConfirm.value = true;
};

const deleteItem = async () => {
  if (!selectedItem.value) return;

  try {
    await itemStore.deleteItem(selectedItem.value.Item_ID);
    showDeleteConfirm.value = false;
    selectedItem.value = null;
  } catch (err) {
    console.error('Delete failed:', err);
  }
};

const onItemCreated = () => {
  showCreateModal.value = false;
  refreshItems();
};

const onItemUpdated = () => {
  showEditModal.value = false;
  refreshItems();
};

const onStockAdjusted = () => {
  showAdjustStockModal.value = false;
  refreshItems();
};

const getStockClass = (stock: number): string => {
  if (stock === 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
};

const getStatusClass = (stock: number): string => {
  if (stock === 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'available';
};

const getStatusText = (stock: number): string => {
  if (stock === 0) return 'Out of Stock';
  if (stock < 10) return 'Low Stock';
  return 'Available';
};

const formatCurrency = (value: number): string => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
</script>

<style scoped lang="scss">
.inventory {
  margin-left: 260px;
  margin-top: 70px;
  padding: 2rem;
  background-color: #f8f9fb;
  min-height: calc(100vh - 70px);
}

// Header
.inventory-header {
  margin-bottom: 2rem;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #222;
    margin: 0;
  }
}

// Stats Bar
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  .stat-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      flex-shrink: 0;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.value {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.profit {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;

      .stat-label {
        font-size: 0.85rem;
        color: #718096;
        font-weight: 500;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2d3748;
      }
    }
  }
}

// Filters Section
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;

  .search-box {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    padding: 0 1rem;

    i {
      color: #a0aec0;
    }

    input {
      flex: 1;
      border: none;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      outline: none;

      &::placeholder {
        color: #cbd5e0;
      }
    }

    &:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  .filter-controls {
    display: flex;
    gap: 1rem;
    align-items: center;

    .filter-select {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:hover {
        border-color: #cbd5e0;
      }

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }

    .btn-refresh {
      width: 40px;
      height: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #718096;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        border-color: #667eea;
        color: #667eea;
        background: #f7fafc;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      i.spin {
        animation: spin 1s linear infinite;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// Error Alert
.error-alert {
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  i {
    flex-shrink: 0;
  }

  .btn-close {
    margin-left: auto;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #c53030;
  }
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: #718096;
    font-size: 1rem;
  }
}

// Empty State
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  i {
    font-size: 3rem;
    color: #cbd5e0;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.3rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    color: #718096;
    margin-bottom: 2rem;
  }
}

// Table
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.items-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f7fafc;
    border-bottom: 2px solid #e2e8f0;

    th {
      padding: 1.25rem;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f7fafc;
      }
    }
  }

  td {
    padding: 1.25rem;
    color: #2d3748;
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }

  .item-name {
    .name-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .name {
        font-weight: 600;
        color: #2d3748;
      }

      .description {
        font-size: 0.85rem;
        color: #a0aec0;
      }
    }
  }

  .stock-badge {
    display: inline-block;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;

    &.in-stock {
      background: #c6f6d5;
      color: #22543d;
    }

    &.low-stock {
      background: #fed7d7;
      color: #742a2a;
    }

    &.out-of-stock {
      background: #fbb6ce;
      color: #742a2a;
    }
  }

  .status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;

    &.available {
      background: #c6f6d5;
      color: #22543d;
    }

    &.low-stock {
      background: #feebc8;
      color: #7c2d12;
    }

    &.out-of-stock {
      background: #fed7d7;
      color: #742a2a;
    }
  }

  .actions-cell {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  .btn-action {
    width: 36px;
    height: 36px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 0.9rem;

    &.view {
      &:hover {
        border-color: #667eea;
        color: #667eea;
        background: #f0f4ff;
      }
    }

    &.edit {
      &:hover {
        border-color: #48bb78;
        color: #48bb78;
        background: #f0fff4;
      }
    }

    &.adjust {
      &:hover {
        border-color: #ed8936;
        color: #ed8936;
        background: #fffaf0;
      }
    }

    &.delete {
      &:hover {
        border-color: #f56565;
        color: #f56565;
        background: #fff5f5;
      }
    }
  }
}

// Button Styles
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// Responsive
@media (max-width: 1200px) {
  .filters-section {
    flex-wrap: wrap;

    .filter-controls {
      width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .inventory {
    margin-left: 0;
    margin-top: 60px;
    padding: 1.5rem;
  }

  .inventory-header .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }

  .items-table {
    font-size: 0.9rem;

    td,
    th {
      padding: 0.75rem;
    }
  }

  .filters-section {
    flex-direction: column;

    .filter-controls {
      width: 100%;
      flex-wrap: wrap;
    }
  }
}

@media (max-width: 480px) {
  .inventory {
    padding: 1rem;
  }

  .stats-bar {
    grid-template-columns: 1fr;
  }

  .items-table {
    font-size: 0.8rem;

    th,
    td {
      padding: 0.5rem;
    }

    .actions-cell {
      flex-direction: column;
    }

    .btn-action {
      width: 32px;
      height: 32px;
    }
  }
}
</style>