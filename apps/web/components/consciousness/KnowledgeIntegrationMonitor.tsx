'use client';

/**
 * KNOWLEDGE INTEGRATION MONITOR
 *
 * Displays MAIA's real-time knowledge synthesis across:
 * - Obsidian vault relevance and access patterns
 * - Sacred texts activation and cross-referencing
 * - Cross-domain knowledge synthesis
 * - Active wisdom sources and their contributions
 *
 * Showing how MAIA bridges disciplines, practices, faiths, and cultures.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KnowledgeIntegrationData {
  vaultRelevance: number;
  sacredTextsActivated: number;
  crossDomainSynthesis: number;
  wisdomSources: string[];
}

interface KnowledgeIntegrationMonitorProps {
  data?: KnowledgeIntegrationData;
  compact?: boolean;
}

const WISDOM_SOURCE_CONFIG = {
  'Obsidian Vault': { icon: '🧠', color: 'from-blue-400 to-cyan-500', description: 'Consciousness research & psychology' },
  'Sacred Texts': { icon: '📜', color: 'from-amber-400 to-yellow-500', description: 'Ancient wisdom traditions' },
  'Buddhist Teachings': { icon: '☸️', color: 'from-orange-400 to-red-500', description: 'Mindfulness & liberation' },
  'Christian Mysticism': { icon: '✟', color: 'from-blue-400 to-purple-500', description: 'Contemplative practice' },
  'Islamic Sufism': { icon: '☪️', color: 'from-green-400 to-emerald-500', description: 'Heart wisdom & unity' },
  'Hindu Philosophy': { icon: '🕉️', color: 'from-purple-400 to-violet-500', description: 'Consciousness science' },
  'Indigenous Wisdom': { icon: '🦅', color: 'from-emerald-400 to-teal-500', description: 'Earth-based knowing' },
  'Scientific Research': { icon: '🔬', color: 'from-cyan-400 to-blue-500', description: 'Empirical consciousness studies' },
  'Therapeutic Modalities': { icon: '💚', color: 'from-green-400 to-blue-400', description: 'Healing & integration' },
  'Philosophical Frameworks': { icon: '🤔', color: 'from-indigo-400 to-purple-500', description: 'Conceptual understanding' },
  'Creative Arts': { icon: '🎭', color: 'from-pink-400 to-purple-400', description: 'Expressive wisdom' },
  'Contemplative Traditions': { icon: '🧘', color: 'from-violet-400 to-pink-500', description: 'Direct experience practices' }
};

const SYNTHESIS_DOMAINS = [
  { name: 'Psychological', icon: '🧠', description: 'Mental processes & development' },
  { name: 'Spiritual', icon: '✨', description: 'Transcendent experiences' },
  { name: 'Somatic', icon: '💃', description: 'Embodied awareness' },
  { name: 'Cognitive', icon: '💭', description: 'Thought patterns & beliefs' },
  { name: 'Social', icon: '👥', description: 'Relational dynamics' },
  { name: 'Creative', icon: '🎨', description: 'Artistic expression' },
  { name: 'Therapeutic', icon: '🌱', description: 'Healing modalities' },
  { name: 'Philosophical', icon: '📖', description: 'Wisdom frameworks' }
];

export function KnowledgeIntegrationMonitor({ data, compact = false }: KnowledgeIntegrationMonitorProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'sources' | 'synthesis'>('overview');

  if (!data) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">📚</div>
          <p>Knowledge integration data not available</p>
        </div>
      </div>
    );
  }

  const integrationScore = (data.vaultRelevance + data.crossDomainSynthesis) / 2;

  if (compact) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">📚</span>
          Knowledge Integration
        </h3>

        <div className="space-y-3">
          {/* Integration Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(data.vaultRelevance * 100)}%
              </div>
              <div className="text-xs text-gray-400">Vault Relevance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {data.sacredTextsActivated}
              </div>
              <div className="text-xs text-gray-400">Texts Active</div>
            </div>
          </div>

          {/* Cross-Domain Synthesis */}
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">
              {Math.round(data.crossDomainSynthesis * 100)}%
            </div>
            <div className="text-xs text-gray-400">Cross-Domain Synthesis</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${data.crossDomainSynthesis * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* Active Sources */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Active Sources</h4>
            <div className="text-xs text-gray-400">
              {data.wisdomSources.length} wisdom sources contributing
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
          <span className="mr-3">📚</span>
          Knowledge Integration Monitor
        </h2>
        <div className="text-sm text-gray-400">
          Universal Wisdom Synthesis
        </div>
      </div>

      {/* View Selection */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Integration Overview', icon: '🌐' },
          { id: 'sources', label: 'Wisdom Sources', icon: '📖' },
          { id: 'synthesis', label: 'Domain Synthesis', icon: '🔗' }
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
            {/* Integration Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
                <div className="text-center">
                  <div className="text-4xl mb-2">🧠</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {Math.round(data.vaultRelevance * 100)}%
                  </div>
                  <div className="text-sm text-gray-300 mb-2">Vault Relevance</div>
                  <div className="text-xs text-gray-400">
                    Research knowledge matching query context
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg border border-amber-400/30">
                <div className="text-center">
                  <div className="text-4xl mb-2">📜</div>
                  <div className="text-3xl font-bold text-amber-400">
                    {data.sacredTextsActivated}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">Sacred Texts</div>
                  <div className="text-xs text-gray-400">
                    Ancient wisdom sources activated
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
                <div className="text-center">
                  <div className="text-4xl mb-2">🔗</div>
                  <div className="text-3xl font-bold text-green-400">
                    {Math.round(data.crossDomainSynthesis * 100)}%
                  </div>
                  <div className="text-sm text-gray-300 mb-2">Cross-Domain</div>
                  <div className="text-xs text-gray-400">
                    Multi-disciplinary synthesis strength
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Flow Visualization */}
            <div className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-400/20">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Knowledge Integration Flow</h3>

              <div className="flex justify-center">
                <div className="relative w-96 h-48">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 400 200"
                    fill="none"
                  >
                    {/* Source nodes */}
                    <motion.circle
                      cx="80"
                      cy="60"
                      r="20"
                      fill="rgba(59, 130, 246, 0.5)"
                      stroke="rgba(59, 130, 246, 1)"
                      strokeWidth="2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <text x="80" y="65" fontSize="10" fill="white" textAnchor="middle">Vault</text>

                    <motion.circle
                      cx="80"
                      cy="140"
                      r="20"
                      fill="rgba(245, 158, 11, 0.5)"
                      stroke="rgba(245, 158, 11, 1)"
                      strokeWidth="2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    />
                    <text x="80" y="145" fontSize="10" fill="white" textAnchor="middle">Texts</text>

                    {/* Integration node */}
                    <motion.circle
                      cx="200"
                      cy="100"
                      r="25"
                      fill="rgba(147, 51, 234, 0.5)"
                      stroke="rgba(147, 51, 234, 1)"
                      strokeWidth="3"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <text x="200" y="105" fontSize="12" fill="white" textAnchor="middle">MAIA</text>

                    {/* Output node */}
                    <motion.circle
                      cx="320"
                      cy="100"
                      r="20"
                      fill="rgba(34, 197, 94, 0.5)"
                      stroke="rgba(34, 197, 94, 1)"
                      strokeWidth="2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                    />
                    <text x="320" y="105" fontSize="10" fill="white" textAnchor="middle">Synthesis</text>

                    {/* Flow lines */}
                    <motion.line
                      x1="100"
                      y1="60"
                      x2="175"
                      y2="90"
                      stroke="rgba(59, 130, 246, 0.8)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      animate={{ strokeDashoffset: [0, -10] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />

                    <motion.line
                      x1="100"
                      y1="140"
                      x2="175"
                      y2="110"
                      stroke="rgba(245, 158, 11, 0.8)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      animate={{ strokeDashoffset: [0, -10] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.5 }}
                    />

                    <motion.line
                      x1="225"
                      y1="100"
                      x2="300"
                      y2="100"
                      stroke="rgba(34, 197, 94, 0.8)"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      animate={{ strokeDashoffset: [0, -10] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 1 }}
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center mt-4">
                <div className="text-sm text-gray-300">
                  Integration Score: <span className="text-white font-semibold">{Math.round(integrationScore * 100)}%</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Synthesizing {data.wisdomSources.length} active wisdom sources
                </div>
              </div>
            </div>

            {/* Active Sources Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.wisdomSources.slice(0, 6).map((source, index) => {
                const sourceConfig = WISDOM_SOURCE_CONFIG[source as keyof typeof WISDOM_SOURCE_CONFIG];

                return (
                  <motion.div
                    key={index}
                    className="p-3 bg-black/30 rounded-lg border border-white/10 flex items-center space-x-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-2xl">{sourceConfig?.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{source}</div>
                      <div className="text-xs text-gray-400 truncate">{sourceConfig?.description}</div>
                    </div>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.2 }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {selectedView === 'sources' && (
          <motion.div
            key="sources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Active Wisdom Sources</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.wisdomSources.map((source, index) => {
                const sourceConfig = WISDOM_SOURCE_CONFIG[source as keyof typeof WISDOM_SOURCE_CONFIG];
                const activity = Math.random() * 0.8 + 0.2; // Simulated activity level

                return (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-lg border bg-gradient-to-r ${sourceConfig?.color}/20 border-opacity-30`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{sourceConfig?.icon}</span>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{source}</h4>
                          <p className="text-xs text-gray-400">{sourceConfig?.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">
                          {Math.round(activity * 100)}%
                        </div>
                        <div className="text-xs text-gray-400">Active</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${sourceConfig?.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${activity * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-gray-400">Contribution Level</span>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Source Categories */}
            <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-400/20">
              <h4 className="text-lg font-semibold text-white mb-3">Wisdom Categories Active</h4>
              <div className="flex flex-wrap gap-2">
                {['Ancient Texts', 'Modern Research', 'Contemplative Traditions', 'Therapeutic Modalities', 'Creative Arts'].map((category, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'synthesis' && (
          <motion.div
            key="synthesis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Cross-Domain Knowledge Synthesis</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SYNTHESIS_DOMAINS.map((domain, index) => {
                const synthesis = Math.random() * 0.7 + 0.3; // Simulated synthesis level

                return (
                  <motion.div
                    key={index}
                    className="p-4 bg-black/30 rounded-lg border border-white/10 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl mb-2">{domain.icon}</div>
                    <h4 className="text-sm font-semibold text-white mb-1">{domain.name}</h4>
                    <p className="text-xs text-gray-400 mb-3">{domain.description}</p>

                    <div className="space-y-2">
                      <div className="text-lg font-bold text-white">
                        {Math.round(synthesis * 100)}%
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <motion.div
                          className="h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${synthesis * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Synthesis Quality Metrics */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-400/20">
              <h4 className="text-lg font-semibold text-white mb-4">Integration Quality Metrics</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {Math.round(data.crossDomainSynthesis * 100)}%
                  </div>
                  <div className="text-sm text-gray-300">Cross-Domain</div>
                  <div className="text-xs text-gray-400">Multi-disciplinary connections</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-400">
                    {data.wisdomSources.length}
                  </div>
                  <div className="text-sm text-gray-300">Active Sources</div>
                  <div className="text-xs text-gray-400">Concurrent wisdom streams</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {Math.round(integrationScore * 100)}%
                  </div>
                  <div className="text-sm text-gray-300">Overall Integration</div>
                  <div className="text-xs text-gray-400">Synthesis effectiveness</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default KnowledgeIntegrationMonitor;