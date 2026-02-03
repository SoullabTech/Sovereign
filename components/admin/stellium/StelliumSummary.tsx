"use client";

/**
 * STELLIUM SUMMARY
 *
 * Element/modality balance and stellium detection
 * Shows dominant patterns in the chart
 *
 * Design: Visual balance indicators, not judgments
 */

import React, { useMemo } from 'react';
import type { BirthChart } from '@/lib/astrology/ephemerisCalculator';

interface StelliumSummaryProps {
  chart: BirthChart;
}

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  celestialBlue: '#79c0ff',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  fire: '#FF6B6B',
  earth: '#8BC34A',
  air: '#64B5F6',
  water: '#26C6DA',
};

// Sign to element mapping
const SIGN_ELEMENTS: Record<string, string> = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
};

// Sign to modality mapping
const SIGN_MODALITIES: Record<string, string> = {
  'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
  'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
  'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: colors.fire,
  Earth: colors.earth,
  Air: colors.air,
  Water: colors.water,
};

interface BalanceBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function BalanceBar({ label, count, total, color }: BalanceBarProps) {
  const percentage = (count / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: colors.muted }}>{label}</span>
        <span className="text-xs" style={{ color: colors.dim }}>{count}</span>
      </div>
      <div
        className="h-1.5 rounded-full"
        style={{ backgroundColor: `${colors.stardust}60` }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export function StelliumSummary({ chart }: StelliumSummaryProps) {
  // Extract planets for analysis
  const planetNames = [
    'sun', 'moon', 'mercury', 'venus', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
  ];

  const analysis = useMemo(() => {
    // Count elements
    const elements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    // Count modalities
    const modalities: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
    // Count by sign
    const signCounts: Record<string, number> = {};
    // Count by house
    const houseCounts: Record<number, number> = {};

    planetNames.forEach(name => {
      const planet = chart[name as keyof BirthChart] as any;
      if (planet?.sign) {
        // Element
        const element = SIGN_ELEMENTS[planet.sign];
        if (element) elements[element]++;

        // Modality
        const modality = SIGN_MODALITIES[planet.sign];
        if (modality) modalities[modality]++;

        // Sign count for stellium detection
        signCounts[planet.sign] = (signCounts[planet.sign] || 0) + 1;

        // House count for stellium detection
        if (planet.house) {
          houseCounts[planet.house] = (houseCounts[planet.house] || 0) + 1;
        }
      }
    });

    // Find stelliums (3+ planets in same sign or house)
    const signStelliums = Object.entries(signCounts)
      .filter(([_, count]) => count >= 3)
      .map(([sign, count]) => ({ sign, count }));

    const houseStelliums = Object.entries(houseCounts)
      .filter(([_, count]) => count >= 3)
      .map(([house, count]) => ({ house: parseInt(house), count }));

    // Find dominant element and modality
    const dominantElement = Object.entries(elements)
      .sort((a, b) => b[1] - a[1])[0];
    const dominantModality = Object.entries(modalities)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      elements,
      modalities,
      signStelliums,
      houseStelliums,
      dominantElement,
      dominantModality,
      totalPlanets: planetNames.length,
    };
  }, [chart]);

  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{
        backgroundColor: `${colors.nebula}50`,
        border: `1px solid ${colors.stardust}`,
      }}
    >
      <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
        Chart Balance
      </h3>

      {/* Stelliums */}
      {(analysis.signStelliums.length > 0 || analysis.houseStelliums.length > 0) && (
        <div className="space-y-2">
          {analysis.signStelliums.map(({ sign, count }) => (
            <div
              key={sign}
              className="flex items-center space-x-2 px-2 py-1.5 rounded-lg"
              style={{
                backgroundColor: `${ELEMENT_COLORS[SIGN_ELEMENTS[sign]]}20`,
                border: `1px solid ${ELEMENT_COLORS[SIGN_ELEMENTS[sign]]}40`,
              }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: ELEMENT_COLORS[SIGN_ELEMENTS[sign]] }}
              >
                Stellium
              </span>
              <span className="text-xs" style={{ color: colors.starlight }}>
                {count} planets in {sign}
              </span>
            </div>
          ))}
          {analysis.houseStelliums.map(({ house, count }) => (
            <div
              key={house}
              className="flex items-center space-x-2 px-2 py-1.5 rounded-lg"
              style={{
                backgroundColor: `${colors.violet}20`,
                border: `1px solid ${colors.violet}40`,
              }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: colors.violet }}
              >
                Stellium
              </span>
              <span className="text-xs" style={{ color: colors.starlight }}>
                {count} planets in House {house}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Element Balance */}
      <div className="space-y-2">
        <p className="text-xs" style={{ color: colors.dim }}>Elements</p>
        {Object.entries(analysis.elements).map(([element, count]) => (
          <BalanceBar
            key={element}
            label={element}
            count={count}
            total={analysis.totalPlanets}
            color={ELEMENT_COLORS[element]}
          />
        ))}
      </div>

      {/* Modality Balance */}
      <div className="space-y-2">
        <p className="text-xs" style={{ color: colors.dim }}>Modality</p>
        {Object.entries(analysis.modalities).map(([modality, count]) => (
          <BalanceBar
            key={modality}
            label={modality}
            count={count}
            total={analysis.totalPlanets}
            color={
              modality === 'Cardinal' ? colors.fire :
              modality === 'Fixed' ? colors.earth :
              colors.air
            }
          />
        ))}
      </div>

      {/* Dominant Pattern */}
      <div
        className="pt-3 border-t text-center"
        style={{ borderColor: `${colors.stardust}60` }}
      >
        <p className="text-xs" style={{ color: colors.dim }}>Dominant Pattern</p>
        <p className="text-sm mt-1" style={{ color: colors.starlight }}>
          <span style={{ color: ELEMENT_COLORS[analysis.dominantElement[0]] }}>
            {analysis.dominantElement[0]}
          </span>
          {' · '}
          <span style={{ color: colors.muted }}>
            {analysis.dominantModality[0]}
          </span>
        </p>
      </div>
    </div>
  );
}

export default StelliumSummary;
