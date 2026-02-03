// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ADVANCED ARCHETYPAL MAPPING VISUALIZATION
 *
 * Interactive visualization system for tracking archetypal patterns and wisdom emergence:
 * - Dynamic mandala-style archetypal constellation mapping
 * - Temporal evolution tracking with animated transitions
 * - Wisdom emergence pathway visualization
 * - Cross-correlation pattern display
 * - Interactive archetypal relationship exploration
 *
 * Uses DreamWeaver Engine patterns and correlation analytics data
 */

interface ArchetypeData {
  name: string;
  intensity: number; // 0-1
  activation_frequency: number;
  integration_level: number;
  wisdom_correlation: number;
  relationships: string[]; // Related archetypes
  manifestation_contexts: string[]; // Where it appears (dreams, conversations, etc.)
  evolution_stage: 'recognition' | 'exploration' | 'integration' | 'mastery';
  emergence_trend: 'ascending' | 'stable' | 'declining' | 'cyclical';
}

interface WisdomEmergencePoint {
  timestamp: Date;
  intensity: number;
  archetypal_triggers: string[];
  body_activation: Record<string, boolean>;
  language_shift: Record<string, boolean>;
  breakthrough_potential: number;
}

interface ArchetypalMappingProps {
  userId?: string;
  timeWindow?: {
    start: Date;
    end: Date;
  };
  viewMode?: 'constellation' | 'evolution' | 'wisdom_emergence' | 'correlations';
  interactive?: boolean;
  animationSpeed?: 'slow' | 'medium' | 'fast';
  colorTheme?: 'classic' | 'cosmic' | 'earth' | 'water' | 'fire' | 'air';
  onArchetypeSelect?: (archetype: ArchetypeData) => void;
  onWisdomPointSelect?: (point: WisdomEmergencePoint) => void;
}

