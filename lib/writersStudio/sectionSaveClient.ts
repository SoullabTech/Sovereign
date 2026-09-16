import { apiFetch } from '@/lib/http/apiBase';
import type { SaveFn } from './sectionSaveQueue';

/**
 * The one section-save transport used by every Writer's Studio surface.
 *
 * The browser names one draft section, its body snapshot, and the latest
 * server-acknowledged draft version. It never sends the whole manuscript.
 */
export function makeSectionSave(manuscriptId: string, witnessDelayMs?: number): SaveFn {
  return async (sectionId, body, baseVersion) => {
    const q = witnessDelayMs ? `?witnessDelayMs=${witnessDelayMs}` : '';
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${manuscriptId}/sections/${sectionId}${q}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, baseVersion }),
      },
    );
    if (res.ok) {
      const data = await res.json();
      return { ok: true, version: data.version };
    }
    if (res.status === 409) return { ok: false, refusal: 'stale_base' };
    return { ok: false, refusal: 'error' };
  };
}
