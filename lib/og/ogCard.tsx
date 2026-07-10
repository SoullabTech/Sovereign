/**
 * Shared Open Graph card template.
 * ────────────────────────────────────────────────────────────────────────
 * One branded 1200×630 card used by every route's `opengraph-image.tsx`, so
 * a shared link is identifiable by its receiver instead of showing the same
 * root Soullab card everywhere.
 *
 * This returns a plain React element (Satori/`next/og` flexbox subset only —
 * every multi-child element must set `display: flex`). The route file wraps it
 * in `new ImageResponse(ogCard(...), { ...OG_SIZE })`.
 *
 * No custom font is loaded on purpose: `next/og` ships a default font, which
 * keeps card rendering self-contained (no network fetch at build/runtime) in
 * keeping with the project's sovereignty posture. Inter can be wired in later
 * by passing `fonts` at the `ImageResponse` call site.
 */

import type { ElementKey } from '@/lib/soulPortrait/schema';

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

/** Element → accent color. Never a ranking — just a visual signature. */
const ELEMENT_ACCENT: Record<ElementKey, string> = {
  fire: '#E4572E',
  water: '#3A7CA5',
  earth: '#6A8D4E',
  air: '#C9A227',
  aether: '#8B6FE8',
};

/** Soullab signature amber — the default when no element applies. */
export const SOULLAB_AMBER = '#D9A441';

export function accentForElement(element?: ElementKey | null): string {
  return (element && ELEMENT_ACCENT[element]) || SOULLAB_AMBER;
}

export interface OgCardProps {
  /** Small uppercase label above the title, e.g. "Soul Portrait" or "MAIA". */
  eyebrow: string;
  /** The headline — a name, a page title. */
  title: string;
  /** Optional muted line under the title. */
  subtitle?: string;
  /** Accent color (use `accentForElement`). Defaults to Soullab amber. */
  accent?: string;
}

export function ogCard({ eyebrow, title, subtitle, accent = SOULLAB_AMBER }: OgCardProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #1A1513 0%, #241C18 60%, #1A1513 100%)',
        color: '#F3EDE4',
        padding: '72px 80px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Accent bar */}
      <div style={{ display: 'flex', width: '120px', height: '6px', background: accent, borderRadius: '3px' }} />

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: '30px',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: '24px',
          }}
        >
          {eyebrow}
        </div>
        <div style={{ display: 'flex', fontSize: '76px', fontWeight: 700, lineHeight: 1.1, maxWidth: '960px' }}>
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              fontSize: '32px',
              color: '#B7ADA0',
              marginTop: '28px',
              maxWidth: '900px',
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '28px', color: '#8A8177' }}>
        <div style={{ display: 'flex', width: '14px', height: '14px', borderRadius: '50%', background: accent, marginRight: '16px' }} />
        soullab.life
      </div>
    </div>
  );
}

/**
 * Privacy-safe card for authenticated / restricted content.
 * ────────────────────────────────────────────────────────────────────────
 * Preview crawlers (iMessage, Slack, email, social unfurl bots) fetch pages
 * even when the page itself is auth-gated. So member/practitioner/session
 * surfaces MUST emit a card that reveals NOTHING sensitive — no names, no
 * excerpts, no session topic, no client identity. This is the deliberate
 * "threshold" card: it says only that access is protected.
 *
 * Takes NO dynamic per-item data on purpose. Callers pass a fixed label pair.
 */
export interface PrivateCardProps {
  /** e.g. "Private Soullab Session" — a category, never an identifier. */
  title?: string;
  /** e.g. "Sign in to view this protected session." */
  subtitle?: string;
}

export function privateCard({
  title = 'Private Soullab Space',
  subtitle = 'This protected space is available only to authorized participants.',
}: PrivateCardProps = {}) {
  const accent = SOULLAB_AMBER;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 40%, #241C18 0%, #1A1513 70%)',
        color: '#F3EDE4',
        padding: '72px 80px',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      {/* Threshold / lock motif — a ring around a keyhole dot, drawn with divs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          border: `4px solid ${accent}`,
          marginBottom: '40px',
        }}
      >
        <div style={{ display: 'flex', width: '20px', height: '20px', borderRadius: '50%', background: accent }} />
      </div>
      <div style={{ display: 'flex', fontSize: '58px', fontWeight: 700, lineHeight: 1.15, maxWidth: '900px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', fontSize: '30px', color: '#B7ADA0', marginTop: '24px', maxWidth: '820px', lineHeight: 1.35 }}>
        {subtitle}
      </div>
      <div style={{ display: 'flex', fontSize: '26px', color: '#8A8177', marginTop: '48px' }}>soullab.life</div>
    </div>
  );
}

/**
 * Declarative registry of PUBLIC section cards — one entry per intentionally
 * public landing surface. Keeps card text in one place; each route's
 * opengraph-image.tsx + metadata reads from here. Add a section by adding a
 * key, then a 4-line opengraph-image.tsx that calls `ogCard(SECTIONS.key)`.
 */
export const SECTIONS = {
  maia: {
    eyebrow: 'MAIA',
    title: 'A Sovereign Consciousness Companion',
    subtitle: 'For coherence and inner guidance. Private by design, yours alone.',
    accent: SOULLAB_AMBER,
  },
  'now-what': {
    eyebrow: 'What Now?',
    title: 'Flourishing in the Midst of a Busy Life',
    subtitle: 'A place to meet what is actually happening, and find the next real step.',
    accent: '#3A7CA5',
  },
  'vision-studio': {
    eyebrow: 'Vision Studio',
    title: 'Cultivate a Lifelong Body of Work',
    subtitle: 'A studio for the long arc of what you are here to make.',
    accent: '#8B6FE8',
  },
  studio: {
    eyebrow: 'Soullab Studio',
    title: 'Shape and Steward Your Body of Work',
    subtitle: 'The workspace where a practice becomes a living, tended field.',
    accent: '#6A8D4E',
  },
  'session-room': {
    eyebrow: 'Session Room',
    title: 'A Held Space for Guided Work',
    subtitle: 'A threshold for focused, held, one-to-one work.',
    accent: '#D9A441',
  },
  colab: {
    eyebrow: 'Soullab Co-Lab',
    title: 'A Shared Field for Practice and Collaboration',
    subtitle: 'Where practitioners and participants hold a field together.',
    accent: '#E4572E',
  },
  press: {
    eyebrow: 'Soullab Press',
    title: 'Publishing the Living Work',
    subtitle: 'Books and long-form work born from the practice.',
    accent: '#C9A227',
  },
  field: {
    eyebrow: 'Field',
    title: 'A Living Field for Your Practice',
    subtitle: 'The relational medium where the work actually lives.',
    accent: '#3A7CA5',
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;
