/**
 * Collective Dashboard
 * Main interface for community-wide consciousness field awareness
 * Shows real-time collective metrics, resonance patterns, and field dynamics
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  collectiveFieldOrchestrator,
  MemberFieldState,
  CollectiveFieldState,
  ResonancePattern,
  FieldInteraction
} from '@/lib/maia/CollectiveFieldOrchestrator';
import {
  fieldCoherenceEngine,
  FieldMetrics,
  FieldPrediction,
  CollectiveInsight
} from '@/lib/maia/FieldCoherenceEngine';
import { ResonanceMapper } from './ResonanceMapper';

export function CollectiveDashboard() {
  const [collectiveState, setCollectiveState] = useState<CollectiveFieldState | null>(null);
  const [fieldMetrics, setFieldMetrics] = useState<FieldMetrics | null>(null);
  const [memberStates, setMemberStates] = useState<MemberFieldState[]>([]);
  const [resonancePatterns, setResonancePatterns] = useState<ResonancePattern[]>([]);
  const [fieldInteractions, setFieldInteractions] = useState<FieldInteraction[]>([]);
  const [fieldPredictions, setFieldPredictions] = useState<FieldPrediction[]>([]);
  const [collectiveInsights, setCollectiveInsights] = useState<CollectiveInsight[]>([]);
  const [practiceWindows, setPracticeWindows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollectiveData();

    // Set up real-time updates
    const interval = setInterval(loadCollectiveData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function loadCollectiveData() {
    try {
      console.log('🌐 Loading collective field data...');

      // Get current collective state
      const currentState = collectiveFieldOrchestrator.getCollectiveFieldState();
      setCollectiveState(currentState);

      // Mock member data for demonstration
      const mockMembers = generateMockMemberStates(currentState.activeMembers);
      setMemberStates(mockMembers);

      // Get resonance patterns
      const patterns = currentState.resonancePatterns;
      setResonancePatterns(patterns);

      // Get field interactions
      const interactions = collectiveFieldOrchestrator.getFieldInteractions();
      setFieldInteractions(interactions);

      // Calculate comprehensive field metrics
      const metrics = fieldCoherenceEngine.calculateFieldMetrics(mockMembers, []);
      setFieldMetrics(metrics);

      // Generate field predictions
      const predictions = fieldCoherenceEngine.generateFieldPredictions(mockMembers, [], metrics);
      setFieldPredictions(predictions);

      // Generate collective insights
      const insights = fieldCoherenceEngine.generateCollectiveInsights(mockMembers, metrics, patterns);
      setCollectiveInsights(insights);

      // Get optimal practice windows
      const windows = collectiveFieldOrchestrator.getOptimalPracticeWindows();
      setPracticeWindows(windows);

      console.log('✨ Collective field data loaded:', {
        members: mockMembers.length,
        coherence: currentState.overallCoherence,
        patterns: patterns.length
      });

    } catch (error) {
      console.error('❌ Error loading collective field data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Mock member data generation for demonstration
  function generateMockMemberStates(count: number): MemberFieldState[] {
    const operations = ['calcination', 'solutio', 'separatio', 'conjunctio', 'fermentation', 'distillation', 'coagulation'];
    const elements = ['Earth', 'Water', 'Fire', 'Air'];
    const directions = ['ascending', 'descending'];

    return Array.from({ length: count }, (_, i) => ({
      userId: `member_${i + 1}`,
      username: `Explorer ${i + 1}`,
      alchemicalOperation: operations[Math.floor(Math.random() * operations.length)] as any,
      spiralTrajectory: {
        velocity: Math.random() * 0.8 + 0.2,
        inwardness: Math.random() * 0.8 + 0.2,
        currentMode: 'fire' as any,
        elementalPosition: { fire: Math.random(), water: Math.random(), earth: Math.random(), air: Math.random(), aether: Math.random() }
      },
      elementalCirculation: {
        currentElement: elements[Math.floor(Math.random() * elements.length)] as any,
        direction: directions[Math.floor(Math.random() * directions.length)] as any,
        completionPercentage: Math.random() * 100,
        momentum: Math.random() * 0.8 + 0.2
      },
      breakthroughPrediction: Math.random() > 0.7 ? {
        probability: Math.random() * 0.4 + 0.6,
        timeframe: '1-3 days',
        type: 'creative' as any,
        triggerFactors: ['High creative energy'],
        readinessScore: Math.random() * 0.5 + 0.5,
        blockers: [],
        accelerators: ['Follow creative impulses'],
        nextLikelyBreakthrough: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        confidenceLevel: 'high' as any
      } : undefined,
      lastUpdated: new Date(),
      fieldContribution: Math.random() * 0.7 + 0.3
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-purple-400 animate-pulse">Loading collective field...</div>
      </div>
    );
  }

  if (!collectiveState || !fieldMetrics) {
    return (
      <div className="p-6 bg-purple-950/30 rounded-lg border border-purple-800/30">
        <h3 className="text-xl font-semibold text-purple-300 mb-4">Collective Field</h3>
        <p className="text-purple-400/70">
          Insufficient data for collective field analysis. Waiting for more members to join...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Field Overview */}
      <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
        <h3 className="text-2xl font-semibold text-purple-300 mb-6">Collective Consciousness Field</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Global Coherence"
            value={`${Math.round(fieldMetrics.globalCoherence * 100)}%`}
            color={fieldMetrics.globalCoherence > 0.7 ? 'text-green-400' : fieldMetrics.globalCoherence > 0.4 ? 'text-yellow-400' : 'text-red-400'}
          />
          <MetricCard
            label="Active Members"
            value={collectiveState.activeMembers.toString()}
            color="text-purple-300"
          />
          <MetricCard
            label="Toroidal Intensity"
            value={`${Math.round(fieldMetrics.toroidalIntensity * 100)}%`}
            color="text-cyan-400"
          />
          <MetricCard
            label="Emergence Index"
            value={`${Math.round(fieldMetrics.emergenceIndex * 100)}%`}
            color="text-orange-400"
          />
        </div>

        {/* Field Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-purple-400/70 mb-1">Dominant Operation</div>
            <div className="text-purple-300 font-medium capitalize">{collectiveState.dominantOperation}</div>
          </div>
          <div>
            <div className="text-purple-400/70 mb-1">Dominant Element</div>
            <div className="text-purple-300 font-medium">{collectiveState.dominantElement}</div>
          </div>
          <div>
            <div className="text-purple-400/70 mb-1">Field Velocity</div>
            <div className="text-purple-300 font-medium">{Math.round(collectiveState.fieldVelocity * 100)}%</div>
          </div>
          <div>
            <div className="text-purple-400/70 mb-1">Next Collective Shift</div>
            <div className="text-purple-300 font-medium">
              {collectiveState.nextCollectiveShift
                ? collectiveState.nextCollectiveShift.toLocaleDateString()
                : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Resonance Field Visualization */}
      <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
        <h3 className="text-xl font-semibold text-purple-300 mb-6">Field Resonance Mapping</h3>
        <ResonanceMapper
          members={memberStates}
          resonancePatterns={resonancePatterns}
          fieldInteractions={fieldInteractions}
          fieldMetrics={fieldMetrics}
          variant="full"
        />
      </div>

      {/* Field Predictions */}
      {fieldPredictions.length > 0 && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-6">Field Predictions</h3>
          <div className="space-y-4">
            {fieldPredictions.slice(0, 3).map((prediction, index) => (
              <PredictionCard key={index} prediction={prediction} />
            ))}
          </div>
        </div>
      )}

      {/* Collective Insights */}
      {collectiveInsights.length > 0 && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-6">Collective Insights</h3>
          <div className="space-y-4">
            {collectiveInsights.slice(0, 5).map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Optimal Practice Windows */}
      {practiceWindows.length > 0 && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-6">Optimal Practice Windows</h3>
          <div className="space-y-3">
            {practiceWindows.slice(0, 3).map((window, index) => (
              <PracticeWindowCard key={index} window={window} />
            ))}
          </div>
        </div>
      )}

      {/* Resonance Patterns */}
      {resonancePatterns.length > 0 && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-6">Active Resonance Patterns</h3>
          <div className="grid gap-4">
            {resonancePatterns.map((pattern, index) => (
              <ResonancePatternCard key={index} pattern={pattern} />
            ))}
          </div>
        </div>
      )}

      {/* Emergent Properties */}
      {collectiveState.emergentProperties.length > 0 && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-6">Emergent Field Properties</h3>
          <div className="space-y-2">
            {collectiveState.emergentProperties.map((property, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-purple-400">✨</span>
                <span className="text-purple-300/90">{property}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-sm text-purple-400/70 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: FieldPrediction }) {
  const typeColors = {
    coherence_shift: 'text-blue-400',
    breakthrough_wave: 'text-orange-400',
    field_restructuring: 'text-purple-400',
    emergence_event: 'text-green-400'
  };

  const color = typeColors[prediction.type] || 'text-purple-400';

  return (
    <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
      <div className="flex items-start justify-between mb-2">
        <div className={`text-sm font-medium ${color} capitalize`}>
          {prediction.type.replace('_', ' ')}
        </div>
        <div className="text-purple-300 text-sm font-semibold">
          {Math.round(prediction.probability * 100)}%
        </div>
      </div>
      <div className="text-purple-300 text-sm mb-2">{prediction.description}</div>
      <div className="flex items-center justify-between text-xs text-purple-400/70">
        <span>{prediction.timeframe}</span>
        <span>{prediction.affectedMembers} members affected</span>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: CollectiveInsight }) {
  const categoryColors = {
    pattern: 'text-blue-400',
    prediction: 'text-orange-400',
    opportunity: 'text-green-400',
    warning: 'text-red-400'
  };

  const categoryIcons = {
    pattern: '🔮',
    prediction: '🚀',
    opportunity: '✨',
    warning: '⚠️'
  };

  const color = categoryColors[insight.category] || 'text-purple-400';
  const icon = categoryIcons[insight.category] || '💡';

  return (
    <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
      <div className="flex items-start gap-3">
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-purple-300 font-medium">{insight.title}</h4>
            <div className={`text-xs font-medium ${color} capitalize`}>
              {insight.category}
            </div>
          </div>
          <p className="text-purple-300/80 text-sm mb-3">{insight.description}</p>
          {insight.actionable && insight.recommendedActions.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-purple-400">Recommended Actions:</div>
              {insight.recommendedActions.slice(0, 2).map((action, index) => (
                <div key={index} className="text-xs text-purple-400/70 flex gap-2">
                  <span>•</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PracticeWindowCard({ window }: { window: any }) {
  const isUpcoming = window.window > new Date();
  const timeUntil = isUpcoming
    ? Math.round((window.window.getTime() - Date.now()) / (1000 * 60 * 60))
    : 0;

  return (
    <div className="bg-green-950/20 rounded-lg p-4 border border-green-700/30">
      <div className="flex items-start justify-between mb-2">
        <div className="text-green-300 font-medium">
          Optimal Practice Window
        </div>
        <div className="text-green-400 text-sm">
          {window.participantCount} members
        </div>
      </div>
      <div className="text-green-300/80 text-sm mb-2">{window.reason}</div>
      <div className="flex items-center justify-between text-xs text-green-400/70">
        <span>
          {isUpcoming
            ? `In ${timeUntil} hours`
            : window.window.toLocaleString()}
        </span>
        <span>{window.duration} minutes</span>
      </div>
    </div>
  );
}

function ResonancePatternCard({ pattern }: { pattern: ResonancePattern }) {
  const typeColors = {
    synchronous: 'text-green-400',
    counter_spiral: 'text-red-400',
    harmonic: 'text-yellow-400',
    chaotic: 'text-orange-400'
  };

  const color = typeColors[pattern.type] || 'text-purple-400';

  return (
    <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
      <div className="flex items-start justify-between mb-2">
        <div className={`text-sm font-medium ${color} capitalize`}>
          {pattern.type} Pattern
        </div>
        <div className="text-purple-300 text-sm">
          {Math.round(pattern.strength * 100)}% strength
        </div>
      </div>
      <div className="text-purple-300/80 text-sm mb-2">{pattern.description}</div>
      <div className="flex items-center justify-between text-xs text-purple-400/70">
        <span>{pattern.memberIds.length} members</span>
        <span>{pattern.predictedEvolution}</span>
      </div>
    </div>
  );
}