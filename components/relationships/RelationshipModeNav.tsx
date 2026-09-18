'use client';

import { motion, useReducedMotion } from 'framer-motion';

type RelationshipMode = 'now' | 'story' | 'field';

const MODES: Array<{ key: RelationshipMode; label: string; cue: string }> = [
  { key: 'now', label: 'Now', cue: 'be with' },
  { key: 'story', label: 'Story', cue: 'look back' },
  { key: 'field', label: 'Field', cue: 'widen' },
];

export default function RelationshipModeNav({
  value,
  onChange,
}: {
  value: RelationshipMode;
  onChange: (mode: RelationshipMode) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="mx-auto flex w-fit items-center gap-1 rounded-full border border-[#b7b0a3]/60 bg-[#fffaf3]/75 p-1 shadow-[0_8px_26px_rgba(77,67,52,0.06)] backdrop-blur-sm"
      role="tablist"
      aria-label="Ways of attending to this relationship"
    >
      {MODES.map((mode) => {
        const active = mode.key === value;
        return (
          <button
            key={mode.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode.key)}
            className={`relative min-w-[86px] overflow-hidden rounded-full px-4 py-2.5 text-left transition-colors ${
              active ? 'text-[#3f5544]' : 'text-[#777269] hover:text-[#4e6651]'
            }`}
          >
            {active && (
              <motion.span
                layoutId="relationship-mode-focus"
                className="absolute inset-0 rounded-full border border-[#9caf8f]/55 bg-[#e9efe3] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 34, mass: 0.7 }
                }
              />
            )}
            <span className="relative z-10 block text-sm font-light">{mode.label}</span>
            <span className="relative z-10 mt-0.5 block text-[10px] font-light text-[#827d73]">
              {mode.cue}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type { RelationshipMode };
