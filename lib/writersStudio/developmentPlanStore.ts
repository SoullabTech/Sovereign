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
