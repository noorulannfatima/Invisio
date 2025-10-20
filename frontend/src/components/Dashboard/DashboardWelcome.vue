<!--DashboardWelcome.vue-->
<template>
  <section class="welcome-section">
    <div class="welcome-card">
      <h2>Welcome to Invisio</h2>
      <p>Get started by creating your first company to begin managing your business operations.</p>
      <button class="btn btn-large btn-primary" @click="$emit('create-company')">
        Create Your First Company
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  'create-company': [];
}>();
</script>

<style scoped lang="scss">
.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  margin-bottom: 2rem;

  .welcome-card {
    background: white;
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    max-width: 500px;

    h2 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #2d3748;
    }

    p {
      color: #718096;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }

  &.btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
}
</style>