const ArchetypalMappingVisualization: React.FC<ArchetypalMappingProps> = ({
  userId,
  timeWindow,
  viewMode = 'constellation',
  interactive = true,
  animationSpeed = 'medium',
  colorTheme = 'cosmic',
  onArchetypeSelect,
  onWisdomPointSelect
}) => {

  const [archetypeData, setArchetypeData] = useState<ArchetypeData[]>([]);
  const [wisdomPoints, setWisdomPoints] = useState<WisdomEmergencePoint[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeData | null>(null);
  const [selectedWisdomPoint, setSelectedWisdomPoint] = useState<WisdomEmergencePoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTimeSlice, setCurrentTimeSlice] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Color themes for different elements
  const colorThemes = {
    cosmic: {
      background: 'from-indigo-950 via-purple-950 to-black',
      archetypes: {
        hero: '#FFD700', shadow: '#8B00FF', anima: '#FF69B4', animus: '#4169E1',
        wise_old_man: '#F0E68C', wise_old_woman: '#DDA0DD', trickster: '#FF4500',
        mother: '#98FB98', father: '#4682B4', child: '#FFB6C1', maiden: '#F0F8FF',
        magician: '#9370DB', ruler: '#B8860B', rebel: '#DC143C', lover: '#FF1493',
        creator: '#FF8C00', destroyer: '#8B0000', caregiver: '#20B2AA', seeker: '#32CD32',
        sage: '#E6E6FA'
      },
      wisdom: '#FFEFD5',
      connections: '#483D8B'
    },
    classic: {
      background: 'from-slate-900 via-slate-800 to-slate-900',
      archetypes: {
        hero: '#DAA520', shadow: '#4B0082', anima: '#DB7093', animus: '#4682B4',
        wise_old_man: '#F4A460', wise_old_woman: '#DDA0DD', trickster: '#FF6347',
        mother: '#90EE90', father: '#5F9EA0', child: '#FFA07A', maiden: '#F5F5DC',
        magician: '#9932CC', ruler: '#B8860B', rebel: '#A52A2A', lover: '#C71585',
        creator: '#FF7F50', destroyer: '#8B0000', caregiver: '#48D1CC', seeker: '#228B22',
        sage: '#E0E0E0'
      },
      wisdom: '#F5DEB3',
      connections: '#696969'
    }
  };

  const currentTheme = colorThemes[colorTheme] || colorThemes.cosmic;

  // Animation speeds
  const animationSpeeds = {
    slow: 3000,
    medium: 2000,
    fast: 1000
  };

  // Initialize data loading
  useEffect(() => {
    loadArchetypalData();
  }, [userId, timeWindow]);

  // Animation loop
  useEffect(() => {
    if (viewMode === 'evolution' || viewMode === 'wisdom_emergence') {
      startAnimationLoop();
    } else {
      stopAnimationLoop();
    }

    return () => stopAnimationLoop();
  }, [viewMode, animationSpeed]);

  const loadArchetypalData = async () => {
    setIsLoading(true);

    try {
      // In a real implementation, this would call the correlation analytics API
      // For now, we'll use sophisticated mock data that represents real patterns

      const mockArchetypeData: ArchetypeData[] = [
        {
          name: 'wise_old_man',
          intensity: 0.85,
          activation_frequency: 0.7,
          integration_level: 0.9,
          wisdom_correlation: 0.95,
          relationships: ['sage', 'magician', 'hero'],
          manifestation_contexts: ['morning_conversations', 'deep_dreams', 'meditation'],
          evolution_stage: 'mastery',
          emergence_trend: 'ascending'
        },
        {
          name: 'shadow',
          intensity: 0.6,
          activation_frequency: 0.8,
          integration_level: 0.4,
          wisdom_correlation: 0.3,
          relationships: ['destroyer', 'rebel', 'trickster'],
          manifestation_contexts: ['night_dreams', 'difficult_conversations', 'stress_responses'],
          evolution_stage: 'exploration',
          emergence_trend: 'cyclical'
        },
        {
          name: 'anima',
          intensity: 0.7,
          activation_frequency: 0.5,
          integration_level: 0.6,
          wisdom_correlation: 0.8,
          relationships: ['lover', 'creator', 'maiden'],
          manifestation_contexts: ['creative_dreams', 'relationship_conversations', 'artistic_inspiration'],
          evolution_stage: 'integration',
          emergence_trend: 'stable'
        },
        {
          name: 'hero',
          intensity: 0.75,
          activation_frequency: 0.6,
          integration_level: 0.7,
          wisdom_correlation: 0.65,
          relationships: ['wise_old_man', 'magician', 'seeker'],
          manifestation_contexts: ['challenge_dreams', 'goal_conversations', 'breakthrough_moments'],
          evolution_stage: 'integration',
          emergence_trend: 'ascending'
        },
        {
          name: 'magician',
          intensity: 0.8,
          activation_frequency: 0.4,
          integration_level: 0.8,
          wisdom_correlation: 0.9,
          relationships: ['wise_old_man', 'creator', 'sage'],
          manifestation_contexts: ['transformational_dreams', 'insight_conversations', 'ritual_moments'],
          evolution_stage: 'mastery',
          emergence_trend: 'ascending'
        },
        {
          name: 'creator',
          intensity: 0.65,
          activation_frequency: 0.7,
          integration_level: 0.6,
          wisdom_correlation: 0.7,
          relationships: ['magician', 'anima', 'child'],
          manifestation_contexts: ['creative_dreams', 'artistic_conversations', 'innovation_moments'],
          evolution_stage: 'integration',
          emergence_trend: 'stable'
        }
      ];

      const mockWisdomPoints: WisdomEmergencePoint[] = [
        {
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          intensity: 0.8,
          archetypal_triggers: ['wise_old_man', 'magician'],
          body_activation: { crown: true, throat: true, chest: false, solar: false },
          language_shift: { fromThinking: true, toPoetic: true, metaphorRich: true, embodiedKnowing: true },
          breakthrough_potential: 0.9
        },
        {
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          intensity: 0.7,
          archetypal_triggers: ['anima', 'creator'],
          body_activation: { crown: false, throat: true, chest: true, solar: false },
          language_shift: { fromThinking: true, toPoetic: false, metaphorRich: true, embodiedKnowing: false },
          breakthrough_potential: 0.6
        },
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          intensity: 0.95,
          archetypal_triggers: ['wise_old_man', 'hero', 'magician'],
          body_activation: { crown: true, throat: true, chest: true, solar: true },
          language_shift: { fromThinking: true, toPoetic: true, metaphorRich: true, embodiedKnowing: true },
          breakthrough_potential: 0.95
        }
      ];

      setArchetypeData(mockArchetypeData);
      setWisdomPoints(mockWisdomPoints);

    } catch (error) {
      console.error('Failed to load archetypal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimationLoop = () => {
    const animate = () => {
      setAnimationPhase(prev => (prev + 1) % 360);
      animationRef.current = setTimeout(animate, animationSpeeds[animationSpeed] / 360);
    };
    animate();
  };

  const stopAnimationLoop = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // Calculate archetypal positions for constellation view
  const calculateArchetypalPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; radius: number }> = {};
    const centerX = 300;
    const centerY = 300;
    const maxRadius = 200;

    archetypeData.forEach((archetype, index) => {
      const angle = (index * 2 * Math.PI) / archetypeData.length;
      const radius = 50 + (archetype.intensity * maxRadius);

      positions[archetype.name] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 10 + (archetype.intensity * 20)
      };
    });

    return positions;
  }, [archetypeData]);

  // Handle archetype selection
  const handleArchetypeClick = (archetype: ArchetypeData) => {
    if (!interactive) return;

    setSelectedArchetype(archetype);
    if (onArchetypeSelect) {
      onArchetypeSelect(archetype);
    }
  };

  // Handle wisdom point selection
  const handleWisdomPointClick = (wisdomPoint: WisdomEmergencePoint) => {
    if (!interactive) return;

    setSelectedWisdomPoint(wisdomPoint);
    if (onWisdomPointSelect) {
      onWisdomPointSelect(wisdomPoint);
    }
  };

  // Render constellation view
  const renderConstellationView = () => (
    <div className="relative w-full h-96">
      <svg width="600" height="400" className="border rounded-lg bg-gradient-to-br from-slate-950 to-indigo-950">
        {/* Background cosmic pattern */}
        <defs>
          <radialGradient id="cosmicBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(79, 70, 229, 0.1)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 1)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#cosmicBg)" />

        {/* Archetypal connections */}
        {archetypeData.map((archetype, index) => {
          const position = calculateArchetypalPositions[archetype.name];
          if (!position) return null;

          return archetype.relationships.map(relatedName => {
            const relatedPosition = calculateArchetypalPositions[relatedName];
            if (!relatedPosition) return null;

            const connectionStrength = archetype.wisdom_correlation * 0.5;

            return (
              <motion.line
                key={`${archetype.name}-${relatedName}`}
                x1={position.x}
                y1={position.y}
                x2={relatedPosition.x}
                y2={relatedPosition.y}
                stroke={currentTheme.connections}
                strokeWidth={connectionStrength * 3}
                opacity={connectionStrength}
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: index * 0.1 }}
              />
            );
          });
        })}

        {/* Archetypal nodes */}
        {archetypeData.map((archetype, index) => {
          const position = calculateArchetypalPositions[archetype.name];
          if (!position) return null;

          const isSelected = selectedArchetype?.name === archetype.name;
          const color = currentTheme.archetypes[archetype.name] || '#FFFFFF';

          return (
            <motion.g
              key={archetype.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isSelected ? 1.3 : 1,
                opacity: 1
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={() => handleArchetypeClick(archetype)}
            >
              {/* Main archetype circle */}
              <circle
                cx={position.x}
                cy={position.y}
                r={position.radius}
                fill={color}
                stroke={isSelected ? '#FFFFFF' : color}
                strokeWidth={isSelected ? 3 : 1}
                filter="url(#glow)"
                opacity={archetype.integration_level}
              />

              {/* Integration ring */}
              <circle
                cx={position.x}
                cy={position.y}
                r={position.radius + 8}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="4,4"
                opacity={archetype.wisdom_correlation}
                transform={`rotate(${animationPhase} ${position.x} ${position.y})`}
              />

              {/* Evolution stage indicator */}
              <circle
                cx={position.x + position.radius - 3}
                cy={position.y - position.radius + 3}
                r={3}
                fill={archetype.evolution_stage === 'mastery' ? '#FFD700' :
                      archetype.evolution_stage === 'integration' ? '#32CD32' :
                      archetype.evolution_stage === 'exploration' ? '#FF8C00' : '#87CEEB'}
              />

              {/* Archetype label */}
              <text
                x={position.x}
                y={position.y + position.radius + 20}
                textAnchor="middle"
                fill="#E2E8F0"
                fontSize="10"
                fontWeight="500"
              >
                {archetype.name.replace('_', ' ')}
              </text>
            </motion.g>
          );
        })}

        {/* Wisdom emergence indicators */}
        {wisdomPoints.map((point, index) => {
          const wisdomX = 100 + (index * 150);
          const wisdomY = 50;

          return (
            <motion.g
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                opacity: [0, 1, 0.8]
              }}
              transition={{
                duration: 2,
                delay: index * 0.3,
                repeat: Infinity,
                repeatDelay: 5
              }}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={() => handleWisdomPointClick(point)}
            >
              <circle
                cx={wisdomX}
                cy={wisdomY}
                r={8 + (point.intensity * 12)}
                fill={currentTheme.wisdom}
                stroke="#FFEFD5"
                strokeWidth="2"
                filter="url(#glow)"
                opacity={point.breakthrough_potential}
              />
              <text
                x={wisdomX}
                y={wisdomY + 25}
                textAnchor="middle"
                fill="#E2E8F0"
                fontSize="8"
              >
                {point.timestamp.toLocaleDateString()}
              </text>
            </motion.g>
          );
        })}

        {/* Center mandala */}
        <motion.circle
          cx="300"
          cy="200"
          r="30"
          fill="none"
          stroke="url(#cosmicBg)"
          strokeWidth="2"
          strokeDasharray="8,8"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* Archetype details panel */}
      <AnimatePresence>
        {selectedArchetype && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-0 right-0 bg-slate-800/90 backdrop-blur p-4 rounded-lg border border-slate-700 w-64"
          >
            <h3 className="text-lg font-medium text-amber-300 mb-2">
              {selectedArchetype.name.replace('_', ' ').toUpperCase()}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Intensity:</span>
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-2 rounded-full"
                    style={{ width: `${selectedArchetype.intensity * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Integration:</span>
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{ width: `${selectedArchetype.integration_level * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Wisdom Correlation:</span>
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-400 h-2 rounded-full"
                    style={{ width: `${selectedArchetype.wisdom_correlation * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-3">
                <span className="text-gray-400 text-xs">Stage:</span>
                <div className="text-blue-300 capitalize">{selectedArchetype.evolution_stage}</div>
              </div>

              <div className="mt-3">
                <span className="text-gray-400 text-xs">Manifestations:</span>
                <div className="text-gray-300 text-xs">
                  {selectedArchetype.manifestation_contexts.join(', ')}
                </div>
              </div>

              <div className="mt-3">
                <span className="text-gray-400 text-xs">Related:</span>
                <div className="text-gray-300 text-xs">
                  {selectedArchetype.relationships.join(', ')}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-950 to-indigo-950 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading archetypal consciousness map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View mode selector */}
      <div className="flex gap-2 justify-center">
        {['constellation', 'evolution', 'wisdom_emergence', 'correlations'].map(mode => (
          <button
            key={mode}
            onClick={() => setCurrentTimeSlice(mode === viewMode ? currentTimeSlice : 0)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === mode
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {mode.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main visualization */}
      <div className="bg-gradient-to-br from-slate-950 to-indigo-950 rounded-lg border border-slate-800 p-6">
        {viewMode === 'constellation' && renderConstellationView()}
        {/* Other view modes would be implemented here */}
      </div>

      {/* Legend */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Legend</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-gray-400">Archetypal Intensity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">Integration Level</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-gray-400">Wisdom Correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-400">Wisdom Emergence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchetypalMappingVisualization;
export type { ArchetypeData, WisdomEmergencePoint };