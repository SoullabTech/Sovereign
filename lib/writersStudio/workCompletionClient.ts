import { apiFetch } from '@/lib/http/apiBase';
import type { CompletionDimension, CompletionDimensionId } from './workCompletion';

export async function loadCompletionDimensions(manuscriptId: string): Promise<
  | { ok: true; dimensions: readonly CompletionDimension[] }
  | { ok: false; refusal: string }
> {
  try {
    const response = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/completion`,
      { method: 'GET', cache: 'no-store' },
    );
    const body = await response.json().catch(() => null) as { dimensions?: CompletionDimension[]; refusal?: string } | null;
    if (!response.ok || !Array.isArray(body?.dimensions)) {
      return { ok: false, refusal: body?.refusal ?? 'unavailable' };
    }
    return { ok: true, dimensions: body.dimensions };
  } catch {
    return { ok: false, refusal: 'unavailable' };
  }
}

export async function adjudicateCompletionDimension(input: {
  manuscriptId: string;
  dimension: CompletionDimensionId;
  standing: 'clear' | 'open' | 'blocked';
  note?: string;
}): Promise<
  | { ok: true; dimension: CompletionDimension }
  | { ok: false; refusal: string }
> {
  try {
    const response = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(input.manuscriptId)}/completion`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimension: input.dimension,
          standing: input.standing,
          ...(input.note?.trim() ? { note: input.note.trim() } : {}),
        }),
      },
    );
    const body = await response.json().catch(() => null) as { dimension?: CompletionDimension; refusal?: string } | null;
    if (!response.ok || !body?.dimension) {
      return { ok: false, refusal: body?.refusal ?? 'unavailable' };
    }
    return { ok: true, dimension: body.dimension };
  } catch {
    return { ok: false, refusal: 'unavailable' };
  }
}
