'use client';

/**
 * MaiaLeftRail — Icon-only vertical navigation rail
 *
 * Talk-first: fades during calm mode (voice flowing), restores on hover.
 * Active world icon gets subtle warm glow during voice responding state.
 * Never fully disappears — always reassuringly present.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookMarked, ChevronDown, MessageCircle, Heart, PenLine, Mic, Keyboard, BookOpen, Users, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { MAIA_WORLDS, MAIA_UTILITIES, getBoundaryFromPathname, getVisibleBoundaries } from '@/lib/navigation/maiaNav';
import { useVoiceState } from '@/lib/maia/voiceStateContext';
import { useSession } from '@/lib/hooks/useSession';
import type { MaiaWorldId, MaiaRailItemId, BoundaryId } from '@/lib/navigation/types';

/** MAIA communication mode — how the member enters the conversation */
export type MaiaMode = 'normal' | 'patient' | 'session';

const MODE_CONFIG: Record<MaiaMode, { label: string; icon: typeof MessageCircle; activeColor: string; activeBg: string; activeBorder: string }> = {
  normal:  { label: 'Talk', icon: MessageCircle, activeColor: 'text-[#D4A574]',  activeBg: 'bg-[#D4A574]/25',  activeBorder: 'border-[#D4A574]/70'  },
  patient: { label: 'Care', icon: Heart,         activeColor: 'text-[#8BA888]',  activeBg: 'bg-[#8BA888]/25',  activeBorder: 'border-[#8BA888]/70'  },
  session: { label: 'Note', icon: PenLine,       activeColor: 'text-[#A0B4C8]',  activeBg: 'bg-[#A0B4C8]/25',  activeBorder: 'border-[#A0B4C8]/70'  },
};

interface MaiaLeftRailProps {
  activeWorld: MaiaWorldId | null;
  calmMode: boolean;
  calmCeiling: boolean;
  worldHints?: Partial<Record<MaiaWorldId, boolean>>;
  /** Active boundary ID — falls back to pathname detection if omitted */
  activeBoundary?: BoundaryId | null;
  onWorldChange: (world: MaiaWorldId) => void;
  onOpenAccount?: () => void;
  onCaptureSpirit?: () => void;
  /** MAIA mode — primary state of entry (Talk / Care / Note) */
  activeMode?: MaiaMode;
  onModeChange?: (mode: MaiaMode) => void;
  /** Voice vs text input toggle */
  isVoiceInput?: boolean;
  onToggleInputMode?: () => void;
  /** Ask MAIA — orientation + Knowledge Field stance */
  askMode?: boolean;
  onAskModeChange?: (active: boolean) => void;
}

/**
 * Co-lab — top-level coordination surface on the MAIA field. The count is DIRECTED
 * attention only (open For-You loops + unread DMs); ambient channel activity is
 * excluded server-side by /api/team/colab-badge. Self-contained (own fetch + poll),
 * so it adds no state to the rail. Coordination presence, NOT a MAIA engagement bell:
 * no manufactured urgency — the number reflects real obligations and returns to zero
 * when handled. Shown when the member can act on Co-lab (founder/practitioner) OR has
 * a pending count, so pure seekers never see an empty coordination badge.
 */
function ColabRailButton({ alwaysShow }: { alwaysShow: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/team/colab-badge')
        .then(r => (r.ok ? r.json() : { total: 0 }))
        .then(d => { if (alive) setCount(d.total ?? 0); })
        .catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (!alwaysShow && count === 0) return null;

  const isActive = pathname?.startsWith('/team') ?? false;
  const label = count > 0 ? `Co-lab · ${count > 99 ? '99+' : count}` : 'Co-lab';

  return (
    <button
      onClick={() => router.push('/team/for-you')}
      className={`
        group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
        ${isActive
          ? 'bg-[#D4B896]/15 text-[#D4B896]'
          : 'text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5'
        }
      `}
      title={label}
      aria-label={count > 0 ? `Co-lab, ${count} waiting` : 'Co-lab'}
    >
      <Users className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-semibold rounded-full bg-rose-500/85 text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D4B896] rounded-r-full" />
      )}
      <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
        {label}
      </span>
    </button>
  );
}

