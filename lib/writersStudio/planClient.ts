import { apiFetch } from '@/lib/http/apiBase';
import type { StoredPlan, StepEvent } from './developmentPlanStore';
import type { StepEdit } from './developmentPlan';

/** `verdict` is true only when the server explicitly returned both verification lists. Missing means unverified, never 'all fine'. */
export type PlanView = { plan: StoredPlan | null; staleStepIds: string[]; unverifiedStepIds: string[]; events: Record<string, StepEvent>; verdict: boolean;
  /** true: the writer's settled decisions changed since the plan; false: unchanged; null: cannot be known now. */
  decisionsChanged: boolean | null;
  /** Which chapters the plan was made from; long books may leave some unread. */
  coverage?: { read: number; total: number; notRead: string[] } };
const base = (m: string) => `/api/sovereign/manuscripts/${encodeURIComponent(m)}/plans`;

export async function fetchPlan(manuscriptId: string): Promise<PlanView | undefined> {
  try {
    const res = await apiFetch(base(manuscriptId));
    if (!res.ok) return undefined;
    const j = (await res.json()) as { plan: StoredPlan | null; staleStepIds?: string[]; unverifiedStepIds?: string[]; events?: Record<string, StepEvent>; decisionsChanged?: boolean | null };
    return { plan: j.plan, staleStepIds: j.staleStepIds ?? [], unverifiedStepIds: j.unverifiedStepIds ?? [], events: j.events ?? {},
      verdict: Array.isArray(j.staleStepIds) && Array.isArray(j.unverifiedStepIds) && 'decisionsChanged' in j,
      coverage: (j as { coverage?: { read: number; total: number; notRead: string[] } }).coverage,
      decisionsChanged: typeof j.decisionsChanged === 'boolean' ? j.decisionsChanged : null };
  } catch { return undefined; }
}

export type MakePlan = { ok: true; view: PlanView; read: { sectionId: string; label: string | null }[]; dropped: number } | { ok: false; refusal: string; detail?: string };
export async function makePlanClient(manuscriptId: string, ask: string, sanctuary: boolean): Promise<MakePlan> {
  try {
    const res = await apiFetch(base(manuscriptId), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ask, sanctuary }) });
    const j = (await res.json().catch(() => ({}))) as { plan?: StoredPlan; staleStepIds?: string[]; read?: { sectionId: string; label: string | null }[]; dropped?: number; refusal?: string; detail?: string };
    if (!res.ok || !j.plan) return { ok: false, refusal: j.refusal ?? `http_${res.status}`, detail: j.detail };
    return { ok: true, view: { plan: j.plan, staleStepIds: j.staleStepIds ?? [], unverifiedStepIds: (j as { unverifiedStepIds?: string[] }).unverifiedStepIds ?? [], events: {},
      verdict: Array.isArray(j.staleStepIds) && Array.isArray((j as { unverifiedStepIds?: unknown }).unverifiedStepIds),
      decisionsChanged: (j as { decisionsChanged?: unknown }).decisionsChanged === false ? false : null,
      coverage: (j as { coverage?: { read: number; total: number; notRead: string[] } }).coverage }, read: j.read ?? [], dropped: j.dropped ?? 0 };
  } catch { return { ok: false, refusal: 'unreachable' }; }
}

export async function editPlanClient(manuscriptId: string, planId: string, edits: StepEdit[]): Promise<StoredPlan | undefined> {
  try {
    const res = await apiFetch(`${base(manuscriptId)}/${encodeURIComponent(planId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edits }) });
    if (!res.ok) return undefined;
    return ((await res.json()) as { plan: StoredPlan }).plan;
  } catch { return undefined; }
}

/** Tell the plan that a change applied in the desk came from this step. The server verifies it against the desk's records. */
export async function linkStepClient(manuscriptId: string, planId: string, stepId: string, authorizationId: string): Promise<'linked' | 'already' | 'refused' | 'unreachable'> {
  try {
    const res = await apiFetch(`${base(manuscriptId)}/${encodeURIComponent(planId)}/links`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stepId, authorizationId }) });
    const j = (await res.json().catch(() => ({}))) as { outcome?: 'linked' | 'already' | 'refused' };
    return j.outcome === 'linked' || j.outcome === 'already' || j.outcome === 'refused' ? j.outcome : 'refused';   // no answer is never 'linked'
  } catch { return 'unreachable'; }
}

export async function deletePlanClient(manuscriptId: string, planId: string): Promise<boolean> {
  try { const res = await apiFetch(`${base(manuscriptId)}/${encodeURIComponent(planId)}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
}
