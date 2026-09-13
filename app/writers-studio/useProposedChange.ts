'use client';

/**
 * EDITORIAL-WRITE-01A — the narrow witness mount.
 *
 * ⭐ ONE PROPOSAL ENTERING THE EXISTING WORKSPACE. Not a proposal inbox, not a
 * new Studio mode, not a generic "Changes" system. The Canvas is pointed at a
 * proposal by id and shows it beside the Work it would change.
 *
 * ── ⛔ THE POST-ACCEPTANCE LAW ────────────────────────────────────────────
 *
 *   After ACCEPT CHANGES, the UI rereads the Work FROM THE WORK.
 *
 * ⛔ The displayed manuscript is never patched from the accept response — which
 * is why that route returns a version and no prose. Patching would make the
 * screen agree with the request rather than with storage, and the member would
 * have no independent confirmation that anything was written.
 *
 * ⭐ SO ACCEPTANCE RELOADS. The Canvas holds several independent data sources
 * (outline, section writing, whole-manuscript surface, write state); refetching
 * some and missing one would show stale prose and read as a failed write. A
 * reload is crude and it is the only form of "reread everything from storage"
 * that cannot be partially wrong here.
 *
 * ⭐⭐ AND THE CONFIRMATION IS ITSELF A REREAD. The proposal id stays in the
 * URL, so after the reload the preview is fetched again and the SERVER reports
 * `already_accepted · version 35`. The member's confirmation comes from the
 * record, not from the reply to their click.
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ProposalPreview } from './ProposedChange';

export type ProposalMount =
  | { readonly state: 'none' }
  | { readonly state: 'loading' }
  /** ⛔ Absent, not this member's, or the surface is not constituted. */
  | { readonly state: 'unavailable' }
  | { readonly state: 'ready'; readonly preview: ProposalPreview };

export function useProposedChange(proposalId: string | null): {
  mount: ProposalMount;
  accepted: (version: number) => void;
  dismiss: () => void;
} {
  const [mount, setMount] = useState<ProposalMount>(
    proposalId ? { state: 'loading' } : { state: 'none' });

  useEffect(() => {
    if (!proposalId) { setMount({ state: 'none' }); return; }
    let cancelled = false;
    setMount({ state: 'loading' });
    (async () => {
      try {
        const res = await apiFetch(
          `/api/writers-studio/revision-proposal/${proposalId}`, { method: 'GET' });
        if (cancelled) return;
        /* ⛔ A 404 is not an empty proposal — it is no proposal. The surface
           does not appear, rather than appearing with nothing in it. */
        if (!res.ok) return setMount({ state: 'unavailable' });
        const preview = (await res.json()) as ProposalPreview;
        if (!cancelled) setMount({ state: 'ready', preview });
      } catch {
        if (!cancelled) setMount({ state: 'unavailable' });
      }
    })();
    return () => { cancelled = true; };
  }, [proposalId]);

  /**
   * ⛔ NOT a local state update. The Work is reread from storage, and the
   * acceptance is confirmed by the server on the way back.
   */
  const accepted = useCallback((_version: number) => {
    void _version;
    if (typeof window !== 'undefined') window.location.reload();
  }, []);

  /** ⭐ Local only. Writes nothing, changes no proposal state. */
  const dismiss = useCallback(() => setMount({ state: 'none' }), []);

  return { mount, accepted, dismiss };
}
