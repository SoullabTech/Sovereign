'use client';

import Link from 'next/link';
import type { MasterField } from '@/lib/masters/types';

interface Props {
  master: MasterField;
  portalSlug: string;
}

/**
 * FieldPathwayPage — Renders a portal's inner page.
 *
 * Each of the three portals (walk-with-me, walk-with-others, hold-the-field)
 * gets the same shell with portal-specific content. The master's field config
 * drives the copy, palette, and feel.
 *
 * This is a holding structure. Real content (booking, circles, events)
 * will mount inside as those features build out.
 */
export default function FieldPathwayPage({ master, portalSlug }: Props) {
  const { palette, portals, slug, shortName } = master;
  const portal = portals.find((p) => p.slug === portalSlug);
  if (!portal) return null;

  return (
    <main
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: palette.background }}
    >
      {/* Ambient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 20%, ${palette.primary}10 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 flex flex-col" style={{ maxWidth: '52rem', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Back to field */}
        <Link
          href={`/fields/${slug}`}
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.7rem',
            color: `${palette.text}40`,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '4rem',
            display: 'inline-block',
          }}
        >
          ← {shortName}'s Field
        </Link>

        {/* Portal heading */}
        <h1
          style={{
            fontFamily: 'var(--field-font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            color: palette.text,
            lineHeight: 1.2,
            marginBottom: '1.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          {portal.label}
        </h1>

        <p
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '1rem',
            color: `${palette.text}70`,
            lineHeight: 1.8,
            marginBottom: '3rem',
            maxWidth: '36rem',
          }}
        >
          {portal.description}
        </p>

        {/* Divider */}
        <div
          style={{
            width: '3rem',
            height: '1px',
            background: `${palette.primary}50`,
            marginBottom: '3rem',
          }}
        />

        {/* Content area — portal-specific features mount here */}
        <PortalContent portalSlug={portalSlug} master={master} />
      </div>
    </main>
  );
}

function PortalContent({ portalSlug, master }: { portalSlug: string; master: MasterField }) {
  const { palette, slug } = master;

  const content: Record<string, { cta: string; href: string; note: string }> = {
    'with-me': {
      cta: 'Open a Session with MAIA',
      href: `/fields/${slug}/maia`,
      note: 'Individual session booking and scheduling coming soon.',
    },
    'with-others': {
      cta: 'Enter the Practitioner Field',
      href: `/fields/${slug}/maia`,
      note: 'Mentoring circles and practitioner resources coming soon.',
    },
    'hold-the-field': {
      cta: 'Enter the Commons',
      href: `/fields/${slug}/maia`,
      note: 'SEE community hub and year-round connection coming soon.',
    },
  };

  const { cta, href, note } = content[portalSlug] ?? {
    cta: 'Continue',
    href: `/fields/${slug}`,
    note: '',
  };

  return (
    <div className="flex flex-col" style={{ gap: '1rem' }}>
      <Link
        href={href}
        style={{
          display: 'inline-block',
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: palette.text,
          border: `1px solid ${palette.primary}50`,
          padding: '1rem 2rem',
          width: 'fit-content',
          transition: 'border-color 0.3s, background 0.3s',
        }}
      >
        {cta}
      </Link>

      {note && (
        <p
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.75rem',
            color: `${palette.text}35`,
            letterSpacing: '0.02em',
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
