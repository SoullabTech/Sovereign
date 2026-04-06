export const dynamic = 'force-dynamic';

/**
 * CHANGE MENTOR CHAT — Streaming Conversation Endpoint
 *
 * POST - Multi-turn streaming dialogue with MAIA Mentor about a change.
 *
 * Accepts the full message thread and streams a mentor response via SSE.
 * Uses the same change context as the one-shot mentor reflection,
 * but speaks conversationally rather than returning structured JSON.
 *
 * Scoped to the change — no global MAIA memory, no full orchestration.
 */

import { NextRequest } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getHexagram } from '@/lib/iching/lookup';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';

const MENTOR_CHAT_SYSTEM = `You are MAIA Mentor — a sovereignty-oriented companion for navigating change.

You are in a live conversation with a practitioner about a specific change they are navigating. This is dialogue, not a report.

Your role:
- Surface what the person may not be seeing
- Check where agency might be leaking (spiritual bypassing, grasping for control, avoiding discomfort)
- Offer questions more than answers
- Speak with warmth but without flattery
- Be direct but not commanding
- Never diagnose, prescribe, or claim authority over the person's process

Style:
- Keep responses concise (2-4 sentences typically, unless they ask for more)
- You may ask a question back — this is conversation
- Reference their specific change, hexagram, and council insights naturally
- If you sense urgency driving instead of clarity, name it gently

The person's sovereignty always comes first. Your reflections should strengthen their agency, not create dependence on your guidance.`;

// Model tier: 'fast' maps to haiku (or local equivalent when LOCAL_TIER_ENABLED)

function buildChangeContext(row: any, hexagram: any, relatingHexagram: any, experiences: any[]): string {
  const parts: string[] = [
    `CHANGE: ${row.title}`,
    `DESCRIPTION: ${row.description}`,
    `CHANGE TYPE: ${row.change_type}`,
  ];

  if (row.emotional_state) {
    parts.push(`EMOTIONAL STATE: ${row.emotional_state}`);
  }
  if (row.urgency && row.urgency !== 'none') {
    parts.push(`URGENCY: ${row.urgency}`);
  }

  if (hexagram) {
    parts.push('', 'I CHING HEXAGRAM:');
    parts.push(`${hexagram.number}. ${hexagram.english} (${hexagram.name})`);
    parts.push(`Judgment: ${hexagram.judgment}`);
    parts.push(`Image: ${hexagram.image}`);
    if (row.changing_lines?.length > 0) {
      parts.push(`Changing lines: ${row.changing_lines.join(', ')}`);
    }
    if (relatingHexagram) {
      parts.push(`Relating to: ${relatingHexagram.number}. ${relatingHexagram.english}`);
    }
  }

  const council = row.council_result;
  if (council) {
    parts.push('', 'COUNCIL RESULT:');
    if (council.recommendation) parts.push(`Recommendation: ${council.recommendation}`);
    if (council.tensions?.length > 0) {
      parts.push(`Tensions: ${council.tensions.join('; ')}`);
    }
    if (council.insights?.length > 0) {
      parts.push(`Insights: ${council.insights.join('; ')}`);
    }
  }

  if (experiences.length > 0) {
    parts.push('', 'RECENT FIELD EXPERIENCES:');
    for (const exp of experiences) {
      parts.push(`- [${exp.experience_type}] ${exp.content}`);
    }
  }

  if (row.iteration_count > 1) {
    parts.push('', `This change is on iteration ${row.iteration_count}. The person keeps returning to it.`);
  }

  if (row.follow_up_intention) {
    parts.push('', `FOLLOW-UP INTENTION: ${row.follow_up_intention}`);
  }

  return parts.join('\n');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { practitionerId } = identity;
    const { id: changeId } = await params;

    const body = await request.json();
    const messages: { role: string; content: string }[] = body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cap thread length to prevent token overflow
    const trimmedMessages = messages.slice(-20);

    // Fetch change record
    const changeResult = await db.query(
      `SELECT c.* FROM studio_changes c WHERE c.id = $1 AND c.practitioner_id = $2`,
      [changeId, practitionerId]
    );

    if (changeResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Change not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const row = changeResult.rows[0];

    if (!row.council_result) {
      return new Response(
        JSON.stringify({ error: 'No council result yet — consult the council first' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch recent experiences
    const experiencesResult = await db.query(
      `SELECT experience_type, content, occurred_at
       FROM change_experiences
       WHERE change_id = $1
       ORDER BY occurred_at DESC
       LIMIT 5`,
      [changeId]
    );

    // Fetch hexagram details
    let hexagram = null;
    let relatingHexagram = null;
    if (row.hexagram_number) {
      hexagram = getHexagram(row.hexagram_number);
      if (row.relating_hexagram_number) {
        relatingHexagram = getHexagram(row.relating_hexagram_number);
      }
    }

    const changeContext = buildChangeContext(row, hexagram, relatingHexagram, experiencesResult.rows);
    const systemPrompt = `${MENTOR_CHAT_SYSTEM}\n\n---\n\nCHANGE CONTEXT:\n${changeContext}`;

    // Stream response via LLM provider
    const llmStream = getLLMProvider().generateStream({
      tier: 'fast',
      systemPrompt,
      messages: trimmedMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      maxTokens: 800,
    });

    // Convert to SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of llmStream) {
            if (event.type === 'text_delta') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('[Mentor Chat] Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Mentor Chat] Error:', error);
    return new Response(JSON.stringify({ error: 'Mentor chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
