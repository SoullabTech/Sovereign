import { apiFetch } from '@/lib/http/apiBase';
import { withKeepPosture } from '@/lib/writersStudio/keepPosture';
import type { WholeManuscriptAttentionMap } from '@/lib/writersStudio/studio/attentionMap';

export type PlaceDecision = 'intended' | 'later';
export interface ServerLetter { id: string; draftRevision: number; map: WholeManuscriptAttentionMap; createdAt: string }

/** `undefined` = could not be checked. */
export async function fetchLetter(manuscriptId: string): Promise<{ letter: ServerLetter | null; decisions: Record<string, PlaceDecision> } | undefined> {
  try {
    const res = await apiFetch(`/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/editorial-letter`);
    if (!res.ok) return undefined;
    return await res.json() as { letter: ServerLetter | null; decisions: Record<string, PlaceDecision> };
  } catch { return undefined; }
}

/** The writer's own decision. Returns null when kept, else the refusal code. */
export async function postDecision(manuscriptId: string, letterId: string, placeId: string, decision: PlaceDecision | 'cleared'): Promise<string | null> {
  try {
    const res = await apiFetch(`/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/editorial-letter/decisions`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(withKeepPosture({ letterId, placeId, decision })),
    });
    if (res.ok) return null;
    const body = await res.json().catch(() => null) as { refusal?: string; error?: string } | null;
    return body?.refusal ?? body?.error ?? `http_${res.status}`;
  } catch { return 'unreachable'; }
}

/** Pure: the kept letter's pass, when it is of this Work and this exact draft revision; otherwise null (a stale letter is not "ready"). */
export function keptPassFor(letter: ServerLetter | null, manuscriptId: string, draftRevision: number | null): WholeManuscriptAttentionMap | null {
  if (!letter || draftRevision === null || letter.draftRevision !== draftRevision) return null;
  if (letter.map?.manuscriptId !== manuscriptId) return null;
  return letter.map;
}
