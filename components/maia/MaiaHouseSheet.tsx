'use client';

/**
 * MaiaHouseSheet — The House doorway (Arrival remodel Step 3).
 *
 * One quiet doorway opens the whole world. Built as a PLACE, not a list of
 * destinations: navy field, host voice, generous rhythm.
 *
 * The House is now the member's ONLY navigation. The feature rail is gone from
 * the ordinary member experience, so this sheet greets in verbs — the four
 * places a member actually arrives wanting (Continue / Reflect / Create /
 * Belong) — and keeps every remaining destination behind "More places".
 * A member meets MAIA and a house, not MAIA and eight applications.
 *
 * Because the rail no longer exists, "More places" is the last route to those
 * destinations: nothing may be dropped from it. Rooms stay audience-gated by
 * the registry (founder rooms appear only when unlocked) — capabilities gated
 * honestly, existence never hidden deceptively.
 *
 * Routes are the real maiaNav registry — this navigates for real. No new
 * data, no persistence, no inference; opening the House is a member act.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DoorOpen } from 'lucide-react';
import {
  MAIA_WORLDS,
  getVisibleBoundaries,
  HOUSE_PRIMARY,
  HOUSE_PRIMARY_WORLD_IDS,
  type HousePrimaryPlace,
} from '@/lib/navigation/maiaNav';
import type { MaiaRailItem, MaiaWorldId } from '@/lib/navigation/types';

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
}

const SERIF = 'Spectral, Georgia, serif';

export function MaiaHouseSheet({ open, onClose, isFounder, onReturnToArrival }: MaiaHouseSheetProps) {
  const router = useRouter();

  // Close on Escape — the House never traps you.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // The primary four, resolved against the canonical world registry so the
  // House never hardcodes a destination.
  const primary = HOUSE_PRIMARY
    .map((p) => ({ p, world: MAIA_WORLDS.find((w) => w.id === p.worldId) }))
    .filter((x): x is { p: HousePrimaryPlace; world: MaiaRailItem } => Boolean(x.world));

  // Everything the primary four did not claim. The rail is gone, so this drawer
  // is the ONLY remaining route to these places — nothing may be dropped here.
  const morePlaces: MaiaRailItem[] = [
    ...MAIA_WORLDS.filter((w) => !HOUSE_PRIMARY_WORLD_IDS.includes(w.id as MaiaWorldId)),
    ...getVisibleBoundaries(isFounder),
  ];

  const [moreOpen, setMoreOpen] = useState(false);
  // Collapse the drawer whenever the House closes, so it always reopens in its
  // quiet state rather than remembering an expanded list.
  useEffect(() => { if (!open) setMoreOpen(false); }, [open]);

  const enter = (route: string) => {
    onClose();
    router.push(route);
  };

  const Place = ({ item }: { item: MaiaRailItem }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => enter(item.route)}
        className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#c9a54e] transition-colors group-hover:text-[#e3c368]">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </span>
        {/* Legibility floor (founder ruling §9): place names 17px, helper 15px.
            They were 15/12 — the 12px helper is the "text too small" complaint
            testers reported, and it sits on the one surface a member reads when
            they are least oriented. `truncate` is gone with it: a place whose
            description is cut mid-word cannot do the job of orienting anyone. */}
        <span className="min-w-0">
          <span className="block text-[17px] leading-snug text-slate-100" style={{ fontFamily: SERIF }}>
            {item.label}
          </span>
          {item.tooltip && (
            <span className="mt-1 block text-[15px] leading-snug text-slate-400">
              {item.tooltip}
            </span>
          )}
        </span>
      </button>
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
              <p className="mt-2 text-[15px] leading-relaxed text-slate-400" style={{ fontFamily: SERIF }}>
                These places are here when you need them.
              </p>
            </div>

            <div className="px-1.5">
              <section className="mb-6">
                {/* The primary four. No heading — a house does not label its own
                    rooms "PRIMARY". These are simply what is offered first. */}
                <div className="flex flex-col">
                  {primary.map(({ p, world }) => {
                    const Icon = world.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => enter(world.route)}
                        className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#c9a54e] transition-colors group-hover:text-[#e3c368]">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[17px] leading-snug text-slate-100" style={{ fontFamily: SERIF }}>
                            {p.label}
                          </span>
                          <span className="mt-1 block text-[15px] leading-snug text-slate-400">
                            {p.blurb}
                          </span>
                        </span>
                      </button>
                    );
                  })}

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
                          <span className="block text-[17px] leading-snug text-slate-100" style={{ fontFamily: SERIF }}>
                            Return to Arrival
                          </span>
                          <span className="mt-1 block text-[15px] leading-snug text-slate-400">
                            Begin again at the threshold
                          </span>
                        </span>
                      </button>
                    )}
                </div>
              </section>

              {/* More places — everything the primary four did not claim.
                  Closed by default: the House offers a few things well before it
                  offers everything. With the rail gone this drawer is the only
                  remaining route to these destinations, so it is a disclosure,
                  never a filter. */}
              {morePlaces.length > 0 && (
                <section className="mb-2">
                  <button
                    onClick={() => setMoreOpen((v) => !v)}
                    aria-expanded={moreOpen}
                    aria-controls="house-more-places"
                    className="group flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                  >
                    <span className="text-[17px] text-slate-300" style={{ fontFamily: SERIF }}>
                      More places
                    </span>
                    <span className="text-[15px] text-slate-500">{morePlaces.length}</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 text-slate-500 transition-transform duration-300 ${moreOpen ? 'rotate-180' : ''}`}
                      strokeWidth={1.5}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {moreOpen && (
                      <motion.div
                        id="house-more-places"
                        key="house-more-places"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col pt-1">
                          {morePlaces.map((item) => <Place key={item.id} item={item} />)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
