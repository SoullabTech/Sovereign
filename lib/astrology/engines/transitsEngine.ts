/**
 * Transits Engine
 * Wraps transitCalculator for use in the composer
 */

import type { AstrologyIntake } from "../astrologyIntakeSchema";
import {
  calculateCurrentTransits,
  findTransitAspects,
  type TransitPositions,
  type AspectPattern,
} from "@/lib/astrology/transitCalculator";
import type { BirthChart } from "@/lib/astrology/ephemerisCalculator";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

type SignName = (typeof SIGNS)[number];

interface TransitPosition {
  planet: string;
  longitude: number;
  sign: SignName;
  degree: number;
}

function longitudeToSignDegree(longitude: number): { sign: SignName; degree: number } {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degree = normalizedLon % 30;
  return {
    sign: SIGNS[signIndex],
    degree: Math.round(degree * 100) / 100,
  };
}

export interface TransitsEngineResult {
  timestamp: string;
  positions: TransitPosition[];
  aspects?: AspectPattern[];
  userProvidedTransits?: AstrologyIntake["timing"];
}

/**
 * Run transits calculation
 * Returns current sky positions
 * If birthChart is provided, also returns aspects to natal chart
 */
export async function runTransitsEngine(
  intake: AstrologyIntake,
  birthChart?: BirthChart
): Promise<TransitsEngineResult> {
  const now = new Date();
  const transits = await calculateCurrentTransits(now);

  const positions: TransitPosition[] = [
    { planet: "Sun", longitude: transits.sun, ...longitudeToSignDegree(transits.sun) },
    { planet: "Moon", longitude: transits.moon, ...longitudeToSignDegree(transits.moon) },
    { planet: "Mercury", longitude: transits.mercury, ...longitudeToSignDegree(transits.mercury) },
    { planet: "Venus", longitude: transits.venus, ...longitudeToSignDegree(transits.venus) },
    { planet: "Mars", longitude: transits.mars, ...longitudeToSignDegree(transits.mars) },
    { planet: "Jupiter", longitude: transits.jupiter, ...longitudeToSignDegree(transits.jupiter) },
    { planet: "Saturn", longitude: transits.saturn, ...longitudeToSignDegree(transits.saturn) },
    { planet: "Uranus", longitude: transits.uranus, ...longitudeToSignDegree(transits.uranus) },
    { planet: "Neptune", longitude: transits.neptune, ...longitudeToSignDegree(transits.neptune) },
    { planet: "Pluto", longitude: transits.pluto, ...longitudeToSignDegree(transits.pluto) },
  ];

  const result: TransitsEngineResult = {
    timestamp: now.toISOString(),
    positions,
  };

  // If we have a birth chart, calculate aspects to natal positions
  if (birthChart) {
    const aspects = findTransitAspects(transits, birthChart);
    result.aspects = aspects.sort((a, b) => a.orb - b.orb);
  }

  // Include any user-provided transit data
  if (intake.timing?.transits?.length) {
    result.userProvidedTransits = intake.timing;
  }

  return result;
}
