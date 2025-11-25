import { NextRequest, NextResponse } from 'next/server';
import { maiaModelSystem } from '@/lib/models/maia-integration';

/**
 * MAIA Model System Status API
 * Provides system health, performance metrics, and management controls
 */

export async function GET(req: NextRequest) {
  try {
    // Initialize system if needed
    await maiaModelSystem.initialize();

    // Get comprehensive system status
    const status = await maiaModelSystem.getSystemStatus();

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      }
    });

  } catch (error) {
    console.error('Status API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get system status',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'refresh':
        await maiaModelSystem.initialize();
        await maiaModelSystem.refresh();

        return NextResponse.json({
          success: true,
          message: 'System refreshed successfully',
          timestamp: new Date().toISOString()
        });

      case 'health-check':
        await maiaModelSystem.initialize();
        const status = await maiaModelSystem.getSystemStatus();

        return NextResponse.json({
          success: true,
          data: {
            healthy: status.status === 'healthy',
            status: status.status,
            issues: status.recommendations
          },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Status action API error:', error);

    return NextResponse.json(
      {
        error: 'Action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}