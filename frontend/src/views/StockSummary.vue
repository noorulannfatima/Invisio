<!-- /views/StockSummary.vue -->
<template>
  <div class="page stock-summary">
    <h1 class="page-title">Stock Summary</h1>

    <div class="content">
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Start Date</label>
          <input v-model="filters.startDate" type="date" />
        </div>
        <div class="filter-group">
          <label>End Date</label>
          <input v-model="filters.endDate" type="date" />
        </div>
        <div class="filter-group">
          <label>Low Stock Threshold</label>
          <input v-model.number="filters.lowStockThreshold" type="number" min="1" />
        </div>
        <button @click="fetchStockData" :disabled="isLoading" class="btn-fetch">
          {{ isLoading ? 'Loading...' : 'Fetch Data' }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <!-- Stock Summary Cards -->
      <div v-if="reportStore.stockSummaryReport" class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Items</span>
          <span class="value">{{ reportStore.stockSummaryReport.Summary.Total_Items_Variety }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Stock Units</span>
          <span class="value">{{ reportStore.stockSummaryReport.Summary.Total_Stock_Units }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Inventory Value</span>
          <span class="value">Rs{{ reportStore.stockSummaryReport.Summary.Total_Inventory_Value.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Stock Alerts -->
      <div v-if="reportStore.stockSummaryReport && (reportStore.stockSummaryReport.Alerts.Out_of_Stock_Count > 0 || reportStore.stockSummaryReport.Alerts.Low_Stock_Count > 0)" class="alerts-section">
        <h3>Stock Alerts</h3>

        <div v-if="reportStore.stockSummaryReport.Alerts.Out_of_Stock_Count > 0" class="alert out-of-stock">
          <strong>Out of Stock ({{ reportStore.stockSummaryReport.Alerts.Out_of_Stock_Count }})</strong>
          <ul>
            <li v-for="item in reportStore.stockSummaryReport.Alerts.Out_of_Stock_Items" :key="item.Item_ID">
              {{ item.Name }}
            </li>
          </ul>
        </div>

        <div v-if="reportStore.stockSummaryReport.Alerts.Low_Stock_Count > 0" class="alert low-stock">
          <strong>Low Stock ({{ reportStore.stockSummaryReport.Alerts.Low_Stock_Count }})</strong>
          <ul>
            <li v-for="item in reportStore.stockSummaryReport.Alerts.Low_Stock_Items" :key="item.Item_ID">
              {{ item.Name }} ({{ item.Current_Stock }} {{ item.Unit }})
            </li>
          </ul>
        </div>
      </div>

      <!-- Stock Items Table -->
      <div v-if="reportStore.stockSummaryReport" class="table-section">
        <h3>Inventory Items</h3>
        <div class="table-wrapper">
          <table class="stock-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Current Stock</th>
                <th>Unit</th>
                <th>Selling Price</th>
                <th>Inventory Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportStore.stockSummaryReport.Items" :key="item.Item_ID">
                <td class="item-name">{{ item.Name }}</td>
                <td>{{ item.Current_Stock }}</td>
                <td>{{ item.Unit }}</td>
                <td>Rs{{ item.Selling_Price.toLocaleString() }}</td>
                <td>Rs{{ item.Inventory_Value.toLocaleString() }}</td>
                <td>
                  <span :class="['status', item.Status.toLowerCase().replace(' ', '-')]">
                    {{ item.Status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-if="!isLoading && !reportStore.stockSummaryReport" class="no-data">
        <p>Click "Fetch Data" to view stock summary.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useReportStore } from '@/store/reportStore'

interface StockFilters {
  startDate: string
  endDate: string
  lowStockThreshold: number
}

const reportStore = useReportStore()
const isLoading = ref(false)
const error = ref<string | null>(null)

const filters = reactive<StockFilters>({
  startDate: '',
  endDate: '',
  lowStockThreshold: 10,
})

const fetchStockData = async () => {
  error.value = null
  isLoading.value = true

  try {
    await reportStore.fetchStockSummaryReport(filters)
  } catch (err) {
    error.value = reportStore.error || 'Failed to fetch stock data'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  margin-left: 260px;
  margin-top: 70px;
  padding: 2rem;
  background-color: #f8f9fb;
  min-height: calc(100vh - 70px);

  .page-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #1f2937;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .filters-section {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    align-items: flex-end;

    .filter-group {
      display: flex;
      flex-direction: column;

      label {
        font-size: 0.85rem;
        font-weight: 500;
        color: #666;
        margin-bottom: 0.5rem;
      }

      input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
      }
    }

    .btn-fetch {
      background: #4f46e5;
      color: #fff;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s ease;

      &:hover:not(:disabled) {
        background: #4338ca;
      }

      &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
    }
  }

  .error-message {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 1rem;
    border-radius: 6px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;

    .summary-item {
      background: #fff;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;

      .label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1f2937;
      }
    }
  }

  .alerts-section {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .alert {
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;

      &.out-of-stock {
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #991b1b;

        strong {
          display: block;
          margin-bottom: 0.5rem;
        }

        ul {
          margin: 0;
          padding-left: 1.5rem;

          li {
            margin: 0.25rem 0;
          }
        }
      }

      &.low-stock {
        background: #fef3c7;
        border: 1px solid #fde68a;
        color: #78350f;

        strong {
          display: block;
          margin-bottom: 0.5rem;
        }

        ul {
          margin: 0;
          padding-left: 1.5rem;

          li {
            margin: 0.25rem 0;
          }
        }
      }
    }
  }

  .table-section {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .table-wrapper {
      overflow-x: auto;

      .stock-table {
        width: 100%;
        border-collapse: collapse;

        thead {
          background: #f3f4f6;

          th {
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
          }
        }

        tbody {
          tr {
            border-bottom: 1px solid #e5e7eb;

            &:hover {
              background: #f9fafb;
            }

            td {
              padding: 0.75rem;
              color: #374151;

              &.item-name {
                font-weight: 500;
              }

              .status {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
                display: inline-block;

                &.in-stock {
                  background: #d1fae5;
                  color: #065f46;
                }

                &.low-stock {
                  background: #fef3c7;
                  color: #92400e;
                }

                &.out-of-stock {
                  background: #fee2e2;
                  color: #991b1b;
                }
              }
            }
          }
        }
      }
    }
  }

  .no-data {
    background: #fff;
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    color: #666;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

@media (max-width: 768px) {
  .page {
    margin-left: 0;
    padding: 1rem;

    .filters-section {
      grid-template-columns: 1fr;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>

