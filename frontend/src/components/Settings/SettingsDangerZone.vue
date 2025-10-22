<!-- components/Settings/SettingsDangerZone.vue -->
<template>
  <section class="settings-section danger-zone">
    <div class="section-header">
      <h2 class="section-title">
        <i class="fas fa-exclamation-triangle"></i>
        Danger Zone
      </h2>
      <p class="section-description">Irreversible actions</p>
    </div>

    <div class="section-content">
      <div class="danger-actions">
        <div class="danger-action">
          <div class="action-info">
            <h4 class="action-title">Delete Company</h4>
            <p class="action-description">
              Permanently delete your company and all associated data
            </p>
          </div>
          <button
            type="button"
            class="btn btn-danger"
            @click="showDeleteCompanyModal = true"
            :disabled="settingStore.loading"
          >
            <i class="fas fa-trash"></i>
            <span>Delete Company</span>
          </button>
        </div>

        <div class="danger-action">
          <div class="action-info">
            <h4 class="action-title">Delete Account</h4>
            <p class="action-description">
              Permanently delete your account and all associated data
            </p>
          </div>
          <button
            type="button"
            class="btn btn-danger"
            @click="showDeleteAccountModal = true"
            :disabled="settingStore.loading"
          >
            <i class="fas fa-user-slash"></i>
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Company Confirmation Modal -->
    <div
      v-if="showDeleteCompanyModal"
      class="modal-overlay"
      @click.self="showDeleteCompanyModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Delete Company</h3>
          <button class="modal-close" @click="showDeleteCompanyModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p class="warning-text">
            <i class="fas fa-exclamation-circle"></i>
            Are you sure you want to delete this company? This action cannot be undone. All
            associated data will be lost.
          </p>

          <div class="form-field">
            <label for="delete-company-password" class="form-label"
              >Enter your password to confirm</label
            >
            <input
              id="delete-company-password"
              v-model="deleteCompanyPassword"
              type="password"
              class="form-input"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteCompanyModal = false">
            <span>Cancel</span>
          </button>
          <button
            class="btn btn-danger"
            @click="handleDeleteCompany"
            :disabled="!deleteCompanyPassword || settingStore.loading"
          >
            <i class="fas fa-trash"></i>
            <span>Delete Company</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div
      v-if="showDeleteAccountModal"
      class="modal-overlay"
      @click.self="showDeleteAccountModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Delete Account</h3>
          <button class="modal-close" @click="showDeleteAccountModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p class="warning-text">
            <i class="fas fa-exclamation-circle"></i>
            Are you sure you want to delete your account? This action is permanent and cannot be
            undone. All your data will be lost.
          </p>

          <div class="form-field">
            <label for="delete-account-password" class="form-label"
              >Enter your password to confirm</label
            >
            <input
              id="delete-account-password"
              v-model="deleteAccountPassword"
              type="password"
              class="form-input"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteAccountModal = false">
            <span>Cancel</span>
          </button>
          <button
            class="btn btn-danger"
            @click="handleDeleteAccount"
            :disabled="!deleteAccountPassword || settingStore.loading"
          >
            <i class="fas fa-user-slash"></i>
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingStore } from '@/store/settingStore'

const router = useRouter()
const settingStore = useSettingStore()

const showDeleteCompanyModal = ref(false)
const showDeleteAccountModal = ref(false)
const deleteCompanyPassword = ref('')
const deleteAccountPassword = ref('')

const handleDeleteCompany = async () => {
  const success = await settingStore.deleteCompany(deleteCompanyPassword.value)

  if (success) {
    showDeleteCompanyModal.value = false
    deleteCompanyPassword.value = ''
    await settingStore.loadAllSettings()
  }
}

const handleDeleteAccount = async () => {
  const success = await settingStore.deleteUserAccount(deleteAccountPassword.value)

  if (success) {
    showDeleteAccountModal.value = false
    deleteAccountPassword.value = ''
    setTimeout(() => {
      router.push('/login')
    }, 1500)
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

  &.danger-zone {
    grid-column: 1 / -1;
    border-left: 4px solid #dc2626;
    background: linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%);
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
        color: #dc2626;
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

// Danger Actions
.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .danger-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background: white;
    border: 1px solid #fed7d7;
    border-radius: 8px;
    gap: 1rem;

    .action-info {
      flex: 1;

      .action-title {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1e1e2d;
      }

      .action-description {
        margin: 0;
        font-size: 0.9rem;
        color: #6b7280;
      }
    }
  }
}

// Form Styles
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

  &.btn-secondary {
    background: #e5e7eb;
    color: #1e1e2d;

    &:hover:not(:disabled) {
      background: #d1d5db;
    }
  }

  &.btn-danger {
    background: #dc2626;
    color: white;

    &:hover:not(:disabled) {
      background: #b91c1c;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
}

// Modal Styles
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  animation: modalSlide 0.3s ease;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;

    .modal-title {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 700;
      color: #1e1e2d;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      transition: color 0.3s ease;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #1e1e2d;
      }
    }
  }

  .modal-body {
    padding: 1.5rem;

    .warning-text {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin: 0 0 1.5rem 0;
      padding: 1rem;
      background: #fef2f2;
      color: #7f1d1d;
      border-radius: 6px;

      i {
        flex-shrink: 0;
        margin-top: 0.25rem;
        color: #dc2626;
      }
    }
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlide {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// Responsive Design
@media (max-width: 1024px) {
  .danger-zone {
    grid-column: auto !important;
  }

  .danger-actions {
    .danger-action {
      flex-direction: column;
      align-items: flex-start;

      .btn {
        width: 100%;
      }
    }
  }
}

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

  .modal {
    margin: 1rem;

    .modal-footer {
      flex-direction: column-reverse;
      gap: 0.75rem;

      .btn {
        width: 100%;
      }
    }
  }

  .danger-actions {
    .danger-action {
      .btn {
        width: 100%;
      }
    }
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

  .danger-actions {
    .danger-action {
      padding: 1rem;
      flex-direction: column;
      align-items: stretch;

      .action-info {
        .action-title {
          font-size: 0.95rem;
        }

        .action-description {
          font-size: 0.85rem;
        }
      }

      .btn {
        width: 100%;
        font-size: 0.9rem;
      }
    }
  }

  .modal {
    .modal-header {
      padding: 1rem;

      .modal-title {
        font-size: 1.1rem;
      }
    }

    .modal-body {
      padding: 1rem;

      .warning-text {
        font-size: 0.9rem;
      }

      .form-field {
        .form-input {
          font-size: 0.9rem;
        }
      }
    }

    .modal-footer {
      padding: 1rem;
      flex-direction: column-reverse;
      gap: 0.75rem;

      .btn {
        width: 100%;
        font-size: 0.9rem;
      }
    }
  }
}
</style>