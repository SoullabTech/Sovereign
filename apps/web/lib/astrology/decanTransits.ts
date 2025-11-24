/**
 * Decan Transit Notification System
 *
 * Living astrology that breathes with cosmic timing.
 * Not predictions - INVITATIONS.
 *
 * "The sun enters the same decan as your natal Mercury -
 *  a moment for communication alchemy."
 *
 * Created by Claude Code - from Daily Musings idea to reality
 * January 21, 2025
 */

import { calculatePlanetaryDecan, type PlanetaryDecan } from './decanCalculator';
import { type Decan } from './decanSystem';

export interface DecanTransitInvitation {
  // What's happening in the sky
  transitingPlanet: string;
  transitDecan: Decan;
  transitDegree: number;

  // What it's activating in your chart
  natalPlanet: string;
  natalDecan: Decan;
  natalDegree: number;

  // The invitation
  invitation: string;
  poeticPhrase: string;
  timing: string; // "Today through Friday"

  // Elemental alchemy
  element: 'fire' | 'water' | 'earth' | 'air';
  alchemicalStage: string;

  // Spiralogic integration
  consciousnessLayer: string;
  brainActivation: string;

  // Visual
  color: string; // For UI theming
  intensity: 'gentle' | 'moderate' | 'strong';
}

export interface CurrentTransits {
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
}

export interface NatalChart {
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus?: number;
  neptune?: number;
  pluto?: number;
}

/**
 * Check for decan transit invitations
 * Compares current planetary positions to natal chart
 * Returns poetic invitations, not predictions
 */
export function checkDecanTransits(
  currentTransits: CurrentTransits,
  natalChart: NatalChart
): DecanTransitInvitation[] {
  const invitations: DecanTransitInvitation[] = [];

  // Planets to check for transits
  const transitPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars'] as const;
  const natalPlanets = Object.keys(natalChart) as (keyof NatalChart)[];

  for (const transitPlanet of transitPlanets) {
    const transitDegree = currentTransits[transitPlanet];
    const transitDecanData = calculatePlanetaryDecan(
      transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1),
      transitDegree
    );

    if (!transitDecanData) continue;

    for (const natalPlanet of natalPlanets) {
      const natalDegree = natalChart[natalPlanet];
      if (natalDegree === undefined) continue;

      const natalDecanData = calculatePlanetaryDecan(
        natalPlanet.charAt(0).toUpperCase() + natalPlanet.slice(1),
        natalDegree
      );

      if (!natalDecanData) continue;

      // Check if transiting planet is in same decan as natal planet
      if (isSameDecan(transitDecanData.decan, natalDecanData.decan)) {
        const invitation = createInvitation(
          transitPlanet,
          transitDecanData,
          natalPlanet,
          natalDecanData
        );

        if (invitation) {
          invitations.push(invitation);
        }
      }
    }
  }

  return invitations;
}

/**
 * Check if two decans are the same
 */
function isSameDecan(decan1: Decan, decan2: Decan): boolean {
  return decan1.sign === decan2.sign && decan1.decanNumber === decan2.decanNumber;
}

/**
 * Create poetic invitation from transit
 * This is where the MAGIC happens - turning astrology into invitation
 */
function createInvitation(
  transitPlanet: string,
  transitData: PlanetaryDecan,
  natalPlanet: string,
  natalData: PlanetaryDecan
): DecanTransitInvitation | null {
  const decan = transitData.decan;

  // Generate poetic phrase based on planet combinations
  const poeticPhrase = generatePoeticPhrase(transitPlanet, natalPlanet, decan);
  const invitation = generateInvitation(transitPlanet, natalPlanet, decan);

  // Calculate timing (decans last ~10 days)
  const timing = calculateTiming(transitData.degreeInSign);

  // Determine intensity based on how exact the alignment is
  const intensity = calculateIntensity(
    transitData.degreeInSign,
    natalData.degreeInSign
  );

  return {
    transitingPlanet: transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1),
    transitDecan: decan,
    transitDegree: transitData.absoluteDegree,

    natalPlanet: natalPlanet.charAt(0).toUpperCase() + natalPlanet.slice(1),
    natalDecan: natalData.decan,
    natalDegree: natalData.absoluteDegree,

    invitation,
    poeticPhrase,
    timing,

    element: decan.spiralogicElement,
    alchemicalStage: decan.alchemicalStage,

    consciousnessLayer: decan.consciousnessLayer,
    brainActivation: decan.brainActivation,

    color: getElementColor(decan.spiralogicElement),
    intensity
  };
}

/**
 * Generate poetic phrases - the soul of the invitation
 */
