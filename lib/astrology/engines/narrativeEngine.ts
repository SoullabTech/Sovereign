/**
 * Narrative Engine
 * Wraps archetypalNarrativeService for use in the composer
 */

import type { AstrologyIntake } from "../astrologyIntakeSchema";
import {
  generateArchetypalNarrative,
  generateQuickNarrative,
  type NarrativeRequest,
} from "@/lib/story/archetypalNarrativeService";
import type { BirthChartData } from "@/lib/story/storyWeaver";
import type { BirthChart } from "@/lib/astrology/ephemerisCalculator";

export interface NarrativeEngineResult {
  narrative: string;
  method: "ai" | "template";
  focus?: string[];
}

/**
 * Convert a BirthChart to BirthChartData format for narrative service
 */
function birthChartToNarrativeFormat(chart: BirthChart): BirthChartData {
  return {
    sun: { sign: chart.sun.sign, house: chart.sun.house || 1, degrees: chart.sun.degree },
    moon: { sign: chart.moon.sign, house: chart.moon.house || 1, degrees: chart.moon.degree },
    rising: { sign: chart.ascendant.sign, degrees: chart.ascendant.degree },
    mercury: chart.mercury ? { sign: chart.mercury.sign, house: chart.mercury.house || 1 } : undefined,
    venus: chart.venus ? { sign: chart.venus.sign, house: chart.venus.house || 1 } : undefined,
    mars: chart.mars ? { sign: chart.mars.sign, house: chart.mars.house || 1 } : undefined,
    jupiter: chart.jupiter ? { sign: chart.jupiter.sign, house: chart.jupiter.house || 1 } : undefined,
    saturn: chart.saturn ? { sign: chart.saturn.sign, house: chart.saturn.house || 1 } : undefined,
    chiron: chart.chiron ? { sign: chart.chiron.sign, house: chart.chiron.house || 1 } : undefined,
    northNode: chart.northNode ? { sign: chart.northNode.sign, house: chart.northNode.house || 1 } : undefined,
  };
}

/**
 * Run narrative generation
 * Uses AI for mythic lens, template for developmental
 */
export async function runNarrativeEngine(
  intake: AstrologyIntake,
  birthChart?: BirthChart,
  options?: { useFastTemplate?: boolean; focus?: string[]; userId?: string }
): Promise<NarrativeEngineResult | null> {
  // Need a birth chart to generate narrative
  if (!birthChart) {
    // Try to extract from intake.natal if available
    if (!intake.natal?.placements?.length) {
      return null;
    }

    // Build minimal chart data from placements
    const findPlacement = (body: string) =>
      intake.natal?.placements?.find((p) => p.body === body);

    const sun = findPlacement("Sun");
    const moon = findPlacement("Moon");
    const asc = findPlacement("ASC");

    if (!sun || !moon || !asc) {
      return null;
    }

    // Use template-based narrative for partial data
    const chartData: BirthChartData = {
      sun: { sign: sun.sign || "Unknown", house: sun.house || 1, degrees: sun.degree || 0 },
      moon: { sign: moon.sign || "Unknown", house: moon.house || 1, degrees: moon.degree || 0 },
      rising: { sign: asc.sign || "Unknown", degrees: asc.degree || 0 },
    };

    const narrative = await generateQuickNarrative(chartData);
    return {
      narrative,
      method: "template",
    };
  }

  const chartData = birthChartToNarrativeFormat(birthChart);

  // Use fast template if requested or if this is developmental lens only
  if (options?.useFastTemplate) {
    const narrative = await generateQuickNarrative(chartData);
    return {
      narrative,
      method: "template",
    };
  }

  // Use AI-powered narrative for mythic/deep reads
  // Cast focus to the expected type - the service will validate
  type FocusArea = "identity" | "purpose" | "relationships" | "growth" | "shadow";
  const validFocusAreas: FocusArea[] = ["identity", "purpose", "relationships", "growth", "shadow"];
  const validatedFocus = options?.focus?.filter((f): f is FocusArea => validFocusAreas.includes(f as FocusArea));

  const request: NarrativeRequest = {
    chartData,
    userId: options?.userId || intake.meta?.userId,
    focus: validatedFocus?.length ? validatedFocus : undefined,
  };

  const narrative = await generateArchetypalNarrative(request);

  return {
    narrative: typeof narrative === "string" ? narrative : JSON.stringify(narrative),
    method: "ai",
    focus: options?.focus,
  };
}
