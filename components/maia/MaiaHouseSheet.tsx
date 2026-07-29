'use client';

/**
 * MaiaHouseSheet — The House doorway.
 *
 * One quiet doorway opens the whole world. Built as a PLACE, not a list of
 * destinations: navy field, host voice, generous rhythm.
 *
 * NAVIGATION CONTRACT (2026-07-27): every place the House can open comes from a
 * SINGLE authoritative model, lib/navigation/houseDestinations. Each entry is
 * dispatched by kind — a native route, an existing member sheet, or an honest
 * web bridge — instead of the old uniform `router.push`. That is what stops the
 * registry, the mobile allowlist, and the native bundle from drifting apart and
 * producing silent white screens on iPhone. The rows render honestly per
 * platform: web-only places carry a "web ↗" mark; native rooms not yet in the
 * bundle are withheld on native rather than shown as dead buttons.
 *
 * Routes navigate for real; sheets open the member's existing surfaces. No new
 * data, no persistence, no inference; opening the House is a member act.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, HelpCircle, User } from 'lucide-react';
import {
  getHouseDestinations,
  visibleInGroup,
  classifyReachability,
  dispatchHouseDestination,
  type HouseDestination,
  type HouseDispatchContext,
  type HouseSheetId,
} from '@/lib/navigation/houseDestinations';
import {
  badgeDelay,
  colabLabel,
  fetchColabBadge,
  isColabVisible,
  lastColabTotal,
} from '@/lib/navigation/colabBadge';

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
  /** Running inside the Capacitor native shell — governs bundle-vs-web dispatch. */
  isNative?: boolean;
  onReturnToArrival?: () => void;
  onOpenAccount?: () => void;
  onOpenHelp?: () => void;
  /** Open the member's existing Changes sheet in place on /maia. */
  onOpenChanges?: () => void;
}

const SERIF = 'Spectral, Georgia, serif';

export function MaiaHouseSheet({
  open,
  onClose,
  isFounder,
  isNative = false,
  onReturnToArrival,
  onOpenAccount,
  onOpenHelp,
  onOpenChanges,
}: MaiaHouseSheetProps) {
  const router = useRouter();

  // Close on Escape — the House never traps you.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Co-lab's visibility is conditional on live state, not membership class.
  const [colabCount, setColabCount] = useState(lastColabTotal());
  useEffect(() => {
    if (!open) return; // only poll while the House is on screen
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
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [open]);
  const showColab = isColabVisible(isFounder, colabCount);

  // --- the single dispatch point ----------------------------------------
  const openSheet = (sheet: HouseSheetId) => {
    if (sheet === 'changes') onOpenChanges?.();
  };
  const ctx = (): HouseDispatchContext => ({
    isNative,
    push: (p) => router.push(p),
    openSheet,
    onClose,
  });
  const go = (d: HouseDestination) => dispatchHouseDestination(d, ctx());

  // --- resolve what to render, honestly, for this platform --------------
  const dests = getHouseDestinations(isFounder);
  const center = dests.find((d) => d.id === 'maia');
  const settings = dests.find((d) => d.id === 'settings');
  const worlds = [
    ...visibleInGroup(dests, 'life', isNative),
    ...visibleInGroup(dests, 'work', isNative),
  ];
  const rooms = visibleInGroup(dests, 'rooms', isNative).filter(
    (d) => d.conditional !== 'colab' || showColab,
  );

  const WebHint = () => (
    <span className="ml-2 align-middle text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
      web&nbsp;↗
    </span>
  );
  const InterimHint = () => (
    <span className="ml-2 align-middle text-[11px] font-medium uppercase tracking-[0.14em] text-[#c9a54e]/70">
      interim
    </span>
  );

  const Place = ({ d, label }: { d: HouseDestination; label?: string }) => {
    const Icon = d.icon;
    const onWeb = classifyReachability(d, isNative) === 'web';
    return (
      <button onClick={() => go(d)} className={ROW} aria-label={label ?? d.label}>
        <span className={ROW_ICON}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </span>
        <span className="min-w-0">
          <span className={ROW_LABEL} style={{ fontFamily: SERIF }}>
            {label ?? d.label}
            {d.interim && <InterimHint />}
            {onWeb && <WebHint />}
          </span>
          {d.tooltip && <span className={ROW_BLURB}>{d.tooltip}</span>}
        </span>
      </button>
    );
  };

  const GroupHeading = ({ children }: { children: React.ReactNode }) => (
    <h3 className="mb-1.5 px-4 text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
      {children}
    </h3>
  );

  const Section = ({ title, items }: { title: string; items: HouseDestination[] }) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-6">
        <GroupHeading>{title}</GroupHeading>
        <div className="flex flex-col">
          {items.map((d) => (
            <Place key={d.id} d={d} label={d.id === 'colab' ? colabLabel(colabCount) : undefined} />
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
              {/* YOUR CENTER — where the member already is, and the way back. */}
              <section className="mb-6">
                <GroupHeading>Your Center</GroupHeading>
                <div className="flex flex-col">
                  {center && <Place d={center} />}
                  {onReturnToArrival && (
                    <button onClick={onReturnToArrival} className={ROW}>
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

              <Section title="Worlds" items={worlds} />
              <Section title="Rooms" items={rooms} />

              {/* Below the line: the member's own account, not a place in MAIA. */}
              <div className="mx-4 mb-4 mt-1 border-t border-white/[0.07]" />
              <section className="mb-2">
                <div className="flex flex-col">
                  <button onClick={onOpenAccount} className={ROW}>
                    <span className={ROW_ICON}>
                      <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </span>
                    <span className={ROW_LABEL} style={{ fontFamily: SERIF }}>
                      Account
                    </span>
                  </button>
                  {settings && <Place d={settings} />}
                  {onOpenHelp && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenHelp();
                      }}
                      className={ROW}
                    >
                      <span className={ROW_ICON}>
                        <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </span>
                      <span className={ROW_LABEL} style={{ fontFamily: SERIF }}>
                        Help
                      </span>
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
