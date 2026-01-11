/**
 * Birth Chart Engine
 * Wraps ephemerisCalculator for use in the composer
 */

import type { AstrologyIntake } from "../astrologyIntakeSchema";
import { calculateBirthChart, type BirthData, type BirthChart } from "@/lib/astrology/ephemerisCalculator";

// Map intake house system format to ephemeris format
function mapHouseSystem(intake: string | undefined): BirthData["houseSystem"] {
  const mapping: Record<string, BirthData["houseSystem"]> = {
    whole_sign: "whole-sign",
    placidus: "placidus",
    porphyry: "porphyry",
    equal: "equal",
    koch: "koch",
    campanus: "placidus", // fallback
    regiomontanus: "placidus", // fallback
    topocentric: "placidus", // fallback
  };
  return mapping[intake || "porphyry"] || "porphyry";
}

export interface BirthChartEngineResult {
  chart: BirthChart;
  summary: {
    sun: string;
    moon: string;
    ascendant: string;
    aspectCount: number;
  };
}

/**
 * Run birth chart calculation from intake data
 * Requires: intake.birth with date, time, and location (lat/lng)
 */
export async function runBirthChartEngine(intake: AstrologyIntake): Promise<BirthChartEngineResult | null> {
  if (!intake.birth) return null;

  // We need geocoded location - if not provided, we can't calculate
  // The intake schema has location as string, but ephemeris needs lat/lng
  // For now, return null if we don't have structured location
  // TODO: integrate with geocode API to convert location string → lat/lng

  const { date, time, location, timezone } = intake.birth;

  if (!date || !time || !location) {
    return null;
  }

  // Try to parse location if it looks like "lat,lng" format
  const latLngMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (!latLngMatch) {
    // Location is a string like "Austin, TX" - need geocoding
    // Return null for now, or could throw to signal need for geocoding
    return null;
  }

  const lat = parseFloat(latLngMatch[1]);
  const lng = parseFloat(latLngMatch[2]);

  const birthData: BirthData = {
    date,
    time,
    location: {
      lat,
      lng,
      timezone: timezone || "UTC",
    },
    houseSystem: mapHouseSystem(intake.houseSystem),
  };

  const chart = await calculateBirthChart(birthData);

  return {
    chart,
    summary: {
      sun: `${chart.sun.sign} ${chart.sun.degree.toFixed(1)}°`,
      moon: `${chart.moon.sign} ${chart.moon.degree.toFixed(1)}°`,
      ascendant: `${chart.ascendant.sign} ${chart.ascendant.degree.toFixed(1)}°`,
      aspectCount: chart.aspects.length,
    },
  };
}
