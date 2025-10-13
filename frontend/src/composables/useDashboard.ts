// composables/useDashboard.ts
import { ref, reactive, computed } from 'vue'
import type { 
  DashboardStats, 
  RecentActivity, 
  CategoryData, 
  ChartDataPoint,
  DashboardResponse 
} from '@/types/dashboard'

export const useDashboard = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Reactive state
  const stats = reactive<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    itemsInStock: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    inventoryGrowth: 0
  })

  const recentActivities = ref<RecentActivity[]>([])
  const topCategories = ref<CategoryData[]>([])
  const chartData = ref<Record<string, ChartDataPoint>>({})

  // Computed properties
  const formattedStats = computed(() => ({
    totalRevenue: formatCurrency(stats.totalRevenue),
    totalOrders: formatNumber(stats.totalOrders),
    activeCustomers: formatNumber(stats.activeCustomers),
    itemsInStock: formatNumber(stats.itemsInStock)
  }))

  const recentActivitiesGrouped = computed(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const groups = {
      today: [] as RecentActivity[],
      yesterday: [] as RecentActivity[],
      older: [] as RecentActivity[]
    }
    
    recentActivities.value.forEach(activity => {
      const activityDate = new Date(activity.timestamp)
      if (isSameDay(activityDate, today)) {
        groups.today.push(activity)
      } else if (isSameDay(activityDate, yesterday)) {
        groups.yesterday.push(activity)
      } else {
        groups.older.push(activity)
      }
    })
    
    return groups
  })

  // Utility functions
  const formatCurrency = (value: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      notation: value >= 1000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(value)
  }

  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100)
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    }
    
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds)
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
      }
    }
    
    return 'just now'
  }

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  // API functions
  const fetchDashboardData = async (period = '7d'): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/dashboard?period=${period}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: DashboardResponse = await response.json()
      
      // Update reactive state
      Object.assign(stats, data.stats)
      recentActivities.value = data.recentActivities.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))
      topCategories.value = data.topCategories
      chartData.value = data.chartData
      lastUpdated.value = new Date(data.lastUpdated)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      console.error('Dashboard fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Mock data function for development
  const loadMockData = (): void => {
    Object.assign(stats, {
      totalRevenue: 125430.50,
      totalOrders: 1247,
      activeCustomers: 892,
      itemsInStock: 2156,
      revenueGrowth: 12.5,
      ordersGrowth: 8.2,
      customersGrowth: 15.3,
      inventoryGrowth: -3.1
    })

    recentActivities.value = [
      {
        id: '1',
        type: 'invoice',
        description: 'Invoice #INV-2024-001 created for John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        amount: 1250.00,
        customer: 'John Doe',
        reference: 'INV-2024-001'
      },
      {
        id: '2',
        type: 'payment',
        description: 'Payment received from Sarah Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        amount: 890.50,
        customer: 'Sarah Smith',
        status: 'completed'
      },
      {
        id: '3',
        type: 'order',
        description: 'New order #ORD-2024-156 placed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        amount: 445.75,
        reference: 'ORD-2024-156'
      },
      {
        id: '4',
        type: 'alert',
        description: 'Low stock alert: iPhone 15 Pro Max',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        status: 'warning'
      },
      {
        id: '5',
        type: 'expense',
        description: 'Office supplies expense recorded',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        amount: 156.78
      }
    ]

    topCategories.value = [
      { name: 'Electronics', percentage: 35, value: 43900.75, color: '#3B82F6' },
      { name: 'Clothing', percentage: 28, value: 35120.30, color: '#10B981' },
      { name: 'Home & Garden', percentage: 22, value: 27594.65, color: '#F59E0B' },
      { name: 'Books', percentage: 10, value: 12543.05, color: '#EF4444' },
      { name: 'Sports', percentage: 5, value: 6271.75, color: '#8B5CF6' }
    ]

    chartData.value = {
      '7d': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [12500, 15200, 18300, 16800, 21400, 19600, 23100]
      },
      '30d': {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        values: Array.from({ length: 30 }, () => Math.floor(Math.random() * 5000) + 15000)
      },
      '90d': {
        labels: Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`),
        values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20000) + 40000)
      },
      '1y': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [85000, 92000, 78000, 105000, 118000, 125000, 135000, 142000, 138000, 155000, 148000, 162000]
      }
    }

    lastUpdated.value = new Date()
  }

  // Initialize with mock data for development
  const initialize = async (useMockData = false): Promise<void> => {
    if (useMockData) {
      loadMockData()
    } else {
      await fetchDashboardData()
    }
  }

  const refreshData = async (period?: string): Promise<void> => {
    await fetchDashboardData(period)
  }

  return {
    // State
    isLoading,
    error,
    stats,
    recentActivities,
    topCategories,
    chartData,
    lastUpdated,
    
    // Computed
    formattedStats,
    recentActivitiesGrouped,
    
    // Methods
    fetchDashboardData,
    refreshData,
    initialize,
    loadMockData,
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatTimeAgo
  }
}