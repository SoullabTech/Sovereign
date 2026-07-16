/**
 * Current Transits API
 *
 * GET /api/astrology/current-transits
 *   Returns current planetary positions (transits) for right now.
 *
 * POST /api/astrology/current-transits
 *   Accepts birthChart data and returns transits with natal aspects.
 *   Used for transit tracking and current sky visualization.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import * as Astronomy from 'astronomy-engine';
import { calculateAsteroidPositionsNBody, type AsteroidPositions } from '@/lib/astrology/asteroidNBody';

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert ecliptic longitude to zodiac sign and degree
function longitudeToZodiac(longitude: number): { sign: string; degree: number } {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30);
  const degree = normalizedLongitude % 30;

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Number(degree.toFixed(2)),
  };
}

interface Transit {
  planet: string;
  sign: string;
  degree: number;
  longitude: number;
  retrograde: boolean;
}

// ============================================================================
// NODE CALCULATIONS
// ============================================================================

/**
 * Calculate True Node (North Node) position
 * The lunar node is the point where Moon's orbit crosses the ecliptic
 */
function calculateTrueNode(time: Astronomy.AstroTime): number {
  // Get Moon's position
  const moonGeo = Astronomy.GeoMoon(time);

  // Simplified calculation using Moon's mean node
  // Mean node regresses ~19.3° per year (retrograde motion)
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const currentMs = time.date.getTime();
  const daysSinceJ2000 = (currentMs - j2000) / (1000 * 60 * 60 * 24);

  // North Node at J2000.0: approximately 125.04° (5° Leo)
  // Mean motion: -0.0529° per day (retrograde)
  const nodeAtEpoch = 125.04;
  const meanMotion = -0.0529;

  let nodeLongitude = nodeAtEpoch + (meanMotion * daysSinceJ2000);
  nodeLongitude = ((nodeLongitude % 360) + 360) % 360;

  return nodeLongitude;
}

// ============================================================================
// ASTEROID CALCULATIONS (Approximate - using mean elements)
// ============================================================================

/**
 * Approximate Chiron position
 * Chiron has an irregular orbit with ~51 year period
 */
function calculateChironApprox(date: Date): number {
  // Chiron was at 3° Taurus (33°) on Nov 1, 1977
  const referenceDate = new Date('1977-11-01').getTime();
  const currentDate = date.getTime();
  const daysSince = (currentDate - referenceDate) / (1000 * 60 * 60 * 24);

  // Chiron's mean motion is approximately 0.0193° per day (360° / 51 years)
  const meanMotion = 360 / (51 * 365.25);
  let longitude = 33 + (meanMotion * daysSince);
  return ((longitude % 360) + 360) % 360;
}

/**
 * Calculate Mean Black Moon Lilith (Mean Lunar Apogee)
 */
function calculateMeanLilith(date: Date): number {
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const currentDate = date.getTime();
  const daysSince = (currentDate - j2000) / (1000 * 60 * 60 * 24);

  // Mean Lilith at J2000.0 epoch: approximately 83.353° (23° Gemini)
  const lilithAtEpoch = 83.353;
  // Mean motion: ~0.111404° per day (completes circle in ~8.85 years)
  const meanMotion = 360 / (8.85 * 365.25);

  let longitude = lilithAtEpoch + (meanMotion * daysSince);
  return ((longitude % 360) + 360) % 360;
}

/**
 * Calculate approximate Ceres position
 * Orbital period: ~4.6 years
 */
function calculateCeresApprox(date: Date): number {
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const currentDate = date.getTime();
  const daysSince = (currentDate - j2000) / (1000 * 60 * 60 * 24);

  // Ceres at J2000.0: approximately 168.8° (18° Virgo)
  const ceresAtEpoch = 168.8;
  const meanMotion = 360 / (4.6 * 365.25);

  let longitude = ceresAtEpoch + (meanMotion * daysSince);
  return ((longitude % 360) + 360) % 360;
}

/**
 * Calculate approximate Pallas position
 * Orbital period: ~4.62 years
 */
