// POST /api/practitioner/practice-field/draft
//
// MAIA drafts a candidate expression for one Practice Field dimension from what the
// practitioner JUST shared (conversation-as-source, since at setup there is no corpus).
// Mirror, not portrait: draft-from-material, never a synthesis of who the practitioner is.
//
// Follows the mirror invariant (project_living_field_mirror_invariant) — the same rules
// as /api/maia/living-field/[fieldKey]/refine, adapted for practice-field setup:
//   - candidate draft only, never auto-saved (the editor writes it to the field on accept)
//   - drafts ONLY from what the practitioner shared; never concludes; never assigns confidence
//   - the practitioner authors the final value

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const HAIKU_MODEL = 'claude-haiku-4-5';

// What each Practice Field dimension is FOR — so a candidate draft is appropriately
// framed. This shapes a draft; it never becomes an account of who the practitioner is.
const FIELD_INTENTS: Record<string, string> = {
  welcome_message:
    'a short, warm welcome spoken directly to clients arriving in the shared space (to the client — not to MAIA, not to the platform)',
  about_practice:
    "a brief description of the practitioner's practice in their own words — their modality, philosophy, or how they think about the work",
  how_we_work_together:
    'the relational operating agreement between practitioner and client between sessions — how reflections and messages are used, what to bring here vs. save for session, response rhythm, and that what the client brings is theirs',
  how_maia_supports:
    'how MAIA supports the work between practitioner and client — what it is for, what it remembers (with consent), and when a client should contact the practitioner directly instead',
  professional_practice:
    'the professional context clients should understand — the practitioner’s role, any record-retention or reporting obligations, and practice policies (the platform records what is declared; it does not verify credentials)',
};

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export async function POST(request: NextRequest) {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const fieldKey = typeof body?.fieldKey === 'string' ? body.fieldKey : '';
  const conversation = typeof body?.conversation === 'string' ? body.conversation.slice(0, 6000).trim() : '';
  const currentValue = typeof body?.currentValue === 'string' ? body.currentValue.slice(0, 4000).trim() : '';

  const intent = FIELD_INTENTS[fieldKey];
  if (!intent) {
    return NextResponse.json({ error: 'Unknown field.' }, { status: 400 });
  }
  if (!conversation && !currentValue) {
    return NextResponse.json({
      candidate_expression: null,
      sources_used: [],
      rationale: 'Share a little about this first — by talking it out — and MAIA can offer a possible draft you can edit.',
    });
  }

  // Mirror invariant: draft ONLY from what the practitioner brought; never synthesize
  // who they are; never conclude; never assign confidence. The practitioner authors the
  // final value. (Same constitutional rules as the living-field refine endpoint.)
  const systemPrompt = `You are helping a practitioner put one part of their Practice Field into words — text their own clients will read. You draft ONLY from what the practitioner has just shared. You do not synthesize who they are, you do not describe their identity, you do not conclude, and you never assign confidence.

Rules:
- Never write "MAIA understands you as...", "Your identity is...", or anything that describes who the practitioner IS. You are drafting THEIR words for THEIR field — not an account of them.
- Draft in the first person, in the practitioner's voice, speaking to their clients (or declaring their practice).
- Just write the draft itself — do not preface it with "Based on what you shared".
- Keep it plain and only as long as the field needs.
- This is a candidate the practitioner will edit or reject — not a finished value, not a conclusion about them.`;

  const userMessage = `Practice Field dimension: ${fieldKey}
What this field is for: ${intent}

${currentValue ? `The practitioner's current draft of this field:\n"${currentValue}"\n\n` : ''}What the practitioner shared when talking this out:
"${conversation || currentValue}"

Draft a possible first-person expression for this field, in their voice, from only what they shared.`;

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({
      candidate_expression: currentValue || null,
      sources_used: conversation ? ['this conversation'] : [],
      rationale: 'Drafting is unavailable right now — you can write directly.',
    });
  }

  try {
    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    const candidate = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim();
    return NextResponse.json({
      candidate_expression: candidate || null,
      sources_used: conversation ? ['this conversation'] : ['your current draft'],
      rationale: 'Drafted only from what you shared. Edit it freely — it becomes yours when you save it.',
    });
  } catch (err) {
    console.error('[practice-field/draft] error', err);
    return NextResponse.json(
      { error: 'Could not draft right now. Your writing is unaffected; try again in a moment.' },
      { status: 500 },
    );
  }
}
