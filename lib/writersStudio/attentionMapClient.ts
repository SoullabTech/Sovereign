import { apiFetch } from '@/lib/http/apiBase';
import { readWorkingStyle } from './workingStyle';
import type { WholeManuscriptAttentionMap } from './studio/attentionMap';

export type AttentionMapOutcome =
  | { ok: true; map: WholeManuscriptAttentionMap }
  | { ok: false; refusal: string };

export async function requestAttentionMap(
  manuscriptId: string,
  readingIds: readonly string[],
  request: string,
  options: { itemCount?: number } = {},
): Promise<AttentionMapOutcome> {
  try {
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/attention-map`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          readingIds,
          request,
          workingStyle: readWorkingStyle(),
          ...(options.itemCount !== undefined ? { itemCount: options.itemCount } : {}),
        }),
      },
    );
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.map) {
      return { ok: false, refusal: typeof body?.error === 'string' ? body.error : `http_${res.status}` };
    }
    return { ok: true, map: body.map as WholeManuscriptAttentionMap };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
