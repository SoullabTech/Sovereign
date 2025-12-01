'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArchetypalMappingVisualization, { ArchetypeData, WisdomEmergencePoint } from './ArchetypalMappingVisualization';
import WisdomEmergenceTracker, { WisdomEmergenceData, WisdomPattern } from './WisdomEmergenceTracker';

/**
 * CONSCIOUSNESS ANALYTICS DASHBOARD
 *
 * Comprehensive visualization dashboard integrating:
 * - Dream-sleep-consciousness correlation analytics
 * - Archetypal mapping and evolution tracking
 * - Wisdom emergence pattern analysis
 * - Real-time insights and breakthrough predictions
 * - Cross-system pattern correlations
 * - Therapeutic recommendations
 *
 * Primary interface for the Dream & Unconscious Integration module
 */

interface AnalyticsInsight {
  id: string;
  type: 'breakthrough_alert' | 'pattern_detection' | 'integration_guidance' | 'timing_optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
  timestamp: Date;
  relevantArchetypes?: string[];
  correlationStrength?: number;
}

interface ConsciousnessMetrics {
  overall_development: number;
  shadow_integration: number;
  wisdom_embodiment: number;
  archetypal_activation: number;
  dream_depth: number;
  conversation_coherence: number;
  circadian_alignment: number;
}

interface ConsciousnessAnalyticsDashboardProps {
  userId?: string;
  timeWindow?: {
    start: Date;
    end: Date;
  };
  defaultView?: 'overview' | 'archetypal' | 'wisdom' | 'correlations' | 'insights';
  showRealTimeUpdates?: boolean;
  compactMode?: boolean;
}

