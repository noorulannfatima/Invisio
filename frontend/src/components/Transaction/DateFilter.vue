<!-- componenets/Transaction/DateFilter.vue-->
<template>
  <div class="date-filter-card">
    <div class="filter-header">
      <h3 class="filter-title">
        <i class="fas fa-filter"></i>
        Filter Transactions
      </h3>
    </div>

    <div class="filter-content">
      <div class="filter-group">
        <label for="start-date" class="filter-label">Start Date</label>
        <input 
          id="start-date"
          v-model="filters.startDate" 
          type="date" 
          class="filter-input"
        />
      </div>

      <div class="filter-group">
        <label for="end-date" class="filter-label">End Date</label>
        <input 
          id="end-date"
          v-model="filters.endDate" 
          type="date" 
          class="filter-input"
        />
      </div>

      <div class="filter-group">
        <label for="type-select" class="filter-label">Transaction Type</label>
        <select v-model="filters.Type" id="type-select" class="filter-select">
          <option :value="undefined">All Types</option>
          <option value="Sale">Sale</option>
          <option value="Purchase">Purchase</option>
          <option value="Estimate">Estimate</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="status-select" class="filter-label">Status</label>
        <select v-model="filters.Status" id="status-select" class="filter-select">
          <option :value="undefined">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="sort-select" class="filter-label">Sort By</label>
        <select v-model="filters.sortBy" id="sort-select" class="filter-select">
          <option value="">Default</option>
          <option value="date-newest">Date (Newest)</option>
          <option value="date-oldest">Date (Oldest)</option>
          <option value="amount-high">Amount (High to Low)</option>
          <option value="amount-low">Amount (Low to High)</option>
        </select>
      </div>
    </div>

    <div class="filter-actions">
      <button class="btn-apply" @click="applyFilters">
        <i class="fas fa-search"></i>
        Apply Filters
      </button>
      <button class="btn-reset" @click="resetFilters">
        <i class="fas fa-redo"></i>
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TransactionFilters } from '@/store/transactionStore';

const emit = defineEmits<{
  'apply-filter': [filters: TransactionFilters];
}>();

interface FilterState {
  startDate?: string;
  endDate?: string;
  Type?: 'Sale' | 'Purchase' | 'Estimate';
  Status?: 'Pending' | 'Completed' | 'Cancelled';
  sortBy?: 'date-newest' | 'date-oldest' | 'amount-high' | 'amount-low';
}

const filters = ref<FilterState>({
  startDate: undefined,
  endDate: undefined,
  Type: undefined,
  Status: undefined,
  sortBy: undefined,
});

const applyFilters = () => {
  const cleanFilters: TransactionFilters = {};
  
  if (filters.value.startDate) cleanFilters.startDate = filters.value.startDate;
  if (filters.value.endDate) cleanFilters.endDate = filters.value.endDate;
  if (filters.value.Type) {
    cleanFilters.Type = filters.value.Type;
  }
  if (filters.value.Status) {
    cleanFilters.Status = filters.value.Status;
  }
  if (filters.value.sortBy) {
    cleanFilters.sortBy = filters.value.sortBy;
  }

  emit('apply-filter', cleanFilters);
};

const resetFilters = () => {
  filters.value = {
    startDate: undefined,
    endDate: undefined,
    Type: undefined,
    Status: undefined,
    sortBy: undefined,
  };
  emit('apply-filter', {});
};
</script>

<style lang="scss" scoped>
.date-filter-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;

  .filter-header {
    margin-bottom: 1.5rem;

    .filter-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #007bff;
      }
    }
  }

  .filter-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    .filter-group {
      display: flex;
      flex-direction: column;

      .filter-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #555;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .filter-input,
      .filter-select {
        padding: 0.6rem 0.8rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
        font-family: inherit;
        background: #fff;
        color: #333;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        &:hover {
          border-color: #bbb;
        }
      }
    }
  }

  .filter-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;

    button {
      padding: 0.7rem 1.2rem;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &.btn-apply {
        background: #007bff;
        color: white;
        flex: 1;

        &:hover {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
      }

      &.btn-reset {
        background: #f0f2f5;
        color: #666;

        &:hover {
          background: #e9ecef;
          color: #333;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .date-filter-card {
    .filter-content {
      grid-template-columns: 1fr;
    }

    .filter-actions {
      flex-direction: column;

      button {
        justify-content: center;
      }
    }
  }
}
</style>