export function MaiaLeftRail({ activeWorld, calmMode, calmCeiling, worldHints, activeBoundary, onWorldChange, onOpenAccount, onCaptureSpirit, activeMode = 'normal', onModeChange, isVoiceInput = true, onToggleInputMode, askMode = false, onAskModeChange }: MaiaLeftRailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { presenceState, amplitude } = useVoiceState();
  const { isAdmin, isPractitioner } = useSession();

  const [railExpanded, setRailExpanded] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('maia_rail_expanded') === 'true') {
      setRailExpanded(true);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('maia_rail_expanded', String(railExpanded));
    }
  }, [railExpanded]);

  // Founder/practitioner can see operational rooms (Pro Studio, Book Studio, Circles, Lab Tools).
  // Conflated for v1 per Move 1 spec — no separate founder role yet on the client.
  const isFounder = isAdmin || isPractitioner;
  const visibleBoundaries = getVisibleBoundaries(isFounder);

  // Derive active boundary from pathname if not explicitly provided
  const resolvedBoundary = activeBoundary ?? (pathname ? getBoundaryFromPathname(pathname) : null);

  const handleItemClick = (id: MaiaRailItemId, route: string) => {
    if (id === 'studio' || id === 'circles' || id === 'astrology' || id === 'labtools' || id === 'community-library' || id === 'vision-studio') {
      router.push(route);
    } else {
      // If we're in a boundary, world clicks need router navigation
      if (resolvedBoundary) {
        router.push(route);
      } else {
        onWorldChange(id as MaiaWorldId);
      }
    }
  };

  const accountUtil = MAIA_UTILITIES.find(u => u.id === 'account');
  const settingsUtil = MAIA_UTILITIES.find(u => u.id === 'settings');

  // Ambient glow on active icon when MAIA is responding
  const isResponding = presenceState === 'responding';
  const glowIntensity = isResponding ? 0.2 + amplitude * 0.3 : 0;

  // Split worlds into always-visible (no group or 'life') vs collapsible ('work')
  const worldsBeforeIdeas = MAIA_WORLDS.filter((w) => w.group !== 'work');
  const worldsFromIdeas = MAIA_WORLDS.filter((w) => w.group === 'work');

  const renderWorldButton = (world: (typeof MAIA_WORLDS)[number]) => {
    const Icon = world.icon;
    const isActive = activeWorld === world.id;
    const hasHint = !isActive && worldHints?.[world.id];

    return (
      <button
        key={world.id}
        onClick={() => handleItemClick(world.id, world.route)}
        className={`
          group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
          ${isActive
            ? 'bg-[#D4B896]/15 text-[#D4B896]'
            : hasHint
              ? 'text-[#D4B896]/60 animate-[rail-breath_2s_ease-in-out_1]'
              : 'text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5'
          }
        `}
        style={isActive && glowIntensity > 0 ? {
          boxShadow: `0 0 ${8 + amplitude * 8}px rgba(212, 184, 150, ${glowIntensity})`,
          transition: 'box-shadow 0.3s ease-out',
        } : undefined}
        title={world.tooltip || world.label}
      >
        <Icon className="w-5 h-5" />
        {isActive && (
          <motion.div
            layoutId="rail-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D4B896] rounded-r-full"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
          {world.label}
        </span>
      </button>
    );
  };

  const renderBoundaryButton = (boundary: (typeof visibleBoundaries)[number]) => {
    const Icon = boundary.icon;
    const isActive = resolvedBoundary === boundary.id;
    const accent = {
      studio:              { text: 'text-blue-400',    hover: 'hover:text-blue-400/70 hover:bg-blue-400/5',     tooltip: 'text-blue-300/90 border-blue-500/30',     activeBg: 'bg-blue-400/15' },
      circles:             { text: 'text-amber-400',   hover: 'hover:text-amber-400/70 hover:bg-amber-400/5',   tooltip: 'text-amber-300/90 border-amber-500/30',   activeBg: 'bg-amber-400/15' },
      astrology:           { text: 'text-violet-400',  hover: 'hover:text-violet-400/70 hover:bg-violet-400/5', tooltip: 'text-violet-300/90 border-violet-500/30', activeBg: 'bg-violet-400/15' },
      labtools:            { text: 'text-orange-300',  hover: 'hover:text-orange-300/70 hover:bg-orange-400/5', tooltip: 'text-orange-300/90 border-orange-500/30', activeBg: 'bg-orange-400/15' },
      'community-library': { text: 'text-purple-400',  hover: 'hover:text-purple-400/70 hover:bg-purple-400/5', tooltip: 'text-purple-300/90 border-purple-500/30', activeBg: 'bg-purple-400/15' },
    }[boundary.id as string] ?? { text: 'text-stone-400', hover: 'hover:text-stone-400/70 hover:bg-stone-400/5', tooltip: 'text-stone-300/90 border-stone-500/30', activeBg: 'bg-stone-400/15' };

    return (
      <button
        key={boundary.id}
        onClick={() => handleItemClick(boundary.id, boundary.route)}
        className={`
          group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
          ${isActive
            ? `${accent.activeBg} ${accent.text}`
            : `text-stone-500 ${accent.hover}`
          }
        `}
        title={boundary.tooltip || boundary.label}
      >
        <Icon className="w-5 h-5" />
        {isActive && (
          <motion.div
            layoutId="rail-boundary-active"
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${accent.text.replace('text-', 'bg-')}`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className={`absolute left-full ml-2 px-2 py-1 text-xs bg-[#1a1510]/95 border rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90] ${accent.tooltip}`}>
          {boundary.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      className={`
        fixed left-0 top-0 bottom-0 w-14 bg-[#0f0d0b]/95 backdrop-blur-xl border-r border-[#3a2a1f]/40 z-[80]
        flex flex-col items-center py-4
        overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-y-contain
        transition-opacity duration-500 ease-out
        ${calmMode ? (calmCeiling ? 'opacity-40' : 'opacity-15') : 'opacity-100'}
        hover:opacity-100 hover:transition-opacity hover:duration-200
      `}
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      {/* ─── ASK MAIA: orientation + Knowledge Field stance (thinking surfaces) ─── */}
      {onAskModeChange && (
        <div className="flex flex-col items-center py-0.5">
          <button
            onClick={() => onAskModeChange(!askMode)}
            className={`
              group relative w-10 h-10 flex flex-col items-center justify-center rounded-lg transition-all duration-200 gap-0.5
              ${askMode
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                : 'text-stone-500 hover:text-blue-300/70 hover:bg-blue-400/5 border border-transparent'
              }
            `}
            title={askMode ? 'Ask MAIA active — clarity + knowledge mode' : 'Ask MAIA — orientation + knowledge field'}
          >
            <BookOpen className="w-4 h-4" />
            <span className={`text-[9px] leading-none ${askMode ? 'text-blue-300' : 'text-stone-600'}`}>
              Ask
            </span>
            {askMode && (
              <motion.div
                layoutId="rail-ask-active"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-blue-400"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="absolute left-full ml-2 px-2 py-1 text-xs text-blue-300/90 bg-[#1a1510]/95 border border-blue-500/30 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
              Ask MAIA
            </span>
          </button>
        </div>
      )}

      {/* ─── divider: mode / input ─── */}
      <div className="w-6 h-px bg-[#3a2a1f]/40 my-1" />

      {/* ─── GROUP 2: INPUT (voice or text) ─── */}
      {onToggleInputMode && (
        <div className="flex flex-col items-center py-1">
          <button
            onClick={onToggleInputMode}
            className="group relative w-10 h-10 flex flex-col items-center justify-center rounded-lg text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all duration-200 border border-transparent gap-0.5"
          >
            {isVoiceInput ? <Mic className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />}
            <span className="text-[9px] leading-none text-stone-600">
              {isVoiceInput ? 'Voice' : 'Text'}
            </span>
          </button>
        </div>
      )}

      {/* ─── divider: input / navigation ─── */}
      <div className="w-6 h-px bg-[#3a2a1f]/40 my-1" />

      {/* ─── GROUP 3: NAVIGATION (worlds + capture threshold + collapsible ecosystem) ─── */}
      <div className="flex-1 flex flex-col items-center gap-1">
        {worldsBeforeIdeas.map(renderWorldButton)}

        {/* Keep — pre-interpretive intake threshold, always visible */}
        <button
          key="capture"
          onClick={() => onCaptureSpirit?.()}
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all duration-200"
          title="Keep this moment"
        >
          <Bookmark className="w-5 h-5" />
          <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
            Keep
          </span>
        </button>

        {/* Keeps — destination for the list of kept items */}
        {(() => {
          const isKeepsActive = pathname === '/maia/keep-capture';
          return (
            <button
              key="keeps-list"
              onClick={() => router.push('/maia/keep-capture')}
              className={`
                group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
                ${isKeepsActive
                  ? 'bg-[#D4B896]/15 text-[#D4B896]'
                  : 'text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5'
                }
              `}
              title="Keeps"
            >
              <BookMarked className="w-5 h-5" />
              {isKeepsActive && (
                <motion.div
                  layoutId="rail-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D4B896] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
                Keeps
              </span>
            </button>
          );
        })()}

        {/* Co-lab — top-level coordination (directed attention + unread DMs). Count
            excludes ambient channel activity; one tap → For You. */}
        <ColabRailButton alwaysShow={isFounder} />

        {/* Chevron — quiet doorway to the rest of the ecosystem */}
        <button
          key="rail-chevron"
          onClick={() => setRailExpanded((v) => !v)}
          className="group relative w-10 h-6 flex items-center justify-center rounded-md text-stone-600 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all duration-200"
          title={railExpanded ? 'Hide' : 'Show more'}
          aria-label={railExpanded ? 'Collapse rail' : 'Expand rail'}
          aria-expanded={railExpanded}
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${railExpanded ? 'rotate-180' : ''}`} />
          <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
            {railExpanded ? 'Hide' : 'Show more'}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {railExpanded && (
            <motion.div
              key="rail-collapsible"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              className="w-full flex flex-col items-center gap-1 overflow-hidden"
            >
              {worldsFromIdeas.map(renderWorldButton)}

              {/* Divider before boundaries */}
              <div className="w-6 h-px bg-[#3a2a1f]/40 my-2" />

              {/* Boundary transitions — config-driven, filtered by audience */}
              {visibleBoundaries.map(renderBoundaryButton)}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Guidance — quiet compass, always available, never announces itself */}
      <div className="flex flex-col items-center pb-2">
        {(() => {
          const isActive = pathname?.startsWith('/now-what') ?? false;
          return (
            <button
              onClick={() => router.push('/now-what/guide')}
              className={`
                group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-[#D4B896]/15 text-[#D4B896]'
                  : 'text-stone-600 hover:text-[#D4B896]/60 hover:bg-[#D4B896]/5'
                }
              `}
              title="Find my next step"
            >
              <Compass className="w-5 h-5" />
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D4B896] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
                Find my next step
              </span>
            </button>
          );
        })()}
      </div>

      {/* Bottom utility: Account + Settings */}
      <div className="flex flex-col items-center gap-1 pb-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        {accountUtil && (() => {
          const Icon = accountUtil.icon;
          return (
            <button
              key={accountUtil.id}
              onClick={() => {
                if (onOpenAccount) onOpenAccount();
                else if (accountUtil.route) router.push(accountUtil.route);
              }}
              className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all duration-200"
              title={accountUtil.label}
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
                {accountUtil.label}
              </span>
            </button>
          );
        })()}
        {settingsUtil && (() => {
          const Icon = settingsUtil.icon;
          return (
            <button
              key={settingsUtil.id}
              onClick={() => {
                if (settingsUtil.route) router.push(settingsUtil.route);
              }}
              className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all duration-200"
              title={settingsUtil.label}
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
                {settingsUtil.label}
              </span>
            </button>
          );
        })()}
      </div>
    </nav>
  );
}
