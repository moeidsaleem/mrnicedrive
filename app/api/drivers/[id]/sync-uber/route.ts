import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../libs/database'
import { uberSyncService } from '../../../../libs/uber-sync'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Find the driver in the local DB
    const driver = await prisma.driver.findUnique({ where: { id } })
    if (!driver || !driver.uberDriverId) {
      return NextResponse.json({ success: false, error: 'Driver or Uber ID not found' }, { status: 404 })
    }
    // Sync this driver from Uber
    await uberSyncService.syncSpecificDriver(driver.uberDriverId)
    return NextResponse.json({ success: true, message: 'Driver synced from Uber' })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Sync failed' }, { status: 500 })
  }
} 