<template>
  <div class="summary-cards">
    <div class="summary-card revenue">
      <div class="card-icon">
        <i class="fas fa-arrow-up"></i>
      </div>
      <div class="card-content">
        <p class="card-label">Total Sales</p>
        <h3 class="card-value">{{ formatCurrency(salesTotal) }}</h3>
        <span class="card-meta">Revenue generated</span>
      </div>
    </div>

    <div class="summary-card expense">
      <div class="card-icon">
        <i class="fas fa-arrow-down"></i>
      </div>
      <div class="card-content">
        <p class="card-label">Total Purchases</p>
        <h3 class="card-value">{{ formatCurrency(purchaseTotal) }}</h3>
        <span class="card-meta">Money spent</span>
      </div>
    </div>

    <div class="summary-card profit" :class="{ negative: netProfit < 0 }">
      <div class="card-icon">
        <i class="fas fa-chart-pie"></i>
      </div>
      <div class="card-content">
        <p class="card-label">Net Profit</p>
        <h3 class="card-value">{{ formatCurrency(netProfit) }}</h3>
        <span class="card-meta">{{ netProfit >= 0 ? 'Positive' : 'Negative' }} margin</span>
      </div>
    </div>

    <div class="summary-card pending">
      <div class="card-icon">
        <i class="fas fa-hourglass-half"></i>
      </div>
      <div class="card-content">
        <p class="card-label">Pending Invoices</p>
        <h3 class="card-value">{{ pendingCount }}</h3>
        <span class="card-meta">Awaiting completion</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  salesTotal: number;
  purchaseTotal: number;
  netProfit: number;
  pendingCount: number;
}>();

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
</script>

<style lang="scss" scoped>
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  .summary-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 1.2rem;
    transition: all 0.3s ease;
    border-left: 5px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .card-content {
      flex: 1;

      .card-label {
        font-size: 0.85rem;
        color: #666;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }

      .card-value {
        font-size: 1.6rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0.3rem 0;
      }

      .card-meta {
        font-size: 0.8rem;
        color: #999;
        display: block;
      }
    }

    &.revenue {
      border-left-color: #28a745;

      .card-icon {
        background: rgba(40, 167, 69, 0.15);
        color: #28a745;
      }
    }

    &.expense {
      border-left-color: #dc3545;

      .card-icon {
        background: rgba(220, 53, 69, 0.15);
        color: #dc3545;
      }
    }

    &.profit {
      border-left-color: #007bff;

      .card-icon {
        background: rgba(0, 123, 255, 0.15);
        color: #007bff;
      }

      &.negative {
        border-left-color: #ffc107;

        .card-icon {
          background: rgba(255, 193, 7, 0.15);
          color: #ffc107;
        }

        .card-value {
          color: #ffc107;
        }
      }
    }

    &.pending {
      border-left-color: #6c757d;

      .card-icon {
        background: rgba(108, 117, 125, 0.15);
        color: #6c757d;
      }

      .card-value {
        font-size: 2rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;

    .summary-card {
      padding: 1rem;
      gap: 0.8rem;

      .card-icon {
        width: 50px;
        height: 50px;
        font-size: 1.2rem;
      }

      .card-content {
        .card-value {
          font-size: 1.3rem;
        }
      }
    }
  }
}
</style>