function calculatePallasApprox(date: Date): number {
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const currentDate = date.getTime();
  const daysSince = (currentDate - j2000) / (1000 * 60 * 60 * 24);

  // Pallas at J2000.0: approximately 252.8° (12° Sagittarius)
  const pallasAtEpoch = 252.8;
  const meanMotion = 360 / (4.62 * 365.25);

  let longitude = pallasAtEpoch + (meanMotion * daysSince);
  return ((longitude % 360) + 360) % 360;
}

/**
 * Calculate approximate Juno position
 * Orbital period: ~4.36 years
 */
function calculateJunoApprox(date: Date): number {
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const currentDate = date.getTime();
  const daysSince = (currentDate - j2000) / (1000 * 60 * 60 * 24);

  // Juno at J2000.0: approximately 196.4° (16° Libra)
  const junoAtEpoch = 196.4;
  const meanMotion = 360 / (4.36 * 365.25);

  let longitude = junoAtEpoch + (meanMotion * daysSince);
  return ((longitude % 360) + 360) % 360;
}

/**
 * Calculate approximate Vesta position
 * Orbital period: ~3.63 years
 */
function calculateVestaApprox(date: Date): number {
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const currentDate = date.getTime();
  const daysSince = (currentDate - j2000) / (1000 * 60 * 60 * 24);

  // Vesta at J2000.0: approximately 288.5° (18° Capricorn)
  const vestaAtEpoch = 288.5;
  const meanMotion = 360 / (3.63 * 365.25);

  let longitude = vestaAtEpoch + (meanMotion * daysSince);
  return ((longitude % 360) + 360) % 360;
}

// ============================================================================
// MAIN TRANSIT CALCULATION
// ============================================================================

