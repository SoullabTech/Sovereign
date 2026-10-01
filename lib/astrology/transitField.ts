export type TransitScope = 'major' | 'minor' | 'all';

export interface TransitAspectRecord {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  applying?: boolean;
}

export type TransitScale = 'major' | 'minor';

const EPHEMERIS_PLANETARY_TRANSITS = new Set([
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
]);

const NATAL_POINTS_FOR_FIRST_FIELD = new Set([
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Ascendant', 'Midheaven',
]);

const LONGER_WAVE_TRANSITS = new Set([
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
]);

const ASPECT_TRADITION: Record<string, string> = {
  conjunction: 'Conjunctions are traditionally read as two planetary functions meeting in the same part of the zodiac.',
  opposition: 'Oppositions are traditionally read as a polarity asking to be held in relationship rather than collapsed to one side.',
  square: 'Squares are traditionally read as dynamic tension, friction, or pressure that can call for response and reorganization.',
  trine: 'Trines are traditionally read as a relatively fluent relationship between the planetary functions involved.',
  sextile: 'Sextiles are traditionally read as a cooperative opening whose expression still depends on participation.',
  quincunx: 'Quincunxes are traditionally read as an awkward fit that can invite adjustment, translation, or recalibration.',
};
const PLANET_THEMES: Record<string, string> = {
  Sun: 'identity, vitality, purpose, and creative center',
  Moon: 'feeling, belonging, habit, memory, and embodied need',
  Mercury: 'thought, language, perception, and exchange',
  Venus: 'value, attraction, relationship, pleasure, and receptivity',
  Mars: 'desire, assertion, conflict, initiative, and directed energy',
  Jupiter: 'growth, meaning, confidence, belief, and enlargement',
  Saturn: 'form, limits, responsibility, time, and maturation',
  Uranus: 'disruption, freedom, differentiation, and sudden re-patterning',
  Neptune: 'imagination, permeability, longing, dissolution, and idealization',
  Pluto: 'depth, compulsion, power, loss, renewal, and transformation',
  Ascendant: 'the eastern horizon and the chart’s embodied threshold into the world',
  Midheaven: 'the upper meridian and the chart’s public or vocational axis',
};

function canonicalPlanetName(name: string): string {
  return name
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function isDisplayablePlanetaryTransit(aspect: TransitAspectRecord): boolean {
  return (
    EPHEMERIS_PLANETARY_TRANSITS.has(canonicalPlanetName(aspect.transitPlanet))
    && NATAL_POINTS_FOR_FIRST_FIELD.has(canonicalPlanetName(aspect.natalPlanet))
  );
}

export function classifyTransitScale(aspect: TransitAspectRecord): TransitScale {
  return LONGER_WAVE_TRANSITS.has(canonicalPlanetName(aspect.transitPlanet)) ? 'major' : 'minor';
}

export function transitAspectKey(aspect: TransitAspectRecord): string {
  return [
    canonicalPlanetName(aspect.transitPlanet),
    aspect.aspectType.toLowerCase(),
    canonicalPlanetName(aspect.natalPlanet),
  ].join(':');
}
export function sortTransitAspects(aspects: TransitAspectRecord[]): TransitAspectRecord[] {
  return [...aspects]
    .filter(isDisplayablePlanetaryTransit)
    .sort((a, b) => {
      if (a.orb !== b.orb) return a.orb - b.orb;
      return transitAspectKey(a).localeCompare(transitAspectKey(b));
    });
}

export function filterTransitAspects(
  aspects: TransitAspectRecord[],
  scope: TransitScope,
): TransitAspectRecord[] {
  const sorted = sortTransitAspects(aspects);
  if (scope === 'all') return sorted;
  return sorted.filter((aspect) => classifyTransitScale(aspect) === scope);
}

export function transitAspectLabel(aspect: TransitAspectRecord): string {
  const transit = canonicalPlanetName(aspect.transitPlanet);
  const natal = canonicalPlanetName(aspect.natalPlanet);
  return `${transit} ${aspect.aspectType.toLowerCase()} natal ${natal}`;
}

export function transitScaleLabel(scale: TransitScale): string {
  return scale === 'major' ? 'Longer-wave transit' : 'Shorter-wave transit';
}

export function transitInterpretiveLens(aspect: TransitAspectRecord): {
  calculated: string;
  tradition: string;
  wholeChart: string;
  inquiry: string;
} {
  const transit = canonicalPlanetName(aspect.transitPlanet);
  const natal = canonicalPlanetName(aspect.natalPlanet);
  const aspectType = aspect.aspectType.toLowerCase();
  const transitTheme = PLANET_THEMES[transit] || 'the themes traditionally associated with this transiting body';
  const natalTheme = PLANET_THEMES[natal] || 'the themes traditionally associated with this natal point';
  const tradition = ASPECT_TRADITION[aspectType]
    || 'Astrological traditions give this geometric relationship symbolic meanings that should be held provisionally.';

  return {
    calculated: `${transit} ${aspectType} natal ${natal} · ${aspect.orb.toFixed(2)}° orb.`,
    tradition: `${tradition} In a contemporary Western symbolic vocabulary, ${transit} can evoke ${transitTheme}, while natal ${natal} can locate ${natalTheme}.`,
    wholeChart: `This contact touches natal ${natal}, but it is not the whole chart. Its possible meaning belongs beside that point’s sign, house, natal aspects, the other current transits, and the member’s lived context.`,
    inquiry: 'What, if anything, does this geometry help you notice in your lived experience right now?',
  };
}

export const TRANSIT_SCOPE_COPY: Record<TransitScope, string> = {
  major: 'Longer-wave contacts from Jupiter through Pluto. “Major” names temporal scale here, not importance or destiny.',
  minor: 'Faster contacts from the Sun through Mars. They can describe shorter-lived movement without being less meaningful.',
  all: 'All currently calculated planetary contacts inside the active aspect orbs, ordered by geometric closeness.',
};
