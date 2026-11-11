'use client';
/**
 * DEVELOP, AS A STAGE — the writer's work at the centre; MAIA beside it as an editorial companion.
 *
 *   ┌ title · chapter · Edit in Write · More ──────────────┐ ┌ MAIA ───────────────────────┐
 *   │ THE WHOLE CHAPTER, in the writer's words, full height │ │ one conversation              │
 *   │ (select words → "Ask MAIA about this")                │ │ what she read (always shown)  │
 *   └───────────────────────────────────────────────────────┘ └──────────────────────────────┘
 *
 * Founder walk 2026-11-09 failed the earlier stage on composition ("I want to see my work … not 50 buttons"). Design basis:
 * docs/research/writers-studio/MENTOR_PRESENCE_UX_RESEARCH_2026-11-09.md (six moments, approved for implementation 2026-11-09).
 * The chapters are in the Studio's collapsible manuscript rail on the left. Everything else that is not the chapter or the conversation — the plan, what she read in full,
 * ways in, the book's kind, reading permission, settled decisions — lives behind ONE quiet "More" control. What she read for her last
 * answer stays visible beside the conversation (L8). Nothing here volunteers advice; MAIA speaks when the writer asks (T5).
 * ⛔ Read-only here: this component never edits, never sends, never composes words in the writer's mouth. Selecting words and choosing
 * "Ask MAIA about this" only places the writer's own words in the composer, unsent.
 */
import type { ReactNode } from 'react';
import ReadScopeControl from '@/app/writers-studio/canvas/ReadScopeControl';
import SettledDecisions from '@/app/writers-studio/canvas/SettledDecisions';
import { useEffect, useRef, useState } from 'react';
import { excerptOf, markTerm } from '@/lib/writersStudio/recurringThreads';
import { setWorkKindClient } from '@/lib/writersStudio/workKindClient';
import type { WorkKind } from '@/lib/writersStudio/workKindShared';
import type { StoredPlan, StepEvent } from '@/lib/writersStudio/developmentPlanStore';
import { STEP_STATUS, type StepEdit, type StepStatus } from '@/lib/writersStudio/developmentPlan';
import type { AttentionItem } from '@/lib/writersStudio/studio/attentionMap';

/* ── Founder design 2026-11-11 ("it shouldn't be a treasure hunt"): the ways to explore are always in view above the chapter; MAIA reads the
   chapter the writer opened (only under the writer's standing read permission) while the chapter stays exactly where it is; when she has
   read it, the words her observations quote are marked in the writer's own text, and beside the conversation she says what she found and
   asks what the writer would like to do. An observation is an invitation to attention, never an instruction: nothing is selected, scrolled,
   focused or sent for the writer. */
export type StageReadingStatus = 'idle' | 'reading' | 'ready' | 'error';
export interface StageReading {
  status: StageReadingStatus;
  progress: string | null;
  error: string | null;
  /** the chapter MAIA reads: its label and how many words it holds (counted from the writer's own copy, never estimated) */
  chapterLabel: string;
  chapterWords: number | null;
  items: readonly AttentionItem[];
}
export interface StageEditorialPass { status: 'none' | 'running' | 'ready' | 'error'; progress: string | null; error: string | null }
export interface StageWay { key: string; label: string }

/** Words in the chapter from `from` to `to` (inclusive, by manuscript position), from the writer's own text. */
export function chapterWordCount(sections: readonly StageSection[], fromId: string | null, toId: string | null): number | null {
  if (!fromId || !toId) return null;
  const a = sections.findIndex((s) => s.draftSectionId === fromId);
  const b = sections.findIndex((s) => s.draftSectionId === toId);
  if (a < 0 || b < a) return null;
  return sections.slice(a, b + 1).reduce((n, s) => n + (stripHeading(s).match(/\S+/g)?.length ?? 0), 0);
}

/** The exact phrases MAIA's observations quote (in “…” or "…", 12+ characters), each with the number of the item that quotes it.
 *  Only verbatim quotations are ever marked; nothing is matched loosely, so a mark is evidence and never a guess. */
