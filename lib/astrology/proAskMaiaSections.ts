/**
 * Ask MAIA from inside Pro, about the section the astrologer is working in
 * (founder request 2026-11-07: "an Ask MAIA for each of these sections").
 *
 * Rules, as recommended and adopted for the astrologer's own workspace:
 * MAIA reads a saved chart only when the astrologer asks, and the panel says
 * whose charts first · MAIA receives the section's calculated facts only —
 * never a name, birth date, time or place; people are "the first chart" and
 * "the second chart" · nothing is stored or logged but the fact of an answer ·
 * a question showing crisis or serious distress gets a fixed reply and MAIA is
 * not asked · the client never sees any of it.
 */
import type { BirthChart } from './proEphemerisCalculator';
import { MAJOR_ASPECTS } from './proEphemerisCalculator';
import { chartBodies } from './proChartGeometry';
import { detectAllPatterns, type Aspect as PatternAspect } from './aspectPatternDetector';
import type { CrossAspect } from './proComparison';
import type { TransitAspect } from './proTransits';
import type { FourPillars, LuckDirection } from './proFourPillars';
import type { TraditionalMaya } from './proTraditionalMaya';

export const PRO_ASK_SECTIONS = ['natal', 'transits', 'biwheel', 'composite', 'four-pillars', 'deep'] as const;
export type ProAskSection = typeof PRO_ASK_SECTIONS[number];

export function isProAskSection(value: unknown): value is ProAskSection {
  return typeof value === 'string' && (PRO_ASK_SECTIONS as readonly string[]).includes(value);
}

function deg(value: number): string {
  const d = Math.floor(value);
  return `${d}°${String(Math.min(59, Math.round((value - d) * 60))).padStart(2, '0')}′`;
}

const PATTERN_NAMES: Record<string, string> = {
  'grand-trine': 'Grand trine', 't-square': 'T-square', 'grand-cross': 'Grand cross',
  yod: 'Yod', stellium: 'Stellium', 'mystic-rectangle': 'Mystic rectangle',
};
const TEN_PLANETS = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
const PATTERN_ASPECTS = new Set(['conjunction', 'sextile', 'square', 'trine', 'opposition', 'quincunx']);

/** The named aspect patterns of a chart: which pattern, which planets, the focal one. Facts only. */
export function chartPatterns(chart: BirthChart): string[] {
  // The ten planets only: nodes and Chiron are conventionally left out of named patterns.
  const planets = chartBodies(chart).filter((b) => TEN_PLANETS.has(b.name)).map((b) => ({
    name: b.name, sign: b.position.sign, house: b.position.house, degree: b.position.degree, longitude: b.longitude,
  }));
  const names = new Set<string>(planets.map((p) => p.name));
  const aspects = (chart.aspects || []).filter((a) =>
    PATTERN_ASPECTS.has(a.type) && names.has(a.planet1) && names.has(a.planet2)) as PatternAspect[];
  return detectAllPatterns(aspects, planets).map((p) => {
    const where = p.sign ? ` in ${p.sign}` : p.house ? ` in house ${p.house}` : '';
    const focal = p.focalPlanet ? `, focal ${p.focalPlanet}` : '';
    return `${PATTERN_NAMES[p.type] ?? p.type}${where}: ${p.planets.join(', ')}${focal}`;
  });
}

/** Positions, angles, close major aspects and named patterns of one chart — data, not a reading. */
export function chartFacts(chart: BirthChart, heading: string): string {
  const lines = [`${heading}: Ascendant ${chart.ascendant.sign} ${deg(chart.ascendant.degree)} · Midheaven ${chart.midheaven.sign} ${deg(chart.midheaven.degree)}`];
  for (const b of chartBodies(chart)) {
    lines.push(`  ${b.name}: ${b.position.sign} ${deg(b.position.degree)}, house ${b.position.house}${b.position.retrograde ? ', retrograde' : ''}`);
  }
  const aspects = (chart.aspects || [])
    .filter((a) => MAJOR_ASPECTS.has(a.type) && a.orb <= 5)
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 24)
    .map((a) => `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}°)`);
  if (aspects.length) lines.push(`  Aspects: ${aspects.join('; ')}`);
  const patterns = chartPatterns(chart);
  if (patterns.length) lines.push(`  Patterns: ${patterns.join('; ')}`);
  return lines.join('\n');
}

