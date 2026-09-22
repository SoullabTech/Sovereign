/**
 * FLAGSHIP STUDIO — WRITE
 *
 * ⭐ The manuscript owns the content area. MAIA is an ABSOLUTE layer above it,
 * never a column beside it — which is why opening or closing her cannot shift
 * the manuscript's width, move its prose vertically, change scroll position or
 * lose the passage. F3/V2 hold by construction.
 *
 * ⭐ Pure function of `StudioState`. ⛔ No hooks, no fetch, no local state.
 */

import * as React from 'react';
import type {
  Alternative, AlternativeSet, Phase, RevisionEvent, StudioState,
} from '../../../lib/writersStudio/studio/machine';
import { CrumbBar } from './StudioChrome';
import type { Facet } from './flagshipTokens';

export interface Paragraph {
  readonly id: string;
  readonly text: string;
  /** Split for an in-place diff: the words a revision would replace. */
  readonly target?: string;
}

export interface ManuscriptView {
  readonly work: string;
  readonly chapterLabel: string;
  readonly chapterTitle: string;
  readonly epigraph?: { readonly text: string; readonly attribution: string };
  readonly paragraphs: readonly Paragraph[];
  readonly heldParagraphId?: string;
  readonly words: number;
  readonly wordDelta?: number;
}

export type MaiaTab = 'Discuss' | 'Revise' | 'Teach' | 'Reason' | 'What MAIA read';
/** ⛔ Filters over one conversation. ⛔ None of them commissions a new reading. */
const TABS: readonly MaiaTab[] = ['Discuss', 'Revise', 'Teach', 'Reason', 'What MAIA read'];

export interface MaiaCopy {
  readonly memberAsk?: string;
  readonly opening: string;
  readonly noticed?: readonly string[];
  /** ⛔ Always present on the Reason tab. No coverage discharges these. */
  readonly limits?: string;
  readonly coverage?: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   ALTERNATIVES — peer cards