function generatePoeticPhrase(
  transitPlanet: string,
  natalPlanet: string,
  decan: Decan
): string {
  const phrases: Record<string, Record<string, string>> = {
    sun: {
      mercury: "Your voice catches the light",
      venus: "Beauty remembers itself",
      mars: "Will meets warmth",
      moon: "The conscious and unconscious dance",
      jupiter: "Vision expands in golden rays",
    },
    moon: {
      sun: "Emotion illuminates purpose",
      mercury: "Feelings find words",
      venus: "The heart knows what it wants",
      mars: "Instinct sharpens action",
      jupiter: "Inner tides carry you forward",
    },
    mercury: {
      sun: "A moment for communication alchemy",
      moon: "Speak from the depths",
      venus: "Words become art",
      mars: "Clarity cuts through",
      jupiter: "The story wants to be told",
    },
    venus: {
      sun: "What you value shines forth",
      moon: "Desire and need align",
      mercury: "Beauty speaks its truth",
      mars: "Attraction meets action",
      jupiter: "Grace multiplies",
    },
    mars: {
      sun: "Energy finds its purpose",
      moon: "Courage to feel fully",
      mercury: "Decisive communication",
      venus: "Passionate creation",
      jupiter: "Bold expansion",
    }
  };

  return phrases[transitPlanet]?.[natalPlanet] ||
         `The ${decan.name} awakens in you`;
}

/**
 * Generate full invitation text
 */
function generateInvitation(
  transitPlanet: string,
  natalPlanet: string,
  decan: Decan
): string {
  const planetNames = {
    sun: 'the Sun',
    moon: 'the Moon',
    mercury: 'Mercury',
    venus: 'Venus',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn'
  };

  const transitName = planetNames[transitPlanet as keyof typeof planetNames] || transitPlanet;
  const natalName = planetNames[natalPlanet as keyof typeof planetNames] || natalPlanet;

  return `${transitName} enters the ${decan.name} (${decan.sign} ${decan.decanNumber}), ` +
         `activating your natal ${natalName}. ${decan.natalMeaning}`;
}

/**
 * Calculate how long this transit invitation is active
 */
function calculateTiming(degreeInSign: number): string {
  // Each decan is 10 degrees, planets move at different speeds
  // Simplified: assume ~3 days remaining in decan on average

  const decanStart = Math.floor(degreeInSign / 10) * 10;
  const decanEnd = decanStart + 10;
  const remaining = decanEnd - degreeInSign;

  if (remaining < 2) return "Today only";
  if (remaining < 4) return "Today through tomorrow";
  if (remaining < 7) return "This week";
  return "The next several days";
}

/**
 * Calculate intensity of the transit
 */
function calculateIntensity(
  transitDegree: number,
  natalDegree: number
): 'gentle' | 'moderate' | 'strong' {
  const diff = Math.abs(transitDegree - natalDegree);

  if (diff < 2) return 'strong';    // Very close - exact activation
  if (diff < 5) return 'moderate';  // Nearby - clear activation
  return 'gentle';                   // Same decan but not exact
}

/**
 * Get color for element
 */
function getElementColor(element: string): string {
  const colors = {
    fire: '#E87D3E',    // Spice orange
    water: '#4A6FA5',   // Fremen blue
    earth: '#A67C52',   // Sandworm bronze
    air: '#D4A574'      // Spice amber
  };

  return colors[element as keyof typeof colors] || '#D4A574';
}

/**
 * Format invitation for display
 */
export function formatInvitationForDisplay(invitation: DecanTransitInvitation): {
  title: string;
  subtitle: string;
  body: string;
  footer: string;
  tarotCard?: string;
} {
  return {
    title: invitation.poeticPhrase,
    subtitle: `${invitation.transitingPlanet} activates your natal ${invitation.natalPlanet}`,
    body: invitation.invitation,
    footer: `${invitation.timing} • ${invitation.transitDecan.name}`,
    tarotCard: invitation.transitDecan.tarotCard
  };
}

/**
 * Get today's invitations for a user
 * This would be called daily (could be a cron job or on-demand)
 */
export async function getTodaysInvitations(
  userId: string,
  currentTransits: CurrentTransits,
  natalChart: NatalChart
): Promise<DecanTransitInvitation[]> {
  const invitations = checkDecanTransits(currentTransits, natalChart);

  // Sort by intensity (strongest first)
  return invitations.sort((a, b) => {
    const intensityOrder = { strong: 0, moderate: 1, gentle: 2 };
    return intensityOrder[a.intensity] - intensityOrder[b.intensity];
  });
}
