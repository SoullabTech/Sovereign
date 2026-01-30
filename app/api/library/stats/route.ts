// app/api/library/stats/route.ts
// Library statistics endpoint

import { NextResponse } from 'next/server';
import { LibraryService } from '@/lib/library/LibraryService';
import { isKimiAvailable } from '@/lib/ai/kimiClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/library/stats
 *
 * Get library statistics for the dashboard.
 */
export async function GET() {
  try {
    const library = new LibraryService();
    const stats = await library.getStats();
    const kimiAvailable = isKimiAvailable();

    return NextResponse.json({
      success: true,
      stats: {
        sources: stats.sources,
        chunks: stats.chunks,
        distillates: stats.distillates,
        total_tokens: stats.total_tokens,
        sources_by_status: stats.sources_by_status,
      },
      jeeves: {
        available: kimiAvailable,
        message: kimiAvailable
          ? 'Jeeves (Kimi) is available for deep synthesis'
          : 'Jeeves requires MOONSHOT_API_KEY',
      },
    });

  } catch (error: any) {
    console.error('Library stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
