export const dynamic = 'force-dynamic';

/**
 * TTS Sovereignty Monitor API
 *
 * GET  - Get latest report and check status
 * POST - Trigger a manual check (weekly automatic)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ttsSovereigntyMonitor } from '@/lib/sovereignty/TTSSovereigntyMonitor';

export async function GET(request: NextRequest) {
  try {
    // Get latest report
    const report = await ttsSovereigntyMonitor.getLatestReport();
    const checkDue = await ttsSovereigntyMonitor.isCheckDue();

    if (!report) {
      return NextResponse.json({
        status: 'no-data',
        message: 'No sovereignty check has been run yet',
        checkDue: true,
      });
    }

    return NextResponse.json({
      status: 'ok',
      report,
      checkDue,
      lastChecked: report.generated_at,
      nextCheck: report.next_check,
    });
  } catch (error) {
    console.error('[TTS Monitor API] Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sovereignty report' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    // Check if a check is due (unless forced)
    if (!force) {
      const checkDue = await ttsSovereigntyMonitor.isCheckDue();
      if (!checkDue) {
        const report = await ttsSovereigntyMonitor.getLatestReport();
        return NextResponse.json({
          status: 'skipped',
          message: 'Check not yet due. Use force: true to override.',
          report,
          nextCheck: report?.next_check,
        });
      }
    }

    // Run the sovereignty check
    console.log('[TTS Monitor API] Running sovereignty check...');
    const report = await ttsSovereigntyMonitor.runCheck();

    return NextResponse.json({
      status: 'completed',
      message: 'Sovereignty check completed',
      report,
    });
  } catch (error) {
    console.error('[TTS Monitor API] Error running check:', error);
    return NextResponse.json(
      { error: 'Failed to run sovereignty check' },
      { status: 500 }
    );
  }
}
