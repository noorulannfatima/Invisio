<!--DashboardActionBar.vue-->
<template>
  <div class="action-bar">
    <button v-if="!isCompanyCreated" class="btn btn-primary" @click="$emit('create-company')">
      <span class="icon">+</span>
      Create Company
    </button>
    <div v-else class="company-info-bar">
      <span class="company-name">{{ companyStore.companyName }}</span>
      <button class="btn btn-secondary" @click="$emit('edit-company')">Edit</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCompanyStore } from '@/store/companyStore';

interface Props {
  isCompanyCreated: boolean;
}

defineProps<Props>();

defineEmits<{
  'create-company': [];
  'edit-company': [];
}>();

const companyStore = useCompanyStore();
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  .company-info-bar {
    display: flex;
    gap: 1rem;
    align-items: center;

    .company-name {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
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
