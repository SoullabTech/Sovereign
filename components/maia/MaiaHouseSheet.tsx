'use client';

/**
 * MaiaHouseSheet — The House doorway (Arrival remodel Step 3).
 *
 * One quiet doorway opens the whole world. Built as a PLACE, not a list of
 * destinations: navy field, host voice, generous rhythm, the member's own
 * places gathered under the ratified grouping (Your Center / Worlds / Rooms).
 * Rooms are audience-gated by the registry (founder rooms appear only when
 * unlocked) — capabilities gated honestly, existence never hidden deceptively.
 *
 * Routes are the real maiaNav registry — this navigates for real. No new
 * data, no persistence, no inference; opening the House is a member act.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen } from 'lucide-react';
import { MAIA_WORLDS, getVisibleBoundaries } from '@/lib/navigation/maiaNav';
import type { MaiaRailItem } from '@/lib/navigation/types';

interface MaiaHouseSheetProps {
  open: boolean;
  onClose: () => void;
  /** Founder/practitioner — surfaces steward rooms in the registry. */
  isFounder: boolean;
  /**
   * The deliberate return to Arrival. Omitted when there is nothing to return
   * to — Arrival is already on screen, or the arrivalEntry kill-switch is off —
   * in which case the affordance does not render at all.
   *
   * This is what makes Arrival member-invoked rather than a one-time event the
   * member passes through once and can never see again. It opens the room; it
   * does not reset the member's history. The durable first-crossing marker is
   * untouched by this path.
   */
  onReturnToArrival?: () => void;
  /**
   * Open the Account panel. Account is not a route — there is no /account page,
   * and the nav registry declares it as `action: 'open-account'`. The House
   * invokes it rather than navigating, so the capability is represented as it
   * actually exists. Omitted when no account affordance is available.
   */
  onOpenAccount?: () => void;
}

const SERIF = 'Spectral, Georgia, serif';

/** Where the member last went, written by their own act of going. */
const LAST_PLACE_KEY = 'maia_last_place';

