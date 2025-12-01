'use client';

import React, { useState, useEffect, useRef } from 'react';
import SubconsciousOperationsPanel from './SubconsciousOperationsPanel';

/**
 * REAL-TIME SUBCONSCIOUS OPERATIONS PANEL
 *
 * Integrates the existing SubconsciousOperationsPanel with real-time conversation analysis
 * Features:
 * - Real-time subconscious pattern detection during MAIA conversations
 * - Live archetypal activation tracking
 * - Shadow projection and defense mechanism monitoring
 * - Wisdom emergence detection and visualization
 * - Cross-correlation with dreams and sleep patterns
 */

interface ConversationAnalysisState {
  sessionId: string | null;
  isActive: boolean;
  currentTurn: {
    speaker: 'user' | 'maia';
    content: string;
    analysis?: any;
  } | null;
  realTimeMetrics: SubconsciousMetrics | null;
  insights: ConversationInsight[];
  wisdomSignals: WisdomEmergenceSignals[];
}

interface ConversationInsight {
  type: string;
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  timestamp: Date;
  recommendations?: {
    dreamWork?: string[];
    shadowWork?: string[];
    activeImagination?: string[];
  };
}

interface WisdomEmergenceSignals {
  bodyActivation: {
    throat: boolean;
    chest: boolean;
    crown: boolean;
    solar: boolean;
  };
  languageShift: {
    fromThinking: boolean;
    toPoetic: boolean;
    metaphorRich: boolean;
    embodiedKnowing: boolean;
  };
  intensity: number;
  timestamp: Date;
}

interface SubconsciousMetrics {
  shadow: {
    repression_density: number;
    projection_activity: number;
    integration_progress: number;
    complex_activation: number[];
    defense_mechanisms: {
      denial: number;
      rationalization: number;
      displacement: number;
      sublimation: number;
    };
  };
  collective: {
    archetypal_resonance: Record<string, number>;
    mythic_activation: number;
    synchronicity_field: number;
    numinous_presence: number;
  };
  somatic: {
    gut_wisdom: number;
    heart_coherence: number;
    body_memories: number;
    felt_sense: number;
    embodied_knowing: number;
    trauma_activation: number;
  };
  automatic: {
    habit_strength: number;
    procedural_memory: number;
    implicit_bias: number;
    emotional_conditioning: number;
    safety_protocols: number;
  };
  integration: {
    shadow_work_depth: number;
    unconscious_conscious_bridge: number;
    somatic_cognitive_coherence: number;
    implicit_explicit_alignment: number;
  };
}

