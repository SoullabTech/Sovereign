/**
 * DEVELOP — THE SHARED VIEWS
 *
 * ⭐ Continuity · Voice · Themes · Structure are **views over one governed
 * object**, ⛔ not four independently authored frames. Everything they are
 * required to carry, they carry because `observe()` would not have produced the
 * object otherwise.
 */

import * as React from 'react';
import {
  PRESENCE_LABEL, provenanceLabel, type ContinuityMapData, type Coverage,
  type DevelopObservation, type Provenance, type ThreadRow,
} from '../../../lib/writersStudio/studio/developObservation';

/* ⭐ Three epistemically different things, three visibly different treatments.
   ⛔ They may never collapse into one. */
function ProvenanceMark({ p }: { p: Provenance }) {
  return <span className="fs-prov" data-provenance={p.kind}>{provenanceLabel(p)}</span>;
}

export function CoverageLine({ c, compact = false, navigable = true }: {
  c: Coverage; compact?: boolean;
  /** R1-1A · false = no navigation authority behind the control, so it is OMITTED, never disabled. */
  navigable?: boolean;
}) {
  return (
    <div className="fs-ev" data-coverage="true">
      <span className="fs-chip">{c.read} / {c.total} sections</span>
      <span className="fs-chip">{c.depth}</span>
      {compact ? null : <span className="fs-covwhen">{c.when}</span>}
      {navigable ? <button type="button" className="fs-goto" data-return-to="coverage">What MAIA read →</button> : null}
    </div>
  );
}

/**
 * ⭐⭐ THE CONTINUITY MAP — promoted to the Develop Overview by founder ruling.
 *
 * ⭐ THE LAW, printed on the surface so it cannot be lost in a spec:
 * *This map shows where something appears. ⛔ It doesn't say what that means.*
 *
 * Every cell is an address. ⛔ Presence only — there is no way to grade a book
 * with a presence grid.
 */
export function ContinuityMap({ d, title, navigable = true }: {
  d: ContinuityMapData; title: string;
  /** R1-1A · false = cells show presence only; no address is offered without navigation authority. */
  navigable?: boolean;
}) {
  return (
    <section className="fs-card" data-continuity-map="true">
      <h3>{title}</h3>
      <p className="fs-obsnote">
        Where each of these appears across your work. This map shows <em>where</em> something
        appears — it doesn’t say what that means.
      </p>
      <div className="fs-mapwrap2">
        <table className="fs-map">
          <colgroup>
            <col />
            {d.units.map((u) => <col key={u} />)}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="fs-maprowhead" />
              {d.units.map((u) => <th scope="col" key={u}>{u}</th>)}
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r) => <MapRow key={r.id} r={r} units={d.units} navigable={navigable} />)}
          </tbody>
        </table>
      </div>
      <div className="fs-maplegend">
        {[3, 2, 1].map((n) => (
          <span key={n}><i data-presence={n} aria-hidden="true" />{PRESENCE_LABEL[n as 1 | 2 | 3]}</span>
        ))}
      </div>
      <CoverageLine c={d.coverage} navigable={navigable} />
    </section>
  );
}

function MapRow({ r, units, navigable = true }: { r: ThreadRow; units: readonly string[]; navigable?: boolean }) {
  return (
    <tr data-thread={r.id}>
      <th scope="row" className="fs-maprowhead">
        <span className="fs-maprowname">{r.label}</span>
        <ProvenanceMark p={r.provenance} />
      </th>
      {units.map((u, i) => {
        const p = r.presence[i] ?? 0;
        const a = r.addressOf[i];
        return (
          <td key={u}>
            {navigable ? (
              <button type="button" className="fs-cell" data-presence={p}
                data-return-to={a?.sectionId ?? ''}
                aria-label={`${r.label} in ${u}: ${PRESENCE_LABEL[p]}. Open ${a?.label ?? u}.`} />
            ) : (
              <span className="fs-cell" data-presence={p} role="img"
                aria-label={`${r.label} in ${u}: ${PRESENCE_LABEL[p]}.`} />
            )}
          </td>
        );
      })}
    </tr>
  );
}

/**
 * ⭐ OBSERVATIONS — what replaced `What's Emerging`.
 *
 * ⚠️ The old container kept regenerating evaluative and predictive copy because
 * **the container itself invited a conclusion.** A heading that promises what is
 * emerging must be filled with a claim about the future. ⭐ Renaming was not
 * cosmetic: this one asks for what is there, so what is there is what it gets.
 * ⛔ The UI does not pre-package meaning; meaning is explored with MAIA.
 */
export function Observations({ items, title = 'What MAIA noticed', note }: {
  items: readonly DevelopObservation[]; title?: string; note?: string;
}) {
  return (
    <section className="fs-card">
      <h3>{title}</h3>
      <p className="fs-obsnote">
        {note ?? 'In the order they occur in your work. Nothing here is ranked, and nothing is hidden.'}
      </p>
      {items.map((o) => <ObservationRow key={o.id} o={o} />)}
    </section>
  );
}

export function ObservationRow({ o }: { o: DevelopObservation }) {
  return (
    <div className="fs-obs" data-observation={o.id} data-domain={o.domain}
      data-provenance={o.provenance.kind}>
      <div className="fs-obshead">
        <span className="fs-obsh">{o.label}</span>
        <ProvenanceMark p={o.provenance} />
      </div>
      <p className="fs-obsb">{o.description}</p>
      <div className="fs-ev">
        {o.evidence.map((e) => <span className="fs-chip" key={e}>{e}</span>)}
        <button type="button" className="fs-goto" data-return-to={o.returnTo.sectionId}>
          {o.returnTo.label} →
        </button>
      </div>
      {o.doesNotEstablish.length > 0 ? (
        <p className="fs-limit" data-non-conclusions="true">
          {o.doesNotEstablish.includes('reader-effect')
            ? 'A possibility, not a prediction — this doesn’t establish how a reader will respond.'
            : 'This doesn’t establish what you intended by it.'}
        </p>
      ) : null}
      {o.crossWork && o.coverage ? <CoverageLine c={o.coverage} compact /> : null}
    </div>
  );
}
