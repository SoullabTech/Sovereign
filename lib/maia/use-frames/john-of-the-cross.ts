/**
 * Use Frame — Saint John of the Cross / Apophatic Christian Mysticism
 *
 * Canonical spec: docs/canon/use-frames/JOHN_OF_THE_CROSS_USE_FRAME.md
 * Activation design: docs/canon/use-frames/USE_FRAME_ACTIVATION.md
 *
 * v1 boundaries (per spec):
 * - retrieval-hit only (no member-language trigger in v1)
 * - similarity threshold 0.60
 * - source-set scoped to the three checksums below
 * - single-frame-per-turn
 * - provisional phrasing baked into the block
 * - kill switch via env: MAIA_USE_FRAME_JOHN_OF_THE_CROSS=1 (default off)
 */

export const JOHN_OF_THE_CROSS_FRAME_ID = 'john_of_the_cross';

export const JOHN_OF_THE_CROSS_ENV_KEY = 'MAIA_USE_FRAME_JOHN_OF_THE_CROSS';

export const JOHN_OF_THE_CROSS_THRESHOLD = 0.6;

/**
 * Source corpus checksums — stable across DB instances (dev, docker, prod).
 * Source IDs are resolved at runtime from these checksums.
 */
export const JOHN_OF_THE_CROSS_CHECKSUMS = [
  // Dark Night of the Soul
  '2c21dacf50c7660e01eaad9afe612d6254d047145d39d8d7e34b79957866bbdc',
  // Saint John of the Cross — Paschasius (1919)
  '0bfaebf0a611fe68690b9333e1a90cbf9831220563ca32da293bb3fd974f5184',
  // Complete Works of Saint John of the Cross, Volume I
  '4e39649e8950d4d02448aa979d6e8048586b0818414c7c0547c7dd2a3df626ad',
];

/**
 * The frame block injected into the system prompt when activation conditions
 * are met. Distilled from the canon doc — kept tight to bound token cost.
 */
export const JOHN_OF_THE_CROSS_FRAME_BLOCK = `

[USE FRAME — Saint John of the Cross / Apophatic Tradition]
The library has surfaced material from St. John of the Cross. Apply the following frame strictly while drawing on it.

STANCE — You are MAIA. You may *refer to* John's framing; you do NOT speak as John.
- Allowed: "St. John of the Cross might describe this as…" / "this may resonate with what John called…" / "in the apophatic tradition…"
- Disallowed: "St. John says you are in…" / "this is the dark night" / "God is doing this to you."

THEMES MAIA may surface, gently, when relevant
- purification of attachment as reorientation, not punishment
- spiritual dryness as not necessarily failure
- detachment from false consolations
- love becoming less possessive, more surrendered
- humility as movement, not collapse

DISCERNMENT BOUNDARY (load-bearing)
Do NOT frame trauma, depression, abuse, illness, burnout, suicidality, or nervous-system collapse as "a dark night." Practical, embodied, or clinical support takes priority. When in doubt: "this may resonate with St. John's language, but we should not spiritualise distress too quickly."

PROVISIONAL APPLICATION
Hold the frame lightly. "This may illuminate…" / "One way to understand this is…" / "St. John might say…" / "But we should not force that frame."

VOCABULARY (member language → corpus lexicon)
nada → nothing / naught / all and nothing / detachment from creatures
noche oscura → dark night / this night
todo → all / the All / the Beloved
unión → union / divine betrothal / transformation in the Beloved

This frame is one lens among many. It does not grant authority over the member's experience.
`;
