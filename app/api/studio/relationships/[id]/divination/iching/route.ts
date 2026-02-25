export const dynamic = 'force-dynamic';

/**
 * POST /api/studio/relationships/[id]/divination/iching
 *
 * Cast an I Ching reading for this relationship.
 * Casts using yarrow or coin method, looks up hexagram data,
 * generates a MAIA interpretation scoped to the specific relationship,
 * and stores the divination record.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';
import { cast } from '@/lib/iching/casting';
import { getHexagram } from '@/lib/iching/lookup';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const practitioner = await getCurrentPractitioner(request);
    if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { practitionerId } = practitioner;

    // Verify ownership + get relationship context
    const relRes = await db.query(
      `SELECT id, person_name, role, age_years FROM studio_relationships
       WHERE id = $1 AND practitioner_id = $2`,
      [id, practitionerId]
    );
    if (relRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const rel = relRes.rows[0];

    // Get question from body (optional)
    const body = await request.json().catch(() => ({})) as {
      question?: string;
      method?: 'yarrow' | 'coin';
    };
    const question: string = body.question || `What is most needed in my relationship with ${rel.person_name}?`;
    const method: 'yarrow' | 'coin' = body.method || 'yarrow';

    // Get recent check-ins for context
    const checkinsRes = await db.query(
      `SELECT what_happened, child_state, maia_response FROM relationship_checkins
       WHERE relationship_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [id]
    );

    // Cast
    const castResult = cast(method);
    const hexagram = getHexagram(castResult.hexagramNumber);
    if (!hexagram) {
      return NextResponse.json({ error: 'Invalid hexagram' }, { status: 500 });
    }

    const relatingHexagram = castResult.relatingHexagramNumber
      ? getHexagram(castResult.relatingHexagramNumber)
      : null;

    // Build context for MAIA interpretation
    const recentContext = checkinsRes.rows.length > 0
      ? `Recent check-ins:\n${checkinsRes.rows.map((c: {
          what_happened: string;
          child_state?: string;
          maia_response?: { framing?: string };
        }) =>
          `- ${c.what_happened}${c.child_state ? ` (${c.child_state})` : ''}`
        ).join('\n')}`
      : 'No recent check-ins.';

    // Generate MAIA interpretation scoped to this relationship
    let maiaInterpretation = '';
    try {
      const maiaRes = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `You are MAIA — a sovereign companion offering I Ching guidance.
Interpret the hexagram in the context of a specific relationship, not abstractly.
Be concrete, grounded, and supportive. 3-4 sentences max.
Do not explain the I Ching system. Speak directly about the relational moment.
Never diagnose, label, or predict. Speak to what is available now.`,
        messages: [{
          role: 'user',
          content: `Relationship: ${rel.person_name} (${rel.role}${rel.age_years ? `, ${rel.age_years} years old` : ''})
Question: ${question}

${recentContext}

Hexagram received: ${hexagram.number} — ${hexagram.name} (${hexagram.english})
Judgment: ${hexagram.judgment}
Image: ${hexagram.image}
${relatingHexagram ? `Relating hexagram: ${relatingHexagram.number} — ${relatingHexagram.name} (${relatingHexagram.english})` : ''}
Changing lines: ${castResult.changingLines.length > 0 ? castResult.changingLines.join(', ') : 'none'}

Write a 3-4 sentence interpretation grounded in this specific relationship and question.`,
        }],
      });
      maiaInterpretation = maiaRes.content[0].type === 'text' ? maiaRes.content[0].text : '';
    } catch (err) {
      console.error('[iching] MAIA interpretation failed:', err);
      maiaInterpretation = `${hexagram.name}: ${hexagram.judgment}`;
    }

    // Build result object
    const ichingResult = {
      hexagramNumber: castResult.hexagramNumber,
      hexagramName: hexagram.name,
      hexagramEnglish: hexagram.english,
      hexagramCharacter: hexagram.character,
      changingLines: castResult.changingLines,
      relatingHexagramNumber: castResult.relatingHexagramNumber,
      relatingHexagramName: relatingHexagram?.name || null,
      castingMethod: method,
      judgment: hexagram.judgment,
      image: hexagram.image,
      element: hexagram.element,
      changeType: hexagram.changeType,
      maiaInterpretation,
    };

    // Store divination
    const insertRes = await db.query(
      `INSERT INTO relationship_divinations
         (relationship_id, practitioner_id, divination_type, question, context_json,
          hexagram_number, hexagram_name, relating_hexagram_number, changing_lines,
          casting_method, interpretation_json)
       VALUES ($1, $2, 'iching', $3, $4::jsonb, $5, $6, $7, $8, $9, $10::jsonb)
       RETURNING id, created_at`,
      [
        id,
        practitionerId,
        question,
        JSON.stringify({ recentCheckins: checkinsRes.rows.length }),
        castResult.hexagramNumber,
        hexagram.name,
        castResult.relatingHexagramNumber,
        castResult.changingLines,
        method,
        JSON.stringify(ichingResult),
      ]
    );

    const row = insertRes.rows[0];

    return NextResponse.json({
      divination: {
        id: row.id,
        relationshipId: id,
        divinationType: 'iching',
        question,
        ichingResult,
        councilResult: null,
        createdAt: row.created_at,
      }
    });
  } catch (error) {
    console.error('[iching] POST error:', error);
    return NextResponse.json({ error: 'Failed to cast I Ching' }, { status: 500 });
  }
}
