'use client';

type RelationshipMode = 'now' | 'story' | 'field';

const LABELS: Record<RelationshipMode, string> = {
  now: 'Now',
  story: 'Story',
  field: 'Field',
};

export default function RelationshipModeNav({
  value,
  onChange,
}: {
  value: RelationshipMode;
  onChange: (mode: RelationshipMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-jade-sage/10" role="tablist" aria-label="Ways of seeing this relationship">
      {(Object.keys(LABELS) as RelationshipMode[]).map((mode) => {
        const active = mode === value;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode)}
            className={`relative px-4 py-3 text-sm font-light transition-colors ${
              active ? 'text-jade-jade' : 'text-jade-mineral/60 hover:text-jade-sage'
            }`}
          >
            {LABELS[mode]}
            {active && <span className="absolute inset-x-3 bottom-0 h-px bg-jade-sage/70" />}
          </button>
        );
      })}
    </div>
  );
}

export type { RelationshipMode };
