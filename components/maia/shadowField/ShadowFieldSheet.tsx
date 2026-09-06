'use client';

/**
 * Shadow Field — the Dedicated room (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1 · P3).
 *
 * Arrival → explicit Enter → Doors → Encounter · Stay · Differentiate · Reclaim · Choose ·
 * Return → Keep / Leave, with Leave present throughout.
 *
 * Constitutional properties this surface is responsible for:
 *   • Arrival says what MAIA is and is not here, that nothing is kept unless chosen, and
 *     how to leave. Reading the door is not walking through it (L1).
 *   • Entry is one deliberate act, and it is the act that opens the server-held sitting.
 *   • The member drives the arc. The system never advances the movement on its own, and
 *     the projection inquiry is not reachable before the disturbance has been said (F7).
 *   • Leave is always visible, needs no reason, produces no closing interpretation and no
 *     keep prompt, and writes nothing (L6, F14).
 *   • The keep menu appears only at a voluntary Return, and never offers MAIA's conclusion.
 *     Under Sanctuary it is not shown — and the server refuses regardless (P4-C1).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import type { ShadowDoor, ShadowMovement } from '@/lib/maia/shadowField/types';

interface ShadowFieldSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onComplete?: (responses: Record<string, string>) => void;
}

type Stage = 'arrival' | 'doors' | 'field' | 'close';
type Line = { role: 'member' | 'maia'; text: string };

const DOORS: { key: ShadowDoor; label: string }[] = [
  { key: 'projection', label: 'Someone is really getting under my skin.' },
  { key: 'trigger', label: 'My reaction feels larger than what happened.' },
  { key: 'envy', label: "Someone has something I can't stop thinking about." },
  { key: 'recurring_pattern', label: 'I keep finding myself here.' },
  { key: 'dream_image', label: 'Something strange keeps appearing.' },
  { key: 'disowned_gift', label: 'There is something I want but judge myself for wanting.' },
  { key: 'relationship_rupture', label: "I can't understand why this relationship activates me." },
  { key: 'own_words', label: 'None of these — I will start where I am.' },
];

/** The member moves; the system does not. Differentiate is not offered before Encounter. */
const MOVEMENTS: { key: ShadowMovement; label: string; hint: string }[] = [
  { key: 'encounter', label: 'Encounter', hint: 'what happened' },
  { key: 'stay', label: 'Stay', hint: 'stay with it' },
  { key: 'differentiate', label: 'Differentiate', hint: 'look from several angles' },
  { key: 'reclaim', label: 'Reclaim', hint: 'what is underneath' },
  { key: 'choose', label: 'Choose', hint: 'what you take' },
  { key: 'return', label: 'Return', hint: 'back out into your life' },
];

const KEEP_OPTIONS: { kind: 'experience' | 'question' | 'pattern' | 'practice'; label: string }[] = [
  { kind: 'experience', label: 'Remember the experience, in my own words' },
  { kind: 'question', label: "Remember a question I'm living with" },
  { kind: 'pattern', label: 'Remember a pattern I name myself' },
  { kind: 'practice', label: 'Remember an integration practice' },
];

