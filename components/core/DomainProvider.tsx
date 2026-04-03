/**
 * DomainProvider — Same field, different signal.
 *
 * Wraps a section or page to shift the accent layer via CSS custom properties.
 * The field (background, surfaces, borders) stays continuous.
 * Only the signal (accent-primary) changes.
 *
 * Usage:
 *   <DomainProvider domain="admin">
 *     <CorePage>...</CorePage>
 *   </DomainProvider>
 *
 * Or directly on CorePage:
 *   <CorePage domain="admin">
 */
import { type ReactNode } from 'react';

type Domain = 'maia' | 'admin' | 'world' | 'practitioner' | 'archive';

interface DomainProviderProps {
  domain: Domain;
  children: ReactNode;
  /** Additional classes */
  className?: string;
}

export default function DomainProvider({
  domain,
  children,
  className = '',
}: DomainProviderProps) {
  return (
    <div data-domain={domain} className={className}>
      {children}
    </div>
  );
}
