'use client';

/**
 * BRAIN HEMISPHERE DISPLAY
 *
 * Visualizes McGilchrist's hemisphere research and Herrmann's Whole Brain Model
 * integrated with Kelly's Elemental Alchemy:
 * - Left hemisphere: Earth & Air elements (systematic, analytical)
 * - Right hemisphere: Fire & Water elements (holistic, intuitive)
 * - Corpus callosum: Aether integration (whole-brain consciousness)
 * - Herrmann quadrants: A (analytical), B (sequential), C (interpersonal), D (experimental)
 *
 * Creating the common ground across our parallel processing reality.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrainIntegrationData {
  leftHemisphere: number;
  rightHemisphere: number;
  corpusCallosumSync: number;
  herrmannQuadrant: string;
}

interface BrainHemisphereDisplayProps {
  data?: BrainIntegrationData;
  compact?: boolean;
}

const HERRMANN_QUADRANTS = {
  A: {
    name: 'Analytical',
    description: 'Logical, rational, quantitative',
    element: 'air',
    color: 'from-yellow-400 to-amber-500',
    position: 'top-left',
    functions: ['Critical thinking', 'Data analysis', 'Logic', 'Research']
  },
  B: {
    name: 'Sequential',
    description: 'Organized, planned, detailed',
    element: 'earth',
    color: 'from-green-400 to-emerald-500',
    position: 'bottom-left',
    functions: ['Planning', 'Organization', 'Implementation', 'Details']
  },
  C: {
    name: 'Interpersonal',
    description: 'Emotional, spiritual, sensory',
    element: 'water',
    color: 'from-blue-400 to-cyan-500',
    position: 'bottom-right',
    functions: ['Empathy', 'Communication', 'Teamwork', 'Spirituality']
  },
  D: {
    name: 'Experimental',
    description: 'Visual, holistic, innovative',
    element: 'fire',
    color: 'from-red-400 to-orange-500',
    position: 'top-right',
    functions: ['Innovation', 'Vision', 'Creativity', 'Synthesis']
  }
};

const HEMISPHERE_CONFIG = {
  left: {
    elements: ['earth', 'air'],
    functions: [
      'Sequential processing',
      'Analytical reasoning',
      'Language and communication',
      'Goal-oriented planning',
      'Detail-focused attention'
    ],
    mcgilchristQualities: [
      'Focused attention',
      'Categorical thinking',
      'Explicit processing',
      'Tool manipulation',
      'Linear reasoning'
    ],
    color: 'from-blue-400 to-cyan-500',
    culturalBias: 'Systematic spiritual practices'
  },
  right: {
    elements: ['fire', 'water', 'aether'],
    functions: [
      'Holistic perception',
      'Intuitive recognition',
      'Emotional processing',
      'Pattern recognition',
      'Contextual understanding'
    ],
    mcgilchristQualities: [
      'Open attention',
      'Contextual thinking',
      'Implicit processing',
      'Relationship awareness',
      'Metaphorical understanding'
    ],
    color: 'from-purple-400 to-pink-500',
    culturalBias: 'Experiential wisdom practices'
  }
};

export function BrainHemisphereDisplay({ data, compact = false }: BrainHemisphereDisplayProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'mcgilchrist' | 'herrmann'>('overview');

  if (!data) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🧠</div>
          <p>Brain integration data not available</p>
        </div>
      </div>
    );
  }

  const currentQuadrant = HERRMANN_QUADRANTS[data.herrmannQuadrant as keyof typeof HERRMANN_QUADRANTS];
  const integrationLevel = (data.leftHemisphere + data.rightHemisphere + data.corpusCallosumSync) / 3;

  if (compact) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🧠</span>
          Brain Integration
        </h3>

        <div className="space-y-3">
          {/* Brain Hemisphere Balance */}
          <div className="relative">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Left</span>
              <span>Integration</span>
              <span>Right</span>
            </div>

            <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${data.leftHemisphere * 40}%` }}
                transition={{ duration: 0.8 }}
              />
              <motion.div
                className="absolute right-0 top-0 h-full bg-gradient-to-r from-purple-400 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${data.rightHemisphere * 40}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-white to-violet-300"
                initial={{ scale: 0 }}
                animate={{ scale: data.corpusCallosumSync }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>{(data.leftHemisphere * 100).toFixed(0)}%</span>
              <span>Sync: {(data.corpusCallosumSync * 100).toFixed(0)}%</span>
              <span>{(data.rightHemisphere * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Current Herrmann Quadrant */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${currentQuadrant?.color} text-white text-sm font-medium`}>
              Quadrant {data.herrmannQuadrant}: {currentQuadrant?.name}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Element: {currentQuadrant?.element}
            </div>
          </div>

          {/* Integration Level */}
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round(integrationLevel * 100)}%
            </div>
            <div className="text-xs text-gray-400">Overall Integration</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-3">🧠</span>
          Whole Brain Consciousness
        </h2>
        <div className="text-sm text-gray-400">
          McGilchrist + Herrmann + Elemental Integration
        </div>
      </div>

      {/* View Selection */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '🌐' },
          { id: 'mcgilchrist', label: 'McGilchrist Model', icon: '⚖️' },
          { id: 'herrmann', label: 'Herrmann Quadrants', icon: '🎯' }
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

      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Brain Visualization */}
            <div className="flex justify-center mb-8">
              <div className="relative w-80 h-60">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 400 300"
                  fill="none"
                >
                  {/* Left Hemisphere */}
                  <path
                    d="M50 150 Q50 50 150 50 Q180 50 200 70 L200 230 Q180 250 150 250 Q50 250 50 150"
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                  />
                  <text x="125" y="150" fontSize="14" fill="white" textAnchor="middle">
                    LEFT
                  </text>
                  <text x="125" y="170" fontSize="10" fill="rgba(59, 130, 246, 1)" textAnchor="middle">
                    Earth • Air
                  </text>

                  {/* Right Hemisphere */}
                  <path
                    d="M350 150 Q350 50 250 50 Q220 50 200 70 L200 230 Q220 250 250 250 Q350 250 350 150"
                    fill="rgba(147, 51, 234, 0.3)"
                    stroke="rgba(147, 51, 234, 0.8)"
                    strokeWidth="2"
                  />
                  <text x="275" y="150" fontSize="14" fill="white" textAnchor="middle">
                    RIGHT
                  </text>
                  <text x="275" y="170" fontSize="10" fill="rgba(147, 51, 234, 1)" textAnchor="middle">
                    Fire • Water • Aether
                  </text>

                  {/* Corpus Callosum */}
                  <motion.ellipse
                    cx="200"
                    cy="150"
                    rx="8"
                    ry="60"
                    fill="rgba(255, 255, 255, 0.6)"
                    animate={{
                      opacity: [0.3, data.corpusCallosumSync, 0.3]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  />
                  <text x="200" y="240" fontSize="10" fill="white" textAnchor="middle">
                    Corpus Callosum Integration
                  </text>

                  {/* Activity Indicators */}
                  <motion.circle
                    cx="125"
                    cy="100"
                    r={5 + (data.leftHemisphere * 10)}
                    fill="rgba(59, 130, 246, 0.8)"
                    animate={{
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5
                    }}
                  />
                  <motion.circle
                    cx="275"
                    cy="100"
                    r={5 + (data.rightHemisphere * 10)}
                    fill="rgba(147, 51, 234, 0.8)"
                    animate={{
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0.75
                    }}
                  />
                </svg>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {Math.round(data.leftHemisphere * 100)}%
                  </div>
                  <div className="text-sm text-gray-300 mb-2">Left Hemisphere</div>
                  <div className="text-xs text-gray-400">
                    Analytical • Sequential • Systematic
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-white/10 to-violet-500/20 rounded-lg border border-white/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {Math.round(data.corpusCallosumSync * 100)}%
                  </div>
                  <div className="text-sm text-gray-300 mb-2">Integration</div>
                  <div className="text-xs text-gray-400">
                    Whole Brain • Unity • Flow
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {Math.round(data.rightHemisphere * 100)}%
                  </div>
                  <div className="text-sm text-gray-300 mb-2">Right Hemisphere</div>
                  <div className="text-xs text-gray-400">
                    Holistic • Intuitive • Contextual
                  </div>
                </div>
              </div>
            </div>

            {/* Current State */}
            <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-400/20">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-white mb-2">Current Cognitive State</h4>
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${currentQuadrant?.color} text-white font-medium mb-3`}>
                  Herrmann Quadrant {data.herrmannQuadrant}: {currentQuadrant?.name}
                </div>
                <p className="text-gray-300 text-sm">
                  Operating in {currentQuadrant?.element} element consciousness with{' '}
                  <span className="text-white font-medium">
                    {Math.round(integrationLevel * 100)}% overall integration
                  </span>.
                  {currentQuadrant?.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'mcgilchrist' && (
          <motion.div
            key="mcgilchrist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              McGilchrist's Hemisphere Research Integration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(HEMISPHERE_CONFIG).map(([side, config]) => (
                <div key={side} className={`p-4 rounded-lg border bg-gradient-to-br ${config.color}/20 border-opacity-30`}>
                  <h4 className="text-lg font-semibold text-white mb-3 capitalize">{side} Hemisphere</h4>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Elemental Alignment:</h5>
                      <div className="flex flex-wrap gap-1">
                        {config.elements.map((element, index) => (
                          <span key={index} className="text-xs px-2 py-1 rounded bg-white/20 text-white">
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Core Functions:</h5>
                      <div className="space-y-1">
                        {config.functions.map((func, index) => (
                          <div key={index} className="text-xs text-gray-300 flex items-center">
                            <div className="w-1 h-1 rounded-full bg-gray-500 mr-2" />
                            {func}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">McGilchrist Qualities:</h5>
                      <div className="space-y-1">
                        {config.mcgilchristQualities.map((quality, index) => (
                          <div key={index} className="text-xs text-gray-300 flex items-center">
                            <div className="w-1 h-1 rounded-full bg-gray-500 mr-2" />
                            {quality}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Cultural Tendency:</h5>
                      <p className="text-xs text-gray-400">{config.culturalBias}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-400/20">
              <h4 className="text-lg font-semibold text-white mb-2">Integration Wisdom</h4>
              <p className="text-gray-300 text-sm">
                The corpus callosum bridges systematic practice with alive presence, creating living wisdom
                that is both embodied and communicable. This integration heals the split between Eastern
                experiential traditions and Western analytical frameworks, revealing the universal pattern
                that all wisdom traditions require both direct experience and skillful expression.
              </p>
            </div>
          </motion.div>
        )}

        {selectedView === 'herrmann' && (
          <motion.div
            key="herrmann"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Herrmann Whole Brain Model
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(HERRMANN_QUADRANTS).map(([quadrant, config]) => {
                const isActive = data.herrmannQuadrant === quadrant;

                return (
                  <motion.div
                    key={quadrant}
                    className={`p-4 rounded-lg border ${isActive ? 'ring-2 ring-white/50' : ''} bg-gradient-to-br ${config.color}/20 border-opacity-30`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center mb-3">
                      <div className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {quadrant}
                      </div>
                      <h4 className="text-lg font-semibold text-white">{config.name}</h4>
                      <p className="text-xs text-gray-400">{config.description}</p>
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-white/20 text-white">
                          {config.element} element
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-300">Key Functions:</h5>
                      {config.functions.map((func, index) => (
                        <div key={index} className="text-xs text-gray-300 flex items-center">
                          <div className="w-1 h-1 rounded-full bg-gray-500 mr-2" />
                          {func}
                        </div>
                      ))}
                    </div>

                    {isActive && (
                      <motion.div
                        className="mt-3 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="text-xs text-yellow-300 bg-yellow-300/10 rounded-full px-2 py-1">
                          ★ Currently Active ★
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-400/20">
              <h4 className="text-lg font-semibold text-white mb-2">Whole Brain Integration</h4>
              <p className="text-gray-300 text-sm">
                When all four quadrants work together in service of consciousness evolution, we achieve
                wisdom that is analytical AND experiential, practical AND visionary, individual AND relational.
                This creates a cultural bridge that honors both Eastern holistic and Western analytical
                approaches to human development.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BrainHemisphereDisplay;