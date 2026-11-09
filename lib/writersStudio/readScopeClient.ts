import { withKeepPosture } from '@/lib/writersStudio/keepPosture';
import { apiFetch } from '@/lib/http/apiBase';

/* WS-WORK-CONTINUITY · B — the member's standing reading scope (their own gesture). */
export type ReadScope = { level: 'chapter' | 'work' } | null;
const scopeUrl = (manuscriptId: string) =>
  `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/read-scope`;

export async function getReadScope(manuscriptId: string): Promise<ReadScope | undefined> {
  try {
    const res = await apiFetch(scopeUrl(manuscriptId));
    if (!res.ok) return undefined;
    return ((await res.json()) as { scope: ReadScope }).scope;
  } catch { return undefined; }
}

export async function setReadScope(
  manuscriptId: string, change: { action: 'grant'; level: 'chapter' | 'work' } | { action: 'revoke' },
): Promise<ReadScope | undefined | { refused: string }> {
  try {
    const res = await apiFetch(scopeUrl(manuscriptId), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(withKeepPosture({ ...change })),
    });
    if (!res.ok) {
      const refusal = ((await res.json().catch(() => ({}))) as { refusal?: string }).refusal;
      return refusal === 'sanctuary_not_kept' || refusal === 'posture_undeclared' ? { refused: refusal } : undefined;
    }
    return ((await res.json()) as { scope: ReadScope }).scope;
  } catch { return undefined; }
}
