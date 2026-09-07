import { groundRamp, inkRamp, mix, type GroundRamp, type InkRamp } from './palette';

/**
 * ATMOSPHERE — the writer chooses the light their Studio is in.
 *
 * ── The contract (founder ruling, ATMOSPHERE CONTRACT) ────────────────────
 *   MEMBER-CHOSEN   nothing here is inferred, suggested, scheduled, or set
 *                   from anything the member wrote. There is no "MAIA noticed
 *                   you write at night" and no seasonal default.
 *   REVERSIBLE      any choice returns to Atelier in one act; nothing is lost
 *                   by changing it and nothing is remembered about the change.
 *   ACCESSIBLE      contrast is a GATE, not an intention — every atmosphere is
 *                   measured in test against a legibility floor, and one that
 *                   fails cannot ship by being pretty.
 *   NON-SEMANTIC    an atmosphere means NOTHING. It is not a mood, a state, an
 *                   element, a phase, or a signal to MAIA. No name here may be
 *                   read as a claim about the writer, and nothing downstream
 *                   may branch on it.
 *
 * ⛔ A raw colour picker was refused. It is not more sovereign to hand someone
 * 16 million choices and no room; it is only more work. These are authored
 * environments — five rooms, each internally coherent.
 *
 * ── Provenance (studioTheme.ts vocabulary) ────────────────────────────────
 * ATELIER is INHERITED: its values are today's palette, byte for byte, so a
 * member who chooses nothing sees exactly the Studio they already had. The
 * other four are DERIVED from three anchors through the documented ramps in
 * palette.ts, and remain PROVISIONAL until rendered and witnessed — a derived
 * colour that has never met a screen is a proposal, not a value.
 */

export const ATMOSPHERE_IDS = ['atelier', 'night-study', 'forest', 'cloud', 'midnight'] as const;
export type AtmosphereId = (typeof ATMOSPHERE_IDS)[number];

/** What the Studio looks like when the member has chosen nothing. */
export const DEFAULT_ATMOSPHERE: AtmosphereId = 'atelier';

export function isAtmosphereId(value: unknown): value is AtmosphereId {
  return typeof value === 'string' && (ATMOSPHERE_IDS as readonly string[]).includes(value);
}

export interface Atmosphere {
  id: AtmosphereId;
  /** What the writer sees in the switcher. A place, never a feeling. */
  name: string;
  ground: GroundRamp;
  ink: InkRamp;
  /** The accent: fill at rest, emphasis text, edge, and the ink that sits ON it. */
  gold: { base: string; fill: string; text: string; edge: string; on: string };
  rule: { base: string; soft: string };
  /** The page gradient — the same ground, breathing. */
  bg: string;
}

/** Anchors → a whole room. The relations are the design; the anchors are the choice. */
export function compose(
  id: AtmosphereId,
  name: string,
  anchors: { ground: string; ink: string; accent: string; toward: 'light' | 'shadow' },
): Atmosphere {
  const ground = groundRamp(anchors.ground, anchors.toward);
  const ink = inkRamp(anchors.ink, ground.base);
  const lift = anchors.toward === 'light' ? '#FFFFFF' : '#000000';
  return {
    id,
    name,
    ground,
    ink,
    gold: {
      base: anchors.accent,
      fill: mix(anchors.accent, ground.base, 0.42),
      text: mix(anchors.accent, ground.base, 0.2),
      edge: mix(anchors.accent, ground.base, 0.62),
      /* Ink ON the accent is the ground itself, which is what makes a filled
         button read as a piece of the room rather than a sticker on it. */
      on: ground.base,
    },
    rule: {
      base: mix(ground.base, ink.primary, 0.24),
      soft: mix(ground.base, ink.primary, 0.14),
    },
    bg: `linear-gradient(135deg, ${ground.base} 0%, ${mix(ground.base, lift, 0.05)} 60%, ${ground.base} 100%)`,
  };
}

