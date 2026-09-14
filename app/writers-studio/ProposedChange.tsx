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
  | {
      state: 'acceptable'; proposalId: string; change: StagedChange;
      executionAuthority: 'inspection_only' | 'member_acceptance';
    }
  | { state: 'already_accepted'; proposalId: string; resultingVersion: number }
  | { state: 'no_longer_matches'; proposalId: string; reason: string };

/**
 * ⛔ THE ONE STATE IN WHICH THE GESTURE EXISTS AT ALL.
 *
 * ⭐⭐ EW-F1a WIDENED THIS, AND THE WIDENING IS THE POINT. `acceptable` means
 * the change still FITS the Work. It never meant the proposal was ALLOWED to
 * make it — and those were the same question until a proposal staged for
 * inspection was accepted twice on 2026-09-13, the second with no authorial
 * act anywhere in the record.
 *
 * ⛔ AND THIS IS NOT THE PROTECTION. It is the third of three independent
 * refusals — the control is absent here, `acceptRevision` refuses at the
 * boundary that writes, and `mrp_inspection_only_never_accepted` makes an
 * accepted inspection-only row unrepresentable. A UI that hides a button is a
 * courtesy; only the other two are constraints.
 */
const mayAccept = (p: ProposalPreview) =>
  p.state === 'acceptable' && p.executionAuthority === 'member_acceptance';

/** Staged for looking at. Say so, rather than showing a dead control. */
const isInspectionOnly = (p: ProposalPreview) =>
  p.state === 'acceptable' && p.executionAuthority === 'inspection_only';

/**
 * ⭐ The writer's language, not the system's. `stale_base` is true and useless;
 * what the writer needs to know is that the Work moved under the proposal.
 */
const WHY: Record<string, string> = {
  /* ⭐ Not "could not be made" — nothing about the Work refused it. */
  inspection_only:
    'This proposal was staged for inspection and cannot be applied to your manuscript.',
  stale_base: 'Your manuscript has changed since this was prepared, so it no longer describes an exact change.',
  expected_text_absent: 'The text this would remove is no longer there.',
  expected_text_ambiguous: 'That text now appears more than once, so this no longer names one exact place.',
  section_not_found: 'That section is no longer in your working draft.',
  section_not_projectable: 'This cut cannot read that section’s shape.',
  draft_not_found: 'That working draft could not be found.',
};

