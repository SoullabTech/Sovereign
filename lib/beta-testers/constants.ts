/**
 * Beta Learning Field — client-safe constants (no fs / server imports).
 *
 * Doctrine prose lives in content/beta-testers/*.md (loaded server-side via
 * docs.ts). This file holds only the small structured values that both client
 * and server render: element styling, observation openings, roadmap labels.
 */

export type ElementKey = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export const ELEMENTS: ElementKey[] = ['fire', 'water', 'earth', 'air', 'aether'];

export interface ElementMeta {
  label: string;
  accent: string;
  glyph: string;
}

export const ELEMENT_META: Record<ElementKey, ElementMeta> = {
  fire: { label: 'Fire', accent: '#E0814B', glyph: '△' },
  water: { label: 'Water', accent: '#4F8FC0', glyph: '▽' },
  earth: { label: 'Earth', accent: '#7C9A6B', glyph: '◇' },
  air: { label: 'Air', accent: '#9AAEC2', glyph: '○' },
  aether: { label: 'Aether', accent: '#A088C8', glyph: '✶' },
};

/** The field's warm accent (used for nav, primary actions). */
export const FIELD_ACCENT = '#C8A96A';

export type ObservationPromptType =
  | 'helped_notice'
  | 'missed'
  | 'clearer_later'
  | 'confused_when'
  | 'returned_later';

export interface ObservationPrompt {
  type: ObservationPromptType;
  opening: string;
  hint: string;
}

/** The five openings of the Observation Stream — invitations to notice, not ratings. */
export const OBSERVATION_PROMPTS: ObservationPrompt[] = [
  { type: 'helped_notice', opening: 'This helped me notice…', hint: 'Something you saw that you hadn’t put words to before.' },
  { type: 'missed', opening: 'This missed…', hint: 'Where MAIA didn’t reach what mattered.' },
  { type: 'clearer_later', opening: 'This became clearer later…', hint: 'An insight that only arrived with time.' },
  { type: 'confused_when', opening: 'I felt confused when…', hint: 'A moment that didn’t land, or got in the way.' },
  { type: 'returned_later', opening: 'I returned later and saw…', hint: 'What revisiting the conversation revealed.' },
];

export function observationOpening(type: string): string {
  return OBSERVATION_PROMPTS.find((p) => p.type === type)?.opening ?? type;
}

/** Honest labels for the roadmap liveness ladder (mirrors the DB CHECK constraint). */
export const ROADMAP_STATUS: Record<string, { label: string; note: string; tone: string }> = {
  considering: { label: 'Considering', note: 'A direction held, not yet authorized', tone: '#8A8A93' },
  building: { label: 'Building', note: 'Under construction', tone: '#9AAEC2' },
  wired: { label: 'Wired', note: 'Connected, not yet surfacing to you', tone: '#7C9A6B' },
  surfacing: { label: 'Surfacing', note: 'Reaching the experience, unverified', tone: '#E0814B' },
  verified: { label: 'Verified', note: 'Confirmed under real use', tone: '#4F8FC0' },
  shipped: { label: 'Shipped', note: 'Live for the cohort', tone: '#A088C8' },
};
