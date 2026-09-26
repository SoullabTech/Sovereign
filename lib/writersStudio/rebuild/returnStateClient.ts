import { apiFetch } from '@/lib/http/apiBase';

export interface ReturnScopeClient {
  readonly livingWorkId: string;
  readonly manuscriptId: string;
}

type ReadRelationshipReturn = { ok: true; relationshipId: string | null } | { ok: false };
type ReadPlaceReturn = { ok: true; sectionId: string | null } | { ok: false };

function q(scope: ReturnScopeClient): string {
  return `livingWorkId=${encodeURIComponent(scope.livingWorkId)}&manuscriptId=${encodeURIComponent(scope.manuscriptId)}`;
}

export async function readRelationshipReturnClient(scope: ReturnScopeClient): Promise<ReadRelationshipReturn> {
  try {
    const r = await apiFetch(`/api/writers-studio/return/relationship?${q(scope)}`);
    if (!r.ok) return { ok: false };
    const body = await r.json().catch(() => null);
    return { ok: true, relationshipId: typeof body?.relationshipId === 'string' ? body.relationshipId : null };
  } catch { return { ok: false }; }
}

export async function writeRelationshipReturnClient(
  scope: ReturnScopeClient, relationshipId: string,
): Promise<boolean> {
  try {
    const r = await apiFetch('/api/writers-studio/return/relationship', {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...scope, relationshipId }),
    });
    return r.ok;
  } catch { return false; }
}

export async function clearRelationshipReturnClient(scope: ReturnScopeClient): Promise<boolean> {
  try {
    const r = await apiFetch(`/api/writers-studio/return/relationship?${q(scope)}`, { method: 'DELETE' });
    return r.ok;
  } catch { return false; }
}

export async function readPlaceReturnClient(scope: ReturnScopeClient): Promise<ReadPlaceReturn> {
  try {
    const r = await apiFetch(`/api/writers-studio/return/place?${q(scope)}`);
    if (!r.ok) return { ok: false };
    const body = await r.json().catch(() => null);
    return { ok: true, sectionId: typeof body?.sectionId === 'string' ? body.sectionId : null };
  } catch { return { ok: false }; }
}

async function writePlaceReturnClient(scope: ReturnScopeClient, draftSectionId: string): Promise<boolean> {
  try {
    const r = await apiFetch('/api/writers-studio/return/place', {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...scope, draftSectionId }), keepalive: true,
    });
    return r.ok;
  } catch { return false; }
}

const placeQueues = new Map<string, Promise<boolean>>();

/** Serialize writes per Work/manuscript so an older request cannot finish after a newer one. */
export function persistPlaceReturnOrdered(scope: ReturnScopeClient, draftSectionId: string): Promise<boolean> {
  const key = `${scope.livingWorkId}:${scope.manuscriptId}`;
  const previous = placeQueues.get(key) ?? Promise.resolve(true);
  const next = previous.catch(() => false).then(() => writePlaceReturnClient(scope, draftSectionId));
  placeQueues.set(key, next);
  void next.finally(() => { if (placeQueues.get(key) === next) placeQueues.delete(key); });
  return next;
}