// Calculate all current planetary positions including nodes and asteroids
function calculateTransitPositions(date: Date): Transit[] {
  const transits: Transit[] = [];
  const time = Astronomy.MakeTime(date);

  // Sun - use GeoVector
  try {
    const sunVec = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
    const sunEcl = Astronomy.Ecliptic(sunVec);
    const sunLon = sunEcl.elon;
    const { sign, degree } = longitudeToZodiac(sunLon);
    transits.push({
      planet: 'Sun',
      sign,
      degree,
      longitude: Number(sunLon.toFixed(4)),
      retrograde: false,
    });
  } catch (error) {
    console.error('[Transits] Error calculating Sun:', error);
  }

  // Moon - use EclipticGeoMoon for best accuracy
  try {
    const moonPos = Astronomy.EclipticGeoMoon(time);
    const moonLon = moonPos.lon;
    const { sign, degree } = longitudeToZodiac(moonLon);
    transits.push({
      planet: 'Moon',
      sign,
      degree,
      longitude: Number(moonLon.toFixed(4)),
      retrograde: false,
    });
  } catch (error) {
    console.error('[Transits] Error calculating Moon:', error);
  }

  // Other planets - use GeoVector for geocentric positions
  const planets: Array<{ name: string; body: Astronomy.Body }> = [
    { name: 'Mercury', body: Astronomy.Body.Mercury },
    { name: 'Venus', body: Astronomy.Body.Venus },
    { name: 'Mars', body: Astronomy.Body.Mars },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter },
    { name: 'Saturn', body: Astronomy.Body.Saturn },
    { name: 'Uranus', body: Astronomy.Body.Uranus },
    { name: 'Neptune', body: Astronomy.Body.Neptune },
    { name: 'Pluto', body: Astronomy.Body.Pluto },
  ];

  for (const { name, body } of planets) {
    try {
      const vec = Astronomy.GeoVector(body, time, true);
      const ecl = Astronomy.Ecliptic(vec);
      const longitude = ecl.elon;

      // Check for retrograde by comparing with yesterday
      let retrograde = false;
      try {
        const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
        const timeYesterday = Astronomy.MakeTime(yesterday);
        const vecYesterday = Astronomy.GeoVector(body, timeYesterday, true);
        const eclYesterday = Astronomy.Ecliptic(vecYesterday);

        let diff = longitude - eclYesterday.elon;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        retrograde = diff < 0;
      } catch {
        // Skip retrograde check if it fails
      }

      const { sign, degree } = longitudeToZodiac(longitude);
      transits.push({
        planet: name,
        sign,
        degree,
        longitude: Number(longitude.toFixed(4)),
        retrograde,
      });
    } catch (error) {
      console.error(`[Transits] Error calculating ${name}:`, error);
    }
  }

  // ========================================================================
  // LUNAR NODES
  // ========================================================================
  try {
    const northNodeLon = calculateTrueNode(time);
    const { sign: nnSign, degree: nnDegree } = longitudeToZodiac(northNodeLon);
    transits.push({
      planet: 'North Node',
      sign: nnSign,
      degree: nnDegree,
      longitude: Number(northNodeLon.toFixed(4)),
      retrograde: true, // North Node always moves retrograde
    });

    // South Node is exactly opposite
    const southNodeLon = (northNodeLon + 180) % 360;
    const { sign: snSign, degree: snDegree } = longitudeToZodiac(southNodeLon);
    transits.push({
      planet: 'South Node',
      sign: snSign,
      degree: snDegree,
      longitude: Number(southNodeLon.toFixed(4)),
      retrograde: true,
    });
  } catch (error) {
    console.error('[Transits] Error calculating Nodes:', error);
  }

  // ========================================================================
  // CHIRON + ASTEROIDS — perturbed N-body integration (primary), linear
  // mean-motion stubs below as fallback. See lib/astrology/asteroidNBody.ts.
  // ========================================================================
  let asteroidNBody: AsteroidPositions | null = null;
  try {
    asteroidNBody = calculateAsteroidPositionsNBody(date);
  } catch (error) {
    console.error('[Transits] N-body asteroid path failed; falling back to mean-motion stubs:', error);
  }

  try {
    const chironLon = asteroidNBody?.chiron.longitude ?? calculateChironApprox(date);
    const { sign, degree } = longitudeToZodiac(chironLon);
    transits.push({
      planet: 'Chiron',
      sign,
      degree,
      longitude: Number(chironLon.toFixed(4)),
      retrograde: asteroidNBody?.chiron.retrograde ?? false,
    });
  } catch (error) {
    console.error('[Transits] Error calculating Chiron:', error);
  }

  // ========================================================================
  // ASTEROIDS - Feminine Archetypes
  // ========================================================================

  // Black Moon Lilith
  try {
    const lilithLon = calculateMeanLilith(date);
    const { sign, degree } = longitudeToZodiac(lilithLon);
    transits.push({
      planet: 'Lilith',
      sign,
      degree,
      longitude: Number(lilithLon.toFixed(4)),
      retrograde: false, // Lilith always moves direct
    });
  } catch (error) {
    console.error('[Transits] Error calculating Lilith:', error);
  }

  // Ceres
  try {
    const ceresLon = asteroidNBody?.ceres.longitude ?? calculateCeresApprox(date);
    const { sign, degree } = longitudeToZodiac(ceresLon);
    transits.push({
      planet: 'Ceres',
      sign,
      degree,
      longitude: Number(ceresLon.toFixed(4)),
      retrograde: asteroidNBody?.ceres.retrograde ?? false,
    });
  } catch (error) {
    console.error('[Transits] Error calculating Ceres:', error);
  }

  // Pallas
  try {
    const pallasLon = asteroidNBody?.pallas.longitude ?? calculatePallasApprox(date);
    const { sign, degree } = longitudeToZodiac(pallasLon);
    transits.push({
      planet: 'Pallas',
      sign,
      degree,
      longitude: Number(pallasLon.toFixed(4)),
      retrograde: asteroidNBody?.pallas.retrograde ?? false,
    });
  } catch (error) {
    console.error('[Transits] Error calculating Pallas:', error);
  }

  // Juno
  try {
    const junoLon = asteroidNBody?.juno.longitude ?? calculateJunoApprox(date);
    const { sign, degree } = longitudeToZodiac(junoLon);
    transits.push({
      planet: 'Juno',
      sign,
      degree,
      longitude: Number(junoLon.toFixed(4)),
      retrograde: asteroidNBody?.juno.retrograde ?? false,
    });
  } catch (error) {
    console.error('[Transits] Error calculating Juno:', error);
  }

  // Vesta
  try {
    const vestaLon = asteroidNBody?.vesta.longitude ?? calculateVestaApprox(date);
    const { sign, degree } = longitudeToZodiac(vestaLon);
    transits.push({
      planet: 'Vesta',
      sign,
      degree,
      longitude: Number(vestaLon.toFixed(4)),
      retrograde: asteroidNBody?.vesta.retrograde ?? false,
    });
  } catch (error) {
    console.error('[Transits] Error calculating Vesta:', error);
  }

  return transits;
}

