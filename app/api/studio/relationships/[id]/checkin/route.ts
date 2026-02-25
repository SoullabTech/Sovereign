export const dynamic = 'force-dynamic';

/**
 * RELATIONSHIP CHECK-IN + MAIA PARENT RESPONSE
 *
 * POST — Submit a check-in and get MAIA's grounded response.
 * This is the core endpoint of Parent Flow MVP.
 *
 * The parent says what happened, selects the child's state and their need,
 * and MAIA returns: framing, script, action, threshold.
 * Response must be fast (<3 seconds) — uses Haiku for speed.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';
import {
  CHILD_STATE_LABELS,
  PARENT_NEED_LABELS,
  type ChildState,
  type ParentNeed,
} from '@/lib/studio/relationships/types';
import {
  selectKnowledgePacks,
  formatPacksForPrompt,
} from '@/lib/studio/relationships/knowledgePacks';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  timeout: 15000,
});

const VALID_CHILD_STATES = ['calm', 'sensitive', 'anxious', 'angry', 'withdrawn', 'big_questions', 'social_pain'] as const;
const VALID_PARENT_NEEDS = ['what_to_say', 'how_serious', 'regulate', 'is_normal', 'pattern'] as const;

const MAIA_PARENT_SYSTEM_PROMPT = `You are MAIA — a sovereign companion supporting a parent in the moment.

Your role:
- Ground the parent in what is happening
- Normalize developmental/emotional experience where appropriate
- Offer language they can actually use with their child
- Be direct about thresholds (when to seek outside help)
- Never diagnose, label, or pathologize the child
- Never create dependence — increase the parent's capacity
- Never use clinical language (no "attachment styles", "dysregulation", "triggers")
- Speak as a wise, calm friend who has seen many children grow

You speak with calm clarity. Short sentences. No hedging. No flattery.

Respond in JSON format ONLY:
{
  "framing": "One sentence: what this likely is (developmental, emotional, situational). Be specific to their child's age and situation.",
  "script": "Exact words the parent can say to their child right now. 1-3 sentences, simple and warm.",
  "action": "1-2 concrete things to do in the next 30 minutes. Specific and doable.",
  "threshold": "When this would warrant outside support (therapist, pediatrician, school counselor). Be honest and clear. If it's not concerning, say so directly."
}`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: relationshipId } = await params;
    const body = await request.json();

    const { whatHappened, childState, parentNeed, contextTag } = body;

    if (!whatHappened?.trim()) {
      return NextResponse.json({ error: 'What happened is required' }, { status: 400 });
    }

    // Validate optional fields
    if (childState && !(VALID_CHILD_STATES as readonly string[]).includes(childState)) {
      return NextResponse.json({ error: 'Invalid child state' }, { status: 400 });
    }
    if (parentNeed && !(VALID_PARENT_NEEDS as readonly string[]).includes(parentNeed)) {
      return NextResponse.json({ error: 'Invalid parent need' }, { status: 400 });
    }

    // Fetch relationship + verify ownership
    const relResult = await db.query(
      'SELECT * FROM studio_relationships WHERE id = $1 AND practitioner_id = $2',
      [relationshipId, practitionerId]
    );
    if (relResult.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    const relationship = relResult.rows[0];

    // Fetch recent checkins for context (last 3)
    const recentResult = await db.query(
      `SELECT what_happened, child_state, parent_need, maia_response, created_at
       FROM relationship_checkins
       WHERE relationship_id = $1
       ORDER BY created_at DESC
       LIMIT 3`,
      [relationshipId]
    );

    // Build context for MAIA
    const contextParts: string[] = [
      `RELATIONSHIP: ${relationship.person_name} (${relationship.role})`,
    ];
    if (relationship.age_years) {
      contextParts.push(`AGE: ${relationship.age_years} years old`);
    }
    contextParts.push('');
    contextParts.push(`WHAT HAPPENED: ${whatHappened.trim()}`);

    if (childState) {
      contextParts.push(`CHILD'S STATE: ${CHILD_STATE_LABELS[childState as ChildState]}`);
    }
    if (parentNeed) {
      contextParts.push(`PARENT'S NEED: ${PARENT_NEED_LABELS[parentNeed as ParentNeed]}`);
    }

    // Add recent history for pattern context
    if (recentResult.rows.length > 0) {
      contextParts.push('');
      contextParts.push('RECENT HISTORY (last 3 check-ins):');
      for (const prev of recentResult.rows) {
        const date = new Date(prev.created_at).toLocaleDateString();
        const state = prev.child_state ? ` [${CHILD_STATE_LABELS[prev.child_state as ChildState] || prev.child_state}]` : '';
        contextParts.push(`- ${date}${state}: ${prev.what_happened.slice(0, 120)}`);
      }
    }

    // Select and inject knowledge packs based on child age + state + need
    const knowledgeSnippets = selectKnowledgePacks(
      relationship.age_years,
      childState as ChildState | null,
      parentNeed as ParentNeed | null,
    );
    const knowledgeContext = formatPacksForPrompt(knowledgeSnippets);
    if (knowledgeContext) {
      contextParts.push(knowledgeContext);
    }
    const packIdsUsed = knowledgeSnippets.map(s => s.packId);

    // Inject cached astrology context (non-blocking — never delays check-in if absent)
    try {
      const astroResult = await db.query(
        `SELECT natal_summary_json, active_transits_json, synastry_narrative
         FROM relationship_astrology_snapshots
         WHERE relationship_id = $1 AND expires_at > NOW()
         ORDER BY computed_at DESC LIMIT 1`,
        [relationshipId]
      );
      if (astroResult.rows.length > 0) {
        const astro = astroResult.rows[0];
        const natal = astro.natal_summary_json;
        const transits = (astro.active_transits_json || []) as {
          planet: string; aspect: string; natalPoint: string; theme: string;
        }[];
        const astroParts: string[] = [];
        if (natal) {
          astroParts.push(`Sun ${natal.sun?.sign} h${natal.sun?.house}, Moon ${natal.moon?.sign} h${natal.moon?.house}, Rising ${natal.rising}.`);
          if (natal.attachmentSignature) astroParts.push(natal.attachmentSignature);
        }
        if (transits.length > 0) {
          astroParts.push(`Active: ${transits.slice(0, 2).map((t) => `${t.planet} ${t.aspect} ${t.natalPoint} — ${t.theme}`).join('; ')}.`);
        }
        if (astro.synastry_narrative) astroParts.push(astro.synastry_narrative);
        if (astroParts.length > 0) {
          contextParts.push('');
          contextParts.push(`ASTRO_CONTEXT: ${astroParts.join(' ')}`);
        }
      }
    } catch {
      // Astrology context is optional — never block the check-in
    }

    // Call MAIA (Haiku for speed)
    const PARENT_MODEL = 'claude-haiku-4-5-20251001';
    const message = await anthropic.messages.create({
      model: PARENT_MODEL,
      max_tokens: 600,
      system: MAIA_PARENT_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: contextParts.join('\n') },
      ],
    });

    // Parse response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    let maiaResponse;
    try {
      maiaResponse = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        maiaResponse = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: 'Failed to parse MAIA response' },
          { status: 500 }
        );
      }
    }

    // Validate shape
    if (!maiaResponse.framing || !maiaResponse.script || !maiaResponse.action || !maiaResponse.threshold) {
      return NextResponse.json(
        { error: 'Incomplete MAIA response' },
        { status: 500 }
      );
    }

    const fullResponse = {
      framing: maiaResponse.framing,
      script: maiaResponse.script,
      action: maiaResponse.action,
      threshold: maiaResponse.threshold,
      model: PARENT_MODEL,
      generatedAt: new Date().toISOString(),
      packIdsUsed,
    };

    // Save check-in + response
    const checkinId = randomUUID();
    const checkinResult = await db.query(
      `INSERT INTO relationship_checkins
        (id, relationship_id, practitioner_id, what_happened, child_state, parent_need, maia_response, context_tag)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        checkinId,
        relationshipId,
        practitionerId,
        whatHappened.trim(),
        childState || null,
        parentNeed || null,
        JSON.stringify(fullResponse),
        contextTag || null,
      ]
    );

    const row = checkinResult.rows[0];
    return NextResponse.json({
      checkin: {
        id: row.id,
        relationshipId: row.relationship_id,
        practitionerId: row.practitioner_id,
        whatHappened: row.what_happened,
        childState: row.child_state,
        parentNeed: row.parent_need,
        maiaResponse: row.maia_response,
        mentorReflection: row.mentor_reflection,
        contextTag: row.context_tag,
        elementState: row.element_state,
        outcome: row.outcome,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Relationship Checkin] POST error:', error);
    return NextResponse.json(
      { error: 'Check-in failed' },
      { status: 500 }
    );
  }
}
