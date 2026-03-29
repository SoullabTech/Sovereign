import type { FieldTheme } from '@/lib/field/types';
import type { ThemeMovement } from '@/lib/field/types';
import type { Element } from '@/lib/types/voiceIntent';

// ── Element dot colours ──────────────────────────────────────────

const ELEMENT_DOT: Record<string, string> = {
  fire:   'bg-orange-400/70',
  water:  'bg-blue-400/70',
  earth:  'bg-emerald-400/70',
  air:    'bg-sky-300/70',
  aether: 'bg-violet-400/70',
};

// ── Movement badge styling ───────────────────────────────────────

const MOVEMENT_STYLE: Record<ThemeMovement, { label: string; className: string }> = {
  strengthening: { label: 'Strengthening', className: 'text-amber-400/60' },
  returning:     { label: 'Returning',     className: 'text-blue-300/60' },
  softening:     { label: 'Softening',     className: 'text-white/30' },
  unresolved:    { label: 'Unresolved',    className: 'text-white/40' },
};

interface EmergingThemesPanelProps {
  themes: FieldTheme[];
}

/**
 * What's emerging across time — recurring themes without over-explaining.
 * Max 3 visible. No percentages, no confidence scores.
 */
export function EmergingThemesPanel({ themes }: EmergingThemesPanelProps) {
  if (themes.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-white/25 uppercase tracking-widest">
          What&apos;s Emerging
        </h2>
        <p className="text-sm text-white/30">
          Themes emerge over time, through conversation and reflection.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-medium text-white/25 uppercase tracking-widest">
        What&apos;s Emerging
      </h2>

      <div className="space-y-3">
        {themes.slice(0, 3).map((theme) => {
          const movement = MOVEMENT_STYLE[theme.movement];
          const dotClass = theme.element
            ? (ELEMENT_DOT[theme.element] ?? 'bg-white/20')
            : 'bg-white/20';

          return (
            <div
              key={theme.themeKey}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                <span className="text-sm text-white/70">{theme.label}</span>
              </div>
              <span className={`text-xs ${movement.className}`}>
                {movement.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
