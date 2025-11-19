<!-- views/Settings.vue -->
<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="settings-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">Manage your profile and company settings</p>
    </div>

    <!-- Loading State -->
    <div v-if="settingStore.loading && !isInitialized" class="loading-container">
      <div class="spinner"></div>
      <p>Loading settings...</p>
    </div>

    <!-- Settings Container -->
    <div v-else class="settings-container">
      <!-- Error Message -->
      <div v-if="settingStore.error" class="alert alert-error">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ settingStore.error }}</span>
        <button @click="settingStore.clearMessages()" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Settings Grid -->
      <div class="settings-grid">
        <!-- Profile Settings Component -->
        <SettingsProfile />

        <!-- Company Settings Component -->
        <SettingsCompany />

        <!-- Danger Zone Component -->
        <SettingsDangerZone />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useSettingStore } from '@/store/settingStore'
import SettingsProfile from '@/components/Settings/SettingsProfile.vue'
import SettingsCompany from '@/components/Settings/SettingsCompany.vue'
import SettingsDangerZone from '@/components/Settings/SettingsDangerZone.vue'

const settingStore = useSettingStore()
const isInitialized = ref(false)

onMounted(async () => {
  try {
    await settingStore.loadAllSettings()
  } catch (err) {
    console.error('Failed to load settings:', err)
  } finally {
    isInitialized.value = true
  }
})
</script>

<style lang="scss" scoped>
.settings-page {
  margin-left: 260px;
  margin-top: 70px;
  padding: 2rem;
  background-color: #f5f6fa;
  min-height: calc(100vh - 70px);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 1200px;

  @media (max-width: 1024px) {
    margin-left: 80px;
  }

  @media (max-width: 768px) {
    margin-left: 80px;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    margin-left: 70px;
    padding: 1rem;
  }
}

// Page Header
.settings-header {
  margin-bottom: 2rem;

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e1e2d;
    margin: 0 0 0.5rem 0;
  }

  .page-subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
  }
}

// Loading State
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: #6b7280;
    font-size: 1rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Alerts
.alert {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: slideIn 0.3s ease;

  i {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  &.alert-error {
    background: #fee2e2;
    color: #7f1d1d;
    border: 1px solid #fecaca;

    i {
      color: #dc2626;
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    margin-left: auto;
    opacity: 0.7;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// Settings Container
.settings-container {
  width: 100%;
}

// Settings Grid
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

// Responsive Design
@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .settings-header {
    margin-bottom: 1.5rem;

    .page-title {
      font-size: 1.5rem;
    }

    .page-subtitle {
      font-size: 0.9rem;
    }
  }

  .settings-grid {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .settings-header {
    .page-title {
      font-size: 1.3rem;
    }

    .page-subtitle {
      font-size: 0.85rem;
    }
  }
}
</style>