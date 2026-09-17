'use client';

/**
 * EAA-03 / P1 — Home Arrival · "Your Field Now".
 *
 * The first ten to twenty seconds of Home, and nothing more. A quiet centre,
 * one invitation, up to three things the member themselves chose to keep, and a
 * way to begin.
 *
 *   presence → invitation → continuity → navigation
 *
 * NOT: dashboard → metrics → insights → recommendations.
 *
 * WHAT A VISIBLE THREAD MEANS. Exactly one thing: *you chose to keep this*. It
 * does not mean the material is important now, central, or something MAIA
 * noticed. Two consequences are load-bearing in the markup below:
 *
 *   - every thread is rendered at IDENTICAL size, opacity, colour and distance
 *     from the centre, on an even arc. Spatial position must never become a
 *     hidden ranking, so nothing about where a thread sits encodes anything
 *     beyond the chronological order of the member's own Keep acts;
 *   - no text here is generated. Titles are the member's own labels, and the
 *     only provenance shown is what the record mechanically establishes.
 *
 * ⛔ No affinities, no scoring, no similarity, no inference, no writes.
 * ⛔ No voice: the beginning affordance is text, and P1 proves the centre first.
 * ⛔ MAIA is not the centre and does not greet. The initial state belongs to the
 *    member; MAIA becomes active when the member enters relationship with her.
 *
 * Reduced motion: the experience is COMPLETE with motion disabled. Motion only
 * ever softens an entrance; it never carries meaning, and no information here
 * depends on animation or on spatial location alone.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RhythmHoloflower } from '@/components/liquid/RhythmHoloflower';
import { apiFetch } from '@/lib/http/apiBase';
import { formatKeptAt, sourcePhrase } from '@/lib/maia/field-now/display';

const SERIF = 'Spectral, Georgia, "Iowan Old Style", Palatino, serif';

/** Shape returned by GET /api/maia/field-now. */
export interface FieldNowThread {
  id: string;
  title: string;
  sourceType: string;
  keptAt: string | Date;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

/**
 * One kept thing.
 *
 * A button, so it is reachable by keyboard and announces itself. Provenance is
 * always in the accessibility tree via aria-describedby — it is revealed
 * visually on hover or focus and toggled by click for touch, but it is never
 * ONLY visual and never only spatial.
 */
function Thread({ thread, reduced }: { thread: FieldNowThread; reduced: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const provenanceId = `field-now-provenance-${thread.id}`;

  const kept = formatKeptAt(thread.keptAt);
  const source = sourcePhrase(thread.sourceType);
  const open = revealed || hovered;

  // An even row beneath the centre: every thread the SAME width, the SAME
  // distance below the centre, the SAME styling. Only left-to-right order
  // differs, and that order is the chronology of the member's own Keep acts —
  // which the provenance line states outright. Nothing here is a ranking.
  //
  // (An arc was tried first and rejected: it put threads at differing distances
  // from the centre, and its hit areas overlapped so neighbours intercepted one
  // another's pointer events.)
  return (
    <li className="w-[14.5rem] shrink-0">
      <button
        type="button"
        aria-describedby={provenanceId}
        aria-expanded={open}
        onClick={() => setRevealed((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="group block h-full w-full rounded-2xl px-4 py-3.5 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#E6A94A]/80"
        style={{
          // A presence, not a card. No border and no fill at rest — the thread
          // is simply there, the way something you are carrying is there. A
          // faint wash appears only under hover or focus, so the affordance is
          // discoverable without the field becoming a row of tiles.
          //
          // Identical for every thread: nothing here varies by position.
          background: open ? 'rgba(255,255,255,0.045)' : 'transparent',
          transition: reduced ? 'none' : 'background-color 500ms ease',
        }}
      >
        <span
          className="block text-[13.5px] leading-snug text-stone-300/90"
          style={{ fontFamily: SERIF }}
        >
          {thread.title}
        </span>
        <span
          id={provenanceId}
          className="mt-1.5 block text-[10.5px] leading-relaxed text-stone-400"
          style={{
            // Hidden visually until hover/focus/tap, never hidden from AT.
            opacity: open ? 1 : 0,
            transition: reduced ? 'none' : 'opacity 300ms ease',
          }}
        >
          {kept}
          {source ? (
            <>
              <span aria-hidden="true"> · </span>
              {source}
            </>
          ) : null}
        </span>
      </button>
    </li>
  );
}

export default function FieldNowArrival({
  /** Injected in tests and in the dev shell; omitted in normal use so the
   *  component performs its own read. */
  threads: injectedThreads,
  onBegin,
}: {
  threads?: FieldNowThread[];
  onBegin?: () => void;
} = {}) {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [fetched, setFetched] = useState<FieldNowThread[] | null>(null);
  const [entered, setEntered] = useState(false);
  const holoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (injectedThreads) return;
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch('/api/maia/field-now');
        const body = await res.json();
        if (alive) setFetched(Array.isArray(body?.threads) ? body.threads : []);
      } catch {
        // Zero is a valid, complete state. Never a placeholder, never a sample.
        if (alive) setFetched([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [injectedThreads]);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  const threads = useMemo(
    () => (injectedThreads ?? fetched ?? []).slice(0, 3),
    [injectedThreads, fetched],
  );

  /**
   * The threshold.
   *
   * P1-D §XVI: a prefill seam into the canonical composer does NOT exist —
   * `composerDraft` in OracleConversation is set only from in-component sources
   * (the prompt picker, the daily check-in, element discovery), never from a
   * URL parameter, an event or a prop. So this is outcome B: enter the existing
   * canonical MAIA text surface and let the member begin there. We do not build
   * a second message-write path, and we do not offer a text field here that
   * would silently discard what the member typed into it.
   */
  const begin = useCallback(() => {
    if (onBegin) return onBegin();
    router.push('/maia');
  }, [onBegin, router]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
      <div
        className="flex flex-col items-center"
        style={{
          opacity: entered || reduced ? 1 : 0,
          transform: entered || reduced ? 'none' : 'translateY(6px)',
          transition: reduced ? 'none' : 'opacity 1200ms ease, transform 1200ms ease',
        }}
      >
        {/* CENTRE — the member's field of attention. Not MAIA, not an avatar,
            not a diagnostic. Idle: no mic, no voice, no reactive state. */}
        <div ref={holoRef} className="relative grid place-items-center" aria-hidden="true">
          <RhythmHoloflower rhythmMetrics={null} size={168} interactive={false} dimmed />
        </div>

        <h1
          className="mt-8 text-center text-[26px] font-normal leading-tight text-stone-100"
          style={{ fontFamily: SERIF }}
        >
          Here you are.
        </h1>
        <p
          className="mt-2 text-center text-[16px] text-stone-300"
          style={{ fontFamily: SERIF }}
        >
          What feels present?
        </p>

        {/* THRESHOLD — looks like the beginning of speech, and is honest about
            being a doorway rather than a composer that would drop the words. */}
        <button
          type="button"
          onClick={begin}
          className="mt-7 w-[min(26rem,80vw)] rounded-full px-5 py-3 text-left text-[14px] text-stone-400 outline-none transition-colors hover:text-stone-300 focus-visible:ring-2 focus-visible:ring-[#E6A94A]/80"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            fontFamily: SERIF,
            transition: reduced ? 'none' : 'color 300ms ease',
          }}
        >
          Say what&apos;s here…
        </button>
      </div>

      {/* CONTINUITY — 0 to 3 things the member chose to keep. Zero renders
          nothing at all: the field itself is complete. */}
      {threads.length > 0 && (
        <ul
          className="mt-12 flex w-full max-w-4xl list-none flex-wrap items-start justify-center gap-6"
          aria-label="Things you chose to keep"
        >
          {threads.map((t) => (
            <Thread key={t.id} thread={t} reduced={reduced} />
          ))}
        </ul>
      )}
    </div>
  );
}
