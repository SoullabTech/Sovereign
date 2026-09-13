'use client';

/**
 * EDITORIAL-WRITE-01A — what the writer sees before the Work changes.
 *
 * ⭐⭐ THIS IS THE CONSENT SURFACE, and it is deliberately tiny. Everything the
 * member needs to authorize ONE deletion, and nothing that could be mistaken for
 * an editor.
 *
 * ── ⛔ WHAT THIS COMPONENT MAY NOT DO ─────────────────────────────────────
 *
 * ⛔ It holds no replacement text, no target, no version — nothing that could
 * be sent as write authority. The accept request carries an id in the path and
 * an EMPTY BODY. If the browser could supply the edit, "accept this proposal"
 * would become "write whatever this request says".
 *
 * ⛔ It never computes an alternative. When the proposal no longer matches the
 * Work, the gesture is simply not offered — the surface does not regenerate an
 * equivalent change, because permission for one exact change is not permission
 * to achieve the same intention another way.
 *
 * ⛔ And `Keep unchanged` is a real answer, not a dismissal: it is the state the
 * Work is already in, and choosing it costs the writer nothing.
 */

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { SANS } from './studioTheme';

/**
 * ⭐⭐ EW-F1 · NO MANUSCRIPT PROSE LIVES HERE. Coordinates and a decision.
 * The Work shows what is changing; this panel says what is being asked.
 */
interface StagedChange {
  sectionLabel: string;
  sectionId: string;
  range: { space: string; start: number; end: number };
  operation: 'delete_exact_text';
  changeCount: number;
}

export type ProposalPreview =
  | { state: 'acceptable'; proposalId: string; change: StagedChange }
  | { state: 'already_accepted'; proposalId: string; resultingVersion: number }
  | { state: 'no_longer_matches'; proposalId: string; reason: string };

/** ⛔ The ONE state in which the gesture exists at all. */
const mayAccept = (p: ProposalPreview) => p.state === 'acceptable';

/**
 * ⭐ The writer's language, not the system's. `stale_base` is true and useless;
 * what the writer needs to know is that the Work moved under the proposal.
 */
const WHY: Record<string, string> = {
  stale_base: 'Your manuscript has changed since this was prepared, so it no longer describes an exact change.',
  expected_text_absent: 'The text this would remove is no longer there.',
  expected_text_ambiguous: 'That text now appears more than once, so this no longer names one exact place.',
  section_not_found: 'That section is no longer in your working draft.',
  section_not_projectable: 'This cut cannot read that section’s shape.',
  draft_not_found: 'That working draft could not be found.',
};

export default function ProposedChange(
  { preview, onAccepted, onDismiss, onShowChange }: {
    preview: ProposalPreview;
    onAccepted?: (version: number) => void;
    /**
     * ⭐ `Keep unchanged` is LOCAL ONLY in this cut. It closes the surface,
     * writes nothing, and changes no proposal state.
     *
     * ⛔ Durable rejection — "this proposal was declined" as history — is a
     * different thing and needs its own ruling. It is not smuggled in here
     * because a button happened to need a handler.
     */
    onDismiss?: () => void;
    /**
     * ⭐ EW-F1/F1-5 · return attention to the marked passage.
     *
     * The view is moved ONCE when the proposal arrives. If the writer then
     * reads elsewhere they are not snapped back — being dragged around your own
     * manuscript is its own kind of dispossession — so this brings them back
     * when THEY ask.
     */
    onShowChange?: () => void;
  },
) {
  const [state, setState] = useState<'idle' | 'accepting' | 'accepted' | 'refused'>('idle');
  const [refusal, setRefusal] = useState<string | null>(null);

  async function accept() {
    if (state !== 'idle') return;
    setState('accepting');
    try {
      /* ⛔ NO BODY. The id is in the path; identity is the session's. There is
         nothing here for an edit to travel in. */
      const res = await apiFetch(
        `/api/writers-studio/revision-proposal/${preview.proposalId}/accept`,
        { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body?.accepted) {
        setState('accepted');
        onAccepted?.(body.resultingVersion);
      } else {
        setRefusal(WHY[body?.reason] ?? 'This change could not be made.');
        setState('refused');
      }
    } catch {
      setRefusal('This change could not be made.');
      setState('refused');
    }
  }

  if (preview.state === 'already_accepted' || state === 'accepted') {
    const v = preview.state === 'already_accepted' ? preview.resultingVersion : null;
    return (
      <section style={wrap}>
        <h2 style={title}>Change accepted</h2>
        <p style={line}>
          Your manuscript{v ? ` is at version ${v}` : ' has been updated'}. This
          proposal has been used and cannot be applied again.
        </p>
      </section>
    );
  }

  if (preview.state === 'no_longer_matches') {
    return (
      <section style={wrap}>
        <h2 style={title}>This no longer matches your manuscript</h2>
        <p style={line}>{WHY[preview.reason] ?? 'This no longer describes an exact change.'}</p>
        {/* ⛔ No retry, no "fix it for me". A new proposal is a new act. */}
        <p style={{ ...line, opacity: 0.7 }}>Nothing has been changed.</p>
      </section>
    );
  }

  const { change } = preview;
  return (
    <section style={wrap}>
      <h2 style={title}>Proposed change</h2>
      <p style={{ ...line, opacity: 0.8 }}>{change.sectionLabel}</p>

      {/* ⭐ What kind of change, not what it says. The passage itself is
          marked in the manuscript beside this, where the writer can read it
          at reading width with everything they authored around it. */}
      <p style={{ ...line, marginTop: 16 }}>Remove one exact passage.</p>

      <button type="button" onClick={() => onShowChange?.()} style={{ ...quiet, marginTop: 14 }}>
        Show change
      </button>

      <p style={{ ...line, marginTop: 18 }}>
        This will make {change.changeCount} change
        {change.changeCount === 1 ? '' : 's'} to the manuscript.
      </p>

      {state === 'refused' && <p style={{ ...line, color: '#C97B5A' }}>{refusal}</p>}

      <div style={{ display: 'flex', gap: 14, marginTop: 22, flexWrap: 'wrap' }}>
        {/* ⭐ The unchanged Work is the default, and it is named as a choice. */}
        <button
          type="button"
          onClick={() => onDismiss?.()}
          style={quiet}
          disabled={state === 'accepting'}
        >
          Keep unchanged
        </button>
        <button
          type="button"
          onClick={accept}
          disabled={!mayAccept(preview) || state === 'accepting'}
          style={loud}
        >
          {state === 'accepting' ? 'ACCEPTING…' : 'ACCEPT CHANGES'}
        </button>
      </div>
    </section>
  );
}

const wrap: React.CSSProperties = {
  padding: '22px 24px', border: '1px solid rgba(232,224,213,0.18)',
  borderRadius: 3, background: 'rgba(20,17,15,0.5)', maxWidth: 720,
};
const title: React.CSSProperties = {
  font: `500 13px/1.4 ${SANS}`, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: '#E8E0D5', margin: 0,
};
const line: React.CSSProperties = {
  font: `400 14px/1.6 ${SANS}`, color: '#E8E0D5', margin: '10px 0 0',
};
const quiet: React.CSSProperties = {
  font: `500 12px/1 ${SANS}`, letterSpacing: '0.1em', textTransform: 'uppercase',
  padding: '11px 18px', color: 'rgba(232,224,213,0.75)', background: 'transparent',
  border: '1px solid rgba(232,224,213,0.22)', borderRadius: 2, cursor: 'pointer',
};
const loud: React.CSSProperties = {
  ...quiet, color: '#14110F', background: '#E8E0D5', borderColor: '#E8E0D5',
};
