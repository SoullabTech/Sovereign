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
import { declinationPairs, type Declination } from './proDeclinations';
import type { ProOtherSystems } from './proOtherSystems';
import { proGuideInstruction } from './proGuide';

export const PRO_ASK_SECTIONS = ['natal', 'transits', 'biwheel', 'composite', 'four-pillars', 'progressed', 'vedic', 'mayan', 'deep'] as const;
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
  progressed: 'the secondary progressions and solar arcs below, against the natal chart',
  vedic: 'the Vedic (Jyotish, sidereal) chart below, with its nakshatras and Vimshottari dasha periods',
  mayan: 'the Mayan calendar positions below: the traditional day count, and separately the modern Dreamspell signature with its three-stage path of life',
  deep: 'a full reading of one person, drawing together everything below',
};

export function mayaFacts(t: TraditionalMaya, label: string): string {
  return `${label}, traditional Maya count (GMT ${t.correlation}): ${t.number} ${t.kiche} (Yucatec ${t.number} ${t.yucatec}), Haab ${t.haab.day} ${t.haab.month}, Long Count ${t.longCount}`;
}

const day = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

/**
 * The Vedic chart: lagna, grahas with nakshatra and dignity, and where the
 * Vimshottari dasha stands now. Past period boundaries are left out: the first
 * one is the birth date.
 */
export function vedicFacts(v: ProOtherSystems['vedic']): string {
  const lines = [
    `Vedic chart (sidereal, ${v.ayanamsaLabel} ayanamsa ${v.ayanamsaValue.toFixed(2)}°, whole-sign houses):`,
    `Lagna: ${v.lagna.rashi} ${deg(v.lagna.degree)}, nakshatra ${v.lagna.nakshatra}`,
    ...v.grahas.map((g) => `${g.graha}: ${g.rashi} ${deg(g.degree)}, house ${g.house}, nakshatra ${g.nakshatra} pada ${g.pada}${g.retrograde ? ', retrograde' : ''}${g.dignity && g.dignity !== 'neutral' ? `, ${g.dignity}` : ''}`),
    `Birth nakshatra (Moon): ${v.birthNakshatra.name} pada ${v.moonPada}, ruled by ${v.birthNakshatra.ruler}`,
    `Vimshottari dasha now: ${v.dasha.currentMahadasha.ruler} mahadasha until ${day(v.dasha.currentMahadasha.endDate)}` +
      (v.dasha.currentAntardasha ? `, ${v.dasha.currentAntardasha.ruler} antardasha until ${day(v.dasha.currentAntardasha.endDate)}` : ''),
  ];
  if (v.dasha.nextMahadasha) lines.push(`Next mahadasha: ${v.dasha.nextMahadasha.ruler}, ${v.dasha.nextMahadasha.durationYears} years`);
  return lines.join('\n');
}

/**
 * The Mayan positions: the traditional count (dates only: its meanings belong
 * to living daykeepers), and the modern Dreamspell signature with the three
 * stages of its path of life.
 */
export function mayanFacts(m: ProOtherSystems['mayan']): string {
  const stage = (name: 'youth' | 'adulthood' | 'future') => m.pathOfLife.find((p) => p.stage === name)?.signature ?? 'not calculated';
  return [
    mayaFacts(m.traditional, 'Birth'),
    'Dreamspell count (a modern system, José Argüelles 1987; not the traditional day count and not used by Maya daykeepers):',
    `Galactic signature: ${m.galacticSignature} (Kin ${m.tzolkinNumber} of 260, ${m.wavespell} wavespell)`,
    `Day sign: ${m.daySign.name}, ${m.daySign.archetype}; ${m.daySign.meaning}`,
    `Tone: ${m.tone.number} ${m.tone.name}; ${m.tone.meaning}`,
    `Direction: ${m.direction}`,
    `Path of life, three stages: youth ${stage('youth')}; adulthood ${stage('adulthood')}; future ${stage('future')}`,
    ...(m.profile?.lifeCycleInsight ? [`Life cycle: ${m.profile.lifeCycleInsight}`] : []),
  ].join('\n');
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
- Begin with the chart's central structure (its named patterns and tightest aspects), then the life themes it offers language for, then any dated transits, progressions and solar arcs (over a period if given), then the other systems given, then an integrated view.
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

/**
 * The cockpit view the astrologer has open when they ask from the MAIA dock.
 * A fixed list: the phrase MAIA is given comes from here, never from the
 * browser. `sees` is false where MAIA is not given that view's own figures,
 * so MAIA says so instead of guessing.
 */
export const PRO_ASK_VIEWS = {
  wheel: { phrase: 'the chart wheel', sees: true },
  point: { phrase: 'one selected point of the chart', sees: true },
  aspects: { phrase: 'the aspect grid and declinations', sees: true },
  'chart-views': { phrase: 'alternative views of the chart (sidereal, harmonic, chart points)', sees: false },
  'house-wheel': { phrase: 'the Spiralogic house wheel', sees: false },
  ephemeris: { phrase: 'the graphical ephemeris', sees: false },
  // The astro map, not "and relocated chart": the page does not say whether a
  // place was chosen, so MAIA must not assume a relocation happened.
  'astro-map': { phrase: 'the astro map (whether they have relocated the chart to a place is not known)', sees: false },
  vedic: { phrase: 'the Vedic (sidereal) view of the chart', sees: false },
  mayan: { phrase: 'the Mayan view of the chart', sees: true },
  'tradition-report': { phrase: 'the written report of what tradition says about the placements', sees: true },
  'soul-portrait': { phrase: 'a Soul Portrait of this chart', sees: true },
  relationships: { phrase: 'questions for relational awareness drawn from this chart', sees: true },
  research: { phrase: 'a research snapshot of this chart', sees: true },
  study: { phrase: 'a study lesson, using this chart as the example', sees: true },
} as const;
export type ProAskView = keyof typeof PRO_ASK_VIEWS;
export function isProAskView(value: unknown): value is ProAskView {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PRO_ASK_VIEWS, value);
}

