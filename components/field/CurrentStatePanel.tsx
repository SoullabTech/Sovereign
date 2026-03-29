import type { FieldState } from '@/lib/field/types';
import type { Element } from '@/lib/types/voiceIntent';

// ── Element dot colours (from RecurringThemesCard palette) ───────

const ELEMENT_DOT: Record<Element, string> = {
  fire:   'bg-orange-400/70',
  water:  'bg-blue-400/70',
  earth:  'bg-emerald-400/70',
  air:    'bg-sky-300/70',
  aether: 'bg-violet-400/70',
};

const ELEMENT_NAME: Record<Element, string> = {
  fire: 'Fire', water: 'Water', earth: 'Earth', air: 'Air', aether: 'Aether',
};

interface CurrentStatePanelProps {
  currentElement: Element | null;
  motion: string | null;
  fieldState: FieldState;
}

/**
 * Non-interpretive awareness of the present moment.
 * Element + motion + field state. No scores, no analysis.
 */
export function CurrentStatePanel({
  currentElement,
  motion,
  fieldState,
}: CurrentStatePanelProps) {
  // Zero state
  if (!currentElement && !motion) {
    return (
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-white/25 uppercase tracking-widest">
          What&apos;s Present
        </h2>
        <p className="text-sm text-white/30">
          No state yet. This forms as you engage.
        </p>
      </section>
    );
  }

  const dotClass = currentElement ? ELEMENT_DOT[currentElement] : 'bg-white/20';

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-medium text-white/25 uppercase tracking-widest">
        What&apos;s Present
      </h2>

      <div className="flex items-center gap-6 text-sm text-white/60">
        {/* Element */}
        {currentElement && (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dotClass}`} />
            <span>{ELEMENT_NAME[currentElement]}</span>
          </div>
        )}

        {/* Motion */}
        {motion && (
          <span className="text-white/40">{motion}</span>
        )}
      </div>
    </section>
  );
}
