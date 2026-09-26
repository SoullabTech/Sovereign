/**
 * REVIEW — the three panels that make the loop trustworthy.
 *
 * ⭐ `StaleReading` · `OwnObservation` · `TrailPosition`.
 */

import * as React from 'react';
import {
  REREAD_IS_THE_MEMBERS_CALL, REREAD_IS_THE_MEMBERS_CALL_SHORT,
  changeLines, type WorkChange,
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
export function StaleReading({ readAt, updatedAt, change, previousLabel, acknowledged = false }: {
  readAt: string; updatedAt: string; change: WorkChange; previousLabel: string;
  /** ⭐ After "Not now" it becomes a persistent strip. ⛔ Nothing is hidden —
   *  the claim is still qualified on every view — but the Work gets its space
   *  back. *Impossible to miss* and *dominating the room* are different asks. */
  acknowledged?: boolean;
}) {
  if (acknowledged) {
    return (
      <div className="fs-stalestrip" data-stale-reading="true" data-contextual="true"
        data-acknowledged="true">
        <span className="fs-staleclock" aria-hidden="true">◷</span>
        <span className="fs-stalestripsay">MAIA’s findings are based on an earlier version.</span>
        {/* ⭐ The promise compacts; it does not disappear. A persistent stale
            reading WITHOUT it is the exact state in which a member starts to
            wonder whether she read the new words anyway. */}
        <span className="fs-stalestriptrust" data-trust-line="true">
          {REREAD_IS_THE_MEMBERS_CALL_SHORT}
        </span>
        <span className="fs-stalestripacts">
          <button type="button" className="fs-goto" data-return-to="previous-reading">
            Previous reading
          </button>
          <button type="button" className="fs-goto" data-commission="reread">Read again</button>
        </span>
      </div>
    );
  }
  return (
    /* ⭐ `data-contextual` is the region declaring its own kind, the same move
       as provenance. F13 counts STANDING instruments — controls that face the
       member in the resting state. This panel exists only when the Work has
       moved and dismisses with "Not now", so its controls are occasioned, ⛔ not
       standing. Declaring it in the markup beats a test maintaining a list of
       selectors that drifts every time a surface is added. */
    <section className="fs-stale" data-stale-reading="true" data-contextual="true">
      {/* ⭐ V10R1 — the same eight facts, in four rows instead of nine blocks.
          ⛔ Nothing removed, nothing hidden, nothing behind a control: the
          headline, both dates, the exact change facts, the single re-read
          commission, Not now, the previous reading and the promise are all
          here at rest. What changed is the WEIGHT — a status edge instead of a
          warm fill, dates beside the headline instead of beneath it, and the
          change facts as one line. *Interrupt false confidence without becoming
          the subject of Review.* */}
      <div className="fs-stalehead">
        <span className="fs-staleclock" aria-hidden="true">◷</span>
        <strong>This chapter has changed since MAIA last read it.</strong>
        <dl className="fs-staletimes">
          <div><dt>MAIA’s last reading</dt><dd>{readAt}</dd></div>
          <div><dt>Updated</dt><dd>{updatedAt}</dd></div>
        </dl>
      </div>

      <ul className="fs-stalewhat" aria-label="What changed">
        {changeLines(change).map((l) => <li key={l}>{l}</li>)}
      </ul>

      <div className="fs-staleacts">
        <span className="fs-stalesay">Her findings are based on the earlier version.</span>
        {/* ⭐ The ONLY control in Review that commissions a reading. */}
        <button type="button" className="fs-btn fs-btn--key" data-commission="reread">
          Read this chapter again
        </button>
        <button type="button" className="fs-btn" data-dismiss="reread">Not now</button>
        {/* ⭐ The earlier reading is KEPT and reachable. ⛔ What MAIA believed
            before is not deleted by a correction. */}
        <button type="button" className="fs-goto" data-return-to="previous-reading">
          Previous reading · {previousLabel} →
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
    <section className="fs-own" data-own-observation="true" data-contextual="true">
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
            <span className="fs-ownchip" key={t}>{t}
            <button type="button" className="fs-ownchipx" aria-label={`Remove ${t}`}>✕</button>
          </span>
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

/**
 * ⭐⭐ THE MANUSCRIPT PANE IN REVIEW — D2, F1 amended by founder ruling.
 *
 * Review may hold TWO content regions because **both are views of the same
 * Work**: the intelligence about it, and the Work itself. ⛔ That is not the
 * legacy three-column workbench, where a manuscript competed with two utility
 * panels. MAIA stays contextual and never becomes a third permanent pane.
 *
 * ⭐ Selecting a finding moves this pane to that locus and highlights it, so
 * the member sees the passage a finding is about **without leaving Review**.
 */
export interface ContextParagraph { readonly id: string; readonly text: string }

export function ManuscriptContext({ chapterLabel, chapterTitle, page, paragraphs, highlightId, findingLabel }: {
  chapterLabel: string; chapterTitle: string; page: string;
  paragraphs: readonly ContextParagraph[];
  highlightId?: string; findingLabel?: string;
}) {
  return (
    <aside className="fs-context" data-manuscript-context="true" aria-label="The passage this refers to">
      <div className="fs-contexthead">
        <div>
          <div className="fs-contextch">{chapterLabel}</div>
          <div className="fs-contexttitle">{chapterTitle}</div>
        </div>
        <span className="fs-contextpage">{page}</span>
      </div>
      {findingLabel ? (
        <div className="fs-contextwhy">Showing where <strong>{findingLabel}</strong> appears.</div>
      ) : null}
      <div className="fs-contextbody">
        {paragraphs.map((p) => (
          <p className="fs-contextp" key={p.id} data-highlighted={p.id === highlightId ? 'true' : 'false'}>
            {p.text}
          </p>
        ))}
      </div>
      <div className="fs-contextfoot">
        <button type="button" className="fs-btn fs-btn--key" data-return-to={highlightId ?? 'context'}>
          Go to passage
        </button>
        <button type="button" className="fs-goto" data-return-to="full-manuscript">
          Open the full manuscript →
        </button>
      </div>
    </aside>
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
