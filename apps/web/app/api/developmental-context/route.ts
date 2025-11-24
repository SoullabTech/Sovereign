import { NextRequest, NextResponse } from 'next/server';
import { getDevelopmentalContext, formatForSystemPrompt, hasDevelopmentalData } from '@/lib/insights/DevelopmentalContext';

export const dynamic = 'force-dynamic';

/**
 * API endpoint to fetch developmental context for MAIA
 * This provides her with awareness of user's consciousness metrics
 *
 * Usage in MAIA's system:
 * 1. Call this endpoint with userId
 * 2. Inject the formatted context into MAIA's system prompt
 * 3. She can now reference specific metrics and patterns
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const format = request.nextUrl.searchParams.get('format') || 'json'; // 'json' or 'prompt'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch developmental context
    const context = await getDevelopmentalContext(userId);

    // Return in requested format
    if (format === 'prompt') {
      // Return formatted for system prompt injection
      return NextResponse.json({
        success: true,
        hasData: hasDevelopmentalData(context),
        promptText: formatForSystemPrompt(context),
        context
      });
    } else {
      // Return raw JSON
      return NextResponse.json({
        success: true,
        hasData: hasDevelopmentalData(context),
        context
      });
    }

  } catch (error) {
    console.error('[DevelopmentalContext API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch developmental context',
        success: false
      },
      { status: 500 }
    );
  }
}
