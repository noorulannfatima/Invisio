<!-- components/Settings/SettingsCompany.vue -->
<template>
  <section class="settings-section">
    <div class="section-header">
      <h2 class="section-title">
        <i class="fas fa-building"></i>
        Company Settings
      </h2>
      <p class="section-description">Manage your company information</p>
    </div>

    <div class="section-content">
      <!-- Company Info Display -->
      <div v-if="settingStore.company" class="info-group">
        <div class="info-item">
          <label class="info-label">Company Name</label>
          <p class="info-value">{{ settingStore.company.Name }}</p>
        </div>
        <div class="info-item">
          <label class="info-label">Company Email</label>
          <p class="info-value">{{ settingStore.company.Email || 'Not set' }}</p>
        </div>
        <div class="info-item">
          <label class="info-label">Address</label>
          <p class="info-value">{{ settingStore.company.Address || 'Not set' }}</p>
        </div>
      </div>

      <!-- Edit Company Form -->
      <form @submit.prevent="handleUpdateCompany" class="form-group">
        <h3 class="form-title">Edit Company Information</h3>

        <div class="form-field">
          <label for="company-name" class="form-label">Company Name</label>
          <input
            id="company-name"
            v-model="companyForm.Name"
            type="text"
            class="form-input"
            placeholder="Enter company name"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="company-email" class="form-label">Company Email</label>
            <input
              id="company-email"
              v-model="companyForm.Email"
              type="email"
              class="form-input"
              placeholder="Enter company email"
            />
          </div>
          <div class="form-field">
            <label for="company-address" class="form-label">Address</label>
            <input
              id="company-address"
              v-model="companyForm.Address"
              type="text"
              class="form-input"
              placeholder="Enter company address"
            />
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="settingStore.loading">
          <i class="fas fa-save"></i>
          <span>Update Company</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { useSettingStore } from '@/store/settingStore'

const settingStore = useSettingStore()

const companyForm = reactive({
  Name: '',
  Email: '',
  Address: ''
})

onMounted(() => {
  if (settingStore.company) {
    companyForm.Name = settingStore.company.Name
    companyForm.Email = settingStore.company.Email || ''
    companyForm.Address = settingStore.company.Address || ''
  }
})

const handleUpdateCompany = async () => {
  const success = await settingStore.updateCompanyDetails({
    Name: companyForm.Name || undefined,
    Email: companyForm.Email || undefined,
    Address: companyForm.Address || undefined
  })

  if (success && settingStore.company) {
    companyForm.Name = settingStore.company.Name
    companyForm.Email = settingStore.company.Email || ''
    companyForm.Address = settingStore.company.Address || ''
  }
}
</script>

<style lang="scss" scoped>
// Settings Section
.settings-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .section-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;

    .section-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #1e1e2d;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      i {
        color: #667eea;
      }
    }

    .section-description {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0;
    }
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

// Info Group
.info-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;

  .info-item {
    .info-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .info-value {
      margin: 0;
      font-size: 1rem;
      color: #1e1e2d;
      word-break: break-word;
    }
  }
}

// Form Styles
.form-group {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  .form-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e1e2d;
    margin: 0 0 1rem 0;
  }
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .form-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e1e2d;
  }

  .form-input {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }

    &:disabled {
      background-color: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
    }
  }
}

// Buttons
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .settings-section {
    padding: 1.5rem;

    .section-header {
      margin-bottom: 1rem;

      .section-title {
        font-size: 1.1rem;
      }
    }
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .info-group {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .settings-section {
    padding: 1rem;

    .section-header {
      padding-bottom: 0.75rem;

      .section-title {
        font-size: 1rem;
      }

      .section-description {
        font-size: 0.8rem;
      }
    }
  }

  .form-group {
    padding: 1rem;
  }

  .info-group {
    padding: 0.75rem;
    gap: 0.75rem;
  }
}
</style>