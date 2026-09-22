'use client';
import { useEffect, useRef, useState } from 'react';
import {
  loadCanvasInsight, passageWindow, insightWriteHref,
  type CanvasInsight, type InsightPassage,
} from '@/lib/writersStudio/insightCanvas';
import MaiaListen from './MaiaListen';
import WorkInspiration from './WorkInspiration';
import { EDITORIAL_QUESTIONS } from '@/lib/writersStudio/editorialQuestions';
import ObservationDialogue from '../develop/ObservationDialogue';

const RESPONSE_PROMPTS = [
  ['Yes, that’s what I mean',
    'Yes — that is what I want this passage to do. Keep that as turn-local context for this conversation only. Do not store it as a Work declaration. Help me see what follows from that reading without assuming the passage needs revision.'],
  ['Partly',
    'Partly. Ask me one useful question about what you may be missing before suggesting a change. Do not treat partial agreement as a stored declaration.'],
  ['I see it differently',
    'I see this differently. Let me explain what I mean. Revise your interpretation when my explanation changes the evidence available to you; do not assume either of us must win.'],
  ['Help me understand',
    'Help me understand what exact words led you to this observation. Explain the craft principle in plain language, distinguish evidence from interpretation, and treat reader effects as hypotheses. Do not propose replacement wording yet.'],
] as const;

