<!--DashboardActionBar.vue-->
<template>
  <div class="action-bar">
    <button v-if="!isCompanyCreated" class="btn btn-primary" @click="$emit('create-company')">
      <span class="icon">+</span>
      Create Company
    </button>
    <!-- Company name removed as per request -->
  </div>
</template>

<script setup lang="ts">
interface Props {
  isCompanyCreated: boolean;
}

defineProps<Props>();

defineEmits<{
  'create-company': [];
}>();
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  .company-info-bar {
    display: none;
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

  &.btn-secondary {
    background: #edf2f7;
    color: #2d3748;

    &:hover {
      background: #e2e8f0;
    }
  }

  .icon {
    font-weight: bold;
  }
}

@media (max-width: 768px) {
  .action-bar {
    flex-wrap: wrap;
  }
}
</style>

---
