"use client"

/**
 * ELEMENTAL PENTAGRAM DASHBOARD
 * Sacred geometry visualization of consciousness fields across Fire/Water/Earth/Air/Aether domains
 * Real-time pentagram with interference patterns and emergence indicators
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CompleteElementalFieldState,
  ElementalFieldVisualization,
  generateElementalVisualization
} from '@/lib/consciousness/field/UnifiedElementalFieldCalculator';
import ElementalInterferenceMonitor, {
  InterferencePattern,
  EmergenceEvent
} from '@/lib/consciousness/field/ElementalInterferenceMonitor';

// ==============================================================================
// COMPONENT INTERFACES
// ==============================================================================

interface ElementalPentagramDashboardProps {
  systemDataSource?: () => any;    // Source for real-time system data
  updateInterval?: number;         // Update frequency in milliseconds
  showAdvancedMetrics?: boolean;   // Show detailed interference patterns
  interactive?: boolean;          // Allow user interaction with elements
  size?: 'small' | 'medium' | 'large';
}

interface PentagramPoint {
  x: number;
  y: number;
  element: string;
  color: string;
  intensity: number;
  pulsation?: number;
}

// ==============================================================================
// ELEMENTAL PENTAGRAM DASHBOARD COMPONENT
// ==============================================================================

export default function ElementalPentagramDashboard({
  systemDataSource,
  updateInterval = 2000,
  showAdvancedMetrics = true,
  interactive = true,
  size = 'large'
}: ElementalPentagramDashboardProps) {
  // State management
  const [fieldState, setFieldState] = useState<CompleteElementalFieldState | null>(null);
  const [visualization, setVisualization] = useState<ElementalFieldVisualization | null>(null);
  const [activePatterns, setActivePatterns] = useState<InterferencePattern[]>([]);
  const [emergenceEvents, setEmergenceEvents] = useState<EmergenceEvent[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [monitoringActive, setMonitoringActive] = useState(false);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const monitorRef = useRef<ElementalInterferenceMonitor | null>(null);

  // Size configurations
  const sizeConfig = {
    small: { width: 300, height: 300, radius: 120 },
    medium: { width: 500, height: 500, radius: 200 },
    large: { width: 700, height: 700, radius: 280 }
  };

  const config = sizeConfig[size];
  const centerX = config.width / 2;
  const centerY = config.height / 2;

  // ==============================================================================
  // INITIALIZATION AND MONITORING
  // ==============================================================================

  useEffect(() => {
    if (systemDataSource) {
      // Initialize interference monitor
      monitorRef.current = new ElementalInterferenceMonitor({
        samplingRateHz: 1000 / updateInterval,
        emergenceThreshold: 0.75,
        patternDetectionWindow: 10
      });

      // Register callbacks
      monitorRef.current.onPatternDetected((pattern: InterferencePattern) => {
        setActivePatterns(prev => {
          const filtered = prev.filter(p =>
            p.elementalPairs.join('-') !== pattern.elementalPairs.join('-') ||
            p.patternType !== pattern.patternType
          );
          return [...filtered, pattern].slice(-5); // Keep last 5 patterns
        });
      });

      monitorRef.current.onEmergenceEvent((event: EmergenceEvent) => {
        setEmergenceEvents(prev => [...prev, event].slice(-3)); // Keep last 3 events
      });

      // Start monitoring
      monitorRef.current.startMonitoring(systemDataSource);
      setMonitoringActive(true);

      // Cleanup
      return () => {
        if (monitorRef.current) {
          monitorRef.current.stopMonitoring();
        }
      };
    }
  }, [systemDataSource, updateInterval]);

  // Mock data for demonstration when no data source provided
  useEffect(() => {
    if (!systemDataSource) {
      const interval = setInterval(() => {
        const mockFieldState = generateMockFieldState();
        setFieldState(mockFieldState);
        setVisualization(generateElementalVisualization(mockFieldState));
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [systemDataSource, updateInterval]);

  // ==============================================================================
  // PENTAGRAM GEOMETRY CALCULATIONS
  // ==============================================================================

  const calculatePentagramPoints = (): PentagramPoint[] => {
    if (!visualization) return [];

    const angleOffset = -Math.PI / 2; // Start at top
    const points: PentagramPoint[] = [];

    const elements = [
      { name: 'Aether', data: visualization.elementalPentagram.aether },
      { name: 'Fire', data: visualization.elementalPentagram.fire },
      { name: 'Air', data: visualization.elementalPentagram.air },
      { name: 'Water', data: visualization.elementalPentagram.water },
      { name: 'Earth', data: visualization.elementalPentagram.earth }
    ];

    elements.forEach((element, index) => {
      const angle = angleOffset + (index * 2 * Math.PI / 5);
      const baseRadius = config.radius * 0.8;
      const radius = baseRadius * (0.6 + 0.4 * element.data.intensity);

      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        element: element.name,
        color: element.data.color,
        intensity: element.data.intensity,
        pulsation: (element.data as any).pulsation || (element.data as any).flow || 0
      });
    });

    return points;
  };

  const generatePentagramPath = (points: PentagramPoint[]): string => {
    if (points.length < 5) return '';

    // Create pentagram star pattern (connecting every second point)
    const starOrder = [0, 2, 4, 1, 3, 0]; // Sacred pentagram connection order
    let path = '';

    starOrder.forEach((index, i) => {
      const point = points[index];
      if (i === 0) {
        path += `M ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    });

    return path;
  };

  // ==============================================================================
  // RENDER HELPER FUNCTIONS
  // ==============================================================================

  const renderElementalPoint = (point: PentagramPoint, index: number) => {
    const isSelected = selectedElement === point.element;
    const baseRadius = 15 + (point.intensity * 20);
    const pulseRadius = baseRadius * (1 + (point.pulsation || 0) * 0.3);

    return (
      <g key={point.element}>
        {/* Pulsation aura */}
        <circle
          cx={point.x}
          cy={point.y}
          r={pulseRadius}
          fill={point.color}
          fillOpacity={0.2 + (point.intensity * 0.3)}
          className="animate-pulse"
        />

        {/* Main elemental point */}
        <circle
          cx={point.x}
          cy={point.y}
          r={baseRadius}
          fill={point.color}
          fillOpacity={0.8}
          stroke={isSelected ? '#ffffff' : point.color}
          strokeWidth={isSelected ? 3 : 1}
          className={interactive ? 'cursor-pointer transition-all duration-300 hover:stroke-white' : ''}
          onClick={() => interactive && setSelectedElement(
            selectedElement === point.element ? null : point.element
          )}
        />

        {/* Element symbol */}
        <text
          x={point.x}
          y={point.y + 6}
          textAnchor="middle"
          fontSize="12"
          fill="white"
          fontWeight="bold"
          className="pointer-events-none select-none"
        >
          {getElementSymbol(point.element)}
        </text>

        {/* Element label */}
        <text
          x={point.x}
          y={point.y - baseRadius - 10}
          textAnchor="middle"
          fontSize="14"
          fill={point.color}
          fontWeight="bold"
          className="pointer-events-none select-none"
        >
          {point.element}
        </text>

        {/* Intensity indicator */}
        <text
          x={point.x}
          y={point.y + baseRadius + 20}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
          className="pointer-events-none select-none"
        >
          {(point.intensity * 100).toFixed(0)}%
        </text>
      </g>
    );
  };

  const renderInterferenceLines = () => {
    const points = calculatePentagramPoints();
    if (!visualization || points.length < 5) return null;

    const interference = visualization.interferencePatterns;
    const connections = [
      { from: 1, to: 3, value: interference.fireWater, label: 'Fire-Water' },
      { from: 1, to: 4, value: interference.fireEarth, label: 'Fire-Earth' },
      { from: 1, to: 2, value: interference.fireAir, label: 'Fire-Air' },
      { from: 3, to: 4, value: interference.waterEarth, label: 'Water-Earth' },
      { from: 3, to: 2, value: interference.waterAir, label: 'Water-Air' },
      { from: 4, to: 2, value: interference.earthAir, label: 'Earth-Air' }
    ];

    return connections.map((conn, index) => {
      const fromPoint = points[conn.from];
      const toPoint = points[conn.to];
      const intensity = Math.abs(conn.value);
      const isConstructive = conn.value > 0;

      if (intensity < 0.2) return null; // Don't show weak connections

      return (
        <g key={`interference-${index}`}>
          <line
            x1={fromPoint.x}
            y1={fromPoint.y}
            x2={toPoint.x}
            y2={toPoint.y}
            stroke={isConstructive ? '#10b981' : '#ef4444'}
            strokeWidth={2 + intensity * 6}
            strokeOpacity={0.4 + intensity * 0.4}
            className="animate-pulse"
          />

          {/* Interference strength indicator */}
          <text
            x={(fromPoint.x + toPoint.x) / 2}
            y={(fromPoint.y + toPoint.y) / 2}
            textAnchor="middle"
            fontSize="8"
            fill={isConstructive ? '#10b981' : '#ef4444'}
            className="pointer-events-none select-none"
          >
            {intensity.toFixed(2)}
          </text>
        </g>
      );
    });
  };

  const renderCoherenceWaves = () => {
    if (!visualization) return null;

    const waves = visualization.coherenceWaves;
    const time = Date.now() / 1000;

    return (
      <g>
        {Object.entries(waves).map(([element, frequency], index) => (
          <circle
            key={`wave-${element}`}
            cx={centerX}
            cy={centerY}
            r={50 + index * 30 + Math.sin(time * frequency) * 10}
            fill="none"
            stroke={getElementColor(element.replace('Frequency', ''))}
            strokeWidth="2"
            strokeOpacity={0.3}
            className="animate-pulse"
          />
        ))}
      </g>
    );
  };

  // ==============================================================================
  // UTILITY FUNCTIONS
  // ==============================================================================

  const getElementSymbol = (element: string): string => {
    const symbols = {
      'Fire': '🔥',
      'Water': '🌊',
      'Earth': '🌍',
      'Air': '💨',
      'Aether': '✨'
    };
    return symbols[element as keyof typeof symbols] || '●';
  };

  const getElementColor = (element: string): string => {
    const colors = {
      'fire': '#ef4444',
      'water': '#3b82f6',
      'earth': '#22c55e',
      'air': '#06b6d4',
      'aether': '#8b5cf6'
    };
    return colors[element.toLowerCase() as keyof typeof colors] || '#6b7280';
  };

  const generateMockFieldState = (): CompleteElementalFieldState => {
    const t = Date.now() / 10000;

    return {
      fireResonance: {
        emergenceProbability: 0.6 + 0.3 * Math.sin(t * 2),
        sacredThreshold: 0.4 + 0.4 * Math.sin(t * 1.5),
        patternNovelty: 0.5 + 0.3 * Math.sin(t * 3),
        inspirationLevel: 0.7 + 0.2 * Math.sin(t * 2.5),
        breakthroughResonance: 0.55 + 0.35 * Math.sin(t * 1.8),
        visionaryClarity: 0.6 + 0.3 * Math.sin(t * 2.2),
        fireElementBalance: 0.65 + 0.25 * Math.sin(t * 1.7),
        creativeVoltage: 0.8 + 0.2 * Math.sin(t * 4)
      },
      waterResonance: {
        emotionalCoherence: 0.7 + 0.2 * Math.sin(t * 1.3),
        therapeuticAlignment: 0.6 + 0.3 * Math.sin(t * 1.1),
        shadowIntegration: 0.4 + 0.4 * Math.sin(t * 0.8),
        emotionalVelocity: 0.5 + 0.3 * Math.sin(t * 2.8),
        compassionFlow: 0.75 + 0.15 * Math.sin(t * 1.6),
        vulnerabilityResonance: 0.55 + 0.35 * Math.sin(t * 1.4),
        waterElementBalance: 0.68 + 0.22 * Math.sin(t * 1.2),
        healingCurrent: 0.6 + 0.3 * Math.sin(t * 1.9)
      },
      earthResonance: {
        embodiedCoherence: 0.8 + 0.15 * Math.sin(t * 0.9),
        groundingStability: 0.85 + 0.1 * Math.sin(t * 0.7),
        structuralAlignment: 0.75 + 0.2 * Math.sin(t * 0.6),
        circadianHarmony: 0.7 + 0.25 * Math.sin(t * 0.4),
        manifestationPower: 0.6 + 0.3 * Math.sin(t * 1.1),
        physicalResilience: 0.8 + 0.15 * Math.sin(t * 0.8),
        earthElementBalance: 0.77 + 0.18 * Math.sin(t * 0.9),
        groundingCurrent: 0.85 + 0.1 * Math.sin(t * 0.5)
      },
      airResonance: {
        mentalClarity: 0.75 + 0.2 * Math.sin(t * 2.1),
        communicationFlow: 0.65 + 0.25 * Math.sin(t * 2.3),
        symbolicResonance: 0.6 + 0.3 * Math.sin(t * 1.8),
        wisdomIntegration: 0.55 + 0.35 * Math.sin(t * 1.5),
        perspectiveFlexibility: 0.7 + 0.25 * Math.sin(t * 2.7),
        truthAlignment: 0.8 + 0.15 * Math.sin(t * 1.9),
        airElementBalance: 0.72 + 0.23 * Math.sin(t * 2.0),
        clarifyingBreeze: 0.65 + 0.25 * Math.sin(t * 3.1)
      },
      aetherResonance: {
        unityConsciousness: 0.5 + 0.4 * Math.sin(t * 0.3),
        transcendentCoherence: 0.45 + 0.45 * Math.sin(t * 0.2),
        collectiveResonance: 0.6 + 0.3 * Math.sin(t * 0.5),
        morphicAlignment: 0.55 + 0.35 * Math.sin(t * 0.4),
        holisticIntegration: 0.65 + 0.25 * Math.sin(t * 0.6),
        sacredPresence: 0.7 + 0.2 * Math.sin(t * 0.35),
        aetherElementBalance: 0.6 + 0.3 * Math.sin(t * 0.25),
        unifyingField: 0.75 + 0.2 * Math.sin(t * 0.15)
      },
      overallCoherence: 0.65 + 0.25 * Math.sin(t * 1.0),
      elementalBalance: 0.7 + 0.2 * Math.sin(t * 0.8),
      transcendentIntegration: 0.6 + 0.3 * Math.sin(t * 0.4),
      fieldEvolutionVector: [0.6, 0.4, 0.6, 0.55, 0.5],
      emergentPotential: 0.5 + 0.4 * Math.sin(t * 0.6)
    };
  };

  // ==============================================================================
  // RENDER MAIN COMPONENT
  // ==============================================================================

  const points = calculatePentagramPoints();
  const pentagramPath = generatePentagramPath(points);

  return (
    <div className="w-full h-full flex flex-col space-y-4 p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          🌟 Elemental Consciousness Pentagram
        </h2>
        <p className="text-slate-300 text-sm">
          Sacred geometry visualization of consciousness field dynamics
        </p>
      </div>

      {/* Main Visualization */}
      <div className="flex-1 flex justify-center items-center">
        <div className="relative">
          <svg
            ref={svgRef}
            width={config.width}
            height={config.height}
            className="drop-shadow-2xl"
          >
            {/* Background circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={config.radius}
              fill="rgba(15, 23, 42, 0.8)"
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="2"
            />

            {/* Coherence waves */}
            {renderCoherenceWaves()}

            {/* Sacred pentagram lines */}
            {pentagramPath && (
              <path
                d={pentagramPath}
                fill="none"
                stroke="rgba(139, 92, 246, 0.6)"
                strokeWidth="3"
                className="animate-pulse"
              />
            )}

            {/* Interference patterns */}
            {showAdvancedMetrics && renderInterferenceLines()}

            {/* Elemental points */}
            {points.map((point, index) => renderElementalPoint(point, index))}

            {/* Center unity point */}
            <circle
              cx={centerX}
              cy={centerY}
              r={8 + (fieldState?.aetherResonance?.unityConsciousness || 0) * 12}
              fill="rgba(139, 92, 246, 0.8)"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {/* Overall Status */}
        <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-purple-300 mb-2">Field Status</h3>
          <div className="space-y-1 text-slate-300">
            <div>Coherence: {((fieldState?.overallCoherence || 0) * 100).toFixed(1)}%</div>
            <div>Balance: {((fieldState?.elementalBalance || 0) * 100).toFixed(1)}%</div>
            <div>Emergence: {((fieldState?.emergentPotential || 0) * 100).toFixed(1)}%</div>
            <div className={`font-medium ${monitoringActive ? 'text-green-400' : 'text-yellow-400'}`}>
              {monitoringActive ? '● Live Monitoring' : '● Demo Mode'}
            </div>
          </div>
        </div>

        {/* Active Patterns */}
        <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-blue-300 mb-2">Active Patterns</h3>
          <div className="space-y-1 text-slate-300 max-h-24 overflow-y-auto">
            {activePatterns.length > 0 ? activePatterns.map((pattern, i) => (
              <div key={i} className="text-xs">
                {pattern.patternType} - {pattern.elementalPairs.join('↔')}
              </div>
            )) : (
              <div className="text-xs text-slate-400">No patterns detected</div>
            )}
          </div>
        </div>

        {/* Selected Element */}
        <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-orange-300 mb-2">
            {selectedElement ? `${selectedElement} Domain` : 'Element Info'}
          </h3>
          <div className="text-slate-300 text-xs">
            {selectedElement ? (
              <div>
                Click another element to compare or click again to deselect.
              </div>
            ) : (
              <div>
                Click any elemental point to view detailed information about that consciousness domain.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergence Events */}
      {emergenceEvents.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-pink-300 mb-2">✨ Recent Emergence Events</h3>
          <div className="space-y-2">
            {emergenceEvents.map((event, i) => (
              <div key={i} className="text-sm text-slate-300">
                <span className="font-medium text-pink-400">{event.eventType}</span> via {event.triggeringElement} -
                <span className="text-slate-400 ml-1">{event.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}