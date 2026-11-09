import { apiFetch } from '@/lib/http/apiBase';
import type { StoredPlan } from './developmentPlanStore';
import type { StepEdit } from './developmentPlan';

export type PlanView = { plan: StoredPlan | null; staleStepIds: string[] };
const base = (m: string) => `/api/sovereign/manuscripts/${encodeURIComponent(m)}/plans`;

export async function fetchPlan(manuscriptId: string): Promise<PlanView | undefined> {
  try {
    const res = await apiFetch(base(manuscriptId));
    if (!res.ok) return undefined;
    const j = (await res.json()) as { plan: StoredPlan | null; staleStepIds?: string[] };
    return { plan: j.plan, staleStepIds: j.staleStepIds ?? [] };
  } catch { return undefined; }
}

export type MakePlan = { ok: true; view: PlanView; read: { sectionId: string; label: string | null }[]; dropped: number } | { ok: false; refusal: string; detail?: string };
export async function makePlanClient(manuscriptId: string, ask: string, sanctuary: boolean): Promise<MakePlan> {
  try {
    const res = await apiFetch(base(manuscriptId), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ask, sanctuary }) });
    const j = (await res.json().catch(() => ({}))) as { plan?: StoredPlan; staleStepIds?: string[]; read?: { sectionId: string; label: string | null }[]; dropped?: number; refusal?: string; detail?: string };
    if (!res.ok || !j.plan) return { ok: false, refusal: j.refusal ?? `http_${res.status}`, detail: j.detail };
    return { ok: true, view: { plan: j.plan, staleStepIds: j.staleStepIds ?? [] }, read: j.read ?? [], dropped: j.dropped ?? 0 };
  } catch { return { ok: false, refusal: 'unreachable' }; }
}

export async function editPlanClient(manuscriptId: string, planId: string, edits: StepEdit[]): Promise<StoredPlan | undefined> {
  try {
    const res = await apiFetch(`${base(manuscriptId)}/${encodeURIComponent(planId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edits }) });
    if (!res.ok) return undefined;
    return ((await res.json()) as { plan: StoredPlan }).plan;
  } catch { return undefined; }
}
