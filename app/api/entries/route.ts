import { prisma } from '@/lib/prisma'
import { SolarEntry, ApiResponse, PaginatedResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, totalGeneration, importGrid, exportGrid } = body

    if (!date || totalGeneration === undefined || importGrid === undefined || exportGrid === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const unitUsed = parseFloat((totalGeneration + importGrid - exportGrid).toFixed(2))
    const entryDate = new Date(date)

    const entry = await prisma.solarEntry.upsert({
      where: { date: entryDate },
      update: {
        totalGeneration: parseFloat(totalGeneration),
        importGrid: parseFloat(importGrid),
        exportGrid: parseFloat(exportGrid),
        unitUsed,
      },
      create: {
        date: entryDate,
        totalGeneration: parseFloat(totalGeneration),
        importGrid: parseFloat(importGrid),
        exportGrid: parseFloat(exportGrid),
        unitUsed,
      },
    })

    const formattedEntry: SolarEntry = {
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      totalGeneration: Number(entry.totalGeneration),
      importGrid: Number(entry.importGrid),
      exportGrid: Number(entry.exportGrid),
      unitUsed: Number(entry.unitUsed),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }

    return NextResponse.json({ success: true, data: formattedEntry })
  } catch (error: any) {
    console.error('[v0] POST /api/entries error:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Entry for this date already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create entry' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const total = await prisma.solarEntry.count()

    const entries = await prisma.solarEntry.findMany({
      orderBy: { date: 'desc' },
      skip: offset,
      take: limit,
    })

    const formattedEntries: SolarEntry[] = entries.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      totalGeneration: Number(entry.totalGeneration),
      importGrid: Number(entry.importGrid),
      exportGrid: Number(entry.exportGrid),
      unitUsed: Number(entry.unitUsed),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }))

    const response: PaginatedResponse<SolarEntry> = {
      entries: formattedEntries,
      total,
      hasMore: offset + limit < total,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[v0] GET /api/entries error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}