export async function GET() {
  try {
    const now = new Date();
    const transits = calculateTransitPositions(now);

    return NextResponse.json({
      success: true,
      transits,
      data: {
        positions: transits,
      },
      calculatedAt: now.toISOString(),
    });

  } catch (error) {
    console.error('[Transits] Error:', error);

    return NextResponse.json(
      { error: 'Failed to calculate current transits' },
      { status: 500 }
    );
  }
}

// Aspect types and their orbs
const ASPECT_TYPES: Record<string, { angle: number; orb: number }> = {
  conjunction: { angle: 0, orb: 8 },
  opposition: { angle: 180, orb: 8 },
  trine: { angle: 120, orb: 8 },
  square: { angle: 90, orb: 7 },
  sextile: { angle: 60, orb: 6 },
  quincunx: { angle: 150, orb: 3 },
};

interface NatalPlanet {
  sign: string;
  degree: number;
  house?: number;
}

interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  applying: boolean;
}

// Calculate aspects between transit and natal planets
function calculateTransitAspects(
  transits: Transit[],
  birthChart: Record<string, NatalPlanet>
): TransitAspect[] {
  const aspects: TransitAspect[] = [];

  // Convert sign + degree to absolute longitude
  const getAbsoluteLongitude = (planet: NatalPlanet): number => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    if (signIndex === -1) return 0;
    return signIndex * 30 + planet.degree;
  };

  // Check each transit against each natal planet
  for (const transit of transits) {
    for (const [natalName, natalPlanet] of Object.entries(birthChart)) {
      if (!natalPlanet?.sign || !natalPlanet?.degree) continue;

      const transitLon = transit.longitude;
      const natalLon = getAbsoluteLongitude(natalPlanet);

      // Calculate angular difference
      let diff = Math.abs(transitLon - natalLon);
      if (diff > 180) diff = 360 - diff;

      // Check each aspect type
      for (const [aspectName, aspectDef] of Object.entries(ASPECT_TYPES)) {
        const orb = Math.abs(diff - aspectDef.angle);
        if (orb <= aspectDef.orb) {
          // Determine if aspect is applying or separating
          const applying = diff < aspectDef.angle;

          aspects.push({
            transitPlanet: transit.planet,
            natalPlanet: natalName.charAt(0).toUpperCase() + natalName.slice(1),
            aspectType: aspectName,
            orb: Number(orb.toFixed(2)),
            applying,
          });
        }
      }
    }
  }

  // Sort by orb (tighter aspects first)
  return aspects.sort((a, b) => a.orb - b.orb);
}

// POST handler: Calculate transits with natal chart aspects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthChart } = body;

    const now = new Date();
    const transits = calculateTransitPositions(now);

    // Calculate aspects if birth chart was provided
    let aspects: TransitAspect[] = [];
    if (birthChart) {
      aspects = calculateTransitAspects(transits, birthChart);
    }

    return NextResponse.json({
      success: true,
      data: {
        positions: transits,
        aspects,
      },
      transits,
      calculatedAt: now.toISOString(),
    });

  } catch (error) {
    console.error('[Transits POST] Error:', error);

    return NextResponse.json(
      { error: 'Failed to calculate transits' },
      { status: 500 }
    );
  }
}
