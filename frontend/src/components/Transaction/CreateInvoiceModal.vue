<!-- components/Transaction/CreateInvoiceModal.vue -->
<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-file-invoice-dollar"></i>
          Create Invoice
        </h2>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitInvoice" class="modal-form">
        <!-- Customer -->
        <div class="form-group">
          <label for="customer" class="form-label">Customer *</label>
          <select id="customer" v-model="formData.Party_ID" class="form-input" required>
            <option :value="null">Select a customer</option>
            <option
              v-for="party in customers"
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
                    @change="onItemSelect(index)"
                    class="form-input"
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

            <button type="button" class="btn-add-item" @click="addLineItem">
              <i class="fas fa-plus"></i>
              Add Item
            </button>
          </div>
        </div>

        <!-- Payment Mode -->
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

        <!-- Actions -->
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

const emit = defineEmits<{
  close: [];
  'invoice-created': [];
}>();

const store = useTransactionStore();
const loading = ref(false);
const customers = ref<any[]>([]);
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
  Line_Items: [{ Item_ID: 0, Item_Name: '', Quantity: 1, Rate: 0, Discount: 0, Line_Total: 0 }],
});

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/party', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      customers.value = data.parties.filter((p: any) => p.Type === 'Customer' || p.Type === 'Both');
    }
    const itemsRes = await fetch('http://localhost:3000/api/item', { credentials: 'include' });
    if (itemsRes.ok) {
      const itemsData = await itemsRes.json();
      items.value = itemsData.items || [];
    }
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }
});

const onItemSelect = (index: number) => {
  const selected = items.value.find(i => i.Item_ID === formData.value.Line_Items[index].Item_ID);
  if (selected) {
    formData.value.Line_Items[index].Item_Name = selected.Name;
    formData.value.Line_Items[index].Rate = selected.Selling_Price || selected.Sale_Price || 0;
  }
};

const calculateLineTotal = (item: LineItem) => (item.Quantity || 0) * (item.Rate || 0) - (item.Discount || 0);
const subtotal = computed(() => formData.value.Line_Items.reduce((sum, i) => sum + calculateLineTotal(i), 0));
const taxAmount = computed(() => subtotal.value * (formData.value.GST_Rate / 100));
const total = computed(() => subtotal.value + taxAmount.value);
const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const addLineItem = () => formData.value.Line_Items.push({ Item_ID: 0, Item_Name: '', Quantity: 1, Rate: 0, Discount: 0, Line_Total: 0 });
const removeLineItem = (index: number) => formData.value.Line_Items.splice(index, 1);

const submitInvoice = async () => {
  if (!formData.value.Party_ID) return alert('Please select a customer');
  if (formData.value.Line_Items.some(i => !i.Item_ID)) return alert('Please select all items');
  loading.value = true;
  try {
    const payload = {
      ...formData.value,
      Line_Items: formData.value.Line_Items.map(i => ({ ...i, Line_Total: calculateLineTotal(i) })),
    };
    await store.createInvoice(payload);
    emit('invoice-created');
    emit('close');
  } catch (err) {
    console.error('Failed to create invoice:', err);
    alert('Failed to create invoice. Please try again.');
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
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
  z-index: 1000;
  overflow-y: auto;
}

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
        color: #007bff;
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
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
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
            background: #007bff;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 0.6rem;
            cursor: pointer;
            transition: 0.3s;

            &:hover {
              background: #0056b3;
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
        display: flex;
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
          background: #007bff;
          color: #fff;
          &:hover:not(:disabled) {
            background: #0056b3;
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
