/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 — THE DISCUSS LAYER (pure).
 *
 * The live host's contextual layer: it turns an ephemeral Discuss state into
 * the pure `ContextualMaiaPanel`, applying the two safety laws on the way in.
 *
 *   LATE RESULT   the layer renders NOTHING unless the commissioning section
 *                 is the one in focus. A response never appears on another
 *                 section and never reopens a released panel.
 *   CHANGED PASSAGE   before an answered response renders as attached, the
 *                 thread's locus must occur exactly once in the LIVE body.
 *                 Otherwise: stale copy, no highlight, no re-anchor, no re-read.
 *
 * ⛔ Pure. No hooks, no fetch, no state. ⛔ Discuss only: one tab, no
 * Apply / Undo / Revise / Reason / Teach / coverage, and no composer once a
 * turn has been answered — the act is one turn.
 */

import * as React from 'react';
import { ContextualMaiaPanel } from '../flagship/ContextualMaiaPanel';
import { DISCUSS_COPY, resolveAttachment, type DiscussHeld } from './discussAct';

export type DiscussState =
  | { readonly kind: 'composing'; readonly held: DiscussHeld }
  | { readonly kind: 'pending'; readonly held: DiscussHeld; readonly ask: string; readonly gen: number }
  | { readonly kind: 'answered'; readonly held: DiscussHeld; readonly ask: string; readonly threadId: string; readonly locusText: string; readonly reply: string }
  | { readonly kind: 'refused'; readonly held: DiscussHeld; readonly ask: string; readonly copy: string };

export const DISCUSS_TABS: readonly string[] = ['Discuss'];

export interface DiscussLayerProps {
  readonly discuss: DiscussState | null;
  readonly focusSectionId: string | null;
  /** The LIVE body of a section, from the writing session. */
  readonly liveBodyOf: (sectionId: string) => string;
  readonly onSubmit: (text: string) => void;
  readonly onRelease: () => void;
}

/** ⭐ The one-shot composer. Uncontrolled: the member's exact text is read at Submit. */
function Composer({ onSubmit }: { onSubmit: (text: string) => void }) {
  return (
    <form
      className="fs-mcompose"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onSubmit(String(data.get('ask') ?? ''));
      }}
    >
      <textarea name="ask" className="fs-mtext" rows={3} aria-label="Your question about this passage"
        placeholder="Ask MAIA about this passage…" />
      <button type="submit" className="fs-btn fs-btn--key" data-event="SUBMIT_ASK">Ask</button>
    </form>
  );
}

/** Which highlight the section should carry while a Discuss is open, or `undefined` to leave the selection alone. */
export function discussHighlight(
  discuss: DiscussState | null, liveBodyOf: (sectionId: string) => string,
): { sectionId: string; range: { start: number; end: number } | null } | undefined {
  if (!discuss || discuss.kind !== 'answered') return undefined;
  const at = resolveAttachment(liveBodyOf(discuss.held.sectionId), discuss.locusText);
  return { sectionId: discuss.held.sectionId, range: at.kind === 'attached' ? { start: at.start, end: at.end } : null };
}

export function DiscussLayer({ discuss, focusSectionId, liveBodyOf, onSubmit, onRelease }: DiscussLayerProps) {
  if (!discuss) return null;
  /* LATE RESULT / MOVED SECTION — bound to the commissioning section. */
  if (discuss.held.sectionId !== focusSectionId) return null;
  const heldEcho = discuss.held.text;

  if (discuss.kind === 'composing') {
    return (
      <ContextualMaiaPanel state="composing" heldEcho={heldEcho} tabs={DISCUSS_TABS} activeTab="Discuss"
        composer={<Composer onSubmit={onSubmit} />} onRelease={onRelease} />
    );
  }
  if (discuss.kind === 'pending') {
    return (
      <ContextualMaiaPanel state="pending" heldEcho={heldEcho} memberAsk={discuss.ask} tabs={DISCUSS_TABS} activeTab="Discuss"
        message={{ text: DISCUSS_COPY.waiting, speaker: 'studio' }} onRelease={onRelease} />
    );
  }
  if (discuss.kind === 'refused') {
    return (
      <ContextualMaiaPanel state="refused" heldEcho={heldEcho} memberAsk={discuss.ask} tabs={DISCUSS_TABS} activeTab="Discuss"
        message={{ text: discuss.copy, speaker: 'studio' }} onRelease={onRelease} />
    );
  }
  /* answered — CHANGED PASSAGE law decides attached vs stale */
  const at = resolveAttachment(liveBodyOf(discuss.held.sectionId), discuss.locusText);
  const trail = at.kind === 'stale'
    ? <p className="fs-say" data-notice="true" data-stale-context="true">{DISCUSS_COPY.stale}</p>
    : undefined;
  return (
    <ContextualMaiaPanel state={at.kind === 'attached' ? 'answered' : 'answered-stale'} heldEcho={heldEcho}
      memberAsk={discuss.ask} tabs={DISCUSS_TABS} activeTab="Discuss"
      message={{ text: discuss.reply, speaker: 'maia' }} onRelease={onRelease}
      supplemental={trail ? { trail } : undefined} />
  );
}
