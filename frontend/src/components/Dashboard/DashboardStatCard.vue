<!--/components/Dashboard/DashboardStatCard.vue-->
<template>
  <div class="stat-card">
    <div class="stat-content">
      <div :class="['stat-icon', icon]">
        <i :class="iconClass"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ label }}</span>
        <span class="stat-value">{{ value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon: 'parties' | 'items' | 'transactions' | 'expenses';
  label: string;
  value: number | string;
}

const props = defineProps<Props>();

const iconClass = computed(() => {
  const iconMap: Record<string, string> = {
    parties: 'fas fa-users',
    items: 'fas fa-box',
    transactions: 'fas fa-exchange-alt',
    expenses: 'fas fa-receipt',
  };
  return iconMap[props.icon];
});
</script>

<style scoped lang="scss">
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    font-size: 1.5rem;
    flex-shrink: 0;

    &.parties {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.items {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.transactions {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.expenses {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    min-width: 0;

    .stat-label {
      color: #718096;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .stat-value {
      color: #2d3748;
      font-size: 1.5rem;
      font-weight: 700;
    }
  }
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .stat-info {
      .stat-label {
        font-size: 0.75rem;
      }

      .stat-value {
        font-size: 1.2rem;
      }
    }
  }
}
</style>

---
