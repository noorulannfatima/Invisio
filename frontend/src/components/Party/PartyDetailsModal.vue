<!-- PartyDetailsModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Party Details</h2>
        <button class="btn-close" @click="closeModal" aria-label="Close modal">×</button>
      </div>

      <div v-if="isLoading" class="modal-loading">
        <div class="spinner"></div>
        <p>Loading details...</p>
      </div>

      <div v-else class="modal-body">
        <!-- Party Name -->
        <div class="detail-row">
          <span class="label">Party Name</span>
          <span class="value">{{ party.Name }}</span>
        </div>

        <!-- Party Type -->
        <div class="detail-row">
          <span class="label">Type</span>
          <span :class="['value', `type-${party.Type.toLowerCase()}`]">
            <i :class="getTypeIcon(party.Type)"></i>
            {{ party.Type }}
          </span>
        </div>

        <!-- Phone Number -->
        <div class="detail-row">
          <span class="label">Phone</span>
          <span class="value">
            <a v-if="party.Mobile" :href="`tel:${party.Mobile}`" class="link">
              {{ party.Mobile }}
            </a>
            <span v-else class="text-muted">—</span>
          </span>
        </div>

        <!-- Outstanding Balance -->
        <div class="detail-row">
          <span class="label">Outstanding Balance</span>
          <span :class="['value', 'balance', party.Outstanding_Balance > 0 ? 'has-balance' : '']">
            {{ formatCurrency(party.Outstanding_Balance) }}
          </span>
        </div>

        <!-- Created Date -->
        <div class="detail-row">
          <span class="label">Created</span>
          <span class="value">{{ formatDate(party.createdAt) }}</span>
        </div>

        <!-- Last Updated -->
        <div class="detail-row">
          <span class="label">Last Updated</span>
          <span class="value">{{ formatDate(party.updatedAt) }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePartyStore } from '@/store/partyStore';
import type { Party } from '@/store/partyStore';

interface Props {
  party: Party;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const partyStore = usePartyStore();
const isLoading = ref(false);

onMounted(async () => {
  // Optionally fetch fresh data from store if needed
  // Uncomment if you want to fetch updated party details
  // isLoading.value = true;
  // try {
  //   await partyStore.fetchPartyById(props.party.Party_ID);
  // } finally {
  //   isLoading.value = false;
  // }
});

const closeModal = () => {
  emit('close');
};

const formatDate = (date?: string): string => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

const formatCurrency = (amount: number): string => {
  return `Rs ${(amount || 0).toFixed(0)}`;
};

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'Customer':
      return 'fas fa-user-tie';
    case 'Supplier':
      return 'fas fa-truck';
    case 'Both':
      return 'fas fa-exchange-alt';
    default:
      return 'fas fa-user';
  }
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
  padding: 1rem;
  overflow-y: auto;

  @media (max-width: 640px) {
    padding: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    align-items: flex-end;
    animation: slideUp 0.3s ease;
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

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    border-radius: 12px 12px 0 0;
    max-height: calc(100vh - 60px);
    width: 100%;
  }

  @media (max-width: 360px) {
    border-radius: 8px 8px 0 0;
  }
}

@keyframes modalSlideIn {
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
  flex-shrink: 0;

  @media (max-width: 640px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: #1a202c;

    @media (max-width: 640px) {
      font-size: 1.15rem;
    }

    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #718096;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    border-radius: 4px;

    &:hover {
      color: #2d3748;
      background: #f7fafc;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: #718096;
    font-size: 0.95rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;

  @media (max-width: 640px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
}

.detail-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f4f8;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 100px 1fr;
    padding: 0.85rem 0;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.35rem;
    padding: 0.75rem 0;
  }

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #718096;
    font-weight: 600;
    font-size: 0.95rem;

    @media (max-width: 640px) {
      font-size: 0.9rem;
    }

    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }

  .value {
    color: #2d3748;
    font-weight: 500;
    word-break: break-word;

    @media (max-width: 480px) {
      font-size: 0.9rem;
    }

    &.type-customer {
      color: #d946a6;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    &.type-supplier {
      color: #0ea5e9;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    &.type-both {
      color: #667eea;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    &.balance {
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      background: #e6f7ed;
      color: #22543d;
      display: inline-block;
      font-weight: 600;

      &.has-balance {
        background: #fef5e7;
        color: #b7791f;
      }
    }

    i {
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        color: #764ba2;
        text-decoration: underline;
      }
    }

    .text-muted {
      color: #a0aec0;
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
  flex-shrink: 0;

  @media (max-width: 640px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    flex-direction: column-reverse;

    .btn {
      width: 100%;
    }
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  white-space: nowrap;

  @media (max-width: 640px) {
    padding: 0.65rem 1.25rem;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    padding: 0.65rem 1rem;
    font-size: 0.9rem;
  }

  &.btn-secondary {
    background: #edf2f7;
    color: #2d3748;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #e2e8f0;
    }

    &:active {
      background: #cbd5e0;
    }
  }
}

// Scrollbar Styling
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(160, 174, 192, 0.3);
  border-radius: 3px;

  &:hover {
    background: rgba(160, 174, 192, 0.5);
  }
}
</style>