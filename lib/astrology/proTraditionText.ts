/**
 * ASTRO-PRO-REPORTS-01 — what Western astrological tradition has said.
 *
 * Founder ruling 2026-11-04: Pro reports may include written readings only
 * when labelled as tradition. Every sentence here therefore REPORTS a
 * tradition ("tradition associates…", "is traditionally read as…"); none
 * predicts an event or states who a person is. Significations follow the
 * Hellenistic/medieval sources for the seven classical planets and common
 * modern usage for Uranus, Neptune, Pluto, Chiron and the nodes, which is
 * said where it applies. Static text; no model generates any of it.
 */

export const SIGN_TRADITION: Record<string, { element: string; modality: string; ruler: string; modernRuler?: string; reading: string }> = {
  Aries: { element: 'fire', modality: 'cardinal', ruler: 'Mars', reading: 'initiating, direct and pioneering, with a traditional caution about haste' },
  Taurus: { element: 'earth', modality: 'fixed', ruler: 'Venus', reading: 'steady, sensual and persistent, with a traditional caution about possessiveness' },
  Gemini: { element: 'air', modality: 'mutable', ruler: 'Mercury', reading: 'curious, communicative and versatile, with a traditional caution about scattering' },
  Cancer: { element: 'water', modality: 'cardinal', ruler: 'the Moon', reading: 'protective, feeling and nurturing, with a traditional caution about changeable moods' },
  Leo: { element: 'fire', modality: 'fixed', ruler: 'the Sun', reading: 'expressive, generous and warm, with a traditional caution about pride' },
  Virgo: { element: 'earth', modality: 'mutable', ruler: 'Mercury', reading: 'discerning, practical and analytical, with a traditional caution about over-criticism' },
  Libra: { element: 'air', modality: 'cardinal', ruler: 'Venus', reading: 'relational, balancing and concerned with fairness, with a traditional caution about indecision' },
  Scorpio: { element: 'water', modality: 'fixed', ruler: 'Mars', modernRuler: 'Pluto', reading: 'intense, private and penetrating, with a traditional caution about control' },
  Sagittarius: { element: 'fire', modality: 'mutable', ruler: 'Jupiter', reading: 'exploring, philosophical and frank, with a traditional caution about restlessness' },
  Capricorn: { element: 'earth', modality: 'cardinal', ruler: 'Saturn', reading: 'ambitious, disciplined and structured, with a traditional caution about austerity' },
  Aquarius: { element: 'air', modality: 'fixed', ruler: 'Saturn', modernRuler: 'Uranus', reading: 'independent, principled and communal, with a traditional caution about detachment' },
  Pisces: { element: 'water', modality: 'mutable', ruler: 'Jupiter', modernRuler: 'Neptune', reading: 'compassionate, imaginative and receptive, with a traditional caution about boundaries' },
};

export const PLANET_TRADITION: Record<string, { signifies: string; note?: string }> = {
  Sun: { signifies: 'vitality, identity, purpose and authority' },
  Moon: { signifies: 'feeling, habit, the body and its rhythms, and nourishment' },
  Mercury: { signifies: 'thought, speech, learning, trade and short journeys' },
  Venus: { signifies: 'love, beauty, pleasure, harmony and what is valued', note: 'traditionally the lesser benefic' },
  Mars: { signifies: 'drive, courage, desire and conflict', note: 'traditionally the lesser malefic' },
  Jupiter: { signifies: 'growth, faith, generosity, law and higher learning', note: 'traditionally the greater benefic' },
  Saturn: { signifies: 'limits, time, structure, responsibility and endurance', note: 'traditionally the greater malefic' },
  Uranus: { signifies: 'sudden change, independence and innovation', note: 'a modern addition to the tradition' },
  Neptune: { signifies: 'imagination, dissolution, idealism and the spiritual', note: 'a modern addition to the tradition' },
  Pluto: { signifies: 'power, depth, endings and regeneration', note: 'a modern addition to the tradition' },
  Chiron: { signifies: 'wounding, healing and teaching', note: 'a modern addition to the tradition' },
  'North Node': { signifies: 'increase and what is growing', note: 'in medieval sources, the node of increase' },
  'South Node': { signifies: 'release and what is diminishing', note: 'in medieval sources, the node of decrease' },
};

