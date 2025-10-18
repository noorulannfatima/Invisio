<template>
  <div class="dashboard">
    <!-- Dashboard Title -->
    <h1 class="dashboard-title">Dashboard</h1>

    <!-- Action Bar -->
    <div class="action-bar">
      <button v-if="!companyStore.isCompanyCreated" class="btn btn-primary" @click="openCreateCompanyModal">
        <span class="icon">+</span>
        Create Company
      </button>
      <div v-else class="company-info-bar">
        <span class="company-name">{{ companyStore.companyName }}</span>
        <button class="btn btn-secondary" @click="openEditCompanyModal">Edit</button>
      </div>
    </div>

    <!-- Welcome Section -->
    <section v-if="!companyStore.isCompanyCreated" class="welcome-section">
      <div class="welcome-card">
        <h2>Welcome to Invisio</h2>
        <p>Get started by creating your first company to begin managing your business operations.</p>
        <button class="btn btn-large btn-primary" @click="openCreateCompanyModal">
          Create Your First Company
        </button>
      </div>
    </section>

    <!-- Main Dashboard Content -->
    <template v-else>
      <!-- Quick Stats Row -->
      <div class="quick-stats-row">
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon parties">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Parties</span>
              <span class="stat-value">0</span>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon items">
              <i class="fas fa-box"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Items</span>
              <span class="stat-value">0</span>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon transactions">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Transactions</span>
              <span class="stat-value">0</span>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon expenses">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Expenses</span>
              <span class="stat-value">0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid: Finance Left, Company & Owner Right -->
      <div class="main-grid">
        <!-- Left Section: Finance -->
        <div class="left-section">
          <!-- Finance Overview Card -->
          <div class="card finance-card">
            <div class="card-header">
              <h3>Finance Overview</h3>
              <button class="btn-icon" @click="refreshCompanyData" :disabled="isRefreshing">
                <i class="fas fa-sync"></i>
              </button>
            </div>
            <div class="card-body">
              <div class="finance-item">
                <span class="label">Total Revenue</span>
                <span class="value">$0.00</span>
              </div>
              <div class="finance-item">
                <span class="label">Total Expenses</span>
                <span class="value">$0.00</span>
              </div>
              <div class="finance-item">
                <span class="label">Net Profit</span>
                <span class="value positive">$0.00</span>
              </div>
              <div class="finance-item">
                <span class="label">Pending Transactions</span>
                <span class="value">0</span>
              </div>
              <router-link to="/finance" class="view-link">
                View Details <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </div>

          <!-- Revenue Chart -->
          <div class="card chart-card">
            <div class="card-header">
              <h3>Revenue Trend</h3>
            </div>
            <div class="card-body chart-body">
              <canvas ref="revenueChartRef"></canvas>
            </div>
          </div>
        </div>

        <!-- Right Section: Company & Owner -->
        <div class="right-section">
          <!-- Company Overview Card -->
          <div class="card company-card">
            <div class="card-header">
              <h3>Company Details</h3>
            </div>
            <div class="card-body">
              <div class="overview-item">
                <span class="label">Company Name</span>
                <span class="value">{{ companyStore.companyName }}</span>
              </div>
              <div class="overview-item">
                <span class="label">Address</span>
                <span class="value">{{ companyStore.company?.Address || 'Not provided' }}</span>
              </div>
              <div class="overview-item">
                <span class="label">Email</span>
                <span class="value">{{ companyStore.company?.Email || 'Not provided' }}</span>
              </div>
              <div class="overview-item">
                <span class="label">Created</span>
                <span class="value">{{ formatDate(companyStore.company?.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Owner Information Card -->
          <div class="card owner-card">
            <div class="card-header">
              <h3>Company Owner</h3>
            </div>
            <div class="card-body">
              <div class="owner-info">
                <div class="owner-avatar">{{ getInitials(authStore.user?.Username) }}</div>
                <div class="owner-details">
                  <h4>{{ authStore.user?.Username }}</h4>
                  <p class="email">{{ authStore.user?.Email }}</p>
                  <p class="phone">{{ authStore.user?.Mobile_Number }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Expense Distribution Chart -->
          <div class="card chart-card">
            <div class="card-header">
              <h3>Expense Distribution</h3>
            </div>
            <div class="card-body chart-body">
              <canvas ref="expenseChartRef"></canvas>
            </div>
          </div>
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
    <EditCompanyModal v-if="showEditModal" @close="showEditModal = false" @success="onCompanyUpdated" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useCompanyStore } from '@/store/companyStore';
import { useAuthStore } from '@/store/authStore';
import CreateCompanyModal from '@/components/CreateCompanyModal.vue';
import EditCompanyModal from '@/components/EditCompanyModal.vue';

const authStore = useAuthStore();
const companyStore = useCompanyStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const isRefreshing = ref(false);

// Chart references
const revenueChartRef = ref<HTMLCanvasElement | null>(null);
const expenseChartRef = ref<HTMLCanvasElement | null>(null);
let revenueChart: Chart | null = null;
let expenseChart: Chart | null = null;

onMounted(async () => {
  // Fetch company data on component mount
  try {
    await companyStore.fetchMyCompany();
    // Initialize charts after a small delay to ensure DOM is ready
    setTimeout(() => {
      initializeCharts();
    }, 100);
  } catch (err) {
    console.error('Failed to fetch company:', err);
  }
});

// Watch for company data changes and reinitialize charts
watch(
  () => companyStore.company,
  () => {
    if (companyStore.company && revenueChartRef.value) {
      updateCharts();
    }
  }
);

const initializeCharts = () => {
  initRevenueChart();
  initExpenseChart();
};

const initRevenueChart = () => {
  if (!revenueChartRef.value) return;

  const ctx = revenueChartRef.value.getContext('2d');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (revenueChart) {
    revenueChart.destroy();
  }

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(102, 126, 234)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#718096',
            font: {
              size: 12,
              weight: 'bold',
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: '#718096',
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#718096',
          },
        },
      },
    },
  });
};

