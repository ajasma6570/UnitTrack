import { prisma } from '@/lib/prisma'
import { SolarEntry } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query) {
      return NextResponse.json([])
    }

    // Search by date (assuming query is a year)
    const startDate = new Date(`${query}-01-01`)
    const endDate = new Date(`${query}-12-31`)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json([])
    }

    const entries = await prisma.solarEntry.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    })

    const formatted: SolarEntry[] = entries.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      totalGeneration: Number(entry.totalGeneration),
      importGrid: Number(entry.importGrid),
      exportGrid: Number(entry.exportGrid),
      unitUsed: Number(entry.unitUsed),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error('[v0] GET /api/entries/search error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search entries' },
      { status: 500 }
    )
  }
}