export function evidenceSpans(items: readonly AttentionItem[]): { text: string; n: number }[] {
  const out: { text: string; n: number }[] = [];
  const seen = new Set<string>();
  items.forEach((item, i) => {
    const sources = [item.notice, item.whyItMatters, ...item.evidence.map((e) => e.observation)];
    for (const src of sources) {
      for (const m of (src ?? '').matchAll(/[“"]([^”"]{12,400})[”"]/g)) {
        const t = m[1]!.trim().replace(/[.,;:]$/, '');
        if (t.length >= 12 && !seen.has(t)) { seen.add(t); out.push({ text: t, n: i + 1 }); }
      }
    }
  });
  return out;
}

/** Split a paragraph at the exact evidence phrases it contains; non-overlapping, first occurrence of each phrase. */
export function markEvidence(paragraph: string, spans: readonly { text: string; n: number }[]): { text: string; n: number | null }[] {
  const hits: { at: number; end: number; n: number }[] = [];
  for (const sp of spans) {
    const at = paragraph.indexOf(sp.text);
    if (at < 0) continue;
    const end = at + sp.text.length;
    if (hits.some((h) => at < h.end && end > h.at)) continue;
    hits.push({ at, end, n: sp.n });
  }
  hits.sort((x, y) => x.at - y.at);
  const pieces: { text: string; n: number | null }[] = [];
  let pos = 0;
  for (const h of hits) {
    if (h.at > pos) pieces.push({ text: paragraph.slice(pos, h.at), n: null });
    pieces.push({ text: paragraph.slice(h.at, h.end), n: h.n });
    pos = h.end;
  }
  if (pos < paragraph.length) pieces.push({ text: paragraph.slice(pos), n: null });
  return pieces.length ? pieces : [{ text: paragraph, n: null }];
}

export interface StageSection {
  draftSectionId: string; heading: string | null; body: string | null; position: number;
  /** The heading level from the writer's confirmed structure (1 = part/chapter … 3). Null/absent = unknown: shown flat, never guessed. */
  headingDepth?: number | null;
}

/* Founder (2026-11-09): "this dropdown could work if it had proper organization, indentation". Indent by the CONFIRMED level only. */
const INDENT = '\u00A0\u00A0\u00A0\u00A0';
export const chapterOptionLabel = (s: StageSection): string => {
  const d = s.headingDepth;
  const label = s.heading?.trim() || `Section ${s.position + 1}`;
  return typeof d === 'number' && d >= 1 && d <= 3 ? `${INDENT.repeat(d - 1)}${d === 1 ? label.toUpperCase() : label}` : label;
};

const stripHeading = (s: StageSection): string => {
  let body = s.body ?? '';
  const h = s.heading?.trim();
  if (h && body.trimStart().startsWith(h)) body = body.trimStart().slice(h.length);
  return body.trim();
};
const labelOf = (s: StageSection): string => s.heading?.trim() || `Section ${s.position + 1}`;

const ink = { color: 'inherit' } as const;
const hair = '1px solid color-mix(in srgb, currentColor 16%, transparent)';

export function DevelopStage(props: {
  workTitle: string | null;
  sections: readonly StageSection[];
  currentId: string | null;
  onSelect: (id: string) => void;
  /** Plain-language ways in. They fill the composer with the writer's OWN sentence to send or change; they never send themselves. */
  starters: readonly string[];
  onStarter: (words: string) => void;
  onOpenWrite: () => void;
  onMoreWays: () => void;
  /** the writer selected words in the chapter and chose to ask about them: the exact words go into the composer, unsent */
  onAskAbout?: (words: string) => void;
  /** the chapters MAIA was handed for her last answer (ids + headings); their text is shown here from the writer's own copy, in place */
  lastRead: readonly { sectionId: string; label: string | null }[] | null;
  /** the writer's plan (MAIA's grounded steps, edited by the writer). A plan never changes the manuscript. */
  plan: { plan: StoredPlan | null; staleStepIds: readonly string[]; unverifiedStepIds?: readonly string[]; events?: Readonly<Record<string, StepEvent>>; decisionsChanged?: boolean | null; coverage?: { read: number; total: number; notRead: readonly string[] } } | null;
  planBusy: boolean;
  planNote: string | null;
  onMakePlan: (ask: string) => void;
  onEditPlan: (edits: StepEdit[]) => void;
  /** open the passage desk on this step's exact words; the writer decides there */
  onWorkOnStep: (stepId: string) => void;
  /** delete the whole plan, its earlier versions and its links; the manuscript is not touched */
  onDeletePlan?: () => void;
  /** what lives behind the one quiet "More" control besides the plan: the book's kind, reading permission, settled decisions */
  holdings?: ReactNode;
  /** MAIA's "show" offer, clicked by the writer: open More at this place (`data-develop-place`). */
  openAt?: { place: string; n: number } | null;
  /** the ways to explore, always in view above the chapter (lenses), and the whole-book editorial pass */
  ways?: readonly StageWay[];
  onWay?: (key: string) => void;
  editorialPass?: StageEditorialPass;
  onEditorialPass?: () => void;
  onOpenEditorialPass?: () => void;
  /** MAIA's reading of the chapter the writer is on; the chapter itself never moves while she reads */
  reading?: StageReading | null;
  onReadChapter?: () => void;
}) {
  const { sections } = props;
  const [openExcerpt, setOpenExcerpt] = useState<string | null>(null);
  const [focusAnchor, setFocusAnchor] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [planAsk, setPlanAsk] = useState('');
  const [more, setMore] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const idx = Math.max(0, sections.findIndex((s) => s.draftSectionId === props.currentId));
  const current = sections[idx] ?? null;
  const text = current ? stripHeading(current) : '';
  const spans = props.reading?.status === 'ready' ? evidenceSpans(props.reading.items) : [];
  const citedHere = props.reading?.status === 'ready' && current
    ? props.reading.items.map((it, i) => (it.sectionIds.includes(current.draftSectionId) ? i + 1 : 0)).filter(Boolean)
    : [];
  const paragraphs = text ? text.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean) : [];
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!props.openAt) return;
    setMore(true);
    const place = props.openAt.place;
    const t = window.setTimeout(() => rootRef.current?.querySelector(`[data-develop-place="${place}"]`)?.scrollIntoView?.({ block: 'start' }), 0);
    return () => window.clearTimeout(t);
  }, [props.openAt]);
  const quiet = { background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', fontSize: 12, opacity: .85 } as const;

  /* Shared attention: the writer selects words in their chapter; one quiet offer appears to talk about exactly those words. Nothing is sent. */
  const notePick = (root: HTMLElement) => {
    if (typeof window === 'undefined' || !props.onAskAbout) return;
    const sel = window.getSelection();
    const words = sel && !sel.isCollapsed && sel.anchorNode && root.contains(sel.anchorNode) ? sel.toString().replace(/\s+/g, ' ').trim() : '';
    setPicked(words.length >= 2 ? words.slice(0, 600) : null);
  };

  return (
    <div ref={rootRef} data-develop-stage="true" style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, height: '100%', padding: '8px 6px 12px', boxSizing: 'border-box', ...ink }}>
      {/* one line: where you are, and one quiet way to everything else */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto', fontSize: 13 }}>
        <span style={{ opacity: .75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{props.workTitle ?? 'Your Work'}</span>
        {sections.length > 0 ? (
          <select aria-label="Chapter" data-develop-chapter-select="true" value={current?.draftSectionId ?? ''} onChange={(e) => props.onSelect(e.target.value)}
            style={{ font: 'inherit', fontSize: 13, color: 'inherit', background: 'none', border: hair, borderRadius: 6, padding: '3px 6px', maxWidth: '40%' }}>
            {sections.map((s) => <option key={s.draftSectionId} value={s.draftSectionId} data-depth={s.headingDepth ?? undefined}>{chapterOptionLabel(s)}</option>)}
          </select>
        ) : null}
        <span style={{ flex: 1 }} />
        {props.reading && props.onReadChapter && (props.reading.status === 'idle' || props.reading.status === 'error') ? (
          <button type="button" data-develop-read-chapter="true" onClick={props.onReadChapter}
            style={{ font: 'inherit', fontSize: 13, cursor: 'pointer', color: 'inherit', background: 'color-mix(in srgb, currentColor 10%, transparent)', border: hair, borderRadius: 999, padding: '4px 14px', whiteSpace: 'nowrap' }}>
            Read this chapter with MAIA
          </button>
        ) : null}
        <button type="button" data-develop-edit-in-write="true" onClick={props.onOpenWrite} style={quiet}>Edit in Write</button>
        <button type="button" data-develop-more="true" aria-expanded={more} onClick={() => setMore((v) => !v)}
          style={{ font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'inherit', background: more ? 'color-mix(in srgb, currentColor 10%, transparent)' : 'none', border: hair, borderRadius: 999, padding: '3px 12px' }}>
          {more ? 'Back to the chapter' : 'More'}
        </button>
      </header>

      {/* the ways to explore: always in view, never behind a menu */}
      {props.ways && props.ways.length > 0 && !more ? (
        <nav aria-label="Ways to explore your Work" data-develop-ways="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: '0 0 auto' }}>
          {props.ways.map((w) => (
            <button key={w.key} type="button" data-develop-way={w.key} onClick={() => props.onWay?.(w.key)}
              style={{ font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 999, padding: '3px 11px' }}>
              {w.label}
            </button>
          ))}
          {props.editorialPass && props.onEditorialPass ? (
            props.editorialPass.status === 'ready' ? (
              <button type="button" data-develop-way="editorial-pass" data-develop-pass="ready" onClick={props.onOpenEditorialPass}
                style={{ font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'inherit', background: 'color-mix(in srgb, currentColor 10%, transparent)', border: hair, borderRadius: 999, padding: '3px 11px' }}>
                Whole book · editorial pass ready
              </button>
            ) : (
              <button type="button" data-develop-way="editorial-pass" data-develop-pass={props.editorialPass.status} disabled={props.editorialPass.status === 'running'} onClick={props.onEditorialPass}
                style={{ font: 'inherit', fontSize: 12, cursor: props.editorialPass.status === 'running' ? 'default' : 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 999, padding: '3px 11px' }}>
                Whole book · editorial pass
              </button>
            )
          ) : null}
        </nav>
      ) : null}

      {/* one quiet line: what MAIA is reading, or has read. It never replaces or moves the chapter. */}
      {!more && (props.reading?.status === 'reading' || props.reading?.status === 'ready' || props.reading?.status === 'error'
        || props.editorialPass?.status === 'running' || props.editorialPass?.status === 'error') ? (
        <div role="status" aria-live="polite" data-develop-reading-line={props.reading?.status ?? 'none'}
          style={{ flex: '0 0 auto', fontSize: 12, opacity: .85, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {props.reading?.status === 'reading' ? <span>MAIA is reading {props.reading.chapterLabel}. Keep writing or talking; she won’t interrupt.{props.reading.progress ? ` ${props.reading.progress}` : ''}</span> : null}
          {props.reading?.status === 'ready' ? <span>MAIA has a reading of {props.reading.chapterLabel} · {props.reading.items.length} thing{props.reading.items.length === 1 ? '' : 's'} noticed{spans.length > 0 ? '; the words she quotes are marked in your text' : ''}.</span> : null}
          {props.reading?.status === 'error' ? <span>{props.reading.error ?? 'MAIA could not finish reading this chapter. Nothing in your writing changed.'}</span> : null}
          {props.editorialPass?.status === 'running' ? <span data-develop-pass-progress="true">Editorial pass of the whole book: {props.editorialPass.progress ?? 'MAIA is reading…'} Keep this page open until she finishes.</span> : null}
          {props.editorialPass?.status === 'error' ? <span>{props.editorialPass.error}</span> : null}
        </div>
      ) : null}

      {more ? (
        /* behind the one quiet control: the plan, what she read, ways in, and what she holds */
        <div data-develop-more-panel="true" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18, paddingRight: 4 }}>
          {/* Founder (live, 2026-11-09): the per-chapter strip truncated to "S", "El", "P" in a long book, and the recurring-word counts read
              as noise. Both removed. Chapters are on the left again, in the Studio's own collapsible manuscript rail. */}
          {/* the plan: MAIA's grounded steps, the writer's to edit. It never changes the manuscript; a step is opened in the passage desk. */}
          <section aria-label="Your plan" data-develop-plan="true" data-develop-place="plan" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!props.plan?.plan ? (
              asking ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <label htmlFor="develop-plan-ask" style={{ fontSize: 12, opacity: .8, width: '100%' }}>In your words, what do you want a plan for?</label>
                  <input id="develop-plan-ask" value={planAsk} onChange={(e) => setPlanAsk(e.target.value)} maxLength={1000}
                    placeholder="e.g. help me connect Chapter 7 to what I set up earlier" style={{ flex: '1 1 260px', font: 'inherit', padding: '6px 10px', borderRadius: 8, border: hair, background: 'none', color: 'inherit' }} />
                  <button type="button" disabled={props.planBusy || planAsk.trim().length === 0} onClick={() => props.onMakePlan(planAsk.trim())}
                    style={{ font: 'inherit', cursor: 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 999, padding: '5px 14px' }}>{props.planBusy ? 'Making a plan…' : 'Make a plan'}</button>
                  <button type="button" onClick={() => setAsking(false)} style={{ font: 'inherit', cursor: 'pointer', color: 'inherit', background: 'none', border: 'none', textDecoration: 'underline', fontSize: 12 }}>Not now</button>
                </div>
              ) : (
                <button type="button" onClick={() => setAsking(true)} data-develop-plan-start="true"
                  style={{ alignSelf: 'flex-start', font: 'inherit', fontSize: 13, cursor: 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 999, padding: '5px 14px' }}>
                  Turn this into a plan
                </button>
              )
            ) : (
              <div style={{ border: hair, borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7 }}>Your plan</div>
                <p style={{ margin: '4px 0 2px', fontSize: 14 }}>{props.plan.plan.summary || 'Steps for your work.'}</p>
                <p style={{ margin: '0 0 8px', fontSize: 12, opacity: .7 }}>You asked: “{props.plan.plan.ask}”. Nothing here changes your work; each step opens the passage so you decide.
                  {' '}Removing a step takes it out of the plan; earlier versions of the plan keep it until you{' '}
                  {props.onDeletePlan ? <button type="button" data-develop-plan-delete="true" onClick={() => { if (typeof window === 'undefined' || window.confirm('Delete this plan, its earlier versions and its record of changes you applied from it? Your manuscript is not touched.')) props.onDeletePlan!(); }}
                    style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', padding: 0 }}>delete the plan</button> : 'delete the plan'}.</p>
                {props.plan.coverage && props.plan.coverage.notRead.length > 0 ? <p role="note" data-develop-plan-coverage="true" style={{ margin: '0 0 8px', fontSize: 12 }}>MAIA made this plan from {props.plan.coverage.read} of your {props.plan.coverage.total} chapters; the book is longer than one reading. Not read for this plan: {props.plan.coverage.notRead.slice(0, 6).join('; ')}{props.plan.coverage.notRead.length > 6 ? `, and ${props.plan.coverage.notRead.length - 6} more` : ''}.</p> : null}
                {props.plan.decisionsChanged === true ? <p role="status" data-develop-plan-decisions-changed="true" style={{ margin: '0 0 8px', fontSize: 12 }}>What you have settled about this book has changed since this plan was made. The steps may not fit your decisions now; ask MAIA for a fresh plan when you are ready.</p> : null}
                {props.plan.plan.steps.length === 0 ? <p style={{ margin: 0, opacity: .8 }}>MAIA could not ground a step in your text this time.</p> : null}
                <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {props.plan.plan.steps.map((st, i) => {
                    const sec = sections.find((x) => x.draftSectionId === st.chapterId);
                    const stale = props.plan!.staleStepIds.includes(st.id);
                    return (
                      <li key={st.id} data-develop-plan-step={st.id} style={{ borderTop: i === 0 ? 'none' : hair, paddingTop: i === 0 ? 0 : 10, opacity: st.status === 'dropped' ? .55 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12 }}>
                          <strong style={{ fontWeight: 500 }}>{i + 1}. {sec ? labelOf(sec) : 'A chapter'}</strong>
                          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <select aria-label={`Status of step ${i + 1}`} value={st.status} onChange={(e) => props.onEditPlan([{ id: st.id, status: e.target.value as StepStatus }])}
                              style={{ font: 'inherit', fontSize: 12, background: 'none', color: 'inherit', border: hair, borderRadius: 6 }}>
                              {STEP_STATUS.map((x) => <option key={x} value={x}>{x === 'open' ? 'To do' : x === 'working' ? 'Working on it' : x === 'done' ? 'Resolved' : 'Set aside'}</option>)}
                            </select>
                            <button type="button" onClick={() => props.onEditPlan([{ id: st.id, remove: true }])} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', fontSize: 12 }}>Remove</button>
                          </span>
                        </div>
                        <blockquote style={{ margin: '6px 0', padding: '0 0 0 10px', borderLeft: hair, fontFamily: "'Iowan Old Style','Charter',Georgia,serif", fontSize: 15, opacity: .9 }}>“{st.anchor}”</blockquote>
                        <textarea aria-label={`What to try in step ${i + 1}`} defaultValue={st.direction} rows={2} maxLength={500}
                          onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== st.direction) props.onEditPlan([{ id: st.id, direction: v }]); }}
                          style={{ width: '100%', font: 'inherit', fontSize: 14, padding: '6px 8px', borderRadius: 8, border: hair, background: 'none', color: 'inherit', boxSizing: 'border-box' }} />
                        {st.why ? <p style={{ margin: '4px 0 0', fontSize: 12, opacity: .7 }}>Why: {st.why}</p> : null}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, fontSize: 12 }}>
                          {sec ? <button type="button" onClick={() => { props.onSelect(sec.draftSectionId); setFocusAnchor(st.anchor); }} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>Go to the passage</button> : null}
                          {sec ? <button type="button" data-develop-plan-work={st.id} onClick={() => props.onWorkOnStep(st.id)} style={{ background: 'none', border: hair, borderRadius: 999, color: 'inherit', cursor: 'pointer', font: 'inherit', padding: '3px 12px' }}>Work on this passage</button> : null}
                          {(() => { const ev = props.plan!.events?.[st.id]; if (!ev) return null;
                            const when = new Date(ev.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                            return <span data-develop-plan-event={ev.state} style={{ opacity: .85 }}>{ev.state === 'applied'
                              ? `You applied a change here in the passage desk (${when}).${st.status !== 'done' ? ' Whether that resolves the step is yours to say.' : ''}`
                              : `You applied a change here and then undid it (${when}).`}</span>; })()}
                          {!stale && props.plan!.unverifiedStepIds?.includes(st.id) ? <span role="status" style={{ opacity: .85 }}>I can’t confirm this chapter is the one MAIA read for the plan; check the step still fits.</span> : null}
                          {stale ? <span role="status" style={{ opacity: .85 }}>This chapter has changed since the plan was made; check the step still fits.</span> : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {focusAnchor ? <button type="button" onClick={() => setFocusAnchor(null)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', fontSize: 12 }}>Clear the highlight</button> : null}
              </div>
            )}
            {props.planNote ? <p role="status" data-develop-plan-note="true" style={{ margin: 0, fontSize: 12, opacity: .85 }}>{props.planNote}</p> : null}
          </section>

          {/* the chapters she read for her last answer, in place — from the writer's own copy; nothing is sent to show it */}
          {props.lastRead && props.lastRead.length > 0 ? (
            <section data-develop-excerpts="true" data-develop-place="read" aria-label="The chapters MAIA read for her last answer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7 }}>What she read for that answer</div>
              {props.lastRead.map((r) => {
                const sec = sections.find((x) => x.draftSectionId === r.sectionId);
                if (!sec) return null;
                const full = stripHeading(sec); const ex = excerptOf(full); const open = openExcerpt === sec.draftSectionId;
                return (
                  <div key={r.sectionId} data-develop-excerpt={r.sectionId} style={{ border: hair, borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                      <strong style={{ fontWeight: 500 }}>{labelOf(sec)}{sec.draftSectionId === current?.draftSectionId ? ' · this chapter' : ''}</strong>
                      <span style={{ display: 'flex', gap: 10 }}>
                        {sec.draftSectionId !== current?.draftSectionId ? (
                          <button type="button" onClick={() => props.onSelect(sec.draftSectionId)} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', fontSize: 12 }}>Go there</button>
                        ) : null}
                        {ex.cut ? (
                          <button type="button" aria-expanded={open} onClick={() => setOpenExcerpt(open ? null : sec.draftSectionId)} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', fontSize: 12 }}>{open ? 'Less' : 'Read it here'}</button>
                        ) : null}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0', lineHeight: 1.65, fontSize: 15, fontFamily: "'Iowan Old Style','Charter',Georgia,serif", maxHeight: open ? '28vh' : undefined, overflowY: open ? 'auto' : undefined }}>
                      {open ? full : `${ex.text}${ex.cut ? '…' : ''}`}
                    </p>
                  </div>
                );
              })}
            </section>
          ) : null}

          {props.starters.length > 0 ? (
            <div role="group" aria-label="Ways to begin" data-develop-starters="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {props.starters.map((q) => (
                <button key={q} type="button" onClick={() => { props.onStarter(q); setMore(false); }}
                  style={{ font: 'inherit', fontSize: 13, cursor: 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 999, padding: '5px 12px' }}>
                  {q}
                </button>
              ))}
              <button type="button" onClick={props.onMoreWays} style={quiet}>More ways to explore</button>
            </div>
          ) : null}
          {props.holdings ?? null}
        </div>
      ) : null}

      {/* the chapter, in the writer's own words: the whole of it, filling the centre */}
      <article aria-label={current ? `${labelOf(current)}, as you wrote it` : 'Your chapter'} data-develop-chapter={current?.draftSectionId}
        hidden={more}
        onMouseUp={(e) => notePick(e.currentTarget)} onKeyUp={(e) => notePick(e.currentTarget)}
        style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '18px 8px 40px', display: more ? 'none' : 'block' }}>
        <div style={{ maxWidth: '66ch', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 26, fontWeight: 500, fontFamily: "'Iowan Old Style','Charter',Georgia,serif" }}>
            {current ? labelOf(current) : 'Your Work'}
          </h2>
          {citedHere.length > 0 ? (
            <p data-develop-cited-here="true" style={{ margin: '-6px 0 14px', fontSize: 12, opacity: .8 }}>
              MAIA’s {citedHere.length === 1 ? 'observation' : 'observations'} {citedHere.join(' · ')} {citedHere.length === 1 ? 'comes' : 'come'} from this section.
            </p>
          ) : null}
          {paragraphs.length === 0 ? (
            <p style={{ opacity: .75, margin: 0 }}>{current ? 'This chapter has no text yet.' : 'Choose a chapter above.'}</p>
          ) : paragraphs.map((p, i) => (
            <p key={i} style={{ margin: '0 0 16px', lineHeight: 1.8, fontSize: 18, fontFamily: "'Iowan Old Style','Charter',Georgia,serif" }}>
              {!focusAnchor && spans.length > 0 ? markEvidence(p, spans).map((piece, k) => piece.n === null
                ? <span key={k}>{piece.text}</span>
                : <span key={k} data-develop-evidence={piece.n} style={{ borderBottom: '2px solid color-mix(in srgb, #7c9ce0 70%, transparent)' }}>{piece.text}<sup aria-label={`MAIA’s observation ${piece.n} quotes this`} style={{ fontFamily: 'system-ui, sans-serif', fontSize: 10, marginLeft: 2, opacity: .85 }}>{piece.n}</sup></span>)
              : markTerm(p, focusAnchor).map((piece, k) => piece.hit
                ? <mark key={k} style={{ background: 'color-mix(in srgb, #d9a441 38%, transparent)', color: 'inherit', borderRadius: 3, padding: '0 1px' }}>{piece.text}</mark>
                : <span key={k}>{piece.text}</span>)}
            </p>
          ))}
        </div>
      </article>

      {picked && !more ? (
        <div data-develop-picked="true" role="group" aria-label="The words you selected"
          style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10, border: hair, borderRadius: 10, padding: '8px 12px', fontSize: 13 }}>
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Iowan Old Style','Charter',Georgia,serif" }}>“{picked}”</span>
          <button type="button" data-develop-ask-about="true" onClick={() => { props.onAskAbout?.(picked); setPicked(null); }}
            style={{ font: 'inherit', fontSize: 13, cursor: 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 999, padding: '3px 12px', whiteSpace: 'nowrap' }}>
            Ask MAIA about this
          </button>
          <button type="button" aria-label="Clear the selection" onClick={() => { setPicked(null); window.getSelection()?.removeAllRanges(); }} style={{ ...quiet, textDecoration: 'none' }}>✕</button>
        </div>
      ) : null}
    </div>
  );
}

/** MAIA beside the work: one conversation, and — always visible, never behind a menu (L8) — which chapters she was handed for her last answer. */
export function DevelopCompanion(props: { conversation: ReactNode; lastRead: readonly { sectionId: string; label: string | null }[] | null; reading?: ReactNode; coverage?: ReactNode }) {
  /* At the top, not the bottom: the floating "Report a bug" control covered it there (founder screenshot 2026-11-09). */
  return (
    <div data-develop-companion="true" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 8, ...ink }}>
      {props.coverage ?? null}
      <p data-develop-she-read="true" aria-live="polite" style={{ flex: '0 0 auto', margin: 0, fontSize: 11, opacity: .75, borderBottom: hair, paddingBottom: 6 }}>
        {props.lastRead === null
          /* Before an answer in this visit we do not know what she was handed earlier, so we do not claim "nothing". */
          ? 'MAIA reads the chapter you open only if you have let her read your saved work; otherwise she reads what you ask. After her next answer, this line shows exactly what she read for it.'
          : props.lastRead.length === 0
            ? 'Read for her last answer: only the chapter you were on.'
            : `Read for her last answer: ${props.lastRead.map((r) => r.label ?? 'a section').join(' · ')}`}
      </p>
      {props.reading ?? null}
      <section aria-label="Talk with MAIA about this chapter" data-develop-conversation="true" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {props.conversation}
      </section>
    </div>
  );
}

const KIND_LABEL: Record<WorkKind, string> = { fiction: 'Fiction', nonfiction: 'Nonfiction', practitioner: 'A helper’s book' };

/** The writer says what kind of book this is. One quiet line; "Not now" is always there; nothing is guessed from the text. */
function KindControl(props: { workId: string; kind: WorkKind | null | undefined; onKind: (k: WorkKind | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const choose = async (k: WorkKind | null) => {
    setBusy(true); setFailed(false);
    const r = await setWorkKindClient(props.workId, k);
    if (r === undefined) setFailed(true); else props.onKind(r);
    setBusy(false);
  };
  const btn = { background: 'transparent', border: '1px solid currentColor', borderRadius: 6, padding: '2px 8px', font: 'inherit', cursor: 'pointer', opacity: busy ? 0.5 : 1 } as const;
  if (props.kind === undefined) return <span style={{ opacity: .75 }}>Could not check this just now.</span>;
  return (
    <div data-develop-kind="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {props.kind ? (
        <>
          <span>{KIND_LABEL[props.kind]}</span>
          <button type="button" disabled={busy} style={btn} onClick={() => void choose(null)}>Change</button>
        </>
      ) : (
        <>
          <span style={{ width: '100%', opacity: .8 }}>What kind of book is this? It shapes the questions MAIA asks.</span>
          {(['fiction', 'nonfiction', 'practitioner'] as const).map((k) => (
            <button key={k} type="button" disabled={busy} style={btn} onClick={() => void choose(k)}>{KIND_LABEL[k]}</button>
          ))}
        </>
      )}
      {failed ? <span role="status">That could not be saved just now.</span> : null}
    </div>
  );
}

/** Behind the stage's one quiet "More" control: the book's kind, what MAIA may read, and what the writer has settled. (What she read for her
 *  last answer is NOT here: it stays visible beside the conversation, in `DevelopCompanion`.) */
export function DevelopHoldings(props: {
  manuscriptId: string; workId: string;
  kind: WorkKind | null | undefined; onKind: (k: WorkKind | null) => void;
}) {
  return (
    <div data-develop-holdings="true" style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 2px', fontSize: 13 }}>
      <div data-develop-place="kind">
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7, marginBottom: 6 }}>Your book</div>
        <KindControl workId={props.workId} kind={props.kind} onKind={props.onKind} />
      </div>
      <div data-develop-place="reading">
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7, marginBottom: 6 }}>What MAIA can read</div>
        <ReadScopeControl manuscriptId={props.manuscriptId} />
      </div>
      <div data-develop-place="settled">
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7, marginBottom: 6 }}>What you have settled</div>
        <SettledDecisions workId={props.workId} />
      </div>
    </div>
  );
}

/** Beside the conversation, above it: what MAIA found in the chapter she read, then one question — what would you like to do?
 *  The four answers are the writer's. Nothing is chosen, opened or sent for them; "Leave it for now" folds the card to one line. The card
 *  never touches the conversation below it: an unsent message and an exchange in progress are left exactly as they are. */
export function StageReadingCard(props: {
  reading: StageReading;
  /** the writer chose to work toward a revision: their own sentence goes into the composer, unsent */
  onWorkTowardRevision?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [list, setList] = useState(false);
  const [hint, setHint] = useState(false);
  const r = props.reading;
  if (r.status !== 'ready' || r.items.length === 0) return null;
  const btn = { font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 8, padding: '5px 10px', textAlign: 'left' as const, width: '100%' };
  if (!open) {
    return (
      <div data-develop-reading-card="folded" style={{ flex: '0 0 auto', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center', ...ink }}>
        <span style={{ opacity: .8 }}>Her reading of {r.chapterLabel} is here when you want it.</span>
        <button type="button" onClick={() => setOpen(true)} style={{ ...btn, width: 'auto' }}>Open</button>
      </div>
    );
  }
  const lead = r.items[0]!;
  return (
    <section aria-label={`MAIA's reading of ${r.chapterLabel}`} data-develop-reading-card="open"
      style={{ flex: '0 1 auto', maxHeight: '55%', overflowY: 'auto', border: hair, borderRadius: 12, padding: '10px 12px', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6, ...ink }}>
      <div style={{ fontSize: 11, opacity: .75 }}>MAIA · her reading of {r.chapterLabel}</div>
      <p style={{ margin: 0, lineHeight: 1.55 }}><strong style={{ fontWeight: 500 }}>{lead.label}.</strong> {lead.notice}</p>
      {list ? (
        <ol data-develop-reading-items="true" style={{ margin: '4px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {r.items.map((it, i) => (
            <li key={it.id} data-develop-reading-item={i + 1} style={{ lineHeight: 1.5 }}>
              <strong style={{ fontWeight: 500 }}>{it.label}.</strong> {it.notice}
              {it.whyItMatters ? <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>Why it matters: {it.whyItMatters}</div> : null}
              {it.uncertainty ? <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>What she isn’t sure of: {it.uncertainty}</div> : null}
            </li>
          ))}
        </ol>
      ) : null}
      <div style={{ fontWeight: 500, marginTop: 4 }}>What would you like to do?</div>
      <div role="group" aria-label="What would you like to do?" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button type="button" data-develop-choice="noticed" aria-expanded={list} onClick={() => setList((v) => !v)} style={btn}>{list ? 'Hide what she noticed' : 'Go through what she noticed'}</button>
        <button type="button" data-develop-choice="passage" onClick={() => setHint(true)} style={btn}>Talk about one passage</button>
        {hint ? <p role="note" style={{ margin: '0 2px', fontSize: 12, opacity: .85 }}>Select the words in your chapter, then choose “Ask MAIA about this”.</p> : null}
        {props.onWorkTowardRevision ? <button type="button" data-develop-choice="revise" onClick={props.onWorkTowardRevision} style={btn}>Work toward a revision</button> : null}
        <button type="button" data-develop-choice="rest" onClick={() => setOpen(false)} style={btn}>Leave it for now</button>
      </div>
    </section>
  );
}


/** The chapter as the writer wrote it, read-only, kept in the centre while a lens reading sits beside it in MAIA's column. */
export function ChapterReadingPane(props: { section: StageSection; lensLabel: string; onBackToReading: () => void }) {
  const text = stripHeading(props.section);
  const paragraphs = text ? text.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean) : [];
  return (
    <div data-lens-chapter={props.section.draftSectionId} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, padding: '8px 6px 12px', boxSizing: 'border-box', ...ink }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto', fontSize: 13 }}>
        <button type="button" data-lens-back="true" onClick={props.onBackToReading}
          style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', fontSize: 12 }}>← Back to the reading</button>
        <span style={{ opacity: .75 }}>Your chapter, beside MAIA’s {props.lensLabel.toLowerCase()} reading</span>
      </header>
      <article aria-label={`${labelOf(props.section)}, as you wrote it`} style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '18px 8px 40px' }}>
        <div style={{ maxWidth: '66ch', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 26, fontWeight: 500, fontFamily: "'Iowan Old Style','Charter',Georgia,serif" }}>{labelOf(props.section)}</h2>
          {paragraphs.length === 0
            ? <p style={{ opacity: .75, margin: 0 }}>This chapter has no text yet.</p>
            : paragraphs.map((p, i) => <p key={i} style={{ margin: '0 0 16px', lineHeight: 1.8, fontSize: 18, fontFamily: "'Iowan Old Style','Charter',Georgia,serif" }}>{p}</p>)}
        </div>
      </article>
    </div>
  );
}
