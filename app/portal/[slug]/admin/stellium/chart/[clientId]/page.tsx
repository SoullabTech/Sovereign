"use client";

/**
 * CHART VIEW PAGE
 *
 * Full natal chart view with transit overlay for a client
 * The heart of chart work - quiet, focused, deep
 *
 * Design Philosophy:
 * - The chart is the teacher, not the practitioner
 * - Transits as weather, not fate
 * - Space for noticing, not rushing
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Cloud,
  Eye,
  EyeOff,
  FileText,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import { SacredHouseWheel } from '@/components/astrology/SacredHouseWheel';
import { KeyPlacements } from '@/components/admin/stellium/KeyPlacements';
import { AspectsList } from '@/components/admin/stellium/AspectsList';
import { StelliumSummary } from '@/components/admin/stellium/StelliumSummary';
import type { PractitionerClient } from '@/lib/stellium/types';
import type { BirthChart, Aspect } from '@/lib/astrology/ephemerisCalculator';

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

interface TransitPosition {
  planet: string;
  sign: string;
  degree: number;
  longitude: number;
}

interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  applying: boolean;
}

interface ChartData {
  client: PractitionerClient;
  chart: BirthChart | null;
  birthTimeKnown: boolean;
  transits?: {
    date: string;
    positions: TransitPosition[];
    aspects: TransitAspect[];
  };
}

export default function ChartViewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const clientId = params?.clientId as string;
  const basePath = `/portal/${slug}/admin/stellium`;

  const { practitionerId, isLoading: authLoading } = usePractitionerAuth();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View toggles
  const [showTransits, setShowTransits] = useState(true);
  const [showAspects, setShowAspects] = useState(true);
  const [aspectOrbLimit, setAspectOrbLimit] = useState(3); // Degrees

  useEffect(() => {
    if (authLoading) return;
    if (!practitionerId) {
      setError('Please sign in to access charts');
      setLoading(false);
      return;
    }
    fetchChart();
  }, [practitionerId, clientId, authLoading]);

  const fetchChart = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/stellium/chart/${clientId}?practitionerId=${practitionerId}&includeTransits=true`
      );
      if (!response.ok) throw new Error('Failed to fetch chart');
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error('[ChartView] Error:', err);
      setError('Failed to load chart');
    } finally {
      setLoading(false);
    }
  };

  // Convert chart data to SacredHouseWheel format
  const convertToWheelPlanets = (chart: BirthChart) => {
    const planetNames = [
      'sun', 'moon', 'mercury', 'venus', 'mars',
      'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
    ];

    return planetNames.map(name => {
      const planet = chart[name as keyof BirthChart] as any;
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        sign: planet.sign,
        house: planet.house,
        degree: planet.degree,
      };
    });
  };

  // Convert natal aspects to wheel format
  const convertToWheelAspects = (aspects: Aspect[]) => {
    return aspects.map(aspect => ({
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      type: aspect.type as 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition',
      orb: aspect.orb,
    }));
  };

  // Convert transits to wheel format
  const convertToWheelTransits = (transits: TransitPosition[]) => {
    return transits.map(t => ({
      planet: t.planet,
      sign: t.sign,
      degree: t.degree,
      longitude: t.longitude,
    }));
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-48 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 aspect-square rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
          <div className="space-y-4">
            <div className="h-48 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
            <div className="h-48 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: colors.dim }} />
        <p style={{ color: colors.muted }}>{error}</p>
        <button
          onClick={fetchChart}
          className="mt-4 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: colors.celestialBlue, color: colors.void }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No chart data
  if (!chartData?.chart) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`${basePath}/clients`)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: colors.muted }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-medium" style={{ color: colors.starlight }}>
              {chartData?.client?.preferred_name || chartData?.client?.name || 'Client'}
            </h1>
          </div>
        </div>

        {/* No birth data message */}
        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: `${colors.nebula}30`,
            border: `1px solid ${colors.stardust}`,
          }}
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
          <p className="text-lg mb-2" style={{ color: colors.muted }}>
            No birth data available
          </p>
          <p className="text-sm mb-6" style={{ color: colors.dim }}>
            Add birth information to generate a natal chart
          </p>
          <button
            onClick={() => router.push(`${basePath}/clients/${clientId}/edit`)}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: colors.celestialBlue, color: colors.void }}
          >
            Add Birth Data
          </button>
        </div>
      </div>
    );
  }

  const { client, chart, birthTimeKnown, transits } = chartData;
  const displayName = client.preferred_name || client.name;

  // Filter aspects by orb limit
  const filteredAspects = chart.aspects.filter(a => a.orb <= aspectOrbLimit);
  const filteredTransitAspects = transits?.aspects.filter(a => a.orb <= aspectOrbLimit) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`${basePath}/clients`)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: colors.muted }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-medium" style={{ color: colors.starlight }}>
              {displayName}
            </h1>
            {!birthTimeKnown && (
              <p className="text-xs mt-0.5" style={{ color: colors.dim }}>
                Birth time unknown - houses approximate
              </p>
            )}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTransits(!showTransits)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: showTransits ? `${colors.celestialBlue}20` : `${colors.stardust}60`,
              color: showTransits ? colors.celestialBlue : colors.muted,
              border: `1px solid ${showTransits ? colors.celestialBlue : 'transparent'}`,
            }}
          >
            <Cloud className="w-4 h-4" />
            <span>Transits</span>
          </button>

          <button
            onClick={() => setShowAspects(!showAspects)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: showAspects ? `${colors.violet}20` : `${colors.stardust}60`,
              color: showAspects ? colors.violet : colors.muted,
              border: `1px solid ${showAspects ? colors.violet : 'transparent'}`,
            }}
          >
            {showAspects ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>Aspects</span>
          </button>

          <button
            onClick={() => router.push(`${basePath}/session/new?clientId=${clientId}`)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: colors.celestialBlue,
              color: colors.void,
            }}
          >
            <FileText className="w-4 h-4" />
            <span>Session Prep</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Wheel - Takes 2 columns */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-4 aspect-square"
            style={{
              backgroundColor: `${colors.nebula}30`,
              border: `1px solid ${colors.stardust}`,
            }}
          >
            <SacredHouseWheel
              planets={convertToWheelPlanets(chart)}
              aspects={showAspects ? convertToWheelAspects(filteredAspects) : []}
              transits={showTransits && transits ? convertToWheelTransits(transits.positions) : undefined}
              transitAspects={showTransits && transits ? filteredTransitAspects.map(a => ({
                transitPlanet: a.transitPlanet,
                natalPlanet: a.natalPlanet,
                aspectType: a.aspectType as any,
                orb: a.orb,
                applying: a.applying,
              })) : undefined}
              showAspects={showAspects}
              layoutMode="traditional"
              isDayMode={false}
            />
          </motion.div>
        </div>

        {/* Sidebar - Analysis Panels */}
        <div className="space-y-6">
          {/* Key Placements */}
          <KeyPlacements chart={chart} />

          {/* Stellium Summary */}
          <StelliumSummary chart={chart} />

          {/* Orb Control */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: `${colors.nebula}50`,
              border: `1px solid ${colors.stardust}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: colors.muted }}>
                Aspect Orb
              </span>
              <span className="text-sm font-medium" style={{ color: colors.starlight }}>
                ≤ {aspectOrbLimit}°
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={aspectOrbLimit}
              onChange={(e) => setAspectOrbLimit(parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: colors.celestialBlue }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: colors.dim }}>
              <span>Tight</span>
              <span>Wide</span>
            </div>
          </div>

          {/* Natal Aspects */}
          <AspectsList
            aspects={filteredAspects}
            title="Natal Aspects"
          />

          {/* Transit Aspects */}
          {showTransits && transits && filteredTransitAspects.length > 0 && (
            <AspectsList
              aspects={filteredTransitAspects.map(a => ({
                planet1: `${a.transitPlanet} ℞`,
                planet2: a.natalPlanet,
                type: a.aspectType as any,
                orb: a.orb,
                exact: a.orb < 1,
              }))}
              title="Active Transits"
              isTransit
            />
          )}
        </div>
      </div>
    </div>
  );
}
