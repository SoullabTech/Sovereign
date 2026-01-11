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
  dominant: SpiralogicElement;
  deficient: SpiralogicElement;
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
    stage: "vector" | "circle" | "spiral";
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
  const balance = { fire: 0, water: 0, earth: 0, air: 0 };

  const planets = [
    { name: "Sun", data: chart.sun },
    { name: "Moon", data: chart.moon },
    { name: "Mercury", data: chart.mercury },
    { name: "Venus", data: chart.venus },
    { name: "Mars", data: chart.mars },
    { name: "Jupiter", data: chart.jupiter },
    { name: "Saturn", data: chart.saturn },
    { name: "Uranus", data: chart.uranus },
    { name: "Neptune", data: chart.neptune },
    { name: "Pluto", data: chart.pluto },
  ];

  for (const planet of planets) {
    if (planet.data?.sign) {
      const element = SIGNS_TO_ELEMENT[planet.data.sign];
      if (element && element !== "aether") {
        balance[element] += PLANET_WEIGHTS[planet.name] || 1;
      }
    }
  }

  // Normalize to percentages
  const total = balance.fire + balance.water + balance.earth + balance.air;
  if (total > 0) {
    balance.fire = Math.round((balance.fire / total) * 100);
    balance.water = Math.round((balance.water / total) * 100);
    balance.earth = Math.round((balance.earth / total) * 100);
    balance.air = Math.round((balance.air / total) * 100);
  }

  // Find dominant and deficient
  const elements: SpiralogicElement[] = ["fire", "water", "earth", "air"];
  const sorted = elements.sort((a, b) => balance[b] - balance[a]);

  return {
    ...balance,
    dominant: sorted[0],
    deficient: sorted[sorted.length - 1],
  };
}

function getCoherencePractices(balance: ElementalBalance): string[] {
  const practices: string[] = [];

  // Practices to strengthen deficient element
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
