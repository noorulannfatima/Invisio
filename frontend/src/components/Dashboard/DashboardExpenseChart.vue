<!--DashboardExpenseChart.vue-->
<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>Expense Distribution</h3>
      <span v-if="expenseStore.isLoading" class="loading-indicator">Loading...</span>
    </div>
    <div class="card-body chart-body">
      <div v-if="hasExpenses" class="chart-container">
        <canvas ref="expenseChartRef"></canvas>
      </div>
      <div v-else class="no-data">
        <p>No expense data available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useExpenseStore } from '@/store/expenseStore';

const expenseStore = useExpenseStore();
const expenseChartRef = ref<HTMLCanvasElement | null>(null);
let expenseChart: Chart | null = null;

const hasExpenses = computed(() => expenseStore.expenseCount > 0);

// Compute category data from expenses
const categoryData = computed(() => {
  const categories = expenseStore.expensesByCategory;
  
  // If no expenses, return default empty data
  if (Object.keys(categories).length === 0) {
    return {
      labels: ['Utilities', 'Supplies', 'Services', 'Other'],
      values: [0, 0, 0, 0]
    };
  }

  // Sort categories by amount (descending) and get top categories
  const sortedCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8); // Show top 8 categories

  return {
    labels: sortedCategories.map(([category]) => category),
    values: sortedCategories.map(([, amount]) => amount)
  };
});

// Generate colors dynamically based on number of categories
const generateColors = (count: number) => {
  const colors = [
    'rgba(104, 126, 234, 0.8)',
    'rgba(240, 147, 300, 0.8)',
    'rgba(79, 172, 254, 0.8)',
    'rgba(67, 233, 123, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
  ];
  
  const borderColors = [
    'rgb(102, 126, 234)',
    'rgb(240, 147, 251)',
    'rgb(79, 172, 254)',
    'rgb(67, 233, 123)',
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
  ];

  return {
    background: colors.slice(0, count),
    border: borderColors.slice(0, count)
  };
};

onMounted(async () => {
  // Fetch expenses if not already loaded
  if (expenseStore.expenseCount === 0) {
    try {
      await expenseStore.fetchAllExpenses();
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  }

  // Initialize chart after a short delay
  setTimeout(() => {
    initExpenseChart();
  }, 100);
});

// Watch for changes in expense data
watch(
  () => expenseStore.expensesByCategory,
  () => {
    if (expenseChartRef.value && hasExpenses.value) {
      updateChart();
    }
  },
  { deep: true }
);

const initExpenseChart = () => {
  if (!expenseChartRef.value || !hasExpenses.value) return;

  const ctx = expenseChartRef.value.getContext('2d');
  if (!ctx) return;

  if (expenseChart) {
    expenseChart.destroy();
  }

  const data = categoryData.value;
  const colors = generateColors(data.labels.length);

  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
          backgroundColor: colors.background,
          borderColor: colors.border,
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
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i] as number;
                  const total = (data.datasets[0].data as number[]).reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(1);
                  
                  return {
                    text: `${label}: Rs${value.toLocaleString()} (${percentage}%)`,
                    fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed;
              const total = (context.dataset.data as number[]).reduce(
                (sum, val) => sum + val,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: Rs${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
};

const updateChart = () => {
  if (!expenseChart || !hasExpenses.value) return;

  const data = categoryData.value;
  const colors = generateColors(data.labels.length);

  expenseChart.data.labels = data.labels;
  expenseChart.data.datasets[0].data = data.values;
  expenseChart.data.datasets[0].backgroundColor = colors.background;
  expenseChart.data.datasets[0].borderColor = colors.border;
  
  expenseChart.update();
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

  .loading-indicator {
    font-size: 0.875rem;
    color: #667eea;
    font-weight: 500;
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

.chart-container {
  width: 100%;
  max-width: 400px;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  font-size: 0.95rem;

  p {
    margin: 0;
  }
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