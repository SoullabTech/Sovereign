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
import { ContinuityMap, CoverageLine, Observations } from './DevelopViews';
import {
  provenanceLabel,
  type ContinuityMapData, type Coverage, type DevelopObservation as GovernedObservation,
} from '../../../lib/writersStudio/studio/developObservation';
import {
  availabilityLine, citationLine, commissionOffer, freshnessLine, scopeLine,
  type CitationState, type Freshness, type LensAvailability, type ReviewScope, type WorkChange,
} from '../../../lib/writersStudio/studio/reading';
import { ManuscriptContext, OwnObservation, StaleReading, type ContextParagraph } from './ReviewPanels';

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
                <circle cx={x} cy={y} r="4.5" fill="var(--accent-warm)" />
                <text x={x + dx} y={y + nameDy} textAnchor={anchor} fontSize="10.5" fontWeight="600" fill="var(--text-primary)">{m.name}</text>
                <text x={x + dx} y={y + rangeDy} textAnchor={anchor} fontSize="9.5" fill="var(--text-muted)">{m.range}</text>
              </g>
            );
          })}
          <text x={cx} y={cy - 1} textAnchor="middle" fontSize="12.5" fontFamily="var(--serif)" fill="var(--text-primary)">{s.centreLabel}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">the movements you named</text>
        </svg>
      </div>
      {s.elemental ? (
        <div className="fs-legend" data-elemental="member-declared">
          {s.elemental.map((e) => (
            <span key={e.name}><i style={{ background: e.color }} aria-hidden="true" />{e.name}</span>
          ))}
          <span style={{ color: 'var(--text-quiet)' }}>· elemental themes, as you declared them</span>
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
/**
 * ⭐ THE SEVEN REAL LENSES, and the plain question each one answers.
 *
 * `themes` was never a lens — the ratified vocabulary in
 * `lib/manuscript/developmentalReader/contract.ts` is exactly
 * structure · development · continuity · arc · voice · coherence · reader.
 * Drawing a `Themes` tab invents a destination, the same defect as
 * `Notes · Research · Goals`.
 *
 * ⭐ THE PLAIN QUESTION IS THE LABEL. A person who is not an editor does not want
 * *Continuity*; they want to know whether the thread holds. The editorial term is
 * the secondary name, present for whoever wants it and ⛔ never required to
 * operate the room. **V12 answered by naming.**
 */
export const LENSES = [
  { id: 'structure',   plain: 'How it’s put together',            term: 'Structure' },
  { id: 'development', plain: 'Where ideas grow',                 term: 'Development' },
  { id: 'arc',         plain: 'How it moves',                     term: 'Arc' },
  { id: 'continuity',  plain: 'Whether the thread holds',         term: 'Continuity' },
  { id: 'coherence',   plain: 'Whether it stays consistent',      term: 'Coherence' },
  { id: 'voice',       plain: 'How it sounds',                    term: 'Voice' },
  { id: 'reader',      plain: 'How it might land',                term: 'Reader perspective' },
] as const;
export type LensId = (typeof LENSES)[number]['id'];

/**
 * ⭐ Derived from positive facts. ⛔ Never stored, ⛔ never inferred from a click.
 * ⚠️ `read-nothing-noticed` and `not-read` MUST render differently — a completed
 * reading that surfaced nothing is a RESULT; an absent reading is an ABSENCE.
 */
export type LensState = 'not-read' | 'partially-read' | 'read' | 'read-nothing-noticed';

/**
 * ⭐ THE OPENING — recognition, ⛔ not assessment.
 *
 * The first thing the member meets must be THEIRS. Three lawful forms, in
 * preference order; ⛔ a fourth — MAIA's summary of what the book is about — is
 * an `author-intent` claim and is barred however beautifully it is written.
 *
 *   1. `declared`  the member's own stated purpose, in their words
 *   2. `passage`   ⭐ a line from their manuscript, at an address. MAIA chooses
 *                  it and says WHY in one FACTUAL line — ⛔ never "this is
 *                  beautiful", ⛔ never what it means
 *   3. `facts`     the Work itself, when nothing has been read yet
 */
export type WorkOpening =
  | { readonly kind: 'declared'; readonly purpose: string; readonly declaredWhen: string }
  | { readonly kind: 'passage'; readonly text: string; readonly because: string;
      readonly at: string; readonly sectionId: string }
  | { readonly kind: 'facts'; readonly written: string };

function Opening({ o, work, kind }: { o: WorkOpening; work: string; kind: string }) {
  if (o.kind === 'declared') {
    return (
      <section className="fs-open" data-opening="declared">
        <div className="fs-openlabel">What you said this {kind} is for</div>
        <blockquote className="fs-openq">{o.purpose}</blockquote>
        <div className="fs-openwho">You, {o.declaredWhen} · <button type="button" className="fs-goto">Revise this</button></div>
      </section>
    );
  }
  if (o.kind === 'passage') {
    return (
      <section className="fs-open" data-opening="passage">
        <div className="fs-openlabel">From your {kind}</div>
        <blockquote className="fs-openq">{o.text}</blockquote>
        {/* ⭐ Why it is here, as a FACT about the text. ⛔ Not a judgment of it. */}
        <div className="fs-openwho">
          {o.because} · <button type="button" className="fs-goto" data-return-to={o.sectionId}>{o.at} →</button>
        </div>
      </section>
    );
  }
  return (
    <section className="fs-open" data-opening="facts">
      <div className="fs-openlabel">Your {kind}</div>
      <blockquote className="fs-openq">{work}</blockquote>
      <div className="fs-openwho">{o.written}</div>
    </section>
  );
}

export interface LensStanding {
  readonly id: LensId;
  readonly state: LensState;
  readonly count: number;
  /** Sections remaining, where partially read. */
  readonly remaining?: number;
}

export interface DevelopView {
  readonly work: string;
  readonly kind: string;
  readonly pages: number; readonly sections: number; readonly words: number;
  readonly observations: readonly GovernedObservation[];
  readonly map: ContinuityMapData;
  readonly lenses: readonly LensStanding[];
  readonly coverage: Coverage;
  readonly opening: WorkOpening;
  /** Set when the member has declared a shape; ⛔ absent renders Sequence. */
  readonly structureDeclaredLabel?: string;
}

/** ⭐ No empty state. Either a reading exists and said nothing, or it does not exist. */
function LensRow({ l }: { l: LensStanding }) {
  const meta = LENSES.find((x) => x.id === l.id);
  if (!meta) return null;
  const body =
    l.state === 'not-read'
      ? <>MAIA hasn’t read your Work for this yet.{' '}
          <button type="button" className="fs-goto" data-commission={l.id}>Read for this →</button></>
      : l.state === 'read-nothing-noticed'
        ? <>MAIA read the whole Work for this and found nothing to bring you.</>
        : l.state === 'partially-read'
          ? <>{l.count} {l.count === 1 ? 'thing' : 'things'} so far · {l.remaining} sections not read yet{' '}
              <button type="button" className="fs-goto" data-commission={l.id}>Read the rest →</button></>
          : <>{l.count} {l.count === 1 ? 'thing' : 'things'} to look at</>;
  return (
    <div className="fs-lens" data-lens={l.id} data-lens-state={l.state}>
      <div className="fs-lensq">{meta.plain}</div>
      <div className="fs-lensterm">{meta.term}</div>
      <div className="fs-lensbody">{body}</div>
    </div>
  );
}

export function DevelopRoom({ view, lens = 'overview', facet = 'guided' }: {
  view: DevelopView; lens?: LensId | 'overview'; facet?: Facet;
}) {
  const cov = view.coverage;
  return (
    <>
      <CrumbBar work={view.work} place="Develop" facet={facet}
        actions={<button type="button" className="fs-tool fs-tool--key">Ask MAIA</button>} />
      {/* ⛔ No Export. ⛔ No Themes — it has no lens. ⛔ No invented destination. */}
      <div className="fs-modetabs" role="tablist">
        <button type="button" role="tab" className="fs-modetab" aria-selected={lens === 'overview'}>
          Overview
        </button>
        {LENSES.map((l) => (
          <button key={l.id} type="button" role="tab" className="fs-modetab" aria-selected={lens === l.id}>
            {l.plain}
          </button>
        ))}
      </div>

      <div className="fs-pane" data-stage="develop">
        <div className="fs-pgrid">
          <div className="fs-phead">
            <div>
              <h2>Your {view.kind}, seen whole</h2>
              <p>
                {view.pages} pages · {view.sections} sections · {view.words.toLocaleString('en-US')} words ·{' '}
                {readTimeLabel(view.words)}
              </p>
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <Opening o={view.opening} work={view.work} kind={view.kind} />
          </div>

          {/* ⭐⭐ THE CONTINUITY MAP — promoted to the Overview by founder ruling.
              The primary recognition object beneath the opening: entirely the
              member's own Work, addressable at every cell, non-ranking, and it
              exposes what is hard to perceive while drafting. */}
          <div style={{ gridColumn: '1 / -1' }}>
            <ContinuityMap d={view.map} title={`Across your ${view.kind}`} />
          </div>

          <div className="fs-col">
            <Observations items={view.observations.slice(0, 4)} />
          </div>

          <div className="fs-col">
            <section className="fs-card">
              <h3>The shape of your {view.kind}</h3>
              {view.structureDeclaredLabel
                ? null
                : <SequenceMap sections={view.sections} kind={view.kind} />}
            </section>

            <section className="fs-card" data-coverage="true">
              <h3>What MAIA read</h3>
              <p className="fs-obsb" style={{ margin: '0 0 9px' }}>
                {view.coverage.read} of {view.coverage.total} sections, {view.coverage.depth},{' '}
                {view.coverage.when}. Everything here cites something she read.
              </p>
              <CoverageLine c={view.coverage} compact />
            </section>

            <section className="fs-card">
              <h3>Ways to look</h3>
              <div className="fs-lenses">
                {view.lenses.map((l) => <LensRow key={l.id} l={l} />)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * ⭐ SEQUENCE — the honest map when nothing is declared.
 *
 * The sections in the order they were written, which is true of every Work.
 * ⛔ No `Name the movements` control: `git grep` finds no declaration store, so
 * drawing the button would be `assertStudioMapHonest()` broken by a button.
 * ⛔ MAIA never names the shape; ⛔ absence never authorizes her to invent one.
 */
function SequenceMap({ sections, kind }: { sections: number; kind: string }) {
  const ticks = Array.from({ length: Math.min(sections, 24) }, (_, i) => i);
  return (
    <div data-structure="sequence">
      <div className="fs-seq">
        {ticks.map((i) => <i key={i} style={{ height: 14 + ((i * 7) % 13) }} />)}
      </div>
      <p className="fs-obsnote" style={{ margin: '10px 0 0' }}>
        {sections} sections, in the order you wrote them. You haven’t named the movements of this{' '}
        {kind} — MAIA won’t name them for you.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   REVIEW

   ⭐ TWO REFERENCES, TWO AUTHORITIES, ⛔ neither discarded:
     · Reference A governs the HUMAN EXPERIENCE — manuscript relationship,
       hierarchy, atmosphere, the conversational feel of reviewing.
     · Reference B governs the EVIDENCE ARCHITECTURE — the Continuity Map,
       coverage, observed patterns, addressability, non-evaluative presentation.

   ⭐ Findings ARE `DevelopObservation`s, so evidence, return address,
   provenance, coverage and copy-law are inherited rather than re-earned. ⛔ A
   Review surface cannot reintroduce a defect the constructor refuses.
   ══════════════════════════════════════════════════════════════════════════ */

export interface ReviewView {
  readonly work: string;
  readonly kind: string;
  readonly scope: ReviewScope;
  readonly freshness: Freshness;
  readonly coverage: Coverage;
  readonly findings: readonly GovernedObservation[];
  /** Per-finding citation state, keyed by observation id. Absent ⇒ intact. */
  readonly citations?: Readonly<Record<string, CitationState>>;
  readonly lenses: readonly { id: LensId; availability: LensAvailability }[];
  readonly map?: ContinuityMapData;
  /** ⭐ Set when the Work has moved since the reading. */
  readonly changed?: {
    readonly readAt: string; readonly updatedAt: string;
    readonly change: WorkChange; readonly previousLabel: string;
    /** ⭐ After "Not now" — a strip, ⛔ never hidden. */
    readonly acknowledged?: boolean;
  };
  /** ⭐ D2 — the Work itself, beside the intelligence about it. */
  readonly context: {
    readonly chapterLabel: string; readonly chapterTitle: string; readonly page: string;
    readonly paragraphs: readonly ContextParagraph[];
  };
  /** The finding currently driving the manuscript pane. */
  readonly selectedFindingId?: string;
  /**
   * R1-1A · observations of this reading that EXIST but cannot be attached to the
   * current prose, each with its durable identity and the truthful reason. ⛔ Never
   * implies the observation disappeared. Absent in the accepted controlled states.
   */
  readonly withheld?: readonly ReviewWithheld[];
}

/* ══════════════════════════════════════════════════════════════════════════
   R1-1A — THE PURE REVIEW PRESENTATION SEAM

   accepted controlled ReviewRoom = ReviewPresentation + CONTROLLED capabilities
   future read-only host          = ReviewPresentation + READ-ONLY capabilities

   ⭐ The seam fetches nothing, writes nothing, commissions nothing, persists
   nothing, invokes no model, mints no identity and owns no Work authority. It
   renders only what its caller lawfully supplies. ⛔ A capability that is absent
   is OMITTED — never drawn disabled, never drawn dead.
   ══════════════════════════════════════════════════════════════════════════ */

export interface ReviewCapabilities {
  /** The crumb-bar Ask MAIA action. */
  readonly askMaia: boolean;
  /** Per-finding Discuss. */
  readonly discuss: boolean;
  /** Per-finding Explore. */
  readonly explore: boolean;
  /** Read for this · Read again · Read this chapter again — the only controls that commission a reading. */
  readonly commission: boolean;
  /** "Not now" on a stale reading. */
  readonly acknowledgeStale: boolean;
  /** The member's own observation editor (member-write). */
  readonly ownObservation: boolean;
  /** Go to passage · previous reading · full manuscript · coverage · map cells — only with a real address behind them. */
  readonly navigate: boolean;
  /** R1-1B · the crumb-bar facet selector (Guided ▾) — a control; absent until facet selection has real authority. */
  readonly facet: boolean;
}
/** The accepted controlled room: every capability, as the design witness renders it. */
export const CONTROLLED_REVIEW_CAPABILITIES: ReviewCapabilities = Object.freeze({
  askMaia: true, discuss: true, explore: true, commission: true, acknowledgeStale: true, ownObservation: true, navigate: true, facet: true,
});
/** Read-only: nothing whose act is unauthorized. R1-2 (founder-authorized, 2026-09-23): `navigate` is granted — the ONE
 *  capability that moved — and it acts only through a host-supplied `ReviewNavigation` over exact durable section addresses. */
export const READ_ONLY_REVIEW_CAPABILITIES: ReviewCapabilities = Object.freeze({
  askMaia: false, discuss: false, explore: false, commission: false, acknowledgeStale: false, ownObservation: false, navigate: true, facet: false,
});
/**
 * R1-2 · a LIVE host's return navigation. `hrefFor` answers a LOCATION for an exact durable section
 * address present in the mounted view's context, or null — and a null address renders NO control.
 * ⛔ Never a fetch, a write, a commission or a held passage. Absent (the controlled witness), the
 * capability renders the reference `<button data-return-to>` exactly as before.
 */
export interface ReviewNavigation { hrefFor(sectionId: string): string | null; onGo(sectionId: string, href: string): void }

/** Reasons mirror R1-0's own refusal facts; ⛔ no reason asserts more than those facts establish. */
export type ReviewWithheldReason = 'frozen_citation_text_unavailable' | 'observation_address_unavailable' | 'lens_not_presentable';
export interface ReviewWithheld {
  readonly observationId: string;
  readonly readingId: string;
  readonly observationKey: string;
  readonly reason: ReviewWithheldReason;
}
/** ⭐ Only the supported human fact. ⛔ Never the implementation address as the explanation. */
const WITHHELD_REASON_COPY: Record<ReviewWithheldReason, string> = {
  frozen_citation_text_unavailable: 'This observation still exists, but the passage it was made against has changed, and the passage text as MAIA read it isn’t available here to show it at that place.',
  observation_address_unavailable: 'This observation still exists, but it concerns Work structure rather than a particular prose location.',
  lens_not_presentable: 'This observation still exists, but the current Review presentation cannot yet display that lens.',
};

/**
 * R1-1A-R1 · The durable identities (observationId · readingId · observationKey · reason) travel
 * STRUCTURALLY on each item as data attributes. ⛔ None of them is writer-facing copy: a reading id
 * and an observation key are machine addresses, and the writer sees only why the observation is
 * not placeable and that it still belongs to the reading.
 */
function WithheldObservations({ items }: { items: readonly ReviewWithheld[] }) {
  return (
    <section className="fs-card" data-withheld-population="true">
      <h3>Observations not shown at their place · {items.length}</h3>
      {items.map((w) => (
        <div className="fs-find" key={w.observationId} data-withheld={w.observationId}
          data-reading-id={w.readingId} data-observation-key={w.observationKey} data-withheld-reason={w.reason}>
          <p className="fs-fb">{WITHHELD_REASON_COPY[w.reason]}</p>
        </div>
      ))}
      <p className="fs-obsnote">
        {items.length === 1 ? 'This observation still belongs to this reading.' : 'These observations still belong to this reading.'}
      </p>
    </section>
  );
}

function FindingRow({ o, citation, selected, caps, navigation }: {
  o: GovernedObservation; citation?: CitationState; selected?: boolean; caps: ReviewCapabilities; navigation?: ReviewNavigation;
}) {
  const moved = citation && citation.kind !== 'intact' ? citation : null;
  /* R1-2 · live: a location only for an exact address in the mounted context, else no control. Controlled: unchanged. */
  const returnHref = navigation ? navigation.hrefFor(o.returnTo.sectionId) : undefined;
  const navAction = caps.navigate && (!navigation || !!returnHref);
  const anyAction = navAction || caps.discuss || caps.explore;
  return (
    <div className="fs-find" data-finding={o.id} data-domain={o.domain}
      data-provenance={o.provenance.kind} data-citation={citation?.kind ?? 'intact'}
      data-selected={selected ? 'true' : 'false'}>
      <div className="fs-fbody">
        <div className="fs-obshead">
          <span className="fs-fh">{o.label}</span>
          <span className="fs-prov" data-provenance={o.provenance.kind}>
            {provenanceLabel(o.provenance)}
          </span>
        </div>
        <p className="fs-fb">{o.description}</p>

        {/* ⭐ DISCLOSURE, ⛔ not silent re-anchoring and ⛔ not a silent re-read.
            The frozen text is offered so the member can see what MAIA read. */}
        {moved ? (
          <div className="fs-moved" data-citation-changed="true">
            <div className="fs-movedline">{citationLine(moved)}</div>
            <blockquote className="fs-movedq">{moved.frozenText}</blockquote>
            <span className="fs-movedwho">what MAIA read</span>
          </div>
        ) : null}

        <div className="fs-ev" style={{ marginTop: 7 }}>
          {o.evidence.map((e) => <span className="fs-chip" key={e}>{e}</span>)}
        </div>
        {o.doesNotEstablish.includes('reader-effect') ? (
          <p className="fs-limit">A possibility, not a prediction — this doesn’t establish how a reader will respond.</p>
        ) : null}
      </div>
      {anyAction ? (
        <div className="fs-factions">
          {navAction ? (navigation && returnHref
            ? <a className="fs-btn" data-return-to={o.returnTo.sectionId} href={returnHref} onClick={(e) => { e.preventDefault(); navigation.onGo(o.returnTo.sectionId, returnHref); }}>Go to passage</a>
            : <button type="button" className="fs-btn" data-return-to={o.returnTo.sectionId}>Go to passage</button>) : null}
          {caps.discuss ? <button type="button" className="fs-btn" data-action="discuss" data-return-to={o.returnTo.sectionId}>Discuss</button> : null}
          {caps.explore ? <button type="button" className="fs-btn" data-action="explore" data-return-to={o.returnTo.sectionId}>Explore</button> : null}
        </div>
      ) : null}
    </div>
  );
}

/** ⭐ The accepted controlled room: the seam with every capability. Output byte-identical to the design witness. */
export function ReviewRoom({ view, lens = 'all', facet = 'guided' }: {
  view: ReviewView; lens?: LensId | 'all'; facet?: Facet;
}) {
  return <ReviewPresentation view={view} lens={lens} facet={facet} capabilities={CONTROLLED_REVIEW_CAPABILITIES} />;
}

export function ReviewPresentation({ view, lens = 'all', facet = 'guided', capabilities, onLens, navigation }: {
  view: ReviewView; lens?: LensId | 'all'; facet?: Facet; capabilities: ReviewCapabilities;
  /** R1-1B · a live host owns the lens filter; the tabs filter an existing reading and commission nothing. Markup unchanged. */
  onLens?: (lens: LensId | 'all') => void;
  /** R1-2 · a live host's return navigation over exact durable section addresses. Absent → controlled rendering, unchanged. */
  navigation?: ReviewNavigation;
}) {
  const caps = capabilities;
  /* R1-2 · under a live navigation, controls whose target is NOT a section address (coverage, previous reading,
     full manuscript, a highlight stand-in) are ABSENT — never a guess. The controlled path is untouched. */
  const navigableWithoutAddress = caps.navigate && !navigation;
  const shown = lens === 'all' ? view.findings : view.findings.filter((f) => f.domain === lens);
  const selected = view.selectedFindingId
    ? view.findings.find((f) => f.id === view.selectedFindingId) ?? shown[0]
    : shown[0];
  /* The paragraph the selected finding points at, if this context holds it. */
  const selectedHighlight = selected
    ? view.context.paragraphs.find((p) => p.id === selected.returnTo.sectionId)?.id
      ?? view.context.paragraphs[1]?.id
    : undefined;
  /* R1-2 · the context pane may return ONLY to the selected finding's exact durable address, present in this context —
     ⛔ never the highlight stand-in above, which is presentation, not an address. */
  const contextReturn = selected && view.context.paragraphs.some((p) => p.id === selected.returnTo.sectionId) ? selected.returnTo.sectionId : undefined;
  const contextNavigation = navigation
    ? { href: contextReturn ? navigation.hrefFor(contextReturn) : null, onGo: (href: string) => { if (contextReturn) navigation.onGo(contextReturn, href); } }
    : undefined;
  const active = view.lenses.find((l) => l.id === lens);
  const plain = LENSES.find((l) => l.id === lens)?.plain ?? '';
  const offer = active ? commissionOffer(active.availability, plain) : null;

  return (
    <>
      <CrumbBar work={view.work} place="Review" facet={caps.facet ? facet : undefined}
        actions={caps.askMaia ? <button type="button" className="fs-tool fs-tool--key">Ask MAIA</button> : undefined} />

      {/* ⭐ Tabs FILTER an existing reading. ⛔ None of them commissions one. */}
      <div className="fs-modetabs" role="tablist">
        <button type="button" role="tab" className="fs-modetab" aria-selected={lens === 'all'}
          onClick={onLens ? () => onLens('all') : undefined}>
          Everything
        </button>
        {view.lenses.map(({ id }) => {
          const meta = LENSES.find((l) => l.id === id);
          return meta ? (
            <button key={id} type="button" role="tab" className="fs-modetab" aria-selected={lens === id}
              onClick={onLens ? () => onLens(id) : undefined}>
              {meta.plain}
            </button>
          ) : null;
        })}
      </div>

      <div className="fs-pane" data-stage="review">
        <div className="fs-reviewgrid">
          <div className="fs-col" style={{ gap: 16 }}>
          <div className="fs-phead">
            <div>
              {/* ⭐ V10R1 — Review is the Work's observations, ⛔ not MAIA's report.
                  Who noticed each one is carried by its provenance chip. */}
              <h2>Observations</h2>
              <p>{scopeLine(view.scope, view.kind)}</p>
            </div>
          </div>

          {/* ⭐⭐ A READING IS A READING AT A TIME, said before anything it claims. */}
          {view.changed ? (
            <StaleReading readAt={view.changed.readAt} updatedAt={view.changed.updatedAt}
              change={view.changed.change} previousLabel={view.changed.previousLabel}
              acknowledged={view.changed.acknowledged}
              capabilities={{ commission: caps.commission, acknowledge: caps.acknowledgeStale, navigate: navigableWithoutAddress }} />
          ) : (
            <div className="fs-reading" data-freshness={view.freshness.kind}>
              {freshnessLine(view.freshness)}
            </div>
          )}

          <section className="fs-card">
            <h3>{lens === 'all' ? `Findings · ${shown.length}` : plain}</h3>
            <p className="fs-obsnote">
              In the order they occur in your {view.kind}. Nothing here is ranked, and nothing is hidden.
            </p>
            <CoverageLine c={view.coverage} navigable={navigableWithoutAddress} />

            {/* ⛔ No empty state. Either a reading exists and said nothing, or it
                does not exist and the surface says which — ⛔ never one list for both. */}
            {active && active.availability.kind === 'not-read' ? (
              <div className="fs-lensbody" style={{ padding: '14px 0 2px' }}>
                {availabilityLine(active.availability, plain)}{' '}
                {offer && caps.commission ? <button type="button" className="fs-goto" data-commission={lens}>{offer} →</button> : null}
              </div>
            ) : active && active.availability.kind === 'read-nothing-noticed' ? (
              <div className="fs-lensbody" style={{ padding: '14px 0 2px' }}>
                {availabilityLine(active.availability, plain)}
              </div>
            ) : (
              shown.map((f) => (
                <FindingRow key={f.id} o={f} citation={view.citations?.[f.id]} navigation={navigation}
                  selected={f.id === selected?.id} caps={caps} />
              ))
            )}
          </section>

          {/* R1-1A · observations that exist but cannot be placed — identity and reason, never silence. */}
          {view.withheld && view.withheld.length > 0 ? <WithheldObservations items={view.withheld} /> : null}

          {/* ⭐ The writer contributes — ⛔ not just consumes. */}
          {caps.ownObservation ? (
            <OwnObservation placeLabel={view.scope.kind === 'chapter' ? view.scope.label : 'this work'}
              draft="The pacing slows here. The longer sentence followed by two shorter ones creates a felt exhale — it mirrors Clara’s shift from holding on to letting go."
              themes={['Pacing', 'Change', 'Clara']} />
          ) : null}

          {view.map ? <ContinuityMap d={view.map} title={`Across your ${view.kind}`} navigable={caps.navigate} navigation={navigation} /> : null}
          </div>

          {/* ⭐⭐ THE WORK, BESIDE THE INTELLIGENCE ABOUT IT.
              Selecting a finding moves this pane to that locus. */}
          <ManuscriptContext
            chapterLabel={view.context.chapterLabel} chapterTitle={view.context.chapterTitle}
            page={view.context.page} paragraphs={view.context.paragraphs}
            highlightId={selected?.returnTo.sectionId ? view.context.paragraphs.find(
              (p) => p.id === selectedHighlight)?.id : undefined}
            findingLabel={selected?.label} navigable={caps.navigate} navigation={contextNavigation} />
        </div>
      </div>
    </>
  );
}
