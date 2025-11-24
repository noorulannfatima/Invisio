<template>
  <div class="transaction-section">
    <div class="section-header">
      <h2 class="section-title">
        <i class="fas fa-list"></i>
        Recent Transactions
      </h2>
      <button class="btn-refresh" @click="refreshTransactions" :disabled="store.loading">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': store.loading }"></i>
      </button>
    </div>

    <div v-if="store.loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading transactions...</p>
    </div>

    <div v-else-if="store.invoices.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>No transactions found</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Party</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="txn in store.invoices" 
            :key="txn.Transaction_ID" 
            class="transaction-row"
          >
            <td class="date-col">
              <span class="date-badge">{{ formatDate(txn.Date) }}</span>
            </td>
            <td class="party-col">
              <div class="party-info">
                <span class="party-name">{{ txn.Party_Name }}</span>
              </div>
            </td>
            <td class="type-col">
              <span class="type-badge" :class="txn.Type.toLowerCase()">
                <i :class="getTypeIcon(txn.Type)"></i>
                {{ txn.Type }}
              </span>
            </td>
            <td class="amount-col">
              <span class="amount">{{ formatCurrency(txn.Total_Amount) }}</span>
            </td>
            <td class="status-col">
              <div class="status-select-wrapper" :class="txn.Status.toLowerCase()">
                <i :class="getStatusIcon(txn.Status)"></i>
                <select 
                  :value="txn.Status" 
                  @change="updateStatus(txn.Transaction_ID, ($event.target as HTMLSelectElement).value)"
                  class="status-select"
                  :disabled="store.loading"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </td>
            <td class="actions-col">
              <button 
                class="action-btn view-btn" 
                @click="$emit('view-details', txn.Transaction_ID)"
                title="View Details"
              >
                <i class="fas fa-eye"></i>
              </button>

              <button 
                class="action-btn download-btn" 
                @click="$emit('download-pdf', txn.Transaction_ID)"
                title="Download PDF"
              >
                <i class="fas fa-download"></i>
              </button>

              <button 
                class="action-btn delete-btn"
                title="Delete Transaction"
                @click="openDeleteModal(txn)"
                :disabled="store.loading"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showDeleteModal"
      :itemName="`${transactionToDelete?.Type} - ${transactionToDelete?.Party_Name} (${formatCurrency(transactionToDelete?.Total_Amount || 0)})`"
      @confirm="handleDeleteConfirm"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTransactionStore, type Invoice } from '@/store/transactionStore';
import ConfirmDeleteModal from '@/components/Common/ConfirmDeleteModal.vue';

const store = useTransactionStore();

defineEmits<{
  'view-details': [transactionId: number];
  'download-pdf': [transactionId: number];
}>();

// Delete modal state
const showDeleteModal = ref(false);
const transactionToDelete = ref<Invoice | null>(null);

// Methods
const refreshTransactions = async () => {
  await store.fetchAllInvoices();
};

const openDeleteModal = (transaction: Invoice) => {
  transactionToDelete.value = transaction;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  transactionToDelete.value = null;
};

const handleDeleteConfirm = async () => {
  if (!transactionToDelete.value) return;
  
  try {
    await store.deleteTransaction(transactionToDelete.value.Transaction_ID);
    closeDeleteModal();
  } catch (err) {
    console.error('Failed to delete transaction:', err);
    // Error is already handled in the store
  }
};

const updateStatus = async (transactionId: number, newStatus: string) => {
  try {
    await store.updateTransactionStatus(transactionId, newStatus);
  } catch (err) {
    console.error('Failed to update status:', err);
  }
};

// Utility functions
const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

const formatCurrency = (value: number): string => {
  return `Rs ${value.toFixed(0)}`;
};

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    Sale: 'fas fa-arrow-up',
    Purchase: 'fas fa-arrow-down',
    Estimate: 'fas fa-file-alt',
  };
  return icons[type] || 'fas fa-exchange-alt';
};

const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    Completed: 'fas fa-check-circle',
    Pending: 'fas fa-hourglass-half',
    Cancelled: 'fas fa-times-circle',
  };
  return icons[status] || 'fas fa-circle';
};
</script>

