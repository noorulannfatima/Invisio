<template>
  <div class="parties-container">
    <!-- Page Header -->
    <div class="parties-header">
      <div class="header-content">
        <h1 class="page-title">Party Management</h1>
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i class="fas fa-plus"></i>
          <span class="btn-text">Add New Party</span>
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-icon total"><i class="fas fa-users"></i></span>
        <div class="stat-content">
          <span class="stat-label">Total Parties</span>
          <span class="stat-value">{{ partyStore.partyCount }}</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon customers"><i class="fas fa-user-tie"></i></span>
        <div class="stat-content">
          <span class="stat-label">Customers</span>
          <span class="stat-value">{{ partyStore.customerCount }}</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon suppliers"><i class="fas fa-truck"></i></span>
        <div class="stat-content">
          <span class="stat-label">Suppliers</span>
          <span class="stat-value">{{ partyStore.supplierCount }}</span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search parties..."
          @input="handleSearch"
        />
      </div>

      <div class="filter-controls">
        <select v-model="selectedType" @change="handleFilter" class="filter-select">
          <option value="">All Types</option>
          <option value="Customer">Customers</option>
          <option value="Supplier">Suppliers</option>
          <option value="Both">Both</option>
        </select>

        <button class="btn-refresh" @click="refreshParties" :disabled="partyStore.isLoading">
          <i class="fas fa-sync" :class="{ 'spin': partyStore.isLoading }"></i>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="partyStore.error" class="error-alert">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ partyStore.error }}</span>
      <button class="btn-close" @click="partyStore.clearError">×</button>
    </div>

    <!-- Loading State -->
    <div v-if="partyStore.isLoading && partyStore.parties.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Loading parties...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="partyStore.parties.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <h3>No Parties Found</h3>
      <p>Start by adding your first party (customer or supplier).</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <i class="fas fa-plus"></i>
        Add Party
      </button>
    </div>

    <!-- Parties Table -->
    <div v-else class="table-wrapper">
      <div class="table-container">
        <table class="parties-table">
          <thead>
            <tr>
              <th class="col-name">Party Name</th>
              <th class="col-type">Type</th>
              <th class="col-phone">Phone</th>
              <th class="col-balance">Outstanding Balance</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="party in partyStore.parties" :key="party.Party_ID" class="table-row">
              <td class="col-name">
                <div class="name-cell">
                  <span class="name">{{ party.Name }}</span>
                  <span class="type-badge" :class="`type-${party.Type.toLowerCase()}`">
                    {{ party.Type }}
                  </span>
                </div>
              </td>
              <td class="col-type">
                <span :class="['type-chip', `type-${party.Type.toLowerCase()}`]">
                  <i :class="getTypeIcon(party.Type)"></i>
                  <span class="chip-text">{{ party.Type }}</span>
                </span>
              </td>
              <td class="col-phone">
                <a v-if="party.Mobile" :href="`tel:${party.Mobile}`" class="phone-link">
                  {{ party.Mobile }}
                </a>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="col-balance">
                <span :class="['balance-badge', party.Outstanding_Balance > 0 ? 'has-balance' : '']">
                  {{ formatCurrency(party.Outstanding_Balance) }}
                </span>
              </td>
              <td class="col-actions">
                <div class="actions-group">
                  <button
                    class="btn-action view"
                    @click="openPartyDetails(party)"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    class="btn-action edit"
                    @click="openEditModal(party)"
                    title="Edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="btn-action delete"
                    @click="confirmDelete(party)"
                    title="Delete"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Party Details Modal -->
    <PartyDetailsModal
      v-if="showDetailsModal && selectedParty"
      :party="selectedParty"
      @close="showDetailsModal = false"
    />

    <!-- Create Party Modal -->
    <CreatePartyModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @success="onPartyCreated"
    />

    <!-- Edit Party Modal -->
    <EditPartyModal
      v-if="showEditModal && selectedParty"
      :party="selectedParty"
      @close="showEditModal = false"
      @success="onPartyUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showDeleteConfirm && selectedParty"
      :item-name="selectedParty.Name"
      @confirm="deleteParty"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePartyStore } from '@/store/partyStore';
