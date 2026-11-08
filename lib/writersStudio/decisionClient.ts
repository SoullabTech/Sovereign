import { apiFetch } from '@/lib/http/apiBase';

export interface SettledDecision { id: string; room: string; saidIn: string }
const url = (workId: string) => `/api/sovereign/living-works/${encodeURIComponent(workId)}/decisions`;

export async function listDecisions(workId: string): Promise<SettledDecision[] | undefined> {
  try {
    const res = await apiFetch(url(workId));
    if (!res.ok) return undefined;
    return ((await res.json()) as { decisions: SettledDecision[] }).decisions;
  } catch { return undefined; }
}

export async function settleDecisionNote(workId: string, saidIn: string, sanctuary: boolean,
  where: { room?: 'work_conversation' | 'passage_desk' | 'develop'; subjectKind?: 'note' | 'wording'; subjectRef?: string } = {}):
  Promise<{ ok: true } | { ok: false; refusal: string }> {
  try {
    const res = await apiFetch(url(workId), { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'settle', saidIn, room: where.room ?? 'work_conversation', subjectKind: where.subjectKind ?? 'note',
        ...(where.subjectRef ? { subjectRef: where.subjectRef } : {}), sanctuary }) });
    if (res.ok) return { ok: true };
    const j = (await res.json().catch(() => ({}))) as { refusal?: string };
    return { ok: false, refusal: j.refusal ?? `http_${res.status}` };
  } catch { return { ok: false, refusal: 'unreachable' }; }
}

export async function withdrawDecisionById(workId: string, targetId: string): Promise<boolean> {
  try {
    const res = await apiFetch(url(workId), { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'withdraw', targetId }) });
    return res.ok;
  } catch { return false; }
}
