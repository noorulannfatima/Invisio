<template>
    <div class="dashboard">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
            <div class="header-content">
                <h1>Dashboard</h1>
                <p class="subtitle">Welcome back! Here's what's happening with your business today.</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-primary" @click="refreshData" :disabled="isLoading">
                    <RefreshCwIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" />
                    Refresh
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon revenue">
                    <DollarSignIcon class="w-6 h-6" />
                </div>
                <div class="stat-content">
                    <h3>Total Revenue</h3>
                    <p class="stat-value">${{ formatNumber(stats.totalRevenue) }}</p>
                    <span class="stat-change positive">+12.5%</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orders">
                    <ShoppingCartIcon class="w-6 h-6" />
                </div>
                <div class="stat-content">
                    <h3>Total Orders</h3>
                    <p class="stat-value">{{ formatNumber(stats.totalOrders) }}</p>
                    <span class="stat-change positive">+8.2%</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon customers">
                    <UsersIcon class="w-6 h-6" />
                </div>
                <div class="stat-content">
                    <h3>Active Customers</h3>
                    <p class="stat-value">{{ formatNumber(stats.activeCustomers) }}</p>
                    <span class="stat-change positive">+15.3%</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon inventory">
                    <PackageIcon class="w-6 h-6" />
                </div>
                <div class="stat-content">
                    <h3>Items in Stock</h3>
                    <p class="stat-value">{{ formatNumber(stats.itemsInStock) }}</p>
                    <span class="stat-change negative">-3.1%</span>
                </div>
            </div>
        </div>

        <!-- Charts and Analytics -->
        <div class="charts-section">
            <div class="chart-container">
                <div class="chart-header">
                    <h3>Revenue Trend</h3>
                    <div class="chart-filters">
                        <button
                            v-for="period in periods"
                            :key="period.value"
                            :class="['filter-btn', { active: selectedPeriod === period.value }]"
                            @click="changePeriod(period.value)"
                        >
                            {{ period.label }}
                        </button>
                    </div>
                </div>
                <div class="chart-content">
                    <canvas ref="revenueChart" class="chart-canvas"></canvas>
                </div>
            </div>
            <div class="chart-container">
                <div class="chart-header">
                    <h3>Top Categories</h3>
                </div>
                <div class="chart-content">
                    <div class="category-list">
                        <div v-for="category in topCategories" :key="category.name" class="category-item">
                            <div class="category-info">
                                <span class="category-name">{{ category.name }}</span>
                                <span class="category-percentage">{{ category.percentage }}%</span>
                            </div>
                            <div class="category-bar">
                                <div
                                    class="category-progress"
                                    :style="{ 
                                        width: category.percentage + '%',
                                        backgroundColor: category.color 
                                    }"
                                ></div>
                            </div>
                            <span class="category-value">${{ formatNumber(category.value) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity and Quick Actions -->
        <div class="bottom-section">
            <div class="recent-activity">
                <div class="section-header">
                    <h3>Recent Activity</h3>
                    <router-link to="/invoices" class="view-all-link">View All</router-link>
                </div>
                <div class="activity-list">
                    <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                        <div class="activity-icon" :class="activity.type">
                            <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
                        </div>
                        <div class="activity-content">
                            <p class="activity-description">{{ activity.description }}</p>
                            <span class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</span>
                        </div>
                        <div class="activity-amount" v-if="activity.amount">
                            ${{ formatNumber(activity.amount) }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="quick-actions">
                <div class="section-header">
                    <h3>Quick Actions</h3>
                </div>
                <div class="action-grid">
                    <router-link to="/invoices/create" class="action-card">
                        <PlusIcon class="w-6 h-6" />
                        <span>Create Invoice</span>
                    </router-link>
                    <router-link to="/items/create" class="action-card">
                        <PackageIcon class="w-6 h-6" />
                        <span>Add Item</span>
                    </router-link>
                    <router-link to="/customers" class="action-card">
                        <UserPlusIcon class="w-6 h-6" />
                        <span>Add Customer</span>
                    </router-link>
                    <router-link to="/inventory" class="action-card">
                        <BarChart3Icon class="w-6 h-6" />
                        <span>View Inventory</span>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { 
    DollarSignIcon, 
    ShoppingCartIcon, 
    UsersIcon, 
    PackageIcon,
    RefreshCwIcon,
    PlusIcon,
    UserPlusIcon,
    BarChart3Icon,
    FileTextIcon,
    CreditCardIcon,
    TrendingUpIcon,
    AlertCircleIcon
} from 'lucide-vue-next'
import Chart from 'chart.js/auto'
import type { ChartConfiguration } from 'chart.js'

// Types
interface Stats {
    totalRevenue: number
    totalOrders: number
    activeCustomers: number
    itemsInStock: number
}

interface Period {
    label: string
    value: string
}

interface Category {
    name: string
    percentage: number
    value: number
    color: string
}

interface Activity {
    id: string
    type: 'invoice' | 'payment' | 'order' | 'alert'
    description: string
    timestamp: Date
    amount?: number
}

// Reactive data
const isLoading = ref(false)
const revenueChart = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const selectedPeriod = ref('7d')
const periods: Period[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' }
]

const stats = reactive<Stats>({
    totalRevenue: 125430.50,
    totalOrders: 1247,
    activeCustomers: 892,
    itemsInStock: 2156
})

const topCategories = reactive<Category[]>([
    { name: 'Electronics', percentage: 35, value: 43900.75, color: '#3B82F6' },
    { name: 'Clothing', percentage: 28, value: 35120.30, color: '#10B981' },
    { name: 'Home & Garden', percentage: 22, value: 27594.65, color: '#F59E0B' },
    { name: 'Books', percentage: 10, value: 12543.05, color: '#EF4444' },
    { name: 'Sports', percentage: 5, value: 6271.75, color: '#8B5CF6' }
])

const recentActivities = reactive<Activity[]>([
    {
        id: '1',
        type: 'invoice',
        description: 'Invoice #INV-2024-001 created for John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        amount: 1250.00
    },
    {
        id: '2',
        type: 'payment',
        description: 'Payment received from Sarah Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        amount: 890.50
    },
    {
        id: '3',
        type: 'order',
        description: 'New order #ORD-2024-156 placed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        amount: 445.75
    },
    {
        id: '4',
        type: 'alert',
        description: 'Low stock alert: iPhone 15 Pro Max',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3)
    },
    {
        id: '5',
        type: 'invoice',
        description: 'Invoice #INV-2024-002 sent to Mike Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        amount: 2100.00
    }
])

// Chart data based on selected period
const chartData = computed(() => {
    const data = {
        '7d': {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [12500, 15200, 18300, 16800, 21400, 19600, 23100]
        },
        '30d': {
            labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
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
    return data[selectedPeriod.value as keyof typeof data]
})

// Methods
const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value)
}

const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
}

const getActivityIcon = (type: string) => {
    const icons = {
        invoice: FileTextIcon,
        payment: CreditCardIcon,
        order: ShoppingCartIcon,
        alert: AlertCircleIcon
    }
    return icons[type as keyof typeof icons] || FileTextIcon
}

const refreshData = async () => {
    isLoading.value = true
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update stats with some random variation
        stats.totalRevenue += Math.floor(Math.random() * 1000) - 500
        stats.totalOrders += Math.floor(Math.random() * 10) - 5
        stats.activeCustomers += Math.floor(Math.random() * 20) - 10
        stats.itemsInStock += Math.floor(Math.random() * 50) - 25
        
        // Update chart
        updateChart()
    } finally {
        isLoading.value = false
    }
}

