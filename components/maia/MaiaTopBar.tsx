'use client';

/**
 * MaiaTopBar — Minimal utility bar
 *
 * Talk-first: fades to soft de-emphasis during calm mode (voice flowing).
 * Hover restores full visibility immediately.
 * Never fully disappears — always reassuringly present.
 */

import { HelpCircle, User, Mic, MicOff } from 'lucide-react';
import type { MaiaBehavior } from '@/lib/navigation/types';

const BEHAVIOR_LABELS: Record<MaiaBehavior, { label: string; color: string }> = {
  default: { label: 'Talk', color: 'text-[#D4B896]/50' },
  care: { label: 'Care', color: 'text-emerald-400/60' },
  scribe: { label: 'Scribe', color: 'text-blue-400/60' },
  mark: { label: 'Mark', color: 'text-purple-400/60' },
};

interface MaiaTopBarProps {
  explorerName: string;
  voiceEnabled: boolean;
  behavior: MaiaBehavior;
  calmMode: boolean;
  /** After 12s of continuous calm, restore to 40% for orientation */
  calmCeiling: boolean;
  onToggleVoice: () => void;
  onOpenHelp: () => void;
  onOpenAccount: () => void;
}

export function MaiaTopBar({
  explorerName,
  voiceEnabled,
  behavior,
  calmMode,
  calmCeiling,
  onToggleVoice,
  onOpenHelp,
  onOpenAccount,
}: MaiaTopBarProps) {
  const behaviorInfo = BEHAVIOR_LABELS[behavior];
  // Calm: 15% opacity. Ceiling: 40% opacity. Normal: 100%.
  const opacityClass = calmMode ? (calmCeiling ? 'opacity-40' : 'opacity-15') : 'opacity-100';

  return (
    <header
      className={`
        fixed top-0 left-14 right-0 h-12 bg-[#0f0d0b]/90 backdrop-blur-xl border-b border-[#3a2a1f]/40 z-[70]
        flex items-center justify-between px-4
        transition-opacity duration-500 ease-out
        ${opacityClass}
        hover:opacity-100 hover:transition-opacity hover:duration-200
      `}
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      {/* Left: MAIA wordmark + behavior indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/logo_flower 2.png" alt="MAIA" className="w-5 h-5 opacity-90" />
          <span className="text-sm font-light text-[#D4B896]/80 tracking-wider">MAIA</span>
        </div>
        {behavior !== 'default' && (
          <span className={`text-[10px] font-light tracking-wide uppercase ${behaviorInfo.color}`}>
            {behaviorInfo.label}
          </span>
        )}
      </div>

      {/* Right: utilities */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleVoice}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all"
          title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
        >
          {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenHelp}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all"
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAccount}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all"
          title={explorerName || 'Account'}
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
