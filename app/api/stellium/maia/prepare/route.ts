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
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

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
    const body = await request.json();
    const { practitionerId, sessionId, prepType = 'full' } = body;

    if (!practitionerId || !sessionId) {
      return NextResponse.json(
        { error: 'Practitioner ID and Session ID required' },
        { status: 400 }
      );
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
- Client: ${sessionInfo.client?.preferred_name || sessionInfo.client?.name || 'Unknown'}
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
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: prepType === 'quick' ? 256 : 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${contextMessage}\n\n${prepRequest}`,
        },
      ],
    });

    // Extract the text content
    const prepContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n\n');

    // Build the prep object
    const prep: MaiaSessionPrep = {
      summary: prepContent,
      themes_to_watch: clientHistory.recurring_themes.slice(0, 5),
      suggested_questions: extractQuestions(prepContent),
      client_context: {
        total_sessions: clientHistory.total_sessions,
        recent_themes: clientHistory.recurring_themes.slice(0, 3),
        last_session_date: clientHistory.recent_sessions[0]?.scheduled_at,
      },
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
