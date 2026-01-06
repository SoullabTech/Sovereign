export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;

// Skip during static export (Capacitor builds)

/**
 * Simple error logging endpoint for client-side errors
 * Prevents 404s when the client tries to log errors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.error('🚨 [CLIENT ERROR]', {
      timestamp: new Date().toISOString(),
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ...body
    });

    return NextResponse.json({
      success: true,
      message: 'Error logged successfully'
    });

  } catch (error) {
    console.error('❌ [LOG-ERROR] Failed to process error log:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Error logging endpoint - use POST to log errors'
  });
}