export default function ProposedChange(
  { preview, comparison, onAccepted, onDismiss, onShowChange, showChangeNotice }: {
    /**
     * ⭐⭐ THE AFFECTED SENTENCE, CURRENT AND AS IT WOULD READ.
     *
     * ⛔ DERIVED IN THE ROOM FROM THE SAME resolved body + range + replacement
     * that governs the in-place mark, never searched for again here. The
     * founder's law: "there cannot be one locus in the Work and another in the
     * panel." One computation, two surfaces.
     *
     * ⚠️ THIS IS A NARROWING OF EW-F1, NOT A REVERSAL. That rule — no
     * manuscript prose in the panel — was written against a 140-code-point
     * window cut mid-word, standing in for a Work the writer could not see.
     * The Work now renders the full section with the locus marked; this is one
     * sentence beside it, and the founder ruled it back in because the
     * comparison aid was what got lost.
     */
    comparison?: { current: string; wouldRead: string } | null;
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
    /** C10 · result of this proposal panel's own orientation request. */
    showChangeNotice?: string | null;
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
      {/* ⭐⭐ NO AUTHOR IS NAMED, BECAUSE THIS PROPOSAL HAS NONE.
          FOUNDER-CAUGHT, AND LOAD-BEARING. A first draft of this repair read
          `MAIA · CHANGE` and "She's suggesting a change here". MAIA did not
          author `, fixated` — it was staged mechanically as a witness fixture.
          Attributing it to her would create FALSE PROVENANCE at the exact
          surface whose job is making authorship legible.

          ⭐ When a proposal version carries `author = maia`, this header can
          truthfully become `MAIA · CHANGE` and her own words can carry the
          proposition. Until then it says what is true: a proposal exists, and
          nobody has signed it. */}
      <h2 style={title}>
        Proposed change{isInspectionOnly(preview) ? ' · inspection' : ''}
      </h2>
      <p style={{ ...line, opacity: 0.8 }}>{change.sectionLabel}</p>

      {/* ⭐⭐ HER WORDS, NOT AN OPERATION NAME.

          FOUNDER-CAUGHT: "all I see is fixated crossed out. I don't know what
          is going on." This read "Remove one exact passage. / It describes 1
          change." — an authorization receipt masquerading as an editorial
          relationship. It told the writer which operation was staged and never
          what was being proposed or by whom.

          ⛔ AND STILL NO MANUSCRIPT PROSE HERE. EW-F1 put the passage in the
          Work, at reading width, with everything the writer authored around
          it. That holds: this panel says what is being asked; the Work shows
          what is changing. */}
      {/* ⛔ RETIRED: "Remove one exact passage." and "It describes 1 change to
          the manuscript." Machine-state sentences — they named the operation
          staged and never what was being proposed. The founder's reading of the
          result: "all I see is fixated crossed out. I don't know what is going
          on." */}
      <p style={{ ...line, marginTop: 16 }}>
        This proposal removes a short phrase from {change.sectionLabel}.
      </p>

      {comparison && (
        <div style={{ marginTop: 16 }}>
          <p style={{ ...line, opacity: 0.6, marginTop: 10 }}>Current</p>
          <p style={{ ...line, marginTop: 4 }}>{comparison.current}</p>
          <p style={{ ...line, opacity: 0.6, marginTop: 14 }}>Would read</p>
          <p style={{ ...line, marginTop: 4 }}>{comparison.wouldRead}</p>
        </div>
      )}

      <button type="button" onClick={() => onShowChange?.()} style={{ ...quiet, marginTop: 14 }}>
        Show me where
      </button>
      {showChangeNotice && (
        <p role="status" data-show-change-notice style={{ ...line, marginTop: 10, opacity: 0.8 }}>
          {showChangeNotice}
        </p>
      )}


      {/* ⭐⭐ THE MISSING WHY IS SAID, NOT LEFT TO BE ASSUMED.
          A rationale is AUTHORED content and needs the succession chain to
          record who wrote it. Until that exists, inventing one would be putting
          words in her mouth — the one thing that must not happen in a surface
          whose entire job is telling the writer truthfully what is being asked.
          So the absence is stated. ⛔ Do not replace this with generated
          reasoning before step 3. */}
      <p style={{ ...line, opacity: 0.7, marginTop: 18 }}>
        No rationale is attached to this proposal.
      </p>

      {/* ⭐⭐ EW-F1a · SAY WHAT THIS PROPOSAL IS FOR, rather than showing a dead
          control. A greyed-out ACCEPT still asserts that accepting is the thing
          you would do here; an absent one, with a sentence, says what is
          actually true — this was staged to be looked at. */}
      {isInspectionOnly(preview) && (
        <p style={line}>
          This proposal is for inspection. It cannot be applied to your
          manuscript, and no control here will apply it.
        </p>
      )}

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
        {/* ⛔ ABSENT, NOT DISABLED. A disabled control is still a control: it
            keeps its place in the layout, it is still the thing the eye lands
            on, and it is one defect away from being live. On 2026-09-13 a
            proposal staged for inspection was accepted twice — the second time
            with no authorial act anywhere in the record — while the button sat
            enabled beside everything else the writer was doing. The gesture
            that cannot be performed does not appear. */}
        {mayAccept(preview) && (
          <button
            type="button"
            onClick={accept}
            disabled={state === 'accepting'}
            style={loud}
          >
            {state === 'accepting' ? 'ACCEPTING…' : 'ACCEPT CHANGES'}
          </button>
        )}
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
