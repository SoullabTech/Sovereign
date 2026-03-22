'use client';

/**
 * AuditModeSelector
 *
 * Three-mode selector: Individual | Partnership | Team
 * Field slug optionally reorders or labels the recommended mode for this field.
 */

export type AuditMode = 'individual' | 'partnership' | 'team';

interface Props {
  selected: AuditMode;
  onChange: (mode: AuditMode) => void;
  fieldSlug?: string;
}

type ModeConfig = {
  mode: AuditMode;
  label: string;
  description: string;
};

const BASE_MODES: ModeConfig[] = [
  {
    mode: 'individual',
    label: 'Individual',
    description: 'Map your own identity architecture — structural axis, tensions, and leverage points.',
  },
  {
    mode: 'partnership',
    label: 'Partnership',
    description: 'Map a two-person field — resonance zones, friction, collective blindspot.',
  },
  {
    mode: 'team',
    label: 'Team',
    description: 'Map a collective field — operating mode, coherence zones, fracture lines.',
  },
];

/**
 * Field-specific mode emphasis.
 * kelly: guide/healer focus → individual primary, partnership secondary
 * nathan: systems/operations focus → team primary, partnership secondary
 * default: all equal
 */
function getPrimaryMode(fieldSlug?: string): AuditMode | null {
  if (fieldSlug === 'kelly') return 'individual';
  if (fieldSlug === 'nathan') return 'team';
  return null;
}

function getSecondaryMode(fieldSlug?: string): AuditMode | null {
  if (fieldSlug === 'kelly') return 'partnership';
  if (fieldSlug === 'nathan') return 'partnership';
  return null;
}

export function AuditModeSelector({ selected, onChange, fieldSlug }: Props) {
  const primaryMode = getPrimaryMode(fieldSlug);
  const secondaryMode = getSecondaryMode(fieldSlug);

  return (
    <div className="space-y-2">
      {BASE_MODES.map(({ mode, label, description }) => {
        const isSelected = selected === mode;
        const isPrimary = primaryMode === mode;
        const isSecondary = !isPrimary && secondaryMode === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`w-full text-left px-5 py-4 rounded border transition-colors ${
              isSelected
                ? 'bg-amber-500/15 border-amber-500/50 text-stone-100'
                : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${isSelected ? 'text-amber-300' : ''}`}>
                {label}
              </span>
              {isPrimary && (
                <span className="text-xs text-amber-500/70 uppercase tracking-widest">
                  Recommended
                </span>
              )}
              {isSecondary && (
                <span className="text-xs text-stone-500 uppercase tracking-widest">
                  Also available
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">{description}</p>
          </button>
        );
      })}
    </div>
  );
}
