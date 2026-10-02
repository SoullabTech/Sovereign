export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import db from '@/lib/db/postgres';
import { decisionOwnerWhere, decisionScopeMatchesRequest, resolveDecisionActor } from '@/lib/studio/decisions/access';
import { getSituationConfig } from '@/lib/studio/leadership/situationTypes';
import { MENTOR_EPISTEMIC_DISCIPLINE } from '@/lib/studio/mentorDiscipline';

const MENTOR_SYSTEM_PROMPT = `You are MAIA Mentor — a sovereignty-oriented companion for a person navigating a complex decision.

Your role is NOT to decide for them. It is to:
- Surface what they may not be seeing
- Reflect where their agency may be worth examining — only when their words or actions support that question
- Offer one small, testable experiment — not a grand strategy

You speak with warmth but without flattery. You are direct but not commanding.
You never diagnose, prescribe, or claim authority over the person's process.

IMPORTANT: Their sovereignty comes first. Your reflections should strengthen agency, not create dependence on your guidance.

${MENTOR_EPISTEMIC_DISCIPLINE}

Respond in JSON format ONLY:
{
  "questions": ["string", "string", "string"],
  "sovereigntyCheck": "string",
  "nextExperiment": "string"
}

- questions: 3 precise questions that open what the council may have missed. Questions must open, not steer.
- sovereigntyCheck: One reflective question that helps the person notice where agency might be worth examining. Never diagnose or declare a hidden state.
- nextExperiment: One small, testable action the person could take this week. Concrete. Bounded. Observable. Prefer information-generating or option-preserving actions.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await resolveDecisionActor(request);
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: decisionId } = await params;
    const decisionResult = await db.query(
      `SELECT d.*, c.name as client_name
         FROM studio_decisions d
         LEFT JOIN practitioner_clients c ON c.id = d.client_id
        WHERE d.id = $1 AND ${decisionOwnerWhere('d', '$2', '$3')}`,
      [decisionId, actor.memberId, actor.practitionerId],
    );
    if (!decisionResult.rows.length) return NextResponse.json({ error: 'Decision not found' }, { status: 404 });

    const row = decisionResult.rows[0];
    if (!decisionScopeMatchesRequest(request, row.decision_scope)) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }
    const council = row.council_result;
    if (!council) {
      return NextResponse.json({ error: 'No council result yet — consult the council first' }, { status: 400 });
    }

    const experiencesResult = await db.query(
      `SELECT experience_type, content, occurred_at
         FROM decision_experiences
        WHERE decision_id = $1
        ORDER BY occurred_at DESC
        LIMIT 5`,
      [decisionId],
    );

    const situationConfig = getSituationConfig(row.situation_type);
    const contextParts: string[] = [
      `DECISION SCOPE: ${row.decision_scope === 'personal' ? 'PERSONAL' : 'PRACTICE'}`,
      `DECISION: ${row.title}`,
      `SITUATION TYPE: ${situationConfig.label}`,
      `CONTEXT: ${row.context}`,
    ];

    if (row.decision_scope === 'practice' && row.client_name) contextParts.push(`CLIENT: ${row.client_name}`);
    if (row.stakes) contextParts.push(`STAKES: ${row.stakes}`);
    if (row.emotional_state) contextParts.push(`EMOTIONAL STATE: ${row.emotional_state}`);
    if (row.time_pressure && row.time_pressure !== 'none') contextParts.push(`TIME PRESSURE: ${row.time_pressure}`);

    contextParts.push('', 'COUNCIL RESULT:');
    if (council.recommendation) contextParts.push(`Recommendation: ${council.recommendation}`);
    if (council.tensions?.length) contextParts.push(`Tensions: ${council.tensions.join('; ')}`);
    if (council.risks?.length) contextParts.push(`Risks: ${council.risks.join('; ')}`);
    if (council.insights?.length) contextParts.push(`Insights: ${council.insights.join('; ')}`);

    if (experiencesResult.rows.length) {
      contextParts.push('', 'RECENT EXPERIENCES:');
      for (const exp of experiencesResult.rows) contextParts.push(`- [${exp.experience_type}] ${exp.content}`);
    }
    if (row.iteration_count > 1) {
      contextParts.push('', `This decision is on iteration ${row.iteration_count}. The person has returned to it more than once.`);
    }

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'fast',
      systemPrompt: MENTOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contextParts.join('\n') }],
      maxTokens: 800,
    });

    const responseText = llmResponse.text;
    let mentorReflection: any;
    try {
      mentorReflection = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse mentor reflection' }, { status: 500 });
      mentorReflection = JSON.parse(jsonMatch[0]);
    }

    if (!mentorReflection.questions || !mentorReflection.sovereigntyCheck || !mentorReflection.nextExperiment) {
      return NextResponse.json({ error: 'Incomplete mentor reflection' }, { status: 500 });
    }

    const reflection = {
      questions: mentorReflection.questions.slice(0, 3),
      sovereigntyCheck: mentorReflection.sovereigntyCheck,
      nextExperiment: mentorReflection.nextExperiment,
      generatedAt: new Date().toISOString(),
      model: 'claude-haiku-4-5-20251001',
      templateVersion: 2,
    };

    const stored = await db.query(
      `UPDATE studio_decisions
          SET mentor_reflection = $1, updated_at = NOW()
        WHERE id = $2 AND ${decisionOwnerWhere('studio_decisions', '$3', '$4')}
        RETURNING id`,
      [JSON.stringify(reflection), decisionId, actor.memberId, actor.practitionerId],
    );
    if (!stored.rows.length) return NextResponse.json({ error: 'Decision ownership changed.' }, { status: 409 });

    return NextResponse.json({ mentorReflection: reflection });
  } catch (error) {
    console.error('[Decision Mentor] Error:', error);
    return NextResponse.json({ error: 'Mentor reflection failed' }, { status: 500 });
  }
}
