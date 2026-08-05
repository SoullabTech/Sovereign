'use client';

/**
 * Now What? — shared paper-register shell for the constellation rooms
 * (Coaching Room · Flourishing Field · Calendar Room). One visual language:
 * warm paper, ink, bronze, editorial serif. The shell provides the room's
 * quiet header (wordmark = exit to Home) and the page wash; rooms provide
 * meaning. See NOW_WHAT_HOME_DOOR_MAP_2026-08-05.md.
 */

import type { ReactNode } from 'react';

export const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
/*
 * The register's palette lives in CSS variables so the SAME brand renders
 * as warm paper in light mode and a DESIGNED warm charcoal in dark mode —
 * never a browser's forced inversion. Every room in the constellation
 * shares these tokens.
 */
export const INK = 'var(--nw-ink)';
export const INK_SOFT = 'var(--nw-ink-soft)';
export const INK_FAINT = 'var(--nw-ink-faint)';
export const BRONZE = 'var(--nw-bronze)';
export const RULE = 'var(--nw-rule)';

export const NW_PALETTE_CSS = `
  --nw-ink: #29231c;
  --nw-ink-soft: #57503f;
  --nw-ink-faint: #8f8474;
  --nw-bronze: #8a6a35;
  --nw-rule: rgba(90, 76, 58, 0.16);
  --nw-box: rgba(255, 253, 248, 0.78);
  --nw-box-warm: rgba(240, 229, 209, 0.6);
  --nw-cta-bg: #29231c;
  --nw-cta-ink: #f6f2ea;
  --nw-wash-a: rgba(196,164,110,0.14);
  --nw-bg-1: #f8f5ef;
  --nw-bg-2: #f4f0e8;
`;
export const NW_PALETTE_DARK_CSS = `
  --nw-ink: #e9e2d4;
  --nw-ink-soft: #b6ac9a;
  --nw-ink-faint: #857c6c;
  --nw-bronze: #c9a35e;
  --nw-rule: rgba(233, 226, 212, 0.14);
  --nw-box: rgba(255, 253, 248, 0.045);
  --nw-box-warm: rgba(240, 229, 209, 0.07);
  --nw-cta-bg: #e9e2d4;
  --nw-cta-ink: #24201a;
  --nw-wash-a: rgba(196,164,110,0.08);
  --nw-bg-1: #211d18;
  --nw-bg-2: #1b1815;
`;

export function PaperRoom({
  location,
  homeHref,
  children,
}: {
  location: string;
  homeHref: string;
  children: ReactNode;
}) {
  return (
    <div className="nwp-root">
      <div className="nwp-frame">
        <div className="nwp-top">
          <a className="nwp-wordmark" href={homeHref}>
            Now What<span className="nwp-wordmark-q">?</span>
          </a>
          <span className="nwp-loc">{location}</span>
        </div>
        {children}
      </div>
      <style>{`
        .nwp-root { ${NW_PALETTE_CSS} }
        @media (prefers-color-scheme: dark) {
          .nwp-root { ${NW_PALETTE_DARK_CSS} }
        }
        .nwp-root {
          min-height: 100vh;
          font-family: -apple-system, 'Helvetica Neue', 'Segoe UI', sans-serif;
          color: ${INK};
          background:
            radial-gradient(ellipse 90% 45% at 50% -5%, var(--nw-wash-a), transparent 60%),
            linear-gradient(var(--nw-bg-1), var(--nw-bg-2));
          -webkit-font-smoothing: antialiased;
        }
        .nwp-frame { max-width: 46rem; margin: 0 auto; padding: 26px 24px 90px; }
        .nwp-top { display: flex; justify-content: space-between; align-items: baseline; }
        /* Direction B wordmark (brand pass 2026-08-05): words in ink, the
           question mark in bronze — a question, not a label. */
        .nwp-wordmark {
          font-size: 13px; letter-spacing: 0.35em; text-transform: uppercase;
          color: ${INK}; text-decoration: none;
        }
        .nwp-wordmark-q { color: ${BRONZE}; }
        .nwp-loc { font-size: 12px; color: ${INK_FAINT}; font-weight: 300; }
        .nwp-h1 { font-family: ${SERIF}; font-size: 30px; font-weight: 400; margin-top: 38px; }
        .nwp-lede { font-size: 15px; font-weight: 300; color: ${INK_SOFT}; line-height: 1.7; margin-top: 10px; max-width: 40rem; }
        .nwp-sec { margin-top: 34px; border-top: 1px solid ${RULE}; padding-top: 26px; }
        .nwp-label { font-family: ${SERIF}; font-size: 19px; color: ${INK}; }
        .nwp-quiet { font-size: 14px; font-weight: 300; color: ${INK_SOFT}; line-height: 1.7; }
        .nwp-member { font-family: ${SERIF}; font-size: 17.5px; line-height: 1.55; color: ${INK}; }
        .nwp-prov { font-size: 12px; font-weight: 300; color: ${INK_FAINT}; margin-top: 6px; }
        .nwp-fwd { color: ${BRONZE}; }
        .nwp-door {
          display: inline-block; margin-top: 12px; font-size: 13.5px; color: ${BRONZE};
          text-decoration: underline; text-underline-offset: 4px;
          text-decoration-color: rgba(138,106,53,0.35);
        }
        .nwp-when { font-family: ${SERIF}; font-size: 19px; color: ${INK}; }
      `}</style>
    </div>
  );
}