export type ProAskMode = 'ask' | 'mentor';
export type ProAskDepth = 'brief' | 'deep';
/** Earlier turns of one visit the page may send back, and the longest answer among them. */
export const PRO_ASK_HISTORY_MAX = 8;
export const PRO_ASK_HISTORY_TURN_MAX = 12_000;

/** Declinations and the parallels between them — data, not a reading. */
export function declinationFacts(declinations: readonly Declination[]): string {
  if (!declinations.length) return 'Declinations: none calculated.';
  const each = declinations.map((d) =>
    `${d.body} ${Math.abs(d.declination).toFixed(2)}°${d.declination >= 0 ? 'N' : 'S'}${d.outOfBounds ? ' (out of bounds)' : ''}`);
  const pairs = declinationPairs(declinations).map((p) => `${p.a} ${p.type} ${p.b} (orb ${p.orb.toFixed(2)}°)`);
  return `Declinations: ${each.join('; ')}\nParallels within 1°: ${pairs.length ? pairs.join('; ') : 'none'}`;
}

/** The system prompt for MAIA speaking with the astrologer about one section. */
export function proAskSystemPrompt(section: ProAskSection, facts: string,
  where: {
    mode?: ProAskMode; view?: ProAskView; point?: string; depth?: ProAskDepth;
    /** Earlier turns of this visit are in the conversation. */
    continuing?: boolean;
    /** The astrologer's own chart, read with what they have kept with MAIA (may be empty). */
    personal?: { kept: string };
  } = {}): string {
  const deep = where.depth === 'deep';
  const length = deep
    ? 'Go as deep as the question asks: several full paragraphs (up to about 700 words), moving from the chart\'s structure to what it opens.'
    : 'Keep to a few short paragraphs (under about 250 words).';
  const view = where.view ? PRO_ASK_VIEWS[where.view] : null;
  const looking = view
    ? ` Right now they have ${view.phrase} open${where.point ? `, with ${where.point} selected` : ''}.${view.sees ? '' : ' You are not given that view\'s own figures: answer from the facts below and say plainly what you cannot see from here.'}`
    : where.point ? ` They have ${where.point} selected.` : '';
  const manner = where.mode === 'mentor'
    ? `- You are here as a mentor in the craft. Teach the technique the astrologer asks about: what it is, how it is calculated, how different schools read it and where they disagree, and what to look at first. Use the chart below only as a worked example, and say that it is an example. Do not give a reading of the person.
- Speak as one practitioner teaching another. Plain text only — no headings, bullet lists or markdown. ${deep ? length : 'Keep to a few short paragraphs (under about 300 words).'}`
    : `- Speak to the astrologer as a knowledgeable colleague: you may use astrological terms. Plain text only — no headings, bullet lists or markdown. ${length}`;
  const own = where.personal
    ? `
- This is the astrologer's own chart, and they have asked you to read it with what they have chosen to keep with you (below). Speak to them as "you". Relate the chart to what they have kept where the two genuinely meet, and say which is which: "your chart shows…" is the chart; "you once kept…" is their own words. Never say or imply the chart caused, predicted or explains anything in their life: it offers a language for it. Offer what you notice, then ask what they recognise; they are the author of the meaning. Do not recite their kept material back at length.${where.personal.kept ? '' : '\n- They have kept nothing with you that may be brought here, so say so in one sentence and read the chart on its own.'}`
    : '';
  const memory = where.continuing
    ? '- The earlier questions and answers of this visit are in the conversation: build on them and do not repeat yourself. Nothing is kept after the visit.'
    : '- Nothing is remembered between visits.';
  return `You are MAIA, an AI companion in Soullab, speaking with a professional astrologer in their own workspace. They are asking about ${SECTION_FOCUS[section]}.${looking} You are MAIA, not the astrologer and not a person.

HOW YOU SPEAK:
${manner}
- The chart is symbolic: patterns to work with, never a fate. Offer possibilities and hand meaning back to the astrologer and their client.
- Use only the facts below. If something is not there, say you can't see it. The people are "the first chart" and "the second chart"; you do not know their names, and do not ask for them or for birth details.
- Do not predict events, deaths, illness, accidents, pregnancies, legal or money outcomes, or their timing. Do not give medical, psychological, legal or financial advice.
- For the traditional Maya count, give the dates and explain how the count works, but do not assign meanings to its days: those belong to living daykeepers. The Dreamspell is a modern system: you may discuss its signature, tone and three-stage path of life, always naming it as Dreamspell and never as the traditional Maya count.
- If the question shows distress about a real person's safety, say you are not a crisis service and encourage reaching a person who can help.
${memory}${own}

${proGuideInstruction()}

──────── THE FACTS ────────
${facts}${where.personal?.kept ? `

──────── WHAT THE ASTROLOGER HAS CHOSEN TO KEEP WITH YOU (their own words and marks, not from the chart) ────────
${where.personal.kept}` : ''}`;
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

