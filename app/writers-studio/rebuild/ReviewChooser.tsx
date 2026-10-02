/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1C — THE READING CHOOSER (pure).
 *
 * The bounded selection state behind the visible Review destination when no reading is selected.
 * It shows ONLY what the member-owned ledger already holds about each durable reading — the lens
 * it was commissioned under, the day it was frozen, how many observations it admitted — enough to
 * tell lawful choices apart, and nothing from inside any reading.
 *
 * ⛔ Pure: no fetch, no state, no selection. ⛔ Nothing is pre-chosen, highlighted or current.
 * ⛔ No finding, observation, lens content, assessment or passage from any reading is rendered here.
 * ⛔ A ledger row whose outcome is `none` is shown as the fact it is and is not a link.
 * ⛔ An empty ledger is one calm sentence — never an offer to commission a reading.
 * ⛔ Presentation order is the ledger's own order; it is not a ranking.
 */
import * as React from 'react';
import { LENSES } from '../flagship/DevelopReview';
import { CHOOSER_COPY, type ChooserState } from './reviewNavigation';

const lensLabel = (id: string) => LENSES.find((l) => l.id === id)?.plain ?? id;
/** The day only, from the ledger's own ISO timestamp — deterministic, locale-free. */
const day = (iso: string) => iso.slice(0, 10);
const observations = (n: number) => (n === 1 ? '1 observation' : `${n} observations`);

export function ReviewChooser({ state, hrefFor, onChoose }: {
  state: ChooserState; hrefFor: (id: string) => string; onChoose: (id: string, href: string) => void;
}) {
  if (state.kind === 'closed') return null;
  if (state.kind === 'loading') {
    return <div className="fs-pane" data-stage="review" data-review="choose" data-choose="loading"><p className="fs-obsnote">{CHOOSER_COPY.loading}</p></div>;
  }
  if (state.kind === 'unavailable') {
    return (
      <div className="fs-pane" data-stage="review" data-review="choose" data-choose="unavailable">
        <section className="fs-card"><h3>Review</h3><p className="fs-obsnote">{CHOOSER_COPY.unavailable}</p></section>
      </div>
    );
  }
  return (
    <div className="fs-pane" data-stage="review" data-review="choose" data-choose="choices">
      <section className="fs-card">
        <h3>Review</h3>
        <p className="fs-obsnote">{CHOOSER_COPY.lead}</p>
        {state.readings.length === 0 ? (
          <p className="fs-obsnote" data-review-empty="true">{CHOOSER_COPY.empty}</p>
        ) : (
          <ul className="fs-choices">
            {state.readings.map((r) => (r.outcome === 'reading' ? (
              <li key={r.id} className="fs-choice" data-reading-choice={r.id} data-reading-outcome="reading">
                <a className="fs-choicelink" data-reading-choice={r.id} href={hrefFor(r.id)}
                  onClick={(e) => { e.preventDefault(); onChoose(r.id, hrefFor(r.id)); }}>
                  <span className="fs-choicelens">{lensLabel(r.commissionedLens)}</span>
                  <span className="fs-choicemeta">{day(r.frozenAt)} · {observations(r.observationCount)}</span>
                </a>
              </li>
            ) : (
              <li key={r.id} className="fs-choice fs-choice--none" data-reading-choice={r.id} data-reading-outcome="none">
                <span className="fs-choicelens">{lensLabel(r.commissionedLens)}</span>
                <span className="fs-choicemeta">{day(r.frozenAt)} · {CHOOSER_COPY.none}</span>
              </li>
            )))}
          </ul>
        )}
      </section>
    </div>
  );
}
