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
 * The register is the LITERARY portrait (see portraits/nathan.ts and
 * portraits/andreaFagan.ts — the canonical models): braided chapters that hold
 * several placements inside one argument, not a section-by-section report. To make that
 * possible, chartSummaryText() computes the whole-chart SHAPE the story voice
 * needs — element/modality census, house gatherings, chart shape, leading planet,
 * angle conjunctions — all derived from the BirthChart in code, never asked of
 * the model. The model may only draw on shape features actually present in the
 * summary; inventing others is forbidden by the prompt.
 *
 * The model is asked for a FLAT JSON object (prose fields only). The full nested
 * LiterarySoulPortrait is assembled deterministically in code (generatePortrait.ts)
 * from this JSON + the canonical catalogs — so the model never has to reproduce
 * the schema's structure, only the writing.
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
  { key: 'uranus', label: 'Uranus' },
  { key: 'neptune', label: 'Neptune' },
  { key: 'pluto', label: 'Pluto' },
  { key: 'chiron', label: 'Chiron' },
  { key: 'northNode', label: 'North Node' },
];

/** The classical ten used for censuses and chart-shape work (never asteroids). */
const CENSUS_BODIES: Array<{ key: keyof BirthChart; label: string }> = KEY_BODIES.filter(
  (b) => b.key !== 'chiron' && b.key !== 'northNode',
);

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_ELEMENT: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const SIGN_MODALITY: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

interface ChartPoint {
  label: string;
  lon: number; // absolute ecliptic longitude, 0–360
  sign: string;
  house: number;
}

function absLongitude(sign: string, degree: number): number | null {
  const idx = ZODIAC_ORDER.indexOf(sign);
  if (idx === -1) return null;
  return idx * 30 + degree;
}

function censusPoints(chart: BirthChart): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (const { key, label } of CENSUS_BODIES) {
    const p = chart[key] as { sign: string; degree: number; house: number } | undefined;
    if (!p?.sign) continue;
    const lon = absLongitude(p.sign, p.degree ?? 0);
    if (lon === null) continue;
    points.push({ label, lon, sign: p.sign, house: p.house });
  }
  return points;
}

function groupLine(title: string, groups: Map<string, string[]>): string {
  const parts = [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, members]) => `${name} ${members.length} (${members.join(', ')})`);
  return `${title}: ${parts.join(' · ')}`;
}

/** Element + modality censuses over the classical ten planets. */
function censusLines(points: ChartPoint[]): string[] {
  const byElement = new Map<string, string[]>();
  const byModality = new Map<string, string[]>();
  for (const p of points) {
    const el = SIGN_ELEMENT[p.sign];
    const mo = SIGN_MODALITY[p.sign];
    if (el) byElement.set(el, [...(byElement.get(el) || []), p.label]);
    if (mo) byModality.set(mo, [...(byModality.get(mo) || []), p.label]);
  }
  return [
    groupLine('Element census (the ten planets, Sun through Pluto)', byElement),
    groupLine('Modality census', byModality),
  ];
}