/**
 * ATELIER — today's Studio, authored explicitly rather than derived.
 *
 * Every value is the existing sampled palette (pressTheme.ts + studioTheme.ts
 * GROUND/INK/GOLD/RULE). It is NOT run through `compose`, because the sampled
 * ramp is not a clean arithmetic ramp and forcing it through one would quietly
 * repaint the Studio in the name of consistency. A test pins these to the
 * literals so choosing nothing can never become a change.
 */
const ATELIER: Atmosphere = {
  id: 'atelier',
  name: 'Atelier',
  ground: {
    deepest: '#15120D',
    base: '#1A1513',
    field: '#1D1812',
    raised: '#221B12',
    active: '#342715',
  },
  ink: {
    primary: '#F3EDE4',
    secondary: '#CFC5B6',
    muted: '#9A8F80',
    quiet: '#7A7065',
  },
  gold: {
    base: '#C9A227',
    fill: '#734F1A',
    text: '#A7783A',
    edge: '#5A431C',
    on: '#1A1513',
  },
  rule: { base: '#4A4238', soft: '#3a322b' },
  bg: 'linear-gradient(135deg,#1A1513 0%,#241C18 60%,#1A1513 100%)',
};

export const ATMOSPHERES: Record<AtmosphereId, Atmosphere> = {
  atelier: ATELIER,

  /* A colder lamp and a bluer dark. The same room after the house has gone
     quiet — not a "focus mode", not a time of day the system detected. */
  'night-study': compose('night-study', 'Night Study', {
    ground: '#14171D',
    ink: '#E8ECF2',
    accent: '#B9A46A',
    toward: 'light',
  }),

  /* Deep green shade. Ground that reads as canopy rather than paper. */
  forest: compose('forest', 'Forest', {
    ground: '#141C18',
    ink: '#E6EDE7',
    accent: '#9CB08A',
    toward: 'light',
  }),

  /* The one light room. Paper under an overcast window — the reason the ramp
     takes an explicit direction rather than guessing from luminance. */
  cloud: compose('cloud', 'Cloud', {
    ground: '#F2F0EA',
    ink: '#26231E',
    accent: '#7E5F22',
    toward: 'shadow',
  }),

  /* Nearly lightless, for writing that wants no room around it at all. */
  midnight: compose('midnight', 'Midnight', {
    ground: '#0B0B0D',
    ink: '#DCDCE0',
    accent: '#8F8FA6',
    toward: 'light',
  }),
};

export const ATMOSPHERE_LIST: Atmosphere[] = ATMOSPHERE_IDS.map((id) => ATMOSPHERES[id]);

/**
 * The CSS custom properties a room reads.
 *
 * This is the whole propagation mechanism. Every Studio surface already passes
 * theme tokens into inline styles, and those tokens are `var(--ws-*, <today's
 * value>)` — so setting these variables on one wrapper carries the atmosphere
 * through every room at once, and REMOVING them returns the Studio to Atelier
 * with no code path involved. The fallback is the escape hatch: a surface the
 * provider never wraps still renders correctly.
 */
export function atmosphereVariables(atmosphere: Atmosphere): Record<string, string> {
  return {
    '--ws-ground-deepest': atmosphere.ground.deepest,
    '--ws-ground-base': atmosphere.ground.base,
    '--ws-ground-field': atmosphere.ground.field,
    '--ws-ground-raised': atmosphere.ground.raised,
    '--ws-ground-active': atmosphere.ground.active,
    '--ws-ink-primary': atmosphere.ink.primary,
    '--ws-ink-secondary': atmosphere.ink.secondary,
    '--ws-ink-muted': atmosphere.ink.muted,
    '--ws-ink-quiet': atmosphere.ink.quiet,
    '--ws-gold': atmosphere.gold.base,
    '--ws-gold-fill': atmosphere.gold.fill,
    '--ws-gold-text': atmosphere.gold.text,
    '--ws-gold-edge': atmosphere.gold.edge,
    '--ws-on-accent': atmosphere.gold.on,
    '--ws-rule': atmosphere.rule.base,
    '--ws-rule-soft': atmosphere.rule.soft,
    '--ws-bg': atmosphere.bg,
  };
}
