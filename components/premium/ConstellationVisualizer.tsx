/**
 * 🌌 CONSTELLATION VISUALIZER
 *
 * Visual representation of a member's spiral constellation showing:
 * - Active spirals as nodes with elemental colors and domain icons
 * - Cross-spiral patterns as connecting lines
 * - Primary/secondary spiral hierarchy
 * - Elemental balance visualization
 * - Harmonic coherence indicators
 */

'use client';

import React, { useMemo } from 'react';
import {
  Flame,
  Droplets,
  Mountain,
  Wind,
  Heart,
  Briefcase,
  CircleDot,
  Palette,
  Sparkles,
  Home,
  Users,
  DollarSign,
  Eye,
  Zap,
  Layers
} from 'lucide-react';

import type {
  MemberSpiralConstellation,
  SpiralSummary,
  CrossSpiralPattern,
  LifeDomain
} from '@/lib/services/spiral-constellation';

interface ConstellationVisualizerProps {
  constellation: MemberSpiralConstellation;
  onSpiralClick: (spiral: SpiralSummary) => void;
  onPatternClick?: (pattern: CrossSpiralPattern) => void;
  viewMode?: 'full' | 'simplified';
}

// Domain and element configurations
const DOMAIN_CONFIG = {
  relationship: { icon: Heart, color: 'rose', bgColor: 'bg-rose-100', textColor: 'text-rose-700' },
  vocation: { icon: Briefcase, color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  health: { icon: CircleDot, color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  creativity: { icon: Palette, color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  spirituality: { icon: Sparkles, color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
  family: { icon: Home, color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  community: { icon: Users, color: 'teal', bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
  money: { icon: DollarSign, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' }
};

const ELEMENT_CONFIG = {
  fire: { icon: Flame, color: 'red', name: 'Fire' },
  water: { icon: Droplets, color: 'blue', name: 'Water' },
  earth: { icon: Mountain, color: 'green', name: 'Earth' },
  air: { icon: Wind, color: 'gray', name: 'Air' }
};

export function ConstellationVisualizer({
  constellation,
  onSpiralClick,
  onPatternClick,
  viewMode = 'full'
}: ConstellationVisualizerProps) {

  const { nodePositions, connections } = useMemo(() =>
    calculateLayout(constellation), [constellation]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Constellation Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Spiral Constellation
          </h3>
          <p className="text-sm text-gray-600">
            {constellation.constellationTheme.name} • {constellation.overallHarmonicCoherence}% harmony
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ConstellationHealthIndicator health={constellation.constellationHealth} />
        </div>
      </div>

      {/* Main Constellation View */}
      <div className="relative bg-gradient-to-br from-slate-50 to-indigo-50 rounded-lg p-8 min-h-96">
        {/* SVG for connection lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {connections.map((connection, index) => (
            <ConnectionLine
              key={index}
              connection={connection}
              onPatternClick={onPatternClick}
            />
          ))}
        </svg>

        {/* Spiral nodes */}
        <div className="relative" style={{ zIndex: 2 }}>
          {constellation.activeSpirals.map(spiral => {
            const position = nodePositions[spiral.id];
            if (!position) return null;

            return (
              <SpiralNode
                key={spiral.id}
                spiral={spiral}
                position={position}
                isPrimary={spiral.id === constellation.primarySpiralId}
                isSecondary={constellation.secondarySpiralIds.includes(spiral.id)}
                onClick={() => onSpiralClick(spiral)}
              />
            );
          })}
        </div>
      </div>

      {/* Constellation Intelligence */}
      {viewMode === 'full' && (
        <div className="mt-6 space-y-4">
          <ConstellationInsights constellation={constellation} />
          {constellation.crossPatterns.length > 0 && (
            <CrossPatternsList
              patterns={constellation.crossPatterns.slice(0, 3)}
              onPatternClick={onPatternClick}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Individual Spiral Node Component
interface SpiralNodeProps {
  spiral: SpiralSummary;
  position: { x: number; y: number };
  isPrimary: boolean;
  isSecondary: boolean;
  onClick: () => void;
}

function SpiralNode({ spiral, position, isPrimary, isSecondary, onClick }: SpiralNodeProps) {
  const domainConfig = DOMAIN_CONFIG[spiral.lifeDomain];
  const DomainIcon = domainConfig.icon;

  // Determine dominant element for node styling
  const dominantElement = Object.entries(spiral.elementalSignature)
    .sort(([,a], [,b]) => b - a)[0][0] as keyof typeof ELEMENT_CONFIG;
  const elementConfig = ELEMENT_CONFIG[dominantElement];
  const ElementIcon = elementConfig.icon;

  const nodeSize = isPrimary ? 'w-20 h-20' : isSecondary ? 'w-16 h-16' : 'w-12 h-12';
  const iconSize = isPrimary ? 'h-8 w-8' : isSecondary ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onClick={onClick}
    >
      {/* Node Container */}
      <div className={`${nodeSize} relative`}>
        {/* Primary/Secondary Ring */}
        {isPrimary && (
          <div className="absolute inset-0 rounded-full border-3 border-indigo-400 animate-pulse" />
        )}
        {isSecondary && (
          <div className="absolute inset-0 rounded-full border-2 border-purple-300" />
        )}

        {/* Main Node */}
        <div className={`w-full h-full ${domainConfig.bgColor} rounded-full shadow-lg border-2 border-white flex items-center justify-center relative`}>
          <DomainIcon className={`${iconSize} ${domainConfig.textColor}`} />

          {/* Element Indicator */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center border">
            <ElementIcon className={`h-3 w-3 text-${elementConfig.color}-600`} />
          </div>

          {/* Intensity Indicator */}
          <div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-gray-300 rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-${domainConfig.color}-500 transition-all duration-500`}
              style={{ width: `${spiral.intensity * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Spiral Label */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
        <div className="text-xs font-medium text-gray-700 capitalize">
          {spiral.lifeDomain}
        </div>
        {isPrimary && (
          <div className="text-xs text-indigo-600 font-semibold">Primary</div>
        )}
        {isSecondary && (
          <div className="text-xs text-purple-600">Supporting</div>
        )}
      </div>
    </div>
  );
}

// Connection Line Component
interface ConnectionLineProps {
  connection: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    pattern: CrossSpiralPattern;
  };
  onPatternClick?: (pattern: CrossSpiralPattern) => void;
}

function ConnectionLine({ connection, onPatternClick }: ConnectionLineProps) {
  const { from, to, pattern } = connection;

  const strokeWidth = Math.max(1, pattern.significance * 4);
  const opacity = 0.3 + (pattern.significance * 0.4);

  const handleClick = () => {
    if (onPatternClick) {
      onPatternClick(pattern);
    }
  };

  return (
    <line
      x1={`${from.x}%`}
      y1={`${from.y}%`}
      x2={`${to.x}%`}
      y2={`${to.y}%`}
      stroke="#6366f1"
      strokeWidth={strokeWidth}
      opacity={opacity}
      strokeDasharray={pattern.facets.length > 2 ? "5,5" : "none"}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleClick}
    />
  );
}

// Constellation Health Indicator
interface ConstellationHealthIndicatorProps {
  health: 'scattered' | 'focused' | 'integrated' | 'transcendent';
}

function ConstellationHealthIndicator({ health }: ConstellationHealthIndicatorProps) {
  const configs = {
    scattered: { color: 'text-orange-600', bg: 'bg-orange-100', icon: Layers, label: 'Scattered' },
    focused: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Eye, label: 'Focused' },
    integrated: { color: 'text-green-600', bg: 'bg-green-100', icon: CircleDot, label: 'Integrated' },
    transcendent: { color: 'text-purple-600', bg: 'bg-purple-100', icon: Sparkles, label: 'Transcendent' }
  };

  const config = configs[health];
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg}`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

// Constellation Insights Panel
interface ConstellationInsightsProps {
  constellation: MemberSpiralConstellation;
}

function ConstellationInsights({ constellation }: ConstellationInsightsProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Eye className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Constellation Intelligence</h4>
          <p className="text-sm text-gray-700 mb-2">
            {constellation.constellationTheme.description}
          </p>
          <div className="text-sm text-indigo-700 font-medium">
            {constellation.constellationTheme.guidanceDirection}
          </div>
        </div>
      </div>
    </div>
  );
}

// Cross Patterns List
interface CrossPatternsListProps {
  patterns: CrossSpiralPattern[];
  onPatternClick?: (pattern: CrossSpiralPattern) => void;
}

function CrossPatternsList({ patterns, onPatternClick }: CrossPatternsListProps) {
  if (patterns.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
        <Zap className="h-4 w-4" />
        <span>Cross-Spiral Patterns</span>
      </h4>
      {patterns.map(pattern => (
        <div
          key={pattern.id}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => onPatternClick?.(pattern)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">
              {pattern.description}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(pattern.significance * 100)}% significant
            </span>
          </div>
          <p className="text-xs text-gray-600">{pattern.therapeuticOpportunity}</p>
        </div>
      ))}
    </div>
  );
}

// Layout calculation for constellation nodes
function calculateLayout(constellation: MemberSpiralConstellation) {
  const nodePositions: Record<string, { x: number; y: number }> = {};
  const connections: Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    pattern: CrossSpiralPattern;
  }> = [];

  const spirals = constellation.activeSpirals;
  const primaryId = constellation.primarySpiralId;

  // Position primary spiral in center
  if (primaryId) {
    nodePositions[primaryId] = { x: 50, y: 50 };
  }

  // Position other spirals in a circle around primary
  const otherSpirals = spirals.filter(s => s.id !== primaryId);
  const angleStep = (2 * Math.PI) / Math.max(otherSpirals.length, 1);
  const radius = 25; // Percentage units

  otherSpirals.forEach((spiral, index) => {
    const angle = index * angleStep;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    nodePositions[spiral.id] = { x, y };
  });

  // Calculate connections based on cross-spiral patterns
  constellation.crossPatterns.forEach(pattern => {
    for (let i = 0; i < pattern.involvedSpirals.length; i++) {
      for (let j = i + 1; j < pattern.involvedSpirals.length; j++) {
        const fromId = pattern.involvedSpirals[i];
        const toId = pattern.involvedSpirals[j];
        const fromPos = nodePositions[fromId];
        const toPos = nodePositions[toId];

        if (fromPos && toPos) {
          connections.push({
            from: fromPos,
            to: toPos,
            pattern
          });
        }
      }
    }
  });

  return { nodePositions, connections };
}

export default ConstellationVisualizer;