export function ShadowFieldSheet({ isOpen, onClose, onComplete }: ShadowFieldSheetProps) {
  const [stage, setStage] = useState<Stage>('arrival');
  const [sanctuary, setSanctuary] = useState(false);
  const [fieldToken, setFieldToken] = useState<string | null>(null);
  const [movement, setMovement] = useState<ShadowMovement>('encounter');
  const [door, setDoor] = useState<ShadowDoor | undefined>();
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [keepText, setKeepText] = useState('');
  const [keptNote, setKeptNote] = useState<string | null>(null);
  const activation = useRef<Record<string, unknown> | null>(null);
  const saidSomething = lines.some((l) => l.role === 'member');

  const reset = useCallback(() => {
    setStage('arrival'); setFieldToken(null); setMovement('encounter'); setDoor(undefined);
    setLines([]); setDraft(''); setKeepText(''); setKeptNote(null); activation.current = null;
  }, []);

  useEffect(() => { if (!isOpen) reset(); }, [isOpen, reset]);

  /** The activation act. One deliberate gesture; it opens the server-held sitting. */
  async function enterField() {
    setBusy(true);
    try {
      const res = await fetch('/api/maia/shadow-field/enter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sanctuary }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setFieldToken(data.fieldToken);
      activation.current = {
        act: 'member_entered_shadow_field', modality: 'button',
        at: data.openedAt, authoredBy: 'member', participationClass: 'placed', authority: 'situate',
      };
      setStage('doors');
    } finally { setBusy(false); }
  }

  async function say(text: string) {
    if (!text.trim() || !activation.current) return;
    setLines((l) => [...l, { role: 'member', text }]);
    setDraft(''); setBusy(true);
    try {
      const res = await fetch('/api/maia/shadow-field', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activation: activation.current, fieldToken, movement, door,
          message: text, sanctuary, transcript: lines,
        }),
      });
      const data = await res.json();
      if (data?.text) setLines((l) => [...l, { role: 'maia', text: data.text }]);
    } finally { setBusy(false); }
  }

  /** Leaving. One gesture, no reason, nothing written, nothing said about the room. */
  async function leave() {
    try {
      await fetch('/api/maia/shadow-field', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exit: true, fieldToken }),
      });
    } finally { onClose(); }
  }

  async function keep(kind: string) {
    if (!keepText.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/maia/shadow-field/keep', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldToken, kind, text: keepText, authorship: { authoredBy: 'member' },
        }),
      });
      const data = await res.json();
      setKeptNote(data?.kept ? 'Kept, in your words.' : (data?.text ?? 'Nothing was kept.'));
      if (data?.kept) onComplete?.({ kind, text: keepText });
    } finally { setBusy(false); }
  }

  const canDifferentiate = saidSomething;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={leave}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed inset-x-0 bottom-0 z-[9999] max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-[#3a2f26] bg-[#12100e] p-5 text-[#D4B896]"
          >
            {/* Leave is present in every stage, needs no reason. */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-[#D4B896]/60" />
                <h2 className="text-base font-light">Shadow Field</h2>
                {sanctuary && (
                  <span className="rounded-full border border-[#D4B896]/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#D4B896]/70">
                    Sanctuary — not remembered
                  </span>
                )}
              </div>
              <button onClick={leave} className="rounded-lg border border-[#3a2f26] px-3 py-1 text-xs text-stone-400 hover:text-[#D4B896]">
                Leave
              </button>
            </div>

            {stage === 'arrival' && (
              <div className="space-y-4 text-sm leading-relaxed text-[#D4B896]/85">
                <p className="text-[#D4B896]">A place to meet what you have not yet been able to include.</p>
                <p className="text-stone-400">MAIA holds the lantern; you name what is in the room.</p>
                <p className="text-stone-400">
                  <span className="text-[#D4B896]/80">What this is:</span> questions, several ways of
                  looking, and your own words. <span className="text-[#D4B896]/80">What this is not:</span> a
                  diagnosis, a reading of your unconscious, or a record.
                </p>
                <p className="text-stone-400">
                  Nothing here is kept unless you choose it, in your words, at the end. You can leave at
                  any moment, and leaving keeps nothing.
                </p>
                <label className="flex items-center gap-2 text-xs text-stone-400">
                  <input type="checkbox" checked={sanctuary} onChange={(e) => setSanctuary(e.target.checked)} />
                  Sanctuary — this sitting won&apos;t be remembered at all
                </label>
                <button
                  onClick={enterField} disabled={busy}
                  className="w-full rounded-xl border border-[#D4B896]/40 bg-[#D4B896]/10 py-3 text-sm text-[#D4B896] hover:bg-[#D4B896]/15 disabled:opacity-50"
                >
                  Enter the Shadow Field
                </button>
              </div>
            )}

            {stage === 'doors' && (
              <div className="space-y-2">
                <p className="mb-3 text-sm text-stone-400">Where would you like to start?</p>
                {DOORS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => { setDoor(d.key); setStage('field'); }}
                    className="w-full rounded-xl border border-[#3a2f26] p-3 text-left text-sm text-[#D4B896]/85 hover:bg-[#D4B896]/5"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}

            {stage === 'field' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {MOVEMENTS.map((m) => {
                    const locked = m.key === 'differentiate' && !canDifferentiate;
                    return (
                      <button
                        key={m.key} disabled={locked} onClick={() => setMovement(m.key)}
                        title={locked ? 'First say what happened' : m.hint}
                        className={`rounded-full border px-3 py-1 text-[11px] ${
                          movement === m.key
                            ? 'border-[#D4B896]/50 bg-[#D4B896]/10 text-[#D4B896]'
                            : 'border-[#3a2f26] text-stone-500'
                        } ${locked ? 'opacity-30' : 'hover:text-[#D4B896]'}`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {lines.map((l, i) => (
                    <p key={i} className={l.role === 'member' ? 'text-sm text-[#D4B896]' : 'text-sm text-stone-300'}>
                      {l.text}
                    </p>
                  ))}
                  {busy && <p className="text-xs text-stone-500">…</p>}
                </div>

                <textarea
                  value={draft} onChange={(e) => setDraft(e.target.value)} rows={3}
                  placeholder="In your own words."
                  className="w-full rounded-xl border border-[#3a2f26] bg-transparent p-3 text-sm text-[#D4B896] placeholder:text-stone-600"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => say(draft)} disabled={busy || !draft.trim()}
                    className="flex-1 rounded-xl border border-[#D4B896]/40 py-2 text-sm text-[#D4B896] disabled:opacity-40"
                  >
                    Say it
                  </button>
                  <button
                    onClick={() => setStage('close')} disabled={!saidSomething}
                    className="rounded-xl border border-[#3a2f26] px-4 py-2 text-sm text-stone-400 disabled:opacity-40"
                  >
                    Close here
                  </button>
                </div>
              </div>
            )}

            {stage === 'close' && (
              <div className="space-y-4 text-sm">
                <p className="text-stone-400">
                  Before you go: what do you want to do differently, what needs expression rather than
                  more interpretation, and what remains genuinely unknown?
                </p>
                {sanctuary ? (
                  <p className="text-stone-500">
                    This sitting isn&apos;t being kept. Nothing from it is stored.
                  </p>
                ) : keptNote ? (
                  <p className="text-[#D4B896]/80">{keptNote}</p>
                ) : (
                  <>
                    <textarea
                      value={keepText} onChange={(e) => setKeepText(e.target.value)} rows={3}
                      placeholder="If you want to keep something, write it in your own words."
                      className="w-full rounded-xl border border-[#3a2f26] bg-transparent p-3 text-[#D4B896] placeholder:text-stone-600"
                    />
                    <div className="space-y-2">
                      {KEEP_OPTIONS.map((o) => (
                        <button
                          key={o.kind} onClick={() => keep(o.kind)} disabled={busy || !keepText.trim()}
                          className="w-full rounded-xl border border-[#3a2f26] p-3 text-left text-[#D4B896]/85 hover:bg-[#D4B896]/5 disabled:opacity-40"
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <button onClick={leave} className="w-full rounded-xl border border-[#3a2f26] py-3 text-sm text-stone-400">
                  Leave this entirely here
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ShadowFieldSheet;
