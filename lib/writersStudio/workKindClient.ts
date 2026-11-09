import { apiFetch } from '@/lib/http/apiBase';
import type { WorkKind } from './workKind';

const url = (workId: string) => `/api/sovereign/living-works/${encodeURIComponent(workId)}/kind`;

/** `undefined` = could not be read (say so; never guess). `null` = the writer has not declared a kind. */
export async function getWorkKindClient(workId: string): Promise<WorkKind | null | undefined> {
  try {
    const res = await apiFetch(url(workId));
    if (!res.ok) return undefined;
    return ((await res.json()) as { kind: WorkKind | null }).kind;
  } catch { return undefined; }
}

export async function setWorkKindClient(workId: string, kind: WorkKind | null): Promise<WorkKind | null | undefined> {
  try {
    const res = await apiFetch(url(workId), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }) });
    if (!res.ok) return undefined;
    return ((await res.json()) as { kind: WorkKind | null }).kind;
  } catch { return undefined; }
}
