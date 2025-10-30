<!-- views/ProfitLoss.vue -->
<template>
  <div class="page profit-loss">
    <h1 class="page-title">Profit & Loss Report</h1>

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
        <button @click="fetchProfitLossData" :disabled="isLoading" class="btn-fetch">
          {{ isLoading ? 'Loading...' : 'Generate Report' }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <!-- Report Content -->
      <div v-if="reportStore.profitLossReport" class="report-content">
        <!-- Income Statement Header -->
        <div class="statement-header">
          <h2>Income Statement</h2>
          <p class="period-info">
            {{ formatDate(filters.startDate) }} to {{ formatDate(filters.endDate) }}
          </p>
        </div>

        <!-- Income Section -->
        <div class="pl-section">
          <h3>Income</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Total Revenue</span>
              <span class="value">Rs{{ reportStore.profitLossReport.Income.Total_Revenue.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Expenses Section -->
        <div class="pl-section">
          <h3>Expenses</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Cost of Goods Sold (COGS)</span>
              <span class="value">Rs{{ reportStore.profitLossReport.Expenses.Cost_of_Goods_Sold.toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Operating Expenses</span>
              <span class="value">Rs{{ reportStore.profitLossReport.Expenses.Operating_Expenses.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Profit & Loss Summary Section -->
        <div class="pl-section summary-section">
          <h3>Profit & Loss Summary</h3>
          <div class="summary-grid">
            <div class="summary-item highlight">
              <span class="label">Gross Profit</span>
              <span class="value">Rs{{ reportStore.profitLossReport.Profit_Loss.Gross_Profit.toLocaleString() }}</span>
            </div>
            <div
              class="summary-item highlight"
              :class="{ positive: reportStore.profitLossReport.Profit_Loss.Net_Profit > 0, negative: reportStore.profitLossReport.Profit_Loss.Net_Profit < 0 }"
            >
              <span class="label">Net Profit</span>
              <span class="value">Rs{{ reportStore.profitLossReport.Profit_Loss.Net_Profit.toLocaleString() }}</span>
            </div>
            <div class="summary-item highlight">
              <span class="label">Profit Margin</span>
              <span class="value">{{ reportStore.profitLossReport.Profit_Loss.Profit_Margin_Percentage }}%</span>
            </div>
          </div>
        </div>

        <!-- Breakdown Chart Info (optional) -->
        <div class="breakdown-info">
          <div class="info-card">
            <h4>Revenue Breakdown</h4>
            <p>Total Revenue: Rs{{ reportStore.profitLossReport.Income.Total_Revenue.toLocaleString() }}</p>
          </div>
          <div class="info-card">
            <h4>Total Expenses</h4>
            <p>Rs{{ (reportStore.profitLossReport.Expenses.Cost_of_Goods_Sold + reportStore.profitLossReport.Expenses.Operating_Expenses).toLocaleString() }}</p>
          </div>
          <div class="info-card">
            <h4>Net Result</h4>
            <p :class="{ profit: reportStore.profitLossReport.Profit_Loss.Net_Profit > 0, loss: reportStore.profitLossReport.Profit_Loss.Net_Profit < 0 }">
              {{ reportStore.profitLossReport.Profit_Loss.Net_Profit > 0 ? 'Profit' : 'Loss' }}: 
              Rs{{ Math.abs(reportStore.profitLossReport.Profit_Loss.Net_Profit).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-if="!isLoading && !reportStore.profitLossReport" class="no-data">
        <p>Select date range and click "Generate Report" to view Profit & Loss statement.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useReportStore } from '@/store/reportStore'

interface PLFilters {
  startDate: string
  endDate: string
}

const reportStore = useReportStore()
const isLoading = ref(false)
const error = ref<string | null>(null)

const filters = reactive<PLFilters>({
  startDate: '',
  endDate: '',
})

const fetchProfitLossData = async () => {
  if (!filters.startDate || !filters.endDate) {
    error.value = 'Please select both start and end dates'
    return
  }

  error.value = null
  isLoading.value = true

  try {
    await reportStore.fetchProfitLossReport(filters)
  } catch (err) {
    error.value = reportStore.error || 'Failed to fetch profit & loss report'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-IN')
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

  .report-content {
    animation: fadeIn 0.3s ease-in;
  }

  .statement-header {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #4f46e5;

    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #1f2937;
    }

    .period-info {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
  }

  .pl-section {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      color: #374151;
      font-weight: 600;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;

      .summary-item {
        background: #f9fafb;
        padding: 1.25rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;

        &.highlight {
          background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%);
          border: 1px solid #e0e7ff;
        }

        &.positive {
          border-left: 4px solid #10b981;

          .value {
            color: #10b981;
          }
        }

        &.negative {
          border-left: 4px solid #ef4444;

          .value {
            color: #ef4444;
          }
        }

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
  }

  .summary-section {
    margin-top: 0.5rem;
  }

  .breakdown-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;

    .info-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      h4 {
        margin: 0 0 0.75rem 0;
        font-size: 0.95rem;
        color: #374151;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;

        &.profit {
          color: #10b981;
        }

        &.loss {
          color: #ef4444;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

    .breakdown-info {
      grid-template-columns: 1fr;
    }

    .statement-header {
      h2 {
        font-size: 1.3rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .page {
    padding: 0.75rem;

    .page-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .filters-section {
      padding: 1rem;
    }

    .pl-section {
      padding: 1rem;
    }

    .breakdown-info .info-card {
      padding: 1rem;

      .value {
        font-size: 1.1rem;
      }
    }
  }
}
</style>