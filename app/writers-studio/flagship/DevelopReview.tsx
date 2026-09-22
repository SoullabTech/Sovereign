/**
 * FLAGSHIP STUDIO — DEVELOP and REVIEW
 *
 * ⭐ Same shell, same typography, same atmosphere, same interaction grammar as
 * Write. **V11 — CROSS-MODE FAMILY**: a Develop screen that looks like an
 * analytics SaaS dashboard fails even if it is beautiful on its own.
 *
 * ⭐ OBSERVATION LANGUAGE IS STRUCTURAL HERE. The types carry `evidence` and a
 * `returnTo`, so an entry that has nothing to point at cannot be constructed —
 * ⛔ a grade has no evidence, which is precisely why it is barred.
 */

import * as React from 'react';
import { CrumbBar } from './StudioChrome';
import { readTimeLabel, type Facet } from './flagshipTokens';

/* ══════════════════════════════════════════════════════════════════════════
   OBSERVATIONS — describe, ⛔ never grade
   ══════════════════════════════════════════════════════════════════════════ */

export interface Observation {
  readonly id: string;
  /** A neutral name for what was noticed. ⛔ Never a verdict. */
  readonly heading: string;
  /** ⭐ What is on the page, in evidence terms. */
  readonly body: string;
  /** ⛔ Non-empty by contract: an observation with nothing to cite is a grade. */
  readonly evidence: readonly string[];
  /** ⭐ Every observation returns to the exact authored location. V7. */
  readonly returnTo: { readonly label: string; readonly sectionId: string };
  /** ⭐ Reader-lens entries stay hypothesis-shaped. */
  readonly hypothesis?: boolean;
}

