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
export const INK = '#29231c';
export const INK_SOFT = '#57503f';
export const INK_FAINT = '#8f8474';
export const BRONZE = '#8a6a35';
export const RULE = 'rgba(90, 76, 58, 0.16)';

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
          <a className="nwp-wordmark" href={homeHref}>Now What?</a>
          <span className="nwp-loc">{location}</span>
        </div>
        {children}
      </div>
      <style>{`
        .nwp-root {
          min-height: 100vh;
          font-family: -apple-system, 'Helvetica Neue', 'Segoe UI', sans-serif;
          color: ${INK};
          background:
            radial-gradient(ellipse 90% 45% at 50% -5%, rgba(196,164,110,0.14), transparent 60%),
            linear-gradient(#f8f5ef, #f4f0e8);
          -webkit-font-smoothing: antialiased;
        }
        .nwp-frame { max-width: 46rem; margin: 0 auto; padding: 26px 24px 90px; }
        .nwp-top { display: flex; justify-content: space-between; align-items: baseline; }
        .nwp-wordmark {
          font-size: 13px; letter-spacing: 0.35em; text-transform: uppercase;
          color: ${BRONZE}; text-decoration: none;
        }
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
