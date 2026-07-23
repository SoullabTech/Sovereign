'use client';

/**
 * MaiaTopBar — Minimal utility bar
 *
 * Talk-first: fades to soft de-emphasis during calm mode (voice flowing).
 * Hover restores full visibility immediately.
 * Never fully disappears — always reassuringly present.
 */

import { HelpCircle, User, Mic, MessageSquare } from 'lucide-react';
import type { MaiaBehavior } from '@/lib/navigation/types';

const BEHAVIOR_LABELS: Record<MaiaBehavior, { label: string; color: string }> = {
  default: { label: 'Talk', color: 'text-[#D4B896]/50' },
  care: { label: 'Care', color: 'text-emerald-400/60' },
  scribe: { label: 'Note', color: 'text-blue-400/60' },
  mark: { label: 'Mark', color: 'text-purple-400/60' },
};

interface MaiaTopBarProps {
  explorerName: string;
  /** true = voice mode, false = text mode */
  isVoiceMode: boolean;
  behavior: MaiaBehavior;
  calmMode: boolean;
  calmCeiling: boolean;
  /** Toggle between voice and text input */
  onToggleInputMode: () => void;
  onOpenHelp: () => void;
  onOpenAccount: () => void;
}

export function MaiaTopBar({
  explorerName,
  isVoiceMode,
  behavior,
  calmMode,
  calmCeiling,
  onToggleInputMode,
  onOpenHelp,
  onOpenAccount,
}: MaiaTopBarProps) {
  const behaviorInfo = BEHAVIOR_LABELS[behavior];
  // Calm: 15% opacity. Ceiling: 40% opacity. Normal: 100%.
  const opacityClass = calmMode ? (calmCeiling ? 'opacity-40' : 'opacity-15') : 'opacity-100';

  // Personal entry point: show the member as themselves ("Me"), not a generic icon.
  // On touch/PWA there is no hover, so the name must be on screen — not in a title tooltip.
  const trimmedName = (explorerName || '').trim();
  const firstName = trimmedName.split(/\s+/)[0] || '';
  const initial = firstName ? firstName[0].toUpperCase() : '';

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 h-12 bg-[#0f0d0b]/90 backdrop-blur-xl border-b border-[#3a2a1f]/40 z-[70]
        flex items-center justify-between px-4
        transition-opacity duration-500 ease-out
        ${opacityClass}
        hover:opacity-100 hover:transition-opacity hover:duration-200
      `}
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      {/* Left: reserved for The House.
          The House owns the upper-left anchor — the shell renders the doorway
          there as a fixed element, and this bar yields the corner to it. The
          ordering is not cosmetic: the House contains MAIA, not the reverse.
          The House is orientation; MAIA is relationship. Only the behavior
          indicator rides along here, and it sits clear of the doorway. */}
      <div className="flex items-center gap-3 pl-[8.5rem]">
        {behavior !== 'default' && (
          <span className={`text-[10px] font-light tracking-wide uppercase ${behaviorInfo.color}`}>
            {behaviorInfo.label}
          </span>
        )}
      </div>

      {/* Right: MAIA, then utilities */}
      <div className="flex items-center gap-1">
        <div className="mr-2 flex items-center gap-2">
          <img src="/logo_flower 2.png" alt="MAIA" className="w-5 h-5 opacity-90" />
          <span className="text-sm font-light text-[#D4B896]/80 tracking-wider">MAIA</span>
        </div>
        {/* Voice / Text toggle */}
        <button
          onClick={onToggleInputMode}
          className={`h-8 flex items-center gap-1.5 px-2 rounded-lg transition-all ${
            isVoiceMode
              ? 'text-[#D4B896]/70 bg-[#D4B896]/5'
              : 'text-blue-400/70 bg-blue-400/5'
          } hover:opacity-100`}
          title={isVoiceMode ? 'Switch to text' : 'Switch to voice'}
        >
          {isVoiceMode ? <Mic className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
          <span className="text-[10px] font-light tracking-wide">
            {isVoiceMode ? 'Voice' : 'Text'}
          </span>
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
          className="h-8 flex items-center gap-2 pl-1 pr-2 rounded-lg text-stone-300 hover:text-[#D4B896] hover:bg-[#D4B896]/5 transition-all"
          title={explorerName || 'Account'}
          aria-label={firstName ? `You — ${firstName}` : 'Account'}
        >
          {initial ? (
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#D4B896]/15 border border-[#D4B896]/30 text-[#D4B896] text-[11px] font-medium">
              {initial}
            </span>
          ) : (
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#D4B896]/10 border border-[#D4B896]/20 text-stone-300">
              <User className="w-3.5 h-3.5" />
            </span>
          )}
          {firstName && (
            <span className="text-xs font-light tracking-wide max-w-[7rem] truncate">
              {firstName}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
