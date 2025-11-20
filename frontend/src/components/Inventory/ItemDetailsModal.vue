<!-- ItemDetailsModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Item Details</h2>
        <button class="btn-close" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div class="detail-row">
          <span class="label">Item Name</span>
          <span class="value">{{ item.Name }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Description</span>
          <span class="value">{{ item.Description || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Unit</span>
          <span class="value">{{ item.Unit }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Current Stock</span>
          <span class="value" :class="getStockClass(item.Current_Stock)">
            {{ item.Current_Stock }} units
          </span>
        </div>
        <div class="detail-row">
          <span class="label">Purchase Price</span>
          <span class="value">Rs {{ formatCurrency(item.Purchase_Price) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Selling Price</span>
          <span class="value">Rs {{ formatCurrency(item.Selling_Price) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Profit Margin</span>
          <span class="value profit">{{ calculateMargin(item) }}%</span>
        </div>
        <div class="detail-row">
          <span class="label">Total Value</span>
          <span class="value highlight">
            Rs {{ formatCurrency(item.Selling_Price * item.Current_Stock) }}
          </span>
        </div>
        <div class="detail-row">
          <span class="label">Created</span>
          <span class="value">{{ formatDate(item.createdAt) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Last Updated</span>
          <span class="value">{{ formatDate(item.updatedAt) }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '@/store/itemStore';

defineProps<{
  item: Item;
}>();

const emit = defineEmits<{
  close: [];
}>();

const closeModal = () => {
  emit('close');
};

const formatCurrency = (value: number): string => {
  return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatDate = (date?: string): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStockClass = (stock: number): string => {
  if (stock === 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
};

const calculateMargin = (item: Item): string => {
  if (item.Purchase_Price === 0) return '0';
  const margin = ((item.Selling_Price - item.Purchase_Price) / item.Purchase_Price) * 100;
  return margin.toFixed(1);
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #2d3748;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #718096;
    line-height: 1;

    &:hover {
      color: #2d3748;
    }
  }
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f4f8;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #718096;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .value {
    color: #2d3748;
    font-weight: 500;
    text-align: right;
    max-width: 50%;

    &.low-stock {
      color: #ed8936;
      font-weight: 700;
    }

    &.out-of-stock {
      color: #f56565;
      font-weight: 700;
    }

    &.in-stock {
      color: #38a169;
      font-weight: 700;
    }

    &.profit {
      color: #48bb78;
      font-weight: 700;
    }

    &.highlight {
      color: #667eea;
      font-weight: 700;
      font-size: 1.1rem;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f7fafc;
  border-radius: 0 0 12px 12px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &.btn-secondary {
    background: #edf2f7;
    color: #2d3748;

    &:hover {
      background: #e2e8f0;
    }
  }
}
</style>

---

