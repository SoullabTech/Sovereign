'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { useField } from '@/lib/field/FieldProvider';

/**
 * FieldBookingShell
 *
 * Themed wrapper around the booking flow. The heavy booking UI lives at
 * /portal/[slug]/book — we redirect there preserving query params so the
 * existing booking engine handles availability + confirmation.
 *
 * This page exists as the themed entry point so the URL stays under
 * /field/[slug]/book and inherits the field's atmosphere via the layout.
 */
function BookingRedirectInner() {
  const field = useField();
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service');
  const { palette, theme, slug } = field;
  const isSpacious = theme.density === 'spacious';

  // Build portal booking URL preserving any service/date/time params
  const portalBookHref = `/portal/${slug}/book${serviceParam ? `?service=${serviceParam}` : ''}`;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundColor: palette.background,
        padding: isSpacious ? '4rem 2rem' : '3rem 2rem',
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 50%, ${palette.primary}10 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center gap-8">
        <p
          className="uppercase tracking-[0.25em]"
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.65rem',
            color: `${palette.text}50`,
          }}
        >
          {field.name}
        </p>

        <h1
          style={{
            fontFamily: 'var(--field-font-display)',
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            fontWeight: 300,
            lineHeight: 1.3,
            color: palette.text,
            letterSpacing: '-0.01em',
          }}
        >
          Book a session
        </h1>

        <p
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: `${palette.text}65`,
            maxWidth: '36ch',
          }}
        >
          Choose a time that works for you. The booking portal will open where you can select
          availability and confirm your session.
        </p>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '2.5rem',
            background: `linear-gradient(to bottom, transparent, ${palette.primary}50, transparent)`,
          }}
          aria-hidden
        />

        {/* CTA → portal booking */}
        <Link
          href={portalBookHref}
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-sm text-sm tracking-widest uppercase transition-opacity duration-300 hover:opacity-80"
          style={{
            backgroundColor: 'var(--field-color-primary)',
            color: palette.background,
            fontFamily: 'var(--field-font-body)',
          }}
        >
          View availability
        </Link>

        {/* Back link */}
        <Link
          href={`/field/${slug}/work`}
          className="text-xs uppercase tracking-widest transition-opacity duration-300 hover:opacity-60"
          style={{
            fontFamily: 'var(--field-font-body)',
            color: `${palette.text}50`,
          }}
        >
          Back to sessions
        </Link>
      </div>
    </main>
  );
}

export default function FieldBookingShell() {
  return (
    <Suspense>
      <BookingRedirectInner />
    </Suspense>
  );
}