export function transitFacts(aspects: readonly TransitAspect[], when: string): string {
  const list = aspects.slice(0, 16).map((t) => `transiting ${t.transit} ${t.type} natal ${t.natal} (${t.orb.toFixed(1)}°)`);
  return `Transits on ${when}: ${list.length ? list.join('; ') : 'none within 2°'}`;
}

export function contactFacts(contacts: readonly CrossAspect[]): string {
  const list = contacts.slice(0, 24).map((c) => `first chart's ${c.inner} ${c.type} second chart's ${c.outer} (${c.orb.toFixed(1)}°)`);
  return `Contacts between the charts: ${list.length ? list.join('; ') : 'none within 3°'}`;
}

export function fourPillarsFacts(fp: FourPillars, direction: 'forward' | 'backward' | null): string {
  const lines: string[] = [];
  lines.push(`Day Master: ${fp.dayMaster.pinyin} (${fp.dayMaster.hanzi}), ${fp.dayMaster.polarity} ${fp.dayMaster.element}`);
  for (const p of fp.pillars) {
    lines.push(`${p.name} pillar: ${p.stem.pinyin} ${p.branch.pinyin} (${p.stem.hanzi}${p.branch.hanzi}) — stem ${p.stem.polarity} ${p.stem.element}${p.stem.tenGod ? `, ${p.stem.tenGod.english}` : ''}; branch ${p.branch.animal}, ${p.branch.element}; hidden stems ${p.hidden.map((h) => `${h.pinyin} (${h.tenGod.english})`).join(', ')}`);
  }
  lines.push(`Elements among the eight characters: ${Object.entries(fp.elements).map(([e, n]) => `${e} ${n}`).join(', ')}`);
  const thisYear = fp.annual.find((a) => a.year === fp.now.solarYear);
  if (thisYear) lines.push(`This year's pillar: ${thisYear.stem.pinyin} ${thisYear.branch.pinyin} (${thisYear.tenGod.english})`);
  if (direction) {
    const luck: LuckDirection = fp.luck[direction];
    const now = luck.pillars.find((l) => fp.ageNow >= l.fromAge && fp.ageNow < l.toAge);
    lines.push(`Luck pillars counted ${direction}, beginning at age ${luck.startAge.years}: ${luck.pillars.map((l) => `${Math.floor(l.fromAge)}–${Math.floor(l.toAge)} ${l.stem.pinyin} ${l.branch.pinyin} (${l.tenGod.english})`).join('; ')}`);
    lines.push(now
      ? `Now: age ${Math.floor(fp.ageNow)}, in the luck pillar ${now.stem.pinyin} ${now.branch.pinyin} (${now.tenGod.english}).`
      : `Now: age ${Math.floor(fp.ageNow)}, not within the luck pillars listed.`);
  } else {
    lines.push('The astrologer has not chosen a luck pillar direction; do not discuss the luck pillars.');
  }
  return lines.join('\n');
}

const SECTION_FOCUS: Record<ProAskSection, string> = {
  natal: 'the natal chart below (and, if given, the transits to it on a chosen date)',
  transits: 'the transits to the natal chart below',
  biwheel: 'the relationship between the two charts below (synastry), read through the contacts between them',
  composite: 'the composite chart below, made from the midpoints of two people\'s charts: it describes the relationship as its own entity',
  'four-pillars': 'the Chinese Four Pillars (BaZi) chart below',
  deep: 'a full reading of one person, drawing together everything below',
};

export function mayaFacts(t: TraditionalMaya, label: string): string {
  return `${label}, traditional Maya count (GMT ${t.correlation}): ${t.number} ${t.kiche} (Yucatec ${t.number} ${t.yucatec}), Haab ${t.haab.day} ${t.haab.month}, Long Count ${t.longCount}`;
}

/** Longest life context the astrologer may give a deep reading. */
export const LIFE_CONTEXT_MAX = 3000;

/**
 * The deep reading: a longer, organised reading of one person that draws the
 * sections together, with what the astrologer knows of their life as context
 * — never as something the chart caused, predicted or explains.
 */