const changePeriod = (period: string) => {
    selectedPeriod.value = period
    updateChart()
}

const createChart = () => {
    if (!revenueChart.value) return
    
    const ctx = revenueChart.value.getContext('2d')
    if (!ctx) return
    
    const config: ChartConfiguration = {
        type: 'line',
        data: {
            labels: chartData.value.labels,
            datasets: [{
                label: 'Revenue',
                data: chartData.value.values,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        color: '#6B7280',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        color: '#6B7280',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '$' + new Intl.NumberFormat('en-US', {
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value as number)
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    }
    
    chartInstance = new Chart(ctx, config)
}

const updateChart = () => {
    if (!chartInstance) return
    
    chartInstance.data.labels = chartData.value.labels
    chartInstance.data.datasets[0].data = chartData.value.values
    chartInstance.update('active')
}

// Lifecycle
onMounted(async () => {
    await nextTick()
    createChart()
})
</script>

<style lang="scss" scoped>
.dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 2rem;

    @media (max-width: 768px) {
        padding: 1rem;
    }
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem;
    }

    .header-content {
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            color: #6b7280;
            font-size: 1.125rem;
        }
    }

    .header-actions {
        .btn {
            display: inline-flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;

            &.btn-primary {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;

                &:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
                }

                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            }

            .animate-spin {
                animation: spin 1s linear infinite;
            }
        }
    }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;

        &.revenue {
            background: linear-gradient(135deg, #10b981, #059669);
        }

        &.orders {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        &.customers {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        &.inventory {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
    }

    .stat-content {
        flex: 1;

        h3 {
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.25rem;
        }

        .stat-change {
            font-size: 0.875rem;
            font-weight: 600;

            &.positive {
                color: #10b981;
            }

            &.negative {
                color: #ef4444;
            }
        }
    }
}

.charts-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
}

.chart-container {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .chart-header {
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
        }

        .chart-filters {
            display: flex;
            gap: 0.5rem;

            .filter-btn {
                padding: 0.5rem 1rem;
                border: 1px solid #e5e7eb;
                background: white;
                color: #6b7280;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                }

                &.active {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                }
            }
        }
    }

    .chart-content {
        padding: 1.5rem 2rem;

        .chart-canvas {
            height: 300px;
        }
    }
}

.category-list {
    .category-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #f3f4f6;

        &:last-child {
            border-bottom: none;
        }

        .category-info {
            min-width: 120px;

            .category-name {
                display: block;
                font-weight: 600;
                color: #1f2937;
                font-size: 0.875rem;
            }

            .category-percentage {
                font-size: 0.75rem;
                color: #6b7280;
            }
        }

        .category-bar {
            flex: 1;
            height: 8px;
            background: #f3f4f6;
            border-radius: 4px;
            overflow: hidden;

            .category-progress {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
            }
        }

        .category-value {
            min-width: 80px;
            text-align: right;
            font-weight: 600;
            color: #1f2937;
            font-size: 0.875rem;
        }
    }
}

.bottom-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
}

.recent-activity,
.quick-actions {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .section-header {
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
        }

        .view-all-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.875rem;

            &:hover {
                color: #1d4ed8;
            }
        }
    }
}

.activity-list {
    padding: 1rem 2rem 2rem;

    .activity-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #f3f4f6;

        &:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;

            &.invoice {
                background: #3b82f6;
            }

            &.payment {
                background: #10b981;
            }

            &.order {
                background: #8b5cf6;
            }

            &.alert {
                background: #ef4444;
            }
        }

        .activity-content {
            flex: 1;

            .activity-description {
                font-size: 0.875rem;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .activity-time {
                font-size: 0.75rem;
                color: #6b7280;
            }
        }

        .activity-amount {
            font-weight: 600;
            color: #10b981;
        }
    }
}

.action-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.5rem 2rem;

    .action-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        border: 2px dashed #e5e7eb;
        border-radius: 0.75rem;
        text-decoration: none;
        color: #6b7280;
        transition: all 0.2s ease;

        &:hover {
            border-color: #3b82f6;
            color: #3b82f6;
            background: #f8fafc;
        }

        span {
            font-size: 0.875rem;
            font-weight: 600;
        }
    }
}
</style>