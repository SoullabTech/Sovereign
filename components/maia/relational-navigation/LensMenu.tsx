'use client';

/**
 * Lens menu.
 *
 * Invariant: the member chooses the lens. The system does not "recommend",
 * pre-select, or rank lenses. Lenses are vantage points, not categories.
 * Max 4 selected so the response stays coherent.
 *
 * If you find yourself adding "suggested lens" logic — stop. That is the
 * surveillance-shape of relational architecture (per `Relationally Timed
 * Invitation` doctrine: "the system knows what I need" is the wrong shape).
 */

import { LENSES, type LensKey } from '@/lib/maia/relationalNavigation/types';

interface LensMenuProps {
  selected: LensKey[];
  onChange: (next: LensKey[]) => void;
  max?: number;
}

export function LensMenu({ selected, onChange, max = 4 }: LensMenuProps) {
  const selectedSet = new Set(selected);

  const toggle = (key: LensKey) => {
    if (selectedSet.has(key)) {
      onChange(selected.filter((k) => k !== key));
      return;
    }
    if (selected.length >= max) {
      return;
    }
    onChange([...selected, key]);
  };

  const atMax = selected.length >= max;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-medium tracking-wide text-amber-300/80 uppercase">
          Lenses
        </h3>
        <span className="text-[12px] text-soullab-text-muted">
          {selected.length} / {max} chosen
        </span>
      </div>
      <p className="text-[13px] text-soullab-text-muted mb-4 leading-relaxed">
        Ways of looking, not categories. Choose what feels right for this
        moment. You may pick none and reflect openly.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LENSES.map((lens) => {
          const isSelected = selectedSet.has(lens.key);
          const isDisabled = !isSelected && atMax;
          return (
            <button
              key={lens.key}
              type="button"
              onClick={() => toggle(lens.key)}
              disabled={isDisabled}
              className={[
                'text-left rounded-xl border px-4 py-3 transition-all',
                isSelected
                  ? 'border-amber-400/30 bg-amber-500/15 ring-1 ring-amber-400/30'
                  : 'border-amber-500/15 bg-stone-900/40 backdrop-blur-md hover:border-amber-500/25 hover:bg-stone-900/60',
                isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              <div
                className={[
                  'text-[14px] font-medium tracking-wide',
                  isSelected ? 'text-amber-50' : 'text-soullab-text-primary',
                ].join(' ')}
              >
                {lens.label}
              </div>
              <div className="text-[12.5px] text-soullab-text-muted mt-1 leading-snug">
                {lens.invitation}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