export function proDeepSystemPrompt(facts: string, lifeContext: string | null): string {
  return `You are MAIA, an AI companion in Soullab, writing a full reading for a professional astrologer about one person. You are MAIA, not the astrologer and not a person.

HOW YOU WRITE:
- Organise the reading with short section titles, each on its own line, then plain paragraphs. No markdown symbols, no bullet lists. About 800 to 1,200 words.
- Begin with the chart's central structure (its named patterns and tightest aspects), then the life themes it offers language for, then any dated transits, then the other systems given, then an integrated view.
- The chart is symbolic: it offers language for patterns and tensions, never causes, diagnoses or fates. Use only the facts below; if something is not there, say so.
- Do not predict events, deaths, illness, accidents, pregnancies, legal or money outcomes, or their timing, and do not read past events as having been foretold. Do not give medical, psychological, legal or financial advice.
- For the traditional Maya count, give the dates but do not assign traditional meanings: those belong to living daykeepers. Do not use the Dreamspell system.
- Where it would help the astrologer, name what would deepen the work (for example progressions over a period, or consulting a living daykeeper).${lifeContext ? `
- The astrologer has shared what they know of this person's life, below. Use it as context, with care. Never say or imply that the chart caused, predicted or explains any illness, addiction, injury or death; at most, say the chart offers a language for themes the person lived with. If the person has died, write with tenderness and without speculation about how or why.` : ''}
- Refer to the person as "the person" or by the role the astrologer uses; do not ask for names or birth details.

──────── THE FACTS ────────
${facts}${lifeContext ? `

──────── WHAT THE ASTROLOGER KNOWS OF THEIR LIFE (from the astrologer, not from the chart) ────────
${lifeContext}` : ''}`;
}

/** Opens a deep reading whose life context mentions risk, without refusing the reading. */
export const PRO_DEEP_CONTEXT_NOTE =
  'If anyone in this story is at risk right now, please reach a person who can help: your local emergency number, or in the US call or text 988. The reading follows.';

/** The system prompt for MAIA speaking with the astrologer about one section. */
export function proAskSystemPrompt(section: ProAskSection, facts: string): string {
  return `You are MAIA, an AI companion in Soullab, speaking with a professional astrologer in their own workspace. They are asking about ${SECTION_FOCUS[section]}. You are MAIA, not the astrologer and not a person.

HOW YOU SPEAK:
- Speak to the astrologer as a knowledgeable colleague: you may use astrological terms. Plain text only — no headings, bullet lists or markdown. Keep to a few short paragraphs (under about 250 words).
- The chart is symbolic: patterns to work with, never a fate. Offer possibilities and hand meaning back to the astrologer and their client.
- Use only the facts below. If something is not there, say you can't see it. The people are "the first chart" and "the second chart"; you do not know their names, and do not ask for them or for birth details.
- Do not predict events, deaths, illness, accidents, pregnancies, legal or money outcomes, or their timing. Do not give medical, psychological, legal or financial advice.
- If the question shows distress about a real person's safety, say you are not a crisis service and encourage reaching a person who can help.
- Nothing is remembered between questions; each stands alone.

──────── THE FACTS ────────
${facts}`;
}

/** The fixed reply when a question shows crisis or serious distress. MAIA is not asked. */
export const PRO_ASK_SAFETY_REPLY =
  'This sounds like it may be about someone\'s safety, and that deserves a real person rather than a chart reading. I\'m an AI and not a crisis service. ' +
  'If someone is in immediate danger, call your local emergency number. In the US you can call or text 988 (Suicide & Crisis Lifeline); elsewhere, findahelpline.com lists free, confidential lines.';

/**
 * An astrologer asks about a client, so concern arrives in the third person
 * ("he wants to die", "talking about ending her life"), which the shared
 * first-person safety check does not catch. These patterns add that.
 */
const THIRD_PERSON_CONCERN = [
  /\b(wants?|wanted|wanting|trying|tried|tries|plans?|planning|planned|threaten(s|ed|ing)?|talk(s|ed|ing)? about)\s+to\s+(die|kill\s+\w+sel(f|ves)|end\s+(his|her|their)\s+(own\s+)?life)\b/i,
  /\b(kill(s|ed|ing)?|hurt(s|ing)?|harm(s|ed|ing)?)\s+(him|her|them)sel(f|ves)\b/i,
  /\bend(s|ed|ing)?\s+(his|her|their)\s+(own\s+)?life\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm/i,
  /\boverdos(e|ed|ing)\b/i,
];

export function thirdPersonConcern(question: string): boolean {
  return THIRD_PERSON_CONCERN.some((p) => p.test(question));
}

