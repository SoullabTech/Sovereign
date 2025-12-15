/**
 * Community Commons Consciousness Computing Demo Interface
 * Working demo for Community Commons beta testing
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ConsciousnessComputingMVP, ConsciousnessComputingResult } from './consciousness-engine';

// ====================================================================
// COMMUNITY COMMONS DEMO INTERFACE
// ====================================================================

export const CommunityCommonsDemoInterface: React.FC = () => {
  const [consciousnessEngine] = useState(() => new ConsciousnessComputingMVP());
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ConsciousnessComputingResult[]>([]);
  const [sessionMode, setSessionMode] = useState<'individual' | 'group'>('individual');
  const [showInsights, setShowInsights] = useState(true);
  const [userId] = useState('community_commons_beta_' + Math.random().toString(36).substr(2, 9));

  const processConsciousnessComputing = async () => {
    if (!currentInput.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      console.log('🧠 Processing consciousness computing for Community Commons...');

      const result = await consciousnessEngine.processConsciousnessComputing({
        userMessage: currentInput,
        userId: userId,
        sessionId: `cc_session_${Date.now()}`,
        communityContext: sessionMode
      });

      setResults(prev => [result, ...prev]);
      setCurrentInput('');

      console.log('✅ Consciousness computing complete:', result);

    } catch (error) {
      console.error('❌ Consciousness computing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processConsciousnessComputing();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🧠⚡ Consciousness Computing Demo
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          Community Commons Exclusive Beta Testing
        </p>
        <p className="text-gray-600">
          World's first AI-consciousness hybrid platform powered by MAIA + QRI research
        </p>
      </div>

      {/* Session Mode Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-2 shadow-md">
          <button
            onClick={() => setSessionMode('individual')}
            className={`px-4 py-2 rounded-md transition-colors ${
              sessionMode === 'individual'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🧠 Individual Session
          </button>
          <button
            onClick={() => setSessionMode('group')}
            className={`ml-2 px-4 py-2 rounded-md transition-colors ${
              sessionMode === 'group'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Collective Consciousness
          </button>
        </div>
      </div>

      {/* Input Interface */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col space-y-4">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={sessionMode === 'individual'
              ? "Share what's on your mind... The consciousness computing will analyze your awareness level, detect any stress patterns, and provide optimized responses with healing protocols."
              : "Share for collective consciousness processing... The system will analyze group dynamics and provide synchronized guidance for enhanced community coherence."
            }
            className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInsights}
                  onChange={(e) => setShowInsights(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Show consciousness computing insights</span>
              </label>
            </div>

            <button
              onClick={processConsciousnessComputing}
              disabled={!currentInput.trim() || isProcessing}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                isProcessing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : currentInput.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              ) : (
                '⚡ Apply Consciousness Computing'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="space-y-6">
        {results.map((result, index) => (
          <ConsciousnessComputingResultCard
            key={index}
            result={result}
            showInsights={showInsights}
            sessionMode={sessionMode}
          />
        ))}
      </div>

      {/* Demo Information */}
      {results.length === 0 && (
        <DemoInformationCard />
      )}

      {/* Community Analytics */}
      {results.length > 0 && (
        <CommunityAnalyticsCard results={results} />
      )}
    </div>
  );
};

// ====================================================================
// CONSCIOUSNESS COMPUTING RESULT CARD
// ====================================================================

