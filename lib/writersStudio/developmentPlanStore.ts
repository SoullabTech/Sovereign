/** WS-DEVELOP-STUDIO · M4 — plan store. Member-scoped in every statement. Missing table (migrate-before-swap) reads as "no plan", never an error. */
import { query } from '@/lib/db/postgres';
import type { PlanStep } from './developmentPlan';

export interface StoredPlan {
  id: string; ask: string; summary: string; steps: PlanStep[]; basis: { sectionId: string; digest: string }[]; createdAt: string; updatedAt: string;
}
type Row = { id: string; ask: string; summary: string; steps: PlanStep[]; basis: { sectionId: string; digest: string }[]; created_at: Date; updated_at: Date };
const shape = (r: Row): StoredPlan => ({ id: r.id, ask: r.ask, summary: r.summary, steps: r.steps, basis: r.basis, createdAt: new Date(r.created_at).toISOString(), updatedAt: new Date(r.updated_at).toISOString() });
const noTable = (e: unknown) => (e as { code?: string })?.code === '42P01';

export async function createPlan(i: { memberId: string; livingWorkId: string; manuscriptId: string; ask: string; summary: string; steps: PlanStep[]; basis: { sectionId: string; digest: string }[] }): Promise<StoredPlan | null> {
  const r = await query<Row>(
    `INSERT INTO development_plans (member_id, living_work_id, manuscript_id, ask, summary, steps, basis)
     SELECT $1, w.id, m.id, $4, $5, $6::jsonb, $7::jsonb
       FROM living_works w JOIN member_manuscripts m ON m.id = $3 AND m.member_id = $1
      WHERE w.id = $2 AND w.member_id = $1
     RETURNING id, ask, summary, steps, basis, created_at, updated_at`,
    [i.memberId, i.livingWorkId, i.manuscriptId, i.ask, i.summary, JSON.stringify(i.steps), JSON.stringify(i.basis)]);
  return r.rows[0] ? shape(r.rows[0]) : null;
}

export async function latestPlan(memberId: string, manuscriptId: string): Promise<StoredPlan | null> {
  try {
    const r = await query<Row>(
      `SELECT id, ask, summary, steps, basis, created_at, updated_at FROM development_plans
        WHERE member_id = $1 AND manuscript_id = $2 ORDER BY created_at DESC, id DESC LIMIT 1`, [memberId, manuscriptId]);
    return r.rows[0] ? shape(r.rows[0]) : null;
  } catch (e) { if (noTable(e)) return null; throw e; }
}

/** A plan is addressed by member AND manuscript AND id: a plan of another of the writer's Works is not reachable through this manuscript's route. */
export async function getPlan(memberId: string, manuscriptId: string, planId: string): Promise<StoredPlan | null> {
  const r = await query<Row>(`SELECT id, ask, summary, steps, basis, created_at, updated_at FROM development_plans WHERE id = $1 AND member_id = $2 AND manuscript_id = $3`, [planId, memberId, manuscriptId]);
  return r.rows[0] ? shape(r.rows[0]) : null;
}

export async function saveSteps(memberId: string, manuscriptId: string, planId: string, steps: PlanStep[]): Promise<StoredPlan | null> {
  const r = await query<Row>(
    `UPDATE development_plans SET steps = $3::jsonb WHERE id = $1 AND member_id = $2 AND manuscript_id = $4 RETURNING id, ask, summary, steps, basis, created_at, updated_at`,
    [planId, memberId, JSON.stringify(steps), manuscriptId]);
  return r.rows[0] ? shape(r.rows[0]) : null;
}

/** What the desk's own records say happened to a step's passage. Derived, never stored on the step. */
export type StepEvent = { state: 'applied' | 'undone'; at: string; applications: number };

/**
 * Link a desk authorization to a plan step. Inserts only when every fact is verified in one statement against the desk's records:
 * the plan is the member's and on this manuscript; the step exists in it; the authorization is the member's, ACCEPTED,
 * on this manuscript, on the step's own section, and accepted after the plan was made. One authorization links to one step, once.
 */
export async function linkStepApplication(memberId: string, manuscriptId: string, planId: string, stepId: string, authorizationId: string): Promise<'linked' | 'already' | 'refused'> {
  const r = await query<{ authorization_id: string }>(
    `INSERT INTO development_plan_step_links (authorization_id, plan_id, step_id, member_id)
     SELECT a.id, p.id, $4, $1
       FROM development_plans p
       JOIN manuscript_revision_authorizations a ON a.id = $5 AND a.member_id = $1 AND a.accepted_at IS NOT NULL
                                                 AND a.work_id = p.manuscript_id AND a.accepted_at >= p.created_at
      WHERE p.id = $3 AND p.member_id = $1 AND p.manuscript_id = $2
        AND EXISTS (SELECT 1 FROM jsonb_array_elements(p.steps) st WHERE st->>'id' = $4 AND st->>'chapterId' = a.target_section_id::text)
     ON CONFLICT (authorization_id) DO NOTHING
     RETURNING authorization_id`, [memberId, manuscriptId, planId, stepId, authorizationId]);
  if (r.rows[0]) return 'linked';
  const prior = await query<{ plan_id: string; step_id: string }>(
    `SELECT plan_id, step_id FROM development_plan_step_links WHERE authorization_id = $1 AND member_id = $2`, [authorizationId, memberId]);
  return prior.rows[0] && prior.rows[0].plan_id === planId && prior.rows[0].step_id === stepId ? 'already' : 'refused';
}

/** Per step: applied if any linked application is not undone; undone if every linked application was undone. From the desk's tables. */
export async function stepEvents(memberId: string, planId: string): Promise<Record<string, StepEvent>> {
  try {
    const r = await query<{ step_id: string; active: string; total: string; last_at: Date }>(
      `SELECT l.step_id,
              COUNT(*) FILTER (WHERE rc.undone_at IS NULL)::text AS active,
              COUNT(*)::text AS total,
              MAX(GREATEST(a.accepted_at, COALESCE(rc.undone_at, a.accepted_at))) AS last_at
         FROM development_plan_step_links l
         JOIN manuscript_revision_authorizations a ON a.id = l.authorization_id AND a.member_id = l.member_id AND a.accepted_at IS NOT NULL
         LEFT JOIN manuscript_application_recovery rc ON rc.authorization_id = a.id
        WHERE l.plan_id = $1 AND l.member_id = $2
        GROUP BY l.step_id`, [planId, memberId]);
    const out: Record<string, StepEvent> = {};
    for (const row of r.rows) out[row.step_id] = { state: Number(row.active) > 0 ? 'applied' : 'undone', at: new Date(row.last_at).toISOString(), applications: Number(row.total) };
    return out;
  } catch (e) { if (noTable(e)) return {}; throw e; }
}