/** Houses where three or more of the ten planets gather. */
function houseGatheringLines(points: ChartPoint[]): string[] {
  const byHouse = new Map<number, ChartPoint[]>();
  for (const p of points) {
    if (!p.house) continue;
    byHouse.set(p.house, [...(byHouse.get(p.house) || []), p]);
  }
  return [...byHouse.entries()]
    .filter(([, members]) => members.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .map(
      ([house, members]) =>
        `House gathering: ${members.length} planets in house ${house} — ${members
          .map((m) => `${m.label} (${m.sign})`)
          .join(', ')}`,
    );
}

/** Gap after sorted[i], wrapping around the zodiac. */
function gapAfter(sorted: ChartPoint[], i: number): number {
  const next = sorted[(i + 1) % sorted.length];
  return (next.lon - sorted[i].lon + 360) % 360;
}

/**
 * Chart shape (Jones-pattern style) + leading planet, derived conservatively from
 * the ten planets' longitudes. When no pattern matches cleanly, NO shape line is
 * emitted — the prompt forbids the model from inventing one.
 */
function shapeLines(points: ChartPoint[]): string[] {
  if (points.length < 8) return [];
  const sorted = [...points].sort((a, b) => a.lon - b.lon);
  const gaps = sorted.map((_, i) => gapAfter(sorted, i));
  const maxGap = Math.max(...gaps);
  const maxGapIdx = gaps.indexOf(maxGap);
  const span = 360 - maxGap;

  const lines: string[] = [];
  const describe = (p: ChartPoint) => `${p.label} in ${p.sign} (house ${p.house})`;

  // Bucket / funnel: one planet clearly apart (≥40° from both neighbours) with
  // the other nine held inside a half-circle-ish span. Checked before bowl.
  // (Threshold calibrated against the two hand-verified funnel charts —
  // portraits/nathan.ts and portraits/andrea.ts — whose handles sit ~50-54° out.)
  let focal: ChartPoint | null = null;
  let focalIsolation = 0;
  for (let i = 0; i < sorted.length; i++) {
    const isolation = Math.min(gaps[i], gaps[(i - 1 + sorted.length) % sorted.length]);
    if (isolation < 40) continue;
    const rest = sorted.filter((_, j) => j !== i);
    const restGaps = rest.map((_, j) => gapAfter(rest, j));
    const restSpan = 360 - Math.max(...restGaps);
    if (restSpan <= 190 && isolation > focalIsolation) {
      focal = sorted[i];
      focalIsolation = isolation;
    }
  }

  if (span <= 130) {
    lines.push(`Chart shape: bundle — all ten planets held within ${Math.round(span)}°, a tightly gathered life.`);
  } else if (focal) {
    lines.push(
      `Chart shape: funnel (bucket) — nine planets on one side of the sky, all pouring through a single focal planet, the handle: ${describe(focal)}.`,
    );
  } else if (span <= 190) {
    lines.push(`Chart shape: bowl — the ten planets held within one half of the sky (${Math.round(span)}°).`);
  } else if (span <= 250) {
    lines.push(`Chart shape: locomotive — the ten planets within ${Math.round(span)}°, leaving one third of the sky open.`);
  } else if (gaps.filter((g) => g >= 60).length === 2) {
    lines.push('Chart shape: seesaw — two groups of planets facing each other across the sky.');
  }

  // Leading planet: the planet that rises ahead of all the others — the first
  // planet after the largest empty gap, in zodiacal order. Only meaningful when
  // the gap is real, and only named when it is not already the funnel's handle.
  if (maxGap >= 60) {
    const leader = sorted[(maxGapIdx + 1) % sorted.length];
    if (!focal || leader.label !== focal.label) {
      lines.push(`Leading planet (out in front of the whole pattern): ${describe(leader)}.`);
    }
  }

  return lines;
}

/** Planets conjunct the four angles (ASC / DESC / MC / IC), orb ≤ 8°. */
function angleLines(chart: BirthChart, points: ChartPoint[]): string[] {
  const ascLon = absLongitude(chart.ascendant.sign, chart.ascendant.degree);
  const mcLon = absLongitude(chart.midheaven.sign, chart.midheaven.degree);
  const angles: Array<{ name: string; lon: number }> = [];
  if (ascLon !== null) {
    angles.push({ name: 'Ascendant', lon: ascLon });
    angles.push({ name: 'Descendant', lon: (ascLon + 180) % 360 });
  }
  if (mcLon !== null) {
    angles.push({ name: 'Midheaven', lon: mcLon });
    angles.push({ name: 'IC (the root of the chart)', lon: (mcLon + 180) % 360 });
  }
  const lines: string[] = [];
  // Chiron included here: an angle contact is real chart data, not manufactured.
  const chiron = chart.chiron as { sign: string; degree: number; house: number } | undefined;
  const withChiron = chiron?.sign
    ? [...points, { label: 'Chiron', lon: absLongitude(chiron.sign, chiron.degree ?? 0) ?? -999, sign: chiron.sign, house: chiron.house }]
    : points;
  for (const p of withChiron) {
    for (const a of angles) {
      const d = Math.abs(((p.lon - a.lon + 540) % 360) - 180);
      if (d <= 8) lines.push(`Angle contact: ${p.label} conjunct the ${a.name} (orb ${d.toFixed(1)}°).`);
    }
  }
  return lines;
}

/**
 * A compact, factual chart summary for the model to read from — DATA, not a
 * reading. Includes the whole-chart SHAPE (censuses, gatherings, pattern,
 * leading planet, angle contacts) so the story voice can braid placements into
 * one picture without ever inventing structure.
 */
export function chartSummaryText(chart: BirthChart): string {
  const lines: string[] = [];
  lines.push(`Ascendant (rising sign): ${chart.ascendant.sign} · Midheaven: ${chart.midheaven.sign}`);
  for (const { key, label } of KEY_BODIES) {
    const p = chart[key] as { sign: string; house: number; retrograde: boolean };
    if (!p) continue;
    lines.push(`${label}: ${p.sign}, house ${p.house}${p.retrograde ? ' (retrograde)' : ''}`);
  }
  // Classical bodies only — asteroid/node aspects would pull the reading out of
  // the portrait register (the models never draw on them).
  const ASPECT_BODIES = new Set([
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Chiron',
  ]);
  const majors = (chart.aspects || [])
    .filter((a) => (a.exact || a.orb <= 4) && ASPECT_BODIES.has(a.planet1) && ASPECT_BODIES.has(a.planet2))
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 10)
    .map((a) => `${a.planet1} ${a.type} ${a.planet2}${a.exact ? ' (exact)' : ''}`);
  if (majors.length) lines.push(`Notable aspects: ${majors.join('; ')}`);

  const points = censusPoints(chart);
  lines.push('');
  lines.push('WHOLE-CHART SHAPE (computed — draw ONLY on what is listed here):');
  lines.push(...censusLines(points));
  lines.push(...houseGatheringLines(points));
  lines.push(...shapeLines(points));
  lines.push(...angleLines(chart, points));
  return lines.join('\n');
}

