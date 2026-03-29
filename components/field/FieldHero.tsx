import Link from 'next/link';
import type { FieldState } from '@/lib/field/types';
import type { Element } from '@/lib/types/voiceIntent';

// ── Element accent colours (consistent with app palette) ─────────

const ELEMENT_ACCENT: Record<Element, string> = {
  fire:   'text-orange-400/80',
  water:  'text-blue-400/80',
  earth:  'text-emerald-400/80',
  air:    'text-sky-300/80',
  aether: 'text-violet-400/80',
};

const ELEMENT_NAME: Record<Element, string> = {
  fire: 'Fire', water: 'Water', earth: 'Earth', air: 'Air', aether: 'Aether',
};

const FIELD_STATE_LABEL: Record<FieldState, string> = {
  flicker: 'Flickering',
  forming: 'Forming',
  stable: 'Stable',
  converging: 'Converging',
};

interface FieldHeroProps {
  orientingLine: string;
  fieldState: FieldState;
  currentElement: Element | null;
  hasOpenThread: boolean;
}

/**
 * Hero section: the first thing members see on /maia.
 * Spacious, breathing, orienting. Not a dashboard widget.
 */
export function FieldHero({
  orientingLine,
  fieldState,
  currentElement,
  hasOpenThread,
}: FieldHeroProps) {
  const accentClass = currentElement ? ELEMENT_ACCENT[currentElement] : 'text-white/60';

  // Dynamic CTA text
  let ctaText = 'Begin from where you are';
  if (hasOpenThread) {
    ctaText = 'Continue where you left off';
  } else if (currentElement) {
    ctaText = 'Enter from what\u2019s present';
  }

  return (
    <section className="text-center space-y-8 pt-8 pb-4">
      {/* Orienting line — large, breathing */}
      <h1 className="text-2xl sm:text-3xl font-light text-white/90 leading-relaxed tracking-wide">
        {orientingLine}
      </h1>

      {/* Subtle state chips */}
      <div className="flex items-center justify-center gap-4 text-xs text-white/30">
        {currentElement && (
          <span className={accentClass}>
            {ELEMENT_NAME[currentElement]}
          </span>
        )}
        <span>{FIELD_STATE_LABEL[fieldState]}</span>
      </div>

      {/* CTA */}
      <div className="pt-2">
        <Link
          href="/maia/chat"
          className="inline-block px-6 py-3 text-sm text-[#D4B896] border border-[#D4B896]/30 rounded-full hover:bg-[#D4B896]/10 transition-colors"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
