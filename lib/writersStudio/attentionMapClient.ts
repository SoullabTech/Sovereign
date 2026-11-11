import { apiFetch } from '@/lib/http/apiBase';
import { withKeepPosture } from '@/lib/writersStudio/keepPosture';
import type { WholeManuscriptAttentionMap } from './studio/attentionMap';

export type AttentionMapOutcome =
  | { ok: true; map: WholeManuscriptAttentionMap; letterId?: string | null; letterKept?: string }
  | { ok: false; refusal: string };

export async function requestAttentionMap(
  manuscriptId: string,
  readingIds: readonly string[],
  request: string,
  /** keep a whole-book pass as MAIA's letter for this Work (refused in Sanctuary; the pass is still returned) */
  opts: { keepAsLetter?: boolean } = {},
): Promise<AttentionMapOutcome> {
  try {
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/attention-map`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(opts.keepAsLetter ? withKeepPosture({ readingIds, request, keepAsLetter: true }) : { readingIds, request }),
      },
    );
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.map) {
      return { ok: false, refusal: typeof body?.error === 'string' ? body.error : `http_${res.status}` };
    }
    return { ok: true, map: body.map as WholeManuscriptAttentionMap, letterId: typeof body.letterId === 'string' ? body.letterId : null, letterKept: typeof body.letterKept === 'string' ? body.letterKept : undefined };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