import PartyDetailsModal from '@/components/Party/PartyDetailsModal.vue';
import CreatePartyModal from '@/components/Party/CreatePartyModal.vue';
import EditPartyModal from '@/components/Party/EditPartyModal.vue';
import ConfirmDeleteModal from '@/components/Common/ConfirmDeleteModal.vue';
import type { Party } from '@/store/partyStore';

const partyStore = usePartyStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const showDeleteConfirm = ref(false);

const selectedParty = ref<Party | null>(null);
const searchQuery = ref('');
const selectedType = ref('');

onMounted(async () => {
  await loadParties();
});

const loadParties = async () => {
  try {
    await partyStore.fetchAllParties();
  } catch (err) {
    console.error('Failed to load parties:', err);
  }
};

const refreshParties = async () => {
  await loadParties();
};

const handleSearch = async () => {
  if (searchQuery.value.length > 0) {
    try {
      await partyStore.searchParties({
        search: searchQuery.value,
        type: selectedType.value as 'Customer' | 'Supplier' | 'Both' | undefined,
      });
    } catch (err) {
      console.error('Search failed:', err);
    }
  } else {
    await loadParties();
  }
};

const handleFilter = async () => {
  try {
    await partyStore.searchParties({
      search: searchQuery.value || undefined,
      type: selectedType.value as 'Customer' | 'Supplier' | 'Both' | undefined,
    });
  } catch (err) {
    console.error('Filter failed:', err);
  }
};

const openPartyDetails = (party: Party) => {
  selectedParty.value = party;
  showDetailsModal.value = true;
};

const openEditModal = (party: Party) => {
  selectedParty.value = party;
  showEditModal.value = true;
};

const confirmDelete = (party: Party) => {
  selectedParty.value = party;
  showDeleteConfirm.value = true;
};

const deleteParty = async () => {
  if (!selectedParty.value) return;

  try {
    await partyStore.deleteParty(selectedParty.value.Party_ID);
    showDeleteConfirm.value = false;
    selectedParty.value = null;
  } catch (err) {
    console.error('Delete failed:', err);
  }
};

const onPartyCreated = () => {
  showCreateModal.value = false;
  refreshParties();
};

const onPartyUpdated = () => {
  showEditModal.value = false;
  refreshParties();
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};
</script>

<style scoped lang="scss">
.parties-container {
  padding: 2rem;
  background-color: #f8f9fb;
  min-height: 100vh;
  margin-left: 260px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    margin-left: 80px;
  }

  @media (max-width: 768px) {
    margin-left: 80px;
    padding: 1.5rem 1rem;
  }

  @media (max-width: 480px) {
    margin-left: 70px;
    padding: 1rem 0.75rem;
  }
}

// Header
.parties-header {
  margin-bottom: 2rem;
  margin-top: 4rem;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .page-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }

    @media (max-width: 480px) {
      font-size: 1.3rem;
    }
  }
}

// Stats Bar
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    @media (max-width: 480px) {
      padding: 1rem;
      gap: 1rem;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      color: white;
      flex-shrink: 0;

      @media (max-width: 480px) {
        width: 40px;
        height: 40px;
        font-size: 1.1rem;
      }

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.customers {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.suppliers {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .stat-label {
        font-size: 0.85rem;
        color: #718096;
        font-weight: 500;

        @media (max-width: 480px) {
          font-size: 0.8rem;
        }
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2d3748;

        @media (max-width: 480px) {
          font-size: 1.25rem;
        }
      }
    }
  }
}

