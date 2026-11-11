'use client';
/**
 * MAIA'S LETTER AND THE WALK — beside the manuscript, in Write, where the writer's words change under their own hand.
 *
 * Founder design 2026-11-11 ("this should have been the path all along"):
 *   1. You open your book; MAIA has read it and has a short letter for you.
 *   2. She walks you through it one place at a time, at your pace, asking "Is this intended?"
 *   3. When you ask, she gives options (the passage desk: propose, Use it, Undo — all already the writer's acts).
 *   4. You use, undo, or go to the next place.
 *
 * Laws held here:
 *  - She reads the whole book by herself ONLY under the writer's standing permission for the whole Work, never in Sanctuary, and only
 *    when no letter exists yet for this manuscript. A letter of an earlier draft is kept and SAID to be of an earlier draft; rereading
 *    is the writer's choice.
 *  - An observation is an invitation: nothing here scrolls, selects, focuses or advances by itself. Every move is a button the writer presses.
 *  - Places come in the order of the writer's book, never ranked by importance. Every place is reachable from the letter.
 *  - "It's intended" and "Later" are the writer's own decisions, kept on this device, shown and changeable. Nothing is dismissed.
 *  - This panel never edits. "Show me options" opens the existing passage desk on the exact, verified words.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getReadScope } from '@/lib/writersStudio/readScopeClient';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { loadCanvasInsight } from '@/lib/writersStudio/insightCanvas';
import { fetchLetter, postDecision } from '@/lib/writersStudio/letter/letterClient';
import { cancelPassRun, fetchRun, startPassRun } from '@/lib/writersStudio/studio/passRunClient';
import type { RunView } from '@/lib/writersStudio/studio/passRun';
import { keepRefusalCopy } from '@/lib/writersStudio/keepPosture';
import type { AttentionItem } from '@/lib/writersStudio/studio/attentionMap';
import {
  inBookOrder, loadPassDecisions, loadSavedPass, runEditorialPass, savePass, savePassDecisions,
  type PassDecision, type SavedPass,
} from '@/lib/writersStudio/studio/editorialPassRunner';

export interface LetterSection { draftSectionId: string; heading: string | null; position: number }
export interface PassIssueTarget { sectionId: string; readingId: string; observationKey: string }

const labelOf = (s: LetterSection | undefined) => (s ? (s.heading?.trim() || `Section ${s.position + 1}`) : 'your book');
const hair = '1px solid color-mix(in srgb, currentColor 16%, transparent)';
const btn = { font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'inherit', background: 'none', border: hair, borderRadius: 8, padding: '5px 10px' } as const;
const quiet = { ...btn, border: 'none', textDecoration: 'underline', padding: '2px 0' } as const;

export function EditorialLetterPanel(props: {
  manuscriptId: string;
  sections: readonly LetterSection[];
  /** the current draft's revision; null = could not be established, so she does not read */
  draftRevision: number | null;
  onShowSection: (sectionId: string) => void;
  onEditOptions: (target: PassIssueTarget) => void;
  onTalk: (words: string) => void;
  /** she finished reading (so what she has read can be re-checked) */
  onRead?: () => void;
}) {
  const { manuscriptId, sections, draftRevision } = props;
  const [pass, setPass] = useState<SavedPass | null>(null);
  const [decisions, setDecisions] = useState<Record<string, PassDecision>>({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);   // null = the letter; a number = one place
  const [note, setNote] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [mayAutoRead, setMayAutoRead] = useState<boolean | null>(null);
  const autoAsked = useRef(false);

  /* Step 2: the letter and decisions live on the server, per Work, so they are there on any device and after any visit. The copy on
     this device is used only when the server has none (a pass made in Sanctuary, or before letters were kept). */
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setPass(loadSavedPass(manuscriptId));
    setDecisions(loadPassDecisions(manuscriptId));
    setCursor(null); setError(null); setNote(null); autoAsked.current = false; setLoaded(false);
    void fetchLetter(manuscriptId).then((out) => {
      if (cancelled) return;
      if (out?.letter) {
        setPass({ draftRevision: out.letter.draftRevision, map: out.letter.map, letterId: out.letter.id });
        setDecisions(out.decisions);
      }
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [manuscriptId]);

  /* Step 4 (founder ruling 2026-11-11, "Let it run on its own"): with whole-Work permission the pass runs ON THE SERVER, so closing the
     page does not stop it; this panel only shows its true state and checks back. Without that permission the writer's click still reads
     the book from this page, as before. */
  const [run, setRun] = useState<RunView | null>(null);
  const watch = useRef<number | null>(null);
  const stopWatching = () => { if (watch.current !== null) { window.clearInterval(watch.current); watch.current = null; } };
  const followRun = useCallback(() => {
    stopWatching();
    const tick = async () => {
      const r = await fetchRun(manuscriptId);
      if (r === undefined) return;
      setRun(r);
      if (!r || ['done', 'failed', 'stopped', 'cancelled'].includes(r.state)) {
        stopWatching();
        if (r?.state === 'done') {
          const out = await fetchLetter(manuscriptId);
          if (out?.letter) { setPass({ draftRevision: out.letter.draftRevision, map: out.letter.map, letterId: out.letter.id }); setDecisions(out.decisions); setCursor(null); props.onRead?.(); }
        }
      }
    };
    void tick();
    watch.current = window.setInterval(() => { void tick(); }, 5000);
  }, [manuscriptId, props.onRead]);
  useEffect(() => {
    let cancelled = false;
    void fetchRun(manuscriptId).then((r) => {
      if (cancelled || !r) return;
      setRun(r);
      if (!['done', 'failed', 'stopped', 'cancelled'].includes(r.state)) followRun();
    });
    return () => { cancelled = true; stopWatching(); };
  }, [manuscriptId, followRun]);
  const runActive = run !== null && !['done', 'failed', 'stopped', 'cancelled'].includes(run.state);

  const readOnServer = useCallback(async (): Promise<boolean> => {
    const out = await startPassRun(manuscriptId);
    if (!out.ok) {
      if (out.refusal === 'daily_limit') { setError('I’ve already read this book as many times today as your setting allows. Try again tomorrow.'); return true; }
      if (out.refusal === 'sanctuary_not_kept' || out.refusal === 'posture_undeclared') { setError(keepRefusalCopy(out.refusal)); return true; }
      return false;   // no whole-Work permission (or not established): read from this page instead
    }
    setRun(out.run); setError(null); followRun();
    return true;
  }, [manuscriptId, followRun]);

  const read = useCallback(async () => {
    if (busy || runActive || draftRevision === null) return;
    if (await readOnServer()) return;
    setBusy(true); setError(null); setNote(null);
    setProgress('MAIA is reading your book…');
    try {
      const out = await runEditorialPass({ manuscriptId, revisionNumber: draftRevision, sectionIds: sections.map((s) => s.draftSectionId), onProgress: setProgress, keepAsLetter: true });
      if (!out.ok) { setError(out.message); return; }
      const saved = { draftRevision, map: out.map, letterId: out.letterId };
      if (out.letterKept && out.letterKept !== 'kept') setNote(keepRefusalCopy(out.letterKept) ?? 'This letter is on this device only.');
      setDecisions(out.letterId ? {} : loadPassDecisions(manuscriptId));
      savePass(manuscriptId, saved);
      setPass(saved);
      setCursor(null);
      props.onRead?.();
    } finally { setBusy(false); setProgress(null); }
  }, [busy, runActive, readOnServer, draftRevision, manuscriptId, sections, props.onRead]);

  /* She has read the book already when the writer has let her read the whole Work: no letter yet → she reads, once. */
  useEffect(() => {
    let cancelled = false;
    void getReadScope(manuscriptId).then((scope) => {
      if (cancelled) return;
      const posture = readCurrentSanctuaryPosture();
      setMayAutoRead(Boolean(scope && scope.level === 'work' && posture.resolved && !posture.sanctuary));
    });
    return () => { cancelled = true; };
  }, [manuscriptId]);
  useEffect(() => {
    /* Off unless NEXT_PUBLIC_WS_AUTO_READ=1: reading the whole book is nine paid readings and a synthesis, so reading by herself
       waits for a cost ceiling and owner review (review of #2215, 2026-11-11). Until then: "Read my book". */
    if (process.env.NEXT_PUBLIC_WS_AUTO_READ !== '1') return;
    if (!loaded || mayAutoRead !== true || autoAsked.current || busy || draftRevision === null || sections.length === 0) return;
    if (pass || loadSavedPass(manuscriptId)) return;
    autoAsked.current = true;
    void read();
  }, [loaded, pass, mayAutoRead, busy, draftRevision, sections.length, manuscriptId, read]);

  const places = useMemo(
    () => (pass ? inBookOrder(pass.map.items.filter((it) => it.sectionIds.length > 0), sections.map((s) => s.draftSectionId)) : []),
    [pass, sections],
  );
  const stale = pass !== null && draftRevision !== null && pass.draftRevision !== draftRevision;
  const decide = async (id: string, d: PassDecision | null) => {
    if (pass?.letterId) {
      const refused = await postDecision(manuscriptId, pass.letterId, id, d ?? 'cleared');
      if (refused) { setNote(keepRefusalCopy(refused) ?? 'That decision could not be kept just now. Nothing changed.'); return; }
      setDecisions((prev) => { const next = { ...prev }; if (d) next[id] = d; else delete next[id]; return next; });
      return;
    }
    setDecisions((prev) => {
      const next = { ...prev };
      if (d) next[id] = d; else delete next[id];
      savePassDecisions(manuscriptId, next);
      return next;
    });
  };
  const sectionOf = (it: AttentionItem) => sections.find((s) => it.sectionIds.includes(s.draftSectionId));

  const options = async (it: AttentionItem) => {
    if (resolving) return;
    setResolving(true); setNote(null);
    try {
      for (const ev of it.evidence) {
        const insight = await loadCanvasInsight(manuscriptId, ev.readingId, ev.observationKey);
        const passage = insight?.passages.find((p) => p.verified && p.editable && p.range);
        if (passage?.range) { props.onEditOptions({ sectionId: passage.sectionId, readingId: ev.readingId, observationKey: ev.observationKey }); return; }
      }
      setNote('I can’t tie this to exact words in your current draft, so I won’t propose a change from here. Open the section and select the words you mean; I’ll work with those.');
    } finally { setResolving(false); }
  };

  /* ── reading, or nothing yet ── */
  if (runActive && run) {
    return (
      <section data-editorial-letter="running" role="status" aria-live="polite" className="fr-say">
        <p style={{ margin: 0 }}>I’m reading your book{run.done > 0 ? `: ${run.done} of ${run.total} readings done` : ''}{run.state === 'synthesizing' ? ', and gathering what I found' : ''}.</p>
        <p style={{ margin: '6px 0 0', fontSize: 12, opacity: .8 }}>Keep writing, or close this page; I’ll carry on and the letter will be here when you come back.</p>
        <button type="button" data-letter-cancel="true" onClick={() => { void cancelPassRun(manuscriptId).then(() => fetchRun(manuscriptId)).then((r) => { if (r !== undefined) setRun(r); stopWatching(); }); }}
          style={{ ...quiet, marginTop: 6 }}>Stop reading</button>
      </section>
    );
  }
  if (busy) {
    return (
      <section data-editorial-letter="reading" role="status" aria-live="polite" className="fr-say">
        <p style={{ margin: 0 }}>I’m reading your book. {progress}</p>
        <p style={{ margin: '6px 0 0', fontSize: 12, opacity: .8 }}>Keep writing; I won’t interrupt. Keep this page open until I finish.</p>
      </section>
    );
  }
  const runEnded = run && (run.state === 'failed' || run.state === 'stopped') ? (
    <p role="note" data-letter-run-ended={run.state} style={{ margin: '6px 0 0', fontSize: 12 }}>
      {run.state === 'stopped' && run.refusal === 'sanctuary' ? 'I stopped reading because Sanctuary is on.'
        : run.state === 'stopped' && run.refusal === 'permission_withdrawn' ? 'I stopped reading because you withdrew my permission to read the whole book.'
        : run.state === 'stopped' && run.refusal === 'draft_changed' ? 'I stopped because the book changed while I was reading.'
        : `I couldn’t finish the ${run.lens ?? ''} reading (${run.done} of ${run.total} were done; they are kept).`}
      {' '}<button type="button" data-letter-continue="true" onClick={() => void read()} style={quiet}>Continue</button>
    </p>
  ) : null;
  if (!pass) {
    return (
      <section data-editorial-letter="none" className="fr-say">
        <p style={{ margin: 0 }}>
          {draftRevision === null
            ? 'I can’t establish your current draft safely just now, so I haven’t read it.'
            : 'I haven’t read this book yet. When I have, I’ll bring you a short letter and we can go through it together, one place at a time.'}
        </p>
        {error ? <p role="alert" style={{ margin: '6px 0 0', fontSize: 12 }}>{error}</p> : null}
        {runEnded}
        {draftRevision !== null ? <button type="button" data-letter-read="true" className="p4r1-talk" onClick={() => void read()} style={{ marginTop: 8 }}>Read my book</button> : null}
      </section>
    );
  }

  /* ── one place ── */
  if (cursor !== null && places[cursor]) {
    const it = places[cursor]!;
    const sec = sectionOf(it);
    const d = decisions[it.id];
    return (
      <section data-editorial-letter="place" data-letter-place={cursor + 1} aria-label={`Place ${cursor + 1} of ${places.length}`} style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, opacity: .8 }}>
          <span>Place {cursor + 1} of {places.length} · {labelOf(sec)}</span>
          <button type="button" data-letter-back="true" onClick={() => { setCursor(null); setNote(null); }} style={quiet}>The letter</button>
        </div>
        {stale ? <p role="note" style={{ margin: 0, fontSize: 12 }}>From an earlier draft of your book; this place may have changed.</p> : null}
        <p style={{ margin: 0, lineHeight: 1.55 }}><strong style={{ fontWeight: 500 }}>{it.label}.</strong> {it.notice}</p>
        {it.whyItMatters ? <p style={{ margin: 0, fontSize: 12, opacity: .85 }}>Why it may matter: {it.whyItMatters}</p> : null}
        {it.uncertainty ? <p style={{ margin: 0, fontSize: 12, opacity: .75 }}>What I’m not sure of: {it.uncertainty}</p> : null}
        <p style={{ margin: '2px 0 0', fontWeight: 500 }}>Is this intended?</p>
        {d ? <p data-letter-decision={d} role="status" style={{ margin: 0, fontSize: 12 }}>You said: {d === 'intended' ? 'it’s intended.' : 'later.'} <button type="button" onClick={() => void decide(it.id, null)} style={quiet}>Change</button></p> : null}
        <div role="group" aria-label="What would you like to do?" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {sec ? <button type="button" data-letter-act="where" onClick={() => props.onShowSection(sec.draftSectionId)} style={btn}>Show me where</button> : null}
          <button type="button" data-letter-act="options" disabled={resolving} onClick={() => void options(it)} style={btn}>{resolving ? 'Finding the words…' : 'Show me options'}</button>
          <button type="button" data-letter-act="talk" onClick={() => props.onTalk(`About “${it.label}” in ${labelOf(sec)}: you noticed that ${it.notice} `)} style={btn}>Talk about it</button>
          <button type="button" data-letter-act="intended" onClick={() => void decide(it.id, 'intended')} style={btn}>It’s intended</button>
          <button type="button" data-letter-act="later" onClick={() => void decide(it.id, 'later')} style={btn}>Later</button>
        </div>
        {note ? <p role="note" style={{ margin: 0, fontSize: 12 }}>{note}</p> : null}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <button type="button" data-letter-prev="true" disabled={cursor === 0} onClick={() => { setCursor(cursor - 1); setNote(null); }} style={btn}>‹ Previous</button>
          <button type="button" data-letter-next="true" disabled={cursor >= places.length - 1} onClick={() => { setCursor(cursor + 1); setNote(null); }} style={btn}>Next place ›</button>
        </div>
      </section>
    );
  }

  /* ── the letter ── */
  const looked = places.filter((p) => decisions[p.id]).length;
  return (
    <section data-editorial-letter="letter" aria-label="MAIA's letter about your book" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
      <p style={{ margin: 0, fontSize: 12, opacity: .8 }}>
        This letter comes from my readings of {stale ? 'an earlier draft of your book' : 'this draft of your book'}.
      </p>
      {stale ? (
        <p role="note" data-letter-stale="true" style={{ margin: 0, fontSize: 12 }}>
          You’ve changed the book since I read it. <button type="button" onClick={() => void read()} style={quiet}>Read it again</button>
        </p>
      ) : null}
      {error ? <p role="alert" style={{ margin: 0, fontSize: 12 }}>{error}</p> : null}
      {note ? <p role="note" data-letter-note="true" style={{ margin: 0, fontSize: 12 }}>{note}</p> : null}
      {places.length === 0 ? (
        <p style={{ margin: 0 }}>I didn’t find a place I could support with evidence where an edit would clearly help.</p>
      ) : (
        <>
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            I found {places.length} place{places.length === 1 ? '' : 's'} where an edit may help. Here they are in the order they come in your book.
            {looked > 0 ? ` You’ve decided on ${looked} of them.` : ''}
          </p>
          <ol data-letter-places="true" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {places.map((it, i) => (
              <li key={it.id}>
                <button type="button" data-letter-open={i + 1} onClick={() => { setCursor(i); setNote(null); }} style={{ ...quiet, textAlign: 'left' }}>{it.label}</button>
                <span style={{ fontSize: 11, opacity: .7 }}> · {labelOf(sectionOf(it))}{decisions[it.id] ? ` · ${decisions[it.id] === 'intended' ? 'intended' : 'later'}` : ''}</span>
              </li>
            ))}
          </ol>
          <button type="button" data-letter-start="true" className="p4r1-talk" onClick={() => setCursor(0)}>Start with the first</button>
        </>
      )}
    </section>
  );
}
