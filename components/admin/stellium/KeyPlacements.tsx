"use client";

/**
 * KEY PLACEMENTS
 *
 * Summary of the most important chart points
 * Sun, Moon, Rising, MC, Saturn, North Node
 *
 * Design: Clean, scannable, essential
 */

import React from 'react';
import type { BirthChart } from '@/lib/astrology/ephemerisCalculator';

interface KeyPlacementsProps {
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
};

const SIGN_GLYPHS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

const PLANET_GLYPHS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Ascendant': '↑',
  'Midheaven': 'MC',
  'Saturn': '♄',
  'NorthNode': '☊',
};

interface PlacementRowProps {
  label: string;
  glyph: string;
  sign: string;
  degree: number;
  house?: number;
  color: string;
}

function PlacementRow({ label, glyph, sign, degree, house, color }: PlacementRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <span className="text-lg" style={{ color }}>{glyph}</span>
        <span className="text-sm" style={{ color: colors.muted }}>{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium" style={{ color: colors.starlight }}>
          {SIGN_GLYPHS[sign]} {sign}
        </span>
        <span className="text-xs" style={{ color: colors.dim }}>
          {Math.floor(degree)}°
        </span>
        {house && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{
            backgroundColor: `${colors.stardust}60`,
            color: colors.dim,
          }}>
            H{house}
          </span>
        )}
      </div>
    </div>
  );
}

export function KeyPlacements({ chart }: KeyPlacementsProps) {
  const placements = [
    {
      label: 'Sun',
      glyph: PLANET_GLYPHS.Sun,
      sign: chart.sun.sign,
      degree: chart.sun.degree,
      house: chart.sun.house,
      color: colors.gold,
    },
    {
      label: 'Moon',
      glyph: PLANET_GLYPHS.Moon,
      sign: chart.moon.sign,
      degree: chart.moon.degree,
      house: chart.moon.house,
      color: colors.muted,
    },
    {
      label: 'Rising',
      glyph: PLANET_GLYPHS.Ascendant,
      sign: chart.ascendant.sign,
      degree: chart.ascendant.degree,
      color: colors.celestialBlue,
    },
    {
      label: 'Midheaven',
      glyph: PLANET_GLYPHS.Midheaven,
      sign: chart.midheaven.sign,
      degree: chart.midheaven.degree,
      color: colors.violet,
    },
    {
      label: 'Saturn',
      glyph: PLANET_GLYPHS.Saturn,
      sign: chart.saturn.sign,
      degree: chart.saturn.degree,
      house: chart.saturn.house,
      color: colors.dim,
    },
    {
      label: 'North Node',
      glyph: PLANET_GLYPHS.NorthNode,
      sign: chart.northNode.sign,
      degree: chart.northNode.degree,
      house: chart.northNode.house,
      color: colors.violet,
    },
  ];

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: `${colors.nebula}50`,
        border: `1px solid ${colors.stardust}`,
      }}
    >
      <h3 className="text-sm font-medium mb-3" style={{ color: colors.muted }}>
        Key Placements
      </h3>
      <div className="divide-y" style={{ borderColor: `${colors.stardust}60` }}>
        {placements.map(placement => (
          <PlacementRow key={placement.label} {...placement} />
        ))}
      </div>
    </div>
  );
}

export default KeyPlacements;
