// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/capacitor-patch-routes.sh
export const dynamic = 'force-dynamic';

/**
 * Session Processing API
 * POST /api/maia/session/process
 *
 * Backend for MCP Tool 8 (session_notes).
 * Turns raw session transcripts into structured consciousness intelligence.
 *
 * Input:
 *   - memberId: string (required)
 *   - transcript: string (required, min 50 chars)
 *   - sessionId?: string
 *   - privacyMode?: 'standard' | 'sanctuary' | 'full'
 *   - consentLevel?: 'full' | 'summary_only' | 'metadata_only'
 *   - runResonanceSearch?: boolean (default true)
 *
 * Output:
 *   - markdown, stateVector, thresholdEvents, expansionEvents, motifs,
 *     followUps, resonanceEchoes, sovereigntyScore, memoryPacketsWritten
 */

import { NextRequest, NextResponse } from 'next/server';
import { processSession } from '@/lib/maia/sessionProcessor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      memberId,
      transcript,
      sessionId,
      privacyMode = 'standard',
      consentLevel = 'full',
      runResonanceSearch = true,
    } = body;

    // Validation
    if (!memberId || typeof memberId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'memberId is required' },
        { status: 400 }
      );
    }

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { success: false, error: 'transcript is required' },
        { status: 400 }
      );
    }

    const validPrivacyModes = ['standard', 'sanctuary', 'full'];
    if (!validPrivacyModes.includes(privacyMode)) {
      return NextResponse.json(
        { success: false, error: `privacyMode must be one of: ${validPrivacyModes.join(', ')}` },
        { status: 400 }
      );
    }

    const validConsentLevels = ['full', 'summary_only', 'metadata_only'];
    if (!validConsentLevels.includes(consentLevel)) {
      return NextResponse.json(
        { success: false, error: `consentLevel must be one of: ${validConsentLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Process
    const result = await processSession({
      memberId,
      transcript,
      sessionId,
      privacyMode,
      consentLevel,
      runResonanceSearch,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[SessionProcess] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Session processing failed' },
      { status: 500 }
    );
  }
}
