/**
 * ASTROLOGY SERVICE - Data persistence layer
 *
 * Single source of truth for member birth data + computed charts.
 * /astrology is the canonical editor. MAIA + Journey read from here.
 */

import { query, queryOne } from '@/lib/db/postgres';
import { calculateBirthChart, BirthChart, BirthData } from './ephemerisCalculator';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MemberBirthData {
  memberId: string;
  birthDate: string;
  birthTime: string | null;
  birthLocationName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  houseSystem: string;
  consentAstrology: boolean;
}

export interface AstrologyContext {
  hasChart: boolean;
  consentGiven: boolean;
  bigThree?: {
    sun: { sign: string; house: number };
    moon: { sign: string; house: number };
    rising: string;
  };
  elements?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Birth Data CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function saveBirthData(data: MemberBirthData): Promise<void> {
  await query(`
    INSERT INTO member_birth_data
      (member_id, birth_date, birth_time, birth_location_name, latitude, longitude, timezone, house_system, consent_astrology)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (member_id) DO UPDATE SET
      birth_date = $2,
      birth_time = $3,
      birth_location_name = $4,
      latitude = $5,
      longitude = $6,
      timezone = $7,
      house_system = $8,
      consent_astrology = $9,
      updated_at = NOW()
  `, [
    data.memberId,
    data.birthDate,
    data.birthTime,
    data.birthLocationName,
    data.latitude,
    data.longitude,
    data.timezone,
    data.houseSystem || 'placidus',
    data.consentAstrology ?? true
  ]);

  // Invalidate cached chart when birth data changes
  await query(`DELETE FROM member_natal_chart WHERE member_id = $1`, [data.memberId]);
}

export async function getBirthData(memberId: string): Promise<MemberBirthData | null> {
  const row = await queryOne<any>(`
    SELECT * FROM member_birth_data WHERE member_id = $1
  `, [memberId]);

  if (!row) return null;

  return {
    memberId: row.member_id,
    birthDate: row.birth_date instanceof Date
      ? row.birth_date.toISOString().split('T')[0]
      : row.birth_date,
    birthTime: row.birth_time,
    birthLocationName: row.birth_location_name,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    timezone: row.timezone,
    houseSystem: row.house_system || 'placidus',
    consentAstrology: row.consent_astrology,
  };
}

export async function deleteBirthData(memberId: string): Promise<void> {
  await query(`DELETE FROM member_birth_data WHERE member_id = $1`, [memberId]);
  await query(`DELETE FROM member_natal_chart WHERE member_id = $1`, [memberId]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Natal Chart (compute + cache)
// ─────────────────────────────────────────────────────────────────────────────

export async function getNatalChart(memberId: string): Promise<BirthChart | null> {
  // Get birth data first
  const birthData = await getBirthData(memberId);
  if (!birthData) return null;

  const houseSystem = birthData.houseSystem || 'placidus';

  // Check cache
  const cached = await queryOne<any>(`
    SELECT chart_json FROM member_natal_chart
    WHERE member_id = $1 AND house_system = $2
  `, [memberId, houseSystem]);

  if (cached) {
    return cached.chart_json as BirthChart;
  }

  // Compute and cache
  return computeAndCacheChart(memberId, birthData);
}

export async function computeAndCacheChart(
  memberId: string,
  birthData: MemberBirthData
): Promise<BirthChart> {
  const input: BirthData = {
    date: birthData.birthDate,
    time: birthData.birthTime || '12:00', // noon if unknown
    location: {
      lat: birthData.latitude,
      lng: birthData.longitude,
      timezone: birthData.timezone,
    },
    houseSystem: (birthData.houseSystem || 'placidus') as any,
  };

  const chart = await calculateBirthChart(input);

  // Cache it
  await query(`
    INSERT INTO member_natal_chart (member_id, house_system, chart_json)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, house_system) DO UPDATE SET
      chart_json = $3,
      computed_at = NOW()
  `, [memberId, birthData.houseSystem || 'placidus', JSON.stringify(chart)]);

  return chart;
}

// ─────────────────────────────────────────────────────────────────────────────
// Astrology Context (for MAIA + Journey)
// ─────────────────────────────────────────────────────────────────────────────

export async function getAstrologyContext(memberId: string): Promise<AstrologyContext> {
  const birthData = await getBirthData(memberId);

  if (!birthData) {
    return { hasChart: false, consentGiven: false };
  }

  if (!birthData.consentAstrology) {
    return { hasChart: true, consentGiven: false };
  }

  const chart = await getNatalChart(memberId);
  if (!chart) {
    return { hasChart: false, consentGiven: true };
  }

  // Calculate elemental balance
  const elements = calculateElementalBalance(chart);

  return {
    hasChart: true,
    consentGiven: true,
    bigThree: {
      sun: { sign: chart.sun.sign, house: chart.sun.house },
      moon: { sign: chart.moon.sign, house: chart.moon.house },
      rising: chart.ascendant.sign,
    },
    elements,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ELEMENT_MAP: Record<string, 'fire' | 'water' | 'earth' | 'air'> = {
  'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
  'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water',
  'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
  'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
};

function calculateElementalBalance(chart: BirthChart): { fire: number; water: number; earth: number; air: number } {
  const counts = { fire: 0, water: 0, earth: 0, air: 0 };

  // Count personal planets + angles
  const positions = [
    chart.sun, chart.moon, chart.mercury, chart.venus, chart.mars,
    { sign: chart.ascendant.sign },
  ];

  for (const pos of positions) {
    if (pos?.sign) {
      const element = ELEMENT_MAP[pos.sign];
      if (element) counts[element]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return {
    fire: Math.round((counts.fire / total) * 100) / 100,
    water: Math.round((counts.water / total) * 100) / 100,
    earth: Math.round((counts.earth / total) * 100) / 100,
    air: Math.round((counts.air / total) * 100) / 100,
  };
}
