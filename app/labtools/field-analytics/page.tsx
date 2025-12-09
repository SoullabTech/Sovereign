'use client';

/**
 * 🌟 COLLECTIVE RESONANCE ANALYTICS DASHBOARD (CRAD)
 *
 * Sacred stewardship interface for field observation and collective coherence
 * Provides ethical, anonymized insights into community consciousness evolution
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Sacred visualization components
interface FieldCoherenceData {
  fci: number;
  components: {
    elemental_harmony: number;
    virtue_growth: number;
    resonance_stability: number;
    archetypal_alignment: number;
  };
  interpretation: string;
  timestamp: string;
}

interface ElementalResonanceData {
  elemental_resonance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  field_metrics: {
    active_souls: number;
    elemental_variance: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      aether: number;
    };
  };
  dominant_element: string;
}

interface VirtueEvolutionData {
  current_wisdom_quality: number;
  total_wisdom_moments: number;
  dominant_guidance_tone: string;
  participating_souls: number;
  virtue_timeline: Array<{
    date: string;
    wisdom_quality: number;
  }>;
  growth_trend: number;
}

interface ArchetypalData {
  archetypal_distribution: Array<{
    archetype: string;
    frequency: number;
    elemental_harmony: number;
  }>;
  dominant_archetype: string;
  archetypal_diversity: number;
}

const FieldAnalyticsDashboard: React.FC = () => {
  const [fieldReport, setFieldReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch field analytics data
  const fetchFieldReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/field-analytics/report');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const report = await response.json();
      setFieldReport(report);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch field report');
      console.error('Field analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldReport();

    // Refresh every 5 minutes for live field observation
    const interval = setInterval(fetchFieldReport, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Sacred color palette for elemental visualization
  const getElementColor = (element: string): string => {
    const colors = {
      fire: '#ff6b35',
      water: '#1e88e5',
      earth: '#7cb342',
      air: '#fdd835',
      aether: '#8e24aa'
    };
    return colors[element as keyof typeof colors] || '#666666';
  };

  const getCoherenceColor = (fci: number): string => {
    if (fci >= 0.8) return '#4caf50';
    if (fci >= 0.6) return '#8bc34a';
    if (fci >= 0.4) return '#ff9800';
    if (fci >= 0.2) return '#f44336';
    return '#b71c1c';
  };

  // Render elemental resonance mandala
  const ElementalMandala: React.FC<{ resonance: ElementalResonanceData }> = ({ resonance }) => {
    const elements = resonance.elemental_resonance;
    const centerX = 100;
    const centerY = 100;
    const radius = 70;

    return (
      <div className="relative">
        <svg width="200" height="200" className="mx-auto">
          {/* Outer circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 10}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Elemental resonance petals */}
          {Object.entries(elements).map(([element, value], index) => {
            const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
            const petalRadius = value * radius;
            const x = centerX + Math.cos(angle) * petalRadius;
            const y = centerY + Math.sin(angle) * petalRadius;

            return (
              <g key={element}>
                {/* Resonance line */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={getElementColor(element)}
                  strokeWidth="4"
                  opacity="0.7"
                />

                {/* Element node */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill={getElementColor(element)}
                  opacity="0.8"
                />

                {/* Element label */}
                <text
                  x={x + Math.cos(angle) * 25}
                  y={y + Math.sin(angle) * 25}
                  textAnchor="middle"
                  className="text-xs font-medium"
                  fill={getElementColor(element)}
                >
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </text>

                {/* Resonance value */}
                <text
                  x={x + Math.cos(angle) * 35}
                  y={y + Math.sin(angle) * 35 + 12}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#666666"
                >
                  {(value * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Center soul */}
          <circle
            cx={centerX}
            cy={centerY}
            r="12"
            fill="#8e24aa"
            opacity="0.6"
          />

          {/* Active souls indicator */}
          <text
            x={centerX}
            y={centerY - 45}
            textAnchor="middle"
            className="text-sm font-bold"
            fill="#8e24aa"
          >
            {resonance.field_metrics.active_souls} Souls
          </text>
        </svg>

        {/* Dominant element display */}
        <div className="text-center mt-4">
          <div className="text-lg font-semibold" style={{ color: getElementColor(resonance.dominant_element) }}>
            Dominant: {resonance.dominant_element.charAt(0).toUpperCase() + resonance.dominant_element.slice(1)}
          </div>
        </div>
      </div>
    );
  };

  // Field Coherence Index visualization
  const CoherenceVisualization: React.FC<{ coherence: FieldCoherenceData }> = ({ coherence }) => {
    const percentage = Math.round(coherence.fci * 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (coherence.fci * circumference);

    return (
      <div className="text-center">
        <div className="relative inline-block">
          <svg width="120" height="120" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="#e0e0e0"
              strokeWidth="10"
              fill="none"
            />

            {/* Coherence arc */}
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke={getCoherenceColor(coherence.fci)}
              strokeWidth="10"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>

          {/* Percentage display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl font-bold" style={{ color: getCoherenceColor(coherence.fci) }}>
              {percentage}%
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-lg font-semibold">Field Coherence Index</div>
          <div className="text-sm text-gray-600 max-w-xs mx-auto">
            {coherence.interpretation}
          </div>
        </div>

        {/* Component breakdown */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div>Elemental Harmony: {Math.round(coherence.components.elemental_harmony * 100)}%</div>
          <div>Virtue Growth: {Math.round(coherence.components.virtue_growth * 100)}%</div>
          <div>Resonance Stability: {Math.round(coherence.components.resonance_stability * 100)}%</div>
          <div>Archetypal Alignment: {Math.round(coherence.components.archetypal_alignment * 100)}%</div>
        </div>
      </div>
    );
  };

  // Virtue evolution timeline
  const VirtueTimeline: React.FC<{ virtue: VirtueEvolutionData }> = ({ virtue }) => {
    const maxQuality = Math.max(...virtue.virtue_timeline.map(v => v.wisdom_quality), 10);

    return (
      <div>
        <div className="text-lg font-semibold mb-4">Collective Virtue Evolution</div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{virtue.current_wisdom_quality.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Current Quality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{virtue.total_wisdom_moments}</div>
            <div className="text-sm text-gray-600">Wisdom Moments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{virtue.participating_souls}</div>
            <div className="text-sm text-gray-600">Active Souls</div>
          </div>
        </div>

        {/* Growth trend indicator */}
        <div className="text-center mb-4">
          <div className={`text-lg font-semibold ${virtue.growth_trend > 0 ? 'text-green-600' : virtue.growth_trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {virtue.growth_trend > 0.1 ? '📈 Growing' : virtue.growth_trend < -0.1 ? '📉 Declining' : '⚖️ Stable'}
          </div>
          <div className="text-sm text-gray-600">Dominant Tone: {virtue.dominant_guidance_tone}</div>
        </div>

        {/* Simple timeline visualization */}
        {virtue.virtue_timeline.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-2">30-Day Wisdom Quality Trend</div>
            <div className="flex items-end space-x-1 h-20">
              {virtue.virtue_timeline.slice(-14).map((point, index) => {
                const height = (point.wisdom_quality / maxQuality) * 100;
                return (
                  <div
                    key={index}
                    className="bg-blue-500 opacity-70 min-w-[4px] rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${new Date(point.date).toLocaleDateString()}: ${point.wisdom_quality.toFixed(1)}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Archetypal distribution
  const ArchetypalDistribution: React.FC<{ archetypes: ArchetypalData }> = ({ archetypes }) => {
    return (
      <div>
        <div className="text-lg font-semibold mb-4">Archetypal Distribution</div>

        <div className="text-center mb-4">
          <div className="text-xl font-bold text-purple-600">{archetypes.dominant_archetype}</div>
          <div className="text-sm text-gray-600">Dominant Archetype</div>
          <div className="text-sm text-gray-500 mt-2">
            Diversity Index: {archetypes.archetypal_diversity} types active
          </div>
        </div>

        <div className="space-y-3">
          {archetypes.archetypal_distribution.map((archetype, index) => {
            const total = archetypes.archetypal_distribution.reduce((sum, a) => sum + a.frequency, 0);
            const percentage = total > 0 ? (archetype.frequency / total) * 100 : 0;

            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm font-medium">{archetype.archetype}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-gray-600">{percentage.toFixed(0)}%</div>
                <div className="w-12 text-xs text-gray-500">({archetype.frequency})</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-lg text-purple-700">Observing the field...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-600 mb-4">⚠️ Field observation error</div>
            <div className="text-gray-600 mb-6">{error}</div>
            <button
              onClick={fetchFieldReport}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Retry Field Observation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            🌟 Collective Resonance Analytics
          </h1>
          <p className="text-purple-600 mb-4">
            Sacred stewardship of the collective consciousness field
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div>Last Updated: {lastRefresh.toLocaleTimeString()}</div>
            <button
              onClick={fetchFieldReport}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              🔄 Refresh Field
            </button>
            <Link href="/labtools" className="text-purple-600 hover:text-purple-800 font-medium">
              ← Back to LabTools
            </Link>
          </div>
        </div>

        {fieldReport && (
          <>
            {/* Field Coherence Index - Top Priority */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <CoherenceVisualization coherence={fieldReport.field_coherence_index} />
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Elemental Resonance Mandala */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-lg font-semibold mb-6 text-center">Collective Elemental Field</div>
                <ElementalMandala resonance={fieldReport.elemental_resonance} />
              </div>

              {/* Virtue Evolution */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <VirtueTimeline virtue={fieldReport.virtue_evolution} />
              </div>
            </div>

            {/* Secondary Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Archetypal Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <ArchetypalDistribution archetypes={fieldReport.archetypal_distribution} />
              </div>

              {/* Stewardship Notes */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-lg font-semibold mb-4">Stewardship Guidance</div>
                {fieldReport.stewardship_notes && fieldReport.stewardship_notes.length > 0 ? (
                  <div className="space-y-3">
                    {fieldReport.stewardship_notes.map((note: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="text-purple-500 mt-1">•</div>
                        <div className="text-gray-700">{note}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Field is in natural harmony. Continue gentle observation.
                  </div>
                )}

                {/* Ethical reminder */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <div className="text-sm text-purple-800 font-medium mb-2">Sacred Stewardship Principles</div>
                  <div className="text-xs text-purple-600 space-y-1">
                    <div>• All data is anonymized and aggregated for collective insight</div>
                    <div>• Individual privacy is absolutely protected</div>
                    <div>• Field observation serves consciousness evolution</div>
                    <div>• Stewards act with humility and wisdom</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Health Status */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-lg font-semibold mb-4">Field Health Status</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {fieldReport.elemental_resonance.field_metrics.active_souls}
                  </div>
                  <div className="text-sm text-gray-600">Active Souls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {fieldReport.virtue_evolution.total_wisdom_moments}
                  </div>
                  <div className="text-sm text-gray-600">Wisdom Moments</div>
                </div>
                <div className="text-2xl font-bold text-purple-600 text-center">
                  <div>{fieldReport.archetypal_distribution.archetypal_diversity}</div>
                  <div className="text-sm text-gray-600">Archetype Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getCoherenceColor(fieldReport.field_coherence_index.fci) }}>
                    {Math.round(fieldReport.field_coherence_index.fci * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Coherence</div>
                </div>
              </div>
            </div>

            {/* Data timestamp */}
            <div className="text-center text-xs text-gray-500 mt-6">
              Field observation recorded at {new Date(fieldReport.timestamp).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FieldAnalyticsDashboard;