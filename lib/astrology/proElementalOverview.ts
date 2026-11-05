/**
 * Elemental Alchemy overview of a chart (founder request 2026-11-05).
 *
 * Two counts, nothing inferred: the elements and modalities of the signs the
 * planets and Ascendant occupy, and which Spiralogic elemental pathway each
 * planet's house belongs to. The pathway words (phase, facet, lesson) are the
 * canonical Spiralogic house mapping (lib/astrology/spiralogicHouseMapping.ts),
 * never generated text.
 */
import type { BirthChart } from './proEphemerisCalculator';
import { chartBodies, type WheelBody } from './proChartGeometry';
import { SPIRALOGIC_HOUSE_MAPPING, type SpiralogicHouseData } from './spiralogicHouseMapping';

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

export const ELEMENT_ORDER: readonly Element[] = ['fire', 'water', 'earth', 'air'];

const SIGN_ELEMENT: Record<string, Element> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};
const SIGN_MODALITY: Record<string, Modality> = {
  Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
  Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
  Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable',
};

/** The ten planets counted for balance, as is conventional; nodes and Chiron are left out. */
const COUNTED = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);

export interface PathwayStation extends SpiralogicHouseData {
  house: number;
  bodies: Array<Pick<WheelBody, 'name' | 'glyph'>>;
}

export interface ElementalOverview {
  /** Planets (and the Ascendant) by the element of their sign. */
  elements: Record<Element, string[]>;
  modalities: Record<Modality, string[]>;
  /** Each element's three houses, Vector → Circle → Spiral, with the bodies in them. */
  pathways: Record<Element, PathwayStation[]>;
}

const PHASE_ORDER = { vector: 0, circle: 1, spiral: 2 } as const;

export function elementalOverview(chart: BirthChart): ElementalOverview {
  const bodies = chartBodies(chart);
  const elements: Record<Element, string[]> = { fire: [], earth: [], air: [], water: [] };
  const modalities: Record<Modality, string[]> = { cardinal: [], fixed: [], mutable: [] };
  const placed = [
    ...bodies.filter((b) => COUNTED.has(b.name)).map((b) => ({ name: b.name as string, sign: b.position.sign })),
    { name: 'Ascendant', sign: chart.ascendant.sign },
  ];
  for (const { name, sign } of placed) {
    const element = SIGN_ELEMENT[sign];
    const modality = SIGN_MODALITY[sign];
    if (element) elements[element].push(name);
    if (modality) modalities[modality].push(name);
  }

  const pathways: Record<Element, PathwayStation[]> = { fire: [], earth: [], air: [], water: [] };
  for (const [houseKey, data] of Object.entries(SPIRALOGIC_HOUSE_MAPPING)) {
    const house = Number(houseKey);
    pathways[data.element].push({
      ...data,
      house,
      bodies: bodies.filter((b) => b.position.house === house).map(({ name, glyph }) => ({ name, glyph })),
    });
  }
  for (const element of ELEMENT_ORDER) {
    pathways[element].sort((a, b) => PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase]);
  }
  return { elements, modalities, pathways };
}
