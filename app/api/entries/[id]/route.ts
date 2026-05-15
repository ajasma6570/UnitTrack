import { prisma } from '@/lib/prisma'
import { SolarEntry, ApiResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { date, totalGeneration, importGrid, exportGrid } = body

    if (!date || totalGeneration === undefined || importGrid === undefined || exportGrid === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const unitUsed = parseFloat((totalGeneration + importGrid - exportGrid).toFixed(2))

    const entry = await prisma.solarEntry.update({
      where: { id },
      data: {
        date: new Date(date),
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
    console.error('[v0] PUT /api/entries/[id] error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.solarEntry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[v0] DELETE /api/entries/[id] error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete entry' },
      { status: 500 }
    )
  }
}
