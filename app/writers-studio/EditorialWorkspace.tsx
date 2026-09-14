'use client';

/**
 * W3 — THE EDITORIAL WORKSPACE. The first surface the writer actually meets.
 *
 * ⭐⭐ It assembles two already-proved objects beside the already-proved
 * manuscript participation, and adds no third source of editorial truth:
 *
 *     EditorialThread   W1 · read-only lineage, authorship, exact focus
 *     VersionComposer   W2 · member wording only
 *
 * ⛔ IT CREATES NO SECOND PROPOSAL IDENTITY. Its subject arrives already
 * resolved — see `workspaceSubject` — so the raw query parameters are not
 * readable from here even in principle.
 *
 * ⛔ NO MAIA CONVERSATION (W4, and unlawful before W5). NO AUTHORIZATION, NO
 * DECISION CONTROL (W6). NO SECOND DIFF, EXCERPT OR LOCUS FINDER — the
 * manuscript seams already own all three.
 *
 * ── ⭐ TWO READS, NEITHER SUBSTITUTING FOR THE OTHER ───────────────────────
 *
 *     write-state target   establishes that this chain belongs in THIS room
 *     chain GET            supplies the lineage
 */

import { useCallback, useEffect, useState } from 'react';
import { EditorialThread } from './EditorialThread';
import { VersionComposer } from './VersionComposer';
import { afterAppend } from '@/lib/writersStudio/editorialWorkspace';
import type { ThreadInput } from '@/lib/writersStudio/editorialThread';

type Phase = 'loading' | 'ready' | 'error';

export function EditorialWorkspace({
  chainId, versionId, apiFetch, onFocusVersion, onWorkChanged,
}: {
  chainId: string;
  /** ⭐ The EXACT focused version, resolved by the server. ⛔ Never the head. */
  versionId: string;
  apiFetch: (url: string, init?: RequestInit) => Promise<Response>;
  /** Hands the new subject identity up; the room re-resolves from it. */
  onFocusVersion: (versionId: string) => void;
  /** The Work must be re-read because the focused formulation changed. */
  onWorkChanged: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [chain, setChain] = useState<ThreadInput | null>(null);
  /** Bumped to re-read the lineage without changing the subject. */
  const [lineageToken, setLineageToken] = useState(0);

  useEffect(() => {
    let live = true;
    setPhase('loading');
    (async () => {
      try {
        const res = await apiFetch(
          `/api/writers-studio/proposal-chains/${encodeURIComponent(chainId)}`
          + `?version=${encodeURIComponent(versionId)}`);
        if (!live) return;
        if (!res.ok) { setPhase('error'); return; }
        setChain((await res.json()) as ThreadInput);
        setPhase('ready');
      } catch { if (live) setPhase('error'); }
    })();
    return () => { live = false; };
  }, [chainId, versionId, lineageToken, apiFetch]);

  const submit = useCallback(async (
    input: { supersedes: string; replacementText: string },
  ) => {
    let outcome: Parameters<typeof afterAppend>[0];
    try {
      const res = await apiFetch(
        `/api/writers-studio/proposal-chains/${encodeURIComponent(chainId)}/versions`,
        { method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input) });
      if (res.status === 201) {
        /* ⭐ ONLY THE IDENTITY is taken from the response. ⛔ The body is never
           spliced into the thread: the screen agrees with storage. */
        const { id } = (await res.json()) as { id: string };
        outcome = { status: 'appended', versionId: id };
      } else {
        const b = await res.json().catch(() => ({}));
        outcome = { status: 'refused', reason: (b as { reason?: string }).reason ?? 'refused' };
      }
    } catch { outcome = { status: 'refused', reason: 'unreachable' }; }

    const next = afterAppend(outcome);
    /* ⭐ On refusal the lineage is re-read so the writer can SEE that the
       exchange moved — ⛔ and the focus, the composer's predecessor and their
       unsaved words are all left exactly as they were. */
    if (next.rereadLineage) setLineageToken((n) => n + 1);
    if (next.rereadWriteState) onWorkChanged();
    if (next.refocusTo !== null) onFocusVersion(next.refocusTo);

    return outcome.status === 'appended'
      ? { ok: true as const }
      : { ok: false as const, reason: outcome.reason };
  }, [chainId, apiFetch, onFocusVersion, onWorkChanged]);

  if (phase !== 'ready' || !chain) {
    return (
      <div style={{ padding: '20px 0', fontSize: 14, color: 'rgba(255,255,255,0.52)' }}>
        {phase === 'error'
          ? 'This exchange could not be read.'
          : 'Reading this exchange…'}
      </div>
    );
  }

  /* The focused version, for the composer's predecessor and its label. ⛔ Read
     from the lineage the server returned — never chosen as "the last one". */
  const idx = chain.versions.findIndex((v) => v.id === chain.focusedVersionId);
  const focused = idx >= 0 ? chain.versions[idx] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <EditorialThread chain={chain} />
      {focused && (
        /* ⭐ KEYED BY THE FOCUSED VERSION. When a new version becomes the
           subject, the composer is a new component and the old draft goes with
           it — ⛔ rather than an imperative "clear the textarea", which would
           also have fired on paths where the draft must survive. */
        <VersionComposer
          key={focused.id}
          target={{ versionId: focused.id, author: focused.author, ordinal: idx + 1 }}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
