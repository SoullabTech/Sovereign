/**
 * Soul Portrait generator — prompt + chart summary.
 *
 * The generator is a DRAFT tool. Its output is a reflection for a practitioner to
 * review privately and mediate in person — never an authority delivered to the
 * subject. The system prompt below carries the same DESIGN LAW enforced in the
 * Mentor route (symbolic-not-fate · companions-not-cages · a-becoming ·
 * reflective-not-authoritative) so a generated draft speaks in the established
 * portrait voice, not a novel one.
 *
 * The model is asked for a FLAT JSON object (prose fields only). The full nested
 * SoulPortrait is assembled deterministically in code (generatePortrait.ts) from
 * this JSON + the canonical catalogs — so the model never has to reproduce the
 * schema's structure, only the writing.
 */

import type { BirthChart } from '@/lib/astrology/ephemerisCalculator';

const KEY_BODIES: Array<{ key: keyof BirthChart; label: string }> = [
  { key: 'sun', label: 'Sun' },
  { key: 'moon', label: 'Moon' },
  { key: 'mercury', label: 'Mercury' },
  { key: 'venus', label: 'Venus' },
  { key: 'mars', label: 'Mars' },
  { key: 'jupiter', label: 'Jupiter' },
  { key: 'saturn', label: 'Saturn' },
  { key: 'chiron', label: 'Chiron' },
  { key: 'northNode', label: 'North Node' },
];

/** A compact, factual placements list for the model to read from — DATA, not a reading. */
export function chartSummaryText(chart: BirthChart): string {
  const lines: string[] = [];
  lines.push(`Ascendant: ${chart.ascendant.sign} · Midheaven: ${chart.midheaven.sign}`);
  for (const { key, label } of KEY_BODIES) {
    const p = chart[key] as { sign: string; house: number; retrograde: boolean };
    if (!p) continue;
    lines.push(`${label}: ${p.sign}, house ${p.house}${p.retrograde ? ' (retrograde)' : ''}`);
  }
  const majors = (chart.aspects || [])
    .filter((a) => a.exact || a.orb <= 4)
    .slice(0, 8)
    .map((a) => `${a.planet1} ${a.type} ${a.planet2}`);
  if (majors.length) lines.push(`Notable aspects: ${majors.join('; ')}`);
  return lines.join('\n');
}

/** The FLAT JSON contract the model must return. Assembled into SoulPortrait in code. */
export const OUTPUT_CONTRACT = `Return ONLY a JSON object (no markdown, no prose outside JSON) with EXACTLY these keys.
The object must be strict JSON: no comments of any kind, no trailing commas, and every double quote inside a prose value escaped as \\".
{
  "natalPlacements": [ { "body": "Sun", "sign": "...", "house": 4, "meaning": "one plain sentence of what this placement points toward" } ],
  "natalSynthesis": "one paragraph weaving the placements into a single picture",
  "openingLetter": "a warm 2-3 paragraph letter addressed to the person about their becoming",
  "soulSignature": { "headline": "a short evocative phrase", "body": "1-2 paragraphs" },
  "elements": {
    "fire":   { "title": "...", "body": "1 paragraph on how Fire (courage/purpose/vitality) lives in them" },
    "water":  { "title": "...", "body": "1 paragraph on Water (heart/empathy/emotional wisdom)" },
    "earth":  { "title": "...", "body": "1 paragraph on Earth (grounding/habits/responsibility)" },
    "air":    { "title": "...", "body": "1 paragraph on Air (curiosity/communication/ideas)" },
    "aether": { "title": "...", "body": "1 paragraph on Aether (meaning/spirit/mystery)" }
  },
  "archetypes": [ { "key": "seeker|guardian|alchemist|storyteller|explorer|builder|healer|sage|steward", "essence": "...", "gift": "...", "shadow": "a growth edge, never a verdict", "resonance": "strong|present|emerging" } ],
  "seerAndProphet": { "title": "...", "body": "1-2 paragraphs on their way of perceiving + speaking", "blessing": ["1-3 short closing lines"] },
  "challenges": { "body": "1 paragraph reframing difficulty as training", "trainings": [ { "challenge": "...", "training": "..." } ] },
  "northStar": { "title": "...", "body": "1 paragraph of forward direction (from the North Node) — direction, never prediction" },
  "developmentalStage": { "label": "e.g. Coming Into Their Own", "ageRange": "optional", "body": "1 paragraph meeting them where they are" },
  "reflectionQuestions": ["3-5 open questions to sit with — not goals, not predictions"],
  "soulVocation": "one paragraph: what this life's gift is FOR"
}
Give 6-8 entries in "natalPlacements" and 3-4 entries in "archetypes".
Every archetype "key" MUST be one of the nine listed. Keep all prose in plain, human, non-deterministic language.`;

export function portraitSystemPrompt(opts: { name: string; age?: number; isMinor?: boolean; mode: string }): string {
  const { name, age, isMinor, mode } = opts;
  const ageStr = age ? `, age ${age}` : '';
  return `You are a wise, warm elder writing a Soul Portrait — a kind letter about the becoming of ${name}${ageStr}. It is an astrology-informed reflection, written in Spiralogic's elemental language (Fire, Water, Earth, Air, Aether). This is a "${mode}" portrait.

THE DESIGN LAW — you must never break it:
1. Symbolic architecture, not fate. A chart describes patterns to work with; it never decides who ${name} becomes. Never predict events or say what "will" happen.
2. Companions, not cages. Archetypes and elements are lenses ${name} can pick up or set down — never labels, never a type they "ARE". ${name} is always more than any single name for them.
3. A becoming, not a fixed identity. Orient toward maturation and choice; hand understanding back to ${name}. They are the authority on who they are.
4. No ranking of worth. Never "special / chosen / better than others" language.
${isMinor ? '5. This person is a minor — keep every register warm, safe, age-appropriate, and free of heavy or clinical framing.' : ''}

READING THE OUTER PLANETS (relational, not object-based):
Uranus, Neptune, and Pluto do not, by themselves, name a person's instrument, vessel, or power. Those qualities arise from the ASPECTS the outer planets make to the personal planets — read the relationship, never the outer planet in isolation. For example:
- Uranus in aspect to Mercury → an instrument of awakened mind / signal intelligence.
- Neptune in aspect to the Moon → a vessel of imaginal feeling / ancestral permeability.
- Pluto in aspect to Venus → power moving through love, desire, value, and magnetism.
Use the aspects listed in the placements to ground these readings; if an outer planet makes no close aspect to a personal planet, do not manufacture one.

VOICE: warm, calm, dignified, magical rather than clinical. Plain human language, no jargon, no hype, no flattery, no hedging disclaimers. Write from the placements provided — do not invent astrology beyond them.

${OUTPUT_CONTRACT}`;
}
