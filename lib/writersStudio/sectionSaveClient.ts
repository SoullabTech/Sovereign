import { apiFetch } from '@/lib/http/apiBase';
import type { SaveFn } from './sectionSaveQueue';

/**
 * A1-LS1 · R4 — the request budget under which a save may ride `keepalive`.
 *
 * Browsers cap the combined size of in-flight keepalive request bodies (the
 * Fetch standard's limit is 64 KiB). This threshold is deliberately below that
 * so headers and a concurrent request cannot tip a departure save over the
 * edge. It is an implementation margin, not a law: the law is that when a
 * departure save cannot be sent this way, nothing claims it was — the section
 * stays unacknowledged and the leave-guard stays armed.
 */
export const KEEPALIVE_BODY_BUDGET_BYTES = 48 * 1024;

export interface SectionSaveOptions {
  /**
   * Send every save that fits the budget with `keepalive`, so a save
   * dispatched as the page is leaving can outlive the page. A save that does
   * not fit is sent normally and may be cut off by the departure; it is never
   * reported as persisted unless the server acknowledges it.
   */
  keepalive?: boolean;
}

/**
 * The one section-save transport used by every Writer's Studio surface.
 *
 * The browser names one draft section, its body snapshot, and the latest
 * server-acknowledged draft version. It never sends the whole manuscript.
 */
export function makeSectionSave(
  manuscriptId: string, witnessDelayMs?: number, options: SectionSaveOptions = {},
): (sectionId: string, body: string, baseVersion: number, observedBodySha256?: string | null) => ReturnType<SaveFn> {
  return async (sectionId, body, baseVersion, observedBodySha256) => {
    const q = witnessDelayMs ? `?witnessDelayMs=${witnessDelayMs}` : '';
    /* A1-LS1 · R3 — the observed-body digest travels only when the caller has
       one. Without it the server applies the draft-version rule alone. */
    const payload = JSON.stringify(observedBodySha256 ? { body, baseVersion, observedBodySha256 } : { body, baseVersion });
    const keepalive = options.keepalive === true
      && new TextEncoder().encode(payload).length <= KEEPALIVE_BODY_BUDGET_BYTES;
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${manuscriptId}/sections/${sectionId}${q}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        ...(keepalive ? { keepalive: true } : {}),
      },
    );
    if (res.ok) {
      const data = await res.json();
      return {
        ok: true,
        version: data.version,
        /* A1-LS1 · R3 — a save admitted only because THIS section's body was
           unchanged lands on a draft that moved elsewhere: its version is not
           one this client has seen in full, so it must not become the base. */
        advancesVersion: data.acceptedBy !== 'observed_body',
        ...(typeof data.observedBodySha256 === 'string' ? { observedBodySha256: data.observedBodySha256 } : {}),
      };
    }
    if (res.status === 409) return { ok: false, refusal: 'stale_base' };
    return { ok: false, refusal: 'error' };
  };
}
