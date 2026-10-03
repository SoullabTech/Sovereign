/**
 * STELLIUM MAIA PREPARATION API
 *
 * The ensouled intelligence prepares for sessions
 * MAIA analyzes client history, recurring themes, and generates
 * thoughtful preparation notes in the practitioner's voice
 *
 * "Not just scheduling — sacred preparation"
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext, storeMaiaPrep } from '@/lib/stellium/sessions';
import { getPersonaContext, generatePersonaPrompt } from '@/lib/stellium/personas';
import { MaiaSessionPrep } from '@/lib/stellium/types';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { resolveClientDisplayName } from '@/lib/stellium/clients';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { query } from '@/lib/db/postgres';
import { representationRefusal, type PrivacyMode } from '@/lib/governance/clientRepresentationGuards';

/**
 * POST /api/stellium/maia/prepare
 * Have MAIA prepare for an upcoming session
 *
 * Body:
 * - practitionerId: required
 * - sessionId: required
 * - prepType: 'full' | 'quick' (default 'full')
 */
export async function POST(request: NextRequest) {
  try {
    // AUTH: practitioner identity comes from the authenticated session ONLY. A
    // body-supplied practitionerId is ignored — closing the side door where any caller
    // could generate/store a client prep for arbitrary IDs.
    const practitionerId = await getMemberIdFromRequest(request);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { sessionId, prepType = 'full' } = body;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // GENERATE GATE (Client Representation Governance §2). Resolve the session's client
    // case and refuse generation if its consent posture does not permit representation
    // (private ⇒ no representation; consent_based ⇒ requires captured consent).
    const caseGov = await query<{ privacy_mode: PrivacyMode | null; consent_captured_at: Date | null }>(
      `SELECT pc.privacy_mode, pc.consent_captured_at
         FROM practitioner_sessions ps
         JOIN practitioner_cases pc ON pc.client_id = ps.client_id
        WHERE ps.id = $1 AND pc.practitioner_id = $2`,
      [sessionId, practitionerId],
    );
    for (const c of caseGov.rows) {
      const refusal = representationRefusal(c.privacy_mode ?? 'private', c.consent_captured_at ?? null);
      if (refusal) {
        return NextResponse.json({ error: refusal.message, code: refusal.code }, { status: 403 });
      }
    }

    // Get session context (includes client history, themes, previous notes)
    const sessionContext = await getSessionContext(practitionerId, sessionId);
    if (!sessionContext.session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get persona context
    const personaContext = await getPersonaContext(practitionerId);

    // Build the preparation request for Claude
    const systemPrompt = personaContext.systemPrompt || getDefaultPrepPrompt();

    const sessionInfo = sessionContext.session;
    const clientHistory = sessionContext.client_history;

    // Build context message
    let contextMessage = `
## Session Details
- Type: ${sessionInfo.session_type}
- Client: ${resolveClientDisplayName(sessionInfo.client, null)}
- Scheduled: ${sessionInfo.scheduled_at || 'Unscheduled'}
- Duration: ${sessionInfo.duration_minutes} minutes

## Client History
- Total sessions together: ${clientHistory.total_sessions}
- Recurring themes: ${clientHistory.recurring_themes.join(', ') || 'None identified yet'}
`;

    if (clientHistory.last_session_notes) {
      contextMessage += `
## Notes from Last Session
${clientHistory.last_session_notes}
`;
    }

    if (clientHistory.open_threads?.length) {
      contextMessage += `
## Open Threads to Continue
${clientHistory.open_threads.map(t => `- ${t}`).join('\n')}
`;
    }

    if (sessionInfo.prep_notes) {
      contextMessage += `
## Practitioner's Prep Notes
${sessionInfo.prep_notes}
`;
    }

    // Generate preparation based on type
    const prepRequest = prepType === 'quick'
      ? `Based on the context above, provide a brief 2-3 sentence preparation summary for this session.`
      : `Based on the context above, prepare a thoughtful session preparation that includes:
1. A brief summary of where we are in the work with this client
2. Key themes or threads to hold awareness of
3. Any questions that might be valuable to explore
4. Anything the practitioner should prepare or review

Keep the tone aligned with the practitioner's voice. Be concise but thorough.`;

    // Call Claude
    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${contextMessage}\n\n${prepRequest}`,
        },
      ],
      maxTokens: prepType === 'quick' ? 256 : 1024,
    });

    const prepContent = llmResponse.text;

    // Build the prep object
    const prep: MaiaSessionPrep = {
      summary: prepContent,
      client_history: `Total sessions: ${clientHistory.total_sessions}`,
      recent_themes: clientHistory.recurring_themes.slice(0, 5),
      relevant_context: clientHistory.last_session_notes || '',
      suggested_focus: extractQuestions(prepContent),
      open_threads: clientHistory.open_threads,
      generated_at: new Date().toISOString(),
    };

    // Store the preparation
    await storeMaiaPrep(practitionerId, sessionId, prep);

    return NextResponse.json({
      success: true,
      prep,
    });
  } catch (error) {
    console.error('[Stellium MAIA Prepare API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preparation' },
      { status: 500 }
    );
  }
}

/**
 * Default preparation prompt when no persona is configured
 */
function getDefaultPrepPrompt(): string {
  return `You are a thoughtful assistant helping a practitioner prepare for a client session.

Your role is to:
- Summarize the ongoing work with this client
- Highlight important themes and patterns
- Suggest areas that might be valuable to explore
- Support the practitioner in showing up fully present

Be warm but professional. Focus on insight, not prescription.
Never diagnose or predict. Always defer to the practitioner's expertise.`;
}

/**
 * Extract questions from the prep content
 */
function extractQuestions(content: string): string[] {
  const questions: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Look for lines that end with ? or start with common question patterns
    const trimmed = line.trim();
    if (
      trimmed.endsWith('?') ||
      trimmed.toLowerCase().startsWith('what') ||
      trimmed.toLowerCase().startsWith('how') ||
      trimmed.toLowerCase().startsWith('where') ||
      trimmed.toLowerCase().startsWith('when') ||
      trimmed.toLowerCase().startsWith('why')
    ) {
      // Clean up list markers
      const cleaned = trimmed.replace(/^[-*•\d.)\s]+/, '');
      if (cleaned.length > 10 && cleaned.length < 200) {
        questions.push(cleaned);
      }
    }
  }

  return questions.slice(0, 5); // Return top 5 questions
}
