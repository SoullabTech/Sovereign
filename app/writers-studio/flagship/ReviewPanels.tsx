/**
 * REVIEW — the three panels that make the loop trustworthy.
 *
 * ⭐ `StaleReading` · `OwnObservation` · `TrailPosition`.
 */

import * as React from 'react';
import {
  REREAD_IS_THE_MEMBERS_CALL, changeLines, type WorkChange,
} from '../../../lib/writersStudio/studio/reading';
import type { OwnNoteKind } from '../../../lib/writersStudio/studio/machine';

/**
 * ⭐⭐ THE WORK MOVED SINCE MAIA READ IT.
 *
 * ⛔ Not a warning, ⛔ not an error, ⛔ not a nag — a statement of fact with the
 * decision handed back. The obvious implementation is to re-read silently and
 * keep the analysis current; ⭐ that would be the system deciding to read the
 * member's new words without being asked.
 */
export function StaleReading({ readAt, updatedAt, change, previousLabel }: {
  readAt: string; updatedAt: string; change: WorkChange; previousLabel: string;
}) {
  return (
    <section className="fs-stale" data-stale-reading="true">
      <div className="fs-stalehead">
        <span className="fs-staleclock" aria-hidden="true">◷</span>
        <strong>This chapter has changed since MAIA last read it.</strong>
      </div>
      <dl className="fs-staletimes">
        <div><dt>MAIA’s last reading</dt><dd>{readAt}</dd></div>
        <div><dt>This chapter was updated</dt><dd>{updatedAt}</dd></div>
      </dl>

      <div className="fs-stalewhat">
        <h4>What changed</h4>
        <ul>{changeLines(change).map((l) => <li key={l}>{l}</li>)}</ul>
      </div>

      <p className="fs-stalesay">
        MAIA’s current findings are based on the earlier version.
        Would you like her to read this chapter again?
      </p>
      <div className="fs-staleacts">
        {/* ⭐ The ONLY control in Review that commissions a reading. */}
        <button type="button" className="fs-btn fs-btn--key" data-commission="reread">
          Read this chapter again
        </button>
        <button type="button" className="fs-btn" data-dismiss="reread">Not now</button>
      </div>

      {/* ⭐ The earlier reading is KEPT and reachable. ⛔ What MAIA believed
          before is not deleted by a correction. */}
      <div className="fs-staleprev">
        <span className="fs-stalelabel">Previous reading, for reference</span>
        <span className="fs-staleprevname">{previousLabel}</span>
        <button type="button" className="fs-goto" data-return-to="previous-reading">
          View that version →
        </button>
      </div>

      <p className="fs-staletrust" data-trust-line="true">{REREAD_IS_THE_MEMBERS_CALL}</p>
    </section>
  );
}

/**
 * ⭐⭐ THE WRITER CONTRIBUTES — ⛔ NOT JUST CONSUMES.
 *
 * ⭐ Three kinds, and the two that are not findings carry the weight: a writer's
 * most useful marks on their own book are often *I don't know yet* and *what
 * if*. ⛔ A system that only accepts conclusions would force both into the shape
 * of one.
 *
 * ⛔ Themes are LINKED BY THE MEMBER, never inferred from what they wrote — FR-06.
 */
const KINDS: ReadonlyArray<{ id: OwnNoteKind; label: string; glyph: string }> = [
  { id: 'noticed', label: 'Something I noticed', glyph: '◉' },
  { id: 'question', label: 'A question', glyph: '?' },
  { id: 'possibility', label: 'A possibility', glyph: '✦' },
];

export function OwnObservation({ kind = 'noticed', draft = '', themes = [], placeLabel }: {
  kind?: OwnNoteKind; draft?: string; themes?: readonly string[]; placeLabel: string;
}) {
  return (
    <section className="fs-own" data-own-observation="true">
      <div className="fs-ownhead">
        <h3>Add your own observation</h3>
        <button type="button" className="fs-mx" aria-label="Close">✕</button>
      </div>
      <div className="fs-ownkinds" role="radiogroup" aria-label="What kind of observation">
        {KINDS.map((k) => (
          <button key={k.id} type="button" role="radio" className="fs-ownkind"
            aria-checked={k.id === kind} data-own-kind={k.id}>
            <span aria-hidden="true">{k.glyph}</span>{k.label}
          </button>
        ))}
      </div>
      <div className="fs-owntext" data-draft="true">
        {draft || 'Write what you noticed, asked, or wondered…'}
      </div>
      <div className="fs-ownthemes">
        <span className="fs-ownlabel">Link to themes (optional)</span>
        <div className="fs-ownchips">
          {themes.map((t) => (
            <span className="fs-ownchip" key={t}>{t}<button type="button" aria-label={`Remove ${t}`}>✕</button></span>
          ))}
          <button type="button" className="fs-ownadd">+ Add a theme</button>
        </div>
      </div>
      <p className="fs-ownnote">
        This is added to your Review and your map as <strong>your</strong> observation.
        MAIA will refer to it in {placeLabel}.
      </p>
      <div className="fs-ownacts">
        <button type="button" className="fs-btn">Cancel</button>
        <button type="button" className="fs-btn fs-btn--key">Keep with this passage</button>
      </div>
    </section>
  );
}

/** ⭐ `1 of 4` — move through the set without leaving the Work. */
export function TrailPosition({ index, total }: { index: number; total: number }) {
  return (
    <span className="fs-trailpos" data-trail-position="true">
      <button type="button" className="fs-trailstep" data-event="STEP_TRAIL" data-by="-1"
        aria-label="Previous finding" disabled={index <= 1}>‹</button>
      <span className="fs-trailcount">{index} of {total}</span>
      <button type="button" className="fs-trailstep" data-event="STEP_TRAIL" data-by="1"
        aria-label="Next finding" disabled={index >= total}>›</button>
    </span>
  );
}
