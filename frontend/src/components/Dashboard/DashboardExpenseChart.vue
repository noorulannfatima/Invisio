<!--DashboardExpenseChart.vue-->
<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>Expense Distribution</h3>
    </div>
    <div class="card-body chart-body">
      <canvas ref="expenseChartRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useCompanyStore } from '@/store/companyStore';

const companyStore = useCompanyStore();
const expenseChartRef = ref<HTMLCanvasElement | null>(null);
let expenseChart: Chart | null = null;

onMounted(() => {
  setTimeout(() => {
    initExpenseChart();
  }, 100);
});

watch(
  () => companyStore.company,
  () => {
    if (companyStore.company && expenseChartRef.value) {
      updateChart();
    }
  }
);

const initExpenseChart = () => {
  if (!expenseChartRef.value) return;

  const ctx = expenseChartRef.value.getContext('2d');
  if (!ctx) return;

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
