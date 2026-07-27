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
import { capacitorHref } from '@/lib/navigation/capacitorNavigate';
import { DoorOpen, HelpCircle, Settings, User } from 'lucide-react';
import { MAIA_WORLDS, getVisibleBoundaries } from '@/lib/navigation/maiaNav';
import {
  badgeDelay,
  colabLabel,
  fetchColabBadge,
  isColabVisible,
  lastColabTotal,
} from '@/lib/navigation/colabBadge';
import type { MaiaRailItem } from '@/lib/navigation/types';

// One row shape for every place, so nothing in the House renders at a different
// scale than anything else. (The verb-taxonomy pass introduced exactly that
// inversion — secondary places larger than primary ones.)
const ROW =
  'group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none';
const ROW_ICON =
  'flex h-9 w-9 shrink-0 items-center justify-center text-[#c9a54e] transition-colors group-hover:text-[#e3c368]';
const ROW_LABEL = 'block text-[17px] leading-snug text-slate-100';
const ROW_BLURB = 'mt-1 block text-[15px] leading-snug text-slate-400';

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
   * Opens the account panel. The rail used to carry Account and Settings at its
   * foot; with the rail gone the House holds them — below a divider, so member
   * utilities never read as another world of MAIA.
   */
  onOpenAccount?: () => void;
  /** Opens the help sheet. Moved out of the top bar (ruling 2026-07-23). */
  onOpenHelp?: () => void;
}

const SERIF = 'Spectral, Georgia, serif';

export function MaiaHouseSheet({ open, onClose, isFounder, onReturnToArrival, onOpenAccount, onOpenHelp }: MaiaHouseSheetProps) {
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

  // Co-lab's visibility is conditional on live state, not on membership class,
  // so the registry's audience field cannot express it. Rule preserved verbatim
  // from the rail: visible when the member can ACT on Co-lab, or has a pending
  // count. A pure seeker never sees an empty coordination badge.
  const [colabCount, setColabCount] = useState(lastColabTotal());
  useEffect(() => {
    if (!open) return; // only poll while the House is actually on screen
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      fetchColabBadge().then((total) => {
        if (!alive) return;
        setColabCount(total);
        timer = setTimeout(tick, badgeDelay());
      });
    };
    tick();
    return () => { alive = false; clearTimeout(timer); };
  }, [open]);
  const showColab = isColabVisible(isFounder, colabCount);

  const enter = (route: string) => {
    onClose();
    // Native shell: router.push hangs (CapacitorHttp intercepts the RSC
    // fetch), so navigate the document to the exported .html directly.
    // See lib/navigation/capacitorNavigate.ts. Web: null → normal router.
    const nativeHref = capacitorHref(route);
    if (nativeHref) {
      window.location.assign(nativeHref);
      return;
    }
    router.push(route);
  };

  const Place = ({ item, label }: { item: MaiaRailItem; label?: string }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => enter(item.route)}
        className={ROW}
      >
        <span className={ROW_ICON}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </span>
        {/* Legibility floor (founder ruling §9): place names 17px, helper 15px.
            They were 15/12 — the 12px helper is the "text too small" complaint
            testers reported, and it sits on the one surface a member reads when
            they are least oriented. `truncate` is gone with it: a place whose
            description is cut mid-word cannot do the job of orienting anyone. */}
        <span className="min-w-0">
          <span className={ROW_LABEL} style={{ fontFamily: SERIF }}>
            {label ?? item.label}
          </span>
          {item.tooltip && (
            <span className={ROW_BLURB}>
              {item.tooltip}
            </span>
          )}
        </span>
      </button>
    );
  };

  const GroupHeading = ({ children }: { children: React.ReactNode }) => (
    <h3 className="mb-1.5 px-4 text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
      {children}
    </h3>
  );

  const Group = ({
    title, items, colabCount: cc, showColab: sc,
  }: { title: string; items: MaiaRailItem[]; colabCount?: number; showColab?: boolean }) => {
    // Co-lab is filtered by its live rule, not by audience. Everything else in
    // the registry is already audience-filtered upstream.
    const visible = items.filter((i) => (i.id === 'colab' ? sc !== false : true));
    if (visible.length === 0) return null;
    return (
      <section className="mb-6">
        <GroupHeading>{title}</GroupHeading>
        <div className="flex flex-col">
          {visible.map((item) => (
            <Place
              key={item.id}
              item={item}
              label={item.id === 'colab' ? colabLabel(cc ?? 0) : undefined}
            />
          ))}
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
              <p className="mt-2 text-[15px] leading-relaxed text-slate-400" style={{ fontFamily: SERIF }}>
                These places are here when you need them.
              </p>
            </div>

            <div className="px-1.5">
              {/* YOUR CENTER — where the member already is, and the way back to
                  the threshold. Not a category of activity: a location. */}
              <section className="mb-6">
                <GroupHeading>Your Center</GroupHeading>
                <div className="flex flex-col">
                  {center && <Place item={center} />}
                  {/* The deliberate return. A place among places — not a reset,
                      not a settings toggle. The member may open this room as
                      often as they like; nothing they have crossed is undone. */}
                  {onReturnToArrival && (
                    <button
                      onClick={onReturnToArrival}
                      className={ROW}
                    >
                      <span className={ROW_ICON}>
                        <DoorOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </span>
                      <span className="min-w-0">
                        <span className={ROW_LABEL} style={{ fontFamily: SERIF }}>
                          Return to Arrival
                        </span>
                        <span className={ROW_BLURB}>Begin again at the threshold</span>
                      </span>
                    </button>
                  )}
                </div>
              </section>

              <Group title="Worlds" items={worlds} />
              <Group title="Rooms" items={rooms} colabCount={colabCount} showColab={showColab} />

              {/* Below the line: the member's own account, not a place in MAIA.
                  Separated so utilities never read as another world. */}
              <div className="mx-4 mb-4 mt-1 border-t border-white/[0.07]" />
              <section className="mb-2">
                <div className="flex flex-col">
                  <button onClick={onOpenAccount} className={ROW}>
                    <span className={ROW_ICON}><User className="h-[18px] w-[18px]" strokeWidth={1.5} /></span>
                    <span className={ROW_LABEL} style={{ fontFamily: SERIF }}>Account</span>
                  </button>
                  <button onClick={() => enter('/account/settings')} className={ROW}>
                    <span className={ROW_ICON}><Settings className="h-[18px] w-[18px]" strokeWidth={1.5} /></span>
                    <span className={ROW_LABEL} style={{ fontFamily: SERIF }}>Settings</span>
                  </button>
                  {/* Help joins the utilities rather than sitting in the top bar.
                      Same reasoning as the rail: the bar is for identity and the
                      House holds the places. Help is somewhere you go, not part
                      of who you are — and the top-right cluster is the one that
                      crowds the centred wordmark, so every row moved down here
                      buys back width. */}
                  {onOpenHelp && (
                    <button onClick={() => { onClose(); onOpenHelp(); }} className={ROW}>
                      <span className={ROW_ICON}><HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.5} /></span>
                      <span className={ROW_LABEL} style={{ fontFamily: SERIF }}>Help</span>
                    </button>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
