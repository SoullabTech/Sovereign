'use client';

// LISTEN-01 · Sound Studio review conversation, phase 1. The guide is NOT MAIA: it has its own visible name,
// no memory, and saves nothing until the reviewer confirms the summary. See lib/listening/soundStudioReview.ts.

import { useCallback, useEffect, useRef, useState } from 'react';
import { verifiedSessionFetch } from '@/lib/http/verifiedSessionFetch';
import { declaredSanctuaryPosture, readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import {
  MAX_LINE_CHARS,
  MAX_LINES,
  MAX_MESSAGE_CHARS,
  MAX_MESSAGES,
  REVIEW_CONSENT_VERSION,
  REVIEW_GUIDE_NAME,
  REVIEWABLE_WORKS,
  SANCTUARY_REVIEW_MESSAGE,
  openingQuestion,
} from '@/lib/listening/soundStudioReview';
import type { ReviewLine, ReviewLineKind, ReviewTurn } from '@/lib/listening/soundStudioReview';
import styles from './listen.module.css';

type Stage = 'consent' | 'talk' | 'summary' | 'saved' | 'paused' | 'sanctuary';
type SavedReview = { id: string; workId: string; lines: ReviewLine[]; keptTranscript: boolean; createdAt: string };

const KIND_LABEL: Record<ReviewLineKind, string> = {
  observation: 'What I heard or noticed',
  experience: 'How it felt',
  suggestion: 'What I would change',
};

type Props = {
  workId: string;
  passageLabel: string | null;
  elapsedMs: number | null;
  onClose: () => void;
};

export function SoundStudioReview({ workId, passageLabel, elapsedMs, onClose }: Props) {
  const title = REVIEWABLE_WORKS[workId] ?? 'this work';
  const [stage, setStage] = useState<Stage>('consent');
  const [turns, setTurns] = useState<ReviewTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestFinish, setSuggestFinish] = useState(false);
  const [lines, setLines] = useState<ReviewLine[]>([]);
  const [keepTranscript, setKeepTranscript] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [mine, setMine] = useState<SavedReview[] | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [stage]);

  const loadMine = useCallback(async () => {
    try {
      const res = await verifiedSessionFetch('/api/listen/review', { method: 'GET', cache: 'no-store' });
      if (res.ok) setMine(((await res.json()) as { reviews: SavedReview[] }).reviews);
    } catch { /* the list is a convenience; the review still works without it */ }
  }, []);
  useEffect(() => { void loadMine(); }, [loadMine]);

  const sanctuaryNow = () => {
    const read = readCurrentSanctuaryPosture();
    if (read.resolved && read.sanctuary) { setTurns([]); setStage('sanctuary'); return true; }
    return false;
  };
  const refused = async (res: Response) => {
    if (res.status !== 409) return false;
    const data = await res.json().catch(() => null) as { refusal?: string } | null;
    if (data?.refusal === 'sanctuary') { setTurns([]); setStage('sanctuary'); return true; }
    return false;
  };

  const begin = () => {
    if (sanctuaryNow()) return;
    setTurns([{ role: 'guide', text: openingQuestion(workId) }]);
    setStage('talk');
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    const next: ReviewTurn[] = [...turns, { role: 'reviewer', text: text.slice(0, MAX_MESSAGE_CHARS) }];
    setTurns(next);
    setDraft('');
    if (sanctuaryNow()) return;
    if (next.length >= MAX_MESSAGES - 1) { void summarize(next); return; }
    setBusy(true); setError(null);
    try {
      const res = await verifiedSessionFetch('/api/listen/review/turn', {
        method: 'POST', body: JSON.stringify({ workId, transcript: next, ...declaredSanctuaryPosture() }),
      });
      if (await refused(res)) return;
      if (!res.ok) throw new Error('turn');
      const data = (await res.json()) as { reply: string; paused: boolean; suggestFinish: boolean };
      if (data.paused) { setTurns([]); setStage('paused'); return; }
      setTurns([...next, { role: 'guide', text: data.reply }]);
      setSuggestFinish(data.suggestFinish);
    } catch {
      setError('The guide could not reply just now. Your words are still here; try again, or go straight to the summary.');
    } finally { setBusy(false); }
  };

  const summarize = async (current: ReviewTurn[] = turns) => {
    if (!current.some(t => t.role === 'reviewer')) { setError('Say something first, even a single line.'); return; }
    if (sanctuaryNow()) return;
    setBusy(true); setError(null);
    try {
      const res = await verifiedSessionFetch('/api/listen/review/summary', {
        method: 'POST', body: JSON.stringify({ workId, transcript: current, ...declaredSanctuaryPosture() }),
      });
      if (await refused(res)) return;
      if (!res.ok) throw new Error('summary');
      const data = (await res.json()) as { lines: ReviewLine[] };
      setLines(data.lines.length ? data.lines : [{ kind: 'observation', text: '' }]);
      setStage('summary');
    } catch {
      setLines([{ kind: 'observation', text: '' }]);
      setError('A draft summary could not be made. You can write your own lines below.');
      setStage('summary');
    } finally { setBusy(false); }
  };

  const save = async () => {
    const clean = lines.map(l => ({ kind: l.kind, text: l.text.trim() })).filter(l => l.text);
    if (!clean.length) { setError('Keep at least one line, or discard the review.'); return; }
    if (sanctuaryNow()) { setLines([]); return; }
    setBusy(true); setError(null);
    try {
      const res = await verifiedSessionFetch('/api/listen/review', {
        method: 'POST',
        body: JSON.stringify({
          workId, lines: clean, keepTranscript,
          ...(keepTranscript ? { transcript: turns } : {}),
          passageLabel, elapsedMs: elapsedMs == null ? null : Math.round(elapsedMs),
          consentVersion: REVIEW_CONSENT_VERSION,
          ...declaredSanctuaryPosture(),
        }),
      });
      if (await refused(res)) { setLines([]); return; }
      if (!res.ok) throw new Error('save');
      setSavedId(((await res.json()) as { id: string }).id);
      setTurns([]);
      setStage('saved');
      void loadMine();
    } catch {
      setError('Your review could not be saved. Nothing was stored; please try again.');
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    const res = await verifiedSessionFetch(`/api/listen/review/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 404) {
      setMine(prev => prev?.filter(r => r.id !== id) ?? null);
      if (id === savedId) setSavedId(null);
    }
  };

  const updateLine = (i: number, patch: Partial<ReviewLine>) =>
    setLines(prev => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <section className={`${styles.panel} ${styles.reviewPanel}`} aria-labelledby="sound-review-title" data-sound-studio-review="true">
      <span className={styles.smallcaps}>{REVIEW_GUIDE_NAME.toUpperCase()} · NOT MAIA</span>
      <h2 id="sound-review-title" ref={headingRef} tabIndex={-1}>
        {stage === 'saved' ? 'Thank you' : stage === 'paused' ? 'Pausing the review' : stage === 'sanctuary' ? 'Reviews are paused in Sanctuary' : `Review ${title}`}
      </h2>

      {stage === 'consent' && (
        <>
          <p className={styles.muted}>
            A short conversation about what you heard. The guide asks one question at a time and follows what you say.
            You can skip anything and stop whenever you like.
          </p>
          <ul className={styles.reviewTerms}>
            <li><strong>What is saved:</strong> only the summary lines you check and confirm at the end. The full conversation is kept only if you tick a box.</li>
            <li><strong>Who sees it:</strong> the Soullab team working on Sound Studio.</li>
            <li><strong>How it works:</strong> your words are sent to Claude (Anthropic) through Soullab's server to ask follow-up questions and draft the summary. The lines you confirm and save may later be sent to Claude too, under anonymous references, so the team can find themes across reviews. Nothing is used to train any model.</li>
            <li><strong>Not MAIA:</strong> this guide has no memory of you and nothing here goes into MAIA's memory.</li>
            <li><strong>Yours to delete:</strong> you can delete a saved review at any time.</li>
          </ul>
          <div className={styles.returnRow}>
            <button type="button" className={styles.ghost} onClick={begin}>Start the review</button>
            <button type="button" className={styles.ghost} onClick={onClose}>Not now</button>
          </div>
        </>
      )}

      {stage === 'talk' && (
        <>
          <ol className={styles.reviewTranscript} aria-live="polite">
            {turns.map((t, i) => (
              <li key={i} data-role={t.role}>
                <span className={styles.smallcaps}>{t.role === 'guide' ? REVIEW_GUIDE_NAME : 'You'}</span>
                <p>{t.text}</p>
              </li>
            ))}
            {busy && <li data-role="guide"><p className={styles.muted}>…</p></li>}
          </ol>
          <label htmlFor="sound-review-reply">Your reply</label>
          <textarea id="sound-review-reply" rows={3} value={draft} maxLength={MAX_MESSAGE_CHARS}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send(); }} />
          <div className={styles.returnRow}>
            <button type="button" className={styles.ghost} onClick={() => void send()} disabled={busy || !draft.trim()}>Send</button>
            <button type="button" className={styles.ghost} onClick={() => void summarize()} disabled={busy}>
              {suggestFinish ? 'Show me the summary' : "I'm done — show the summary"}
            </button>
            <button type="button" className={styles.danger} onClick={() => { setTurns([]); onClose(); }}>Discard and close</button>
          </div>
        </>
      )}

      {stage === 'summary' && (
        <>
          <p className={styles.muted}>Here is what I heard. Change, remove or add anything. Only what you save is kept.</p>
          <ol className={styles.reviewLines}>
            {lines.map((l, i) => (
              <li key={i}>
                <label>
                  <span className={styles.smallcaps}>Kind</span>
                  <select value={l.kind} onChange={e => updateLine(i, { kind: e.target.value as ReviewLineKind })}>
                    {(Object.keys(KIND_LABEL) as ReviewLineKind[]).map(k => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                  </select>
                </label>
                <textarea aria-label={`Line ${i + 1}`} rows={2} maxLength={MAX_LINE_CHARS} value={l.text}
                  onChange={e => updateLine(i, { text: e.target.value })} />
                <button type="button" className={styles.danger} onClick={() => setLines(prev => prev.filter((_, j) => j !== i))}>Remove</button>
              </li>
            ))}
          </ol>
          {lines.length < MAX_LINES && (
            <button type="button" className={styles.ghost} onClick={() => setLines(prev => [...prev, { kind: 'observation', text: '' }])}>Add a line</button>
          )}
          <label className={styles.reviewKeep}>
            <input type="checkbox" checked={keepTranscript} onChange={e => setKeepTranscript(e.target.checked)} />
            Also keep the full conversation (otherwise it is discarded)
          </label>
          <div className={styles.returnRow}>
            <button type="button" className={styles.ghost} onClick={() => void save()} disabled={busy}>Save my review</button>
            <button type="button" className={styles.danger} onClick={() => { setTurns([]); setLines([]); onClose(); }}>Discard everything</button>
          </div>
        </>
      )}

      {stage === 'saved' && (
        <>
          <p className={styles.muted}>Your review is saved. You can delete it here at any time.</p>
          <div className={styles.returnRow}>
            {savedId && <button type="button" className={styles.danger} onClick={() => void remove(savedId)}>Delete this review</button>}
            <button type="button" className={styles.ghost} onClick={onClose}>Back to the field</button>
          </div>
        </>
      )}

      {stage === 'sanctuary' && (
        <>
          <p className={styles.muted}>
            {SANCTUARY_REVIEW_MESSAGE} Nothing you said in this review was kept.
          </p>
          <div className={styles.returnRow}>
            <button type="button" className={styles.ghost} onClick={onClose}>Close</button>
          </div>
        </>
      )}

      {stage === 'paused' && (
        <>
          <p className={styles.muted}>
            Let&apos;s pause the review here. This is a conversation about the sound, not support, and what you&apos;re
            carrying matters more than any feedback. If you are struggling, please reach out to someone you trust or
            a local crisis line. Nothing from this conversation has been saved.
          </p>
          <div className={styles.returnRow}>
            <button type="button" className={styles.ghost} onClick={onClose}>Close</button>
          </div>
        </>
      )}

      {error && <p className={styles.muted} role="alert">{error}</p>}

      {mine && mine.length > 0 && stage !== 'talk' && stage !== 'summary' && (
        <details className={styles.aboutField}>
          <summary>Your saved reviews ({mine.length})</summary>
          <ul className={styles.reviewMine}>
            {mine.map(r => (
              <li key={r.id}>
                <strong>{REVIEWABLE_WORKS[r.workId] ?? r.workId}</strong>
                <small> · {new Date(r.createdAt).toLocaleDateString()}{r.keptTranscript ? ' · conversation kept' : ''}</small>
                <ul>{r.lines.map((l, i) => <li key={i}>{l.text}</li>)}</ul>
                <button type="button" className={styles.danger} onClick={() => void remove(r.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
