<!-- components/Expense/ExpenseReport.vue -->
<template>
  <div class="report-section">
    <div class="report-header">
      <h2>
        <i class="fas fa-chart-bar"></i>
        Monthly Report
      </h2>
      <div class="report-period">
        {{ expenseStore.expenseReport.Report_Period.Month_Name }}
        {{ expenseStore.expenseReport.Report_Period.Year }}
      </div>
    </div>

    <!-- Report Summary Cards -->
    <div class="report-summary">
      <div class="report-card">
        <div class="report-icon">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="report-content">
          <div class="report-label">Total Expenses</div>
          <div class="report-value">
            Rs {{ formatCurrency(expenseStore.expenseReport.Summary.Total_Expenses) }}
          </div>
        </div>
      </div>

      <div class="report-card">
        <div class="report-icon">
          <i class="fas fa-receipt"></i>
        </div>
        <div class="report-content">
          <div class="report-label">Transactions</div>
          <div class="report-value">
            {{ expenseStore.expenseReport.Summary.Expense_Count }}
          </div>
        </div>
      </div>

      <div class="report-card">
        <div class="report-icon">
          <i class="fas fa-layer-group"></i>
        </div>
        <div class="report-content">
          <div class="report-label">Categories</div>
          <div class="report-value">
            {{ expenseStore.expenseReport.Summary.Category_Count }}
          </div>
        </div>
      </div>

      <div class="report-card">
        <div class="report-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="report-content">
          <div class="report-label">Avg per Transaction</div>
          <div class="report-value">
            Rs {{ formatCurrency(getAverage()) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Category Breakdown -->
    <div class="category-breakdown">
      <h3>
        <i class="fas fa-layer-group"></i>
        Top Categories
      </h3>

      <div class="category-list">
        <div
          v-for="(cat, index) in expenseStore.expenseReport.Top_Categories"
          :key="cat.Category"
          class="category-item"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="category-header">
            <div class="category-rank">{{ index + 1 }}</div>
            <div class="category-info">
              <div class="category-name">{{ cat.Category }}</div>
              <div class="category-count">
                {{ getCategoryCount(cat.Category) }} transactions
              </div>
            </div>
            <div class="category-percentage">{{ cat.Percentage }}%</div>
          </div>

          <div class="category-bar-wrapper">
            <div class="category-bar">
              <div
                class="category-progress"
                :style="{ 
                  width: cat.Percentage + '%',
                  animationDelay: `${index * 100}ms`
                }"
              ></div>
            </div>
          </div>

          <div class="category-footer">
            <span class="amount">Rs {{ formatCurrency(cat.Amount) }}</span>
            <span class="percentage-text">{{ cat.Percentage.toFixed(1) }}% of total</span>
          </div>
        </div>
      </div>
    </div>

    <!-- All Categories -->
    <div v-if="expenseStore.expenseReport.Category_Breakdown.length > 5" class="all-categories">
      <h3>
        <i class="fas fa-list"></i>
        All Categories
      </h3>

      <div class="categories-table">
        <div class="table-header">
          <div class="col-rank">#</div>
          <div class="col-name">Category</div>
          <div class="col-amount">Amount</div>
          <div class="col-percentage">Share</div>
        </div>

        <div
          v-for="(cat, index) in expenseStore.expenseReport.Category_Breakdown"
          :key="cat.Category"
          class="table-row"
        >
          <div class="col-rank">{{ index + 1 }}</div>
          <div class="col-name">{{ cat.Category }}</div>
          <div class="col-amount">Rs {{ formatCurrency(cat.Amount) }}</div>
          <div class="col-percentage">
            <div class="percentage-visual">
              <div
                class="percentage-bar"
                :style="{ width: cat.Percentage + '%' }"
              ></div>
              <span class="percentage-label">{{ cat.Percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpenseStore } from '@/store/expenseStore';

const expenseStore = useExpenseStore();

const formatCurrency = (amount: number) => {
  return amount.toFixed(2);
};

const getAverage = () => {
  const summary = expenseStore.expenseReport?.Summary;
  if (!summary || summary.Expense_Count === 0) return 0;
  return summary.Total_Expenses / summary.Expense_Count;
};

const getCategoryCount = (category: string) => {
  return expenseStore.expenses.filter(exp => exp.Category === category).length;
};
</script>

<style scoped lang="scss">
.report-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-top: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #edf2f7;

  h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    i {
      color: #667eea;
      font-size: 1.2rem;
    }
  }

  .report-period {
    font-size: 1rem;
    font-weight: 600;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 20px;
  }
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  border: 1px solid #cbd5e0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    border-color: #667eea;
  }

  .report-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    flex-shrink: 0;
  }

  .report-content {
    flex: 1;
  }

  .report-label {
    font-size: 0.85rem;
    color: #718096;
    font-weight: 500;
    margin-bottom: 0.3rem;
  }

  .report-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d3748;
  }
}

.category-breakdown {
  margin-bottom: 2rem;

  h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      color: #667eea;
    }
  }
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-item {
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 10px;
  border: 1px solid #edf2f7;
  transition: all 0.3s ease;
  animation: slideInLeft 0.3s ease forwards;
  opacity: 0;

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:hover {
    background: white;
    border-color: #cbd5e0;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .category-rank {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  .category-info {
    flex: 1;
    min-width: 0;

    .category-name {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.95rem;
    }

    .category-count {
      font-size: 0.8rem;
      color: #a0aec0;
      margin-top: 0.2rem;
    }
  }

  .category-percentage {
    font-size: 1.3rem;
    font-weight: 700;
    color: #667eea;
    min-width: 50px;
    text-align: right;
  }

  .category-bar-wrapper {
    margin-bottom: 1rem;
  }

  .category-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .category-progress {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    animation: fillBar 0.8s ease forwards;
    width: 0;

    @keyframes fillBar {
      to {
        width: var(--progress-width);
      }
    }
  }

  .category-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .amount {
      font-weight: 700;
      color: #27ae60;
      font-size: 1rem;
    }

    .percentage-text {
      font-size: 0.8rem;
      color: #a0aec0;
    }
  }
}

.all-categories {
  h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      color: #667eea;
    }
  }
}

.categories-table {
  overflow-x: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 50px 1fr 150px 150px;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
}

.table-header {
  background: #edf2f7;
  font-weight: 700;
  color: #2d3748;
  border-bottom: 2px solid #cbd5e0;
  margin-bottom: 0.5rem;
}

.table-row {
  background: #f7fafc;
  border-bottom: 1px solid #edf2f7;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
}

.col-rank {
  font-weight: 700;
  color: #667eea;
  text-align: center;
}

.col-name {
  font-weight: 500;
  color: #2d3748;
}

.col-amount {
  font-weight: 700;
  color: #27ae60;
}

.col-percentage {
  .percentage-visual {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .percentage-bar {
    height: 6px;
    background: #667eea;
    border-radius: 3px;
    min-width: 50px;
    transition: all 0.3s ease;
  }

  .percentage-label {
    font-weight: 600;
    color: #667eea;
    font-size: 0.85rem;
    min-width: 40px;
    text-align: right;
  }
}

@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 40px 1fr 120px 120px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .report-section {
    padding: 1.5rem;
  }

  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .report-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-item {
    .category-header {
      flex-wrap: wrap;
    }

    .category-percentage {
      order: -1;
      width: 100%;
    }
  }

  .table-header,
  .table-row {
    grid-template-columns: 30px 1fr 80px 80px;
    font-size: 0.8rem;
    padding: 0.75rem;
    gap: 0.5rem;
  }
}
</style>