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
 * Visual pass 2026-07-12 (founder verdict: text-only minimalism reads as
 * wireframe, not place): the shell and threshold now speak the room's own
 * visual language — holoflower mark, radial glow, amber doors. Richness
 * from the environment's identity; never metrics, badges, gamification.
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
import { RoomHoloflower } from '@/components/maia/vision-studio/RoomHoloflower';

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
  { key: 'map', name: 'Map', route: '/now-what/map' },
  { key: 'room', name: 'Session room', route: '/now-what/room' },
  { key: 'field', name: 'Your field', route: '/now-what/field' },
];

function HoloMark({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/holoflower.svg"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ filter: 'brightness(1.4)' }}
    />
  );
}

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
    // Quiet ≠ invisible (walk finding 2026-07-12: the founder couldn't see
    // the exit — the arc ruling requires a VISIBLE way out of every room).
    // The wordmark stays amber like every other door in the environment;
    // quietness comes from size and emptiness, not from hiding the handle.
    return (
      <div className="max-w-prose mx-auto px-4 pt-5 flex items-center justify-between">
        <a
          href={mapHref}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] opacity-85 hover:opacity-100 transition-opacity"
          style={{ color: ACCENT }}
        >
          <HoloMark size={15} className="opacity-90" />
          Now What?
        </a>
        <span className="text-[11px] font-light text-slate-500">{current}</span>
      </div>
    );
  }

  // Full variant = real navigation, not labels (walk finding #5, 2026-07-12
  // prod: "I don't know what to do navigating this — how will anyone else?").
  // Visible pills; the room you're in is lit. Wayfinding is a kindness, not
  // chrome — the restraint lives in the ROOM's quiet variant, not here.
  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <a
        href={mapHref}
        className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] hover:opacity-80 transition-opacity"
        style={{ color: ACCENT }}
      >
        <HoloMark size={18} />
        Now What?
      </a>
      <span className="flex-1" />
      <nav className="flex items-center gap-2" aria-label="Rooms">
        {DOORS.map((d) =>
          d.name === current ? (
            <span
              key={d.key}
              aria-current="page"
              className="rounded-full px-4 py-1.5 text-xs border"
              style={{
                color: ACCENT,
                borderColor: 'rgba(255,226,122,0.45)',
                background: 'rgba(255,226,122,0.08)',
              }}
            >
              {d.name}
            </span>
          ) : (
            <a
              key={d.key}
              href={`${d.route}${ctx}`}
              className="rounded-full px-4 py-1.5 text-xs border border-slate-600/60 text-slate-300 hover:text-slate-100 hover:border-slate-400 hover:bg-white/[0.04] transition-all"
            >
              {d.name}
            </a>
          )
        )}
      </nav>
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
    <div className="relative max-w-prose mx-auto px-4 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_15%,rgba(125,175,255,0.10),transparent_70%)]"
      />
      <div className="relative flex flex-col items-center text-center space-y-5">
        <div style={{ animation: 'nwtFadeUp 0.7s ease both' }}>
          <RoomHoloflower
            coolTint
            mono
            motionState="idle"
            proposedElement={null}
            confirmedElements={[]}
            size={140}
          />
        </div>
        <p
          className="text-xs uppercase tracking-[0.45em]"
          style={{ color: ACCENT, animation: 'nwtFadeUp 0.55s ease 80ms both' }}
        >
          Now What?
        </p>
        <h1
          className="text-slate-100 text-2xl font-extralight tracking-wide"
          style={{ animation: 'nwtFadeUp 0.55s ease 140ms both' }}
        >
          {roomName}
        </h1>
        <p
          className="text-slate-400 text-sm font-light leading-relaxed max-w-md"
          style={{ animation: 'nwtFadeUp 0.55s ease 200ms both' }}
        >
          {line}
        </p>
        <p
          className="text-slate-500 text-sm font-light leading-relaxed max-w-md"
          style={{ animation: 'nwtFadeUp 0.55s ease 260ms both' }}
        >
          This room holds what you choose to keep — signing in is how it knows
          whose field to hold.
        </p>
        <div
          className="flex items-center gap-6 pt-3"
          style={{ animation: 'nwtFadeUp 0.55s ease 320ms both' }}
        >
          <a
            href={`/signin${next ? `?next=${next}` : ''}`}
            className="rounded-full border px-6 py-2 text-sm transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.25)]"
            style={{ color: ACCENT, borderColor: 'rgba(255,226,122,0.4)' }}
          >
            Sign in to enter
          </a>
          <a
            href={`/now-what/map${ctx}`}
            className="text-slate-400 hover:text-slate-200 text-sm font-light underline underline-offset-4 transition-colors"
          >
            See the map first
          </a>
        </div>
      </div>
      <style>{`
        @keyframes nwtFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
