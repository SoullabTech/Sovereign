export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 90;

/**
 * POST /api/scribe/export-report
 *
 * Generates a structured practitioner session report (internal only).
 * Not shareable externally — raw debug metadata is excluded from export.
 *
 * Request body:
 *   { sessionId, lens?, format? }
 *   lens: 'core' | 'spiralogic' | 'mentor' | 'full' (default: 'full')
 *   format: 'markdown' | 'json' (default: 'markdown')
 *
 * Returns a structured report containing:
 *   - Session metadata
 *   - Session themes (core)
 *   - Elemental movement (spiralogic)
 *   - Practitioner reflection (mentor)
 *   - Next session directions
 *   - Markers
 *   - Transcript quality summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { getCompletedSessionData } from '@/lib/scribe/sessionReviewMode';
import { cleanForSynthesis, buildQualityHeader } from '@/lib/scribe/transcriptCleaner';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { captureIntegrityNotice } from '@/lib/studio/captureIntegrity';
import { getCaptureIntegrityByScribeSessionId } from '@/lib/supervision/SupervisionStore';

function formatTranscriptForPrompt(segments: { speaker: string; text: string; startMs: number }[]): string {
  return segments.map(s => {
    const min = Math.floor(s.startMs / 60000);
    const sec = Math.floor((s.startMs % 60000) / 1000);
    const t = `${min}:${sec.toString().padStart(2, '0')}`;
    return `[${t}] ${s.speaker}: ${s.text}`;
  }).join('\n');
}

const REPORT_PROMPT = (
  container: string,
  date: string,
  duration: string,
  markers: string,
  qualityHeader: string,
  transcript: string,
  lens: string
) => `You are MAIA generating a structured practitioner session report.

This is an internal document — not shared with clients.

# Session
- Container: ${container}
- Date: ${date}
- Duration: ${duration}

## Markers
${markers || 'None placed.'}

${qualityHeader}

## Transcript
${transcript || 'No transcript available.'}

---

Generate a structured session report with ALL of the following sections:

## 1. SESSION THEMES
What were the 3–5 primary themes that ran through this session? Be specific and grounded in the transcript.

## 2. KEY MOMENTS
List 3–5 significant moments (with timestamps if available). Include what made each moment significant.

## 3. ELEMENTAL MAP
${lens === 'spiralogic' || lens === 'full'
  ? 'Map the elemental energy of the session: dominant element(s), suppressed element(s), and how the energy moved across the session arc.'
  : 'Briefly note the predominant energetic quality of this session (Fire/Water/Earth/Air/Aether).'}

## 4. SPIRAL PHASE ASSESSMENT
What developmental phase is this client working through? What is their current edge?

## 5. PRACTITIONER REFLECTION
${lens === 'mentor' || lens === 'full'
  ? 'What did the practitioner navigate well? What is the growing edge? Any countertransference signals? (This section is about the practitioner, not the client.)'
  : 'Brief reflection on what worked well in this session from a practice perspective.'}

## 6. NEXT SESSION DIRECTIONS
3 specific directions or intentions for the next session. Grounded in what emerged today.

## 7. TRANSCRIPT QUALITY NOTE
One sentence noting the quality of the transcript evidence available for this report.

Format each section with a clear header. Be specific, use transcript language where available, and never fabricate exchanges not visible in the transcript.`;

export async function POST(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sessionId, lens = 'full', format = 'markdown' } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    console.log(`📄 [ExportReport] Generating ${lens}/${format} report for session ${sessionId}`);
    const t0 = Date.now();

    // Load session data
    const sessionData = await getCompletedSessionData(sessionId);

    // Clean transcript for synthesis
    const { segments: cleanSegments, removedCount, qualityMetrics } = cleanForSynthesis(sessionData.transcript);
    const qualityHeader = buildQualityHeader(qualityMetrics, removedCount);

    // Format markers
    const startEpoch = sessionData.startTime.getTime();
    const markersText = sessionData.markers.map(m => {
      const offsetMs = m.tsMs != null ? m.tsMs - startEpoch : null;
      const t = offsetMs != null && offsetMs >= 0
        ? `${Math.floor(offsetMs / 60000)}:${Math.floor((offsetMs % 60000) / 1000).toString().padStart(2, '0')}`
        : '?';
      return `[${t}] ${m.markerType}${m.note ? ` — "${m.note}"` : ''}`;
    }).join('\n');

    const durationStr = sessionData.sessionClosed
      ? `${sessionData.duration} minutes`
      : `~${sessionData.duration} minutes (session not formally closed)`;

    const prompt = REPORT_PROMPT(
      sessionData.container,
      sessionData.startTime.toLocaleDateString(),
      durationStr,
      markersText,
      qualityHeader,
      formatTranscriptForPrompt(cleanSegments),
      lens
    );

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: '', // prompt is self-contained
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 4000,
      temperature: 0.5,
    });

    const reportText = llmResponse.text;
    const elapsedMs = Date.now() - t0;

    console.log(`✅ [ExportReport] Done | ${elapsedMs}ms | tokens=${llmResponse.metadata.tokenCount ?? 'n/a'}`);

    // Capture-integrity notice. Built in code and placed above the report —
    // never asked of the model. A generated warning is a warning that can be
    // omitted, and the one case where it would silently go missing is a long,
    // messy transcript: precisely the session most likely to have lost a lane.
    // null means integrity was never assessed for this session, which is not
    // the same as "no problems found", so nothing is asserted either way.
    const integrityNotice = captureIntegrityNotice(
      await getCaptureIntegrityByScribeSessionId(sessionId),
    );

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        sessionId,
        lens,
        report: reportText,
        captureIntegrity: integrityNotice,
        meta: {
          generatedAt: new Date().toISOString(),
          sessionDate: sessionData.startTime.toISOString(),
          duration: sessionData.duration,
          sessionClosed: sessionData.sessionClosed,
          container: sessionData.container,
          segmentCount: sessionData.segmentCount,
          cleanedSegmentCount: cleanSegments.length,
          markerCount: sessionData.markers.length,
          cleanliness: qualityMetrics.estimatedCleanliness,
          elapsedMs,
        },
      });
    }

    // Markdown response: return as plain text with a filename hint
    const filename = `session-report-${sessionId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.md`;
    const fullMarkdown = `# Session Report
**Generated:** ${new Date().toLocaleString()}
**Session:** ${sessionId}
**Container:** ${sessionData.container}
**Lens:** ${lens}
${integrityNotice ? `\n---\n\n${integrityNotice}\n` : ''}
---

${reportText}

---
*Internal document — not for client distribution*
*Generated by MAIA · Soullab*
`;

    return new Response(fullMarkdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('❌ [ExportReport] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
