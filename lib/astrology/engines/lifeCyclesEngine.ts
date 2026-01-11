/**
 * Life Cycles Engine
 * Wraps lifeCycleCalculator for use in the composer
 */

import type { AstrologyIntake } from "../astrologyIntakeSchema";
import {
  calculateLifeCycleFromBirthDate,
  calculateLifeCycleReport,
  type LifeCycleReport,
} from "@/lib/astrology/lifeCycleCalculator";
import type { BirthChart } from "@/lib/astrology/ephemerisCalculator";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function toEcliptic(pos: { sign: string; degree: number }): number {
  const signIndex = SIGNS.indexOf(pos.sign);
  return signIndex * 30 + pos.degree;
}

export interface LifeCyclesEngineResult {
  birthDate: string;
  currentAge: number;
  consciousness: {
    structure: string;
    symbol: string;
    description: string;
  };
  saturnCycle: {
    currentCycle: number;
    progress: number;
    nextReturn: {
      date?: string;
      age: number;
      yearsAway: number;
      isActive: boolean;
      description?: string;
    } | null;
  };
  uranusOpposition: {
    date?: string;
    age: number;
    progress: number;
    isActive: boolean;
  };
  chironReturn: {
    date?: string;
    age: number;
    progress: number;
  };
  upcomingMarkers: Array<{
    name: string;
    type: string;
    body?: string;
    date?: string;
    age: number;
    yearsAway: number;
    isActive: boolean;
    description?: string;
  }>;
  insight: string;
}

/**
 * Run life cycles calculation from intake data
 * Requires: intake.birth.date
 */
export async function runLifeCyclesEngine(
  intake: AstrologyIntake,
  birthChart?: BirthChart
): Promise<LifeCyclesEngineResult | null> {
  if (!intake.birth?.date) return null;

  const birthDate = new Date(intake.birth.date);
  if (isNaN(birthDate.getTime())) return null;

  let report: LifeCycleReport;

  // Use precise natal positions if birth chart is available
  if (birthChart?.saturn && birthChart?.jupiter && birthChart?.uranus) {
    report = calculateLifeCycleReport(birthDate, {
      saturn: toEcliptic(birthChart.saturn),
      jupiter: toEcliptic(birthChart.jupiter),
      uranus: toEcliptic(birthChart.uranus),
      chiron: birthChart.chiron ? toEcliptic(birthChart.chiron) : 0,
      northNode: birthChart.northNode ? toEcliptic(birthChart.northNode) : 0,
    });
  } else {
    report = calculateLifeCycleFromBirthDate(birthDate);
  }

  return {
    birthDate: intake.birth.date,
    currentAge: Math.floor(report.currentAge),
    consciousness: {
      structure: report.currentGebserStructure.name,
      symbol: report.currentGebserStructure.symbol,
      description: report.currentGebserStructure.description,
    },
    saturnCycle: {
      currentCycle: report.saturnCycle.currentCycleNumber,
      progress: parseFloat((report.saturnCycle.phaseProgress * 100).toFixed(1)),
      nextReturn: report.saturnCycle.nextReturn
        ? {
            date: report.saturnCycle.nextReturn.exactDate?.toISOString().split("T")[0],
            age: parseFloat(report.saturnCycle.nextReturn.ageAtEvent.toFixed(1)),
            yearsAway: parseFloat((report.saturnCycle.nextReturn.ageAtEvent - report.currentAge).toFixed(1)),
            isActive: report.saturnCycle.nextReturn.isActive,
            description: report.saturnCycle.nextReturn.archetypeDescription,
          }
        : null,
    },
    uranusOpposition: {
      date: report.uranusOpposition.date?.toISOString().split("T")[0],
      age: parseFloat(report.uranusOpposition.ageAtEvent.toFixed(1)),
      progress: parseFloat((report.uranusOpposition.phase * 100).toFixed(1)),
      isActive: report.uranusOpposition.isActive,
    },
    chironReturn: {
      date: report.chironReturn.date?.toISOString().split("T")[0],
      age: parseFloat(report.chironReturn.ageAtEvent.toFixed(1)),
      progress: parseFloat((report.chironReturn.phase * 100).toFixed(1)),
    },
    upcomingMarkers: report.upcomingMarkers.map((m) => ({
      name: m.name,
      type: m.type,
      body: m.planetaryBody,
      date: m.exactDate?.toISOString().split("T")[0],
      age: parseFloat(m.ageAtEvent.toFixed(1)),
      yearsAway: parseFloat((m.ageAtEvent - report.currentAge).toFixed(1)),
      isActive: m.isActive,
      description: m.archetypeDescription,
    })),
    insight: report.currentPhaseInsight,
  };
}
