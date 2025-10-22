import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresGuest: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true, layout: 'auth' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresGuest: true, layout: 'auth' },
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Main Dashboard
      { path: '', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },

      // Inventory
      { path: '/inventory', name: 'Inventory', component: () => import('@/views/Inventory.vue') },

      // Parties
      { path: '/parties', name: 'Parties', component: () => import('@/views/Parties.vue') },

      // Expense
      { path: '/expense', name: 'Expense', component: () => import('@/views/Expense.vue') },

      // Transactions (formerly Finance)
      { path: '/finance', name: 'Transactions', component: () => import('@/views/Finance.vue') },

      // Profit & Loss
      { path: '/profit-loss', name: 'ProfitLoss', component: () => import('@/views/ProfitLoss.vue') },

      // Stock Summary
      { path: '/stock-summary', name: 'StockSummary', component: () => import('@/views/StockSummary.vue') },

      // Party Ledger
      { path: '/party-ledger', name: 'PartyLedger', component: () => import('@/views/PartyLedger.vue') },

      // Brain (AI)
      { path: '/brain', name: 'Brain', component: () => import('@/views/Brain.vue') },

      // Settings
      { path: '/settings', name: 'Settings', component: () => import('@/views/Settings.vue') },

      // Reports (keep if still needed)
      { path: '/reports', name: 'Reports', component: () => import('@/views/Reports.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }

  next()
})

export default router
