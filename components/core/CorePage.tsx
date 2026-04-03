/**
 * CorePage — The field container.
 *
 * Ensures every page enters the same perceptual field.
 * Applies Soullab Core background, text hierarchy, and optional
 * atmospheric presence layer.
 *
 * Usage:
 *   <CorePage>              — standard field
 *   <CorePage depth>        — deeper radial gradient (field-depth)
 *   <CorePage atmosphere>   — adds subtle vignette overlay
 *   <CorePage domain="admin"> — shifts accent via data-domain
 */
import { type ReactNode } from 'react';

type Domain = 'maia' | 'admin' | 'world' | 'practitioner' | 'archive';
type Layer = 'inner' | 'outer';

interface CorePageProps {
  children: ReactNode;
  /** Use the deeper, more intimate radial gradient */
  depth?: boolean;
  /** Add a subtle atmospheric vignette (presence, not decoration) */
  atmosphere?: boolean;
  /** Domain accent variation — shifts --sl-accent-primary */
  domain?: Domain;
  /** Inner/outer layer depth modulation */
  layer?: Layer;
  /** Additional classes on the outer wrapper */
  className?: string;
}

export default function CorePage({
  children,
  depth = false,
  atmosphere = false,
  domain,
  layer,
  className = '',
}: CorePageProps) {
  const gradient = depth ? 'bg-field-depth' : 'bg-field-core';

  return (
    <div
      className={`min-h-[100dvh] ${gradient} text-soullab-text-primary ${className}`}
      {...(domain ? { 'data-domain': domain } : {})}
      {...(layer ? { 'data-layer': layer } : {})}
    >
      {atmosphere && (
        <div className="sl-atmosphere" aria-hidden="true" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
