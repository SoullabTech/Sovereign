'use client';

import Link from 'next/link';
import type { MasterField } from '@/lib/masters/types';

interface Props {
  master: MasterField;
}

/**
 * FieldPresencePage — The master's story, lineage, and authority.
 *
 * This is not a bio page. It is the field before the work begins.
 * Copy is honest, grounded, and free of performance.
 * Layout: spacious, dark, slow — presence over promotion.
 */
export default function FieldPresencePage({ master }: Props) {
  const { palette, story, slug, name, theme } = master;
  const isSpacious = theme.density === 'spacious';

  return (
    <main
      className="relative min-h-screen"
      style={{ backgroundColor: palette.background }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96"
        style={{
          background: `linear-gradient(to bottom, ${palette.primary}0A 0%, transparent 100%)`,
        }}
      />

      <div
        className="relative z-10 mx-auto max-w-2xl"
        style={{ padding: isSpacious ? '5rem 2rem 6rem' : '3rem 2rem 4rem' }}
      >
        {/* Back */}
        <Link
          href={`/fields/${slug}`}
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.7rem',
            color: `${palette.text}40`,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '4rem',
          }}
        >
          ← {master.shortName}'s Field
        </Link>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--field-font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            color: palette.text,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            marginBottom: '2rem',
          }}
        >
          {story.headline}
        </h1>

        {/* Lead */}
        <p
          style={{
            fontFamily: 'var(--field-font-display)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            fontWeight: 300,
            color: `${palette.text}CC`,
            lineHeight: 1.7,
            marginBottom: '3rem',
          }}
        >
          {story.lead}
        </p>

        {/* Breath mark */}
        <div
          style={{
            width: '2.5rem',
            height: '1px',
            background: `${palette.primary}60`,
            marginBottom: '3rem',
          }}
        />

        {/* Body paragraphs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '4rem' }}>
          {story.paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'var(--field-font-body)',
                fontSize: '1rem',
                color: `${palette.text}80`,
                lineHeight: 1.85,
              }}
            >
              {p}
            </p>
          ))}
        </div>

        {/* Lineage */}
        <div style={{ marginBottom: '4rem' }}>
          <p
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.65rem',
              color: `${palette.text}35`,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            Lineage
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {story.lineage.map((item, i) => (
              <li
                key={i}
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.85rem',
                  color: `${palette.text}60`,
                  paddingLeft: '1rem',
                  borderLeft: `1px solid ${palette.primary}35`,
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Breath mark */}
        <div
          style={{
            width: '2.5rem',
            height: '1px',
            background: `${palette.primary}40`,
            marginBottom: '4rem',
          }}
        />

        {/* Offers */}
        <div>
          <p
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.65rem',
              color: `${palette.text}35`,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: '2rem',
            }}
          >
            The Work
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {story.offers.map((offer, i) => (
              <Link
                key={i}
                href={offer.href}
                className="group"
                style={{
                  display: 'block',
                  padding: '1.5rem',
                  border: `1px solid ${palette.primary}20`,
                  background: `${palette.primary}05`,
                  transition: 'border-color 0.4s, background 0.4s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = `${palette.primary}45`;
                  el.style.background = `${palette.primary}0C`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = `${palette.primary}20`;
                  el.style.background = `${palette.primary}05`;
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--field-font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 400,
                    color: palette.text,
                    marginBottom: '0.5rem',
                  }}
                >
                  {offer.title}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--field-font-body)',
                    fontSize: '0.85rem',
                    color: `${palette.text}60`,
                    lineHeight: 1.65,
                    marginBottom: '1rem',
                  }}
                >
                  {offer.description}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--field-font-body)',
                    fontSize: '0.72rem',
                    color: palette.primary,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {offer.cta} →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