const initExpenseChart = () => {
  if (!expenseChartRef.value) return;

  const ctx = expenseChartRef.value.getContext('2d');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Utilities', 'Supplies', 'Services', 'Other'],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(240, 147, 251, 0.8)',
            'rgba(79, 172, 254, 0.8)',
            'rgba(67, 233, 123, 0.8)',
          ],
          borderColor: [
            'rgb(102, 126, 234)',
            'rgb(240, 147, 251)',
            'rgb(79, 172, 254)',
            'rgb(67, 233, 123)',
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#718096',
            font: {
              size: 12,
            },
            padding: 15,
          },
        },
      },
    },
  });
};

const updateCharts = () => {
  // Update charts with new data if needed
  // For now, they display placeholder data
};

const openCreateCompanyModal = () => {
  showCreateModal.value = true;
};

const openEditCompanyModal = () => {
  showEditModal.value = true;
};

const onCompanyCreated = () => {
  showCreateModal.value = false;
};

const onCompanyUpdated = () => {
  showEditModal.value = false;
};

const refreshCompanyData = async () => {
  isRefreshing.value = true;
  try {
    await companyStore.fetchMyCompany();
  } catch (err) {
    console.error('Failed to refresh company data:', err);
  } finally {
    isRefreshing.value = false;
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
</script>

<style scoped lang="scss">
// Dashboard Container
.dashboard {
  margin-left: 260px;
  margin-top: 70px;
  padding: 2rem;
  background-color: #f8f9fb;
  min-height: calc(100vh - 70px);

  .dashboard-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #222;
    margin-bottom: 1.5rem;
  }
}

// Action Bar
.action-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  .company-info-bar {
    display: flex;
    gap: 1rem;
    align-items: center;

    .company-name {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
    }
  }
}

// Welcome Section
.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  margin-bottom: 2rem;

  .welcome-card {
    background: white;
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    max-width: 500px;

    h2 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #2d3748;
    }

    p {
      color: #718096;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
  }
}

// Quick Stats Row
.quick-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;

      &.parties {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.items {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.transactions {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.expenses {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-label {
        color: #718096;
        font-size: 0.85rem;
        font-weight: 500;
      }

      .stat-value {
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: 700;
      }
    }
  }
}

// Main Grid Layout
.main-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

// Card Styles
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #2d3748;
    font-weight: 600;
  }

  .btn-icon {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #718096;
    transition: color 0.3s ease, transform 0.3s ease;

    &:hover:not(:disabled) {
      color: #667eea;
      transform: rotate(180deg);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.card-body {
  padding: 1.5rem;
}

.chart-body {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

// Finance Card
.finance-card {
  .finance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #f0f4f8;

    &:last-of-type {
      border-bottom: none;
    }

    .label {
      color: #718096;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .value {
      color: #2d3748;
      font-weight: 700;
      font-size: 1.1rem;

      &.positive {
        color: #38a169;
      }
    }
  }

  .view-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: #764ba2;
    }

    i {
      font-size: 0.9rem;
    }
  }
}

// Company Card
.company-card {
  .overview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #f0f4f8;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #718096;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .value {
      color: #2d3748;
      font-weight: 600;
      text-align: right;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// Owner Card
.owner-card {
  .owner-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .owner-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .owner-details {
    flex: 1;

    h4 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
      font-size: 1.05rem;
      font-weight: 600;
    }

    p {
      margin: 0.25rem 0;
      color: #718096;
      font-size: 0.9rem;

      &.email {
        color: #667eea;
      }
    }
  }
}

// Loading State
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

// Error Banner
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

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }

  &.btn-secondary {
    background: #edf2f7;
    color: #2d3748;

    &:hover {
      background: #e2e8f0;
    }
  }

  &.btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .icon {
    font-weight: bold;
  }
}

// Responsive Design
@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .right-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .dashboard {
    margin-left: 0;
    margin-top: 60px;
    padding: 1.5rem;

    .dashboard-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  }

  .quick-stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    .stat-card {
      padding: 1rem;

      .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }

      .stat-info .stat-value {
        font-size: 1.2rem;
      }
    }
  }

  .main-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .action-bar {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 1rem;

    .dashboard-title {
      font-size: 1.3rem;
    }
  }

  .quick-stats-row {
    grid-template-columns: 1fr;
    gap: 1rem;

    .stat-card {
      .stat-content {
        gap: 0.75rem;
      }
    }
  }

  .card-body {
    padding: 1rem;
  }

  .card-header {
    padding: 1rem;
  }
}
</style>