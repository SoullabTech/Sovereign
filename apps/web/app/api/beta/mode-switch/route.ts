import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import { maiaMonitoring } from '@/lib/beta/MaiaMonitoring'

/**
 * POST /api/beta/mode-switch - Track when users switch between modes
 *
 * Called by ModeToggle component to log mode switching behavior
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, from, to, timestamp } = body

    // Validate input
    if (!userId || !from || !to) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, from, to'
      }, { status: 400 })
    }

    // Log the mode switch
    console.log(`🔀 Mode switch: ${userId} from ${from} to ${to}`)

    // This will be automatically tracked by MaiaMonitoring when sessions start
    // with different modes, but we can also log it explicitly here

    // Future: You could add additional tracking like:
    // - Time spent in each mode
    // - Reason for switch (if collected)
    // - What question triggered the switch

    return NextResponse.json({
      success: true,
      switched: {
        from,
        to,
        timestamp: timestamp || new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Mode switch tracking failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}