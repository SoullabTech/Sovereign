/**
 * Spiralogic Engine
 * Maps birth chart to Spiralogic facets and elemental balance
 */

import type { AstrologyIntake } from "../astrologyIntakeSchema";
import {
  SPIRALOGIC_FACETS,
  type SpiralogicFacet,
  type SpiralogicElement,
} from "@/lib/astrology/spiralogicMapping";
import type { BirthChart } from "@/lib/astrology/ephemerisCalculator";
import {
  BALANCED_PRACTICE_LINE,
  chartPositionsFromSignDegrees,
  interpretDominance,
  type DominanceVerdict,
  type PhaseDisplayName,
} from "@/lib/spiralogic/interpretation";

// Kept (currently unconsumed here): the registration grammar's anti-fork
// equivalence pin parses this literal from source. Exporting it is bundled
// into the wiring crossing (SQ-1) — do not export or delete it loose.
const SIGNS_TO_ELEMENT: Record<string, SpiralogicElement> = {
  Aries: "fire",
  Leo: "fire",
  Sagittarius: "fire",
  Cancer: "water",
  Scorpio: "water",
  Pisces: "water",
  Taurus: "earth",
  Virgo: "earth",
  Capricorn: "earth",
  Gemini: "air",
  Libra: "air",
  Aquarius: "air",
};

export interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  /**
   * Interpretive claims from the single versioned dominance rule
   * (lib/spiralogic/interpretation, C-fence). Null = no stable dominance /
   * no unique quietest element — a valid verdict, never defaulted.
   */
  dominant: SpiralogicElement | null;
  deficient: SpiralogicElement | null;
  /** The full structured verdict (grade, moonSensitive, provenance axes). */
  dominance?: DominanceVerdict;
}

export interface FacetActivation {
  house: number;
  facet: SpiralogicFacet;
  planets: string[];
  intensity: number; // 0-1 based on planet count and importance
}

export interface SpiralogicEngineResult {
  elementalBalance: ElementalBalance;
  activeFacets: FacetActivation[];
  currentPhase: {
    element: SpiralogicElement;
    /** Display name from the ruled modality-keyed mapping (Finding 6), via the facet's stage. */
    stage: PhaseDisplayName;
    description: string;
  };
  coherencePractices: string[];
}

/**
 * Calculate elemental weights for planets
 */
const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 3,
  Moon: 3,
  Mercury: 1,
  Venus: 1.5,
  Mars: 1.5,
  Jupiter: 2,
  Saturn: 2,
  Uranus: 1,
  Neptune: 1,
  Pluto: 1,
  Chiron: 0.5,
  "North Node": 1,
};

function calculateElementalBalance(chart: BirthChart): ElementalBalance {
  // Distribution + dominance both come from the ratified substrate:
  // registerChart (grammar, all weights 1.0 per Q5) via interpretDominance
  // (the single versioned rule, C-fence). The engine's former weighted
  // tally + always-crowning sort are retired — dominance may now be null.
  let verdict: DominanceVerdict;
  try {
    verdict = interpretDominance(chartPositionsFromSignDegrees(chart));
  } catch (error) {
    // Refuse-not-repair propagated to this boundary: a chart the grammar
    // cannot register totally yields absence, never a manufactured crown.
    console.warn("[spiralogicEngine] chart could not be registered:", error);
    return { fire: 0, water: 0, earth: 0, air: 0, dominant: null, deficient: null };
  }

  const weights = verdict.elementWeights;
  const total = weights.fire + weights.water + weights.earth + weights.air;
  const toPercent = (w: number) => (total > 0 ? Math.round((w / total) * 100) : 0);

  return {
    fire: toPercent(weights.fire),
    water: toPercent(weights.water),
    earth: toPercent(weights.earth),
    air: toPercent(weights.air),
    dominant: verdict.verdict === "none" ? null : verdict.verdict,
    deficient: verdict.deficient,
    dominance: verdict,
  };
}

