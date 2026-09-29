import { apiFetch } from '@/lib/http/apiBase';
import type { IntellectualLineageOrientation } from './intellectualLineageOrientation';

export type LineageOrientationResult =
  | { ok: true; orientation: IntellectualLineageOrientation; manuscriptState: string | null }
  | { ok: false; refusal: string };

export async function requestIntellectualLineageOrientation(
  manuscriptId: string,
): Promise<LineageOrientationResult> {
  try {
    const response = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/lineage-orientation`,
      { method: 'POST' },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.orientation) {
      return {
        ok: false,
        refusal: typeof body?.error === 'string' ? body.error : `http_${response.status}`,
      };
    }
    return {
      ok: true,
      orientation: body.orientation as IntellectualLineageOrientation,
      manuscriptState: typeof body.manuscriptState === 'string' ? body.manuscriptState : null,
    };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
