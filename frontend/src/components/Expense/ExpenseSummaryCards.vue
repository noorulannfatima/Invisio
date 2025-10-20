<!-- components/Expense/ExpenseSummaryCards.vue -->
<template>
  <div class="summary-cards">
    <div class="card total-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="card-label">Total Expenses</div>
      </div>
      <div class="card-value">₹{{ formatCurrency(expenseStore.totalExpenses) }}</div>
      <div class="card-sub">{{ expenseStore.expenseCount }} expenses recorded</div>
    </div>

    <div class="card average-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="card-label">Average Expense</div>
      </div>
      <div class="card-value">₹{{ formatCurrency(expenseStore.averageExpense) }}</div>
      <div class="card-sub">Per transaction</div>
    </div>

    <div class="card highest-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="fas fa-arrow-up"></i>
        </div>
        <div class="card-label">Highest Expense</div>
      </div>
      <div class="card-value">₹{{ expenseStore.highestExpense ? formatCurrency(expenseStore.highestExpense.Amount) : '0' }}</div>
      <div class="card-sub">{{ expenseStore.highestExpense?.Category || 'N/A' }}</div>
    </div>

    <div class="card lowest-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="card-label">Lowest Expense</div>
      </div>
      <div class="card-value">₹{{ expenseStore.lowestExpense ? formatCurrency(expenseStore.lowestExpense.Amount) : '0' }}</div>
      <div class="card-sub">{{ expenseStore.lowestExpense?.Category || 'N/A' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpenseStore } from '@/store/expenseStore';

const expenseStore = useExpenseStore();

const formatCurrency = (amount: number) => {
  return amount.toFixed(2);
};
</script>

<style scoped lang="scss">
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .card-label {
    font-size: 0.875rem;
    color: #718096;
    font-weight: 500;
  }

  .card-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .card-sub {
    font-size: 0.8rem;
    color: #a0aec0;
  }

  &.total-card {
    border-top: 3px solid #667eea;

    .card-icon {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
  }

  &.average-card {
    border-top: 3px solid #48bb78;

    .card-icon {
      background: rgba(72, 187, 120, 0.1);
      color: #48bb78;
    }
  }

  &.highest-card {
    border-top: 3px solid #ed8936;

    .card-icon {
      background: rgba(237, 137, 54, 0.1);
      color: #ed8936;
    }
  }

  &.lowest-card {
    border-top: 3px solid #9f7aea;

    .card-icon {
      background: rgba(159, 122, 234, 0.1);
      color: #9f7aea;
    }
  }
}
</style>