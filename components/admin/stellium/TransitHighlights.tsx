"use client";

/**
 * TRANSIT HIGHLIGHTS
 *
 * Shows key current transits affecting a client's natal chart
 * Designed for quick session prep reference
 *
 * Design: Weather metaphor, not prescription
 */

import React, { useState, useEffect } from 'react';
import { Cloud, AlertCircle, RefreshCw } from 'lucide-react';

interface TransitHighlightsProps {
  clientId: string;
  practitionerId: string;
}

interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  applying: boolean;
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
};

const ASPECT_GLYPHS: Record<string, string> = {
  'conjunction': '☌',
  'opposition': '☍',
  'trine': '△',
  'square': '□',
  'sextile': '✱',
  'quincunx': '⚻',
};

const PLANET_GLYPHS: Record<string, string> = {
  'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
  'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
};

// Intensity based on transit planet
function getTransitIntensity(planet: string): 'gentle' | 'moderate' | 'strong' {
  const strongPlanets = ['Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const gentlePlanets = ['Sun', 'Moon', 'Mercury', 'Venus'];

  if (strongPlanets.includes(planet)) return 'strong';
  if (gentlePlanets.includes(planet)) return 'gentle';
  return 'moderate';
}

// Brief interpretation hint (weather metaphor)
function getWeatherHint(transit: string, aspect: string): string {
  const hints: Record<string, Record<string, string>> = {
    Saturn: {
      conjunction: 'Testing period - structure being rebuilt',
      opposition: 'Facing consequences - integration needed',
      square: 'Pressure building - adjustments required',
      trine: 'Stabilizing - disciplined growth',
    },
    Uranus: {
      conjunction: 'Awakening - expect the unexpected',
      opposition: 'Liberation tension - old vs new',
      square: 'Disruption - breakthrough possible',
      trine: 'Innovation flowing - embrace change',
    },
    Neptune: {
      conjunction: 'Dissolution - boundaries softening',
      opposition: 'Confusion possible - seek clarity',
      square: 'Fog - discernment needed',
      trine: 'Inspiration - spiritual opening',
    },
    Pluto: {
      conjunction: 'Deep transformation - surrender required',
      opposition: 'Power dynamics - shadow emerging',
      square: 'Intensity - resistance being met',
      trine: 'Empowerment - regeneration',
    },
  };

  return hints[transit]?.[aspect] || 'Active transit - observe effects';
}

export function TransitHighlights({ clientId, practitionerId }: TransitHighlightsProps) {
  const [transits, setTransits] = useState<TransitAspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransits();
  }, [clientId, practitionerId]);

  const fetchTransits = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/stellium/chart/${clientId}?practitionerId=${practitionerId}&includeTransits=true`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();

      if (data.transits?.aspects) {
        // Filter to significant transits (tight orb, outer planets)
        const significant = data.transits.aspects.filter((t: TransitAspect) => {
          const isOuter = ['Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(t.transitPlanet);
          const isTight = t.orb <= 3;
          return isOuter && isTight;
        });
        setTransits(significant);
      }
    } catch (err) {
      setError('Could not load transits');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-xl p-5 animate-pulse"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <div className="h-4 w-32 rounded mb-4" style={{ backgroundColor: `${colors.stardust}80` }} />
        <div className="space-y-3">
          <div className="h-12 rounded" style={{ backgroundColor: `${colors.stardust}60` }} />
          <div className="h-12 rounded" style={{ backgroundColor: `${colors.stardust}60` }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
            Active Transits
          </h3>
          <button
            onClick={fetchTransits}
            className="p-1 rounded hover:bg-white/5"
            style={{ color: colors.dim }}
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        <p className="text-xs" style={{ color: colors.dim }}>{error}</p>
      </div>
    );
  }

  if (transits.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <h3 className="text-sm font-medium mb-3" style={{ color: colors.muted }}>
          Active Transits
        </h3>
        <div className="flex items-center space-x-2">
          <Cloud className="w-4 h-4" style={{ color: colors.dim }} />
          <p className="text-xs" style={{ color: colors.dim }}>
            No major outer planet transits in tight orb
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
          Active Transits
        </h3>
        <Cloud className="w-4 h-4" style={{ color: colors.celestialBlue }} />
      </div>

      <div className="space-y-3">
        {transits.slice(0, 5).map((transit, i) => {
          const intensity = getTransitIntensity(transit.transitPlanet);
          const hint = getWeatherHint(transit.transitPlanet, transit.aspectType);

          return (
            <div
              key={i}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: `${colors.stardust}40`,
                borderLeft: `3px solid ${
                  intensity === 'strong' ? colors.fire :
                  intensity === 'moderate' ? colors.gold :
                  colors.celestialBlue
                }`,
              }}
            >
              {/* Transit header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span style={{ color: colors.gold }}>
                    {PLANET_GLYPHS[transit.transitPlanet]}
                  </span>
                  <span style={{ color: colors.muted }}>
                    {ASPECT_GLYPHS[transit.aspectType]}
                  </span>
                  <span style={{ color: colors.starlight }}>
                    {PLANET_GLYPHS[transit.natalPlanet]}
                  </span>
                  <span className="text-xs" style={{ color: colors.dim }}>
                    natal
                  </span>
                </div>
                <span className="text-xs" style={{ color: colors.dim }}>
                  {transit.orb.toFixed(1)}°
                  {transit.applying && ' →'}
                </span>
              </div>

              {/* Weather hint */}
              <p className="text-xs" style={{ color: colors.dim }}>
                {hint}
              </p>
            </div>
          );
        })}
      </div>

      {transits.length > 5 && (
        <p className="text-xs mt-3 text-center" style={{ color: colors.dim }}>
          + {transits.length - 5} more transits
        </p>
      )}
    </div>
  );
}

export default TransitHighlights;
