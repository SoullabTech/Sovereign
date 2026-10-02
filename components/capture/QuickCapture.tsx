'use client';

/**
 * Quick Capture (USC-04) — one thumb, one second.
 *
 * A client of the frozen Capture contract. It has no note architecture of its
 * own: every gesture becomes one POST /api/capture, and the destination is
 * resolved server-side.
 *
 * Design rule carried from the programme: presence outranks metadata. MARK is
 * one tap and closes immediately. Categorisation is available but never
 * required — nobody should be assigning an elemental lens while sitting with
 * another human being.
 *
 * The member is always told WHERE a capture landed. "Saved to Morning session"
 * and "Saved to your captures" are different facts and are never blurred.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Type, Flag, CornerUpRight, Check, CloudOff, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  capture,
  flushQueue,
  queueDepth,
  installFlushTriggers,
  haptic,
} from '@/lib/capture/captureQueue';

type Destination = { label: string; bound: boolean; elapsedMs: number | null };

const KINDS = [
  { key: 'insight', label: 'Insight' },
  { key: 'emotion', label: 'Emotion' },
  { key: 'body', label: 'Body' },
  { key: 'pattern', label: 'Pattern' },
  { key: 'question', label: 'Question' },
  { key: 'follow_up', label: 'Follow-up' },
] as const;

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function QuickCapture({ source = 'iphone' }: { source?: 'iphone' | 'ipad' | 'web' }) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [mode, setMode] = useState<'idle' | 'text' | 'kind'>('idle');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Where would a capture land right now?
  const refreshDestination = useCallback(async () => {
    try {
      const res = await apiFetch('/api/capture/active-session');
      if (!res.ok) return;
      const data = await res.json();
      setDestination({
        label: data.captureDestination ?? 'Your captures',
        bound: Boolean(data.active),
        elapsedMs: data.session?.elapsedMs ?? null,
      });
    } catch {
      // Offline: don't guess a destination we can't verify.
      setDestination(null);
    }
  }, []);

  useEffect(() => {
    void refreshDestination();
    const teardown = installFlushTriggers();
    const poll = setInterval(() => {
      void refreshDestination();
      setPending(queueDepth());
    }, 20_000);
    setPending(queueDepth());
    return () => { teardown(); clearInterval(poll); };
  }, [refreshDestination]);

  useEffect(() => () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
  }, []);

  const confirm = useCallback((text: string) => {
    setConfirmation(text);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmation(null), 2200);
  }, []);

  const savedTo = useCallback(() => {
    if (!destination) return 'Saved — will sync';
    return destination.bound
      ? `Saved to ${destination.label}`
      : 'Saved to your captures';
  }, [destination]);

  // ── MARK: the deceptively powerful one. One tap, no typing, no looking away.
  const onMark = useCallback(() => {
    capture({ source, modality: 'marker' });
    confirm(savedTo());
    setPending(queueDepth());
  }, [source, confirm, savedTo]);

  const onFollowUp = useCallback(() => {
    capture({ source, modality: 'task', kind: 'follow_up' });
    confirm(savedTo());
    setPending(queueDepth());
  }, [source, confirm, savedTo]);

  const submitText = useCallback(async (kind?: string) => {
    const text = draft.trim();
    if (!text) { setMode('idle'); return; }
    setBusy(true);
    capture({ source, modality: 'text', content: text, kind });
    setDraft('');
    setMode('idle');
    confirm(savedTo());
    await flushQueue();
    setPending(queueDepth());
    setBusy(false);
  }, [draft, source, confirm, savedTo]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 select-none">
      {/* Destination banner — the member always knows where a capture goes. */}
      <div className="mb-6 text-center">
        {destination ? (
          <>
            <div className="text-xs uppercase tracking-widest text-neutral-500">
              {destination.bound ? 'Session' : 'Capturing to'}
            </div>
            <div className="mt-1 text-lg text-neutral-200">
              {destination.bound && destination.elapsedMs !== null
                ? `${destination.label} · ${formatElapsed(destination.elapsedMs)}`
                : destination.label}
            </div>
          </>
        ) : (
          <div className="text-sm text-neutral-500 flex items-center justify-center gap-2">
            <CloudOff className="w-4 h-4" /> Offline — captures are held and synced
          </div>
        )}
        {pending > 0 && (
          <div className="mt-1 text-xs text-amber-500/80">
            {pending} waiting to sync
          </div>
        )}
      </div>

      {/* MARK — the primary gesture. Large, unmissable, one tap. */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onMark}
        aria-label="Mark this moment"
        className="w-full aspect-square max-h-64 rounded-full border border-amber-500/30
                   bg-amber-500/5 flex flex-col items-center justify-center gap-3
                   active:bg-amber-500/15 transition-colors"
      >
        <Flag className="w-10 h-10 text-amber-400" />
        <span className="text-xl tracking-wide text-amber-100">MARK</span>
        <span className="text-xs text-neutral-500">preserve this moment</span>
      </motion.button>

      {/* Secondary gestures. Deliberately smaller than MARK. */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <button
          onClick={() => { haptic(); setMode(mode === 'text' ? 'idle' : 'text'); }}
          aria-label="Type a note"
          className="py-4 rounded-2xl border border-neutral-700 flex flex-col items-center gap-1.5
                     text-neutral-300 active:bg-neutral-800/60"
        >
          <Type className="w-5 h-5" />
          <span className="text-xs">Type</span>
        </button>
        <SpeakButton source={source} onCaptured={() => { confirm(savedTo()); setPending(queueDepth()); }} />
        <button
          onClick={onFollowUp}
          aria-label="Create a follow-up"
          className="py-4 rounded-2xl border border-neutral-700 flex flex-col items-center gap-1.5
                     text-neutral-300 active:bg-neutral-800/60"
        >
          <CornerUpRight className="w-5 h-5" />
          <span className="text-xs">Follow-up</span>
        </button>
      </div>

      {/* Text capture */}
      <AnimatePresence>
        {mode === 'text' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="What do you want to remember?"
              rows={3}
              className="w-full rounded-2xl bg-neutral-900 border border-neutral-700 p-3
                         text-neutral-100 placeholder:text-neutral-600 focus:outline-none
                         focus:border-amber-500/50"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {KINDS.map(k => (
                <button
                  key={k.key}
                  onClick={() => submitText(k.key)}
                  disabled={busy || !draft.trim()}
                  className="px-3 py-1.5 rounded-full text-xs border border-neutral-700
                             text-neutral-400 disabled:opacity-40 active:bg-neutral-800"
                >
                  {k.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => submitText()}
              disabled={busy || !draft.trim()}
              className="mt-3 w-full py-3 rounded-2xl bg-amber-500/15 border border-amber-500/30
                         text-amber-100 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save without a label
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation — names the destination, then gets out of the way. */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            aria-live="polite"
            className="mt-5 flex items-center justify-center gap-2 text-sm text-emerald-300"
          >
            <Check className="w-4 h-4" /> {confirmation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SPEAK — hold and talk.
 *
 * V1 uses on-device speech recognition and sends a transcript. Audio upload and
 * server-side Whisper transcription are USC-07; this deliberately does not
 * invent a second recording path ahead of that unit. Where recognition is
 * unavailable the control disables itself rather than pretending to listen.
 */
function SpeakButton({
  source,
  onCaptured,
}: {
  source: 'iphone' | 'ipad' | 'web';
  onCaptured: () => void;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(Boolean(SR));
  }, []);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* already stopped */ }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) text += event.results[i][0].transcript;
      }
      const trimmed = text.trim();
      if (trimmed) {
        capture({ source, modality: 'voice', transcript: trimmed });
        onCaptured();
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    haptic();
    try { rec.start(); setListening(true); } catch { setListening(false); }
  }, [source, onCaptured]);

  return (
    <button
      onPointerDown={supported ? start : undefined}
      onPointerUp={supported ? stop : undefined}
      onPointerLeave={listening ? stop : undefined}
      disabled={!supported}
      aria-label={supported ? 'Hold to speak a note' : 'Speech capture unavailable on this device'}
      className={`py-4 rounded-2xl border flex flex-col items-center gap-1.5
                  active:bg-neutral-800/60 disabled:opacity-35
                  ${listening
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-200'
                    : 'border-neutral-700 text-neutral-300'}`}
    >
      <Mic className="w-5 h-5" />
      <span className="text-xs">{listening ? 'Listening' : 'Speak'}</span>
    </button>
  );
}
