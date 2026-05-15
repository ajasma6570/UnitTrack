import { prisma } from '@/lib/prisma'
import { AnalyticsResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const yearStart = new Date(today.getFullYear(), 0, 1)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get all entries for all time to support yearly chart
    const allEntries = await prisma.solarEntry.findMany({
      orderBy: { date: 'asc' },
    })

    const yearEntries = allEntries.filter(e => e.date >= yearStart)

    // Filter today's entry
    const todayUsage = yearEntries
      .filter(e => e.date.toISOString().split('T')[0] === today.toISOString().split('T')[0])
      .reduce((sum, e) => sum + Number(e.unitUsed), 0)

    // Filter yesterday's entry
    const yesterdayUsage = yearEntries
      .filter(e => e.date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0])
      .reduce((sum, e) => sum + Number(e.unitUsed), 0)

    // Filter monthly entries
    const monthlyEntries = yearEntries.filter(e => e.date >= monthStart)
    const monthlyUsage = monthlyEntries.reduce((sum, e) => sum + Number(e.unitUsed), 0)
    const monthlyGenerated = monthlyEntries.reduce((sum, e) => sum + Number(e.totalGeneration), 0)

    // Weekly data (last 7 days)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weeklyEntries = allEntries.filter(e => e.date >= weekAgo)
    const weeklyData = weeklyEntries.map(e => ({
      date: e.date.toISOString().split('T')[0],
      usage: Number(e.unitUsed)
    }))

    // Group by date for monthly chart (daily usage this month)
    const dateMap = new Map<string, number>()
    monthlyEntries.forEach((entry) => {
      const dateStr = entry.date.toISOString().split('T')[0]
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + Number(entry.unitUsed))
    })
    const monthlyChartData = Array.from(dateMap).map(([date, usage]) => ({
      date,
      usage,
    }))

    // Yearly data by month (for current year)
    const monthlyMapByMonth = new Map<number, number>()
    yearEntries.forEach((entry) => {
      const month = entry.date.getMonth()
      monthlyMapByMonth.set(month, (monthlyMapByMonth.get(month) || 0) + Number(entry.unitUsed))
    })
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const yearlyData = monthNames.map((month, idx) => ({
      month,
      usage: parseFloat((monthlyMapByMonth.get(idx) || 0).toFixed(2)),
    }))

    // Yearly data by year (for all time)
    const yearlyMapByYear = new Map<string, number>()
    allEntries.forEach((entry) => {
      const year = entry.date.getFullYear().toString()
      yearlyMapByYear.set(year, (yearlyMapByYear.get(year) || 0) + Number(entry.unitUsed))
    })
    const yearlyChartData = Array.from(yearlyMapByYear).map(([year, usage]) => ({
      year,
      usage: parseFloat(usage.toFixed(2))
    }))

    const yearlyUsage = yearEntries.reduce((sum, e) => sum + Number(e.unitUsed), 0)

    const response: AnalyticsResponse = {
      todayUsage,
      yesterdayUsage,
      monthlyUsage,
      monthlyGenerated,
      yearlyUsage,
      weeklyData,
      monthlyChartData,
      yearlyData,
      yearlyChartData,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[v0] GET /api/analytics error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
