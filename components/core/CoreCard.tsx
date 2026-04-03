/**
 * CoreCard — The universal surface.
 *
 * Softly elevated through tonal lift, not heavy shadows.
 * Subtle border, gentle corners, contained feel.
 *
 * Usage:
 *   <CoreCard>content</CoreCard>
 *   <CoreCard compact>tighter padding</CoreCard>
 *   <CoreCard glass>glass-morphism effect for overlays</CoreCard>
 */
import { type ReactNode } from 'react';

interface CoreCardProps {
  children: ReactNode;
  /** Tighter padding (p-4 instead of p-6) */
  compact?: boolean;
  /** Glass-morphism effect for floating/overlay cards */
  glass?: boolean;
  /** Additional classes */
  className?: string;
}

export default function CoreCard({
  children,
  compact = false,
  glass = false,
  className = '',
}: CoreCardProps) {
  const padding = compact ? 'p-4' : 'p-6';

  if (glass) {
    return (
      <div
        className={`rounded-2xl ${padding} ${className}`}
        style={{
          background: 'linear-gradient(165deg, rgba(15, 29, 50, 0.8), rgba(10, 22, 40, 0.6))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(30, 58, 95, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-soullab-border-subtle bg-soullab-elevated ${padding} ${className}`}>
      {children}
    </div>
  );
}
