export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { resolveDecisionActor } from '@/lib/studio/decisions/access';

type ChoiceAction = 'record_choice' | 'reopen';

type LockedDecision = {
  id: string;
  status: string;
};

type ChoiceEventRow = {
  id: string;
  event_type: 'choice_recorded' | 'reopened';
  choice_text: string | null;
  recorded_at: Date;
};

function conflict(code: string, error: string) {
  return NextResponse.json({ error, code }, { status: 409 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await resolveDecisionActor(request);
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (request.nextUrl.searchParams.get('scope') !== 'personal') {
      return NextResponse.json(
        { error: 'Personal choice actions require scope=personal.', code: 'PERSONAL_SCOPE_REQUIRED' },
        { status: 400 },
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => null) as {
      action?: ChoiceAction;
      choiceText?: unknown;
    } | null;

    if (!body || (body.action !== 'record_choice' && body.action !== 'reopen')) {
      return NextResponse.json({ error: 'Invalid choice action.' }, { status: 400 });
    }

    const choiceText =
      body.action === 'record_choice' && typeof body.choiceText === 'string'
        ? body.choiceText.trim()
        : '';

    if (body.action === 'record_choice') {
      if (!choiceText) {
        return NextResponse.json({ error: 'Choice text is required.' }, { status: 400 });
      }
      if (choiceText.length > 2000) {
        return NextResponse.json({ error: 'Choice text must be 2000 characters or fewer.' }, { status: 400 });
      }
    }

    const outcome = await db.transaction(async (client) => {
      const decisionResult = await client.query<LockedDecision>(
        `SELECT id::text AS id, status
           FROM studio_decisions
          WHERE id = $1::uuid
            AND decision_scope = 'personal'
            AND personal_member_id = $2::uuid
          FOR UPDATE`,
        [id, actor.memberId],
      );
      const decision = decisionResult.rows[0];
      if (!decision) return { kind: 'not_found' as const };

      if (decision.status === 'archived') {
        return { kind: 'conflict' as const, code: 'DECISION_ARCHIVED', error: 'Archived Decisions cannot change resolution.' };
      }
      if (decision.status === 'consulting') {
        return {
          kind: 'conflict' as const,
          code: 'CONSULTATION_IN_PROGRESS',
          error: 'Wait for the current perspective round to finish before changing resolution.',
        };
      }

      const latestResult = await client.query<ChoiceEventRow>(
        `SELECT id::text AS id, event_type, choice_text, recorded_at
           FROM personal_decision_choice_events
          WHERE decision_id = $1::uuid
          ORDER BY event_order DESC
          LIMIT 1`,
        [id],
      );
      const latest = latestResult.rows[0] ?? null;

      if (body.action === 'record_choice') {
        if (latest?.event_type === 'choice_recorded') {
          return {
            kind: 'conflict' as const,
            code: 'CHOICE_ALREADY_RECORDED',
            error: 'This Decision already has a current recorded choice. Reopen it before recording another.',
          };
        }

        const eventResult = await client.query<ChoiceEventRow>(
          `INSERT INTO personal_decision_choice_events
            (decision_id, member_id, event_type, choice_text)
           VALUES ($1::uuid, $2::uuid, 'choice_recorded', $3)
           RETURNING id::text AS id, event_type, choice_text, recorded_at`,
          [id, actor.memberId, choiceText],
        );

        await client.query(
          `UPDATE studio_decisions
              SET status = 'complete', updated_at = NOW()
            WHERE id = $1::uuid
              AND decision_scope = 'personal'
              AND personal_member_id = $2::uuid`,
          [id, actor.memberId],
        );

        return { kind: 'recorded' as const, event: eventResult.rows[0] };
      }

      const resolvableByLegacyStatus = !latest && decision.status === 'complete';
      if (latest?.event_type === 'reopened' || (!latest && !resolvableByLegacyStatus)) {
        return {
          kind: 'conflict' as const,
          code: 'DECISION_ALREADY_OPEN',
          error: 'This Decision is already open.',
        };
      }

      const eventResult = await client.query<ChoiceEventRow>(
        `INSERT INTO personal_decision_choice_events
          (decision_id, member_id, event_type, choice_text)
         VALUES ($1::uuid, $2::uuid, 'reopened', NULL)
         RETURNING id::text AS id, event_type, choice_text, recorded_at`,
        [id, actor.memberId],
      );

      await client.query(
        `UPDATE studio_decisions
            SET status = 'active', updated_at = NOW()
          WHERE id = $1::uuid
            AND decision_scope = 'personal'
            AND personal_member_id = $2::uuid`,
        [id, actor.memberId],
      );

      return { kind: 'reopened' as const, event: eventResult.rows[0] };
    });

    if (outcome.kind === 'not_found') {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }
    if (outcome.kind === 'conflict') {
      return conflict(outcome.code, outcome.error);
    }

    const event = {
      id: outcome.event.id,
      eventType: outcome.event.event_type,
      choiceText: outcome.event.choice_text,
      recordedAt: outcome.event.recorded_at.toISOString(),
    };

    return NextResponse.json({
      event,
      currentChoice: outcome.kind === 'recorded'
        ? {
            id: event.id,
            choiceText: event.choiceText,
            recordedAt: event.recordedAt,
          }
        : null,
      resolutionStanding: outcome.kind === 'recorded' ? 'choice_recorded' : 'open',
    });
  } catch {
    console.error('[Personal Decision Choice] action failed');
    return NextResponse.json({ error: 'Decision choice action failed' }, { status: 500 });
  }
}