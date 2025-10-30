<!--DashboardCompanyCard.vue  delete-->
<template>
  <div class="card company-card">
    <div class="card-header">
      <h3>Company Details</h3>
    </div>
    <div class="card-body">
      <div class="overview-item">
        <span class="label">Company Name</span>
        <span class="value">{{ companyStore.companyName }}</span>
      </div>
      <div class="overview-item">
        <span class="label">Address</span>
        <span class="value">{{ companyStore.company?.Address || 'Not provided' }}</span>
      </div>
      <div class="overview-item">
        <span class="label">Email</span>
        <span class="value email-value">{{ companyStore.company?.Email || 'Not provided' }}</span>
      </div>
      <div class="overview-item">
        <span class="label">Created</span>
        <span class="value">{{ formatDate(companyStore.company?.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCompanyStore } from '@/store/companyStore';

const companyStore = useCompanyStore();

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped lang="scss">
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #2d3748;
    font-weight: 600;
  }
}

.card-body {
  padding: 1.5rem;
}

.company-card {
  .overview-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 0;
    border-bottom: 1px solid #f0f4f8;
    gap: 1rem;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #718096;
      font-weight: 500;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .value {
      color: #2d3748;
      font-weight: 600;
      text-align: right;
      word-break: break-word;

      &.email-value {
        color: #667eea;
      }
    }
  }
}

@media (max-width: 768px) {
  .card-header {
    padding: 1rem;

    h3 {
      font-size: 1rem;
    }
  }

  .card-body {
    padding: 1rem;
  }

  .company-card .overview-item {
    flex-direction: column;
    align-items: flex-start;

    .label {
      width: 100%;
    }

    .value {
      width: 100%;
      text-align: left;
    }
  }
}
</style>

---
