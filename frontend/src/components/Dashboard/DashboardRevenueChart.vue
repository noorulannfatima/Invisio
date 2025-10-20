<!-- DashboardRevenueChart.vue-->
<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>Revenue Trend</h3>
    </div>
    <div class="card-body chart-body">
      <canvas ref="revenueChartRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useCompanyStore } from '@/store/companyStore';

const companyStore = useCompanyStore();
const revenueChartRef = ref<HTMLCanvasElement | null>(null);
let revenueChart: Chart | null = null;

onMounted(() => {
  setTimeout(() => {
    initRevenueChart();
  }, 100);
});

watch(
  () => companyStore.company,
  () => {
    if (companyStore.company && revenueChartRef.value) {
      updateChart();
    }
  }
);

const initRevenueChart = () => {
  if (!revenueChartRef.value) return;

  const ctx = revenueChartRef.value.getContext('2d');
  if (!ctx) return;

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

const updateChart = () => {
  // Chart updates automatically
};
</script>

<style scoped lang="scss">
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

@media (max-width: 768px) {
  .card-header {
    padding: 1rem;

    h3 {
      font-size: 1rem;
    }
  }

  .card-body {
    padding: 1rem;
  }

  .chart-body {
    min-height: 250px;
  }
}
</style>

---