<style lang="scss" scoped>
.transaction-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 2rem 0;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .section-title {
      font-size: 1.2rem;
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

    .btn-refresh {
      background: transparent;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0.5rem 0.8rem;
      cursor: pointer;
      color: #666;
      font-size: 0.9rem;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: #f0f2f5;
        border-color: #007bff;
        color: #007bff;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      i {
        margin-right: 0.3rem;
      }
    }
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #999;

    i {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    p {
      margin: 0;
      font-size: 1rem;
    }
  }

  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    .transaction-table {
      width: 100%;
      border-collapse: collapse;

      thead {
        background: #f8f9fb;
        border-bottom: 2px solid #eee;

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #555;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
      }

      tbody {
        .transaction-row {
          border-bottom: 1px solid #eee;
          transition: all 0.3s ease;

          &:hover {
            background-color: #f8f9fb;
          }

          td {
            padding: 1rem;
            font-size: 0.95rem;
            color: #333;

            &.date-col {
              width: 120px;

              .date-badge {
                background: rgba(0, 123, 255, 0.1);
                color: #007bff;
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.85rem;
                display: inline-block;
              }
            }

            &.party-col {
              min-width: 150px;

              .party-info {
                display: flex;
                align-items: center;
                gap: 0.5rem;

                .party-name {
                  font-weight: 600;
                  color: #1a1a1a;
                }
              }
            }

            &.type-col {
              width: 130px;

              .type-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 600;
                white-space: nowrap;

                &.sale {
                  background: rgba(40, 167, 69, 0.15);
                  color: #28a745;

                  i {
                    color: #28a745;
                  }
                }

                &.purchase {
                  background: rgba(220, 53, 69, 0.15);
                  color: #dc3545;

                  i {
                    color: #dc3545;
                  }
                }

                &.estimate {
                  background: rgba(255, 193, 7, 0.15);
                  color: #ffc107;

                  i {
                    color: #ffc107;
                  }
                }
              }
            }

            &.amount-col {
              width: 120px;
              text-align: right;

              .amount {
                font-weight: 700;
                color: #1a1a1a;
                font-size: 1rem;
              }
            }

            &.status-col {
              width: 150px;

              .status-select-wrapper {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.3rem 0.6rem;
                border-radius: 6px;
                position: relative;
                transition: all 0.2s ease;
                width: 100%; /* Ensure wrapper takes full width */

                i {
                  font-size: 0.9rem;
                  pointer-events: none;
                  z-index: 1;
                  flex-shrink: 0; /* Prevent icon from shrinking */
                }

                .status-select {
                  appearance: none;
                  background: transparent;
                  border: none;
                  font-size: 0.85rem;
                  font-weight: 600;
                  color: inherit;
                  cursor: pointer;
                  padding-right: 0.5rem; 
                  outline: none;
                  width: 100%;
                  font-family: inherit;
                  text-overflow: ellipsis; /* Handle overflow gracefully */

                  option {
                    background: white;
                    color: #333;
                    padding: 0.5rem;
                  }
                }

                &.completed {
                  background: rgba(40, 167, 69, 0.15);
                  color: #28a745;

                  i { color: #28a745; }
                }

                &.pending {
                  background: rgba(255, 193, 7, 0.15);
                  color: #856404; /* Darker yellow for better text contrast */

                  i { color: #ffc107; }
                }

                &.cancelled {
                  background: rgba(220, 53, 69, 0.15);
                  color: #dc3545;

                  i { color: #dc3545; }
                }
                
                &:hover {
                  filter: brightness(0.95);
                }
              }
            }

            &.actions-col {
              width: 100px;
              display: flex;
              gap: 0.5rem;
              justify-content: center;

              .action-btn {
                background: transparent;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 4px;
                transition: all 0.3s ease;
                font-size: 0.95rem;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover:not(:disabled) {
                  background: #f0f2f5;
                  color: #007bff;
                }

                &.download-btn:hover:not(:disabled) {
                  color: #28a745;
                }

                &.delete-btn:hover:not(:disabled) {
                  color: #dc3545;
                }

                &:disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                }

                &:active {
                  transform: scale(0.95);
                }
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .transaction-section {
    padding: 1rem;

    .table-wrapper {
      .transaction-table {
        thead th,
        tbody td {
          padding: 0.8rem;
        }

        tbody td {
          &.amount-col {
            text-align: left;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .transaction-section {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .table-wrapper {
      overflow-x: auto;
      margin: 0 -1rem;
      padding: 0 1rem;

      .transaction-table {
        font-size: 0.85rem;

        thead th {
          padding: 0.6rem;
          font-size: 0.75rem;
        }

        tbody td {
          padding: 0.6rem;
          font-size: 0.8rem;

          &.date-col {
            width: 90px;

            .date-badge {
              padding: 0.3rem 0.6rem;
              font-size: 0.75rem;
            }
          }

          &.party-col {
            min-width: 120px;
          }

          &.type-col {
            width: 100px;

            .type-badge {
              padding: 0.3rem 0.6rem;
              font-size: 0.75rem;

              i {
                display: none;
              }
            }
          }

          &.amount-col {
            width: 90px;

            .amount {
              font-size: 0.9rem;
            }
          }

          &.status-col {
            width: 100px;

            .status-badge {
              padding: 0.3rem 0.6rem;
              font-size: 0.75rem;

              i {
                display: none;
              }
            }
          }

          &.actions-col {
            width: 70px;

            .action-btn {
              padding: 0.3rem;
              width: 28px;
              height: 28px;
              font-size: 0.8rem;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .transaction-section {
    .table-wrapper {
      .transaction-table {
        tbody td {
          &.party-col {
            .party-info {
              .party-name {
                max-width: 100px;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }

          &.actions-col {
            flex-direction: column;
            width: auto;

            .action-btn {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>