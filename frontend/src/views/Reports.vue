<template>
  <div class="page report">
    <h1 class="page-title">Reports & Analytics</h1>

    <div class="content">
      <p>Generate and review performance reports.</p>

      <!-- Report Cards -->
      <div class="report-grid">
        <div class="card" @click="openReport('sales')" :class="{ active: activeReport === 'sales' }">
          <div class="card-icon">📊</div>
          <h3>Sales Report</h3>
          <p>View detailed sales data and performance metrics.</p>
          <button class="card-btn">Generate Report</button>
        </div>

        <div class="card" @click="openReport('purchase')" :class="{ active: activeReport === 'purchase' }">
          <div class="card-icon">📦</div>
          <h3>Purchase Report</h3>
          <p>Track supplier bills and purchase history.</p>
          <button class="card-btn">Generate Report</button>
        </div>

        <div class="card" @click="openReport('gst')" :class="{ active: activeReport === 'gst' }">
          <div class="card-icon">📋</div>
          <h3>GST Report</h3>
          <p>GSTR-1 & GSTR-3B ready compliance data.</p>
          <button class="card-btn">Generate Report</button>
        </div>

        <div class="card" @click="openReport('profit-loss')" :class="{ active: activeReport === 'profit-loss' }">
          <div class="card-icon">💰</div>
          <h3>Profit & Loss</h3>
          <p>Financial performance and net profit analysis.</p>
          <button class="card-btn">Generate Report</button>
        </div>

        <div class="card" @click="openReport('stock')" :class="{ active: activeReport === 'stock' }">
          <div class="card-icon">📈</div>
          <h3>Stock Summary</h3>
          <p>Real-time inventory valuation and alerts.</p>
          <button class="card-btn">Generate Report</button>
        </div>

        <div class="card" @click="openReport('party-ledger')" :class="{ active: activeReport === 'party-ledger' }">
          <div class="card-icon">👥</div>
          <h3>Party Ledger</h3>
          <p>Customer and supplier transaction history.</p>
          <button class="card-btn">Generate Report</button>
        </div>
      </div>

      <!-- Report Details Panel -->
      <div v-if="activeReport" class="report-panel">
        <div class="panel-header">
          <h2>{{ getReportTitle(activeReport) }}</h2>
          <button @click="closeReport" class="close-btn">✕</button>
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Start Date</label>
            <input v-model="filters.startDate" type="date" />
          </div>
          <div class="filter-group">
            <label>End Date</label>
            <input v-model="filters.endDate" type="date" />
          </div>

          <!-- Sales Report specific filters -->
          <div v-if="activeReport === 'sales'" class="filter-group">
            <label>Period</label>
            <select v-model="filters.period">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <!-- Stock Report specific filters -->
          <div v-if="activeReport === 'stock'" class="filter-group">
            <label>Low Stock Threshold</label>
            <input v-model.number="filters.lowStockThreshold" type="number" min="1" />
          </div>

          <!-- Party Ledger specific filters -->
          <div v-if="activeReport === 'party-ledger'" class="filter-group">
            <label>Party ID *</label>
            <input v-model.number="filters.partyId" type="number" placeholder="Required" />
          </div>

          <button @click="generateReport" :disabled="isLoading" class="btn-generate">
            {{ isLoading ? 'Loading...' : 'Generate Report' }}
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          ⚠️ {{ error }}
        </div>

        <!-- Report Content -->
        <div v-if="reportStore.currentReport" class="report-content">
          <!-- Sales Report -->
          <template v-if="activeReport === 'sales' && reportStore.salesReport">
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Total Sales</span>
                <span class="value">₹{{ reportStore.salesReport.Summary.Total_Sales.toLocaleString() }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Transactions</span>
                <span class="value">{{ reportStore.salesReport.Summary.Total_Transactions }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Avg Transaction</span>
                <span class="value">₹{{ reportStore.salesReport.Summary.Average_Transaction_Value.toLocaleString() }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Quantity</span>
                <span class="value">{{ reportStore.salesReport.Summary.Total_Quantity_Sold }}</span>
              </div>
            </div>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sales</th>
                  <th>Quantity</th>
                  <th>Transactions</th>
                  <th>Avg Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="day in reportStore.salesReport.Daily_Breakdown" :key="day.Date">
                  <td>{{ formatDate(day.Date) }}</td>
                  <td>₹{{ day.Sales.toLocaleString() }}</td>
                  <td>{{ day.Quantity }}</td>
                  <td>{{ day.Transactions }}</td>
                  <td>₹{{ day.Average_Transaction_Value.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </template>

          <!-- Purchase Report -->
          <template v-if="activeReport === 'purchase' && reportStore.purchaseReport">
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Total Purchases</span>
                <span class="value">₹{{ reportStore.purchaseReport.Summary.Total_Purchases.toLocaleString() }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Bills</span>
                <span class="value">{{ reportStore.purchaseReport.Summary.Total_Bills }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Suppliers</span>
                <span class="value">{{ reportStore.purchaseReport.Summary.Supplier_Count }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Avg Bill Value</span>
                <span class="value">₹{{ reportStore.purchaseReport.Summary.Average_Bill_Value.toLocaleString() }}</span>
              </div>
            </div>
            <div v-for="supplier in reportStore.purchaseReport.Suppliers" :key="supplier.Supplier_ID" class="supplier-section">
              <h4>{{ supplier.Supplier_Name }}</h4>
              <p class="supplier-info">📞 {{ supplier.Supplier_Phone }} | Total: ₹{{ supplier.Total_Purchase.toLocaleString() }}</p>
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Items</th>
                    <th>Payment Mode</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bill in supplier.Bills" :key="bill.Transaction_ID">
                    <td>{{ formatDate(bill.Date) }}</td>
                    <td>₹{{ bill.Amount.toLocaleString() }}</td>
                    <td>{{ bill.Items_Count }}</td>
                    <td>{{ bill.Payment_Mode }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- GST Report -->
          <template v-if="activeReport === 'gst' && reportStore.gstReport">
            <div class="gst-container">
              <div class="gst-section">
                <h4>GSTR-1 (Outward Supplies)</h4>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Outward Supplies</span>
                    <span class="value">₹{{ reportStore.gstReport.GSTR_1_Data.Outward_Supplies.toLocaleString() }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Output GST</span>
                    <span class="value">₹{{ reportStore.gstReport.GSTR_1_Data.Output_GST.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
              <div class="gst-section">
                <h4>GSTR-3B (ITC & Liability)</h4>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Outward Supplies</span>
                    <span class="value">₹{{ reportStore.gstReport.GSTR_3B_Data.Outward_Supplies.toLocaleString() }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Inward Supplies</span>
                    <span class="value">₹{{ reportStore.gstReport.GSTR_3B_Data.Inward_Supplies?.toLocaleString() }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Output GST</span>
                    <span class="value">₹{{ reportStore.gstReport.GSTR_3B_Data.Output_GST?.toLocaleString() }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Input GST</span>
                    <span class="value">₹{{ reportStore.gstReport.GSTR_3B_Data.Input_GST?.toLocaleString() }}</span>
                  </div>
                  <div class="summary-item" :class="{ positive: reportStore.gstReport.GSTR_3B_Data.Net_GST_Liability && reportStore.gstReport.GSTR_3B_Data.Net_GST_Liability > 0 }">
                    <span class="label">Net Liability</span>
                    <span class="value">₹{{ reportStore.gstReport.GSTR_3B_Data.Net_GST_Liability?.toLocaleString() || 0 }}</span>
                  </div>
                  <div class="summary-item" :class="{ negative: reportStore.gstReport.GSTR_3B_Data.Net_GST_Credit && reportStore.gstReport.GSTR_3B_Data.Net_GST_Credit > 0 }">
                    <span class="label">Net Credit</span>
                    <span class="value">₹{{ reportStore.gstReport.GSTR_3B_Data.Net_GST_Credit?.toLocaleString() || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Profit & Loss Report -->
          <template v-if="activeReport === 'profit-loss' && reportStore.profitLossReport">
            <div class="pl-container">
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Total Revenue</span>
                  <span class="value">₹{{ reportStore.profitLossReport.Income.Total_Revenue.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">COGS</span>
                  <span class="value">₹{{ reportStore.profitLossReport.Expenses.Cost_of_Goods_Sold.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Operating Expenses</span>
                  <span class="value">₹{{ reportStore.profitLossReport.Expenses.Operating_Expenses.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Gross Profit</span>
                  <span class="value">₹{{ reportStore.profitLossReport.Profit_Loss.Gross_Profit.toLocaleString() }}</span>
                </div>
              </div>
              <div class="summary-grid">
                <div class="summary-item" :class="{ positive: reportStore.profitLossReport.Profit_Loss.Net_Profit > 0, negative: reportStore.profitLossReport.Profit_Loss.Net_Profit < 0 }">
                  <span class="label">Net Profit</span>
                  <span class="value">₹{{ reportStore.profitLossReport.Profit_Loss.Net_Profit.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Profit Margin</span>
                  <span class="value">{{ reportStore.profitLossReport.Profit_Loss.Profit_Margin_Percentage }}%</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Stock Summary Report -->
          <template v-if="activeReport === 'stock' && reportStore.stockSummaryReport">
            <div class="summary-grid">
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
                <span class="value">₹{{ reportStore.stockSummaryReport.Summary.Total_Inventory_Value.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Alerts -->
            <div v-if="reportStore.stockSummaryReport.Alerts.Out_of_Stock_Count > 0 || reportStore.stockSummaryReport.Alerts.Low_Stock_Count > 0" class="alerts-section">
              <h4>⚠️ Stock Alerts</h4>
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
            <table class="report-table">
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
                  <td>{{ item.Name }}</td>
                  <td>{{ item.Current_Stock }}</td>
                  <td>{{ item.Unit }}</td>
                  <td>₹{{ item.Selling_Price.toLocaleString() }}</td>
                  <td>₹{{ item.Inventory_Value.toLocaleString() }}</td>
                  <td><span :class="['status', item.Status.toLowerCase().replace(' ', '-')]">{{ item.Status }}</span></td>
                </tr>
              </tbody>
            </table>
          </template>

          <!-- Party Ledger Report -->
          <template v-if="activeReport === 'party-ledger' && reportStore.partyLedgerReport">
            <div class="party-header">
              <h3>{{ reportStore.partyLedgerReport.Party.Name }}</h3>
              <p>{{ reportStore.partyLedgerReport.Party.Type }} | 📧 {{ reportStore.partyLedgerReport.Party.Email }} | 📞 {{ reportStore.partyLedgerReport.Party.Mobile_Number }}</p>
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Total Purchases</span>
                <span class="value">₹{{ reportStore.partyLedgerReport.Summary.Total_Purchases.toLocaleString() }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Sales</span>
                <span class="value">₹{{ reportStore.partyLedgerReport.Summary.Total_Sales.toLocaleString() }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Expenses</span>
                <span class="value">₹{{ reportStore.partyLedgerReport.Summary.Total_Expenses.toLocaleString() }}</span>
              </div>
              <div class="summary-item" :class="{ positive: reportStore.partyLedgerReport.Summary.Net_Balance > 0, negative: reportStore.partyLedgerReport.Summary.Net_Balance < 0 }">
                <span class="label">Net Balance</span>
                <span class="value">₹{{ reportStore.partyLedgerReport.Summary.Net_Balance.toLocaleString() }}</span>
              </div>
            </div>
            <div class="balance-status" :class="reportStore.partyLedgerReport.Summary.Balance_Status.toLowerCase().replace(' ', '-')">
              {{ reportStore.partyLedgerReport.Summary.Balance_Status }}
            </div>

            <h4>Transactions</h4>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="txn in reportStore.partyLedgerReport.Transactions" :key="txn.Transaction_ID">
                  <td>{{ formatDate(txn.Date) }}</td>
                  <td><span :class="['type', txn.Type.toLowerCase()]">{{ txn.Type }}</span></td>
                  <td>₹{{ txn.Amount.toLocaleString() }}</td>
                  <td>{{ txn.Payment_Mode }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>

        <!-- No Data Message -->
        <div v-if="!isLoading && !reportStore.currentReport" class="no-data">
          <p>Select filters and click "Generate Report" to view data.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useReportStore } from '@/store/reportStore'

interface ReportItem {
  id: string
  title: string
  description: string
  icon: string
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'custom'

interface ReportFilters {
  startDate: string
  endDate: string
  period: PeriodType
  partyId?: number
  supplierId?: number
  lowStockThreshold?: number
}

const reportStore = useReportStore()
const activeReport = ref<string | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const filters = reactive<ReportFilters>({
  startDate: '',
  endDate: '',
  period: 'monthly',
  partyId: undefined,
  supplierId: undefined,
  lowStockThreshold: 10,
})

const reports: ReportItem[] = [
  { id: 'sales', title: 'Sales Report', description: 'View detailed sales data and performance metrics.', icon: '📊' },
  { id: 'purchase', title: 'Purchase Report', description: 'Track supplier bills and purchase history.', icon: '📦' },
  { id: 'gst', title: 'GST Report', description: 'GSTR-1 & GSTR-3B ready compliance data.', icon: '📋' },
  { id: 'profit-loss', title: 'Profit & Loss', description: 'Financial performance and net profit analysis.', icon: '💰' },
  { id: 'stock', title: 'Stock Summary', description: 'Real-time inventory valuation and alerts.', icon: '📈' },
  { id: 'party-ledger', title: 'Party Ledger', description: 'Customer and supplier transaction history.', icon: '👥' },
]

const openReport = (reportId: string) => {
  activeReport.value = reportId
  error.value = null
  reportStore.clearAllReports()
}

const closeReport = () => {
  activeReport.value = null
  reportStore.clearAllReports()
}

const getReportTitle = (reportId: string) => {
  const report = reports.find(r => r.id === reportId)
  return report?.title || ''
}

const generateReport = async () => {
  error.value = null
  isLoading.value = true

  try {
    switch (activeReport.value) {
      case 'sales':
        await reportStore.fetchSalesReport(filters)
        break
      case 'purchase':
        await reportStore.fetchPurchaseReport(filters)
        break
      case 'gst':
        await reportStore.fetchGSTReport(filters)
        break
      case 'profit-loss':
        await reportStore.fetchProfitLossReport(filters)
        break
      case 'stock':
        await reportStore.fetchStockSummaryReport(filters)
        break
      case 'party-ledger':
        await reportStore.fetchPartyLedgerReport(filters)
        break
    }
  } catch (err) {
    error.value = reportStore.error || 'Failed to generate report'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
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
  }

  .content {
    p {
      color: #666;
      margin-bottom: 1.5rem;
    }
  }

  .report-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-4px);
      }

      &.active {
        border: 2px solid #4f46e5;
        background: #f0f4ff;
      }

      .card-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }

      h3 {
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
        color: #333;
      }

      p {
        color: #666;
        font-size: 0.9rem;
        flex-grow: 1;
        margin-bottom: 1rem;
      }

      .card-btn {
        background: #4f46e5;
        color: #fff;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s ease;

        &:hover {
          background: #4338ca;
        }
      }
    }
  }

  .report-panel {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 2rem;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1.5rem;
        margin: 0;
      }

      .close-btn {
        background: #f3f4f6;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1.2rem;
        transition: background 0.3s ease;

        &:hover {
          background: #e5e7eb;
        }
      }
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb;

      .filter-group {
        display: flex;
        flex-direction: column;

        label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #666;
          margin-bottom: 0.5rem;
        }

        input,
        select {
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

      .btn-generate {
        background: #4f46e5;
        color: #fff;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.3s ease;
        align-self: flex-end;

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
      margin-bottom: 1.5rem;
    }

    .report-content {
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;

        .summary-item {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          flex-direction: column;

          &.positive {
            border-left: 4px solid #10b981;
          }

          &.negative {
            border-left: 4px solid #ef4444;
          }

          .label {
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 0.5rem;
          }

          .value {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
          }
        }
      }

      .report-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 2rem;

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

              .status {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;

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

              .type {
                padding: 0.25rem 0.75rem;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 500;

                &.sale {
                  background: #dbeafe;
                  color: #1e40af;
                }

                &.purchase {
                  background: #fce7f3;
                  color: #831843;
                }
              }
            }
          }
        }
      }

      .supplier-section {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e5e7eb;

        h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .supplier-info {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        &:last-child {
          border-bottom: none;
        }
      }

      .gst-container {
        .gst-section {
          margin-bottom: 2rem;

          h4 {
            color: #1f2937;
            margin-bottom: 1rem;
            font-size: 1.1rem;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .pl-container {
        .summary-grid {
          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .alerts-section {
        margin-bottom: 2rem;

        h4 {
          color: #1f2937;
          margin-bottom: 1rem;
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

      .party-header {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e5e7eb;

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          color: #1f2937;
        }

        p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
      }

      .balance-status {
        padding: 1rem;
        border-radius: 6px;
        font-weight: 600;
        margin-bottom: 1.5rem;
        text-align: center;

        &.party-owes {
          background: #dbeafe;
          color: #1e40af;
        }

        &.you-owe {
          background: #fee2e2;
          color: #991b1b;
        }

        &.settled {
          background: #d1fae5;
          color: #065f46;
        }
      }
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #666;
      background: #f9fafb;
      border-radius: 8px;
    }
  }
}

@media (max-width: 768px) {
  .page {
    margin-left: 0;
    padding: 1rem;

    .report-grid {
      grid-template-columns: 1fr;
    }

    .report-panel {
      padding: 1.5rem;

      .filters {
        grid-template-columns: 1fr;

        .btn-generate {
          align-self: stretch;
        }
      }
    }
  }
}
</style>