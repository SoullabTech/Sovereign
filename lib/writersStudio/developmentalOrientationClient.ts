import { apiFetch } from '@/lib/http/apiBase';
import type { DevelopmentalOrientation } from './developmentalOrientation';

export type DevelopmentalOrientationResult =
  | { ok: true; orientation: DevelopmentalOrientation }
  | { ok: false; refusal: string };

export async function requestDevelopmentalOrientation(
  manuscriptId: string,
): Promise<DevelopmentalOrientationResult> {
  try {
    const response = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/developmental-orientation`,
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
    return { ok: true, orientation: body.orientation as DevelopmentalOrientation };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
