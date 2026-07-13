'use client';

/**
 * Now What? — the environment shell. One shell + thresholds (ruling
 * 2026-07-12, option 1 of the integration question).
 *
 * The shell is the hallway the founder walk found missing: a thin, quiet
 * frame every member room shares — the environment's name, where you are,
 * and the open doors. It recedes mid-session (variant="quiet") so the room
 * stays a room; it is doorway affordance, never app chrome.
 *
 * RIDER 1 (attached at ruling): the "where you are" slot is NAME-ONLY —
 * the current room's name, nothing else — until the position surface
 * clears its sitting gate. The shell must not smuggle program position
 * ahead of the ruling that position is member/practitioner-authored,
 * never system-proposed.
 *
 * RIDER 2 (attached at ruling): arrival-state logic uses SESSION FACTS
 * only — the presence of the member's own signed-in session
 * (localStorage `beta_user`, a fact the member created by signing in) —
 * never inferred state. No ambient cognition in the shell, from day one.
 *
 * The threshold replaces the inline "Sign in required." API error the
 * walk hit inside the room: sign-in becomes a door you meet BEFORE the
 * room, in the field's own register, not a red failure inside it.
 */

import { useEffect, useState } from 'react';

const ACCENT = '#ffe27a';

/**
 * Session fact, per rider 2: signed in or not — read from the member's own
 * session store, never inferred. Returns 'unknown' until the client reads
 * localStorage (SSR-safe), then 'in' | 'out'.
 */
export function useMemberSession(): 'unknown' | 'in' | 'out' {
  const [state, setState] = useState<'unknown' | 'in' | 'out'>('unknown');
  useEffect(() => {
    try {
      setState(localStorage.getItem('beta_user') ? 'in' : 'out');
    } catch {
      setState('out');
    }
  }, []);
  return state;
}

const DOORS: { key: string; name: string; route: string }[] = [
  { key: 'room', name: 'Session room', route: '/now-what/room' },
  { key: 'field', name: 'Your field', route: '/now-what/field' },
];

export function NowWhatShell({
  current,
  fieldContext,
  variant = 'full',
}: {
  /** Name-only, per rider 1 — the room the member is standing in. */
  current: string;
  fieldContext?: string;
  /** "quiet" recedes mid-session: wordmark only, lower contrast. */
  variant?: 'full' | 'quiet';
}) {
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const mapHref = `/now-what/map${ctx}`;

  if (variant === 'quiet') {
    return (
      <div className="max-w-prose mx-auto px-4 pt-5 flex items-baseline justify-between">
        <a
          href={mapHref}
          className="text-[11px] uppercase tracking-[0.3em] text-slate-600 hover:text-slate-400 transition-colors"
        >
          Now What?
        </a>
        <span className="text-[11px] font-light text-slate-700">{current}</span>
      </div>
    );
  }

  return (
    <div className="max-w-prose mx-auto px-4 pt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
      <a
        href={mapHref}
        className="text-[11px] uppercase tracking-[0.3em] hover:opacity-80 transition-opacity"
        style={{ color: ACCENT }}
      >
        Now What?
      </a>
      <span className="text-[11px] font-light text-slate-500">{current}</span>
      <span className="flex-1" />
      {DOORS.filter((d) => d.name !== current).map((d) => (
        <a
          key={d.key}
          href={`${d.route}${ctx}`}
          className="text-[11px] font-light text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors"
        >
          {d.name}
        </a>
      ))}
    </div>
  );
}

/**
 * The threshold — sign-in as a door met before the room, in the field's
 * register. Rendered by a room's page when the session fact says 'out';
 * signed-in members never see it.
 */
export function NowWhatThreshold({
  roomName,
  line,
  fieldContext,
}: {
  roomName: string;
  line: string;
  fieldContext?: string;
}) {
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const next =
    typeof window !== 'undefined'
      ? encodeURIComponent(window.location.pathname + window.location.search)
      : '';

  return (
    <div className="max-w-prose mx-auto px-4 py-16 space-y-6">
      <p className="text-xs uppercase tracking-[0.35em]" style={{ color: ACCENT }}>
        Now What?
      </p>
      <h1 className="text-slate-100 text-xl font-light">{roomName}</h1>
      <p className="text-slate-400 text-sm font-light leading-relaxed max-w-prose">{line}</p>
      <p className="text-slate-500 text-sm font-light leading-relaxed">
        This room holds what you choose to keep — signing in is how it knows
        whose field to hold.
      </p>
      <div className="flex items-center gap-6 pt-2">
        <a
          href={`/signin${next ? `?next=${next}` : ''}`}
          className="text-base underline underline-offset-4 transition-colors hover:opacity-80"
          style={{ color: ACCENT }}
        >
          Sign in to enter
        </a>
        <a
          href={`/now-what/map${ctx}`}
          className="text-slate-500 hover:text-slate-300 text-sm font-light underline underline-offset-4 transition-colors"
        >
          See the map first
        </a>
      </div>
    </div>
  );
}
