export const dynamic = 'force-static';

/**
 * MARKETING DASHBOARD API
 *
 * Aggregated marketing metrics and quick stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMarketingDashboard, getMarketingAnalytics } from '@/lib/stellium/marketing';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ dashboard: {} });
  }
  try {
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitionerId');

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'practitionerId is required' },
        { status: 400 }
      );
    }

    // Get view type
    const view = searchParams.get('view') || 'dashboard';

    if (view === 'analytics') {
      // Get analytics for a time period
      const periodType = (searchParams.get('periodType') as 'day' | 'week' | 'month') || 'day';
      const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const endDate = new Date(searchParams.get('endDate') || new Date());

      const analytics = await getMarketingAnalytics(
        practitionerId,
        periodType,
        startDate,
        endDate
      );

      return NextResponse.json({ analytics });
    }

    // Default: return dashboard overview
    const dashboard = await getMarketingDashboard(practitionerId);

    return NextResponse.json({ dashboard });
  } catch (error) {
    console.error('Failed to get marketing dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to get marketing dashboard' },
      { status: 500 }
    );
  }
}
