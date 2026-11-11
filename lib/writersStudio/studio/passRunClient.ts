import { apiFetch } from '@/lib/http/apiBase';
import { withKeepPosture } from '@/lib/writersStudio/keepPosture';
import type { RunView } from '@/lib/writersStudio/studio/passRun';

const url = (m: string) => `/api/sovereign/manuscripts/${encodeURIComponent(m)}/editorial-pass`;

export async function fetchRun(manuscriptId: string): Promise<RunView | null | undefined> {
  try { const r = await apiFetch(url(manuscriptId)); if (!r.ok) return undefined; return ((await r.json()) as { run: RunView | null }).run; }
  catch { return undefined; }
}
export async function startPassRun(manuscriptId: string): Promise<{ ok: true; run: RunView | null } | { ok: false; refusal: string }> {
  try {
    const r = await apiFetch(url(manuscriptId), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(withKeepPosture({})) });
    const b = await r.json().catch(() => null) as { run?: RunView | null; refusal?: string } | null;
    return r.ok ? { ok: true, run: b?.run ?? null } : { ok: false, refusal: b?.refusal ?? `http_${r.status}` };
  } catch { return { ok: false, refusal: 'unreachable' }; }
}
export async function cancelPassRun(manuscriptId: string): Promise<boolean> {
  try { const r = await apiFetch(url(manuscriptId), { method: 'DELETE' }); return r.ok; } catch { return false; }
}
