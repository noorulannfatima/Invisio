<template>
  <aside :class="['sidebar', { collapsed }]">
    <div class="logo" @click="toggleSidebar">
      <span v-if="!collapsed">Dashboard</span>
      <span v-else>📦</span>
    </div>

    <nav class="menu">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        :class="{ active: route.path === item.path }"
      >
        <i :class="item.icon"></i>
        <span v-if="!collapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="toggle-btn" @click="toggleSidebar">
      <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

interface MenuItem {
  label: string
  path: string
  icon: string
}

const route = useRoute()
const collapsed = ref(false)

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

const menuItems: MenuItem[] = [
  { label: 'Home', path: '/dashboard', icon: 'fas fa-home' },
  { label: 'Inventory', path: '/inventory', icon: 'fas fa-boxes' },
  { label: 'Finance', path: '/finance', icon: 'fas fa-coins' },
  { label: 'Reports', path: '/reports', icon: 'fas fa-chart-line' },
  { label: 'Settings', path: '/settings', icon: 'fas fa-cog' },
]

</script>

<style lang="scss" scoped>
.sidebar {
  
margin-top: 70px;
  width: 250px;
  background-color: #1e1e2d;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;

  &.collapsed {
    width: 80px;

    .menu-item span {
      display: none;
    }

    .toggle-btn {
      justify-content: center;
    }
  }

  .logo {
    font-size: 1.4rem;
    font-weight: 700;
    text-align: center;
    padding: 20px 0;
    background-color: #27293d;
    cursor: pointer;
    border-bottom: 1px solid #333;
  }

  .menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px 0;

    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: #ccc;
      text-decoration: none;
      font-size: 0.95rem;
      transition: background 0.2s ease;

      i {
        width: 25px;
        font-size: 1.1rem;
        margin-right: 10px;
        text-align: center;
      }

      &:hover {
        background-color: #2c2e44;
        color: #fff;
      }

      &.active {
        background-color: #2b2f55;
        color: #fff;
      }
    }
  }

  .toggle-btn {
    padding: 10px;
    background-color: #27293d;
    text-align: right;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid #333;

    i {
      font-size: 1rem;
      color: #ccc;
    }

    &:hover i {
      color: #fff;
    }
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);

    &.collapsed {
      transform: translateX(0);
    }

    position: fixed;
    height: 100vh;
    z-index: 20;
  }
}

</style>