function ObservationRow({ o }: { o: Observation }) {
  return (
    <div className="fs-obs" data-observation={o.id} data-hypothesis={o.hypothesis ? 'true' : 'false'}>
      <div className="fs-obsh">{o.heading}</div>
      <p className="fs-obsb">{o.body}</p>
      <div className="fs-ev">
        {o.evidence.map((e) => <span className="fs-chip" key={e}>{e}</span>)}
        <button type="button" className="fs-goto" data-return-to={o.returnTo.sectionId}>
          {o.returnTo.label} →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MANUSCRIPT MAP

   ⭐ Visualize DECLARED structure. ⛔ Never manufacture archetypal or elemental
   classification from prose. The undeclared state is honest, ⛔ not a blank form.
   ══════════════════════════════════════════════════════════════════════════ */

export interface Movement { readonly name: string; readonly range: string }
export interface ElementalTheme { readonly name: string; readonly color: string }

export interface DeclaredStructure {
  readonly declared: true;
  readonly centreLabel: string;
  readonly movements: readonly Movement[];
  readonly elemental?: readonly ElementalTheme[];
}
export interface UndeclaredStructure { readonly declared: false }
export type WorkStructure = DeclaredStructure | UndeclaredStructure;

function SpiralMap({ s }: { s: DeclaredStructure }) {
  /* ⭐ The viewBox leaves room for the OUTERMOST LABELS, not just the geometry.
     An earlier version sized it to the circle: "II. Descent" was clipped to
     "II. Descen", "V. Radiance" lost its numeral, and the top movement's range
     sat on its own dot. A map of the member's book that cannot spell their
     movements is not a map. */
  const cx = 186, cy = 148, R = 92;
  return (
    <>
      <div style={{ display: 'grid', placeItems: 'center', padding: '4px 0 2px' }}>
        <svg viewBox="0 0 372 300" width="100%" style={{ maxWidth: 372 }} role="img"
          aria-label={`Spiral map of ${s.movements.length} movements you named, ${s.movements.map((m) => m.name).join(', ')}`}>
          {[R, R * 0.7, R * 0.4].map((r, i) => (
            <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="var(--rule)"
              strokeWidth="1" opacity={1 - i * 0.3} />
          ))}
          {s.movements.map((m, i) => {
            const ang = -Math.PI / 2 + (i / s.movements.length) * Math.PI * 2;
            const x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
            const anchor = Math.abs(Math.cos(ang)) < 0.3 ? 'middle' : Math.cos(ang) > 0 ? 'start' : 'end';
            const dx = anchor === 'start' ? 11 : anchor === 'end' ? -11 : 0;
            /* ⛔ Both lines must clear the dot, above it or below it — never across it. */
            const above = Math.sin(ang) < -0.6, below = Math.sin(ang) > 0.6;
            const nameDy = above ? -20 : below ? 17 : -1;
            const rangeDy = above ? -8 : below ? 29 : 11;
            return (
              <g key={m.name}>
                <circle cx={x} cy={y} r="4.5" fill="var(--gold)" />
                <text x={x + dx} y={y + nameDy} textAnchor={anchor} fontSize="10.5" fontWeight="600" fill="var(--ink)">{m.name}</text>
                <text x={x + dx} y={y + rangeDy} textAnchor={anchor} fontSize="9.5" fill="var(--muted)">{m.range}</text>
              </g>
            );
          })}
          <text x={cx} y={cy - 1} textAnchor="middle" fontSize="12.5" fontFamily="var(--serif)" fill="var(--ink)">{s.centreLabel}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--muted)">the movements you named</text>
        </svg>
      </div>
      {s.elemental ? (
        <div className="fs-legend" data-elemental="member-declared">
          {s.elemental.map((e) => (
            <span key={e.name}><i style={{ background: e.color }} aria-hidden="true" />{e.name}</span>
          ))}
          <span style={{ color: 'var(--quiet)' }}>· elemental themes, as you declared them</span>
        </div>
      ) : null}
    </>
  );
}

function UndeclaredMap() {
  return (
    <div className="fs-undeclared" data-structure="undeclared">
      <p className="q">You haven’t named the movements of this book.</p>
      <p className="a">
        MAIA can show you the sections in the order you wrote them. She will not name the shape
        for you — that reading is yours to make.
      </p>
      <button type="button" className="fs-btn fs-btn--key">Name the movements</button>{' '}
      <button type="button" className="fs-btn">Keep it open for now</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   DEVELOP
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ `Reader perspective`, ⛔ not `Reader (Hypotheses)`. The capability is kept and
 * the label is written for ordinary writers: *possible reader effects, not
 * predictions.* `reader-effect` stays a permanent non-conclusion; what is
 * admitted is a **contestable interpretation**, ⛔ never a finding.
 *
 * ⛔ TABS ARE FILTERS OVER ALREADY-ADMITTED MATERIAL. Clicking one must NEVER
 * commission a new reading — where none exists the surface says so and offers a
 * separate deliberate gesture. ⭐ No inferred commission from navigation (A2).
 */
const DEVELOP_TABS = ['Overview', 'Structure', 'Themes', 'Voice', 'Continuity', 'Reader perspective'] as const;

export interface DevelopView {
  readonly work: string;
  readonly pages: number; readonly sections: number; readonly words: number;
  readonly observations: readonly Observation[];
  readonly structure: WorkStructure;
  readonly coverage: { readonly read: number; readonly total: number; readonly depth: string };
}

export function DevelopRoom({ view, tab = 'Overview', facet = 'guided' }: {
  view: DevelopView; tab?: string; facet?: Facet;
}) {
  return (
    <>
      <CrumbBar work={view.work} place="Develop" facet={facet}
        actions={<button type="button" className="fs-tool fs-tool--gold">Ask MAIA</button>} />
      {/* ⛔ No Export. Ruled out of the B2 target pending disclosure-authority reconciliation. */}
      <div className="fs-modetabs" role="tablist">
        {DEVELOP_TABS.map((t) => (
          <button key={t} type="button" role="tab" className="fs-modetab" aria-selected={t === tab}>{t}</button>
        ))}
      </div>
      <div className="fs-pane" data-stage="develop">
        <div className="fs-pgrid">
          <div className="fs-phead">
            <div>
              <h2>Development</h2>
              <p>What MAIA has read across your manuscript, and what she noticed in it.</p>
            </div>
          </div>

          <div className="fs-col">
            <section className="fs-card">
              <h3>Your manuscript</h3>
              <div className="fs-glance">
                <div className="fs-stat"><b>{view.pages}</b><span>pages</span></div>
                <div className="fs-stat"><b>{view.sections}</b><span>sections</span></div>
                <div className="fs-stat"><b>{view.words.toLocaleString('en-US')}</b><span>words</span></div>
                {/* ⭐ The basis travels with the number. ⛔ No decorative estimate. */}
                <div className="fs-stat"><b style={{ fontSize: 15 }}>{readTimeLabel(view.words)}</b><span>reading</span></div>
              </div>
            </section>

            <section className="fs-card">
              <h3>What MAIA noticed</h3>
              <p className="fs-obsnote">
                In the order they occur in your book. Nothing here is ranked, and nothing is hidden.
              </p>
              {view.observations.map((o) => <ObservationRow key={o.id} o={o} />)}
            </section>
          </div>

          <div className="fs-col">
            <section className="fs-card">
              <h3>
                Manuscript map
                <span className="fs-viewas">
                  <button type="button" className="fs-vchip" aria-pressed="true">Spiral</button>
                  <button type="button" className="fs-vchip" aria-pressed="false">Linear</button>
                  <button type="button" className="fs-vchip" aria-pressed="false">Table</button>
                </span>
              </h3>
              {view.structure.declared ? <SpiralMap s={view.structure} /> : <UndeclaredMap />}
            </section>

            <section className="fs-card" data-coverage="true">
              <h3>What MAIA read</h3>
              <p className="fs-obsb" style={{ margin: '0 0 9px' }}>
                {view.coverage.read} of {view.coverage.total} sections, at {view.coverage.depth}.
                Every observation here cites text she read.
              </p>
              <div className="fs-ev">
                <span className="fs-chip">{view.coverage.read} / {view.coverage.total} sections</span>
                <span className="fs-chip">{view.coverage.depth}</span>
                <button type="button" className="fs-goto">See what she read →</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   REVIEW
   ══════════════════════════════════════════════════════════════════════════ */

const REVIEW_TABS = ['Findings', 'Notes', 'Related passages', 'References', 'What MAIA read'] as const;

export interface Finding extends Observation { readonly glyph: string }
export interface ReviewView {
  readonly work: string;
  readonly findings: readonly Finding[];
  readonly coverage: { readonly read: number; readonly total: number; readonly depth: string };
}

export function ReviewRoom({ view, tab = 'Findings', facet = 'guided' }: {
  view: ReviewView; tab?: string; facet?: Facet;
}) {
  return (
    <>
      <CrumbBar work={view.work} place="Review" facet={facet}
        actions={<button type="button" className="fs-tool fs-tool--gold">Ask MAIA</button>} />
      <div className="fs-modetabs" role="tablist">
        {REVIEW_TABS.map((t) => (
          <button key={t} type="button" role="tab" className="fs-modetab" aria-selected={t === tab}>{t}</button>
        ))}
      </div>
      <div className="fs-pane" data-stage="review">
        <div className="fs-pgrid" style={{ gridTemplateColumns: 'minmax(0,1fr)', maxWidth: 780 }}>
          <div className="fs-phead">
            <div>
              <h2>Review</h2>
              <p>Findings, connections, and openings — each one grounded in what MAIA read.</p>
            </div>
          </div>
          <section className="fs-card">
            <h3>Findings · {view.findings.length}</h3>
            <p className="fs-obsnote">
              In the order they occur in your book. {view.coverage.read} of {view.coverage.total} sections read,
              at {view.coverage.depth}.
            </p>
            {view.findings.map((f) => (
              <div className="fs-find" key={f.id} data-finding={f.id} data-hypothesis={f.hypothesis ? 'true' : 'false'}>
                <div className="fs-fic" aria-hidden="true">{f.glyph}</div>
                <div className="fs-fbody">
                  <div className="fs-fh">{f.heading}</div>
                  <p className="fs-fb">{f.body}</p>
                  <div className="fs-ev" style={{ marginTop: 7 }}>
                    {f.evidence.map((e) => <span className="fs-chip" key={e}>{e}</span>)}
                  </div>
                </div>
                <button type="button" className="fs-btn" data-return-to={f.returnTo.sectionId}>{f.returnTo.label}</button>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
