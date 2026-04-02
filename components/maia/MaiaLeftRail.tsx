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
import { MAIA_WORLDS, STUDIO_RAIL_ITEM, MAIA_UTILITIES } from '@/lib/navigation/maiaNav';
import { useVoiceState } from '@/lib/maia/voiceStateContext';
import type { MaiaWorldId, MaiaRailItemId } from '@/lib/navigation/types';

interface MaiaLeftRailProps {
  activeWorld: MaiaWorldId;
  calmMode: boolean;
  calmCeiling: boolean;
  worldHints?: Partial<Record<MaiaWorldId, boolean>>;
  onWorldChange: (world: MaiaWorldId) => void;
  onOpenAccount?: () => void;
}

export function MaiaLeftRail({ activeWorld, calmMode, calmCeiling, worldHints, onWorldChange, onOpenAccount }: MaiaLeftRailProps) {
  const router = useRouter();
  const { presenceState, amplitude } = useVoiceState();

  const handleItemClick = (id: MaiaRailItemId, route: string) => {
    if (id === 'studio') {
      router.push(route);
    } else {
      onWorldChange(id as MaiaWorldId);
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
      {/* World icons */}
      <div className="flex-1 flex flex-col items-center gap-1 pt-2">
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

        {/* Divider before Studio */}
        <div className="w-6 h-px bg-[#3a2a1f]/40 my-2" />

        {/* Studio — boundary transition */}
        {(() => {
          const Icon = STUDIO_RAIL_ITEM.icon;
          return (
            <button
              onClick={() => handleItemClick(STUDIO_RAIL_ITEM.id, STUDIO_RAIL_ITEM.route)}
              className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-stone-500 hover:text-blue-400/70 hover:bg-blue-400/5 transition-all duration-200"
              title={STUDIO_RAIL_ITEM.tooltip || STUDIO_RAIL_ITEM.label}
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 text-xs text-blue-300/90 bg-[#1a1510]/95 border border-blue-500/30 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[90]">
                {STUDIO_RAIL_ITEM.label}
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