/**
 * The FLAT JSON contract the model must return — the LITERARY portrait form,
 * following the arc of the hand-authored model portraits (nathan.ts,
 * andreaFagan.ts). Assembled into LiterarySoulPortrait in code
 * (generatePortrait.ts).
 */
export const OUTPUT_CONTRACT = `Return ONLY a JSON object (no markdown, no prose outside JSON) with EXACTLY these keys:
{
  "natalPlacements": [ { "body": "Sun", "sign": "...", "house": 4, "meaning": "one plain sentence of what this placement points toward" } ],  // 6-9 key placements
  "natalSynthesis": "one paragraph weaving the placements into a single picture",
  "chapters": [
    { "title": "Opening Letter", "subtitle": "A letter about a becoming", "body": "..." },
    { "title": "<an image for the chart's whole shape, e.g. 'The Gathering at the Hearth'>", "subtitle": "The shape of your whole sky", "body": "..." },
    { "title": "Soul Signature", "subtitle": "<a short evocative epithet for them, e.g. 'The keeper of the near flame'>", "body": "..." },
    { "title": "<evocative Fire chapter title>", "subtitle": "Fire — courage, purpose, vitality", "element": "fire", "body": "..." },
    { "title": "<evocative Water chapter title>", "subtitle": "Water — heart, empathy, emotional wisdom", "element": "water", "body": "..." },
    { "title": "<evocative Earth chapter title>", "subtitle": "Earth — grounding, habits, responsibility", "element": "earth", "body": "..." },
    { "title": "<evocative Air chapter title>", "subtitle": "Air — curiosity, communication, ideas", "element": "air", "body": "..." },
    { "title": "<evocative Aether chapter title>", "subtitle": "Aether — meaning, spirit, mystery", "element": "aether", "body": "..." },
    { "title": "Archetypal Companions", "subtitle": "Lenses to pick up or set down — never labels", "body": "..." },
    { "title": "The Seer and the Prophet", "subtitle": "Your way of perceiving, and of speaking", "body": "..." },
    { "title": "Challenges as Trainings", "subtitle": "Difficulty, reframed — never a verdict", "body": "..." },
    { "title": "North Star", "subtitle": "Direction, never prediction", "body": "..." },
    { "title": "Where You Stand", "subtitle": "<name this season of their life, e.g. 'The Harvest Turn'>", "body": "..." },
    { "title": "Practices", "subtitle": "Small doors, opened often", "body": "..." },
    { "title": "Questions to Sit With", "subtitle": "Not goals. Not predictions. Company.", "body": "..." },
    { "title": "Soul Vocation", "subtitle": "What the gift is for", "body": "..." }
  ]
}
Chapter rules:
- Exactly these sixteen chapters, in this order. Titles in <angle brackets> are yours to write for this person; the fixed titles stay as given. Never change what a chapter is FOR.
- Chapter weights (paragraphs, separated by blank lines — \\n\\n inside the body string):
  Opening Letter 3-4 · whole-sky chapter 3-4 · Soul Signature 2-3 · each element chapter 2-3 ·
  Archetypal Companions 4-5 · The Seer and the Prophet 2-3 · Challenges as Trainings 3-4 ·
  North Star 1-2 · Where You Stand 1-2 · Soul Vocation 1.
  Practices: one short opening paragraph, then five short paragraphs, one per element, each beginning "Fire — ...", "Water — ...", etc., naming a small embodied practice.
  Questions to Sit With: 4-6 open questions, each its own one-line paragraph — not goals, not predictions.
- Archetypal Companions draws 2-4 archetypes ONLY from: the Seeker, the Guardian, the Alchemist, the Storyteller, the Explorer, the Builder, the Healer, the Sage, the Steward — each with its gift AND its shadow (a growth edge, never a verdict).
- The North Star chapter reads the North Node — direction, never prediction.
Keep all prose in plain, human, non-deterministic language.`;

