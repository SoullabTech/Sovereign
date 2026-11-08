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
): Promise<ReadScope | undefined> {
  try {
    const res = await apiFetch(scopeUrl(manuscriptId), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(change),
    });
    if (!res.ok) return undefined;
    return ((await res.json()) as { scope: ReadScope }).scope;
  } catch { return undefined; }
}