// Filters Section
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
  }

  .search-box {
    flex: 1;
    min-width: 200px;
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    padding: 0 1rem;
    transition: all 0.3s ease;

    @media (max-width: 640px) {
      width: 100%;
      min-width: auto;
    }

    i {
      color: #a0aec0;
      flex-shrink: 0;
    }

    input {
      flex: 1;
      border: none;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      outline: none;
      background: transparent;

      @media (max-width: 480px) {
        font-size: 0.95rem;
        padding: 0.65rem 0.75rem;
      }

      &::placeholder {
        color: #cbd5e0;
      }
    }

    &:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  .filter-controls {
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: 640px) {
      width: 100%;
      gap: 0.75rem;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s ease;

      @media (max-width: 640px) {
        flex: 1;
      }

      @media (max-width: 480px) {
        font-size: 0.95rem;
        padding: 0.65rem 0.75rem;
      }

      &:hover {
        border-color: #cbd5e0;
      }

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }

    .btn-refresh {
      width: 40px;
      height: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #718096;
      transition: all 0.3s ease;
      flex-shrink: 0;

      @media (max-width: 480px) {
        width: 36px;
        height: 36px;
      }

      &:hover:not(:disabled) {
        border-color: #667eea;
        color: #667eea;
        background: #f7fafc;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      i.spin {
        animation: spin 1s linear infinite;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// Error Alert
.error-alert {
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 480px) {
    padding: 0.85rem;
    gap: 0.75rem;
  }

  i {
    flex-shrink: 0;
  }

  span {
    flex: 1;
    font-size: 0.95rem;

    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }

  .btn-close {
    margin-left: auto;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #c53030;
    flex-shrink: 0;
    padding: 0;
    line-height: 1;
  }
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: #718096;
    font-size: 1rem;
  }
}

// Empty State
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
  }

  i {
    font-size: 3rem;
    color: #cbd5e0;
    margin-bottom: 1rem;

    @media (max-width: 480px) {
      font-size: 2.5rem;
    }
  }

  h3 {
    font-size: 1.3rem;
    color: #2d3748;
    margin-bottom: 0.5rem;

    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }

  p {
    color: #718096;
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }
}

// Table Wrapper
.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;

  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.parties-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f7fafc;
    border-bottom: 2px solid #e2e8f0;

    th {
      padding: 1.25rem;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;

      @media (max-width: 768px) {
        padding: 1rem 0.75rem;
        font-size: 0.8rem;
      }

      @media (max-width: 480px) {
        padding: 0.75rem 0.5rem;
        font-size: 0.75rem;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f7fafc;
      }
    }
  }

  td {
    padding: 1.25rem;
    color: #2d3748;

    @media (max-width: 768px) {
      padding: 1rem 0.75rem;
      font-size: 0.9rem;
    }

    @media (max-width: 480px) {
      padding: 0.75rem 0.5rem;
      font-size: 0.8rem;
    }
  }

  .col-name {
    min-width: 200px;

    @media (max-width: 640px) {
      min-width: 150px;
    }
  }

  .col-type {
    min-width: 120px;

    @media (max-width: 640px) {
      min-width: 100px;
    }
  }

  .col-phone {
    min-width: 130px;

    @media (max-width: 640px) {
      min-width: 110px;
    }
  }

  .col-balance {
    min-width: 150px;

    @media (max-width: 640px) {
      min-width: 130px;
    }
  }

  .col-actions {
    min-width: 130px;
    text-align: center;

    @media (max-width: 640px) {
      min-width: 100px;
    }
  }

  .name-cell {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .name {
      font-weight: 600;
      color: #2d3748;
      word-break: break-word;
    }

    .type-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      width: fit-content;

      &.type-customer {
        background: rgba(240, 147, 251, 0.2);
        color: #d946a6;
      }

      &.type-supplier {
        background: rgba(79, 172, 254, 0.2);
        color: #0ea5e9;
      }

      &.type-both {
        background: rgba(102, 126, 234, 0.2);
        color: #667eea;
      }
    }
  }

  .type-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
    width: fit-content;

    @media (max-width: 480px) {
      padding: 0.4rem 0.6rem;
      font-size: 0.75rem;
    }

    &.type-customer {
      background: rgba(240, 147, 251, 0.15);
      color: #d946a6;
    }

    &.type-supplier {
      background: rgba(79, 172, 254, 0.15);
      color: #0ea5e9;
    }

    &.type-both {
      background: rgba(102, 126, 234, 0.15);
      color: #667eea;
    }

    i {
      font-size: 0.8rem;
    }

    .chip-text {
      white-space: nowrap;
    }
  }

  .phone-link {
    color: #667eea;
    text-decoration: none;
    transition: color 0.3s ease;
    word-break: break-word;

    &:hover {
      color: #764ba2;
      text-decoration: underline;
    }
  }

  .balance-cell {
    .balance-badge {
      background: #e6f7ed;
      color: #22543d;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
      display: inline-block;
      white-space: nowrap;

      @media (max-width: 480px) {
        padding: 0.4rem 0.6rem;
        font-size: 0.8rem;
      }

      &.has-balance {
        background: #fef5e7;
        color: #b7791f;
      }
    }
  }

  .text-muted {
    color: #a0aec0;
  }

  .actions-group {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;

    @media (max-width: 640px) {
      gap: 0.25rem;
    }
  }

  .btn-action {
    width: 36px;
    height: 36px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    flex-shrink: 0;

    @media (max-width: 640px) {
      width: 32px;
      height: 32px;
      font-size: 0.8rem;
    }

    @media (max-width: 480px) {
      width: 30px;
      height: 30px;
      font-size: 0.75rem;
    }

    &.view {
      &:hover {
        border-color: #667eea;
        color: #667eea;
        background: #f0f4ff;
      }
    }

    &.edit {
      &:hover {
        border-color: #48bb78;
        color: #48bb78;
        background: #f0fff4;
      }
    }

    &.delete {
      &:hover {
        border-color: #f56565;
        color: #f56565;
        background: #fff5f5;
      }
    }
  }
}

