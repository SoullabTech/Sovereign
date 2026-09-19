'use client';
import { useEffect, useRef, useState } from 'react';
import { loadCanvasInsight, passageWindow, insightWriteHref, type CanvasInsight, type InsightPassage } from '@/lib/writersStudio/insightCanvas';
import { intentionNote } from '@/lib/writersStudio/editorialApproaches';
import MaiaListen from './MaiaListen';
import WorkInspiration from './WorkInspiration';
import { EDITORIAL_QUESTIONS } from '@/lib/writersStudio/editorialQuestions';
import ObservationDialogue from '../develop/ObservationDialogue';

export default function InsightReading({ manuscriptId, readingId, observationKey, onRevise, busy = false, refreshKey = 0 }: {
  manuscriptId: string; readingId: string; observationKey: string;
  onRevise?: (passage: InsightPassage, authorNotes?: string) => void; busy?: boolean; refreshKey?: number;
}) {
  const [loadedKey, setLoadedKey] = useState(refreshKey);
  const [insight, setInsight] = useState<CanvasInsight | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [context, setContext] = useState(1);
  const [markers, setMarkers] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>(EDITORIAL_QUESTIONS[0].question);
  const [intention, setIntention] = useState('');
  const [reader, setReader] = useState('');
  const [conversation, setConversation] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);
  const places = useRef(new Map<string, HTMLDetailsElement>());
  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    void loadCanvasInsight(manuscriptId, readingId, observationKey).then(result => {
      if (cancelled) return;
      setLoadedKey(refreshKey); setInsight(result); setPhase(result ? 'ready' : 'error');
    });
    return () => { cancelled = true; };
  }, [manuscriptId, readingId, observationKey, refreshKey]);
  useEffect(() => {
    if (!intention && !reader) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [intention, reader]);
  if (phase === 'loading' || loadedKey !== refreshKey) return <p role="status">Opening the observation and its passages…</p>;
  if (!insight) return <p role="status">This observation could not be opened. Your manuscript has not changed.</p>;
  const o = insight.observation;
  const exactCount = insight.passages.filter(p => p.verified && p.range).length;
  return <section data-insight-reading={readingId}>
    <WorkInspiration manuscriptId={manuscriptId} onBringToQuestion={text => setIntention(previous => [previous, 'Work inspiration and intention:\n' + text].filter(Boolean).join('\n\n'))} />
    <span className="wsi-eyebrow">{o.key} · {o.phenomenonLabel} · Reading: {o.stateLabel}</span>
    <p className="wsi-observation">{o.observation}</p><MaiaListen text={o.observation} />
    <p className="wsi-muted">{insight.coverage}</p>
    {o.state !== 'current' && <p role="status">{o.stateSentence}</p>}
    <p className="wsi-muted" role="status">{exactCount} of {insight.passages.length} related places have verified exact passage markers. Each section explains its evidence status.</p>
    <div className="wsi-exploration">
      <aside className="wsi-intention">
    <details className="wsi-current"><summary>Intention and conversation across these passages</summary>
      <h3>What should these passages do?</h3>
      <p>Related passages can serve different purposes. Bring your intention into the conversation before deciding how to revise.</p>
      <div className="wsi-grid">
        <label>Your intention
          <textarea value={intention} onChange={e => setIntention(e.target.value)}
            placeholder="What should each passage contribute? What must remain?" />
        </label>
        <label>The reader’s experience
          <textarea value={reader} onChange={e => setReader(e.target.value)}
            placeholder="What should readers understand, feel, or be able to practice? Where might they need a different approach?" />
        </label>
      </div>
      <p className="wsi-muted">Working notes stay here while this page remains open. Nothing is sent until you submit the question to MAIA.</p>
      {conversation === null && <label>What would you like to explore? <select value={question} onChange={e => setQuestion(e.target.value)}>
        {EDITORIAL_QUESTIONS.map(q => <option key={q.id} value={q.question}>{q.label}</option>)}
      </select></label>}
      {!talking && <button type="button" onClick={() => {
        if (conversation === null) setConversation([
          intention ? 'My intention:\n' + intention : '',
          reader ? 'The reader’s experience I want:\n' + reader : '',
          question,
        ].filter(Boolean).join('\n\n'));
        setTalking(true);
      }}>Discuss intention and alternatives</button>}
      {conversation !== null && <div hidden={!talking}>
        <ObservationDialogue manuscriptId={manuscriptId} readingId={readingId}
          observationKey={observationKey} about={o.observation} superseded={o.state === 'superseded'}
          initialQuestion={conversation} onClose={() => setTalking(false)} />
      </div>}
    </details>
      </aside>
      <div className="wsi-comparison-main">
    <div className="wsi-bar">
      <label><input type="checkbox" disabled={exactCount === 0} checked={markers && exactCount > 0} onChange={e => setMarkers(e.target.checked)} /> Evidence markers</label>
      <label>Excerpt context · {context} paragraphs<br />
        <input type="range" disabled={exactCount === 0} aria-label="Surrounding paragraphs" min="0" max="3" value={context} onChange={e => setContext(Number(e.target.value))} />
      </label>
    </div>
    <nav className="wsi-bar" aria-label="Related passages">
      {insight.passages.map((p, i) => <button key={p.key} type="button" aria-pressed={selected === p.key}
        onClick={() => { setSelected(p.key); const place = places.current.get(p.key); if (place) { place.open = true; place.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }}>
        {i + 1} · {p.heading}
      </button>)}
    </nav>
    {insight.passages.length === 0 && <p>This observation names structure rather than a textual passage. Its evidence is listed below.</p>}
    <div className="wsi-passage-grid">{insight.passages.map((p, i) => {
      const full = !expanded.has(p.key);
      const points = Array.from(p.body);
      const window = full
        ? { before: p.range ? points.slice(0, p.range.start).join('') : '', selected: p.range ? points.slice(p.range.start, p.range.end).join('') : p.body, after: p.range ? points.slice(p.range.end).join('') : '', clippedBefore: false, clippedAfter: false }
        : p.range ? passageWindow(p.body, p.range, context)
        : { before: '', selected: points.slice(0, 500).join(''), after: '', clippedBefore: false, clippedAfter: points.length > 500 };
      return <details open={i === 0 || selected === p.key} key={p.key} ref={el => { if (el) places.current.set(p.key, el); else places.current.delete(p.key); }}
        className="wsi-passage" data-selected={selected === p.key}>
        <summary className="wsi-section-heading"><strong>{i + 1} · {p.heading}</strong><span>{p.chapterHeading}{p.position !== undefined ? ` · Section ${p.position}` : ''}</span><span className="wsi-section-disclosure" aria-hidden="true" /></summary><span className="wsi-eyebrow">Related place {i + 1} · {p.range ? 'verified excerpt' : 'section reference'}</span>
        <p className="wsi-muted">{p.chapterHeading}{p.position !== undefined ? ` · Section ${p.position}` : ''}</p>
        {!p.range && <p className="wsi-muted">{full ? 'Full section' : 'Section opening'} · no narrower evidence is highlighted.</p>}
        <div className="wsi-prose" tabIndex={0} role="region" aria-label={p.heading + ' passage text'}>
          {window.clippedBefore && <span aria-label="Earlier context omitted">… </span>}
          {window.before}
          {markers && p.verified && p.range ? <mark>{window.selected}</mark> : window.selected}
          {window.after}
          {window.clippedAfter && <span aria-label="Later context omitted"> …</span>}
        </div>
        <p className="wsi-muted">{p.note}</p>
        <button type="button" aria-expanded={full} onClick={() => setExpanded(previous => {
          const next = new Set(previous); if (next.has(p.key)) next.delete(p.key); else next.add(p.key); return next;
        })}>{full ? 'Show less context' : 'Show full section'}</button>
        {p.verified && p.editable && (onRevise
          ? <button type="button" disabled={busy} onClick={() => onRevise(p, intentionNote(intention, reader))}>Revise this passage</button>
          : <a className="wsi-link" href={insightWriteHref(manuscriptId, readingId, observationKey, p.sectionId)}>Revise this passage in Write</a>)}
      </details>;
    })}</div>
    <details><summary>Evidence and limits of this observation</summary>
      <ul>{o.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>
      <ul>{o.limits.map(l => <li key={l.name}>{l.name} — {l.meaning}</li>)}</ul>
    </details>

      </div>
    </div>
  </section>;
}
