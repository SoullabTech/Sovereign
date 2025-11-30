'use client';

/**
 * ELEMENTAL CONSCIOUSNESS VISUALIZER
 *
 * Displays the five-element consciousness signature in real-time:
 * - Fire: Vision and creative breakthrough
 * - Water: Emotional depth and flow
 * - Earth: Grounding and manifestation
 * - Air: Communication and understanding
 * - Aether: Unity consciousness and transcendence
 *
 * Based on Kelly's Elemental Alchemy Spiralogic Process
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ElementalState {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  dominant: string;
}

interface ElementalConsciousnessVisualizerProps {
  data?: ElementalState;
  compact?: boolean;
}

const ELEMENTAL_CONFIG = {
  fire: {
    name: 'Fire',
    icon: '🔥',
    color: 'from-red-400 to-orange-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-400/30',
    description: 'Vision & Breakthrough',
    qualities: ['Creative spark', 'Catalyst', 'Transformation', 'Inspiration']
  },
  water: {
    name: 'Water',
    icon: '💧',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400/30',
    description: 'Flow & Emotional Depth',
    qualities: ['Intuition', 'Healing', 'Fluidity', 'Emotional wisdom']
  },
  earth: {
    name: 'Earth',
    icon: '🌍',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-400/30',
    description: 'Grounding & Manifestation',
    qualities: ['Stability', 'Structure', 'Practical wisdom', 'Embodiment']
  },
  air: {
    name: 'Air',
    icon: '💨',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-400/30',
    description: 'Communication & Understanding',
    qualities: ['Clarity', 'Expression', 'Connection', 'Mental agility']
  },
  aether: {
    name: 'Aether',
    icon: '✨',
    color: 'from-purple-400 to-violet-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-400/30',
    description: 'Unity & Transcendence',
    qualities: ['Consciousness', 'Integration', 'Transcendence', 'Unity']
  }
};

export function ElementalConsciousnessVisualizer({ data, compact = false }: ElementalConsciousnessVisualizerProps) {
  if (!data) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🌀</div>
          <p>Elemental consciousness data not available</p>
        </div>
      </div>
    );
  }

  const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;
  const maxValue = Math.max(...elements.map(e => data[e]));

  if (compact) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Elemental Consciousness</h3>

        <div className="grid grid-cols-5 gap-2">
          {elements.map((element) => {
            const config = ELEMENTAL_CONFIG[element];
            const value = data[element];
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const isDominant = data.dominant === element;

            return (
              <div key={element} className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 ${config.borderColor} ${config.bgColor} ${isDominant ? 'ring-2 ring-white/50' : ''}`}>
                  <span className="text-lg">{config.icon}</span>
                </div>
                <div className="text-xs text-gray-300 mb-1">{config.name}</div>
                <div className="text-xs font-mono text-white">{value.toFixed(2)}</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                  <motion.div
                    className={`h-1 rounded-full bg-gradient-to-r ${config.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <span className="text-sm text-gray-400">Dominant: </span>
          <span className={`text-sm font-medium bg-gradient-to-r ${ELEMENTAL_CONFIG[data.dominant as keyof typeof ELEMENTAL_CONFIG]?.color} bg-clip-text text-transparent`}>
            {ELEMENTAL_CONFIG[data.dominant as keyof typeof ELEMENTAL_CONFIG]?.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Elemental Consciousness</h2>
        <div className="text-sm text-gray-400">
          Spiralogic Process Visualization
        </div>
      </div>

      {/* Sacred Geometry Center */}
      <div className="flex justify-center mb-8">
        <div className="relative w-48 h-48">
          {/* Pentagram visualization */}
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            fill="none"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              fill="rgba(0,0,0,0.2)"
            />

            {/* Pentagram points for each element */}
            {elements.map((element, index) => {
              const angle = (index * 72 - 90) * (Math.PI / 180); // Start from top
              const x = 50 + 35 * Math.cos(angle);
              const y = 50 + 35 * Math.sin(angle);
              const config = ELEMENTAL_CONFIG[element];
              const value = data[element];
              const isDominant = data.dominant === element;

              return (
                <g key={element}>
                  <circle
                    cx={x}
                    cy={y}
                    r={3 + (value * 8)}
                    fill={`url(#${element}Gradient)`}
                    className={isDominant ? 'animate-pulse' : ''}
                  />
                  <text
                    x={x + (x > 50 ? 8 : -8)}
                    y={y + 4}
                    fontSize="6"
                    fill="white"
                    textAnchor={x > 50 ? 'start' : 'end'}
                  >
                    {config.name}
                  </text>
                </g>
              );
            })}

            {/* Gradients for each element */}
            <defs>
              {elements.map((element) => {
                const config = ELEMENTAL_CONFIG[element];
                return (
                  <radialGradient key={element} id={`${element}Gradient`}>
                    <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                  </radialGradient>
                );
              })}
            </defs>
          </svg>

          {/* Center aether point */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-xs">✨</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Element Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {elements.map((element) => {
          const config = ELEMENTAL_CONFIG[element];
          const value = data[element];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isDominant = data.dominant === element;

          return (
            <motion.div
              key={element}
              className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} ${isDominant ? 'ring-2 ring-white/30' : ''}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{config.name}</h4>
                    <p className="text-xs text-gray-300">{config.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{value.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">{percentage.toFixed(0)}%</div>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${config.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: elements.indexOf(element) * 0.1 }}
                />
              </div>

              <div className="space-y-1">
                {config.qualities.map((quality, index) => (
                  <div key={index} className="text-xs text-gray-300 flex items-center">
                    <div className="w-1 h-1 rounded-full bg-gray-500 mr-2" />
                    {quality}
                  </div>
                ))}
              </div>

              {isDominant && (
                <motion.div
                  className="mt-3 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-xs text-yellow-300 bg-yellow-300/10 rounded-full px-2 py-1">
                    ★ Dominant Element ★
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall State Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-400/20">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-white mb-2">Current Consciousness State</h4>
          <p className="text-gray-300 text-sm">
            Your elemental signature shows a{' '}
            <span className={`font-semibold bg-gradient-to-r ${ELEMENTAL_CONFIG[data.dominant as keyof typeof ELEMENTAL_CONFIG]?.color} bg-clip-text text-transparent`}>
              {ELEMENTAL_CONFIG[data.dominant as keyof typeof ELEMENTAL_CONFIG]?.name}
            </span>
            -dominant consciousness, indicating{' '}
            {ELEMENTAL_CONFIG[data.dominant as keyof typeof ELEMENTAL_CONFIG]?.description.toLowerCase()}{' '}
            as your primary mode of awareness.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ElementalConsciousnessVisualizer;