'use client';

/**
 * FieldBeginThreshold
 *
 * The sendable invitation into a master's field authoring process.
 * This is what Jondi receives. What she might share.
 *
 * Not a dashboard. Not a form. A threshold.
 *
 * Tone: minimal, grounded, complete. Nothing beta. Nothing startup.
 * She should feel: this was made for me. I want to begin.
 */

import React from 'react';
import type { MasterField } from '@/lib/masters/types';

interface Props {
  master: MasterField;
}

export default function FieldBeginThreshold({ master }: Props) {
  const { palette, theme, shortName, name } = master;
  const isSpacious = theme.density === 'spacious';

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.62rem',
    letterSpacing: '0.28em',
    textTransform: 'uppercase' as const,
    color: `${palette.text}38`,
  };

  const bodyText: React.CSSProperties = {
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.92rem',
    color: `${palette.text}70`,
    lineHeight: 1.8,
  };

  const BreathMark = ({ height = '2.5rem' }: { height?: string }) => (
    <div
      style={{
        width: '1px',
        height,
        background: `linear-gradient(to bottom, transparent, ${palette.primary}40, transparent)`,
        margin: '0 auto',
      }}
    />
  );

  const pillars = [
    {
      title: 'Presence',
      body: 'Who you are and how you hold space. The felt sense of your work before a single offer is made.',
    },
    {
      title: 'World',
      body: 'Your gatherings, offerings, lineage, aesthetic. The ecosystem that surrounds what you do.',
    },
    {
      title: 'Voice',
      body: 'How a version of you learns what is true. The language, the boundaries, the paradoxes only you carry.',
    },
  ];

  return (
    <main
      className="relative min-h-screen"
      style={{ backgroundColor: palette.background }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{
          background: `linear-gradient(to bottom, ${palette.primary}08 0%, transparent 100%)`,
        }}
      />

      <div
        className="relative z-10 mx-auto"
        style={{
          maxWidth: '560px',
          padding: isSpacious ? '6rem 2rem 8rem' : '4rem 2rem 6rem',
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <p style={{ ...sectionLabel, marginBottom: '3rem' }}>
          {name}
        </p>

        <h1
          style={{
            fontFamily: 'var(--field-font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 300,
            color: palette.text,
            lineHeight: 1.2,
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}
        >
          Your field is<br />waiting to be shaped.
        </h1>

        <p style={{ ...bodyText, marginBottom: '1rem' }}>
          Not a profile. Not a portfolio.
        </p>
        <p style={{ ...bodyText, marginBottom: '4rem' }}>
          A field is a digital place that holds you accurately enough
          that the people who need you recognize it as yours —
          before a single offer is made.
          This is how we build it together.
        </p>

        <BreathMark height="3rem" />

        {/* ── Three pillars ────────────────────────────────────────────── */}
        <div style={{ margin: '3.5rem 0' }}>
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              style={{
                display: 'flex',
                gap: '1.5rem',
                paddingBottom: i < pillars.length - 1 ? '2rem' : 0,
                marginBottom: i < pillars.length - 1 ? '2rem' : 0,
                borderBottom: i < pillars.length - 1
                  ? `1px solid ${palette.primary}12`
                  : 'none',
              }}
            >
              <div
                style={{
                  minWidth: '2px',
                  background: palette.primary,
                  opacity: 0.3,
                  borderRadius: '1px',
                  alignSelf: 'stretch',
                  marginTop: '3px',
                }}
              />
              <div>
                <p
                  style={{
                    fontFamily: 'var(--field-font-display)',
                    fontSize: '1rem',
                    fontWeight: 300,
                    color: palette.text,
                    marginBottom: '0.4rem',
                  }}
                >
                  {pillar.title}
                </p>
                <p style={{ ...bodyText, fontSize: '0.85rem', color: `${palette.text}55` }}>
                  {pillar.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <BreathMark height="3rem" />

        {/* ── Reassurance ──────────────────────────────────────────────── */}
        <div
          style={{
            padding: '1.75rem',
            border: `1px solid ${palette.primary}15`,
            background: `${palette.primary}04`,
            margin: '3.5rem 0',
          }}
        >
          <p style={{ ...sectionLabel, marginBottom: '1rem' }}>
            How this works
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem',
            }}
          >
            {[
              `Five short conversations. You shape each one.`,
              `Brief answers are fine — say as much or as little as you need.`,
              `Nothing is fixed. You can refine, correct, or evolve any part.`,
              `Corrections are as valuable as answers. They teach the field what is true.`,
              `This is collaborative — what you bring shapes what becomes possible.`,
            ].map((line, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    color: palette.primary,
                    opacity: 0.5,
                    fontSize: '0.7rem',
                    marginTop: '0.25rem',
                    flexShrink: 0,
                  }}
                >
                  —
                </span>
                <span style={{ ...bodyText, fontSize: '0.85rem', color: `${palette.text}60` }}>
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <a
            href="/author"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              background: palette.primary,
              color: palette.background,
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Begin Your Field
          </a>

          <p
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.72rem',
              color: `${palette.text}35`,
              letterSpacing: '0.04em',
            }}
          >
            {shortName}&apos;s field · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </main>
  );
}
