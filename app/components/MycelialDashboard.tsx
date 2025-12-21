'use client';

/**
 * MYCELIAL DASHBOARD — GROWTH RINGS VISUALIZATION
 * Phase 4.5: Mycelial Memory Engine
 *
 * Purpose:
 * - Visualize mycelial cycles as temporal growth rings
 * - Color-coded by dominant element (Fire, Water, Earth, Air, Aether)
 * - Ring thickness proportional to coherence score
 * - Hover tooltips show cycle details (facets, arousal, valence)
 *
 * Architecture:
 * - Fetches from /api/memory/cycles
 * - Renders SVG concentric rings (newest = outermost)
 * - Responsive design with dark mode support
 */

import { useEffect, useState } from 'react';
import type { FacetCode } from '../../lib/consciousness/spiralogic-facet-mapping';

// ============================================================================
// TYPES
// ============================================================================

interface MycelialCycle {
  cycleId: string;
  startTs: string;
  endTs: string;
  dominantFacets: FacetCode[];
  coherenceScore: number;
  meanArousal?: number;
  meanValence?: number;
  meanHrv?: number;
  meanEegAlpha?: number;
  totalTraces: number;
  totalBiomarkerSamples: number;
}

interface GrowthRing {
  cycleId: string;
  date: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether' | 'Mixed';
  dominantFacets: FacetCode[];
  coherence: number;
  arousal?: number;
  valence?: number;
  hrv?: number;
  eegAlpha?: number;
  traces: number;
  biomarkers: number;
}

// ============================================================================
// COLOR PALETTE (Elemental)
// ============================================================================

const ELEMENT_COLORS = {
  Fire: '#FF6B35',      // Vibrant red-orange
  Water: '#4ECDC4',     // Turquoise
  Earth: '#8B5E34',     // Deep brown
  Air: '#95E1D3',       // Soft cyan
  Aether: '#9B59B6',    // Purple
  Mixed: '#95A5A6',     // Neutral gray
};

const ELEMENT_COLORS_DARK = {
  Fire: '#FF8552',
  Water: '#66D9CF',
  Earth: '#A67C52',
  Air: '#B3F1E3',
  Aether: '#B882D4',
  Mixed: '#BDC3C7',
};

// ============================================================================
// HELPER: Determine Dominant Element
// ============================================================================