function getCoherencePractices(balance: ElementalBalance): string[] {
  const practices: string[] = [];

  // Practices to strengthen deficient element.
  // (A null deficient/dominant matches no case — the rule declined the
  // claim, so no element-keyed practice is manufactured.)
  switch (balance.deficient) {
    case "fire":
      practices.push("Morning sun exposure and vigorous movement");
      practices.push("Set one bold intention daily and act on it");
      break;
    case "water":
      practices.push("Journaling before bed to process emotions");
      practices.push("Cold water immersion or long baths for nervous system reset");
      break;
    case "earth":
      practices.push("Daily grounding practice (barefoot on earth)");
      practices.push("Complete one small practical task to build momentum");
      break;
    case "air":
      practices.push("Breathwork practice to expand mental clarity");
      practices.push("Read or learn something new for 20 minutes daily");
      break;
  }

  // Practices to balance dominant element
  switch (balance.dominant) {
    case "fire":
      practices.push("Practice stillness and receptivity to balance fire's action");
      break;
    case "water":
      practices.push("Create structured boundaries to channel water's flow");
      break;
    case "earth":
      practices.push("Introduce spontaneity to loosen earth's rigidity");
      break;
    case "air":
      practices.push("Embody ideas through physical practice to ground air");
      break;
  }

  // Balanced chart (no dominant, no deficient): say so honestly.
  if (practices.length === 0) {
    practices.push(BALANCED_PRACTICE_LINE);
  }

  return practices;
}

/**
 * Run Spiralogic mapping
 */
export async function runSpiralogicEngine(
  intake: AstrologyIntake,
  birthChart?: BirthChart
): Promise<SpiralogicEngineResult | null> {
  if (!birthChart) {
    // Can't do full spiralogic without chart
    // Could extract from intake.natal placements if needed
    return null;
  }

  const elementalBalance = calculateElementalBalance(birthChart);

  // Find which facets have planets (houses with planets)
  const activeFacets: FacetActivation[] = [];

  // Map planets to their houses
  const planetsByHouse: Record<number, string[]> = {};
  const planets = [
    { name: "Sun", data: birthChart.sun },
    { name: "Moon", data: birthChart.moon },
    { name: "Mercury", data: birthChart.mercury },
    { name: "Venus", data: birthChart.venus },
    { name: "Mars", data: birthChart.mars },
    { name: "Jupiter", data: birthChart.jupiter },
    { name: "Saturn", data: birthChart.saturn },
    { name: "Uranus", data: birthChart.uranus },
    { name: "Neptune", data: birthChart.neptune },
    { name: "Pluto", data: birthChart.pluto },
  ];

  for (const planet of planets) {
    if (planet.data?.house) {
      const house = planet.data.house;
      if (!planetsByHouse[house]) planetsByHouse[house] = [];
      planetsByHouse[house].push(planet.name);
    }
  }

  // Build facet activations
  for (const [houseStr, planetList] of Object.entries(planetsByHouse)) {
    const house = parseInt(houseStr);
    const facet = SPIRALOGIC_FACETS[house];
    if (facet) {
      // Calculate intensity based on planet weights
      const totalWeight = planetList.reduce((sum, p) => sum + (PLANET_WEIGHTS[p] || 1), 0);
      const maxPossible = 10; // rough max
      const intensity = Math.min(1, totalWeight / maxPossible);

      activeFacets.push({
        house,
        facet,
        planets: planetList,
        intensity,
      });
    }
  }

  // Sort by intensity
  activeFacets.sort((a, b) => b.intensity - a.intensity);

  // Determine current phase based on dominant element
  const dominantFacet = activeFacets[0]?.facet || SPIRALOGIC_FACETS[1];

  const coherencePractices = getCoherencePractices(elementalBalance);

  return {
    elementalBalance,
    activeFacets,
    currentPhase: {
      element: dominantFacet.element,
      stage: dominantFacet.stage,
      description: dominantFacet.description,
    },
    coherencePractices,
  };
}
