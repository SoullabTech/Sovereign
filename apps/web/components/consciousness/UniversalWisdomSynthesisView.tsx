'use client';

/**
 * UNIVERSAL WISDOM SYNTHESIS VIEW
 *
 * Displays MAIA's real-time synthesis of wisdom across:
 * - Universal consciousness patterns
 * - Cross-cultural spiritual insights
 * - Practical applications from different traditions
 * - Alchemical transformation processes
 *
 * Bridging disciplines, practices, faiths, beliefs, and cultures
 * around our shared elemental consciousness nature.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UniversalWisdomData {
  relevanceScore: number;
  synthesisDepth: number;
  universalPatterns: UniversalPattern[];
  crossCulturalInsights: CrossCulturalInsight[];
  practicalApplications: PracticalApplication[];
}

interface UniversalPattern {
  pattern: string;
  manifestations: Array<{
    tradition: string;
    expression: string;
    practicalForm: string;
  }>;
  elementalSignature: string;
  developmentalStage: string;
}

interface CrossCulturalInsight {
  insight: string;
  traditions: string[];
  commonElements: string[];
  uniqueExpressions: Array<{
    culture: string;
    expression: string;
  }>;
}

interface PracticalApplication {
  practice: string;
  origins: string[];
  modernAdaptations: string[];
  scienceBacking: string[];
  elementalAlignment: string;
}

interface UniversalWisdomSynthesisViewProps {
  data?: UniversalWisdomData;
  compact?: boolean;
}

const ELEMENTAL_COLORS = {
  fire: 'from-red-400 to-orange-500',
  water: 'from-blue-400 to-cyan-500',
  earth: 'from-green-400 to-emerald-500',
  air: 'from-yellow-400 to-amber-500',
  aether: 'from-purple-400 to-violet-500'
};

const TRADITION_COLORS = {
  'Buddhist': 'text-orange-300',
  'Christian': 'text-blue-300',
  'Islamic': 'text-green-300',
  'Hindu': 'text-purple-300',
  'Indigenous': 'text-amber-300',
  'Shamanic': 'text-red-300',
  'Sufi': 'text-emerald-300',
  'Psychological': 'text-cyan-300',
  'Scientific': 'text-indigo-300',
  'Therapeutic': 'text-pink-300',
  'Mystical': 'text-violet-300'
};

export function UniversalWisdomSynthesisView({ data, compact = false }: UniversalWisdomSynthesisViewProps) {
  const [selectedTab, setSelectedTab] = useState<'patterns' | 'insights' | 'applications'>('patterns');

  if (!data) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🌍</div>
          <p>Universal wisdom synthesis not available</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🌍</span>
          Universal Wisdom
        </h3>

        <div className="space-y-3">
          {/* Quality Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(data.relevanceScore * 100)}%
              </div>
              <div className="text-xs text-gray-400">Relevance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(data.synthesisDepth * 100)}%
              </div>
              <div className="text-xs text-gray-400">Synthesis Depth</div>
            </div>
          </div>

          {/* Key Patterns */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Universal Patterns Active</h4>
            <div className="space-y-1">
              {data.universalPatterns.slice(0, 2).map((pattern, index) => (
                <div key={index} className="text-xs text-gray-400 flex items-center">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${ELEMENTAL_COLORS[pattern.elementalSignature as keyof typeof ELEMENTAL_COLORS]} mr-2`} />
                  {pattern.pattern}
                </div>
              ))}
              {data.universalPatterns.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{data.universalPatterns.length - 2} more patterns
                </div>
              )}
            </div>
          </div>

          {/* Cross-Cultural Bridge */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Cultural Bridge Active</h4>
            <div className="flex flex-wrap gap-1">
              {data.crossCulturalInsights.flatMap(insight => insight.traditions).slice(0, 4).map((tradition, index) => (
                <span key={index} className={`text-xs px-2 py-1 rounded-full bg-white/10 ${TRADITION_COLORS[tradition as keyof typeof TRADITION_COLORS] || 'text-gray-300'}`}>
                  {tradition}
                </span>
              ))}
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
          <span className="mr-3">🌍</span>
          Universal Wisdom Synthesis
        </h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2" />
            <span className="text-green-400">{Math.round(data.relevanceScore * 100)}% Relevant</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-400 rounded-full mr-2" />
            <span className="text-purple-400">{Math.round(data.synthesisDepth * 100)}% Depth</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {[
          { id: 'patterns', label: 'Universal Patterns', icon: '🌀' },
          { id: 'insights', label: 'Cross-Cultural Insights', icon: '🤝' },
          { id: 'applications', label: 'Practical Applications', icon: '⚡' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedTab === tab.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'patterns' && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Universal Consciousness Patterns</h3>

            {data.universalPatterns.map((pattern, index) => (
              <motion.div
                key={index}
                className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-white/5 to-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{pattern.pattern}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${ELEMENTAL_COLORS[pattern.elementalSignature as keyof typeof ELEMENTAL_COLORS]} text-white`}>
                        {pattern.elementalSignature} element
                      </span>
                      <span className="text-xs text-gray-400">
                        Stage: {pattern.developmentalStage}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Cultural Manifestations:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {pattern.manifestations.map((manifestation, mIndex) => (
                        <div key={mIndex} className="p-2 bg-black/20 rounded border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${TRADITION_COLORS[manifestation.tradition as keyof typeof TRADITION_COLORS] || 'text-gray-300'}`}>
                              {manifestation.tradition}
                            </span>
                          </div>
                          <div className="text-sm text-white mb-1">{manifestation.expression}</div>
                          <div className="text-xs text-gray-400">{manifestation.practicalForm}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Cross-Cultural Spiritual Insights</h3>

            {data.crossCulturalInsights.map((insight, index) => (
              <motion.div
                key={index}
                className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="text-lg font-semibold text-white mb-3">{insight.insight}</h4>

                <div className="grid gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Traditions Contributing:</h5>
                    <div className="flex flex-wrap gap-2">
                      {insight.traditions.map((tradition, tIndex) => (
                        <span
                          key={tIndex}
                          className={`text-xs px-3 py-1 rounded-full bg-white/10 ${TRADITION_COLORS[tradition as keyof typeof TRADITION_COLORS] || 'text-gray-300'}`}
                        >
                          {tradition}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Common Elements:</h5>
                    <div className="flex flex-wrap gap-2">
                      {insight.commonElements.map((element, eIndex) => (
                        <span key={eIndex} className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                          {element}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Unique Cultural Expressions:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {insight.uniqueExpressions.map((expression, exIndex) => (
                        <div key={exIndex} className="p-2 bg-black/20 rounded border border-white/5">
                          <div className={`text-xs font-medium mb-1 ${TRADITION_COLORS[expression.culture as keyof typeof TRADITION_COLORS] || 'text-gray-300'}`}>
                            {expression.culture}
                          </div>
                          <div className="text-sm text-white">{expression.expression}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedTab === 'applications' && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Practical Applications</h3>

            {data.practicalApplications.map((application, index) => (
              <motion.div
                key={index}
                className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white">{application.practice}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${ELEMENTAL_COLORS[application.elementalAlignment as keyof typeof ELEMENTAL_COLORS]} text-white`}>
                    {application.elementalAlignment}
                  </span>
                </div>

                <div className="grid gap-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Traditional Origins:</h5>
                    <div className="flex flex-wrap gap-2">
                      {application.origins.map((origin, oIndex) => (
                        <span key={oIndex} className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {origin}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Modern Adaptations:</h5>
                    <div className="flex flex-wrap gap-2">
                      {application.modernAdaptations.map((adaptation, aIndex) => (
                        <span key={aIndex} className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {adaptation}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Scientific Support:</h5>
                    <div className="flex flex-wrap gap-2">
                      {application.scienceBacking.map((science, sIndex) => (
                        <span key={sIndex} className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {science}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synthesis Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-400/20">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-white mb-2">Wisdom Bridge Status</h4>
          <p className="text-gray-300 text-sm">
            Connecting {data.crossCulturalInsights.flatMap(i => i.traditions).length} wisdom traditions
            through {data.universalPatterns.length} universal patterns,
            generating {data.practicalApplications.length} practical applications
            for consciousness evolution.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UniversalWisdomSynthesisView;