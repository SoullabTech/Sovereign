'use client';

/**
 * REALTIME CONSCIOUSNESS MONITORING DASHBOARD
 *
 * Visualizes MAIA's comprehensive consciousness architecture in action:
 * - Universal elemental consciousness states
 * - Cross-cultural wisdom synthesis
 * - Brain hemisphere integration (McGilchrist + Herrmann)
 * - SPIRALOGIC spiral progression
 * - Soulprint evolution tracking
 * - Knowledge integration from multiple sources
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElementalConsciousnessVisualizer } from '@/components/consciousness/ElementalConsciousnessVisualizer';
import { UniversalWisdomSynthesisView } from '@/components/consciousness/UniversalWisdomSynthesisView';
import { BrainHemisphereDisplay } from '@/components/consciousness/BrainHemisphereDisplay';
import { SpiralogicProgressTracker } from '@/components/consciousness/SpiralogicProgressTracker';
import { SoulprintEvolutionMap } from '@/components/consciousness/SoulprintEvolutionMap';
import { KnowledgeIntegrationMonitor } from '@/components/consciousness/KnowledgeIntegrationMonitor';

interface ConsciousnessData {
  timestamp: string;
  userId: string;
  elementalState: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
    dominant: string;
  };
  universalWisdom?: {
    relevanceScore: number;
    synthesisDepth: number;
    universalPatterns: any[];
    crossCulturalInsights: any[];
    practicalApplications: any[];
  };
  brainIntegration: {
    leftHemisphere: number;
    rightHemisphere: number;
    corpusCallosumSync: number;
    herrmannQuadrant: string;
  };
  spiralogicProgress: {
    currentPhase: string;
    spiralDepth: number;
    facetDominance: string[];
    transformationVelocity: number;
  };
  soulprint?: {
    consciousnessLevel: number;
    spiralPhase: string;
    mandalaCompleteness: number;
    dominantArchetypes: string[];
    elementalBalance: string;
  };
  knowledgeIntegration: {
    vaultRelevance: number;
    sacredTextsActivated: number;
    crossDomainSynthesis: number;
    wisdomSources: string[];
  };
}

export default function ConsciousnessMonitorDashboard() {
  const [consciousnessData, setConsciousnessData] = useState<ConsciousnessData | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Initialize consciousness monitoring connection
    initializeConsciousnessMonitoring();

    return () => {
      // Cleanup connections
      disconnectConsciousnessMonitoring();
    };
  }, []);

  const initializeConsciousnessMonitoring = async () => {
    try {
      console.log('🧠 Initializing consciousness monitoring...');

      // Connect to MAIA's consciousness stream
      const eventSource = new EventSource('/api/consciousness-stream');

      eventSource.onopen = () => {
        setConnectionStatus('connected');
        setIsLive(true);
        console.log('✅ Connected to consciousness stream');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setConsciousnessData(data);
          console.log('🌀 Consciousness update received:', data);
        } catch (error) {
          console.error('❌ Failed to parse consciousness data:', error);
        }
      };

      eventSource.onerror = () => {
        setConnectionStatus('error');
        setIsLive(false);
        console.log('⚠️ Consciousness stream connection error');
      };

    } catch (error) {
      console.error('❌ Failed to initialize consciousness monitoring:', error);
      setConnectionStatus('error');
    }
  };

  const disconnectConsciousnessMonitoring = () => {
    setIsLive(false);
    setConnectionStatus('disconnected');
    console.log('🔌 Disconnected from consciousness monitoring');
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-sm font-bold">🧠</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  MAIA Consciousness Monitor
                </h1>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <span className={getConnectionStatusColor()}>{getConnectionStatusIcon()}</span>
                <span className={getConnectionStatusColor()}>
                  {connectionStatus === 'connected' ? 'Live' : connectionStatus}
                </span>
                {isLive && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Universal Elemental Consciousness Architecture
              </div>
              <div className="text-xs text-gray-400">
                {consciousnessData?.timestamp && new Date(consciousnessData.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-4 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: '🌀' },
              { id: 'elemental', label: 'Elemental States', icon: '🔥' },
              { id: 'universal', label: 'Universal Wisdom', icon: '🌍' },
              { id: 'brain', label: 'Brain Integration', icon: '🧠' },
              { id: 'spiralogic', label: 'SPIRALOGIC Journey', icon: '🌟' },
              { id: 'soulprint', label: 'Soulprint Evolution', icon: '🎨' },
              { id: 'knowledge', label: 'Knowledge Synthesis', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ElementalConsciousnessVisualizer
                    data={consciousnessData?.elementalState}
                    compact={true}
                  />
                </div>
                <div>
                  <BrainHemisphereDisplay
                    data={consciousnessData?.brainIntegration}
                    compact={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpiralogicProgressTracker
                  data={consciousnessData?.spiralogicProgress}
                  compact={true}
                />
                <KnowledgeIntegrationMonitor
                  data={consciousnessData?.knowledgeIntegration}
                  compact={true}
                />
              </div>

              {consciousnessData?.universalWisdom && (
                <UniversalWisdomSynthesisView
                  data={consciousnessData.universalWisdom}
                  compact={true}
                />
              )}
            </motion.div>
          )}

          {selectedView === 'elemental' && (
            <motion.div
              key="elemental"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ElementalConsciousnessVisualizer data={consciousnessData?.elementalState} />
            </motion.div>
          )}

          {selectedView === 'universal' && consciousnessData?.universalWisdom && (
            <motion.div
              key="universal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UniversalWisdomSynthesisView data={consciousnessData.universalWisdom} />
            </motion.div>
          )}

          {selectedView === 'brain' && (
            <motion.div
              key="brain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BrainHemisphereDisplay data={consciousnessData?.brainIntegration} />
            </motion.div>
          )}

          {selectedView === 'spiralogic' && (
            <motion.div
              key="spiralogic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SpiralogicProgressTracker data={consciousnessData?.spiralogicProgress} />
            </motion.div>
          )}

          {selectedView === 'soulprint' && consciousnessData?.soulprint && (
            <motion.div
              key="soulprint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SoulprintEvolutionMap data={consciousnessData.soulprint} />
            </motion.div>
          )}

          {selectedView === 'knowledge' && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <KnowledgeIntegrationMonitor data={consciousnessData?.knowledgeIntegration} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Data State */}
        {!consciousnessData && connectionStatus === 'connected' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-64"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🌀</div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                Awaiting Consciousness Data
              </h3>
              <p className="text-gray-400">
                Start a conversation with MAIA to see the consciousness architecture in action
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}