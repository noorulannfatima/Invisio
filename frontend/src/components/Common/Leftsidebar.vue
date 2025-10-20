<!-- Leftsidebar.vue -->
<template>
  <div class="sidebar-wrapper">
    <!-- Mobile Menu Toggle Button -->
    <button class="mobile-menu-btn" @click="toggleSidebar" aria-label="Toggle menu">
      <i class="fas fa-bars"></i>
    </button>

    <!-- Sidebar -->
    <aside :class="['sidebar', { collapsed, 'mobile-open': isMobileOpen }]">
      <!-- Logo Section -->
      <div class="logo-section" @click="toggleSidebar">
        <div class="logo">
          <i class="fas fa-cube"></i>
          <span v-if="!collapsed" class="logo-text">Invisio</span>
        </div>
        <button class="collapse-btn" @click.stop="toggleSidebar" aria-label="Collapse sidebar">
          <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: route.path === item.path }"
          @click="closeMobileMenu"
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
          <div v-if="!collapsed" class="user-details">
            <p class="user-name">{{ authStore.user.Username }}</p>
            <p class="user-email">{{ authStore.user.Email }}</p>
          </div>
        </div>
      </div>

      <!-- Logout Button -->
      <div class="logout-section">
        <button class="logout-btn" @click="handleLogout" :title="collapsed ? 'Logout' : ''">
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="!collapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div v-if="isMobileOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

interface MenuItem {
  label: string
  path: string
  icon: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const collapsed = ref(false)
const isMobileOpen = ref(false)

const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768
  }
  return false
})

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
  { label: 'Inventory', path: '/inventory', icon: 'fas fa-box' },
  { label: 'Parties', path: '/parties', icon: 'fas fa-users' },
  { label: 'Expense', path: '/expense', icon: 'fas fa-receipt' },
  { label: 'Finance', path: '/finance', icon: 'fas fa-dollar-sign' },
  { label: 'Reports', path: '/reports', icon: 'fas fa-chart-line' },
  { label: 'Settings', path: '/settings', icon: 'fas fa-cog' },
]

const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileOpen.value = !isMobileOpen.value
  } else {
    collapsed.value = !collapsed.value
  }
}

const closeMobileMenu = () => {
  if (isMobile.value) {
    isMobileOpen.value = false
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Logout failed:', err)
  }
}

const getInitials = (name?: string): string => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style lang="scss" scoped>
// Mobile Menu Button (Hidden on Desktop)
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 70px;
  left: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 15;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// Sidebar Wrapper
.sidebar-wrapper {
  position: relative;
}

// Sidebar Container
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e1e2d 0%, #252d3d 100%);
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  left: 0;
  top: 70px;
  z-index: 10;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

  &.collapsed {
    width: 80px;

    .logo-text {
      display: none;
    }

    .menu-label {
      display: none;
    }

    .user-details {
      display: none;
    }

    .collapse-btn {
      transform: rotate(180deg);
    }

    .logout-btn span {
      display: none;
    }
  }

  // Logo Section
  .logo-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
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

    .collapse-btn {
      background: none;
      border: none;
      color: #a0aec0;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.5rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #667eea;
        transform: scale(1.1);
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

  // Logout Section
  .logout-section {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(245, 101, 101, 0.1);
      border: 1px solid rgba(245, 101, 101, 0.3);
      color: #fc8181;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;

      i {
        font-size: 1rem;
      }

      &:hover {
        background: rgba(245, 101, 101, 0.2);
        border-color: rgba(245, 101, 101, 0.5);
        color: #f56565;
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }
}

// Mobile Overlay
.mobile-overlay {
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9;
    animation: fadeIn 0.3s ease;
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

// Tablet & Below
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 260px;
    height: calc(100vh - 70px);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    top: 70px;

    &.mobile-open {
      transform: translateX(0);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
    }

    &.collapsed {
      width: 260px;

      .logo-text {
        display: inline;
      }

      .menu-label {
        display: inline;
      }

      .user-details {
        display: block;
      }

      .logout-btn span {
        display: inline;
      }
    }
  }
}

// Small Mobile
@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    max-width: 85vw;

    &.collapsed {
      width: 100%;
      max-width: 85vw;
    }
  }

  .mobile-menu-btn {
    left: 0.75rem;
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
