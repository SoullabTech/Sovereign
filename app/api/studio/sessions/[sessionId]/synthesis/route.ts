export const dynamic = 'force-dynamic';

/**
 * Session Council Synthesis
 *
 * POST /api/studio/sessions/[sessionId]/synthesis
 *   Generate three-lens AI analysis of session notes.
 *   Manual trigger only — the practitioner requests this, it is never automatic.
 *   Returns three draft passes; practitioner edits before saving.
 *
 * PUT /api/studio/sessions/[sessionId]/synthesis
 *   Save the practitioner's final synthesis (after editing).
 *
 * GET /api/studio/sessions/[sessionId]/synthesis
 *   Retrieve current synthesis state (drafts + final if saved).
 *
 * The three lenses:
 *   psychological — defenses, affect, relational dynamics, what was said and what wasn't
 *   spiralogic    — element movement, phase indicators, relational maturation signals
 *   symbolic      — archetypal themes, recurring images, mythic resonance
 *
 * Design principle: AI generates starting material. Practitioner judgment governs what gets saved.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

type Params = { params: Promise<{ sessionId: string }> };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── GET: retrieve current synthesis ───────────────────────────────────

export async function GET(request: NextRequest, { params }: Params) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  const result = await db.query(
    `SELECT
      council_synthesis_psychological,
      council_synthesis_spiralogic,
      council_synthesis_symbolic,
      council_synthesis_final,
      council_synthesis_generated_at,
      council_synthesis_saved_at
    FROM sessions
    WHERE id = $1 AND practitioner_id = $2`,
    [sessionId, identity.practitionerId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const row = result.rows[0];
  return NextResponse.json({
    drafts: {
      psychological: row.council_synthesis_psychological ?? null,
      spiralogic: row.council_synthesis_spiralogic ?? null,
      symbolic: row.council_synthesis_symbolic ?? null,
    },
    final: row.council_synthesis_final ?? null,
    generatedAt: row.council_synthesis_generated_at ?? null,
    savedAt: row.council_synthesis_saved_at ?? null,
  });
}

// ── POST: generate three-lens AI drafts ───────────────────────────────

export async function POST(request: NextRequest, { params }: Params) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  // Load session + session notes
  const sessionResult = await db.query(
    `SELECT
      s.id,
      s.practitioner_id,
      s.client_id,
      s.session_notes,
      s.session_summary,
      s.session_focus,
      s.themes,
      s.scheduled_start,
      c.name as client_name
    FROM sessions s
    LEFT JOIN practitioner_clients c ON c.id = s.client_id
    WHERE s.id = $1 AND s.practitioner_id = $2`,
    [sessionId, identity.practitionerId]
  );

  if (sessionResult.rows.length === 0) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const session = sessionResult.rows[0];

  const notesContent = [
    session.session_notes,
    session.session_summary,
    session.session_focus,
  ].filter(Boolean).join('\n\n').trim();

  if (!notesContent) {
    return NextResponse.json(
      { error: 'No session notes to synthesize. Add notes before generating synthesis.' },
      { status: 422 }
    );
  }

  const clientName = session.client_name ?? 'the client';

  // Generate three passes in parallel
  const [psychological, spiralogic, symbolic] = await Promise.all([
    generateLensPass(notesContent, clientName, 'psychological'),
    generateLensPass(notesContent, clientName, 'spiralogic'),
    generateLensPass(notesContent, clientName, 'symbolic'),
  ]);

  // Save drafts (not final — practitioner must edit and explicitly save)
  await db.query(
    `UPDATE sessions SET
      council_synthesis_psychological = $1,
      council_synthesis_spiralogic    = $2,
      council_synthesis_symbolic      = $3,
      council_synthesis_generated_at  = NOW()
    WHERE id = $4`,
    [psychological, spiralogic, symbolic, sessionId]
  );

  return NextResponse.json({
    drafts: { psychological, spiralogic, symbolic },
    generatedAt: new Date().toISOString(),
    note: 'These are AI-generated drafts. Edit and save your final synthesis when ready.',
  });
}

// ── PUT: save practitioner's final synthesis ───────────────────────────

export async function PUT(request: NextRequest, { params }: Params) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  let body: {
    final?: string;
    psychological?: string;
    spiralogic?: string;
    symbolic?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.final || typeof body.final !== 'string' || body.final.trim().length === 0) {
    return NextResponse.json({ error: 'final synthesis text is required' }, { status: 400 });
  }

  const result = await db.query(
    `UPDATE sessions SET
      council_synthesis_psychological = COALESCE($1, council_synthesis_psychological),
      council_synthesis_spiralogic    = COALESCE($2, council_synthesis_spiralogic),
      council_synthesis_symbolic      = COALESCE($3, council_synthesis_symbolic),
      council_synthesis_final         = $4,
      council_synthesis_saved_at      = NOW()
    WHERE id = $5 AND practitioner_id = $6
    RETURNING council_synthesis_saved_at`,
    [
      body.psychological ?? null,
      body.spiralogic ?? null,
      body.symbolic ?? null,
      body.final.trim(),
      sessionId,
      identity.practitionerId,
    ]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    saved: true,
    savedAt: result.rows[0].council_synthesis_saved_at,
  });
}

// ── Lens generation ───────────────────────────────────────────────────

const LENS_PROMPTS: Record<string, string> = {
  psychological: `You are a psychologically sophisticated clinical consultant reviewing a practitioner's session notes.

Generate a concise (150–250 words) psychological analysis of this session. Focus on:
- Apparent defense mechanisms or patterns you notice
- Affect regulation moments (where emotion was held, avoided, or surfaced)
- What was said and what may have been left unsaid
- Key relational dynamics between client and practitioner
- Where the practitioner's attention seems most drawn

Write in plain, honest clinical language. No jargon. No diagnoses. Frame as observation, not conclusion.
Begin with "Psychologically, " and write in third person.`,

  spiralogic: `You are a practitioner trained in Spiralogic — a developmental framework using five elements (fire, water, earth, air, aether) and a 12-phase spiral of human development.

Generate a concise (150–250 words) Spiralogic reading of this session. Focus on:
- Which elemental quality seems most present (fire: will/transformation, water: depth/reception, earth: ground/embodiment, air: clarity/perspective, aether: integration/threshold)
- What phase of the 12-phase spiral this content suggests (seed/root/emergence/growth/flowering/fruition/harvest/release/descent/rest/gestation/return)
- Whether the person seems to be ascending, in tension, or approaching breakthrough
- What the elemental movement suggests about where they are in their wider developmental arc

Write as practical field notes. No mystical language. Frame as observation, not prescription.
Begin with "Spirally, " and write in third person.`,

  symbolic: `You are a depth-psychologically trained practitioner with a feel for symbolic and mythic language.

Generate a concise (150–250 words) symbolic reading of this session. Focus on:
- Any archetypal figures, dynamics, or patterns that seem present
- Images, metaphors, or language the client reached for (even incidentally)
- What mythic or symbolic layer may be alive beneath the surface material
- Any threshold, liminal, or initiatory qualities in the content

Write poetically but without being vague. Concrete symbolic observation, not generalities.
Frame as "what the symbolic layer suggests," not what it means.
Begin with "Symbolically, " and write in third person.`,
};

async function generateLensPass(
  notes: string,
  clientName: string,
  lens: 'psychological' | 'spiralogic' | 'symbolic'
): Promise<string> {
  const systemPrompt = LENS_PROMPTS[lens];

  const userPrompt = `Here are the session notes for a session with ${clientName}:

---
${notes}
---

Generate your ${lens} analysis. Be honest, specific, and brief.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return '';
    return content.text.trim();
  } catch (error) {
    console.error(`[council-synthesis] ${lens} pass failed:`, error);
    return `[${lens} analysis unavailable — generation failed]`;
  }
}
