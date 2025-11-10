<!-- views/PartyLedger.vue -->
<template>
  <div class="page partyledger">
    <h1 class="page-title">Party Ledger</h1>

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

        <!-- ✅ Updated Party Selector -->
        <div class="filter-group">
          <label>Party *</label>
          <select v-model.number="filters.partyId">
            <option disabled value="">Select a Party</option>
            <option v-for="party in partyStore.parties" :key="party.Party_ID" :value="party.Party_ID">
              {{ party.Name }} ({{ party.Type }})
            </option>
          </select>
        </div>

        <button
          @click="fetchLedgerData"
          :disabled="isLoading || !filters.partyId"
          class="btn-fetch"
        >
          {{ isLoading ? 'Loading...' : 'Fetch Ledger' }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <!-- Party Header -->
      <div v-if="reportStore.partyLedgerReport" class="party-header">
        <div class="party-info">
          <h2>{{ reportStore.partyLedgerReport.Party.Name }}</h2>
          <p class="party-details">
            <span>{{ reportStore.partyLedgerReport.Party.Type }}</span>
            <span>📧 {{ reportStore.partyLedgerReport.Party.Email }}</span>
            <span>📞 {{ reportStore.partyLedgerReport.Party.Mobile_Number }}</span>
          </p>
        </div>
      </div>

      <!-- Summary Cards -->
      <div v-if="reportStore.partyLedgerReport" class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Purchases</span>
          <span class="value">
            Rs{{ reportStore.partyLedgerReport.Summary.Total_Purchases.toLocaleString() }}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Total Sales</span>
          <span class="value">
            Rs{{ reportStore.partyLedgerReport.Summary.Total_Sales.toLocaleString() }}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Total Expenses</span>
          <span class="value">
            Rs{{ reportStore.partyLedgerReport.Summary.Total_Expenses.toLocaleString() }}
          </span>
        </div>
        <div
          class="summary-item"
          :class="{
            positive: reportStore.partyLedgerReport.Summary.Net_Balance > 0,
            negative: reportStore.partyLedgerReport.Summary.Net_Balance < 0,
          }"
        >
          <span class="label">Net Balance</span>
          <span class="value">
            Rs{{ reportStore.partyLedgerReport.Summary.Net_Balance.toLocaleString() }}
          </span>
        </div>
      </div>

      <!-- Balance Status -->
      <div
        v-if="reportStore.partyLedgerReport"
        class="balance-status"
        :class="reportStore.partyLedgerReport.Summary.Balance_Status.toLowerCase().replace(' ', '-')"
      >
        <strong>Status:</strong>
        {{ reportStore.partyLedgerReport.Summary.Balance_Status }}
      </div>

      <!-- Transactions Table -->
      <div v-if="reportStore.partyLedgerReport" class="table-section">
        <h3>Transactions</h3>
        <div class="table-wrapper">
          <table class="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="txn in reportStore.partyLedgerReport.Transactions"
                :key="txn.Transaction_ID"
              >
                <td>{{ formatDate(txn.Date) }}</td>
                <td>
                  <span :class="['type', txn.Type.toLowerCase()]">{{ txn.Type }}</span>
                </td>
                <td class="amount">Rs{{ txn.Amount.toLocaleString() }}</td>
                <td>{{ txn.Payment_Mode }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-if="!isLoading && !reportStore.partyLedgerReport" class="no-data">
        <p>Select a Party and click "Fetch Ledger" to view transaction history.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useReportStore } from '@/store/reportStore'
import { usePartyStore } from '@/store/partyStore'

interface LedgerFilters {
  startDate: string
  endDate: string
  partyId?: number
}

const reportStore = useReportStore()
const partyStore = usePartyStore()

const isLoading = ref(false)
const error = ref<string | null>(null)

const filters = reactive<LedgerFilters>({
  startDate: '',
  endDate: '',
  partyId: undefined,
})

// ✅ Fetch all parties on mount
onMounted(async () => {
  try {
    await partyStore.fetchAllParties()
  } catch (err) {
    console.error('Failed to fetch parties:', err)
  }
})

const fetchLedgerData = async () => {
  if (!filters.partyId) {
    error.value = 'Please select a party.'
    return
  }

  error.value = null
  isLoading.value = true

  try {
    await reportStore.fetchPartyLedgerReport(filters)
  } catch (err) {
    error.value = reportStore.error || 'Failed to fetch ledger data'
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
  } /* ✅ Closed .filters-section properly here */

  .error-message {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 1rem;
    border-radius: 6px;
  }

  .party-header {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #4f46e5;

    .party-info {
      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        color: #1f2937;
      }

      .party-details {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
    }
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

      &.positive {
        border-top: 3px solid #10b981;
      }

      &.negative {
        border-top: 3px solid #ef4444;
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

  .balance-status {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    font-weight: 600;
    text-align: center;

    &.party-owes {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    &.you-owe {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    &.settled {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
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

      .transactions-table {
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

              &.amount {
                font-weight: 500;
              }

              .type {
                padding: 0.25rem 0.75rem;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 500;
                display: inline-block;

                &.sale {
                  background: #dbeafe;
                  color: #1e40af;
                }

                &.purchase {
                  background: #fce7f3;
                  color: #831843;
                }

                &.expense {
                  background: #fef3c7;
                  color: #78350f;
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

    .party-header .party-info .party-details {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}
</style>

