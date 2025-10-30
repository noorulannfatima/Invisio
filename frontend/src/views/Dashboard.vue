<!-- views/Dashboard.vue -->
<template>
  <div class="dashboard">

    <!-- Action Bar -->
    <DashboardActionBar
      :is-company-created="companyStore.isCompanyCreated"
      @create-company="openCreateCompanyModal"
    />
    <!-- Welcome Section -->
    <DashboardWelcome
      v-if="!companyStore.isCompanyCreated"
      @create-company="openCreateCompanyModal"
    />

    <!-- Main Dashboard Content -->
    <template v-else>
      <!-- Quick Stats -->
      <DashboardQuickStats />

      <!-- Main Grid -->
      <div class="main-grid">
        <!-- Left Section: Finance -->
        <div class="left-section">
          <DashboardFinanceCard @refresh="refreshCompanyData" :is-refreshing="isRefreshing" />
          <DashboardRevenueChart />
        </div>

        <!-- Right Section: Company & Owner -->
        <div class="right-section">
       
          <DashboardExpenseChart />
        </div>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="companyStore.isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Error State -->
    <div v-if="companyStore.error" class="error-banner">
      <span>{{ companyStore.error }}</span>
      <button class="btn-close" @click="companyStore.clearError">×</button>
    </div>

    <!-- Modals -->
    <CreateCompanyModal v-if="showCreateModal" @close="showCreateModal = false" @success="onCompanyCreated" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCompanyStore } from '@/store/companyStore';
import { useItemStore } from '@/store/itemStore';

// Import Dashboard Components
import DashboardActionBar from '@/components/Dashboard/DashboardActionBar.vue';
import DashboardWelcome from '@/components/Dashboard/DashboardWelcome.vue';
import DashboardQuickStats from '@/components/Dashboard/DashboardQuickStats.vue';
import DashboardFinanceCard from '@/components/Dashboard/DashboardFinanceCard.vue';
import DashboardRevenueChart from '@/components/Dashboard/DashboardRevenueChart.vue';
import DashboardExpenseChart from '@/components/Dashboard/DashboardExpenseChart.vue';

// Import Modals
import CreateCompanyModal from '@/components/Company/CreateCompanyModal.vue';


const companyStore = useCompanyStore();
const itemStore = useItemStore();

const showCreateModal = ref(false);
const isRefreshing = ref(false);

onMounted(async () => {
  try {
    await companyStore.fetchMyCompany();
    await loadInventoryData();
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }
});

const loadInventoryData = async () => {
  try {
    await itemStore.fetchInventoryValuation(10);
  } catch (err) {
    console.error('Failed to load inventory data:', err);
  }
};

const openCreateCompanyModal = () => {
  showCreateModal.value = true;
};


const onCompanyCreated = () => {
  showCreateModal.value = false;
};


const refreshCompanyData = async () => {
  isRefreshing.value = true;
  try {
    await companyStore.fetchMyCompany();
    await loadInventoryData();
  } catch (err) {
    console.error('Failed to refresh data:', err);
  } finally {
    isRefreshing.value = false;
  }
};
</script>

<style scoped lang="scss">
.dashboard {
  margin-left: 260px;
  margin-top: 70px;
  padding: 2rem;
  background-color: #f5f6fa;
  min-height: calc(100vh - 70px);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1.5rem;
  }
}

.main-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.left-section,
.right-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.loading-overlay {
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

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
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

.error-banner {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  z-index: 999;

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #c53030;
  }
}

@media (max-width: 480px) {
  .dashboard {
    margin-top: 50px;
    padding: 1rem;
  }

  .main-grid {
    gap: 1.5rem;
  }

  .error-banner {
    left: 1rem;
    right: 1rem;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>