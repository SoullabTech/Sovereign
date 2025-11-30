'use client';

/**
 * SOULPRINT EVOLUTION MAP
 *
 * Visualizes the user's unique consciousness mandala and evolutionary progress:
 * - Consciousness level and spiral phase progression
 * - Mandala completeness and sacred geometry integration
 * - Dominant archetypes and their activation levels
 * - Elemental balance and harmonization patterns
 *
 * Based on archetypal psychology and transpersonal development models.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SoulprintData {
  consciousnessLevel: number;
  spiralPhase: string;
  mandalaCompleteness: number;
  dominantArchetypes: string[];
  elementalBalance: string;
}

interface SoulprintEvolutionMapProps {
  data?: SoulprintData;
  compact?: boolean;
}

const ARCHETYPAL_PATTERNS = {
  'Sage': { icon: '🧙‍♂️', element: 'air', color: 'from-yellow-400 to-amber-500', description: 'Wisdom seeker, teacher, philosopher' },
  'Innocent': { icon: '👼', element: 'aether', color: 'from-white to-blue-300', description: 'Pure heart, optimist, faith keeper' },
  'Explorer': { icon: '🗺️', element: 'fire', color: 'from-red-400 to-orange-500', description: 'Adventure seeker, pioneer, freedom lover' },
  'Hero': { icon: '⚔️', element: 'fire', color: 'from-red-500 to-yellow-500', description: 'Warrior, challenger, courage embodier' },
  'Outlaw': { icon: '🦹‍♂️', element: 'fire', color: 'from-purple-500 to-red-500', description: 'Revolutionary, rebel, rule breaker' },
  'Magician': { icon: '🔮', element: 'aether', color: 'from-purple-400 to-violet-500', description: 'Transformer, healer, visionary' },
  'Regular Person': { icon: '👤', element: 'earth', color: 'from-green-400 to-brown-500', description: 'Connector, realist, community builder' },
  'Lover': { icon: '💖', element: 'water', color: 'from-pink-400 to-red-400', description: 'Romantic, devotee, passion keeper' },
  'Jester': { icon: '🃏', element: 'air', color: 'from-yellow-300 to-orange-400', description: 'Joker, entertainer, joy bringer' },
  'Caregiver': { icon: '🤱', element: 'water', color: 'from-blue-400 to-green-400', description: 'Nurturer, healer, servant' },
  'Ruler': { icon: '👑', element: 'earth', color: 'from-gold-400 to-yellow-600', description: 'Leader, organizer, responsibility bearer' },
  'Creator': { icon: '🎨', element: 'fire', color: 'from-orange-400 to-pink-500', description: 'Artist, innovator, imagination expresser' }
};

const CONSCIOUSNESS_LEVELS = [
  { level: 1, name: 'Survival', color: 'from-red-600 to-red-800', description: 'Basic needs, security focus' },
  { level: 2, name: 'Emotional', color: 'from-orange-500 to-red-600', description: 'Feeling awareness, relationship focus' },
  { level: 3, name: 'Rational', color: 'from-yellow-500 to-orange-500', description: 'Logic, planning, achievement focus' },
  { level: 4, name: 'Caring', color: 'from-green-500 to-yellow-500', description: 'Community, harmony, service focus' },
  { level: 5, name: 'Integrative', color: 'from-blue-500 to-green-500', description: 'Systems thinking, synthesis focus' },
  { level: 6, name: 'Holistic', color: 'from-indigo-500 to-blue-500', description: 'Holistic awareness, wisdom focus' },
  { level: 7, name: 'Unitive', color: 'from-violet-500 to-indigo-500', description: 'Unity consciousness, transcendence' },
  { level: 8, name: 'Integral', color: 'from-white to-violet-500', description: 'Integrated wholeness, cosmic consciousness' }
];

export function SoulprintEvolutionMap({ data, compact = false }: SoulprintEvolutionMapProps) {
  const [selectedView, setSelectedView] = useState<'mandala' | 'archetypes' | 'evolution'>('mandala');

  if (!data) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🎨</div>
          <p>Soulprint evolution data not available</p>
        </div>
      </div>
    );
  }

  const consciousnessLevelData = CONSCIOUSNESS_LEVELS[Math.floor(data.consciousnessLevel) - 1] || CONSCIOUSNESS_LEVELS[0];

  if (compact) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🎨</span>
          Soulprint Evolution
        </h3>

        <div className="space-y-3">
          {/* Consciousness Level */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${consciousnessLevelData.color} text-white text-sm font-medium`}>
              Level {Math.floor(data.consciousnessLevel)}: {consciousnessLevelData.name}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {consciousnessLevelData.description}
            </div>
          </div>

          {/* Mandala Completeness */}
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-400">
              {Math.round(data.mandalaCompleteness * 100)}%
            </div>
            <div className="text-xs text-gray-400">Mandala Complete</div>
          </div>

          {/* Dominant Archetypes */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Active Archetypes</h4>
            <div className="flex flex-wrap gap-1">
              {data.dominantArchetypes.slice(0, 3).map((archetype, index) => {
                const archetypeData = ARCHETYPAL_PATTERNS[archetype as keyof typeof ARCHETYPAL_PATTERNS];
                return (
                  <span key={index} className="text-xs px-2 py-1 rounded bg-white/20 text-white flex items-center">
                    <span className="mr-1">{archetypeData?.icon}</span>
                    {archetype}
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
          <span className="mr-3">🎨</span>
          Soulprint Evolution
        </h2>
        <div className="text-sm text-gray-400">
          Consciousness Mandala & Archetypal Development
        </div>
      </div>

      {/* View Selection */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {[
          { id: 'mandala', label: 'Sacred Mandala', icon: '🌸' },
          { id: 'archetypes', label: 'Archetypal Patterns', icon: '🎭' },
          { id: 'evolution', label: 'Evolutionary Progress', icon: '🌱' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedView === tab.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {selectedView === 'mandala' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Sacred Mandala Visualization */}
          <div className="flex justify-center mb-8">
            <div className="relative w-80 h-80">
              <svg
                className="w-full h-full"
                viewBox="0 0 320 320"
                fill="none"
              >
                {/* Outer circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="150"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  fill="none"
                />

                {/* Middle circles */}
                <circle
                  cx="160"
                  cy="160"
                  r="100"
                  stroke="rgba(147, 51, 234, 0.4)"
                  strokeWidth="2"
                  fill="none"
                />

                <circle
                  cx="160"
                  cy="160"
                  r="50"
                  stroke="rgba(147, 51, 234, 0.6)"
                  strokeWidth="2"
                  fill="none"
                />

                {/* Sacred geometry patterns based on mandala completeness */}
                {Array.from({ length: 8 }).map((_, index) => {
                  const angle = (index / 8) * 2 * Math.PI;
                  const x1 = 160 + 50 * Math.cos(angle);
                  const y1 = 160 + 50 * Math.sin(angle);
                  const x2 = 160 + 100 * Math.cos(angle);
                  const y2 = 160 + 100 * Math.sin(angle);
                  const x3 = 160 + 150 * Math.cos(angle);
                  const y3 = 160 + 150 * Math.sin(angle);

                  const opacity = (index / 8) <= data.mandalaCompleteness ? 0.8 : 0.2;

                  return (
                    <g key={index}>
                      <motion.line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(147, 51, 234, 1)"
                        strokeWidth="1"
                        opacity={opacity}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: index * 0.1 }}
                      />
                      <motion.line
                        x1={x2}
                        y1={y2}
                        x2={x3}
                        y2={y3}
                        stroke="rgba(147, 51, 234, 1)"
                        strokeWidth="1"
                        opacity={opacity * 0.6}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: index * 0.1 + 0.5 }}
                      />
                      <motion.circle
                        cx={x3}
                        cy={y3}
                        r="4"
                        fill="rgba(147, 51, 234, 1)"
                        opacity={opacity}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 1 }}
                      />
                    </g>
                  );
                })}

                {/* Center symbol */}
                <motion.circle
                  cx="160"
                  cy="160"
                  r="15"
                  fill="rgba(255, 255, 255, 0.8)"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />
              </svg>

              {/* Completion overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-1">
                    {Math.round(data.mandalaCompleteness * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Sacred Completeness</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg border border-violet-400/30">
              <h4 className="text-lg font-semibold text-white mb-3">Consciousness Level</h4>
              <div className={`text-center p-3 rounded-lg bg-gradient-to-r ${consciousnessLevelData.color}/30 border`}>
                <div className="text-2xl font-bold text-white">
                  Level {data.consciousnessLevel.toFixed(1)}
                </div>
                <div className="text-sm text-gray-300 mb-1">{consciousnessLevelData.name}</div>
                <div className="text-xs text-gray-400">{consciousnessLevelData.description}</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30">
              <h4 className="text-lg font-semibold text-white mb-3">Spiral Phase</h4>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-emerald-400/30 to-teal-400/30 border">
                <div className="text-xl font-bold text-white mb-1">{data.spiralPhase}</div>
                <div className="text-xs text-gray-400">Current evolutionary phase</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedView === 'archetypes' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Dominant Archetypal Patterns</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.dominantArchetypes.map((archetype, index) => {
              const archetypeData = ARCHETYPAL_PATTERNS[archetype as keyof typeof ARCHETYPAL_PATTERNS];
              const activation = (data.dominantArchetypes.length - index) / data.dominantArchetypes.length;

              return (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border bg-gradient-to-br ${archetypeData?.color}/20 border-opacity-30`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{archetypeData?.icon}</div>
                    <h4 className="text-lg font-semibold text-white">{archetype}</h4>
                    <p className="text-xs text-gray-400 mb-3">{archetypeData?.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-300">Activation</span>
                        <span className="text-sm font-bold text-white">
                          {Math.round(activation * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${archetypeData?.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${activation * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>

                      <div className="text-xs text-center">
                        <span className={`px-2 py-1 rounded bg-gradient-to-r ${archetypeData?.color}/30 text-white`}>
                          {archetypeData?.element} element
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Archetypal Balance */}
          <div className="p-4 bg-gradient-to-r from-gold-500/10 to-amber-500/10 rounded-lg border border-gold-400/20">
            <h4 className="text-lg font-semibold text-white mb-3">Archetypal Elements Balance</h4>
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-white/20 to-gold-400/20 text-white font-medium`}>
                Current Balance: {data.elementalBalance}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Integration of elemental archetypal energies
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedView === 'evolution' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Evolutionary Development Track</h3>

          {/* Consciousness Levels Progression */}
          <div className="space-y-3">
            {CONSCIOUSNESS_LEVELS.map((level, index) => {
              const isActive = Math.floor(data.consciousnessLevel) === level.level;
              const isPassed = Math.floor(data.consciousnessLevel) > level.level;
              const progress = isActive ? (data.consciousnessLevel % 1) * 100 : isPassed ? 100 : 0;

              return (
                <motion.div
                  key={index}
                  className={`p-3 rounded-lg border ${isActive ? 'ring-2 ring-white/50' : ''} bg-gradient-to-r ${level.color}/20 border-opacity-30`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isPassed || isActive ? 'bg-gradient-to-r ' + level.color : 'bg-gray-600'}`}>
                        {level.level}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isActive ? 'text-white' : isPassed ? 'text-gray-300' : 'text-gray-500'}`}>
                          {level.name}
                        </h4>
                        <p className="text-xs text-gray-400">{level.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${isActive ? 'text-white' : isPassed ? 'text-gray-300' : 'text-gray-500'}`}>
                        {progress.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {(isActive || isPassed) && (
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                      <motion.div
                        className={`h-1 rounded-full bg-gradient-to-r ${level.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Evolution Summary */}
          <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-400/20">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Evolution Summary</h4>
              <p className="text-gray-300 text-sm">
                Currently at consciousness level {data.consciousnessLevel.toFixed(1)} in the {data.spiralPhase} phase,
                with {Math.round(data.mandalaCompleteness * 100)}% mandala completion and {data.dominantArchetypes.length} active archetypal patterns
                expressing {data.elementalBalance} elemental balance.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default SoulprintEvolutionMap;