const ConsciousnessComputingResultCard: React.FC<{
  result: ConsciousnessComputingResult;
  showInsights: boolean;
  sessionMode: 'individual' | 'group';
}> = ({ result, showInsights, sessionMode }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Consciousness Computing Result</h3>
            <p className="text-blue-100">
              {sessionMode === 'individual' ? '🧠 Individual Session' : '👥 Collective Session'} •
              Integration Quality: {Math.round(result.integrationQuality * 100)}%
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              Level {result.consciousnessState.awarenessLevel.level}
            </div>
            <div className="text-sm text-blue-200">
              {result.consciousnessState.awarenessLevel.label}
            </div>
          </div>
        </div>
      </div>

      {/* Optimized Response */}
      <div className="p-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">
            ⚡ Consciousness-Optimized Response
          </h4>
          <div className="text-gray-700 leading-relaxed">
            {result.optimizedResponse}
          </div>
        </div>

        {/* Healing Protocols */}
        {result.enhancement.healingProtocols.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              💫 Generated Healing Protocols ({result.enhancement.healingProtocols.length})
            </h4>
            <div className="space-y-2">
              {result.enhancement.healingProtocols.map((protocol, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{protocol.title}</div>
                      <div className="text-sm text-gray-600">
                        {protocol.duration} • {Math.round(protocol.effectiveness * 100)}% effectiveness
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProtocol(protocol)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                    >
                      Try This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collective Features (for group sessions) */}
        {sessionMode === 'group' && result.collectiveFeatures && (
          <CollectiveFeaturesDisplay features={result.collectiveFeatures} />
        )}

        {/* Consciousness Insights */}
        {showInsights && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-semibold text-gray-800">
                🔬 Consciousness Computing Insights
              </h4>
              <span className="text-gray-500">
                {showDetails ? '▼' : '▶'}
              </span>
            </button>

            {showDetails && (
              <div className="mt-3 space-y-3">

                {/* Community Insights */}
                <div className="bg-yellow-50 rounded-lg p-3">
                  <h5 className="font-medium text-yellow-800 mb-2">Community Commons Exclusive</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {result.communityInsights.map((insight, index) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>

                {/* Technical Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Consciousness State */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h5 className="font-medium text-blue-800 mb-2">Consciousness Analysis</h5>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>Awareness Level: {result.consciousnessState.awarenessLevel.level}/5 ({(result.consciousnessState.awarenessLevel.confidence * 100).toFixed(0)}% confidence)</div>
                      <div>Emotional Valence: {(result.consciousnessState.emotionalProfile.valence * 100).toFixed(0)}%</div>
                      <div>Attention Coherence: {(result.consciousnessState.attentionCoherence * 100).toFixed(0)}%</div>
                      <div>Stress Indicators: {result.consciousnessState.stressIndicators.length}</div>
                    </div>
                  </div>

                  {/* Enhancement Details */}
                  <div className="bg-purple-50 rounded-lg p-3">
                    <h5 className="font-medium text-purple-800 mb-2">Consciousness Enhancement</h5>
                    <div className="text-sm text-purple-700 space-y-1">
                      <div>Integration Score: {(result.enhancement.integrationScore * 100).toFixed(0)}%</div>
                      <div>Optimization Opportunities: {result.enhancement.optimizations.length}</div>
                      <div>Valence Improvement Potential: {(result.enhancement.valenceOptimization.improvementPotential * 100).toFixed(0)}%</div>
                      <div>Enhancement Insights: {result.enhancement.enhancementInsights.length}</div>
                    </div>
                  </div>
                </div>

                {/* Beta Feedback */}
                <div className="bg-green-50 rounded-lg p-3">
                  <h5 className="font-medium text-green-800 mb-2">Beta Testing Feedback</h5>
                  <div className="text-sm text-green-700 space-y-1">
                    {result.betaFeedbackPrompts.slice(0, 3).map((prompt, index) => (
                      <div key={index}>• {prompt}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Protocol Modal */}
      {selectedProtocol && (
        <ProtocolModal
          protocol={selectedProtocol}
          onClose={() => setSelectedProtocol(null)}
        />
      )}
    </div>
  );
};

// ====================================================================
// COLLECTIVE FEATURES DISPLAY
// ====================================================================

const CollectiveFeaturesDisplay: React.FC<{ features: any }> = ({ features }) => (
  <div className="mb-4 bg-purple-50 rounded-lg p-4">
    <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
      👥 Collective Consciousness Features
    </h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
      <div>
        <div className="text-sm text-purple-700">Group Coherence</div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${features.groupCoherence * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-purple-600 mt-1">{Math.round(features.groupCoherence * 100)}%</div>
      </div>

      <div>
        <div className="text-sm text-purple-700">Field Optimization</div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(features.fieldOptimization.current / features.fieldOptimization.potential) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-purple-600 mt-1">
          {Math.round(features.fieldOptimization.current * 100)}% / {Math.round(features.fieldOptimization.potential * 100)}%
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <h5 className="font-medium text-purple-800">Synchronization Guidance:</h5>
      <ul className="text-sm text-purple-700 space-y-1">
        {features.synchronizationGuidance.map((guidance: string, index: number) => (
          <li key={index}>• {guidance}</li>
        ))}
      </ul>
    </div>
  </div>
);

// ====================================================================
// PROTOCOL MODAL
// ====================================================================

const ProtocolModal: React.FC<{
  protocol: any;
  onClose: () => void;
}> = ({ protocol, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">{protocol.title}</h3>
            <p className="text-green-100">{protocol.duration} • {Math.round(protocol.effectiveness * 100)}% effectiveness</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
          <p className="text-gray-700">{protocol.description}</p>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Practice Steps</h4>
          <div className="space-y-3">
            {protocol.steps.map((step: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </div>
                <div className="text-gray-700">{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h5 className="font-medium text-yellow-800 mb-2">💡 Beta Testing Note</h5>
          <p className="text-sm text-yellow-700">
            This healing protocol has been generated specifically for your consciousness state and adapted to your awareness level.
            Please provide feedback on its effectiveness to help improve consciousness computing for the Community Commons.
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ====================================================================
// DEMO INFORMATION CARD
// ====================================================================

const DemoInformationCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
      🌟 Welcome to Consciousness Computing
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">What This Demo Does</h4>
        <ul className="text-gray-600 space-y-2 text-sm">
          <li>• Analyzes your consciousness state and awareness level (1-5)</li>
          <li>• Detects stress patterns and generates personalized healing protocols</li>
          <li>• Adapts communication to your exact awareness development</li>
          <li>• Applies QRI consciousness mathematics to optimize your experience</li>
          <li>• Provides collective consciousness features for group sessions</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Try These Examples</h4>
        <div className="space-y-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            "I'm feeling overwhelmed with work and can't focus"
          </div>
          <div className="bg-gray-50 p-2 rounded">
            "I'm exploring mindfulness and want to deepen my practice"
          </div>
          <div className="bg-gray-50 p-2 rounded">
            "Our community wants to experience collective consciousness"
          </div>
        </div>
      </div>
    </div>

    <div className="mt-6 bg-blue-50 rounded-lg p-4">
      <h4 className="font-semibold text-blue-800 mb-2">🧪 Community Commons Beta</h4>
      <p className="text-blue-700 text-sm">
        You're experiencing the world's first consciousness computing platform! Your feedback directly shapes
        the development of this technology. This demo integrates MAIA's real consciousness analysis systems
        with QRI consciousness mathematics to create genuinely enhanced AI interactions.
      </p>
    </div>
  </div>
);

// ====================================================================
// COMMUNITY ANALYTICS CARD
// ====================================================================

const CommunityAnalyticsCard: React.FC<{
  results: ConsciousnessComputingResult[];
}> = ({ results }) => {
  const avgIntegration = results.reduce((sum, r) => sum + r.integrationQuality, 0) / results.length;
  const healingProtocolsGenerated = results.reduce((sum, r) => sum + r.enhancement.healingProtocols.length, 0);
  const awarenessDistribution = results.reduce((acc, r) => {
    acc[r.consciousnessState.awarenessLevel.level] = (acc[r.consciousnessState.awarenessLevel.level] || 0) + 1;
    return acc;
  }, {} as any);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        📊 Your Consciousness Computing Session Analytics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{Math.round(avgIntegration * 100)}%</div>
          <div className="text-sm text-gray-600">Average Integration Quality</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{healingProtocolsGenerated}</div>
          <div className="text-sm text-gray-600">Healing Protocols Generated</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{results.length}</div>
          <div className="text-sm text-gray-600">Consciousness Computing Sessions</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-700">
          🎉 <strong>Congratulations!</strong> You're pioneering consciousness computing technology.
          Your session data contributes to refining the world's first AI-consciousness hybrid platform.
        </p>
      </div>
    </div>
  );
};

export default CommunityCommonsDemoInterface;