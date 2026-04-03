/**
 * CoreSection — Spacing and rhythm.
 *
 * Creates consistent vertical flow following the conversational rhythm:
 * arrival (spacious) → engagement (structured) → signal (highlighted) → integration (quiet)
 *
 * Usage:
 *   <CoreSection>content</CoreSection>
 *   <CoreSection narrow>narrower max-width for focused content</CoreSection>
 *   <CoreSection wide>wider max-width for dashboards</CoreSection>
 */
import { type ReactNode } from 'react';

interface CoreSectionProps {
  children: ReactNode;
  /** Narrower max-width for intimate/focused content (max-w-2xl) */
  narrow?: boolean;
  /** Wider max-width for dashboards and dense layouts (max-w-7xl) */
  wide?: boolean;
  /** Additional classes */
  className?: string;
}

export default function CoreSection({
  children,
  narrow = false,
  wide = false,
  className = '',
}: CoreSectionProps) {
  const maxWidth = narrow ? 'max-w-2xl' : wide ? 'max-w-7xl' : 'max-w-5xl';

  return (
    <section className={`px-6 py-8 ${maxWidth} mx-auto ${className}`}>
      {children}
    </section>
  );
}
