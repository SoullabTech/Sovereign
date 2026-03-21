'use client';

import Link from 'next/link';
import type { MasterField } from '@/lib/masters/types';
import { getFieldBySlug } from '@/lib/masters/registry';

interface Props {
  master: MasterField;
}

/**
 * FieldThreshold — The landing page for a Master's Field.
 *
 * Design principles:
 * - Space before content. The field breathes.
 * - One line draws you in. No explanation.
 * - Three portals. No menu, no footer, no selling.
 * - Motion only when the theme calls for it.
 */
export default function FieldThreshold({ master }: Props) {
  const { presence, portals, palette, theme } = master;
  const hasMotion = theme.motion !== 'none';
  const isSpacious = theme.density === 'spacious';

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: palette.background }}
    >
      {/* Ambient background glow — warm center, darkness at edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 55%, ${palette.primary}18 0%, transparent 70%)`,
        }}
      />

      {/* Breath pulse — only when motion is enabled */}
      {hasMotion && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 40% 35% at 50% 50%, ${palette.primary}0A 0%, transparent 60%)`,
            animation: 'field-breathe 8s ease-in-out infinite',
          }}
        />
      )}

      {/* Content — vertically centered, generous space */}
      <div
        className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center"
        style={{ padding: isSpacious ? '4rem 2rem' : '2.5rem 2rem' }}
      >
        {/* Name — understated, not a headline */}
        <p
          className="mb-8 tracking-[0.25em] uppercase"
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.7rem',
            color: `${palette.text}60`,
            letterSpacing: '0.3em',
          }}
        >
          {master.name}
        </p>

        {/* Opening line — the only real text on this page */}
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

        {/* Sub-line — optional, even quieter */}
        {presence.subLine && (
          <p
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.9rem',
              color: `${palette.text}70`,
              marginBottom: isSpacious ? '4rem' : '3rem',
              lineHeight: 1.6,
            }}
          >
            {presence.subLine}
          </p>
        )}

        {/* Divider — a breath mark, not a decoration */}
        <div
          style={{
            width: '1px',
            height: isSpacious ? '3rem' : '2rem',
            background: `linear-gradient(to bottom, transparent, ${palette.primary}60, transparent)`,
            marginBottom: isSpacious ? '4rem' : '2.5rem',
          }}
        />

        {/* About link — quiet, not a nav item */}
        <Link
          href={`/fields/${master.slug}/presence`}
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.7rem',
            color: `${palette.text}35`,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: isSpacious ? '2.5rem' : '1.5rem',
            display: 'block',
          }}
        >
          About {master.shortName}
        </Link>

        {/* The three portals */}
        <nav
          className="flex w-full flex-col"
          style={{ gap: isSpacious ? '1.25rem' : '0.75rem' }}
          aria-label="Field pathways"
        >
          {portals.map((portal) => (
            <FieldPortalLink
              key={portal.slug}
              portal={portal}
              palette={palette}
              fieldSlug={master.slug}
            />
          ))}
        </nav>

        {/* Partner Workspace — visible secondary action when partnerSlugs is set */}
        {master.partnerSlugs && master.partnerSlugs.length > 0 && (() => {
          const partnerField = getFieldBySlug(master.partnerSlugs![0]);
          const partnerName = partnerField?.shortName ?? 'your partner';
          return (
          <div style={{ width: '100%', marginTop: isSpacious ? '2.5rem' : '1.75rem' }}>
            {/* Divider */}
            <div
              style={{
                width: '100%',
                height: '1px',
                background: `linear-gradient(to right, transparent, ${palette.primary}30, transparent)`,
                marginBottom: isSpacious ? '2rem' : '1.5rem',
              }}
            />
            <Link
              href={`/fields/${master.slug}/partner-view`}
              className="group relative flex flex-col items-center py-4 transition-all duration-500"
              style={{
                border: `1px solid ${palette.primary}35`,
                borderRadius: '2px',
                background: `${palette.primary}08`,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = `${palette.primary}14`;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${palette.primary}60`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = `${palette.primary}08`;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${palette.primary}35`;
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--field-font-display)',
                  fontSize: '1rem',
                  fontWeight: 400,
                  color: palette.text,
                  letterSpacing: '0.02em',
                  marginBottom: '0.3rem',
                }}
              >
                Partner Workspace
              </span>
              <span
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.75rem',
                  color: `${palette.text}55`,
                  letterSpacing: '0.03em',
                }}
              >
                Work with {partnerName} on builds, decisions, and shared direction.
              </span>
            </Link>
          </div>
          );
        })()}
      </div>

      {/* Keyframe for breath animation */}
      <style>{`
        @keyframes field-breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </main>
  );
}

function FieldPortalLink({
  portal,
  palette,
  fieldSlug,
}: {
  portal: MasterField['portals'][number];
  palette: MasterField['palette'];
  fieldSlug: string;
}) {
  return (
    <Link
      href={`/fields/${fieldSlug}${portal.href}`}
      className="group relative flex flex-col items-center py-5 transition-all duration-500"
      style={{
        border: `1px solid ${palette.primary}25`,
        borderRadius: '2px',
        background: `${palette.primary}06`,
      }}
    >
      {/* Hover fill */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `${palette.primary}10` }}
        aria-hidden
      />

      <span
        className="relative"
        style={{
          fontFamily: 'var(--field-font-display)',
          fontSize: '1.1rem',
          fontWeight: 400,
          color: palette.text,
          letterSpacing: '0.02em',
          marginBottom: '0.35rem',
        }}
      >
        {portal.label}
      </span>
      <span
        className="relative"
        style={{
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.78rem',
          color: `${palette.text}55`,
          letterSpacing: '0.04em',
        }}
      >
        {portal.invitation}
      </span>
    </Link>
  );
}
