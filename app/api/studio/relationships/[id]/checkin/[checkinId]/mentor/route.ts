export const dynamic = 'force-dynamic';

/**
 * MAIA MENTOR FOR RELATIONSHIP CHECK-IN
 *
 * POST — Generate a mentor reflection after a check-in.
 * Follows the same pattern as decision mentor (decisions/[id]/mentor).
 *
 * Returns 3 questions, a sovereignty check, and a next experiment.
 * Cached in relationship_checkins.mentor_reflection.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { CHILD_STATE_LABELS, PARENT_NEED_LABELS, type ChildState, type ParentNeed } from '@/lib/studio/relationships/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  timeout: 30000,
});

const MENTOR_SYSTEM_PROMPT = `You are MAIA Mentor — a sovereignty-oriented companion for parents navigating the complexity of raising another human.

Your role is NOT to advise on parenting. It is to:
- Surface what the parent may not be seeing about themselves (not about the child)
- Check where the parent's own needs, fears, or patterns might be shaping their response
- Offer one small, testable experiment that increases the parent's own groundedness
- Never pathologize the child or the parent
- Never create dependence — increase the parent's self-trust

You speak with warmth but without flattery. You are direct but not commanding.

Respond in JSON format ONLY:
{
  "questions": ["string", "string", "string"],
  "sovereigntyCheck": "string",
  "nextExperiment": "string"
}

- questions: 3 precise questions about the PARENT's experience (not the child's behavior). What might the parent not be seeing about their own response?
- sovereigntyCheck: One sentence identifying where the parent might be outsourcing their own authority (to the child, to the system, to fear, to a book, to you).
- nextExperiment: One small, testable thing the parent could try this week. Concrete. About the parent's own presence, not the child's behavior.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checkinId: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: relationshipId, checkinId } = await params;

    // Fetch check-in with relationship context
    const checkinResult = await db.query(
      `SELECT c.*, r.person_name, r.role, r.age_years
       FROM relationship_checkins c
       JOIN studio_relationships r ON r.id = c.relationship_id
       WHERE c.id = $1 AND c.relationship_id = $2 AND c.practitioner_id = $3`,
      [checkinId, relationshipId, practitionerId]
    );

    if (checkinResult.rows.length === 0) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 });
    }

    const row = checkinResult.rows[0];
    const maiaResponse = row.maia_response;

    if (!maiaResponse) {
      return NextResponse.json(
        { error: 'No MAIA response on this check-in yet' },
        { status: 400 }
      );
    }

    // Fetch recent checkins for pattern context
    const recentResult = await db.query(
      `SELECT what_happened, child_state, maia_response, created_at
       FROM relationship_checkins
       WHERE relationship_id = $1 AND id != $2
       ORDER BY created_at DESC
       LIMIT 5`,
      [relationshipId, checkinId]
    );

    // Build context
    const contextParts: string[] = [
      `RELATIONSHIP: ${row.person_name} (${row.role})`,
    ];
    if (row.age_years) contextParts.push(`AGE: ${row.age_years}`);

    contextParts.push('');
    contextParts.push(`THIS CHECK-IN:`);
    contextParts.push(`What happened: ${row.what_happened}`);
    if (row.child_state) contextParts.push(`Child's state: ${CHILD_STATE_LABELS[row.child_state as ChildState] || row.child_state}`);
    if (row.parent_need) contextParts.push(`Parent's need: ${PARENT_NEED_LABELS[row.parent_need as ParentNeed] || row.parent_need}`);

    contextParts.push('');
    contextParts.push('MAIA\'S INITIAL RESPONSE:');
    contextParts.push(`Framing: ${maiaResponse.framing}`);
    contextParts.push(`Script: ${maiaResponse.script}`);
    contextParts.push(`Action: ${maiaResponse.action}`);
    contextParts.push(`Threshold: ${maiaResponse.threshold}`);

    if (recentResult.rows.length > 0) {
      contextParts.push('');
      contextParts.push('RECENT HISTORY (pattern context):');
      for (const prev of recentResult.rows) {
        const date = new Date(prev.created_at).toLocaleDateString();
        const state = prev.child_state ? ` [${prev.child_state}]` : '';
        contextParts.push(`- ${date}${state}: ${prev.what_happened.slice(0, 100)}`);
      }
    }

    const MENTOR_MODEL = 'claude-haiku-4-5-20251001';
    const message = await anthropic.messages.create({
      model: MENTOR_MODEL,
      max_tokens: 800,
      system: MENTOR_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: contextParts.join('\n') },
      ],
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    let mentorReflection;
    try {
      mentorReflection = JSON.parse(responseText);
    } catch {
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
      model: MENTOR_MODEL,
    };

    // Cache in check-in record
    await db.query(
      `UPDATE relationship_checkins
       SET mentor_reflection = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(reflection), checkinId]
    );

    return NextResponse.json({ mentorReflection: reflection });
  } catch (error) {
    console.error('[Relationship Mentor] Error:', error);
    return NextResponse.json(
      { error: 'Mentor reflection failed' },
      { status: 500 }
    );
  }
}