   ⛔ NO ORDINAL NUMBERING. ⛔ No default, no winner, no visual ranking.
   ⭐ Every card's action is `Read in context`; ⛔ `Apply` is not reachable here.
   ══════════════════════════════════════════════════════════════════════════ */

function AlternativeCard({ alt, reading }: { alt: Alternative; reading?: boolean }) {
  const keep = alt.text === null;
  return (
    <div className="fs-alt" data-alternative={alt.id} data-keep={keep ? 'true' : 'false'}
      data-reading={reading ? 'true' : 'false'}>
      <div className="fs-altname">{alt.name}</div>
      {alt.text ? <p className="fs-alttx">{alt.text}</p> : null}
      <p className="fs-altwhy">{alt.rationale}</p>
      {keep ? null : reading ? (
        <span className="fs-reading">Reading this one in place</span>
      ) : (
        <button type="button" className="fs-readctx" data-event="READ_IN_CONTEXT"
          data-alternative={alt.id}>Read in context</button>
      )}
    </div>
  );
}

function Alternatives({ set, reading }: { set: AlternativeSet; reading?: string | null }) {
  return (
    <div className="fs-alts" data-alternatives="peer" data-ranked="false">
      {set.items.map((a) => <AlternativeCard key={a.id} alt={a} reading={a.id === reading} />)}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIA — anchored, dismissible, locus-bound
   ══════════════════════════════════════════════════════════════════════════ */

export function MaiaPanel({ phase, copy, tab, heldEcho }: {
  phase: Phase; copy: MaiaCopy; tab: MaiaTab;
  /** ⭐ The held sentence, echoed at the head of the sheet.
   *  On a phone the contextual layer is a sheet over the page, so the passage it
   *  discusses would sit behind it. ⛔ Scrolling the prose out from under the
   *  sheet would move the member's place to make room for MAIA. Instead the
   *  passage TRAVELS WITH THE CONVERSATION: the manuscript is left exactly where
   *  it was, and what MAIA is talking about is always on screen.
   *  ⛔ Hidden on viewports where she is anchored beside the prose — there it
   *  would be a redundant second copy of a visible sentence. */
  heldEcho?: string;
}) {
  /* ⭐ The peer set stays visible while one is being read in place. Otherwise
     the panel goes hollow at exactly the moment the member is deciding, and the
     four directions they are choosing among vanish from view. */
  const showAlts = phase.name === 'alternatives' || phase.name === 'undone'
    || phase.name === 'context-review';
  const reading = phase.name === 'context-review' ? phase.selected : null;
  return (
    <aside className="fs-maia" data-maia-anchored="true" aria-label="MAIA, at this passage">
      <div className="fs-mhead">
        <div className="fs-mdot" aria-hidden="true" />
        <div className="fs-mname">MAIA</div>
        <button type="button" className="fs-mx" data-event="RELEASE" aria-label="Close MAIA">✕</button>
      </div>
      <div className="fs-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" className="fs-tab"
            aria-selected={t === tab} data-tab={t}>{t}</button>
        ))}
      </div>
      <div className="fs-mbody">
        {heldEcho ? (
          <blockquote className="fs-heldquote" data-held-echo="true">{heldEcho}</blockquote>
        ) : null}
        {copy.memberAsk ? <div className="fs-ask">{copy.memberAsk}</div> : null}
        <p className="fs-say">{copy.opening}</p>
        {copy.noticed && copy.noticed.length > 0 ? (
          <>
            <p className="fs-notice"><strong>What I notice</strong></p>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--secondary)', fontSize: 12.5, lineHeight: 1.6 }}>
              {copy.noticed.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </>
        ) : null}
        {showAlts && 'candidates' in phase ? <Alternatives set={phase.candidates} reading={reading} /> : null}
        {copy.coverage ? <p className="fs-notice" data-coverage="true">{copy.coverage}</p> : null}
        {copy.limits ? <p className="fs-limit" data-non-conclusions="permanent">{copy.limits}</p> : null}
      </div>
      <div className="fs-minput">
        <div className="f">Tell MAIA what you’d like to explore…</div>
        <div className="fs-send" aria-hidden="true">→</div>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CONTEXTUAL BARS
   ══════════════════════════════════════════════════════════════════════════ */

function ReadInContextBar({ name }: { name: string }) {
  return (
    <div className="fs-float fs-float--gate" data-apply-gate="open">
      <span style={{ color: 'var(--secondary)' }}>
        Reading <strong>{name}</strong> in place. Nothing is applied yet.
      </span>
      <button type="button" className="fs-btn fs-btn--key" data-event="APPLY">Use this revision</button>
      <button type="button" className="fs-btn" data-event="BACK_TO_ALTERNATIVES">Back to the options</button>
    </div>
  );
}

function AppliedReceipt({ applied, place }: { applied: RevisionEvent; place: string }) {
  return (
    <div className="fs-float fs-float--receipt" data-receipt="applied">
      <div className="fs-ok" aria-hidden="true">✓</div>
      <div>
        <div className="fs-rtitle">Revision applied — “{applied.alternativeName}”</div>
        <div className="fs-rsub">One sentence, in {place}. You can undo this, or see what changed.</div>
      </div>
      <button type="button" className="fs-btn" data-event="UNDO">Undo</button>
      <button type="button" className="fs-btn" data-event="OPEN_OVERLAY" data-overlay="history">View history</button>
    </div>
  );
}

export interface VersionEntry {
  readonly when: string; readonly time: string; readonly what: string; readonly current?: boolean;
}

export function VersionHistoryDrawer({ entries }: { entries: readonly VersionEntry[] }) {
  return (
    <aside className="fs-drawer" data-overlay="history" aria-label="Version history">
      <div className="fs-dhead">
        <h3>Version history</h3>
        <button type="button" className="fs-mx" style={{ marginLeft: 'auto' }}
          data-event="CLOSE_OVERLAY" aria-label="Close version history">✕</button>
      </div>
      <div className="fs-dbody">
        {entries.map((e) => (
          <div className="fs-ver" key={`${e.when}-${e.time}`} data-current={e.current ? 'true' : 'false'}>
            <div className="fs-vdot" aria-hidden="true" />
            <div>
              <div className="fs-vwhen">{e.when}</div>
              <div className="fs-vtime">{e.time}</div>
              <div className="fs-vwhat">{e.what}</div>
            </div>
          </div>
        ))}
        <button type="button" className="fs-btn" style={{ marginTop: 14, alignSelf: 'flex-start' }}>
          Compare versions
        </button>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE ROOM
   ══════════════════════════════════════════════════════════════════════════ */

function renderParagraph(p: Paragraph, view: ManuscriptView, state: StudioState, candidate: string | null) {
  const held = p.id === view.heldParagraphId;
  const phase = state.phase.name;
  if (!held || !p.target) {
    return <p className="fs-p" key={p.id} data-held={held ? 'true' : 'false'} data-paragraph={p.id}>{p.text}</p>;
  }
  const [before, after] = p.text.split(p.target);
  const body = phase === 'context-review' && candidate
    ? <>{before}<span className="fs-del">{p.target}</span>{' '}<span className="fs-ins">{candidate}</span>{after}</>
    : (phase === 'applied' && candidate)
      ? <>{before}<span className="fs-ins">{candidate}</span>{after}</>
      : <>{before}{p.target}{after}</>;
  return (
    <p className="fs-p" key={p.id} data-held="true" data-paragraph={p.id}>{body}</p>
  );
}

export function WriteRoom({ state, view, copy, tab = 'Revise', history, facet = 'guided' }: {
  state: StudioState; view: ManuscriptView; copy: MaiaCopy;
  tab?: MaiaTab; history?: readonly VersionEntry[]; facet?: Facet;
}) {
  const heldPara = view.paragraphs.find((p) => p.id === view.heldParagraphId);
  const heldEcho = heldPara?.target
    ? `…${heldPara.target}.`
    : heldPara ? `${heldPara.text.slice(0, 120)}…` : undefined;
  const phase = state.phase;
  const maiaOpen = phase.name !== 'writing';
  const selectedId = phase.name === 'context-review' ? phase.selected
    : phase.name === 'applied' ? phase.applied.alternativeId : null;
  const candidates: AlternativeSet | null = 'candidates' in phase ? phase.candidates : null;
  const selected: Alternative | null =
    selectedId && candidates ? candidates.items.find((a) => a.id === selectedId) ?? null : null;
  const candidateText = selected?.text ?? null;
  const place = `§ ${view.chapterLabel.replace(/^Chapter\s*/i, '')}`;

  return (
    <>
      <CrumbBar
        work={view.work} chapter={view.chapterTitle} place={place} facet={facet}
        saved={state.history.length > 0 ? `Saved · v${state.version}` : 'Saved 2m ago'}
        actions={<>
          <button type="button" className="fs-tool">Aa</button>
          <button type="button" className="fs-tool" aria-label="Voice note">◍</button>
          <button type="button" className="fs-tool">Comment</button>
          <button type="button" className="fs-tool fs-tool--gold" data-event="HOLD_PASSAGE">Ask MAIA</button>
        </>}
      />
      <div className="fs-stage" data-stage="write">
        <article className="fs-ms" data-manuscript="true">
          <div className="fs-chlabel">{view.chapterLabel}</div>
          <h1 className="fs-chtitle">{view.chapterTitle}</h1>
          {view.epigraph ? (
            <>
              <p className="fs-epi">{view.epigraph.text}</p>
              <p className="fs-epiwho">— {view.epigraph.attribution}</p>
            </>
          ) : null}
          {view.paragraphs.map((p) => renderParagraph(p, view, state, candidateText))}
        </article>

        {maiaOpen ? <MaiaPanel phase={phase} copy={copy} tab={tab} heldEcho={heldEcho} /> : null}
        {phase.name === 'context-review' && selected ? <ReadInContextBar name={selected.name} /> : null}
        {phase.name === 'applied' ? <AppliedReceipt applied={phase.applied} place={place} /> : null}
        {state.overlay === 'history' && history ? <VersionHistoryDrawer entries={history} /> : null}
      </div>
      <div className="fs-foot">
        <span>{view.chapterLabel}</span>
        <span>·</span>
        <span>
          {view.words.toLocaleString('en-US')} words
          {view.wordDelta ? <span className="fs-delta"> (+{view.wordDelta})</span> : null}
        </span>
        <span className="fs-sp" />
        <button type="button" className="fs-tool">Focus</button>
        <button type="button" className="fs-tool">Aa</button>
      </div>
    </>
  );
}
