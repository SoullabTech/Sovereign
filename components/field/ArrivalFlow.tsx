'use client';

/**
 * Arrival — the Marran/Kane reception flow.
 *
 * Reception is the FIRST posture. The member arrives, is received, resonates,
 * and centers BEFORE any action is offered. Capture (CaptureBar) appears only in
 * the final Express phase — it is never the room's opening gesture.
 *
 * Constitutional structure, made literal by the state machine:
 *  - The reception phases (receive, resonate) call only /api/field/arrival/reflect,
 *    which is store-nothing. Nothing the member brings is saved by default.
 *  - The writer-capable surfaces (CaptureBar → calendar, the field-note save) are
 *    mounted ONLY in `express`, structurally unreachable until reception completes.
 *  - MAIA reflects and notices; the member discerns. Meaning is never assigned here.
 */
import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import CaptureBar from '@/components/field/CaptureBar';

type Phase =
  | 'arrive'
  | 'receiving'
  | 'received'
  | 'resonating'
  | 'resonated'
  | 'coherence'
  | 'express';

const card = 'rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/5 p-4';
const field =
  'w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:focus:border-white/40';
const primaryBtn = 'rounded-md border border-black/30 dark:border-white/35 px-4 py-2 text-sm font-medium disabled:opacity-40';
const quietBtn = 'rounded-md px-4 py-2 text-sm opacity-70';
const reflection = 'whitespace-pre-wrap text-[15px] leading-relaxed';
const storeNote = 'text-xs opacity-50';

export default function ArrivalFlow() {
  const [phase, setPhase] = useState<Phase>('arrive');
  const [input, setInput] = useState('');
  const [receiveText, setReceiveText] = useState('');
  const [resonateText, setResonateText] = useState('');
  const [alive, setAlive] = useState('');
  const [express, setExpress] = useState<'options' | 'calendar' | 'note-saved' | 'left'>('options');
  const [noteError, setNoteError] = useState('');

  async function reflect(phaseArg: 'receive' | 'resonate', prior?: string): Promise<string | null> {
    try {
      const res = await apiFetch('/api/field/arrival/reflect', {
        method: 'POST',
        body: JSON.stringify({ input, phase: phaseArg, prior }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data?.reflection === 'string' ? data.reflection : null;
    } catch {
      return null;
    }
  }

  async function handleArrive() {
    if (!input.trim()) return;
    setPhase('receiving');
    const text = await reflect('receive');
    setReceiveText(text ?? 'I’m here with what you brought. Nothing needs to be solved yet.');
    setPhase('received');
  }

  async function handleResonate() {
    setPhase('resonating');
    const text = await reflect('resonate', receiveText);
    setResonateText(
      text ??
        'Several threads are here. Which of these still feels alive now that they’re outside you?',
    );
    setPhase('resonated');
  }

  async function saveFieldNote() {
    setNoteError('');
    const phenomena = alive.trim()
      ? `${input.trim()}\n\nStill alive: ${alive.trim()}`
      : input.trim();
    try {
      const res = await apiFetch('/api/field/records', {
        method: 'POST',
        body: JSON.stringify({ source: 'arrival', phenomena, tags: ['arrival'] }),
      });
      if (!res.ok) {
        setNoteError('I couldn’t hold that just now.');
        return;
      }
      setExpress('note-saved');
    } catch {
      setNoteError('Something went wrong saving that.');
    }
  }

  return (
    <div className="flex flex-col gap-4" data-testid="arrival-flow" data-phase={phase}>
      {/* 1 — ARRIVE */}
      {(phase === 'arrive' || phase === 'receiving') && (
        <div className="flex flex-col gap-2">
          <textarea
            data-testid="arrive-input"
            className={field}
            rows={4}
            placeholder="Everything that came in with you — meetings, worries, half-thoughts, whatever it is. No need to sort it."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            data-testid="arrive-begin"
            className={`${primaryBtn} self-end`}
            disabled={phase === 'receiving' || !input.trim()}
            onClick={handleArrive}
          >
            {phase === 'receiving' ? 'Receiving…' : 'Let it land'}
          </button>
        </div>
      )}

      {/* 2 — RECEIVE (Marran) */}
      {phase === 'received' && (
        <div className={card} data-testid="receive-card">
          <p className={reflection}>{receiveText}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className={storeNote}>Nothing is being saved.</span>
            <button className={primaryBtn} onClick={handleResonate}>
              Stay with this
            </button>
          </div>
        </div>
      )}

      {phase === 'resonating' && <p className="text-sm opacity-70">Letting it settle…</p>}

      {/* 3 — RESONATE */}
      {phase === 'resonated' && (
        <div className={card} data-testid="resonate-card">
          <p className={reflection}>{resonateText}</p>
          <div className="mt-3">
            <textarea
              className={field}
              rows={2}
              placeholder="What still feels alive? (only if you want to name it)"
              value={alive}
              onChange={(e) => setAlive(e.target.value)}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={storeNote}>Still nothing saved — this is yours.</span>
            <button className={primaryBtn} onClick={() => setPhase('coherence')}>
              Let it settle
            </button>
          </div>
        </div>
      )}

      {/* 4 — COHERENCE (earned, member-paced) */}
      {phase === 'coherence' && (
        <div className={`${card} flex flex-col items-center gap-5 py-10 text-center`} data-testid="coherence-card">
          <div className="h-20 w-20 animate-pulse rounded-full border border-current opacity-40" />
          <p className="max-w-sm text-[15px] leading-relaxed opacity-80">
            Breathe. Let the swarm settle. You’ve been received — nothing here needs solving.
            Stay as long as you like.
          </p>
          <button className={primaryBtn} onClick={() => setPhase('express')}>
            I’m here
          </button>
        </div>
      )}

      {/* 5 — EXPRESS (Kane) — capture only appears here */}
      {phase === 'express' && (
        <div className="flex flex-col gap-3" data-testid="express-card">
          {express === 'options' && (
            <div className={card}>
              <p className="mb-3 text-sm opacity-80">
                Now — is anything ready to move? There’s no need to act. You can simply leave it here.
              </p>
              <div className="flex flex-wrap gap-2">
                <button className={primaryBtn} onClick={() => setExpress('left')}>
                  Leave it here
                </button>
                <button className={primaryBtn} onClick={saveFieldNote}>
                  Save as a field note
                </button>
                <button className={primaryBtn} onClick={() => setExpress('calendar')}>
                  Add a calendar event
                </button>
                <a className={`${primaryBtn} inline-block`} href="/maia">
                  Continue with MAIA
                </a>
              </div>
              {noteError && <p className="mt-2 text-sm opacity-70">{noteError}</p>}
            </div>
          )}

          {express === 'calendar' && (
            <div className={card}>
              <p className="mb-3 text-sm opacity-70">
                Say the one thing you want on the calendar — I’ll show it back before anything is added.
              </p>
              <CaptureBar />
              <button className={`${quietBtn} mt-2`} onClick={() => setExpress('options')}>
                ← Back
              </button>
            </div>
          )}

          {express === 'note-saved' && (
            <div className={card}>
              <p className="text-sm">Held as a field note — yours to return to.</p>
            </div>
          )}

          {express === 'left' && (
            <div className={card}>
              <p className="text-sm">Left where it is. Nothing kept. You arrived — that was enough.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
