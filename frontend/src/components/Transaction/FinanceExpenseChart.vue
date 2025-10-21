<template>
  <div class="chart-card expense-chart">
    <div class="chart-header">
      <h3 class="chart-title">
        <i class="fas fa-chart-bar"></i>
        Purchase Expenses
      </h3>
      <span class="chart-period">Last 30 Days</span>
    </div>

    <canvas v-if="chartReady" ref="chartCanvas"></canvas>
    <div v-else class="chart-placeholder">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading chart...</p>
    </div>

    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Total Expenses</span>
        <span class="stat-value">{{ formatCurrency(totalExpenses) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Avg Per Day</span>
        <span class="stat-value">{{ formatCurrency(avgPerDay) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Transactions</span>
        <span class="stat-value">{{ invoices.length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import type { Invoice } from '@/store/transactionStore';

const props = defineProps<{
  invoices: Invoice[];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);
const chartReady = ref(false);

const totalExpenses = computed(() => 
  props.invoices.reduce((sum, inv) => sum + inv.Total_Amount, 0)
);

const avgPerDay = computed(() => {
  if (props.invoices.length === 0) return 0;
  return totalExpenses.value / 30;
});

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const groupByDate = () => {
  const grouped: Record<string, number> = {};

  props.invoices.forEach(inv => {
    const date = inv.Date;
    grouped[date] = (grouped[date] || 0) + inv.Total_Amount;
  });

  return grouped;
};

const initChart = () => {
  if (!chartCanvas.value) return;

  const groupedData = groupByDate();
  const labels = Object.keys(groupedData).sort();
  const data = labels.map(label => groupedData[label]);

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  chartInstance.value = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Expenses',
          data,
          backgroundColor: 'rgba(220, 53, 69, 0.8)',
          borderColor: '#dc3545',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 12, weight: 'bold' },
            color: '#666',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return '$' + value.toLocaleString();
            },
            color: '#999',
            font: { size: 11 },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        x: {
          ticks: {
            color: '#999',
            font: { size: 11 },
          },
          grid: {
            display: false,
            drawTicks: false,
          },
        },
      },
    },
  });

  chartReady.value = true;
};

onMounted(() => {
  initChart();
});

watch(() => props.invoices, () => {
  chartReady.value = false;
  setTimeout(() => initChart(), 100);
}, { deep: true });
</script>

<style lang="scss" scoped>
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .chart-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #dc3545;
      }
    }

    .chart-period {
      background: rgba(220, 53, 69, 0.15);
      color: #dc3545;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
  }

  canvas {
    max-height: 300px;
    margin-bottom: 1.5rem;
  }

  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #999;
    gap: 0.5rem;

    i {
      font-size: 2rem;
    }
  }

  .chart-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-label {
        font-size: 0.8rem;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.3rem;
      }

      .stat-value {
        font-size: 1.2rem;
        font-weight: 700;
        color: #1a1a1a;
      }
    }
  }
}

@media (max-width: 768px) {
  .chart-card {
    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .chart-stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>