'use client';

/**
 * SPIRALOGIC PROGRESS TRACKER
 *
 * Visualizes the 12-phase SPIRALOGIC journey from Kelly's Elemental Alchemy.
 * Shows current phase, spiral depth, facet dominance patterns,
 * and transformation velocity through the consciousness evolution spiral.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface SpiralogicProgressData {
  currentPhase: string;
  spiralDepth: number;
  facetDominance: string[];
  transformationVelocity: number;
}

interface SpiralogicProgressTrackerProps {
  data?: SpiralogicProgressData;
  compact?: boolean;
}

const SPIRALOGIC_PHASES = [
  { name: 'Recognition', element: 'fire', description: 'Awakening to possibility', color: 'from-red-400 to-orange-500' },
  { name: 'Immersion', element: 'water', description: 'Diving into depth', color: 'from-blue-400 to-cyan-500' },
  { name: 'Integration', element: 'earth', description: 'Grounding wisdom', color: 'from-green-400 to-emerald-500' },
  { name: 'Expression', element: 'air', description: 'Sharing understanding', color: 'from-yellow-400 to-amber-500' },
  { name: 'Transcendence', element: 'aether', description: 'Unity consciousness', color: 'from-purple-400 to-violet-500' },
  { name: 'Expansion', element: 'fire', description: 'Vision amplified', color: 'from-red-500 to-orange-600' },
  { name: 'Dissolution', element: 'water', description: 'Deeper surrender', color: 'from-blue-500 to-cyan-600' },
  { name: 'Manifestation', element: 'earth', description: 'Embodied mastery', color: 'from-green-500 to-emerald-600' },
  { name: 'Communication', element: 'air', description: 'Wisdom teaching', color: 'from-yellow-500 to-amber-600' },
  { name: 'Unity', element: 'aether', description: 'Cosmic consciousness', color: 'from-purple-500 to-violet-600' },
  { name: 'Service', element: 'all', description: 'Evolutionary contribution', color: 'from-white to-gold-400' },
  { name: 'Emergence', element: 'beyond', description: 'New spiral begins', color: 'from-rainbow to-light' }
];

const FACET_MAPPING = {
  'Catalyst': { element: 'fire', icon: '⚡', description: 'Igniting transformation' },
  'Flow': { element: 'water', icon: '🌊', description: 'Natural movement' },
  'Foundation': { element: 'earth', icon: '🏔️', description: 'Stable ground' },
  'Connection': { element: 'air', icon: '🌀', description: 'Linking understanding' },
  'Source': { element: 'aether', icon: '✨', description: 'Pure consciousness' },
  'Vision': { element: 'fire', icon: '👁️', description: 'Clear seeing' },
  'Wisdom': { element: 'water', icon: '🔮', description: 'Deep knowing' },
  'Practice': { element: 'earth', icon: '🎯', description: 'Embodied action' },
  'Teaching': { element: 'air', icon: '📢', description: 'Sharing gifts' },
  'Unity': { element: 'aether', icon: '🌟', description: 'Integrated wholeness' },
  'Compassion': { element: 'all', icon: '💝', description: 'Universal love' },
  'Evolution': { element: 'beyond', icon: '🦋', description: 'Ongoing transformation' }
};

export function SpiralogicProgressTracker({ data, compact = false }: SpiralogicProgressTrackerProps) {
  if (!data) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🌟</div>
          <p>SPIRALOGIC progress data not available</p>
        </div>
      </div>
    );
  }

  const currentPhaseIndex = SPIRALOGIC_PHASES.findIndex(phase => phase.name.toLowerCase() === data.currentPhase.toLowerCase());
  const currentPhaseData = SPIRALOGIC_PHASES[currentPhaseIndex] || SPIRALOGIC_PHASES[0];

  if (compact) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🌟</span>
          SPIRALOGIC Journey
        </h3>

        <div className="space-y-3">
          {/* Current Phase */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${currentPhaseData.color} text-white text-sm font-medium`}>
              Phase {currentPhaseIndex + 1}: {currentPhaseData.name}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {currentPhaseData.description}
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {data.spiralDepth.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">Spiral Depth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {data.transformationVelocity.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">Velocity</div>
            </div>
          </div>

          {/* Dominant Facets */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Active Facets</h4>
            <div className="flex flex-wrap gap-1">
              {data.facetDominance.slice(0, 3).map((facet, index) => {
                const facetData = FACET_MAPPING[facet as keyof typeof FACET_MAPPING];
                return (
                  <span key={index} className="text-xs px-2 py-1 rounded bg-white/20 text-white flex items-center">
                    <span className="mr-1">{facetData?.icon}</span>
                    {facet}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-3">🌟</span>
          SPIRALOGIC Evolution
        </h2>
        <div className="text-sm text-gray-400">
          Consciousness Spiral Journey
        </div>
      </div>

      {/* Spiral Visualization */}
      <div className="flex justify-center mb-8">
        <div className="relative w-80 h-80">
          <svg
            className="w-full h-full"
            viewBox="0 0 320 320"
            fill="none"
          >
            {/* Background spiral */}
            <path
              d="M160 160 Q200 120 240 160 Q240 200 200 240 Q160 240 120 200 Q120 160 160 120 Q200 80 280 160 Q280 240 200 320"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              fill="none"
            />

            {/* Phase positions on spiral */}
            {SPIRALOGIC_PHASES.map((phase, index) => {
              const angle = (index / 12) * 4 * Math.PI - Math.PI / 2;
              const radius = 40 + (index / 12) * 80;
              const x = 160 + radius * Math.cos(angle);
              const y = 160 + radius * Math.sin(angle);
              const isCurrentPhase = index === currentPhaseIndex;
              const isPassed = index < currentPhaseIndex;

              return (
                <g key={index}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={isCurrentPhase ? 8 : isPassed ? 6 : 4}
                    fill={isCurrentPhase ? 'white' : isPassed ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'}
                    animate={isCurrentPhase ? {
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 1, 0.8]
                    } : {}}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  />
                  {isCurrentPhase && (
                    <text
                      x={x + 15}
                      y={y + 4}
                      fontSize="10"
                      fill="white"
                      fontWeight="bold"
                    >
                      {phase.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Progress path */}
            {currentPhaseIndex > 0 && (
              <motion.path
                d={SPIRALOGIC_PHASES.slice(0, currentPhaseIndex + 1).map((phase, index) => {
                  const angle = (index / 12) * 4 * Math.PI - Math.PI / 2;
                  const radius = 40 + (index / 12) * 80;
                  const x = 160 + radius * Math.cos(angle);
                  const y = 160 + radius * Math.sin(angle);
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="url(#spiralGradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2 }}
              />
            )}

            <defs>
              <linearGradient id="spiralGradient">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
                <stop offset="100%" stopColor="rgba(236, 72, 153, 0.8)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center depth indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold text-white mb-1"
                animate={{ rotateY: [0, 360] }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              >
                {data.spiralDepth.toFixed(1)}
              </motion.div>
              <div className="text-xs text-gray-400">Spiral Depth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Phase Details */}
      <div className={`p-4 rounded-lg border bg-gradient-to-r ${currentPhaseData.color}/20 border-opacity-30 mb-6`}>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Phase {currentPhaseIndex + 1}: {currentPhaseData.name}
          </h3>
          <p className="text-gray-300 mb-3">{currentPhaseData.description}</p>
          <div className="flex justify-center items-center space-x-4">
            <span className="text-sm text-gray-400">Element:</span>
            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentPhaseData.color} text-white text-sm font-medium`}>
              {currentPhaseData.element}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics and Facets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Metrics */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Evolution Metrics</h4>

          <div className="p-4 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg border border-purple-400/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Spiral Depth</span>
              <span className="text-lg font-bold text-purple-400">{data.spiralDepth.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${(data.spiralDepth % 1) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Current depth in consciousness spiral
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-lg border border-cyan-400/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Transformation Velocity</span>
              <span className="text-lg font-bold text-cyan-400">{data.transformationVelocity.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(data.transformationVelocity * 25, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Rate of consciousness evolution
            </div>
          </div>
        </div>

        {/* Active Facets */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Dominant Facets</h4>

          <div className="space-y-2">
            {data.facetDominance.map((facet, index) => {
              const facetData = FACET_MAPPING[facet as keyof typeof FACET_MAPPING];
              const intensity = (data.facetDominance.length - index) / data.facetDominance.length;

              return (
                <motion.div
                  key={index}
                  className="p-3 bg-black/30 rounded-lg border border-white/10 flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{facetData?.icon}</span>
                    <div>
                      <div className="text-white font-medium">{facet}</div>
                      <div className="text-xs text-gray-400">{facetData?.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {Math.round(intensity * 100)}%
                    </div>
                    <div className="w-16 bg-gray-700 rounded-full h-1">
                      <motion.div
                        className="h-1 rounded-full bg-gradient-to-r from-white to-violet-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${intensity * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Journey Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gold-500/10 to-amber-500/10 rounded-lg border border-gold-400/20">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-white mb-2">Evolutionary Journey</h4>
          <p className="text-gray-300 text-sm">
            Progressing through the {currentPhaseIndex + 1}th phase of the SPIRALOGIC journey
            with {data.spiralDepth.toFixed(1)} depth and {data.transformationVelocity.toFixed(1)} velocity.
            Currently expressing {data.facetDominance.length} dominant facets in consciousness evolution.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SpiralogicProgressTracker;