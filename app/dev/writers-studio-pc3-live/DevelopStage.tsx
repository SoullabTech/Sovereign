'use client';
/**
 * DEVELOP, AS A STAGE — the work is present and central; MAIA is a conversation about it.
 *
 *   ┌ structure ribbon: the shape of the book, one segment per chapter, sized by its words ───────────────┐
 *   │ THE CHAPTER, in the writer's own words, readable, with the conversation about it directly beneath │
 *   └───────────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * Replaces the old centre of intent cards ("Just exploring / What does MAIA think? / Help me see the shape") with the thing the writer
 * came to develop. The right-hand column is no longer a chat panel; it is `DevelopHoldings`: what MAIA may read, what she has just read,
 * and what the writer has settled. Everything MAIA says still arrives as a turn the writer can use, change, discuss or undo.
 * ⛔ Read-only here: this component never edits, never sends, never composes words in the writer's mouth.
 */
import type { ReactNode } from 'react';
import ReadScopeControl from '@/app/writers-studio/canvas/ReadScopeControl';
import SettledDecisions from '@/app/writers-studio/canvas/SettledDecisions';
import { useMemo, useState } from 'react';
import { excerptOf, markTerm, recurringThreads } from '@/lib/writersStudio/recurringThreads';
import { setWorkKindClient } from '@/lib/writersStudio/workKindClient';
import type { WorkKind } from '@/lib/writersStudio/workKind';
import type { StoredPlan } from '@/lib/writersStudio/developmentPlanStore';
import { STEP_STATUS, type StepEdit, type StepStatus } from '@/lib/writersStudio/developmentPlan';

export interface StageSection { draftSectionId: string; heading: string | null; body: string | null; position: number }

