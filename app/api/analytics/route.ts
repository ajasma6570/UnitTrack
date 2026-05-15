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
    
    let monthlyUsage = 0
    let monthlyGenerated = 0
    
    if (monthlyEntries.length > 0) {
      const lastEntry = monthlyEntries[monthlyEntries.length - 1]
      const firstEntry = monthlyEntries[0]
      
      const prevEntry = await prisma.solarEntry.findFirst({
        where: { date: { lt: firstEntry.date } },
        orderBy: { date: 'desc' },
      })
      
      const lastNet = Number(lastEntry.totalGeneration) + Number(lastEntry.importGrid) - Number(lastEntry.exportGrid)
      const lastGen = Number(lastEntry.totalGeneration)
      
      if (prevEntry) {
        const prevNet = Number(prevEntry.totalGeneration) + Number(prevEntry.importGrid) - Number(prevEntry.exportGrid)
        const prevGen = Number(prevEntry.totalGeneration)
        monthlyUsage = lastNet - prevNet
        monthlyGenerated = lastGen - prevGen
      } else {
        // If no previous entry, we can only calculate usage from the first entry we have
        // But the first entry itself represents the usage from 'zero' to that date?
        // Or should we just sum unitUsed for the available days?
        // Let's use the net of the first entry as its usage for now.
        monthlyUsage = lastNet
        monthlyGenerated = lastGen
      }
    }

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

    let yearlyUsage = 0
    if (yearEntries.length > 0) {
      const lastEntry = yearEntries[yearEntries.length - 1]
      const firstEntry = yearEntries[0]
      
      const prevEntry = await prisma.solarEntry.findFirst({
        where: { date: { lt: firstEntry.date } },
        orderBy: { date: 'desc' },
      })
      
      const lastNet = Number(lastEntry.totalGeneration) + Number(lastEntry.importGrid) - Number(lastEntry.exportGrid)
      
      if (prevEntry) {
        const prevNet = Number(prevEntry.totalGeneration) + Number(prevEntry.importGrid) - Number(prevEntry.exportGrid)
        yearlyUsage = lastNet - prevNet
      } else {
        yearlyUsage = lastNet
      }
    }

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
