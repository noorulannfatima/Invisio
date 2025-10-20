<!-- components/Expense/ExpenseHeader.vue -->
<template>
  <div class="expense-header">
    <div class="header-content">
      <h1 class="header-title">
        <i class="fas fa-receipt"></i>
        Expenses Management
      </h1>
      <p class="header-subtitle">Track and manage all your business expenses</p>
    </div>
    <button class="btn-primary" @click="$emit('add-expense')">
      <i class="fas fa-plus"></i>
      Add Expense
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'add-expense': [];
}>();
</script>

<style scoped lang="scss">
.expense-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .header-content {
    flex: 1;

    .header-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      i {
        color: #667eea;
        font-size: 1.5rem;
      }
    }

    .header-subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 0.9rem;
      color: #718096;
    }
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.75rem 1.75rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;

    i {
      font-size: 1.1rem;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;

    .header-title {
      font-size: 1.5rem;
    }

    .btn-primary {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>