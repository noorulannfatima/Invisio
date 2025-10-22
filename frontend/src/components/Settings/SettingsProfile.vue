<!-- components/Settings/SettingsProfile.vue -->
<template>
  <section class="settings-section">
    <div class="section-header">
      <h2 class="section-title">
        <i class="fas fa-user-circle"></i>
        Profile Settings
      </h2>
      <p class="section-description">Update your personal information</p>
    </div>

    <div class="section-content">
      <!-- User Info Display -->
      <div v-if="settingStore.userProfile" class="info-group">
        <div class="info-item">
          <label class="info-label">Username</label>
          <p class="info-value">{{ settingStore.userProfile.Username }}</p>
        </div>
        <div class="info-item">
          <label class="info-label">Email</label>
          <p class="info-value">{{ settingStore.userProfile.Email }}</p>
        </div>
        <div class="info-item">
          <label class="info-label">Mobile Number</label>
          <p class="info-value">{{ settingStore.userProfile.Mobile_Number }}</p>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <form @submit.prevent="handleUpdateProfile" class="form-group">
        <h3 class="form-title">Edit Profile</h3>

        <div class="form-row">
          <div class="form-field">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="profileForm.Username"
              type="text"
              class="form-input"
              placeholder="Enter your username"
            />
          </div>
          <div class="form-field">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="profileForm.Email"
              type="email"
              class="form-input"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="mobile" class="form-label">Mobile Number</label>
          <input
            id="mobile"
            v-model="profileForm.Mobile_Number"
            type="tel"
            class="form-input"
            placeholder="Enter your mobile number"
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="settingStore.loading">
          <i class="fas fa-save"></i>
          <span>Update Profile</span>
        </button>
      </form>

      <!-- Change Password Form -->
      <form @submit.prevent="handleChangePassword" class="form-group">
        <h3 class="form-title">Change Password</h3>

        <div class="form-field">
          <label for="old-password" class="form-label">Current Password</label>
          <input
            id="old-password"
            v-model="passwordForm.oldPassword"
            type="password"
            class="form-input"
            placeholder="Enter current password"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="new-password" class="form-label">New Password</label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              class="form-input"
              placeholder="Enter new password"
            />
          </div>
          <div class="form-field">
            <label for="confirm-password" class="form-label">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              type="password"
              class="form-input"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="settingStore.loading">
          <i class="fas fa-lock"></i>
          <span>Change Password</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { useSettingStore } from '@/store/settingStore'

const settingStore = useSettingStore()

const profileForm = reactive({
  Username: '',
  Email: '',
  Mobile_Number: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  if (settingStore.userProfile) {
    profileForm.Username = settingStore.userProfile.Username
    profileForm.Email = settingStore.userProfile.Email
    profileForm.Mobile_Number = settingStore.userProfile.Mobile_Number
  }
})

const handleUpdateProfile = async () => {
  const success = await settingStore.updateUserProfile({
    Username: profileForm.Username || undefined,
    Email: profileForm.Email || undefined,
    Mobile_Number: profileForm.Mobile_Number || undefined
  })

  if (success && settingStore.userProfile) {
    profileForm.Username = settingStore.userProfile.Username
    profileForm.Email = settingStore.userProfile.Email
    profileForm.Mobile_Number = settingStore.userProfile.Mobile_Number
  }
}

const handleChangePassword = async () => {
  const success = await settingStore.changePassword({
    oldPassword: passwordForm.oldPassword,
    newPassword: passwordForm.newPassword,
    confirmPassword: passwordForm.confirmPassword
  })

  if (success) {
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
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