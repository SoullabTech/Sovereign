'use client';

/**
 * MaiaTopBar — Minimal utility bar
 *
 * Talk-first: fades to soft de-emphasis during calm mode (voice flowing).
 * Hover restores full visibility immediately.
 * Never fully disappears — always reassuringly present.
 */

import { User } from 'lucide-react';
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
  behavior: MaiaBehavior;
  calmMode: boolean;
  calmCeiling: boolean;
  onOpenAccount: () => void;
}

export function MaiaTopBar({
  explorerName,
  behavior,
  calmMode,
  calmCeiling,
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
        fixed top-0 left-0 right-0 h-[calc(54px+env(safe-area-inset-top,0px))] bg-[#0f0d0b]/90 backdrop-blur-xl border-b border-[#3a2a1f]/40 z-[70]
        flex items-center justify-between px-4
        transition-opacity duration-500 ease-out
        ${opacityClass}
        hover:opacity-100 hover:transition-opacity hover:duration-200
      `}
      style={{
        // +6px breath below the status bar — founder device walk 2026-07-27:
        // flush against env(safe-area-inset-top) read as "a touch high" on a
        // physical iPhone. The constant applies uniformly (desktop gains the
        // same 6px), so the wordmark never rides the status-bar edge.
        paddingTop: 'calc(max(env(safe-area-inset-top), 0px) + 6px)',
      }}
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

      {/* MAIA — centred on the bar itself, not on whatever space the flanking
          clusters happen to leave. Absolutely positioned so the name holds the
          middle no matter how wide the doorway label or the utility cluster get;
          in a flex run it drifted with them and sat centred only by luck at some
          widths. `pointer-events-none` so it never intercepts a tap meant for a
          control beneath it.

          No holoflower here. The jewel belongs to the field and to the SOULLAB
          lockup below — repeating it in the bar put two of the same mark on one
          screen, competing a few hundred pixels apart. The wordmark alone is
          enough to say whose room this is.

          Shown at every width. It was gated at min-[480px] because the Voice/Text
          switch made this cluster 199px wide and the wordmark printed straight
          through it below ~436px. That switch now lives beside the composer, the
          cluster is ~63px narrower, and the collision is gone — measured, not
          assumed. The gate went with the cause.

          If anything is ever added back to either flanking cluster, re-measure
          the free middle rather than reaching for a breakpoint: what matters is
          where the middle runs out, not a design-system step. */}
      <div className="pointer-events-none absolute inset-x-0 flex justify-center">
        <span className="text-sm font-light tracking-wider text-[#D4B896]/80">MAIA</span>
      </div>

      {/* Right: utilities.

          The Voice/Text switch used to live here and has moved to the composer
          row (founder ruling, 2026-07-23). It is contextual to input, not global
          identity — and at 199px this cluster was what pushed the centred MAIA
          wordmark off small screens. Both return paths already exist beside the
          input they govern: a Voice switch in the composer row, and a 44x44
          keyboard toggle in VoiceInteractionBar for the way back.

          Keep this cluster to identity and global utilities. Anything that acts
          on the composer belongs next to the composer. */}
      <div className="flex items-center gap-1">
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
