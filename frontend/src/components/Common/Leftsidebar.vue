<template>
  <div class="sidebar-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'no-transition': !isLoaded }">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo">
          <i class="fas fa-cube"></i>
          <span class="logo-text" :title="companyStore.company?.Name || 'Create Company'">
            {{ companyStore.company?.Name || 'Create Company' }}
          </span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: route.path === item.path }"
        >
          <i :class="item.icon"></i>
          <span class="menu-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User Profile Section -->
      <div class="user-section" v-if="authStore.user">
        <div class="user-info">
          <div class="user-avatar">
            {{ getInitials(authStore.user.Username) }}
          </div>
          <div class="user-details">
            <p class="user-name">{{ authStore.user.Username }}</p>
            <p class="user-email">{{ authStore.user.Email }}</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useCompanyStore } from '@/store/companyStore'

interface MenuItem {
  label: string
  path: string
  icon: string
}

const route = useRoute()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const isLoaded = ref(false)

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
  { label: 'Inventory', path: '/inventory', icon: 'fas fa-box' },
  { label: 'Parties', path: '/parties', icon: 'fas fa-users' },
  { label: 'Expense', path: '/expense', icon: 'fas fa-receipt' },
  { label: 'Transactions', path: '/finance', icon: 'fas fa-dollar-sign' },
  { label: 'Profit & Loss', path: '/profit-loss', icon: 'fas fa-chart-line' },
  { label: 'Stock Summary', path: '/stock-summary', icon: 'fas fa-cube' },
  { label: 'Party Ledger', path: '/party-ledger', icon: 'fas fa-book' },
  { label: 'Brain', path: '/brain', icon: 'fas fa-brain' },
  { label: 'Settings', path: '/settings', icon: 'fas fa-cog' },
]

const getInitials = (name?: string): string => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(async () => {
  // Prevent transition on load
  requestAnimationFrame(() => {
    isLoaded.value = true
  })

  if (!companyStore.company) {
    await companyStore.fetchMyCompany()
  }
})
</script>


<style lang="scss" scoped>
// Sidebar Container
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e1e2d 0%, #252d3d 100%);
  color: #fff;
  // height: 100vh; // Removed fixed height
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 70px;
  bottom: 0; // Stretch to bottom
  z-index: 10;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.no-transition {
    transition: none !important;
  }

  // Logo Section
  .logo-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: background 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.3rem;
      font-weight: 700;
      flex: 1;
      min-width: 0;

      i {
        font-size: 1.5rem;
        color: #667eea;
        flex-shrink: 0;
      }

      .logo-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  // Navigation Menu
  .menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    overflow-y: auto;
    scroll-behavior: smooth;

    .menu-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.25rem;
      color: #a0aec0;
      text-decoration: none;
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border-left: 3px solid transparent;

      i {
        font-size: 1.1rem;
        min-width: 24px;
        text-align: center;
        flex-shrink: 0;
        transition: color 0.3s ease;
      }

      .menu-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
        padding-left: 1.5rem;

        i {
          color: #667eea;
        }
      }

      &.active {
        background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, transparent 100%);
        color: #667eea;
        border-left-color: #667eea;
        font-weight: 600;

        i {
          color: #667eea;
        }
      }
    }
  }

  // User Section
  .user-section {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;

      .user-name {
        margin: 0;
        font-weight: 600;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-email {
        margin: 0;
        font-size: 0.75rem;
        color: #a0aec0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

// Responsive: Tablet (1024px - 768px)
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;

    .logo-section {
      padding: 1rem 0.5rem;

      .logo {
        justify-content: center;

        .logo-text {
          display: none;
        }
      }
    }

    .menu {
      padding: 0.5rem 0;

      .menu-item {
        padding: 0.875rem 0.5rem;
        gap: 0;
        justify-content: center;

        .menu-label {
          display: none;
        }

        &:hover {
          padding: 0.875rem 0.5rem;
          background: rgba(102, 126, 234, 0.1);
        }

        i {
          font-size: 1.3rem;
        }
      }
    }

    .user-section {
      padding: 0.75rem 0.5rem;

      .user-info {
        justify-content: center;
      }

      .user-details {
        display: none;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        font-size: 0.8rem;
      }
    }
  }
}

// Responsive: Mobile (768px and below)
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    height: calc(100vh - 70px);

    .logo-section {
      padding: 1rem 0.5rem;

      .logo {
        justify-content: center;

        .logo-text {
          display: none;
        }
      }
    }

    .menu {
      padding: 0.5rem 0;

      .menu-item {
        padding: 0.875rem 0.5rem;
        gap: 0;
        justify-content: center;

        .menu-label {
          display: none;
        }

        &:hover {
          padding: 0.875rem 0.5rem;
          background: rgba(102, 126, 234, 0.1);
        }

        i {
          font-size: 1.3rem;
        }
      }
    }

    .user-section {
      padding: 0.75rem 0.5rem;

      .user-info {
        justify-content: center;
      }

      .user-details {
        display: none;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        font-size: 0.8rem;
      }
    }
  }
}

// Responsive: Small Mobile (480px and below)
@media (max-width: 480px) {
  .sidebar {
    width: 70px;

    .menu-item i {
      font-size: 1.2rem;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      font-size: 0.75rem;
    }
  }
}

// Scrollbar Styling
.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-track {
  background: transparent;
}

.menu::-webkit-scrollbar-thumb {
  background: rgba(160, 174, 192, 0.3);
  border-radius: 3px;

  &:hover {
    background: rgba(160, 174, 192, 0.5);
  }
}
</style>