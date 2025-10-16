<template>
  <div class="page finance">
    <h1 class="page-title">Finance Overview</h1>

    <div class="summary-grid">
      <div class="card" v-for="(item, i) in summary" :key="i">
        <h3>{{ item.label }}</h3>
        <p>{{ item.value }}</p>
      </div>
    </div>

    <div class="section">
      <h2>Recent Transactions</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(txn, i) in transactions" :key="i">
            <td>{{ txn.date }}</td>
            <td>{{ txn.type }}</td>
            <td>{{ txn.amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Summary {
  label: string
  value: string | number
}

interface Transaction {
  date: string
  type: string
  amount: string
}

const summary: Summary[] = [
  { label: 'Total Revenue', value: '$25,430' },
  { label: 'Expenses', value: '$12,150' },
  { label: 'Net Profit', value: '$13,280' },
]

const transactions: Transaction[] = [
  { date: 'Oct 12, 2025', type: 'Sale', amount: '$1,200' },
  { date: 'Oct 11, 2025', type: 'Purchase', amount: '-$600' },
  { date: 'Oct 10, 2025', type: 'Expense', amount: '-$120' },
]
</script>

<style lang="scss" scoped>
.page {
  margin-left: 260px;
  margin-top: 70px;
  padding: 2rem;
  background-color: #f8f9fb;
  min-height: calc(100vh - 70px);

  .page-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;

    .card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      text-align: center;

      h3 {
        font-size: 1rem;
        color: #555;
      }

      p {
        font-size: 1.4rem;
        font-weight: 700;
        color: #222;
      }
    }
  }

  .section {
    margin-top: 2.5rem;

    h2 {
      margin-bottom: 1rem;
      color: #333;
      font-size: 1.3rem;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 10px;
      overflow: hidden;

      th,
      td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        background-color: #f0f2f5;
        color: #555;
        font-weight: 600;
      }
    }
  }
}
</style>
