<template>
  <div class="dashboard">
    <h1 class="dashboard-title">Dashboard Overview</h1>

    <div class="stats-grid">
      <div class="card" v-for="(stat, index) in stats" :key="index">
        <div class="card-header">
          <i :class="stat.icon"></i>
          <span>{{ stat.label }}</span>
        </div>
        <div class="card-value">{{ stat.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stat {
  label: string
  value: string | number
  icon: string
}

const stats: Stat[] = [
  { label: 'Total Sales', value: '$25,340', icon: 'fas fa-dollar-sign' },
  { label: 'Inventory Items', value: 342, icon: 'fas fa-boxes' },
  { label: 'Active Users', value: 128, icon: 'fas fa-users' },
  { label: 'Pending Orders', value: 14, icon: 'fas fa-clock' },
]
</script>

<style lang="scss" scoped>
.dashboard {
  // Adjust depending on your sidebar/nav height
  margin-left: 260px; // same as sidebar width
  margin-top: 70px; // same as navbar height
  padding: 2rem;

  background-color: #f8f9fb;
  min-height: calc(100vh - 70px);

  .dashboard-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #222;
    margin-bottom: 1.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      font-size: 1rem;
      color: #555;

      i {
        color: #4a6cf7;
        font-size: 1.2rem;
      }
    }

    .card-value {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 0.5rem;
      color: #222;
    }
  }
}
</style>
