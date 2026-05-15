export interface SolarEntry {
  id: string
  date: string
  totalGeneration: number
  importGrid: number
  exportGrid: number
  unitUsed: number
  createdAt: string
  updatedAt: string
}

export interface DashboardMetrics {
  todayUsage: number
  yesterdayUsage: number
  monthlyUsage: number
  monthlyGenerated: number
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface MonthlyChartData {
  date: string
  usage: number
}

export interface GenerationChartData {
  date: string
  generation: number
  export: number
}

export interface WeeklyChartData {
  date: string
  usage: number
}

export interface YearlyData {
  month: string
  usage: number
}

export interface AnalyticsResponse {
  todayUsage: number
  yesterdayUsage: number
  monthlyUsage: number
  monthlyGenerated: number
  yearlyUsage: number
  weeklyData: WeeklyChartData[]
  monthlyChartData: MonthlyChartData[]
  yearlyData: YearlyData[] // This is by month
  yearlyChartData: { year: string; usage: number }[] // This is by year
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  entries: T[]
  total: number
  hasMore: boolean
  page: number
  limit: number
}
