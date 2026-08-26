'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { INVITATIONS } from '@/lib/studio/companionStance';

/**
 * MAIA in the room (WS-VISIBLE-01).
 *
 * This replaces the Writer Canvas's placeholder panel. It is not a chat
 * sidebar bolted onto an editor: it opens with one authored question, offers
 * four gestures the writer can hand over without composing a sentence, and
 * otherwise stays quiet.
 *
 * The writer's words and MAIA's are visually distinct — the room never blurs
 * who said what.
 */

type Phase = 'loading' | 'ready' | 'unavailable';

interface Turn {
  id: string;
  role: 'writer' | 'maia';
  content: string;
}

interface CompanionProps {
  workId: string | null;
  manuscriptId: string | null;
  /** Re-open the room when the table changes underneath the panel. */
  roomKey: string;
}

export default function Companion({ workId, manuscriptId, roomKey }: CompanionProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [opening, setOpening] = useState<string>('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const roomQuery = useCallback(() => {
    const p = new URLSearchParams();
    if (workId) p.set('workId', workId);
    if (manuscriptId) p.set('manuscriptId', manuscriptId);
    return p.toString();
  }, [workId, manuscriptId]);

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    (async () => {
      try {
        const res = await apiFetch(`/api/sovereign/studio/companion?${roomQuery()}`, {
          method: 'GET',
        });
        if (cancelled) return;
        if (!res.ok) return setPhase('unavailable');
        const data = await res.json();
        setOpening(typeof data.opening === 'string' ? data.opening : '');
        setTurns(Array.isArray(data.turns) ? data.turns : []);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('unavailable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomKey, roomQuery]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [turns.length, thinking]);

  const speak = async (payload: { message?: string; invitation?: string }, shown: string) => {
    if (thinking) return;
    setThinking(true);
    setFailed(null);
    // The writer's words appear immediately; MAIA's arrive when they arrive.
    const optimistic: Turn = { id: `local-${Date.now()}`, role: 'writer', content: shown };
    setTurns((t) => [...t, optimistic]);
    try {
      const res = await apiFetch('/api/sovereign/studio/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId, manuscriptId, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTurns((t) => t.filter((x) => x.id !== optimistic.id));
        setFailed(
          typeof data.message === 'string'
            ? data.message
            : 'MAIA could not answer just now. Your writing is untouched.',
        );
        return;
      }
      setTurns((t) => [
        ...t.filter((x) => x.id !== optimistic.id),
        { id: `${optimistic.id}-w`, role: 'writer', content: data.said ?? shown },
        { id: `${optimistic.id}-m`, role: 'maia', content: data.reply ?? '' },
      ]);
    } catch {
      setTurns((t) => t.filter((x) => x.id !== optimistic.id));
      setFailed('MAIA could not be reached just now. Your writing is untouched.');
    } finally {
      setThinking(false);
    }
  };

  const send = () => {
    const value = draft.trim();
    if (!value) return;
    setDraft('');
    void speak({ message: value }, value);
  };

  if (phase === 'unavailable') {
    return (
      <div className="px-5 py-6">
        <h2 className="text-[11px] tracking-[0.2em] uppercase opacity-40 mb-3">MAIA</h2>
        <p className="text-[13px] leading-relaxed opacity-55">
          MAIA cannot open this room just now. Your writing is untouched.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="px-5 pt-5 pb-3 border-b shrink-0"
        style={{ borderColor: PRESS.ruleSoft }}
      >
        <h2 className="text-[11px] tracking-[0.2em] uppercase opacity-40">MAIA</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
        {/* The opening: authored, identical on every reload of an untouched
            room, and never counted as something MAIA "said". */}
        {opening && (
          <p
            className="text-[15px] leading-[1.65] italic"
            style={{ fontFamily: SERIF, color: PRESS.accent, opacity: 0.9 }}
          >
            {opening}
          </p>
        )}

        {turns.map((t) =>
          t.role === 'writer' ? (
            <p
              key={t.id}
              className="text-[13px] leading-relaxed pl-3 border-l whitespace-pre-wrap"
              style={{ borderColor: PRESS.rule, opacity: 0.6 }}
            >
              {t.content}
            </p>
          ) : (
            <p
              key={t.id}
              className="text-[14.5px] leading-[1.7] whitespace-pre-wrap"
              style={{ fontFamily: SERIF, opacity: 0.92 }}
            >
              {t.content}
            </p>
          ),
        )}

        {thinking && <p className="text-[13px] opacity-40">…</p>}
        {failed && (
          <p className="text-[13px] leading-relaxed opacity-70">{failed}</p>
        )}
        <div ref={endRef} />
      </div>

      {/* Four gestures — a writer can hand MAIA something without composing a
          sentence. Each sends authored words the writer can see afterwards. */}
      <div
        className="shrink-0 border-t px-5 py-3 flex flex-wrap gap-x-4 gap-y-1.5"
        style={{ borderColor: PRESS.ruleSoft }}
      >
        {INVITATIONS.map((inv) => (
          <button
            key={inv.id}
            disabled={thinking || phase !== 'ready'}
            onClick={() => void speak({ invitation: inv.id }, inv.ask)}
            className="text-[11px] tracking-[0.14em] uppercase opacity-50 hover:opacity-95 disabled:opacity-25 transition-opacity"
          >
            {inv.label}
          </button>
        ))}
      </div>

      <div className="shrink-0 border-t px-5 py-3" style={{ borderColor: PRESS.ruleSoft }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Say something about the work…"
          aria-label="Say something to MAIA"
          className="w-full bg-transparent outline-none resize-none text-[13.5px] leading-relaxed placeholder:opacity-30"
          style={{ color: PRESS.text, caretColor: PRESS.accent }}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10.5px] opacity-25">⌘↵ to send</span>
          <button
            onClick={send}
            disabled={thinking || !draft.trim()}
            className="text-[11px] tracking-[0.14em] uppercase opacity-55 hover:opacity-95 disabled:opacity-20"
            style={{ color: PRESS.accent }}
          >
            {thinking ? 'listening…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