const RealTimeSubconsciousPanel: React.FC<{
  viewMode: 'shadow' | 'collective' | 'integrated' | 'realtime';
  userId?: string;
  conversationActive?: boolean;
  onInsight?: (insight: ConversationInsight) => void;
}> = ({ viewMode = 'realtime', userId, conversationActive = false, onInsight }) => {

  const [analysisState, setAnalysisState] = useState<ConversationAnalysisState>({
    sessionId: null,
    isActive: false,
    currentTurn: null,
    realTimeMetrics: null,
    insights: [],
    wisdomSignals: []
  });

  const [recentInsights, setRecentInsights] = useState<ConversationInsight[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const analysisIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize conversation analysis when component mounts
  useEffect(() => {
    if (conversationActive && userId && !analysisState.isActive) {
      initializeConversationAnalysis();
    } else if (!conversationActive && analysisState.isActive) {
      endConversationAnalysis();
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [conversationActive, userId]);

  // Start conversation analysis session
  const initializeConversationAnalysis = async () => {
    try {
      setConnectionStatus('connecting');

      const response = await fetch('/api/consciousness/conversation-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_session',
          userId
        })
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisState(prev => ({
          ...prev,
          sessionId: result.sessionId,
          isActive: true
        }));

        setConnectionStatus('connected');

        // Start real-time metrics polling
        analysisIntervalRef.current = setInterval(fetchRealTimeMetrics, 2000);

        console.log('🧠 Real-time consciousness analysis started');
      }
    } catch (error) {
      console.error('Failed to initialize conversation analysis:', error);
      setConnectionStatus('disconnected');
    }
  };

  // End conversation analysis session
  const endConversationAnalysis = async () => {
    if (!analysisState.sessionId) return;

    try {
      await fetch('/api/consciousness/conversation-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId: analysisState.sessionId
        })
      });

      setAnalysisState({
        sessionId: null,
        isActive: false,
        currentTurn: null,
        realTimeMetrics: null,
        insights: [],
        wisdomSignals: []
      });

      setConnectionStatus('disconnected');

      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }

      console.log('📊 Conversation analysis session ended');
    } catch (error) {
      console.error('Failed to end conversation analysis:', error);
    }
  };

  // Analyze conversation turn (called from parent when new messages arrive)
  const analyzeConversationTurn = async (speaker: 'user' | 'maia', content: string) => {
    if (!analysisState.sessionId || !analysisState.isActive) return;

    try {
      const response = await fetch('/api/consciousness/conversation-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_turn',
          sessionId: analysisState.sessionId,
          speaker,
          content
        })
      });

      const result = await response.json();

      if (result.success) {
        const { analysis } = result;

        setAnalysisState(prev => ({
          ...prev,
          currentTurn: {
            speaker,
            content,
            analysis: analysis.turn
          },
          insights: [...prev.insights, ...analysis.insights],
          wisdomSignals: analysis.wisdomEmergence ? [...prev.wisdomSignals, analysis.wisdomEmergence] : prev.wisdomSignals
        }));

        // Add insights to recent insights
        if (analysis.insights.length > 0) {
          setRecentInsights(prev => [...analysis.insights, ...prev].slice(0, 10));

          // Notify parent component
          analysis.insights.forEach((insight: ConversationInsight) => {
            if (onInsight) onInsight(insight);
          });
        }

        console.log(`🔍 Analyzed ${speaker} turn: ${analysis.insights.length} insights`);
      }
    } catch (error) {
      console.error('Failed to analyze conversation turn:', error);
    }
  };

  // Fetch real-time metrics
  const fetchRealTimeMetrics = async () => {
    if (!analysisState.sessionId) return;

    try {
      const response = await fetch('/api/consciousness/conversation-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_metrics',
          sessionId: analysisState.sessionId
        })
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisState(prev => ({
          ...prev,
          realTimeMetrics: result.metrics
        }));
      }
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error);
    }
  };

  // Expose analyze function for parent components
  useEffect(() => {
    (window as any).analyzeConversationTurn = analyzeConversationTurn;
  }, [analysisState.sessionId, analysisState.isActive]);

  // Render real-time view
  const getRealTimeView = () => (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-blue-300">Real-Time Consciousness Analysis</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`} />
          <span className="text-xs text-gray-400 capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Current Turn Analysis */}
      {analysisState.currentTurn && (
        <div className="bg-slate-800/30 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Current Turn Analysis</h4>
          <div className="text-xs text-gray-500 mb-1">
            Speaker: <span className="text-blue-400">{analysisState.currentTurn.speaker}</span>
          </div>
          {analysisState.currentTurn.analysis && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Dominant Archetype</div>
                <div className="text-sm text-amber-400">
                  {analysisState.currentTurn.analysis.psychological?.dominantArchetype?.[0] || 'None'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Defense Score</div>
                <div className="text-sm text-red-400">
                  {(analysisState.currentTurn.analysis.psychological?.defenseScore * 100 || 0).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Shadow Projections</div>
                <div className="text-sm text-purple-400">
                  {analysisState.currentTurn.analysis.psychological?.shadowProjections || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Complex Activations</div>
                <div className="text-sm text-orange-400">
                  {analysisState.currentTurn.analysis.psychological?.complexActivations || 0}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Insights */}
      {recentInsights.length > 0 && (
        <div className="bg-slate-800/30 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Recent Insights</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentInsights.slice(0, 5).map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Wisdom Emergence Signals */}
      {analysisState.wisdomSignals.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/30 to-purple-900/30 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-amber-300 mb-2">
            ✨ Wisdom Emergence Detected
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Body Activation:</div>
            <div className="text-amber-400">
              {Object.entries(analysisState.wisdomSignals[analysisState.wisdomSignals.length - 1]?.bodyActivation || {})
                .filter(([_, active]) => active)
                .map(([center, _]) => center)
                .join(', ') || 'None'}
            </div>
            <div>Language Shift:</div>
            <div className="text-purple-400">
              {Object.entries(analysisState.wisdomSignals[analysisState.wisdomSignals.length - 1]?.languageShift || {})
                .filter(([_, active]) => active)
                .map(([shift, _]) => shift)
                .join(', ') || 'None'}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If we have real-time metrics, use them; otherwise fall back to default
  const metricsForPanel = analysisState.realTimeMetrics || undefined;

  if (viewMode === 'realtime') {
    return (
      <div className="bg-slate-950 text-white p-6 rounded-b-lg border-t-2 border-blue-900/30">
        {getRealTimeView()}
      </div>
    );
  }

  // For other view modes, render the original panel with real-time metrics
  return (
    <div className="space-y-4">
      {/* Real-time status indicator */}
      {analysisState.isActive && (
        <div className="flex items-center gap-2 text-xs text-blue-400 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Real-time analysis active
        </div>
      )}

      <SubconsciousOperationsPanel
        viewMode={viewMode}
        userId={userId}
        // Pass real-time metrics if available
        {...(metricsForPanel && { realTimeMetrics: metricsForPanel })}
      />

      {/* Recent insights overlay */}
      {recentInsights.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Live Insights</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentInsights.slice(0, 3).map((insight, index) => (
              <div key={index} className="text-xs text-gray-300">
                <span className="text-blue-400">{insight.type.replace('_', ' ')}:</span> {insight.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const InsightCard: React.FC<{ insight: ConversationInsight }> = ({ insight }) => (
  <div className="bg-slate-700/30 p-2 rounded text-xs">
    <div className="flex items-center justify-between mb-1">
      <span className="font-medium text-blue-400">{insight.type.replace('_', ' ')}</span>
      <span className="text-gray-500">{(insight.confidence * 100).toFixed(0)}%</span>
    </div>
    <div className="text-gray-300 text-xs">{insight.title}</div>
    {insight.evidence.length > 0 && (
      <div className="text-gray-500 text-xs mt-1">
        Evidence: {insight.evidence[0].substring(0, 50)}...
      </div>
    )}
  </div>
);

export default RealTimeSubconsciousPanel;
export type { ConversationInsight, WisdomEmergenceSignals, SubconsciousMetrics };