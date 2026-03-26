'use client';

import { useField } from '@/lib/field/FieldProvider';
import FieldCTA from './FieldCTA';

export default function FieldThreshold() {
  const field = useField();
  const { presence, palette, theme, cta } = field;
  const hasMotion = theme.motion !== 'none';
  const isSpacious = theme.density === 'spacious';

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: palette.background }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 55%, ${palette.primary}18 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      {/* Breath pulse — only when motion enabled */}
      {hasMotion && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 40% 35% at 50% 50%, ${palette.primary}0A 0%, transparent 60%)`,
            animation: 'field-breathe 8s ease-in-out infinite',
          }}
          aria-hidden
        />
      )}

      {/* Content */}
      <div
        className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center"
        style={{ padding: isSpacious ? '4rem 2rem' : '2.5rem 2rem' }}
      >
        {/* Practitioner name — understated */}
        <p
          className="mb-8 uppercase tracking-[0.25em]"
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.7rem',
            color: `${palette.text}60`,
          }}
        >
          {field.name}
        </p>

        {/* Opening line — the only real text */}
        <h1
          style={{
            fontFamily: 'var(--field-font-display)',
            fontSize: isSpacious ? 'clamp(1.8rem, 4vw, 3rem)' : 'clamp(1.4rem, 3vw, 2.2rem)',
            fontWeight: 300,
            lineHeight: 1.3,
            color: palette.text,
            marginBottom: isSpacious ? '1.5rem' : '1rem',
            letterSpacing: '-0.01em',
          }}
        >
          {presence.openingLine}
        </h1>

        {/* Sub-line */}
        {presence.subLine && (
          <p
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.9rem',
              color: `${palette.text}70`,
              marginBottom: isSpacious ? '3.5rem' : '2.5rem',
              lineHeight: 1.6,
              maxWidth: '38ch',
            }}
          >
            {presence.subLine}
          </p>
        )}

        {/* Breath mark divider */}
        <div
          style={{
            width: '1px',
            height: isSpacious ? '3rem' : '2rem',
            background: `linear-gradient(to bottom, transparent, ${palette.primary}60, transparent)`,
            marginBottom: isSpacious ? '3.5rem' : '2.5rem',
          }}
          aria-hidden
        />

        {/* Primary CTA */}
        <FieldCTA label={cta.label} href={cta.href} style={cta.style} />
      </div>

      <style>{`
        @keyframes field-breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </main>
  );
}