const ConsciousnessAnalyticsDashboard: React.FC<ConsciousnessAnalyticsDashboardProps> = ({
  userId,
  timeWindow = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date()
  },
  defaultView = 'overview',
  showRealTimeUpdates = true,
  compactMode = false
}) => {

  const [currentView, setCurrentView] = useState(defaultView);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeData | null>(null);
  const [selectedWisdomEvent, setSelectedWisdomEvent] = useState<WisdomEmergenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [correlationData, setCorrelationData] = useState<any>(null);
  const [showInsightPanel, setShowInsightPanel] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    if (showRealTimeUpdates) {
      const interval = setInterval(loadInsights, 30000); // Update insights every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userId, timeWindow, showRealTimeUpdates]);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      // Load correlation data
      const mockCorrelationData = {
        overall_correlation_strength: 0.78,
        dominant_patterns: [
          'Shadow Integration Cycle',
          'Wisdom Emergence Rhythm',
          'Archetypal Development Progression'
        ],
        breakthrough_probability: 0.82,
        optimal_windows: ['6:00-8:00 AM', '2:00-4:00 PM'],
        integration_trajectory: 'ascending'
      };

      // Load consciousness metrics
      const mockMetrics: ConsciousnessMetrics = {
        overall_development: 0.78,
        shadow_integration: 0.65,
        wisdom_embodiment: 0.83,
        archetypal_activation: 0.71,
        dream_depth: 0.76,
        conversation_coherence: 0.82,
        circadian_alignment: 0.69
      };

      // Load insights
      const mockInsights: AnalyticsInsight[] = [
        {
          id: '1',
          type: 'breakthrough_alert',
          title: '🌟 High Wisdom Emergence Probability',
          description: 'Optimal window for breakthrough approaching in next 24-48 hours',
          priority: 'high',
          actionable: true,
          recommendations: [
            'Schedule deep conversation with MAIA tomorrow morning (6-8 AM)',
            'Practice meditation tonight for preparation',
            'Set intention for wisdom reception'
          ],
          timestamp: new Date(),
          relevantArchetypes: ['wise_old_man', 'magician'],
          correlationStrength: 0.89
        },
        {
          id: '2',
          type: 'pattern_detection',
          title: '🔄 Shadow Integration Cycle Active',
          description: 'Recurring shadow work pattern detected with increasing integration depth',
          priority: 'medium',
          actionable: true,
          recommendations: [
            'Continue active imagination work with shadow figures',
            'Journal on projection patterns in relationships',
            'Allow extra time for emotional processing'
          ],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          relevantArchetypes: ['shadow', 'destroyer', 'wise_old_woman'],
          correlationStrength: 0.72
        },
        {
          id: '3',
          type: 'timing_optimization',
          title: '⏰ Optimal Conversation Timing Update',
          description: 'Your peak wisdom emergence times have shifted - updating recommendations',
          priority: 'medium',
          actionable: false,
          recommendations: [
            'New optimal window: 6:00-8:00 AM (was 7:00-9:00 AM)',
            'Secondary window: 2:00-4:00 PM remains strong',
            'Avoid deep conversations 8:00-10:00 PM due to processing overload'
          ],
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          correlationStrength: 0.68
        }
      ];

      setCorrelationData(mockCorrelationData);
      setMetrics(mockMetrics);
      setInsights(mockInsights);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    // This would poll for new insights in real implementation
    console.log('Checking for new insights...');
  };

  // Handle archetype selection from visualization
  const handleArchetypeSelect = (archetype: ArchetypeData) => {
    setSelectedArchetype(archetype);
    // Filter insights related to this archetype
    const relevantInsights = insights.filter(insight =>
      insight.relevantArchetypes?.includes(archetype.name)
    );
    console.log(`Selected ${archetype.name}, found ${relevantInsights.length} related insights`);
  };

  // Handle wisdom event selection
  const handleWisdomEventSelect = (event: WisdomEmergenceData) => {
    setSelectedWisdomEvent(event);
  };

  // Render overview dashboard
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Consciousness metrics overview */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(value * 100)}%
              </div>
              <div className="text-xs text-gray-400 mt-1 leading-tight">
                {key.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-1 rounded-full ${
                    value > 0.8 ? 'bg-green-400' :
                    value > 0.6 ? 'bg-yellow-400' :
                    value > 0.4 ? 'bg-orange-400' : 'bg-red-400'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick insights summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-lg font-medium text-amber-300 mb-4">🔮 Archetypal Constellation</h3>
          <ArchetypalMappingVisualization
            userId={userId}
            timeWindow={timeWindow}
            viewMode="constellation"
            interactive={true}
            onArchetypeSelect={handleArchetypeSelect}
          />
        </div>

        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-lg font-medium text-purple-300 mb-4">✨ Wisdom Emergence</h3>
          <WisdomEmergenceTracker
            userId={userId}
            timeWindow={timeWindow}
            viewMode="temporal"
            showPredictions={true}
            onWisdomEventSelect={handleWisdomEventSelect}
          />
        </div>
      </div>

      {/* Correlation insights */}
      {correlationData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg p-6 border border-indigo-500/30"
        >
          <h3 className="text-lg font-medium text-indigo-300 mb-4">🌟 Cross-System Correlations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Dominant Patterns</h4>
              <ul className="space-y-1">
                {correlationData.dominant_patterns.map((pattern: string, index: number) => (
                  <li key={index} className="text-sm text-gray-400 flex items-center">
                    <span className="text-amber-400 mr-2">•</span>
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Breakthrough Probability</h4>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-purple-400">
                  {Math.round(correlationData.breakthrough_probability * 100)}%
                </div>
                <div className="text-sm text-gray-400">
                  Next 48 hours
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Optimal Windows</h4>
              <div className="space-y-1">
                {correlationData.optimal_windows.map((window: string, index: number) => (
                  <div key={index} className="text-sm text-blue-300 bg-blue-900/30 rounded px-2 py-1">
                    {window}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  // Render insights panel
  const renderInsightsPanel = () => (
    <AnimatePresence>
      {showInsightPanel && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="bg-slate-900/95 backdrop-blur border-l border-slate-700 overflow-y-auto"
          style={{ width: compactMode ? '300px' : '400px' }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-amber-300">💡 Live Insights</h3>
              <button
                onClick={() => setShowInsightPanel(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg p-4 border ${
                    insight.priority === 'high'
                      ? 'bg-red-900/30 border-red-500/50'
                      : insight.priority === 'medium'
                      ? 'bg-yellow-900/30 border-yellow-500/50'
                      : 'bg-blue-900/30 border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.priority === 'high'
                        ? 'bg-red-600 text-white'
                        : insight.priority === 'medium'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">{insight.description}</p>

                  {insight.actionable && insight.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-400 mb-2">Recommendations:</h5>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="text-xs text-gray-300 flex items-start">
                            <span className="text-amber-400 mr-2 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insight.correlationStrength && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Correlation Strength</span>
                        <span className="text-purple-400 font-medium">
                          {Math.round(insight.correlationStrength * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    {insight.timestamp.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-950 to-purple-950 rounded-lg">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">Loading consciousness analytics...</p>
          <p className="text-gray-500 text-sm mt-2">Analyzing dreams, sleep patterns, and conversation insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      <div className="flex">
        {/* Main content area */}
        <div className="flex-1 p-6" style={{ marginRight: showInsightPanel ? (compactMode ? '300px' : '400px') : '0' }}>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">
              Consciousness Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Dream & Unconscious Integration • {timeWindow.start.toLocaleDateString()} - {timeWindow.end.toLocaleDateString()}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { view: 'overview', label: '📊 Overview', desc: 'Complete dashboard' },
              { view: 'archetypal', label: '🔮 Archetypes', desc: 'Mapping & evolution' },
              { view: 'wisdom', label: '✨ Wisdom', desc: 'Emergence tracking' },
              { view: 'correlations', label: '🌟 Correlations', desc: 'Cross-system analysis' },
              { view: 'insights', label: '💡 Insights', desc: 'AI recommendations' }
            ].map(({ view, label, desc }) => (
              <motion.button
                key={view}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView(view)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  currentView === view
                    ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-lg'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700'
                }`}
                title={desc}
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* Main content based on current view */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'overview' && renderOverview()}
              {currentView === 'archetypal' && (
                <ArchetypalMappingVisualization
                  userId={userId}
                  timeWindow={timeWindow}
                  viewMode="constellation"
                  interactive={true}
                  onArchetypeSelect={handleArchetypeSelect}
                />
              )}
              {currentView === 'wisdom' && (
                <WisdomEmergenceTracker
                  userId={userId}
                  timeWindow={timeWindow}
                  viewMode="temporal"
                  showPredictions={true}
                  onWisdomEventSelect={handleWisdomEventSelect}
                />
              )}
              {/* Other views would be implemented here */}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Insights panel */}
        <div className="fixed right-0 top-0 h-screen">
          {renderInsightsPanel()}
        </div>

        {/* Show insights panel toggle when hidden */}
        {!showInsightPanel && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowInsightPanel(true)}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 p-3 rounded-full shadow-lg z-50"
          >
            💡
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ConsciousnessAnalyticsDashboard;
export type { AnalyticsInsight, ConsciousnessMetrics };