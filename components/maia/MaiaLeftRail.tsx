'use client';

/**
 * MaiaLeftRail — Icon-only vertical navigation rail
 *
 * Talk-first: fades during calm mode (voice flowing), restores on hover.
 * Active world icon gets subtle warm glow during voice responding state.
 * Never fully disappears — always reassuringly present.
 */

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bookmark, MessageCircle, Heart, PenLine, Mic, Keyboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { MAIA_WORLDS, MAIA_BOUNDARIES, MAIA_UTILITIES, getBoundaryFromPathname } from '@/lib/navigation/maiaNav';
import { useVoiceState } from '@/lib/maia/voiceStateContext';
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
}

export function MaiaLeftRail({ activeWorld, calmMode, calmCeiling, worldHints, activeBoundary, onWorldChange, onOpenAccount, onCaptureSpirit, activeMode = 'normal', onModeChange, isVoiceInput = true, onToggleInputMode }: MaiaLeftRailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { presenceState, amplitude } = useVoiceState();

  // Derive active boundary from pathname if not explicitly provided
  const resolvedBoundary = activeBoundary ?? (pathname ? getBoundaryFromPathname(pathname) : null);

  const handleItemClick = (id: MaiaRailItemId, route: string) => {
    if (id === 'studio' || id === 'circles' || id === 'astrology' || id === 'labtools' || id === 'community-library') {
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

  return (
    <nav
      className={`
        fixed left-0 top-0 bottom-0 w-14 bg-[#0f0d0b]/95 backdrop-blur-xl border-r border-[#3a2a1f]/40 z-[80]
        flex flex-col items-center py-4
        transition-opacity duration-500 ease-out
        ${calmMode ? (calmCeiling ? 'opacity-40' : 'opacity-15') : 'opacity-100'}
        hover:opacity-100 hover:transition-opacity hover:duration-200
      `}
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      {/* ═══ MODE SELECTOR: primary state of entry (Talk / Care / Note) ═══ */}
      {/* Placed above Worlds because mode is HOW you enter, worlds are WHERE you go.
          This is a navigation correction per Kelly 2026-04-10: "first how I am entering,
          then where I am going." */}
      <div className="flex flex-col items-center gap-0.5 pt-2 pb-1">
        {(Object.entries(MODE_CONFIG) as [MaiaMode, typeof MODE_CONFIG[MaiaMode]][]).map(([mode, config]) => {
          const Icon = config.icon;
          const isActive = activeMode === mode;
          return (
            <button
              key={mode}
              onClick={() => onModeChange?.(mode)}
              className={`
                group relative w-10 h-10 flex flex-col items-center justify-center rounded-lg transition-all duration-200 gap-0.5
                ${isActive
                  ? `${config.activeBg} ${config.activeColor} border ${config.activeBorder}`
                  : 'text-stone-500 hover:text-stone-400 hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className={`text-[9px] leading-none ${isActive ? config.activeColor : 'text-stone-600'}`}>
                {config.label}
              </span>
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="rail-mode-active"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${config.activeColor.replace('text-', 'bg-')}`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Voice / Text toggle */}
      {onToggleInputMode && (
        <div className="flex flex-col items-center pb-1">
          <button
            onClick={onToggleInputMode}
            className="group relative w-10 h-9 flex items-center justify-center rounded-lg text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all duration-200 border border-transparent"
            title={isVoiceInput ? 'Switch to text' : 'Switch to voice'}
          >
            {isVoiceInput ? <Mic className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />}
            <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
              {isVoiceInput ? 'Voice' : 'Text'}
            </span>
          </button>
        </div>
      )}

      {/* Divider before worlds */}
      <div className="w-6 h-px bg-[#3a2a1f]/40 mb-1" />

      {/* World icons */}
      <div className="flex-1 flex flex-col items-center gap-1">
        {MAIA_WORLDS.map((world) => {
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

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="rail-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D4B896] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
                {world.label}
              </span>
            </button>
          );
        })}

        {/* Divider before boundaries */}
        <div className="w-6 h-px bg-[#3a2a1f]/40 my-2" />

        {/* Boundary transitions — config-driven */}
        {MAIA_BOUNDARIES.map((boundary) => {
          const Icon = boundary.icon;
          const isActive = resolvedBoundary === boundary.id;
          // Per-boundary accent colors
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

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="rail-boundary-active"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${accent.text.replace('text-', 'bg-')}`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Tooltip */}
              <span className={`absolute left-full ml-2 px-2 py-1 text-xs bg-[#1a1510]/95 border rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90] ${accent.tooltip}`}>
                {boundary.label}
              </span>
            </button>
          );
        })}

        {/* Divider before Capture */}
        <div className="w-6 h-px bg-[#3a2a1f]/40 my-2" />

        {/* Capture — quick mark this moment */}
        <button
          onClick={() => onCaptureSpirit?.()}
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all duration-200"
          title="Capture the Spirit"
        >
          <Bookmark className="w-5 h-5" />
          <span className="absolute left-full ml-2 px-2 py-1 text-xs text-[#D4B896]/90 bg-[#1a1510]/95 border border-[#3a2a1f]/60 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
            Capture
          </span>
        </button>
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
