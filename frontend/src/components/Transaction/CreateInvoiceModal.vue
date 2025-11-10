<!--/components/Transaction/CreateInvoiceModal.vue-->
<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-plus-circle"></i>
          Create Invoice
        </h2>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="submitInvoice" class="modal-form">
        <!-- Party Selection -->
        <div class="form-group">
          <label for="party" class="form-label">Customer *</label>
          <select 
            id="party"
            v-model="formData.Party_ID" 
            class="form-input"
            required
          >
            <option :value="null">Select a customer</option>
            <option v-for="party in customers" :key="party.Party_ID" :value="party.Party_ID">
              {{ party.Name }}
            </option>
          </select>
        </div>

        <!-- Date -->
        <div class="form-group">
          <label for="date" class="form-label">Date *</label>
          <input 
            id="date"
            v-model="formData.Date" 
            type="date" 
            class="form-input"
            required
          />
        </div>

        <!-- GST Rate -->
        <div class="form-group">
          <label for="gst-rate" class="form-label">GST Rate (%) *</label>
          <input 
            id="gst-rate"
            v-model.number="formData.GST_Rate" 
            type="number" 
            min="0"
            max="100"
            step="0.01"
            class="form-input"
            required
          />
        </div>

        <!-- Line Items -->
        <div class="form-group">
          <label class="form-label">Line Items *</label>
          <div class="line-items-section">
            <div v-for="(item, index) in formData.Line_Items" :key="index" class="line-item">
              <div class="line-item-grid">
                <div class="form-group">
                  <label class="form-label small">Item</label>
                  <select 
                    v-model="item.Item_ID" 
                    @change="onItemSelect(index)"
                    class="form-input"
                    required
                  >
                    <option :value="0">Select an item</option>
                    <option v-for="availableItem in items" :key="availableItem.Item_ID" :value="availableItem.Item_ID">
                      {{ availableItem.Name }} ({{ availableItem.Unit }})
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label small">Quantity</label>
                  <input 
                    v-model.number="item.Quantity" 
                    type="number" 
                    min="0"
                    step="0.01"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label small">Rate</label>
                  <input 
                    v-model.number="item.Rate" 
                    type="number" 
                    min="0"
                    step="0.01"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label small">Discount</label>
                  <input 
                    v-model.number="item.Discount" 
                    type="number" 
                    min="0"
                    step="0.01"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label small">Line Total</label>
                  <input 
                    :value="calculateLineTotal(item)" 
                    type="number" 
                    class="form-input"
                    disabled
                  />
                </div>

                <button 
                  v-if="formData.Line_Items.length > 1"
                  type="button"
                  class="btn-remove"
                  @click="removeLineItem(index)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <button 
              type="button" 
              class="btn-add-item"
              @click="addLineItem"
            >
              <i class="fas fa-plus"></i>
              Add Item
            </button>
          </div>
        </div>

        <!-- Payment Mode (Optional) -->
        <div class="form-group">
          <label for="payment-mode" class="form-label">Payment Mode</label>
          <input 
            id="payment-mode"
            v-model="formData.Payment_Mode" 
            type="text" 
            class="form-input"
            placeholder="e.g., Cash, Bank Transfer"
          />
        </div>

        <!-- Summary -->
        <div class="summary-section">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Tax ({{ formData.GST_Rate }}%):</span>
            <span>{{ formatCurrency(taxAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ formatCurrency(total) }}</span>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-check"></i>
            {{ loading ? 'Creating...' : 'Create Invoice' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTransactionStore, type LineItem } from '@/store/transactionStore';
import { usePartyStore } from '@/store/partyStore';
import { useItemStore } from '@/store/itemStore';

const emit = defineEmits<{
  'close': [];
  'invoice-created': [];
}>();

const transactionStore = useTransactionStore();
const partyStore = usePartyStore();
const itemStore = useItemStore();

const loading = ref(false);

interface FormData {
  Party_ID: number | null;
  Date: string;
  GST_Rate: number;
  Line_Items: LineItem[];
  Payment_Mode?: string;
}

const formData = ref<FormData>({
  Party_ID: null,
  Date: new Date().toISOString().split('T')[0],
  GST_Rate: 18,
  Line_Items: [
    {
      Item_ID: 0,
      Item_Name: '',
      Quantity: 1,
      Rate: 0,
      Discount: 0,
      Line_Total: 0,
    },
  ],
});

// Computed properties for customers and items
const customers = computed(() => partyStore.getCustomers());
const items = computed(() => itemStore.items);

onMounted(async () => {
  // Fetch customers and items
  try {
    await Promise.all([
      partyStore.fetchAllParties({ type: 'Customer' }),
      itemStore.fetchAllItems()
    ]);
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }
});

const onItemSelect = (index: number) => {
  const selectedItemId = formData.value.Line_Items[index].Item_ID;
  if (selectedItemId) {
    const selectedItem = items.value.find(item => item.Item_ID === selectedItemId);
    if (selectedItem) {
      formData.value.Line_Items[index].Item_Name = selectedItem.Name;
      formData.value.Line_Items[index].Rate = selectedItem.Selling_Price;
    }
  }
};

const calculateLineTotal = (item: LineItem): number => {
  return (item.Quantity * item.Rate) - item.Discount;
};

const subtotal = computed(() => {
  return formData.value.Line_Items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
});

const taxAmount = computed(() => {
  return subtotal.value * (formData.value.GST_Rate / 100);
});

const total = computed(() => {
  return subtotal.value + taxAmount.value;
});

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const addLineItem = () => {
  formData.value.Line_Items.push({
    Item_ID: 0,
    Item_Name: '',
    Quantity: 1,
    Rate: 0,
    Discount: 0,
    Line_Total: 0,
  });
};

const removeLineItem = (index: number) => {
  formData.value.Line_Items.splice(index, 1);
};

const submitInvoice = async () => {
  if (!formData.value.Party_ID) {
    alert('Please select a customer');
    return;
  }

  if (formData.value.Line_Items.length === 0) {
    alert('Please add at least one item');
    return;
  }

  // Validate that all items are selected
  const hasUnselectedItem = formData.value.Line_Items.some(item => item.Item_ID === 0);
  if (hasUnselectedItem) {
    alert('Please select all items');
    return;
  }

  loading.value = true;
  try {
    const payload = {
      Party_ID: formData.value.Party_ID,
      Date: formData.value.Date,
      GST_Rate: formData.value.GST_Rate,
      Line_Items: formData.value.Line_Items.map(item => ({
        Item_ID: item.Item_ID,
        Item_Name: item.Item_Name,
        Quantity: item.Quantity,
        Rate: item.Rate,
        Discount: item.Discount,
        Line_Total: calculateLineTotal(item),
      })),
      Payment_Mode: formData.value.Payment_Mode,
    };

    await transactionStore.createInvoice(payload);
    emit('invoice-created');
  } catch (err) {
    console.error('Failed to create invoice:', err);
    alert('Failed to create invoice. Please try again.');
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;

  .modal-content {
    background: #fff;
    border-radius: 12px;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 10;

      .modal-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
        display: flex;
        align-items: center;
        gap: 0.8rem;

        i {
          color: #007bff;
        }
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #999;
        cursor: pointer;
        padding: 0;
        transition: color 0.3s ease;

        &:hover {
          color: #333;
        }
      }
    }

    .modal-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .form-group {
        display: flex;
        flex-direction: column;

        .form-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;

          &.small {
            font-size: 0.8rem;
          }
        }

        .form-input {
          padding: 0.7rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;

          &:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          }

          &:disabled {
            background: #f5f5f5;
            color: #999;
          }
        }
      }

      .line-items-section {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .line-item {
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 6px;
          border: 1px solid #eee;

          .line-item-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
            gap: 0.8rem;
            align-items: flex-end;

            .form-group {
              margin: 0;
            }

            .btn-remove {
              background: #dc3545;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 0.7rem;
              cursor: pointer;
              transition: background 0.3s ease;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;

              &:hover {
                background: #c82333;
              }
            }
          }
        }

        .btn-add-item {
          background: #f0f2f5;
          color: #007bff;
          border: 2px dashed #007bff;
          border-radius: 6px;
          padding: 0.8rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;

          &:hover {
            background: #e7eef7;
          }
        }
      }

      .summary-section {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 1rem;
        background: #f9f9f9;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;

          &.total {
            border-top: 2px solid #ddd;
            padding-top: 0.5rem;
            font-weight: 700;
            font-size: 1.1rem;
            color: #1a1a1a;
          }
        }
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;

        button {
          flex: 1;
          padding: 0.8rem;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;

          &.btn-cancel {
            background: #f0f2f5;
            color: #333;

            &:hover {
              background: #e9ecef;
            }
          }

          &.btn-submit {
            background: #007bff;
            color: white;

            &:hover:not(:disabled) {
              background: #0056b3;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    .modal-content {
      max-width: 100%;
      max-height: 100vh;

      .modal-form {
        padding: 1rem;
        gap: 1rem;

        .line-items-section {
          .line-item {
            .line-item-grid {
              grid-template-columns: 1fr;
            }
          }
        }
      }
    }
  }
}
</style>