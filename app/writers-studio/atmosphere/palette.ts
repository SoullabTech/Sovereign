/**
 * Colour arithmetic for the Studio's atmospheres. Pure, and deliberately small.
 *
 * Two jobs only: build a ground ramp from an anchor, and measure contrast so
 * "accessible" is a gate a test can fail rather than an adjective in a design
 * note. Nothing here decides what an atmosphere means; nothing here reads
 * anything about the member.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function parseHex(hex: string): Rgb {
  const h = hex.trim().replace(/^#/, '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`not a hex colour: ${hex}`);
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** Linear mix. `amount` 0 returns `a`, 1 returns `b`. */
export function mix(a: string, b: string, amount: number): string {
  const x = parseHex(a);
  const y = parseHex(b);
  const t = Math.max(0, Math.min(1, amount));
  return toHex({
    r: x.r + (y.r - x.r) * t,
    g: x.g + (y.g - x.g) * t,
    b: x.b + (y.b - x.b) * t,
  });
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, 1..21. */
export function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The five surfaces every atmosphere needs, built from one ground anchor.
 *
 * A room is not one colour. It is a recessed well, a page edge, the wide quiet
 * field the writing sits on, the rails that sit on the field, and the row under
 * the pointer. Those relations hold in any light — which is why they are
 * derived from a single anchor rather than authored five times per atmosphere
 * and drifting apart.
 *
 * `toward` is the direction the room lifts: away from the ground and toward
 * light in a dark room, toward shadow in a light one. Passing it explicitly
 * rather than inferring it from luminance keeps a mid-toned atmosphere from
 * silently flipping its own depth order at the threshold.
 */
export interface GroundRamp {
  deepest: string;
  base: string;
  field: string;
  raised: string;
  active: string;
}

export function groundRamp(anchor: string, toward: 'light' | 'shadow'): GroundRamp {
  const lift = toward === 'light' ? '#FFFFFF' : '#000000';
  const sink = toward === 'light' ? '#000000' : '#FFFFFF';
  return {
    deepest: mix(anchor, sink, 0.05),
    base: anchor,
    field: mix(anchor, lift, 0.035),
    raised: mix(anchor, lift, 0.075),
    active: mix(anchor, lift, 0.17),
  };
}

/**
 * The four weights of text, from one ink anchor toward the ground it sits on.
 *
 * Fading toward the GROUND rather than toward grey is what keeps quiet text
 * quiet without turning it a colour the room does not contain.
 */
export interface InkRamp {
  primary: string;
  secondary: string;
  muted: string;
  quiet: string;
}

export function inkRamp(anchor: string, ground: string): InkRamp {
  /* ⚠️ The fades were 0.42 / 0.58 and were tightened after the contrast gate
     failed Cloud at 2.30:1 for quiet text. A dark room hides a generous fade —
     ratios stay comfortable a long way down — while a light room compresses
     them, so the same "quiet" that reads as restraint on espresso reads as
     unreadable on paper. One ramp that clears the floor in EVERY room beats a
     prettier one that only works in the rooms nobody checked. */
  return {
    primary: anchor,
    secondary: mix(anchor, ground, 0.16),
    muted: mix(anchor, ground, 0.33),
    quiet: mix(anchor, ground, 0.46),
  };
}
