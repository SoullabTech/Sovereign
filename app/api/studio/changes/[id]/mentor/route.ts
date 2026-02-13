export const dynamic = 'force-dynamic';

/**
 * CHANGE MENTOR AI ENDPOINT
 *
 * POST - Generate an AI-powered mentor reflection for a change.
 *
 * Calls Claude with change context + council result + hexagram + recent experiences
 * to produce tailored questions, a sovereignty check, next-step experiment, and hexagram wisdom.
 *
 * The result is cached in studio_changes.mentor_reflection so it doesn't
 * need regenerating unless the council result changes.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getHexagram } from '@/lib/iching/lookup';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  timeout: 30000,
});

const MENTOR_SYSTEM_PROMPT = `You are MAIA Mentor — a sovereignty-oriented companion for people navigating change.

Your role is NOT to advise. It is to:
- Surface what the person may not be seeing
- Check where agency might be leaking (spiritual bypassing, grasping for control, avoiding discomfort)
- Offer one small, testable experiment — not a grand strategy
- Speak hexagram wisdom — what this specific I Ching hexagram reveals for this person's change

You speak with warmth but without flattery. You are direct but not commanding.
You never diagnose, prescribe, or claim authority over the person's process.

IMPORTANT: The person's sovereignty always comes first. Your reflections should strengthen their agency, not create dependence on your guidance.

Respond in JSON format ONLY:
{
  "questions": ["string", "string", "string"],
  "sovereigntyCheck": "string",
  "nextExperiment": "string",
  "hexagramWisdom": "string"
}

- questions: 3 precise questions that open what the council may have missed. Not generic. Specific to this change, this moment.
- sovereigntyCheck: One sentence identifying where the person's agency might be leaking or where urgency is driving instead of clarity.
- nextExperiment: One small, testable action the person could take this week. Concrete. Bounded. Observable.
- hexagramWisdom: A specific insight from the I Ching hexagram for this person's change. Direct. Embodied. (1-2 sentences)`;

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

    // Fetch full change with council result
    const changeResult = await db.query(
      `SELECT c.*
       FROM studio_changes c
       WHERE c.id = $1 AND c.practitioner_id = $2`,
      [changeId, practitionerId]
    );

    if (changeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    const row = changeResult.rows[0];
    const council = row.council_result;

    if (!council) {
      return NextResponse.json(
        { error: 'No council result yet — consult the council first' },
        { status: 400 }
      );
    }

    // Fetch recent experiences for context
    const experiencesResult = await db.query(
      `SELECT experience_type, content, occurred_at
       FROM change_experiences
       WHERE change_id = $1
       ORDER BY occurred_at DESC
       LIMIT 5`,
      [changeId]
    );

    // Fetch hexagram details if cast
    let hexagram = null;
    let relatingHexagram = null;
    if (row.hexagram_number) {
      hexagram = getHexagram(row.hexagram_number);
      if (row.relating_hexagram_number) {
        relatingHexagram = getHexagram(row.relating_hexagram_number);
      }
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

    if (hexagram) {
      contextParts.push('', 'I CHING HEXAGRAM:');
      contextParts.push(`${hexagram.number}. ${hexagram.english} (${hexagram.name})`);
      contextParts.push(`Judgment: ${hexagram.judgment}`);
      contextParts.push(`Image: ${hexagram.image}`);
      if (row.changing_lines && row.changing_lines.length > 0) {
        contextParts.push(`Changing lines: ${row.changing_lines.join(', ')}`);
      }
      if (relatingHexagram) {
        contextParts.push(`Relating to: ${relatingHexagram.number}. ${relatingHexagram.english}`);
      }
    }

    contextParts.push('', 'COUNCIL RESULT:');
    if (council.recommendation) contextParts.push(`Recommendation: ${council.recommendation}`);
    if (council.tensions?.length > 0) {
      contextParts.push(`Tensions: ${council.tensions.join('; ')}`);
    }
    if (council.risks?.length > 0) {
      contextParts.push(`Risks: ${council.risks.join('; ')}`);
    }
    if (council.insights?.length > 0) {
      contextParts.push(`Insights: ${council.insights.join('; ')}`);
    }

    if (experiencesResult.rows.length > 0) {
      contextParts.push('', 'RECENT EXPERIENCES:');
      for (const exp of experiencesResult.rows) {
        contextParts.push(`- [${exp.experience_type}] ${exp.content}`);
      }
    }

    if (row.iteration_count > 1) {
      contextParts.push(``, `This change is on iteration ${row.iteration_count}. The person keeps returning to it.`);
    }

    const MENTOR_MODEL = 'claude-haiku-4-5-20251001';
    const message = await anthropic.messages.create({
      model: MENTOR_MODEL,
      max_tokens: 900,
      system: MENTOR_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: contextParts.join('\n'),
        },
      ],
    });

    // Parse response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    let mentorReflection;
    try {
      mentorReflection = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from a markdown code block
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mentorReflection = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: 'Failed to parse mentor reflection' },
          { status: 500 }
        );
      }
    }

    // Validate shape
    if (!mentorReflection.questions || !mentorReflection.sovereigntyCheck ||
        !mentorReflection.nextExperiment || !mentorReflection.hexagramWisdom) {
      return NextResponse.json(
        { error: 'Incomplete mentor reflection' },
        { status: 500 }
      );
    }

    const reflection = {
      questions: mentorReflection.questions.slice(0, 3),
      sovereigntyCheck: mentorReflection.sovereigntyCheck,
      nextExperiment: mentorReflection.nextExperiment,
      hexagramWisdom: mentorReflection.hexagramWisdom,
      generatedAt: new Date().toISOString(),
      model: MENTOR_MODEL,
      templateVersion: 1,
    };

    // Store in change record
    await db.query(
      `UPDATE studio_changes
       SET mentor_reflection = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(reflection), changeId]
    );

    return NextResponse.json({ mentorReflection: reflection });
  } catch (error) {
    console.error('[Change Mentor] Error:', error);
    return NextResponse.json(
      { error: 'Mentor reflection failed' },
      { status: 500 }
    );
  }
}