export default function InsightReading({
  manuscriptId, readingId, observationKey, onRevise, onChoosePassage,
  proposalActive = false, busy = false, refreshKey = 0,
}: {
  manuscriptId: string; readingId: string; observationKey: string;
  onRevise?: (passage: InsightPassage, authorNotes?: string) => void;
  /** ⭐ Sends the member to the manuscript to select an exact passage
   *  themselves. ⛔ Never chooses one for them — that is the ruling's first
   *  prohibition. Absent outside the workspace, where there is nothing to
   *  select in, and the control is then simply not offered. */
  onChoosePassage?: () => void;
  /** ⭐⭐ C6R1 — TRUE once a proposal exists for this passage. The observation
   *  then STOPS BEING A SECOND WORKSPACE and becomes the explanation of the
   *  edit the member is deciding about. Two stacked Notice/Discuss/Try/Decide
   *  paths, two sets of response buttons and a second `Try a revision` do not
   *  give the member more control — they make them reconstruct which screen
   *  they are on. ⛔ Nothing is removed from the product: the same conversation
   *  continues in the desk above, against the same passage. */
  proposalActive?: boolean;
  busy?: boolean; refreshKey?: number;
}) {
  const [loadedKey, setLoadedKey] = useState(refreshKey);
  const [insight, setInsight] = useState<CanvasInsight | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [context, setContext] = useState(1);
  const [markers, setMarkers] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [redirect, setRedirect] = useState('');
  const [conversation, setConversation] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);
  const [memberContext, setMemberContext] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const places = useRef(new Map<string, HTMLDetailsElement>());

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    void loadCanvasInsight(manuscriptId, readingId, observationKey).then(result => {
      if (cancelled) return;
      setLoadedKey(refreshKey);
      setInsight(result);
      setPhase(result ? 'ready' : 'error');
      setSelected(result?.passages.find(p => p.verified && p.editable)?.key
        ?? result?.passages[0]?.key ?? null);
    });
    return () => { cancelled = true; };
  }, [manuscriptId, readingId, observationKey, refreshKey]);

  if (phase === 'loading' || loadedKey !== refreshKey) {
    return <p role="status">Opening MAIA’s reading and the passage it rests on…</p>;
  }
  if (!insight) {
    return <p role="status">This observation could not be opened. Your manuscript has not changed.</p>;
  }

  const o = insight.observation;
  const target = insight.passages.find(p => p.key === selected && p.verified && p.editable)
    ?? insight.passages.find(p => p.verified && p.editable)
    ?? null;
  const exactCount = insight.passages.filter(p => p.verified && p.range).length;
  /* ⭐⭐ C6 — THE OBSERVATION LAYER CONVERGES ONTO THE BOUND EDITORIAL TURN.
     Every response below used to open ObservationDialogue on the general Ask
     path, while `Talk about it` inside the passage desk ran through
     runEditorialTurn and its governed Teaching bridge. Same layer, same
     posture, two different minds — and nothing visible told the writer which
     one they had reached.
     ⛔ NOT a second Teaching integration: the bridge call site is untouched.
     ⭐ D-D preserved — the member's words land in the EDITABLE draft for this
     turn, so they stay removable before anything is sent.

     ⭐⭐ THE MEMBRANE, per the null-target ruling: NO EXACT TARGET, NO
     EDITORIAL BINDING; NO EDITORIAL BINDING, NO CLAIM THAT THE GOVERNED
     TEACHER PATH IS ACTIVE. Discussion stays lawful; revision waits for a
     member-chosen exact locus.
     ⛔ `verified && editable` is NOT sufficient — a `range` is required too.
     Without one the only available locus is the whole section body, and
     automatic widening is named on the ruling's forbidden list. A structural
     or multi-place observation is not defective for having no range; it has
     simply not crossed into passage-level editorial action. */
  const boundTarget = target && target.range ? target : null;
  const boundToPassage = Boolean(boundTarget && onRevise);
  const beginConversation = (prompt: string) => {
    const next = [memberContext, prompt].filter(Boolean).join('\n\n');
    setStatus(null);
    if (boundTarget && onRevise) { onRevise(boundTarget, next); return; }
    setConversation(next);
    setTalking(true);
  };
  const tryRevision = () => {
    if (!boundTarget) return;
    setStatus(null);
    if (onRevise) onRevise(boundTarget, memberContext);
  };
  const revisionHref = boundTarget
    ? insightWriteHref(manuscriptId, readingId, observationKey, boundTarget.sectionId) + '&insightAction=try-revision'
    : null;

  /* ⭐ The reading itself, identical in both states. ⛔ Nothing is withheld
     when a proposal is live — coverage and the non-conclusion line travel with
     it into the disclosure, because they are what keep the observation
     falsifiable and they are not decoration to be dropped when space is short. */
  const theReading = <>
    <p className="wsi-observation">{o.observation}</p>
    <p className="wsi-muted"><strong>What I read:</strong> {insight.coverage}</p>
    <p className="wsi-muted">
      I’m reading what is on the page. This doesn’t establish what you intended or how a reader will feel.
    </p>
    {o.state !== 'current' && <p role="status">{o.stateSentence}</p>}
  </>;

  return <section data-insight-reading={readingId} data-guided-editorial-loop
    data-proposal-active={proposalActive ? 'true' : 'false'}>
    {/* ⭐⭐ C6R1 — ONE WORKSPACE AT A TIME.
        Once MAIA has proposed an edit, this stopped being a place to decide
        and became the REASON for the decision being made above it. Rendering
        it as a second live workspace — its own heading, its own response
        buttons, its own Notice/Discuss/Try/Decide, its own `Try a revision` —
        asked the member to work out which screen they were on before they
        could think about their sentence.
        ⛔ NOT hidden, and nothing is removed: the whole reading, its coverage
        and its related passages are one click away, and stop competing with
        the editing task. */}
    {proposalActive ? <details className="wsi-reading-behind" data-reading-behind>
      <summary>Reading behind these suggestions</summary>
      {theReading}
    </details> : <>
    <div className="wsi-page-voice">
      <strong>MAIA · with this passage</strong>
      <MaiaListen text={o.observation} />
    </div>
    <h3>Here’s what I’m noticing.</h3>
    {theReading}
    <section aria-label="Respond to MAIA">
      <h3>What do you think?</h3>
      {/* ⭐ BOUND: these reach the editorial runtime, and therefore the
          governed Teaching bridge. ⛔ UNBOUND: they are not offered at all —
          presenting `Help me understand` here would make two different
          cognition paths look like one capability. */}
      {boundToPassage ? <div className="wsi-page-actions">
        {RESPONSE_PROMPTS.map(([label, prompt]) =>
          <button key={label} type="button" disabled={busy}
            onClick={() => beginConversation(prompt)}>{label}</button>)}
        <button type="button" disabled={busy} onClick={() => {
          setTalking(false); setConversation(null);
          setStatus('Left as it is. Nothing changed.');
        }}>Leave this as it is</button>
      </div> : <>
        <p className="wsi-muted">
          This observation isn’t tied to one exact editable passage yet. We can
          talk about what MAIA noticed, or you can choose a passage to work on.
        </p>
        <div className="wsi-page-actions">
          <button type="button" disabled={busy}
            onClick={() => beginConversation('')}>Talk about this</button>
          {onChoosePassage && <button type="button" disabled={busy}
            onClick={onChoosePassage}>Choose a passage</button>}
          <button type="button" disabled={busy} onClick={() => {
            setTalking(false); setConversation(null);
            setStatus('Left as it is. Nothing changed.');
          }}>Leave this as it is</button>
        </div>
      </>}
    </section>

    <details className="wsi-question-options">
      <summary>Look at something else</summary>
      <label>Another angle
        <select value={redirect} disabled={busy} onChange={e => setRedirect(e.target.value)}>
          <option value="">Choose only if you want another angle…</option>
          {EDITORIAL_QUESTIONS.map(q =>
            <option key={q.id} value={q.question}>{q.label}</option>)}
        </select>
      </label>
      <button type="button" disabled={busy || !redirect}
        onClick={() => beginConversation(redirect)}>Talk about it</button>
    </details>

    <details>
      <summary>Use my Work direction in this conversation</summary>
      <WorkInspiration manuscriptId={manuscriptId}
        onBringToQuestion={text => {
          setMemberContext('Member-supplied orientation for this turn only:\n' + text);
          setStatus('Added to the editable context for your next turn. You can change or remove it before sending.');
        }} />
      {memberContext && <label>Context for my next turn
        <textarea value={memberContext} onChange={e => setMemberContext(e.target.value)} />
        <button type="button" onClick={() => setMemberContext('')}>Remove from next turn</button>
      </label>}
    </details>

    {talking && conversation !== null && <ObservationDialogue
      manuscriptId={manuscriptId} readingId={readingId}
      observationKey={observationKey} about={o.observation}
      superseded={o.state === 'superseded'}
      initialQuestion={conversation} onClose={() => setTalking(false)} />}

    <div className="wsi-conversation-path" aria-label="Passage editing path">
      <p>Understand it before changing it.</p>
      <ol>
        <li data-state="complete">Notice</li>
        <li data-state={talking ? 'current' : 'next'}>Discuss</li>
        <li data-state="next">Try</li>
        <li data-state="next">Decide</li>
      </ol>
    </div>

    </>}

    {/* ⛔ C6R1 — one `Try a revision` on screen at a time. While a proposal is
        live the decision belongs to the desk above, not to a second entry
        point that would open a competing one.
        ⭐ And it now requires boundTarget, not target: without a range the only
        available locus is the whole section body, and automatic widening is
        refused. Closing the leak the membrane already named. */}
    {!proposalActive && <div className="wsi-page-actions">
      {boundTarget && onRevise &&
        <button type="button" className="wsi-primary" disabled={busy}
          onClick={tryRevision}>Try a revision</button>}
      {boundTarget && !onRevise && revisionHref &&
        <a className="wsi-link" href={revisionHref}>Try a revision</a>}
    </div>}
    {status && <p role="status" aria-live="polite">{status}</p>}

    <div className="wsi-passage-grid">{insight.passages.map((p, i) => {
      const full = !expanded.has(p.key);
      const points = Array.from(p.body);
      const window = full
        ? { before: p.range ? points.slice(0, p.range.start).join('') : '',
            selected: p.range ? points.slice(p.range.start, p.range.end).join('') : p.body,
            after: p.range ? points.slice(p.range.end).join('') : '',
            clippedBefore: false, clippedAfter: false }
        : p.range ? passageWindow(p.body, p.range, context)
        : { before: '', selected: points.slice(0, 500).join(''), after: '',
            clippedBefore: false, clippedAfter: points.length > 500 };
      return <details open={i === 0 || selected === p.key} key={p.key}
        ref={el => { if (el) places.current.set(p.key, el); else places.current.delete(p.key); }}
        className="wsi-passage" data-selected={selected === p.key}>
        <summary className="wsi-section-heading"
          onClick={() => setSelected(p.key)}>
          <strong>{i + 1} · {p.heading}</strong>
          <span>{p.chapterHeading}{p.position !== undefined ? ` · Section ${p.position}` : ''}</span>
        </summary>
        <div className="wsi-prose" tabIndex={0} role="region" aria-label={p.heading + ' passage text'}>
          {window.clippedBefore && <span aria-label="Earlier context omitted">… </span>}
          {window.before}
          {markers && p.verified && p.range ? <mark>{window.selected}</mark> : window.selected}
          {window.after}
          {window.clippedAfter && <span aria-label="Later context omitted"> …</span>}
        </div>
        <p className="wsi-muted">{p.note}</p>
        <button type="button" aria-expanded={full} onClick={() => setExpanded(previous => {
          const next = new Set(previous);
          if (next.has(p.key)) next.delete(p.key); else next.add(p.key);
          return next;
        })}>{full ? 'Show less context' : 'Show full section'}</button>
        {p.verified && p.editable && <button type="button" disabled={busy}
          onClick={() => setSelected(p.key)}>Work with this passage</button>}
      </details>;
    })}</div>

    <details data-reading-basis>
      <summary>What this reading rests on</summary>
      <p className="wsi-muted"><strong>Coverage:</strong> {insight.coverage}</p>
      <p className="wsi-muted">
        {exactCount} of {insight.passages.length} related places have verified exact passage markers.
      </p>
      <label><input type="checkbox" disabled={exactCount === 0}
        checked={markers && exactCount > 0}
        onChange={e => setMarkers(e.target.checked)} /> Evidence markers</label>
      <label>Excerpt context · {context} paragraphs
        <input type="range" disabled={exactCount === 0} aria-label="Surrounding paragraphs"
          min="0" max="3" value={context} onChange={e => setContext(Number(e.target.value))} />
      </label>
      <p className="wsi-muted">
        Internal address: {o.key}{o.phenomenonLabel ? ` · ${o.phenomenonLabel}` : ''} · {o.stateLabel}
      </p>
      <h4>Evidence</h4>
      <ul>{o.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>
      <h4>What this does not establish</h4>
      <ul>{o.limits.map(l => <li key={l.name}>{l.name} — {l.meaning}</li>)}</ul>
    </details>
  </section>;
}
