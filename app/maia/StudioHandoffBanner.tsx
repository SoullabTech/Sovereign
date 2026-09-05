'use client';

import Link from 'next/link';
import type { StudioHandoff } from './useStudioHandoff';

/**
 * WS2-03C — the visible half of "situated in the same Work".
 *
 * A conversation that silently carries hidden context is not situated; it is
 * merely influenced. If MAIA's prompt has been given the member's Work, the
 * member has to be able to see that it has — the same reason the Studio names
 * what is on its table rather than quietly assuming it.
 *
 * Three states, and the middle one is the reason this component exists:
 *
 *   situated    the Work is named, and a way back to the Studio is offered.
 *   unresolved  a Work was named in the URL and is not the member's. The room
 *               SAYS SO. It does not fall back to an unsituated conversation
 *               pretending nothing was asked, and it does not substitute
 *               another Work — the same refusal the Canvas makes about a
 *               manuscript it cannot resolve.
 *   none        nothing was carried in. Renders nothing at all: an ordinary
 *               visit to MAIA is not a degraded handoff and must not be
 *               decorated like one.
 *
 * Deliberately quiet chrome. It reports a fact about the room; it is not an
 * announcement, a badge, or a feature being advertised.
 */
export default function StudioHandoffBanner({ handoff }: { handoff: StudioHandoff }) {
  if (handoff.phase === 'none' || handoff.phase === 'loading') return null;

  const base =
    'relative z-30 flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 ' +
    'border-b text-[12.5px] leading-relaxed';

  if (handoff.phase === 'unresolved') {
    return (
      <div
        data-studio-handoff="unresolved"
        className={base}
        style={{ borderColor: 'rgba(212,184,150,0.18)', color: 'rgba(232,222,208,0.8)' }}
      >
        <span>
          A work was named on the way in, and it is not one of yours. This
          conversation is not situated in it — nothing else was opened in its place.
        </span>
        {handoff.returnHref && (
          <Link href={handoff.returnHref} className="underline underline-offset-4 opacity-80">
            Back to the Studio
          </Link>
        )}
      </div>
    );
  }

  if (handoff.phase === 'error') {
    return (
      <div
        data-studio-handoff="error"
        className={base}
        style={{ borderColor: 'rgba(212,184,150,0.18)', color: 'rgba(232,222,208,0.7)' }}
      >
        <span>
          Your works could not be read just now, so this conversation is not
          situated in one. Nothing is affected.
        </span>
      </div>
    );
  }

  const work = handoff.work!;
  return (
    <div
      data-studio-handoff="situated"
      className={base}
      style={{ borderColor: 'rgba(212,184,150,0.22)', color: 'rgba(232,222,208,0.85)' }}
    >
      <span style={{ opacity: 0.6 }}>In relation to</span>
      <span style={{ color: '#D4B896' }}>{work.title ?? 'your work'}</span>
      {/* The member's own sentence, if they wrote one. Never a summary. */}
      {work.purpose && <span style={{ opacity: 0.55 }}>— {work.purpose}</span>}
      <span className="flex-1" />
      {handoff.returnHref && (
        <Link href={handoff.returnHref} className="underline underline-offset-4 opacity-70">
          Back to the Studio
        </Link>
      )}
    </div>
  );
}
