// types/dashboard.ts
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  itemsInStock: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  customersGrowth?: number;
  inventoryGrowth?: number;
}

export interface TimePeriod {
  label: string;
  value: string;
}

export interface CategoryData {
  name: string;
  percentage: number;
  value: number;
  color: string;
}

export type ActivityType = 'invoice' | 'payment' | 'order' | 'alert' | 'expense' | 'customer';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  amount?: number;
  status?: string;
  customer?: string;
  reference?: string;
}

export interface ChartDataPoint {
  labels: string[];
  values: number[];
}

export interface QuickAction {
  name: string;
  icon: string;
  route: string;
  description?: string;
}

export interface DashboardConfig {
  refreshInterval: number;
  defaultPeriod: string;
  chartAnimationDuration: number;
  maxRecentActivities: number;
}

// API Response types
export interface DashboardResponse {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  topCategories: CategoryData[];
  chartData: Record<string, ChartDataPoint>;
  lastUpdated: Date;
}

// Chart configuration types
export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
    };
  };
  scales: {
    x: any;
    y: any;
  };
  interaction: {
    intersect: boolean;
    mode: string;
  };
}