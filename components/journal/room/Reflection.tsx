'use client';

/**
 * Journal Room — State 4: MAIA Reflection.
 *
 * Approved reference:
 *   `Reflect with MAIA` appears only on a kept entry · MAIA NOTICED ·
 *   MAIA ASKED · short response · Write from here · Let it go ·
 *   reflection itself transient
 *
 * TRANSIENT IS LOAD-BEARING. The reflection is held in component state and
 * nothing writes it anywhere. `Let it go` discards it; leaving discards it.
 * There is no reflection history, by design.
 *
 * MAIA is a relational presence here, not feature chrome (Work Unit §7). Two
 * short labelled statements beneath the member's own writing — never a thread.
 *
 * MUST NOT appear (contract §4 state 4): chat input · message bubbles ·
 * streaming cursor · avatar · "MAIA is thinking" · regenerate ·
 * persisted reflection history · follow-up turns.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { type, color, focus, motion, hit, quiet } from './tokens';

interface ReflectionBody {
  noticed: string;
  asked: string;
}

export interface ReflectionProps {
  entryId: string;
  onWriteFromHere: (seed: string) => void;
  onLetItGo: () => void;
}

export function Reflection({ entryId, onWriteFromHere, onLetItGo }: ReflectionProps) {
  const [body, setBody] = useState<ReflectionBody | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/journal/reflect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entryId }),
        });
        const json = await res.json().catch(() => null);
        if (!live) return;
        if (json?.success && json.noticed && json.asked) {
          setBody({ noticed: json.noticed, asked: json.asked });
        } else {
          setError(json?.error ?? 'MAIA could not be reached just now.');
        }
      } catch {
        if (live) setError('MAIA could not be reached just now.');
      }
    })();
    return () => {
      live = false;
    };
  }, [entryId]);

  if (error) {
    return (
      <section className="mt-12" aria-live="polite">
        <p className={`${type.meta} ${color.muted}`}>{error}</p>
        <button
          type="button"
          onClick={onLetItGo}
          className={`mt-4 ${type.meta} ${color.muted} ${focus} ${hit} ${quiet}`}
        >
          Let it go
        </button>
      </section>
    );
  }

  if (!body) {
    // Quiet waiting. MAIA does not narrate her own processing.
    return (
      <section className="mt-12" aria-live="polite" aria-busy="true">
        <span className="sr-only">Waiting for MAIA</span>
        <div className={`h-px w-16 ${color.accent} opacity-30 animate-pulse motion-reduce:animate-none`} aria-hidden="true" />
      </section>
    );
  }

  return (
    <section className={`mt-12 ${motion}`} aria-live="polite">
      <div>
        <p className={`${type.maiaLabel} ${color.muted}`}>MAIA noticed</p>
        <p className={`mt-2 ${type.maiaBody} ${color.secondary}`}>{body.noticed}</p>
      </div>

      <div className="mt-8">
        <p className={`${type.maiaLabel} ${color.muted}`}>MAIA asked</p>
        <p className={`mt-2 ${type.maiaBody} ${color.secondary}`}>{body.asked}</p>
      </div>

      <div className="mt-10 flex items-center gap-6">
        <button
          type="button"
          onClick={() => onWriteFromHere(body.asked)}
          className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet}`}
        >
          Write from here
        </button>
        <button
          type="button"
          onClick={onLetItGo}
          className={`${type.meta} ${color.muted} ${focus} ${hit} ${quiet}`}
        >
          Let it go
        </button>
      </div>
    </section>
  );
}