function getDominantElement(facets: FacetCode[]): GrowthRing['element'] {
  if (facets.length === 0) return 'Mixed';

  const elementCounts: Record<string, number> = {};

  for (const facet of facets) {
    if (facet.startsWith('F')) elementCounts.Fire = (elementCounts.Fire || 0) + 1;
    else if (facet.startsWith('W')) elementCounts.Water = (elementCounts.Water || 0) + 1;
    else if (facet.startsWith('E')) elementCounts.Earth = (elementCounts.Earth || 0) + 1;
    else if (facet.startsWith('A')) elementCounts.Air = (elementCounts.Air || 0) + 1;
    else if (facet.startsWith('Æ')) elementCounts.Aether = (elementCounts.Aether || 0) + 1;
  }

  const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return 'Mixed';
  if (sorted.length === 1) return sorted[0][0] as GrowthRing['element'];

  // If tied, return 'Mixed'
  if (sorted[0][1] === sorted[1][1]) return 'Mixed';

  return sorted[0][0] as GrowthRing['element'];
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MycelialDashboard() {
  const [rings, setRings] = useState<GrowthRing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRing, setHoveredRing] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const observer = new MutationObserver(() => {
      const isNowDark = document.documentElement.classList.contains('dark');
      setIsDark(isNowDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch mycelial cycles
  useEffect(() => {
    async function fetchCycles() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/memory/cycles?limit=30&order=desc');

        if (!response.ok) {
          throw new Error(`Failed to fetch cycles: ${response.status} ${response.statusText}`);
        }

        const data: MycelialCycle[] = await response.json();

        // Transform to growth rings
        const transformed: GrowthRing[] = data.map(cycle => ({
          cycleId: cycle.cycleId,
          date: new Date(cycle.startTs).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          element: getDominantElement(cycle.dominantFacets),
          dominantFacets: cycle.dominantFacets,
          coherence: cycle.coherenceScore,
          arousal: cycle.meanArousal,
          valence: cycle.meanValence,
          hrv: cycle.meanHrv,
          eegAlpha: cycle.meanEegAlpha,
          traces: cycle.totalTraces,
          biomarkers: cycle.totalBiomarkerSamples,
        }));

        setRings(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchCycles();
  }, []);

  // SVG dimensions
  const svgSize = 600;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const baseRadius = 50;
  const maxRadius = svgSize / 2 - 40;
  const ringSpacing = rings.length > 0 ? (maxRadius - baseRadius) / rings.length : 10;

  const colors = isDark ? ELEMENT_COLORS_DARK : ELEMENT_COLORS;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading mycelial memory...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Failed to load mycelial cycles
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-4">
          Make sure the database migration has been applied and cycles have been generated.
        </p>
      </div>
    );
  }

  if (rings.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          No mycelial cycles found
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Generate your first cycle by running:
        </p>
        <pre className="bg-yellow-100 dark:bg-yellow-900/40 px-4 py-2 rounded mt-2 text-xs overflow-x-auto">
          npx tsx backend/src/scripts/generate-mycelial-cycle.ts
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Growth Rings Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Mycelial Growth Rings
        </h2>

        <div className="flex items-center justify-center">
          <svg
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="max-w-full h-auto"
            style={{ maxWidth: '600px' }}
          >
            {/* Background */}
            <rect
              width={svgSize}
              height={svgSize}
              fill={isDark ? '#1F2937' : '#F9FAFB'}
            />

            {/* Center point */}
            <circle
              cx={centerX}
              cy={centerY}
              r={baseRadius}
              fill={isDark ? '#374151' : '#E5E7EB'}
              opacity={0.5}
            />

            {/* Growth rings (oldest = innermost, newest = outermost) */}
            {rings.slice().reverse().map((ring, index) => {
              const radius = baseRadius + (index + 1) * ringSpacing;
              const strokeWidth = Math.max(5, ring.coherence * 20); // Coherence → thickness
              const opacity = ring.coherence * 0.8 + 0.2; // Higher coherence = more opaque
              const color = colors[ring.element];
              const isHovered = hoveredRing === ring.cycleId;

              return (
                <g key={ring.cycleId}>
                  {/* Ring circle */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? strokeWidth * 1.3 : strokeWidth}
                    opacity={isHovered ? 1 : opacity}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredRing(ring.cycleId)}
                    onMouseLeave={() => setHoveredRing(null)}
                  >
                    <title>
                      {ring.date} • {ring.element}
                      {'\n'}Facets: {ring.dominantFacets.join(', ')}
                      {'\n'}Coherence: {ring.coherence.toFixed(2)}
                      {ring.arousal !== undefined && `\nArousal: ${ring.arousal.toFixed(2)}`}
                      {ring.valence !== undefined && `\nValence: ${ring.valence.toFixed(2)}`}
                      {ring.hrv !== undefined && `\nHRV: ${ring.hrv.toFixed(1)}ms`}
                      {ring.eegAlpha !== undefined && `\nEEG α: ${ring.eegAlpha.toFixed(1)}Hz`}
                      {'\n'}Traces: {ring.traces}, Biomarkers: {ring.biomarkers}
                    </title>
                  </circle>

                  {/* Date label (on hover or every 5th ring) */}
                  {(isHovered || index % 5 === 0) && (
                    <text
                      x={centerX + radius + 10}
                      y={centerY}
                      fill={isDark ? '#D1D5DB' : '#6B7280'}
                      fontSize="11"
                      fontFamily="sans-serif"
                      className="pointer-events-none"
                    >
                      {ring.date}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center label */}
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isDark ? '#9CA3AF' : '#6B7280'}
              fontSize="12"
              fontFamily="sans-serif"
              fontWeight="600"
            >
              Origin
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {(['Fire', 'Water', 'Earth', 'Air', 'Aether', 'Mixed'] as const).map(element => (
            <div key={element} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[element] }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {element}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hovered Ring Details */}
      {hoveredRing && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          {(() => {
            const ring = rings.find(r => r.cycleId === hoveredRing);
            if (!ring) return null;

            return (
              <>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  {ring.date} — {ring.element}
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                      Facets:
                    </span>{' '}
                    <span className="text-purple-900 dark:text-purple-100">
                      {ring.dominantFacets.join(', ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                      Coherence:
                    </span>{' '}
                    <span className="text-purple-900 dark:text-purple-100">
                      {ring.coherence.toFixed(2)}
                    </span>
                  </div>

                  {ring.arousal !== undefined && (
                    <div>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        Arousal:
                      </span>{' '}
                      <span className="text-purple-900 dark:text-purple-100">
                        {ring.arousal.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {ring.valence !== undefined && (
                    <div>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        Valence:
                      </span>{' '}
                      <span className="text-purple-900 dark:text-purple-100">
                        {ring.valence.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {ring.hrv !== undefined && (
                    <div>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        HRV:
                      </span>{' '}
                      <span className="text-purple-900 dark:text-purple-100">
                        {ring.hrv.toFixed(1)}ms
                      </span>
                    </div>
                  )}

                  {ring.eegAlpha !== undefined && (
                    <div>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        EEG Alpha:
                      </span>{' '}
                      <span className="text-purple-900 dark:text-purple-100">
                        {ring.eegAlpha.toFixed(1)}Hz
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                      Traces:
                    </span>{' '}
                    <span className="text-purple-900 dark:text-purple-100">
                      {ring.traces}
                    </span>
                  </div>

                  <div>
                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                      Biomarkers:
                    </span>{' '}
                    <span className="text-purple-900 dark:text-purple-100">
                      {ring.biomarkers}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Total Cycles
          </h3>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {rings.length}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Mean Coherence
          </h3>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">
            {rings.length > 0
              ? (rings.reduce((sum, r) => sum + r.coherence, 0) / rings.length).toFixed(2)
              : '—'}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Dominant Element
          </h3>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            {(() => {
              const elementCounts: Record<string, number> = {};
              rings.forEach(r => {
                elementCounts[r.element] = (elementCounts[r.element] || 0) + 1;
              });
              const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
              return sorted.length > 0 ? sorted[0][0] : '—';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
