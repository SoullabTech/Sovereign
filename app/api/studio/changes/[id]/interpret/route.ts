export const dynamic = 'force-dynamic';

/**
 * I CHING INTERPRETATION API
 *
 * POST - Generate MAIA's I Ching interpretation for a change.
 *
 * Calls Claude Haiku with change context + hexagram data to produce
 * a contextualized reading that speaks directly to the person's situation.
 *
 * The result is cached in studio_changes.hexagram_interpretation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getHexagram } from '@/lib/iching/lookup';


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
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: changeId } = await params;

    // Fetch the change
    const changeResult = await db.query(
      `SELECT * FROM studio_changes
       WHERE id = $1 AND practitioner_id = $2`,
      [changeId, practitionerId]
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

    // Fetch hexagram details
    const hexagram = getHexagram(row.hexagram_number);
    if (!hexagram) {
      return NextResponse.json({ error: 'Hexagram not found' }, { status: 500 });
    }

    let relatingHexagram = null;
    if (row.relating_hexagram_number) {
      relatingHexagram = getHexagram(row.relating_hexagram_number);
    }

    // Build the context for MAIA
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

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'fast',
      systemPrompt: INTERPRETATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: contextParts.join('\n'),
        },
      ],
      maxTokens: 1000,
    });

    // Parse response
    const responseText = llmResponse.text;

    let interpretation;
    try {
      interpretation = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from a markdown code block
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

    // Validate shape
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
      model: 'claude-haiku-4-5-20251001',
    };

    // Store in change record
    await db.query(
      `UPDATE studio_changes
       SET hexagram_interpretation = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(hexagramInterpretation), changeId]
    );

    return NextResponse.json({ hexagramInterpretation });
  } catch (error) {
    console.error('[Change Interpretation] Error:', error);
    return NextResponse.json(
      { error: 'Interpretation failed' },
      { status: 500 }
    );
  }
}
