import { apiFetch } from '@/lib/http/apiBase';
import type { SourceFieldOrientation } from './sourceFieldOrientation';

export type SourceFieldOrientationResult =
  | { ok: true; orientation: SourceFieldOrientation; coverage: readonly {
      type: 'source-upload' | 'idea';
      id: string;
      coverage: 'full' | 'metadata-only';
    }[] }
  | { ok: false; refusal: string };

export async function requestSourceFieldOrientation(
  workId: string,
): Promise<SourceFieldOrientationResult> {
  try {
    const response = await apiFetch(
      `/api/sovereign/living-works/${encodeURIComponent(workId)}/source-field-orientation`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      },
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
      orientation: body.orientation as SourceFieldOrientation,
      coverage: Array.isArray(body.coverage) ? body.coverage : [],
    };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
