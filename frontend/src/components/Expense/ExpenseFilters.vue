<!-- components/Expense/ExpenseFilters.vue -->
<template>
  <div class="filters-section">
    <div class="filters-header">
      <h3>
        <i class="fas fa-filter"></i>
        Filter Expenses
      </h3>
    </div>

    <div class="filter-group">
      <div class="filter-field">
        <label>Start Date</label>
        <input
          :value="filters.startDate"
          type="date"
          class="filter-input"
          @input="updateFilter('startDate', $event.target.value)"
        />
      </div>

      <div class="filter-field">
        <label>End Date</label>
        <input
          :value="filters.endDate"
          type="date"
          class="filter-input"
          @input="updateFilter('endDate', $event.target.value)"
        />
      </div>

      <div class="filter-field">
        <label>Category</label>
        <input
          :value="filters.Category"
          type="text"
          placeholder="Search category..."
          class="filter-input"
          @input="updateFilter('Category', $event.target.value)"
        />
      </div>

      <div class="filter-field">
        <label>Sort By</label>
        <select
          :value="filters.sortBy"
          class="filter-input"
          @input="updateFilter('sortBy', $event.target.value)"
        >
          <option value="">Default</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-high">Amount (High to Low)</option>
          <option value="amount-low">Amount (Low to High)</option>
          <option value="category">By Category</option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="btn-primary" @click="$emit('apply')">
          <i class="fas fa-check"></i>
          Apply
        </button>
        <button class="btn-secondary" @click="handleClear">
          <i class="fas fa-redo"></i>
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  filters: {
    startDate: string;
    endDate: string;
    Category: string;
    sortBy: string;
  };
}>();

const emit = defineEmits<{
  'update-filters': [filters: any];
  'apply': [];
  'clear': [];
}>();

const updateFilter = (key: string, value: string) => {
  const newFilters = { ...props.filters, [key]: value };
  emit('update-filters', newFilters);
};

const handleClear = () => {
  emit('clear');
};
</script>

<style scoped lang="scss">
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);

  .filters-header {
    margin-bottom: 1.5rem;

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #667eea;
      }
    }
  }

  .filter-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
    align-items: flex-end;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #2d3748;
    }
  }

  .filter-input {
    padding: 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #2d3748;
    transition: all 0.3s ease;
    background: white;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #a0aec0;
    }
  }

  .filter-actions {
    display: flex;
    gap: 0.75rem;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }

  .btn-secondary {
    background: #edf2f7;
    color: #2d3748;
    border: 1px solid #cbd5e0;

    &:hover {
      background: #e2e8f0;
      border-color: #a0aec0;
    }
  }
}
</style>