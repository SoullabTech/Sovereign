"use client";

/**
 * COSMIC WEATHER WIDGET
 *
 * Shows current sky positions for the Stellium Pro dashboard
 * A gentle reminder of the archetypal weather affecting all sessions today
 *
 * Design: Compact, informative, not overwhelming
 * Updates on mount (no real-time polling needed for positions)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, RotateCcw, RefreshCw } from 'lucide-react';

interface PlanetPosition {
  planet: string;
  glyph: string;
  sign: string;
  signGlyph: string;
  degree: number;
}

interface MoonPhase {
  phase: string;
  illumination: number;
  emoji: string;
}

interface KeyAspect {
  planet1: string;
  glyph1: string;
  aspect: string;
  aspectGlyph: string;
  planet2: string;
  glyph2: string;
  orb: number;
}

interface CosmicWeatherData {
  timestamp: string;
  planets: PlanetPosition[];
  moonPhase: MoonPhase;
  retrogrades: string[];
  keyAspects: KeyAspect[];
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

// Dev bypass check - works on both server and client
const isDev = process.env.NODE_ENV === 'development' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// Mock data for local development
const DEV_MOCK_WEATHER: CosmicWeatherData = {
  timestamp: new Date().toISOString(),
  planets: [
    { planet: 'Sun', glyph: '☉', sign: 'Aquarius', signGlyph: '♒', degree: 3.5 },
    { planet: 'Moon', glyph: '☽', sign: 'Libra', signGlyph: '♎', degree: 17.2 },
    { planet: 'Mercury', glyph: '☿', sign: 'Capricorn', signGlyph: '♑', degree: 28.1 },
    { planet: 'Venus', glyph: '♀', sign: 'Pisces', signGlyph: '♓', degree: 5.8 },
    { planet: 'Mars', glyph: '♂', sign: 'Cancer', signGlyph: '♋', degree: 12.4 },
  ],
  moonPhase: { phase: 'Waning Crescent', illumination: 0.23, emoji: '🌘' },
  retrogrades: ['Mars'],
  keyAspects: [
    { planet1: 'Sun', glyph1: '☉', aspect: 'square', aspectGlyph: '□', planet2: 'Mars', glyph2: '♂', orb: 1.2 },
    { planet1: 'Venus', glyph1: '♀', aspect: 'trine', aspectGlyph: '△', planet2: 'Jupiter', glyph2: '♃', orb: 2.5 },
  ],
};

export function CosmicWeatherWidget() {
  const [weather, setWeather] = useState<CosmicWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stellium/cosmic-weather');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setWeather(data);
      setError(null);
    } catch (err) {
      console.error('[CosmicWeather] Error:', err);
      // Dev bypass: use mock data when API unavailable
      if (isDev) {
        console.log('[CosmicWeather] Using mock data for development');
        setWeather(DEV_MOCK_WEATHER);
        setError(null);
      } else {
        setError('Could not load cosmic weather');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-xl p-6 animate-pulse"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <div className="h-4 w-32 rounded mb-4" style={{ backgroundColor: `${colors.stardust}80` }} />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-8 rounded" style={{ backgroundColor: `${colors.stardust}60` }} />
          <div className="h-8 rounded" style={{ backgroundColor: `${colors.stardust}60` }} />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <Moon className="w-8 h-8 mx-auto mb-2" style={{ color: colors.dim }} />
        <p className="text-sm" style={{ color: colors.muted }}>
          {error || 'Unable to load cosmic weather'}
        </p>
        <button
          onClick={fetchWeather}
          className="mt-2 text-xs flex items-center space-x-1 mx-auto"
          style={{ color: colors.celestialBlue }}
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Key planets to show (Sun, Moon, Mercury, Venus, Mars)
  const keyPlanets = weather.planets.filter(p =>
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(p.planet)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5"
      style={{
        backgroundColor: `${colors.nebula}50`,
        border: `1px solid ${colors.stardust}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
          Current Sky
        </h3>
        <div className="flex items-center space-x-2">
          {weather.moonPhase && (
            <span className="text-lg" title={weather.moonPhase.phase}>
              {weather.moonPhase.emoji}
            </span>
          )}
        </div>
      </div>

      {/* Key Planets */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-3">
          {keyPlanets.map(planet => (
            <div
              key={planet.planet}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: `${colors.stardust}60` }}
            >
              <span className="text-base" style={{ color: colors.gold }}>
                {planet.glyph}
              </span>
              <span className="text-sm" style={{ color: colors.starlight }}>
                {planet.signGlyph}
              </span>
              <span className="text-xs" style={{ color: colors.dim }}>
                {Math.floor(planet.degree)}°
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Retrogrades */}
      {weather.retrogrades.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-3 h-3" style={{ color: colors.violet }} />
            <span className="text-xs" style={{ color: colors.violet }}>
              {weather.retrogrades.join(', ')} ℞
            </span>
          </div>
        </div>
      )}

      {/* Key Aspects */}
      {weather.keyAspects.length > 0 && (
        <div className="pt-3 border-t" style={{ borderColor: `${colors.stardust}80` }}>
          <p className="text-xs mb-2" style={{ color: colors.dim }}>
            Key Aspects
          </p>
          <div className="flex flex-wrap gap-2">
            {weather.keyAspects.slice(0, 3).map((aspect, i) => (
              <div
                key={i}
                className="flex items-center space-x-1 text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: `${colors.stardust}40`,
                  color: colors.muted,
                }}
              >
                <span>{aspect.glyph1}</span>
                <span style={{ color: colors.celestialBlue }}>{aspect.aspectGlyph}</span>
                <span>{aspect.glyph2}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default CosmicWeatherWidget;
