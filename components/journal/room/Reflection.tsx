'use client';

/**
 * Journal Room — MAIA encounter.
 *
 * The kept Journal entry remains primary. Once invited, MAIA may stay in
 * conversation for as many turns as the member wants. The encounter is
 * intentionally transient: no Journal-owned transcript or memory record is
 * written merely because they talked.
 */

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { type, color, focus, motion, hit, quiet } from './tokens';

interface ReflectionTurn {
  id: string;
  role: 'member' | 'maia';
  content: string;
  question?: string | null;
}

export interface ReflectionProps {
  entryId: string;
  onWriteFromHere: (seed: string) => void;
  onLetItGo: () => void;
}
export function Reflection({ entryId, onWriteFromHere, onLetItGo }: ReflectionProps) {
  const [turns, setTurns] = useState<ReflectionTurn[]>([]);
  const [input, setInput] = useState('');
  const encounterId = useRef(
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : 'encounter-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
  );
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const latestMaiaQuestion = useMemo(() => {
    for (let i = turns.length - 1; i >= 0; i -= 1) {
      const turn = turns[i];
      if (turn.role === 'maia' && turn.question) return turn.question;
    }
    return null;
  }, [turns]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let live = true;
    void apiFetch('/api/journal/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, encounterId: encounterId.current }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!live) return;
        if (!res.ok || !json?.success || typeof json.response !== 'string') {
          throw new Error(json?.error || 'MAIA could not be reached just now.');
        }
        setTurns([{
          id: 'maia-opening',
          role: 'maia',
          content: json.response,
          question: typeof json.question === 'string' ? json.question : null,
        }]);
      })
      .catch((reason) => {
        if (live) setError(reason instanceof Error ? reason.message : 'MAIA could not be reached just now.');
      })
      .finally(() => {
        if (live) setWaiting(false);
      });

    return () => {
      live = false;
    };
  }, [entryId]);
  async function send(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || waiting) return;

    const memberTurn: ReflectionTurn = {
      id: 'member-' + Date.now(),
      role: 'member',
      content: message,
    };
    const history = turns.map((turn) => ({
      role: turn.role === 'member' ? 'user' : 'assistant',
      content: turn.content,
    }));

    setTurns((current) => [...current, memberTurn]);
    setInput('');
    setWaiting(true);
    setError(null);

    try {
      const res = await apiFetch('/api/journal/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId,
          encounterId: encounterId.current,
          message,
          history,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success || typeof json.response !== 'string') {
        throw new Error(json?.error || 'MAIA could not be reached just now.');
      }
      setTurns((current) => [...current, {
        id: 'maia-' + Date.now(),
        role: 'maia',
        content: json.response,
        question: typeof json.question === 'string' ? json.question : null,
      }]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'MAIA could not be reached just now.');
    } finally {
      setWaiting(false);
    }
  }
  return (
    <section className={`mt-12 ${motion}`} aria-live="polite" aria-label="Conversation with MAIA">
      <div className="space-y-9">
        {turns.map((turn) => (
          <div key={turn.id}>
            <p className={`${type.maiaLabel} ${color.muted}`}>
              {turn.role === 'maia' ? 'MAIA' : 'You'}
            </p>
            <p
              className={`mt-2 ${type.maiaBody} ${
                turn.role === 'maia' ? color.secondary : color.human
              } whitespace-pre-wrap`}
            >
              {turn.content}
            </p>
          </div>
        ))}

        {waiting ? (
          <div aria-label="MAIA is present" aria-busy="true">
            <span className="sr-only">Waiting for MAIA</span>
            <div
              className={`h-px w-16 ${color.accent} opacity-30 animate-pulse motion-reduce:animate-none`}
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>

      <form onSubmit={send} className="mt-10 border-t border-[#a88a55]/20 pt-7">
        <label htmlFor="journal-maia-continuation" className={`${type.maiaLabel} ${color.muted}`}>
          Stay with MAIA
        </label>
        <textarea
          id="journal-maia-continuation"
          aria-label="Continue talking with MAIA"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={2}
          disabled={waiting}
          placeholder="What do you want to say back?"
          className={`journal-maia-composer mt-3 w-full resize-none bg-transparent border-0 border-b
            border-[#7f431f]/20 px-0 py-3 ${type.maiaBody} ${color.human}
            placeholder:opacity-45 outline-none focus:border-[#7f431f]/45 disabled:opacity-50`}
        />
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="submit"
            disabled={waiting || input.trim().length === 0}
            className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet} disabled:opacity-35`}
          >
            Send to MAIA
          </button>
          {latestMaiaQuestion ? (
            <button
              type="button"
              onClick={() => onWriteFromHere(latestMaiaQuestion)}
              className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet}`}
            >
              Write from here
            </button>
          ) : null}
          <button
            type="button"
            onClick={onLetItGo}
            className={`${type.meta} ${color.muted} ${focus} ${hit} ${quiet}`}
          >
            Let it rest
          </button>
        </div>
      </form>

      {error ? (
        <p className={`mt-4 ${type.meta} ${color.muted}`} role="alert">{error}</p>
      ) : null}
    </section>
  );
}
