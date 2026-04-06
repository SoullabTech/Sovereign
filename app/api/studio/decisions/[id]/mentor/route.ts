export const dynamic = 'force-dynamic';

/**
 * DECISION MENTOR AI ENDPOINT
 *
 * POST - Generate an AI-powered mentor reflection for a decision.
 *
 * Calls Claude with decision context + council result + recent experiences
 * to produce tailored questions, a sovereignty check, and a next-step experiment.
 *
 * The result is cached in studio_decisions.mentor_reflection so it doesn't
 * need regenerating unless the council result changes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getSituationConfig } from '@/lib/studio/leadership/situationTypes';


const MENTOR_SYSTEM_PROMPT = `You are MAIA Mentor — a sovereignty-oriented companion for practitioners navigating complex decisions.

Your role is NOT to advise. It is to:
- Surface what the practitioner may not be seeing
- Check where agency might be leaking (outsourcing decisions, avoiding discomfort, performing certainty)
- Offer one small, testable experiment — not a grand strategy

You speak with warmth but without flattery. You are direct but not commanding.
You never diagnose, prescribe, or claim authority over the practitioner's process.

IMPORTANT: The practitioner's sovereignty always comes first. Your reflections should strengthen their agency, not create dependence on your guidance.

Respond in JSON format ONLY:
{
  "questions": ["string", "string", "string"],
  "sovereigntyCheck": "string",
  "nextExperiment": "string"
}

- questions: 3 precise questions that open what the council may have missed. Not generic. Specific to this decision, this moment.
- sovereigntyCheck: One sentence identifying where the practitioner's agency might be leaking or where pressure is driving instead of clarity.
- nextExperiment: One small, testable action the practitioner could take this week. Concrete. Bounded. Observable.`;

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
    const { id: decisionId } = await params;

    // Fetch full decision with council result
    const decisionResult = await db.query(
      `SELECT d.*, c.name as client_name
       FROM studio_decisions d
       LEFT JOIN practitioner_clients c ON c.id = d.client_id
       WHERE d.id = $1 AND d.practitioner_id = $2`,
      [decisionId, practitionerId]
    );

    if (decisionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const row = decisionResult.rows[0];
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
       FROM decision_experiences
       WHERE decision_id = $1
       ORDER BY occurred_at DESC
       LIMIT 5`,
      [decisionId]
    );

    const situationConfig = getSituationConfig(row.situation_type);

    // Build the context for MAIA
    const contextParts: string[] = [
      `DECISION: ${row.title}`,
      `SITUATION TYPE: ${situationConfig.label}`,
      `CONTEXT: ${row.context}`,
    ];

    if (row.stakes) contextParts.push(`STAKES: ${row.stakes}`);
    if (row.emotional_state) contextParts.push(`EMOTIONAL STATE: ${row.emotional_state}`);
    if (row.time_pressure && row.time_pressure !== 'none') {
      contextParts.push(`TIME PRESSURE: ${row.time_pressure}`);
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
      contextParts.push(``, `This decision is on iteration ${row.iteration_count}. The practitioner keeps returning to it.`);
    }

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'fast',
      systemPrompt: MENTOR_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: contextParts.join('\n'),
        },
      ],
      maxTokens: 800,
    });

    // Parse response
    const responseText = llmResponse.text;

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
    if (!mentorReflection.questions || !mentorReflection.sovereigntyCheck || !mentorReflection.nextExperiment) {
      return NextResponse.json(
        { error: 'Incomplete mentor reflection' },
        { status: 500 }
      );
    }

    const reflection = {
      questions: mentorReflection.questions.slice(0, 3),
      sovereigntyCheck: mentorReflection.sovereigntyCheck,
      nextExperiment: mentorReflection.nextExperiment,
      generatedAt: new Date().toISOString(),
      model: 'claude-haiku-4-5-20251001',
      templateVersion: 1,
    };

    // Store in decision record
    await db.query(
      `UPDATE studio_decisions
       SET mentor_reflection = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(reflection), decisionId]
    );

    return NextResponse.json({ mentorReflection: reflection });
  } catch (error) {
    console.error('[Decision Mentor] Error:', error);
    return NextResponse.json(
      { error: 'Mentor reflection failed' },
      { status: 500 }
    );
  }
}
