<!-- components/Transaction/CreateBillModal.vue -->
<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-file-invoice"></i>
          Create Bill
        </h2>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="submitBill" class="modal-form">
        <!-- Supplier Selection -->
        <div class="form-group">
          <label for="supplier" class="form-label">Supplier *</label>
          <select
            id="supplier"
            v-model="formData.Party_ID"
            class="form-input"
            required
          >
            <option :value="null">Select a supplier</option>
            <option
              v-for="party in suppliers"
              :key="party.Party_ID"
              :value="party.Party_ID"
            >
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
            <div
              v-for="(item, index) in formData.Line_Items"
              :key="index"
              class="line-item"
            >
              <div class="line-item-grid">
                <div class="form-group">
                  <label class="form-label small">Item *</label>
                  <select
                    v-model="item.Item_ID"
                    class="form-input"
                    @change="onItemSelected(index, item.Item_ID)"
                    required
                  >
                    <option :value="0">Select an item</option>
                    <option
                      v-for="availableItem in items"
                      :key="availableItem.Item_ID"
                      :value="availableItem.Item_ID"
                    >
                      {{ availableItem.Name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label small">Quantity *</label>
                  <input
                    v-model.number="item.Quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label small">Rate *</label>
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
                    placeholder="0.00"
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
            {{ loading ? 'Creating...' : 'Create Bill' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTransactionStore, type LineItem } from '@/store/transactionStore';

const emit = defineEmits<{
  'close': [];
  'bill-created': [];
}>();

const store = useTransactionStore();
const loading = ref(false);
const suppliers = ref<any[]>([]);
const items = ref<any[]>([]);

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

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/party', {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      suppliers.value = data.parties.filter(
        (p: any) => p.Type === 'Supplier' || p.Type === 'Both'
      );
    }

    const itemsResponse = await fetch('http://localhost:3000/api/item', {
      credentials: 'include',
    });
    if (itemsResponse.ok) {
      const itemsData = await itemsResponse.json();
      items.value = itemsData.items || [];
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

const onItemSelected = (index: number, itemId: number) => {
  const selectedItem = items.value.find((item) => item.Item_ID === itemId);
  if (selectedItem) {
    formData.value.Line_Items[index].Item_Name = selectedItem.Name;
    if (selectedItem.Purchase_Price) {
      formData.value.Line_Items[index].Rate = selectedItem.Purchase_Price;
    } else if (selectedItem.Sale_Price || selectedItem.Selling_Price) {
      formData.value.Line_Items[index].Rate =
        selectedItem.Sale_Price || selectedItem.Selling_Price;
    }
  }
};

const calculateLineTotal = (item: LineItem): number => {
  const quantity = item.Quantity || 0;
  const rate = item.Rate || 0;
  const discount = item.Discount || 0;
  return quantity * rate - discount;
};

const subtotal = computed(() =>
  formData.value.Line_Items.reduce(
    (sum, item) => sum + calculateLineTotal(item),
    0
  )
);

const taxAmount = computed(
  () => subtotal.value * (formData.value.GST_Rate / 100)
);

const total = computed(() => subtotal.value + taxAmount.value);

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

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

const removeLineItem = (index: number) =>
  formData.value.Line_Items.splice(index, 1);

const submitBill = async () => {
  if (!formData.value.Party_ID) return alert('Please select a supplier');
  if (formData.value.Line_Items.length === 0)
    return alert('Please add at least one item');
  if (formData.value.Line_Items.some((item) => !item.Item_ID || item.Item_ID === 0))
    return alert('Please select an item for all line items');

  loading.value = true;
  try {
    const payload = {
      Party_ID: formData.value.Party_ID,
      Date: formData.value.Date,
      GST_Rate: formData.value.GST_Rate,
      Line_Items: formData.value.Line_Items.map((item) => ({
        Item_ID: item.Item_ID,
        Item_Name: item.Item_Name,
        Quantity: item.Quantity,
        Rate: item.Rate,
        Discount: item.Discount,
        Line_Total: calculateLineTotal(item),
      })),
      Payment_Mode: formData.value.Payment_Mode || undefined,
    };

    await store.createPurchaseBill(payload);
    emit('bill-created');
    emit('close');
  } catch (err) {
    console.error('Failed to create bill:', err);
    alert('Failed to create bill. Please try again.');
  } finally {
    loading.value = false;
  }
};

const closeModal = () => emit('close');
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start; /* instead of center for natural scroll */
  justify-content: center;
  padding: 2rem;
  z-index: 1000;
  overflow-y: auto; /* allow background scroll if modal is tall */



.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh; /* limit height */
  overflow-y: auto; /* enable vertical scroll */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
 

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.2rem 1.5rem;
      border-bottom: 1px solid #eee;

      .modal-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.4rem;
        font-weight: 700;
        color: #1a1a1a;

        i {
          color: #dc3545;
        }
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #999;
        cursor: pointer;

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
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.4rem;
        }

        .form-input {
          padding: 0.7rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;

          &:focus {
            outline: none;
            border-color: #dc3545;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
          }
        }
      }

      .line-items-section {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;

        .line-item {
          background: #fafafa;
          border-radius: 6px;
          padding: 0.8rem;

          .line-item-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 0.6rem;
            align-items: end;

            .btn-remove {
              background: #dc3545;
              color: #fff;
              border: none;
              border-radius: 6px;
              padding: 0.6rem;
              cursor: pointer;
              transition: 0.3s;

              &:hover {
                background: #c82333;
              }
            }
          }
        }

        .btn-add-item {
          background: #f0f2f5;
          color: #dc3545;
          border: 2px dashed #dc3545;
          border-radius: 6px;
          padding: 0.8rem;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          justify-content: center;
          gap: 0.5rem;

          &:hover {
            background: #ffe7eb;
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

          &.total {
            font-weight: 700;
            font-size: 1.1rem;
            border-top: 2px solid #ddd;
            padding-top: 0.5rem;
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
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;

          &.btn-cancel {
            background: #f0f2f5;

            &:hover {
              background: #e9ecef;
            }
          }

          &.btn-submit {
            background: #dc3545;
            color: #fff;

            &:hover:not(:disabled) {
              background: #c82333;
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
    padding: 1rem;

    .modal-content {
      width: 100%;
      max-height: 100vh;
      overflow-y: auto;

      .line-item-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
