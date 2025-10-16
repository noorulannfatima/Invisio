<template>
  <div class="page report">
    <h1 class="page-title">Reports & Analytics</h1>

    <div class="content">
      <p>Generate and review performance reports.</p>

      <div class="report-grid">
        <div class="card" v-for="(item, index) in reports" :key="index">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ReportItem {
  title: string
  description: string
}

const reports: ReportItem[] = [
  { title: 'Sales Report', description: 'View detailed sales data by month.' },
  { title: 'Inventory Turnover', description: 'Track stock movement and efficiency.' },
  { title: 'Expense Summary', description: 'Monitor company spending patterns.' },
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

  .report-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;

    .card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      h3 {
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
        color: #333;
      }

      p {
        color: #666;
      }
    }
  }
}
</style>
