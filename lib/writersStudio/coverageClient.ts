import { apiFetch } from '@/lib/http/apiBase';
import type { CoverageMap } from '@/lib/manuscript/development/coverageMap';

/** What MAIA has read of this book. `undefined` = could not be checked; `null` = the draft is not established. */
export async function fetchCoverage(manuscriptId: string): Promise<CoverageMap | null | undefined> {
  try {
    const res = await apiFetch(`/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/coverage`);
    if (res.status === 409) return null;
    if (!res.ok) return undefined;
    return ((await res.json()) as { coverage: CoverageMap }).coverage;
  } catch { return undefined; }
}
