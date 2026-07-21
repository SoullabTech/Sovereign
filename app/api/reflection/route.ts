/**
 * POST /api/reflection — save a member's reflection (verbatim, member-owned)
 * GET  /api/reflection — list the member's own reflections, newest first
 *
 * Developmental Reflection Experience — beta v0.
 * Grounding: EA_WORLD_CLASS_ASSESSMENT_FOUNDATIONS_2026-07-21.md §11 (prototype
 * spec) + §6 (results doctrine). Constitutional constraints enforced here:
 *   - answers are stored exactly as written; nothing is derived, scored, or
 *     labeled (no computation about the person exists in this route by design)
 *   - member-scoped: a member reads and writes only their own reflections
 *   - skipped questions never arrive (client sends only answered items) and
 *     are never inferred from
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';

const MAX_ANSWER_LENGTH = 8000;
const MAX_ANSWERS = 12;

export async function POST(request: NextRequest) {
  const member = await getAuthenticatedMember(request);
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { answers, experiment, experimentIfThen, returnIntentAt, priorReflectionId } =
    (body ?? {}) as {
      answers?: Array<{ question?: unknown; answer?: unknown }>;
      experiment?: unknown;
      experimentIfThen?: unknown;
      returnIntentAt?: unknown;
      priorReflectionId?: unknown;
    };

  if (!Array.isArray(answers) || answers.length === 0 || answers.length > MAX_ANSWERS) {
    return NextResponse.json({ error: 'answers must be a non-empty array' }, { status: 400 });
  }
  const cleanAnswers: Array<{ question: string; answer: string }> = [];
  for (const item of answers) {
    if (
      typeof item?.question !== 'string' ||
      typeof item?.answer !== 'string' ||
      item.answer.trim().length === 0 ||
      item.answer.length > MAX_ANSWER_LENGTH ||
      item.question.length > 500
    ) {
      return NextResponse.json({ error: 'Invalid answer item' }, { status: 400 });
    }
    // Verbatim: no trimming beyond outer whitespace, no rewriting.
    cleanAnswers.push({ question: item.question, answer: item.answer.trim() });
  }

  const cleanExperiment =
    typeof experiment === 'string' && experiment.trim() ? experiment.trim().slice(0, MAX_ANSWER_LENGTH) : null;
  const cleanIfThen =
    typeof experimentIfThen === 'string' && experimentIfThen.trim()
      ? experimentIfThen.trim().slice(0, MAX_ANSWER_LENGTH)
      : null;

  let cleanReturnDate: string | null = null;
  if (typeof returnIntentAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(returnIntentAt)) {
    cleanReturnDate = returnIntentAt;
  }

  let cleanPriorId: string | null = null;
  if (typeof priorReflectionId === 'string' && priorReflectionId.length > 0) {
    // Ownership check: a return may only reference the member's own reflection.
    const prior = await query(
      'SELECT id FROM member_reflections WHERE id = $1 AND member_id = $2',
      [priorReflectionId, member.id],
    );
    if (prior.rows.length === 0) {
      return NextResponse.json({ error: 'Unknown prior reflection' }, { status: 400 });
    }
    cleanPriorId = priorReflectionId;
  }

  const result = await query(
    `INSERT INTO member_reflections
       (member_id, answers, experiment, experiment_if_then, return_intent_at, prior_reflection_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [member.id, JSON.stringify(cleanAnswers), cleanExperiment, cleanIfThen, cleanReturnDate, cleanPriorId],
  );

  return NextResponse.json({
    id: result.rows[0].id,
    createdAt: result.rows[0].created_at,
  });
}

export async function GET(request: NextRequest) {
  const member = await getAuthenticatedMember(request);
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query(
    `SELECT id, answers, experiment, experiment_if_then, return_intent_at,
            prior_reflection_id, created_at
       FROM member_reflections
      WHERE member_id = $1
      ORDER BY created_at DESC
      LIMIT 20`,
    [member.id],
  );

  return NextResponse.json({ reflections: result.rows });
}