export function portraitSystemPrompt(opts: { name: string; age?: number; isMinor?: boolean; mode: string }): string {
  const { name, age, isMinor, mode } = opts;
  const ageStr = age ? `, age ${age}` : '';
  return `You are a wise, warm elder writing a Soul Portrait — a flowing, chapter-based letter about the becoming of ${name}${ageStr}. It is an astrology-informed reflection written in Spiralogic's elemental language (Fire, Water, Earth, Air, Aether), meant to be read the way a person reads a letter from someone who truly sees them. This is a "${mode}" portrait.

THE DESIGN LAW — you must never break it:
1. Symbolic architecture, not fate. A chart describes patterns to work with; it never decides who ${name} becomes. Never predict events or say what "will" happen.
2. Companions, not cages. Archetypes and elements are lenses ${name} can pick up or set down — never labels, never a type they "ARE". ${name} is always more than any single name for them.
3. A becoming, not a fixed identity. Orient toward maturation and choice; hand understanding back to ${name}. They are the authority on who they are.
4. No ranking of worth. Never "special / chosen / better than others" language.
${isMinor ? '5. This person is a minor — keep every register warm, safe, age-appropriate, and free of heavy or clinical framing.' : ''}

HOW TO WRITE (the voice this portrait must carry):
- One braided story, not a report. Each chapter makes ONE argument about ${name} and braids several placements into it as evidence — "To know you, a person has to hold three things at once..." — rather than walking placements one by one. The chapters build an arc: the Opening Letter plants the portrait's central themes, the whole-sky chapter states the chart's shape once and clearly, the element chapters live inside that shape, and the closing chapters harvest it — by the end the reader has been told one coherent story of who they are and who they are becoming.
- Second person throughout ("you", "your"), addressed directly to ${name}. Warm, calm, dignified, magical rather than clinical — the voice of a wise elder who wants them free, never a fortune-teller and never a flatterer.
- Substantial paragraphs at the weights given below. Let the prose breathe: full sentences, unhurried, concrete. No bullet points, no headers inside a body, no astrological shorthand left unexplained.
- Name placements openly, then immediately translate them into plain human meaning: "Astrologers call this shape a 'funnel.' It describes a life whose many energies pour through one focused center." The astrology is scaffolding the reader can see, but the sentence must land for someone who knows none of it.
- The whole-sky chapter is built from the WHOLE-CHART SHAPE lines: the element census, a house gathering, a funnel's focal planet, a leading planet, an angle contact — the shape of a chart says more about a life than any single placement. State it as one picture ("Four planets stand together in your Fourth House... that is a power center"), then let every later chapter refer back to it.
- The five element chapters are one moving ecology told in five rooms — in each, braid the REAL placements that carry that element in ${name} and how it tempers and feeds the others. Where an element is scarce in the census, say honestly what that scarcity asks of them — scarcity is an invitation, never a deficiency. Aether is carried by the whole chart (angles, the North Node, what integrates), not by sign counts.
- Honest shadow, held kindly. "Challenges as Trainings" reframes each difficulty as an old protector of something tender and a training ground — named truthfully, never as a verdict, always with the door left open.

READING THE OUTER PLANETS (relational, not object-based):
Uranus, Neptune, and Pluto do not, by themselves, name a person's instrument, vessel, or power. Read them through their ASPECTS to the personal planets, their HOUSE placements, and their role in the chart's shape (e.g. a leading planet, a focal planet, an angle contact). For example:
- Uranus in aspect to Mercury → an instrument of awakened mind / signal intelligence.
- Neptune in aspect to the Moon → a vessel of imaginal feeling / ancestral permeability.
- Pluto in aspect to Venus → power moving through love, desire, value, and magnetism.
Use only the aspects listed; if an outer planet makes no close aspect to a personal planet, do not manufacture one.

THE DATA BOUNDARY: write only from the placements, aspects, and WHOLE-CHART SHAPE lines provided. Never invent a chart shape, census, gathering, leading planet, or angle contact that is not listed — if no shape line is given, say nothing about the chart's overall pattern.

VOICE: plain human language, no jargon, no hype, no flattery, no hedging disclaimers.

${OUTPUT_CONTRACT}`;
}
