"use client";

/**
 * ASPECTS LIST
 *
 * Scrollable list of aspects with orbs
 * Works for both natal aspects and transit aspects
 *
 * Design: Compact, scannable, orb-aware
 */

import React from 'react';

interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  orb: number;
  exact?: boolean;
}

interface AspectsListProps {
  aspects: Aspect[];
  title: string;
  isTransit?: boolean;
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

const ASPECT_GLYPHS: Record<string, string> = {
  'conjunction': '☌',
  'opposition': '☍',
  'trine': '△',
  'square': '□',
  'sextile': '✱',
  'quincunx': '⚻',
};

const ASPECT_COLORS: Record<string, string> = {
  'conjunction': colors.gold,
  'opposition': colors.fire,
  'trine': colors.air,
  'square': colors.fire,
  'sextile': colors.earth,
  'quincunx': colors.violet,
};

const PLANET_GLYPHS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'Chiron': '⚷',
  'NorthNode': '☊',
  'SouthNode': '☋',
};

function getPlanetGlyph(name: string): string {
  // Handle transit notation like "Sun ℞"
  const baseName = name.replace(' ℞', '');
  return PLANET_GLYPHS[baseName] || name[0];
}

export function AspectsList({ aspects, title, isTransit = false }: AspectsListProps) {
  if (aspects.length === 0) {
    return null;
  }

  // Sort by orb (tightest first)
  const sortedAspects = [...aspects].sort((a, b) => a.orb - b.orb);

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: `${colors.nebula}50`,
        border: `1px solid ${isTransit ? colors.celestialBlue : colors.stardust}40`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
          {title}
        </h3>
        <span className="text-xs" style={{ color: colors.dim }}>
          {aspects.length} aspect{aspects.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
        {sortedAspects.map((aspect, index) => {
          const aspectColor = ASPECT_COLORS[aspect.type] || colors.muted;
          const isTight = aspect.orb < 1;

          return (
            <div
              key={`${aspect.planet1}-${aspect.planet2}-${aspect.type}-${index}`}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors hover:bg-white/5"
            >
              {/* Planets and aspect */}
              <div className="flex items-center space-x-1.5">
                <span
                  className="text-sm"
                  style={{ color: colors.starlight }}
                  title={aspect.planet1}
                >
                  {getPlanetGlyph(aspect.planet1)}
                </span>
                <span
                  className={`text-base ${isTight ? 'font-bold' : ''}`}
                  style={{ color: aspectColor }}
                  title={aspect.type}
                >
                  {ASPECT_GLYPHS[aspect.type]}
                </span>
                <span
                  className="text-sm"
                  style={{ color: colors.starlight }}
                  title={aspect.planet2}
                >
                  {getPlanetGlyph(aspect.planet2)}
                </span>
              </div>

              {/* Orb */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs ${isTight ? 'font-medium' : ''}`}
                  style={{
                    color: isTight ? colors.gold : colors.dim,
                  }}
                >
                  {aspect.orb.toFixed(1)}°
                </span>
                {isTight && (
                  <span
                    className="text-xs px-1 py-0.5 rounded"
                    style={{
                      backgroundColor: `${colors.gold}20`,
                      color: colors.gold,
                    }}
                  >
                    exact
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t flex flex-wrap gap-2" style={{ borderColor: `${colors.stardust}60` }}>
        {Object.entries(ASPECT_GLYPHS).slice(0, 4).map(([type, glyph]) => (
          <span
            key={type}
            className="text-xs flex items-center space-x-1"
            style={{ color: colors.dim }}
          >
            <span style={{ color: ASPECT_COLORS[type] }}>{glyph}</span>
            <span className="capitalize">{type.slice(0, 4)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default AspectsList;
