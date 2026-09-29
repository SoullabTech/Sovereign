import { apiFetch } from '@/lib/http/apiBase';
import type { IntellectualLineageScan } from './intellectualLineageScan';

export type LineageScanResult =
  | { ok: true; scan: IntellectualLineageScan; declaredState: string | null }
  | { ok: false; refusal: string };

export async function requestIntellectualLineageScan(
  manuscriptId: string,
): Promise<LineageScanResult> {
  try {
    const response = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/lineage-scan`,
      { method: 'POST' },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.scan) {
      return {
        ok: false,
        refusal: typeof body?.error === 'string' ? body.error : `http_${response.status}`,
      };
    }
    return {
      ok: true,
      scan: body.scan as IntellectualLineageScan,
      declaredState: typeof body.declaredState === 'string' ? body.declaredState : null,
    };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
