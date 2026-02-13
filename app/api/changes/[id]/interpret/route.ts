export const dynamic = 'force-dynamic';

/**
 * MEMBER I CHING INTERPRETATION API
 *
 * POST - Generate MAIA's I Ching interpretation for a member's change.
 * Calls Claude Haiku with change context + hexagram data.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getHexagram } from '@/lib/iching/lookup';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  timeout: 30000,
});

const INTERPRETATION_SYSTEM_PROMPT = `You are MAIA interpreting the I Ching for someone navigating change.

You read the hexagram in the context of their specific situation. Be direct, warm, and honest.

Do not explain the I Ching tradition — speak from within it. The hexagram is alive, present, relevant.

Respond in JSON format ONLY:
{
  "reading": "string",
  "guidance": "string",
  "warnings": ["string", "string"],
  "timing": "string",
  "changingLinesReading": "string | null",
  "relatingReading": "string | null"
}

- reading: Your interpretation of the primary hexagram in the context of their change (2-3 sentences)
- guidance: What the hexagram suggests they do or pay attention to (2-3 sentences)
- warnings: Specific things to watch for or avoid (1-3 items, each 1 sentence)
- timing: What the hexagram says about timing and readiness (1-2 sentences)
- changingLinesReading: If there are changing lines, what they reveal about this moment (1-2 sentences, or null)
- relatingReading: If there is a relating hexagram, what it shows about where this is heading (1-2 sentences, or null)

Speak as if the hexagram itself is addressing the person. No fluff, no mystical posturing — just clear, embodied guidance.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: changeId } = await params;

    const changeResult = await db.query(
      `SELECT * FROM studio_changes WHERE id = $1 AND member_id = $2`,
      [changeId, memberId]
    );

    if (changeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    const row = changeResult.rows[0];

    if (!row.hexagram_number) {
      return NextResponse.json(
        { error: 'No hexagram cast yet — cast the I Ching first' },
        { status: 400 }
      );
    }

    const hexagram = getHexagram(row.hexagram_number);
    if (!hexagram) {
      return NextResponse.json({ error: 'Hexagram not found' }, { status: 500 });
    }

    let relatingHexagram = null;
    if (row.relating_hexagram_number) {
      relatingHexagram = getHexagram(row.relating_hexagram_number);
    }

    const contextParts: string[] = [
      `CHANGE: ${row.title}`,
      `DESCRIPTION: ${row.description}`,
      `CHANGE TYPE: ${row.change_type}`,
    ];

    if (row.emotional_state) {
      contextParts.push(`EMOTIONAL STATE: ${row.emotional_state}`);
    }
    if (row.urgency && row.urgency !== 'none') {
      contextParts.push(`URGENCY: ${row.urgency}`);
    }

    contextParts.push('', 'PRIMARY HEXAGRAM:');
    contextParts.push(`${hexagram.number}. ${hexagram.english} (${hexagram.name})`);
    contextParts.push(`Judgment: ${hexagram.judgment}`);
    contextParts.push(`Image: ${hexagram.image}`);
    contextParts.push(`Keywords: ${hexagram.keywords.join(', ')}`);

    if (row.changing_lines && row.changing_lines.length > 0) {
      contextParts.push('', `CHANGING LINES: ${row.changing_lines.join(', ')}`);
    }

    if (relatingHexagram) {
      contextParts.push('', 'RELATING HEXAGRAM:');
      contextParts.push(`${relatingHexagram.number}. ${relatingHexagram.english} (${relatingHexagram.name})`);
      contextParts.push(`Judgment: ${relatingHexagram.judgment}`);
    }

    const INTERPRETATION_MODEL = 'claude-haiku-4-5-20251001';
    const message = await anthropic.messages.create({
      model: INTERPRETATION_MODEL,
      max_tokens: 1000,
      system: INTERPRETATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: contextParts.join('\n'),
        },
      ],
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    let interpretation;
    try {
      interpretation = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        interpretation = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: 'Failed to parse interpretation' },
          { status: 500 }
        );
      }
    }

    if (!interpretation.reading || !interpretation.guidance || !interpretation.warnings || !interpretation.timing) {
      return NextResponse.json(
        { error: 'Incomplete interpretation' },
        { status: 500 }
      );
    }

    const hexagramInterpretation = {
      reading: interpretation.reading,
      guidance: interpretation.guidance,
      warnings: interpretation.warnings,
      timing: interpretation.timing,
      changingLinesReading: interpretation.changingLinesReading || null,
      relatingReading: interpretation.relatingReading || null,
      generatedAt: new Date().toISOString(),
      model: INTERPRETATION_MODEL,
    };

    await db.query(
      `UPDATE studio_changes
       SET hexagram_interpretation = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(hexagramInterpretation), changeId]
    );

    return NextResponse.json({ hexagramInterpretation });
  } catch (error) {
    console.error('[Member Change Interpretation] Error:', error);
    return NextResponse.json(
      { error: 'Interpretation failed' },
      { status: 500 }
    );
  }
}
