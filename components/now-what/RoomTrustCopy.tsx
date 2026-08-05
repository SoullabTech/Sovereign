'use client';

/**
 * Now What? — per-room trust copy (authorized 2026-07-13, Kelly ruling,
 * completion slice).
 *
 * Every room states, in the same four registers:
 *   holds       — what this room actually holds (true of the code beneath it)
 *   doesNotHold — what it deliberately does not hold or do
 *   whoSees     — who can see what is here
 *   control     — how the member controls it
 *
 * Claim discipline: each line must be TRUE of this environment's own store
 * paths at the moment it ships. No designed-state language in these fields —
 * a room that is deliberately protected says so in its own page copy, not by
 * promising here. If the substrate changes, this copy changes in the same PR.
 *
 * Rendered as a quiet disclosure at the foot of a room — present and legible
 * (quiet ≠ invisible), never competing with the room's one accented action.
 */

export function RoomTrustCopy({
  holds,
  doesNotHold,
  whoSees,
  control,
}: {
  holds: string;
  doesNotHold: string;
  whoSees: string;
  control: string;
}) {
  const row = 'flex flex-col sm:flex-row sm:gap-3';
  const label = 'text-slate-500 text-[10px] uppercase tracking-[0.25em] sm:w-36 shrink-0 pt-0.5';
  const line = 'text-slate-400 text-xs font-light leading-relaxed';

  return (
    <details className="group relative rounded-xl border border-slate-700/40 bg-white/[0.02] px-5 py-3">
      <summary className="cursor-pointer list-none flex items-center gap-2 text-slate-400 text-xs font-light select-none">
        <span className="text-[#c9a35e]/60 transition-transform group-open:rotate-90">›</span>
        What this room holds — and what it never does
      </summary>
      <div className="mt-3 space-y-2.5 pl-4 border-l border-slate-700/40">
        <div className={row}>
          <span className={label}>Holds</span>
          <p className={line}>{holds}</p>
        </div>
        <div className={row}>
          <span className={label}>Never holds</span>
          <p className={line}>{doesNotHold}</p>
        </div>
        <div className={row}>
          <span className={label}>Who can see it</span>
          <p className={line}>{whoSees}</p>
        </div>
        <div className={row}>
          <span className={label}>Your control</span>
          <p className={line}>{control}</p>
        </div>
      </div>
    </details>
  );
}