// Button Styles
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  white-space: nowrap;

  @media (max-width: 640px) {
    padding: 0.65rem 1.25rem;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;

    .btn-text {
      display: none;
    }

    &::before {
      content: '+';
    }
  }

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    @media (max-width: 640px) {
      width: 100%;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// Scrollbar Styling
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: transparent;
}

.table-container::-webkit-scrollbar-thumb {
  background: rgba(160, 174, 192, 0.3);
  border-radius: 4px;

  &:hover {
    background: rgba(160, 174, 192, 0.5);
  }
}

// Large Desktop with Sidebar
@media (min-width: 1200px) {
  .parties-container {
    margin-left: 260px;
  }
}

// Tablet with Collapsed Sidebar
@media (max-width: 1024px) and (min-width: 769px) {
  .parties-container {
    margin-left: 80px;
  }
}

// Responsive Typography
@media (max-width: 640px) {
  .page-title {
    font-size: 1.4rem;
  }

  .stat-value {
    font-size: 1.3rem;
  }

  .parties-table {
    font-size: 0.85rem;

    th,
    td {
      padding: 0.75rem 0.5rem;
    }
  }
}

// Extra Small Screens
@media (max-width: 360px) {
  .parties-container {
    padding: 0.75rem 0.5rem;
  }

  .parties-header {
    margin-bottom: 1.5rem;

    .page-title {
      font-size: 1.2rem;
    }
  }

  .stats-bar {
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    .stat-item {
      padding: 0.75rem;
      gap: 0.5rem;

      .stat-icon {
        width: 36px;
        height: 36px;
        font-size: 1rem;
      }

      .stat-content {
        .stat-label {
          font-size: 0.7rem;
        }

        .stat-value {
          font-size: 1rem;
        }
      }
    }
  }

  .filters-section {
    gap: 0.5rem;
    margin-bottom: 1.5rem;

    .search-box {
      padding: 0 0.75rem;

      input {
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
      }
    }

    .filter-controls {
      gap: 0.5rem;

      .filter-select {
        padding: 0.5rem 0.6rem;
        font-size: 0.85rem;
      }

      .btn-refresh {
        width: 32px;
        height: 32px;
      }
    }
  }

  .parties-table {
    font-size: 0.75rem;

    th {
      padding: 0.5rem 0.35rem;
      font-size: 0.65rem;
    }

    td {
      padding: 0.5rem 0.35rem;
    }

    .btn-action {
      width: 28px;
      height: 28px;
      font-size: 0.65rem;
    }
  }
}

</style>