const stripHeading = (s: StageSection): string => {
  let body = s.body ?? '';
  const h = s.heading?.trim();
  if (h && body.trimStart().startsWith(h)) body = body.trimStart().slice(h.length);
  return body.trim();
};
const wordsOf = (t: string): number => (t ? t.split(/\s+/).length : 0);
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
  /** the chapters MAIA was handed for her last answer (ids + headings); their text is shown here from the writer's own copy, in place */
  lastRead: readonly { sectionId: string; label: string | null }[] | null;
  /** the writer's plan (MAIA's grounded steps, edited by the writer). A plan never changes the manuscript. */
  plan: { plan: StoredPlan | null; staleStepIds: readonly string[] } | null;
  planBusy: boolean;
  planNote: string | null;
  onMakePlan: (ask: string) => void;
  onEditPlan: (edits: StepEdit[]) => void;
  /** open the passage desk on this step's exact words; the writer decides there */
  onWorkOnStep: (stepId: string) => void;
  conversation: ReactNode;
}) {
  const { sections } = props;
  const [thread, setThread] = useState<string | null>(null);
  const [openExcerpt, setOpenExcerpt] = useState<string | null>(null);
  const [focusAnchor, setFocusAnchor] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [planAsk, setPlanAsk] = useState('');
  const threads = useMemo(() => recurringThreads(sections.map((s) => ({ id: s.draftSectionId, text: stripHeading(s) }))), [sections]);
  const activeThread = threads.find((t) => t.term === thread) ?? null;
  const idx = Math.max(0, sections.findIndex((s) => s.draftSectionId === props.currentId));
  const current = sections[idx] ?? null;
  const text = current ? stripHeading(current) : '';
  const paragraphs = text ? text.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean) : [];
  const total = Math.max(1, sections.reduce((n, s) => n + wordsOf(stripHeading(s)), 0));

  return (
    <div data-develop-stage="true" style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, height: '100%', overflowY: 'auto', padding: '12px 6px 20px', boxSizing: 'border-box', ...ink }}>
      {/* the shape of the book */}
      <nav aria-label="The shape of your book" data-develop-ribbon="true" style={{ display: 'flex', gap: 3, alignItems: 'stretch', height: 34, flex: '0 0 auto' }}>
        {sections.map((s, i) => {
          const w = wordsOf(stripHeading(s));
          const active = i === idx;
          const hasThread = Boolean(activeThread?.chapterIds.includes(s.draftSectionId));
          return (
            <button key={s.draftSectionId} type="button" onClick={() => props.onSelect(s.draftSectionId)}
              aria-current={active ? 'true' : undefined}
              aria-label={`${labelOf(s)}, about ${w} words${hasThread ? `, contains “${activeThread!.term}”` : ''}`} title={`${labelOf(s)} · ${w} words${hasThread ? ` · “${activeThread!.term}”` : ''}`}
              style={{ flex: `${Math.max(w / total, 0.06)} 1 0`, minWidth: 18, cursor: 'pointer', font: 'inherit', fontSize: 11, textAlign: 'left',
                padding: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'inherit', borderRadius: 4,
                border: active ? '1px solid currentColor' : hair,
                background: hasThread ? 'color-mix(in srgb, #d9a441 30%, transparent)' : active ? 'color-mix(in srgb, currentColor 14%, transparent)' : 'color-mix(in srgb, currentColor 5%, transparent)' }}>
              {hasThread ? '● ' : ''}{labelOf(s)}
            </button>
          );
        })}
      </nav>

      {threads.length > 0 ? (
        <div data-develop-threads="true" role="group" aria-label="Words that recur across your chapters" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: -6 }}>
          <span style={{ fontSize: 11, opacity: .7 }} title="Counted across your chapters. Not interpreted.">Recurs across chapters:</span>
          {threads.map((t) => (
            <button key={t.term} type="button" aria-pressed={thread === t.term} onClick={() => setThread(thread === t.term ? null : t.term)}
              title={`“${t.term}” appears in ${t.chapterIds.length} chapters`}
              style={{ font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'inherit', borderRadius: 999, padding: '2px 10px',
                background: thread === t.term ? 'color-mix(in srgb, #d9a441 30%, transparent)' : 'none', border: hair }}>
              {t.term} <span style={{ opacity: .6 }}>{t.chapterIds.length}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* the chapter, in the writer's words */}
      <article aria-label={current ? `${labelOf(current)}, as you wrote it` : 'Your chapter'} data-develop-chapter={current?.draftSectionId}
        style={{ border: hair, borderRadius: 12, padding: '20px 26px', maxHeight: '40vh', flex: '0 0 auto', overflowY: 'auto' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7 }}>
              {props.workTitle ? `${props.workTitle} · ` : ''}{sections.length > 0 ? `${idx + 1} of ${sections.length}` : ''}
            </div>
            <h2 style={{ margin: '2px 0 0', fontSize: 24, fontWeight: 500, fontFamily: "'Iowan Old Style','Charter',Georgia,serif" }}>
              {current ? labelOf(current) : 'Your Work'}
            </h2>
          </div>
          <button type="button" onClick={props.onOpenWrite}
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', fontSize: 12, opacity: .85 }}>
            Edit in Write
          </button>
        </header>
        {paragraphs.length === 0 ? (
          <p style={{ opacity: .75, margin: 0 }}>{current ? 'This chapter has no text yet.' : 'Choose a chapter on the left.'}</p>
        ) : paragraphs.map((p, i) => (
          <p key={i} style={{ margin: '0 0 14px', lineHeight: 1.75, fontSize: 17, maxWidth: '64ch', fontFamily: "'Iowan Old Style','Charter',Georgia,serif" }}>
            {markTerm(p, focusAnchor ?? thread).map((piece, k) => piece.hit
              ? <mark key={k} style={{ background: 'color-mix(in srgb, #d9a441 38%, transparent)', color: 'inherit', borderRadius: 3, padding: '0 1px' }}>{piece.text}</mark>
              : <span key={k}>{piece.text}</span>)}
          </p>
        ))}
      </article>

      {/* the plan: MAIA's grounded steps, the writer's to edit. It never changes the manuscript; a step is opened in the passage desk. */}
      <section aria-label="Your plan" data-develop-plan="true" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            <p style={{ margin: '0 0 8px', fontSize: 12, opacity: .7 }}>You asked: “{props.plan.plan.ask}”. Nothing here changes your work; each step opens the passage so you decide.</p>
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
                          {STEP_STATUS.map((x) => <option key={x} value={x}>{x === 'open' ? 'To do' : x === 'working' ? 'Working on it' : x === 'done' ? 'Done' : 'Set aside'}</option>)}
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
        <section data-develop-excerpts="true" aria-label="The chapters MAIA read for her last answer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

      {/* ways in: the writer's own sentence, in the composer, theirs to send or change */}
      {props.starters.length > 0 ? (
        <div role="group" aria-label="Ways to begin" data-develop-starters="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {props.starters.map((q) => (
            <button key={q} type="button" onClick={() => props.onStarter(q)}
              style={{ font: 'inherit', fontSize: 13, cursor: 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 999, padding: '5px 12px' }}>
              {q}
            </button>
          ))}
          <button type="button" onClick={props.onMoreWays}
            style={{ font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'inherit', background: 'none', border: 'none', textDecoration: 'underline', opacity: .75 }}>
            More ways to explore
          </button>
        </div>
      ) : null}

      {/* one wide conversation about this place */}
      <section aria-label="Talk with MAIA about this chapter" data-develop-conversation="true" style={{ flex: '0 0 auto', height: 400, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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

/** The right-hand column: what MAIA may read, what she has just read, and what the writer has settled. An instrument panel, not a chat. */
export function DevelopHoldings(props: {
  manuscriptId: string; workId: string; lastRead: readonly { sectionId: string; label: string | null }[] | null;
  kind: WorkKind | null | undefined; onKind: (k: WorkKind | null) => void;
}) {
  return (
    <div data-develop-holdings="true" style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 2px', fontSize: 13 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7, marginBottom: 6 }}>Your book</div>
        <KindControl workId={props.workId} kind={props.kind} onKind={props.onKind} />
      </div>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7, marginBottom: 6 }}>What MAIA can read</div>
        <ReadScopeControl manuscriptId={props.manuscriptId} />
      </div>
      <div data-develop-she-read="true" aria-live="polite">
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7, marginBottom: 6 }}>What she read in her last answer</div>
        {props.lastRead === null
          ? <span style={{ opacity: .75 }}>Nothing yet. Ask her something and this shows exactly which chapters she was handed.</span>
          : props.lastRead.length === 0
            ? <span style={{ opacity: .75 }}>Only the chapter you were on.</span>
            : <span>{props.lastRead.map((r) => r.label ?? 'a section').join(' · ')}</span>}
      </div>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7, marginBottom: 6 }}>What you have settled</div>
        <SettledDecisions workId={props.workId} />
      </div>
    </div>
  );
}