export function MaiaHouseSheet({ open, onClose, isFounder, onReturnToArrival, onOpenAccount }: MaiaHouseSheetProps) {
  const router = useRouter();

  // Close on Escape — the House never traps you.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const center = MAIA_WORLDS.find((w) => w.id === 'maia');
  const worlds = MAIA_WORLDS.filter((w) => w.id !== 'maia');
  const rooms = getVisibleBoundaries(isFounder);

  // "Where you were" is EVIDENCE, never inference: the last place the member
  // actually entered, written by their own act of going there. No prediction,
  // no ranking, no readiness score — the member could reconstruct it themselves.
  //
  // "Places you keep" is deliberately ABSENT: no gesture exists by which a
  // member marks a place, so the heading would be an empty ontology. A heading
  // appears only when evidence exists. If that gesture is ever built, this is
  // where its section belongs.
  const [lastPlaceId, setLastPlaceId] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    try { setLastPlaceId(localStorage.getItem(LAST_PLACE_KEY)); } catch { /* private mode */ }
  }, [open]);
  const lastPlace = lastPlaceId
    ? [...worlds, ...rooms].find((p) => p.id === lastPlaceId) ?? null
    : null;

  const enter = (route: string, id?: string) => {
    // Only real places are remembered. Returning to centre is not "somewhere
    // you were" — it is coming home, and the House already always offers it.
    if (id && id !== 'maia') {
      try { localStorage.setItem(LAST_PLACE_KEY, id); } catch { /* private mode */ }
    }
    onClose();
    router.push(route);
  };

  const Place = ({ item }: { item: MaiaRailItem }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => enter(item.route, item.id)}
        className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#c9a54e] transition-colors group-hover:text-[#e3c368]">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] leading-tight text-slate-100" style={{ fontFamily: SERIF }}>
            {item.label}
          </span>
          {item.tooltip && (
            <span className="mt-0.5 block truncate text-[12px] leading-snug text-slate-400/80">
              {item.tooltip}
            </span>
          )}
        </span>
      </button>
    );
  };

  const Group = ({ title, items }: { title: string; items: MaiaRailItem[] }) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-6 last:mb-0">
        <h3 className="mb-1.5 px-4 text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
          {title}
        </h3>
        <div className="flex flex-col">
          {items.map((item) => <Place key={item.id} item={item} />)}
        </div>
      </section>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label="The House"
            className="fixed inset-x-0 bottom-0 z-[96] mx-auto max-h-[82vh] w-full max-w-[520px] overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-white/10 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-2 scrollbar-hide"
            style={{
              background:
                'radial-gradient(120% 60% at 50% 0%, rgba(124,94,170,0.14), transparent 55%), linear-gradient(180deg, #0B1A30 0%, #071426 55%, #050f1f 100%)',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            {/* grabber */}
            <div className="mx-auto mb-4 mt-1 h-1 w-10 rounded-full bg-white/20" />

            {/* host welcome — the House greets, it does not list */}
            <div className="mb-6 px-5">
              <h2 className="text-[22px] font-light leading-tight text-slate-50" style={{ fontFamily: SERIF }}>
                Welcome to the house.
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-400" style={{ fontFamily: SERIF }}>
                These places are here when you need them.
              </p>
            </div>

            <div className="px-1.5">
              {(center || onReturnToArrival) && (
                <section className="mb-6">
                  <h3 className="mb-1.5 px-4 text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Your Center
                  </h3>
                  <div className="flex flex-col">
                    {center && <Place key={center.id} item={center} />}
                    {/* Where you were — a fact, not a suggestion. Appears only
                        once the member has actually gone somewhere. */}
                    {lastPlace && (
                      <button
                        onClick={() => enter(lastPlace.route, lastPlace.id)}
                        className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#c9a54e] transition-colors group-hover:text-[#e3c368]">
                          <lastPlace.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[15px] leading-tight text-slate-100" style={{ fontFamily: SERIF }}>
                            {lastPlace.label}
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] leading-snug text-slate-400/80">
                            Where you were
                          </span>
                        </span>
                      </button>
                    )}
                    {/* The deliberate return. A place among places — not a reset,
                        not a settings toggle. The member may open this room as
                        often as they like; nothing they have crossed is undone. */}
                    {onReturnToArrival && (
                      <button
                        onClick={onReturnToArrival}
                        className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#c9a54e] transition-colors group-hover:text-[#e3c368]">
                          <DoorOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[15px] leading-tight text-slate-100" style={{ fontFamily: SERIF }}>
                            Return to Arrival
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] leading-snug text-slate-400/80">
                            Begin again at the threshold
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                </section>
              )}
              <Group title="Worlds" items={worlds} />
              <Group title="Rooms" items={rooms} />

              {/* Utilities — not rooms. Account and Settings are things you
                  adjust, not places you go, so they sit below the line, quiet
                  and small. Keeping them here is what stopped them being
                  orphaned when the rail left the member surface. */}
              <div className="mt-2 border-t border-white/[0.07] pt-3">
                <div className="flex items-center gap-5 px-4 pb-1">
                  {/* Account is a PANEL, not a page — there is no /account
                      route, and the registry says so (action: 'open-account').
                      The House invokes the capability as it actually exists
                      rather than forcing it into navigation because the House
                      prefers navigating. Settings genuinely is a page, so it
                      routes. Represent the capability honestly. */}
                  {onOpenAccount && (
                    <button
                      onClick={() => { onClose(); onOpenAccount(); }}
                      className="text-[12.5px] text-slate-400 transition-colors hover:text-slate-200 focus-visible:text-slate-200 focus:outline-none"
                      style={{ fontFamily: SERIF }}
                    >
                      Account
                    </button>
                  )}
                  <button
                    onClick={() => enter('/account/settings')}
                    className="text-[12.5px] text-slate-400 transition-colors hover:text-slate-200 focus-visible:text-slate-200 focus:outline-none"
                    style={{ fontFamily: SERIF }}
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