export const HOUSE_TRADITION: Record<number, string> = {
  1: 'the self, the body, appearance and the direction of life',
  2: 'resources, possessions and livelihood',
  3: 'siblings, neighbours, short journeys and everyday communication',
  4: 'home, family, roots, land and endings',
  5: 'children, pleasure, creativity and romance',
  6: 'work, daily routine, health and service',
  7: 'partnership, marriage, contracts and open opponents',
  8: 'shared resources, inheritance, crisis and death',
  9: 'long journeys, higher learning, religion and philosophy',
  10: 'career, reputation, public standing and authority',
  11: 'friends, groups, hopes and benefactors',
  12: 'solitude, hidden matters, institutions and retreat',
};

export const ASPECT_TRADITION: Record<string, string> = {
  conjunction: 'a blending, in which the two significations act together and intensify each other',
  sextile: 'an opportunity, a cooperative contact that tradition reads as helpful when acted on',
  square: 'friction, a tension that tradition reads as pressing toward action or adjustment',
  trine: 'flow, an easy contact that tradition reads as harmonious',
  opposition: 'polarity, a tension that tradition reads as made visible through others or circumstances',
  quincunx: 'adjustment, a modern minor aspect read as two things needing ongoing correction',
};

const DOMICILE: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mercury: ['Gemini', 'Virgo'], Venus: ['Taurus', 'Libra'],
  Mars: ['Aries', 'Scorpio'], Jupiter: ['Sagittarius', 'Pisces'], Saturn: ['Capricorn', 'Aquarius'],
  Uranus: ['Aquarius'], Neptune: ['Pisces'], Pluto: ['Scorpio'],
};
const EXALTATION: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces', Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};
const SIGN_ORDER = Object.keys(SIGN_TRADITION);
const opposite = (sign: string) => SIGN_ORDER[(SIGN_ORDER.indexOf(sign) + 6) % 12];

export type Dignity = 'domicile' | 'exaltation' | 'detriment' | 'fall' | null;

/** Essential dignity by the classical tables; outer planets by modern rulership only. */
export function dignity(planet: string, sign: string): Dignity {
  if (DOMICILE[planet]?.includes(sign)) return 'domicile';
  if (EXALTATION[planet] === sign) return 'exaltation';
  if (DOMICILE[planet]?.some((s) => opposite(s) === sign)) return 'detriment';
  if (EXALTATION[planet] && opposite(EXALTATION[planet]) === sign) return 'fall';
  return null;
}

const DIGNITY_TEXT: Record<Exclude<Dignity, null>, string> = {
  domicile: 'Tradition counts this its own sign (domicile), where it is read as acting most freely.',
  exaltation: 'Tradition counts this its sign of exaltation, where it is read as honoured and elevated.',
  detriment: 'Tradition counts this its detriment, opposite its own sign, where it is read as working against the grain.',
  fall: 'Tradition counts this its fall, opposite its exaltation, where it is read as less supported.',
};

export function placementReading(planet: string, sign: string, house: number | null): string[] {
  const p = PLANET_TRADITION[planet];
  const s = SIGN_TRADITION[sign];
  if (!p || !s) return [];
  const lines = [
    `Tradition associates ${planet} with ${p.signifies}${p.note ? ` (${p.note})` : ''}.`,
    `${sign} is a ${s.modality} ${s.element} sign ruled by ${s.ruler}${s.modernRuler ? ` (in modern usage, ${s.modernRuler})` : ''}; tradition reads it as ${s.reading}.`,
  ];
  const d = dignity(planet, sign);
  if (d) lines.push(DIGNITY_TEXT[d]);
  if (house && HOUSE_TRADITION[house]) lines.push(`The ${ordinal(house)} house traditionally concerns ${HOUSE_TRADITION[house]}.`);
  return lines;
}

export function aspectReading(a: string, b: string, type: string): string | null {
  const text = ASPECT_TRADITION[type];
  return text ? `Tradition reads a ${type} between ${a} and ${b} as ${text}.` : null;
}

export function angleReading(angle: 'Ascendant' | 'Midheaven', sign: string): string | null {
  const s = SIGN_TRADITION[sign];
  if (!s) return null;
  return angle === 'Ascendant'
    ? `Tradition reads the rising sign as colouring the self and the body; ${sign} is read as ${s.reading}. Its ruler, ${s.ruler}, is traditionally called the chart ruler.`
    : `Tradition reads the Midheaven as public life and vocation; ${sign} is read as ${s.reading}.`;
}

export function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] || 'th';
  return n + suffix;
}

export const TRADITION_NOTICE =
  'This report collects what Western astrological tradition has said about these placements. ' +
  'It is a record of a tradition, not a statement about who this person is or what will happen. ' +
  'Their own sense of it comes first.';
