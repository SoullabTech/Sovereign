import { apiFetch } from '@/lib/http/apiBase';
import type { ChapterLineageScan } from './intellectualLineageChapter';

export type ChapterLineageResult =
  | { ok: true; scan: ChapterLineageScan }
  | { ok: false; refusal: string };

export async function requestChapterLineageScan(
  manuscriptId: string,
  chapterRootId: string,
): Promise<ChapterLineageResult> {
  try {
    const response = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/lineage-chapter`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chapterRootId }),
      },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.scan) {
      return {
        ok: false,
        refusal: typeof body?.error === 'string' ? body.error : `http_${response.status}`,
      };
    }
    return { ok: true, scan: body.scan as ChapterLineageScan };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
