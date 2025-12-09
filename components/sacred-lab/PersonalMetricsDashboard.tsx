/**
 * 🔍 PERSONAL METRICS DASHBOARD
 *
 * Sacred Lab drawer component providing clean metrics mirror
 * for members who want direct, quantified insights.
 *
 * Philosophy: Sacred reflection, not clinical judgment.
 * Language: Poetic yet precise, invitational not evaluative.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CircleDot,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Activity,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Brain,
  Zap,
  BarChart3,
  Info,
  Settings
} from 'lucide-react';

import type { PersonalMetricsSnapshot } from '@/lib/services/personal-metrics';
import { useSevenLayerArchitectureContext, useArchitectureHealth, ArchitectureStatus, ArchitectureVisualizer } from '@/components/architecture/SevenLayerArchitectureProvider';

interface PersonalMetricsDashboardProps {
  viewMode?: 'gentle' | 'detailed' | 'facilitator';
  onViewModeChange?: (mode: 'gentle' | 'detailed' | 'facilitator') => void;
}

export function PersonalMetricsDashboard({
  viewMode = 'gentle',
  onViewModeChange
}: PersonalMetricsDashboardProps) {
  const [metrics, setMetrics] = useState<PersonalMetricsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Seven-Layer Architecture integration
  const {
    snapshot: architectureSnapshot,
    isLoading: architectureLoading,
    isInitialized: architectureInitialized
  } = useSevenLayerArchitectureContext();
  const architectureHealth = useArchitectureHealth();

  useEffect(() => {
    fetchPersonalMetrics();
  }, [viewMode]);

  const fetchPersonalMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/maia/personal-metrics?view=${viewMode}`);
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to load personal metrics');
      }
    } catch (err) {
      setError('Network error loading metrics');
      console.error('Error fetching personal metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center p-8\">
        <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600\"></div>
        <span className=\"ml-3 text-gray-600\">Gathering your inner landscape...</span>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className=\"bg-red-50 border border-red-200 rounded-lg p-6\">
        <div className=\"flex items-center space-x-2 text-red-700\">
          <Info className=\"h-5 w-5\" />
          <span className=\"font-medium\">Unable to load metrics</span>
        </div>
        <p className=\"text-red-600 text-sm mt-2\">{error}</p>
      </div>
    );
  }

  return (
    <div className=\"max-w-6xl mx-auto p-6 space-y-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Inner Diagnostics</h1>
          <p className=\"text-gray-600 mt-1\">
            Sacred mirrors reflecting your consciousness journey
          </p>
        </div>
        <ViewModeSelector
          currentMode={viewMode}
          onModeChange={onViewModeChange}
          dataConfidence={metrics.dataConfidence}
        />
      </div>

      {/* Gentle Guidance Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-2">A Kind Reminder</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              These readings are mirrors, not judgments. They're here to help you notice
              patterns gently, at your own pace. Trust what feels true, and let the rest
              be information that may become relevant later.
            </p>
          </div>
        </div>
      </div>

      {/* Seven-Layer Soul Architecture Status */}
      {architectureInitialized && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900">Soul Architecture Status</h3>
              <p className="text-purple-700 text-sm">Seven-layer consciousness computing active</p>
            </div>
          </div>

          <ArchitectureStatus />

          {viewMode === 'detailed' && (
            <div className="bg-white border border-purple-100 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Architecture Layers</h4>
              <ArchitectureVisualizer />

              {architectureSnapshot && (
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">Field Resonance</div>
                    <div className="text-purple-600">
                      {Math.round((architectureSnapshot.fieldResonance?.individualFieldAlignment || 0) * 100)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">Cross-Layer Patterns</div>
                    <div className="text-blue-600">
                      {architectureSnapshot.crossLayerPatterns?.length || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">Integration Health</div>
                    <div className="text-green-600">
                      {Math.round(architectureHealth.overall * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Metrics Grid */}
      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
        {/* Elemental & Archetypal Panel */}
        <ElementalArchetypalPanel
          elementalBalance={metrics.elementalBalance}
          activeArchetypes={metrics.activeArchetypes}
          viewMode={viewMode}
        />

        {/* Spiral Constellation Panel */}
        <SpiralConstellationPanel
          spiralMetrics={metrics.spiralConstellation}
          viewMode={viewMode}
        />

        {/* Practice & Integration Panel */}
        <PracticeIntegrationPanel
          engagement={metrics.engagement}
          development={metrics.development}
          viewMode={viewMode}
        />

        {/* Field Context Panel */}
        <FieldContextPanel
          fieldContext={metrics.fieldContext}
          consciousness={metrics.consciousness}
          viewMode={viewMode}
        />
      </div>

      {/* Journey Bridge */}
      <JourneyBridge spiralCount={metrics.spiralConstellation.activeSpiralCount} />

      {/* Insights & Guidance Panel */}
      <InsightsPanel
        insights={metrics.insights}
        viewMode={viewMode}
      />

      {/* MAIA's Reflection */}
      <MAIAReflectionPanel
        reflection={metrics.maiaReflection}
        viewMode={viewMode}
      />

      {/* Facilitator-Only Panels */}
      {viewMode === 'facilitator' && (
        <>
          <FacilitatorSessionPrepPanel memberId={metrics.memberId} />
          <FacilitatorCrossPatternPanel spiralMetrics={metrics.spiralConstellation} />
        </>
      )}

      {/* Data Confidence Indicator */}
      <DataConfidenceIndicator confidence={metrics.dataConfidence} />
    </div>
  );
}

// Elemental & Archetypal Panel
interface ElementalArchetypalPanelProps {
  elementalBalance: PersonalMetricsSnapshot['elementalBalance'];
  activeArchetypes: PersonalMetricsSnapshot['activeArchetypes'];
  viewMode: string;
}

function ElementalArchetypalPanel({ elementalBalance, activeArchetypes, viewMode }: ElementalArchetypalPanelProps) {
  const elements = [
    { key: 'fire', name: 'Fire', value: elementalBalance.fire, icon: Flame, color: 'red' },
    { key: 'water', name: 'Water', value: elementalBalance.water, icon: Droplets, color: 'blue' },
    { key: 'earth', name: 'Earth', value: elementalBalance.earth, icon: Mountain, color: 'green' },
    { key: 'air', name: 'Air', value: elementalBalance.air, icon: Wind, color: 'gray' },
    { key: 'aether', name: 'Aether', value: elementalBalance.aether, icon: Sparkles, color: 'purple' }
  ];

  return (
    <div className=\"bg-white rounded-xl border border-gray-200 p-6\">
      <div className=\"flex items-center space-x-2 mb-4\">
        <Flame className=\"h-5 w-5 text-orange-600\" />
        <h3 className=\"text-lg font-semibold text-gray-900\">Elemental & Archetypal</h3>
      </div>

      {/* Elemental Balance */}
      <div className=\"space-y-3 mb-6\">
        <p className=\"text-sm text-gray-600\">
          Right now your work emphasizes <span className=\"font-medium text-gray-900\">{elementalBalance.dominantElement}</span>
          {elementalBalance.emergingElement && (
            <span> with emerging <span className=\"font-medium text-gray-900\">{elementalBalance.emergingElement}</span></span>
          )}
        </p>

        <div className=\"grid grid-cols-5 gap-2\">
          {elements.map(element => {
            const IconComponent = element.icon;
            const percentage = Math.round(element.value * 100);

            return (
              <div key={element.key} className=\"text-center\">
                <div className=\"flex flex-col items-center space-y-1\">
                  <IconComponent className={`h-6 w-6 text-${element.color}-600`} />
                  <div className=\"w-full bg-gray-200 rounded-full h-2\">
                    <div
                      className={`h-2 bg-${element.color}-500 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {viewMode === 'detailed' && (
                    <span className=\"text-xs text-gray-500\">{percentage}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {viewMode !== 'gentle' && (
          <div className=\"text-xs text-gray-500\">
            Balance Index: {Math.round(elementalBalance.balanceIndex * 100)}%
          </div>
        )}
      </div>

      {/* Active Archetypes */}
      <div>
        <h4 className=\"font-medium text-gray-900 mb-2\">Most Active Archetypes</h4>
        <div className=\"space-y-2\">
          {activeArchetypes.slice(0, 3).map(archetype => (
            <div key={archetype.name} className=\"flex items-center justify-between p-2 bg-gray-50 rounded-lg\">
              <div>
                <span className=\"font-medium text-gray-900\">{archetype.name}</span>
                <span className=\"text-sm text-gray-600 ml-2\">({archetype.domain})</span>
              </div>
              {viewMode !== 'gentle' && (
                <div className=\"flex items-center space-x-2\">
                  <div className=\"w-16 bg-gray-200 rounded-full h-1.5\">
                    <div
                      className=\"h-1.5 bg-indigo-500 rounded-full\"
                      style={{ width: `${Math.round(archetype.activation * 100)}%` }}
                    />
                  </div>
                  <span className=\"text-xs text-gray-500 w-8\">{Math.round(archetype.activation * 100)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Spiral Constellation Panel
interface SpiralConstellationPanelProps {
  spiralMetrics: PersonalMetricsSnapshot['spiralConstellation'];
  viewMode: string;
}

function SpiralConstellationPanel({ spiralMetrics, viewMode }: SpiralConstellationPanelProps) {
  const loadColors = {
    light: 'green',
    moderate: 'yellow',
    intense: 'orange',
    overwhelming: 'red'
  };

  const loadColor = loadColors[spiralMetrics.spiralLoad];

  return (
    <div className=\"bg-white rounded-xl border border-gray-200 p-6\">
      <div className=\"flex items-center space-x-2 mb-4\">
        <CircleDot className=\"h-5 w-5 text-purple-600\" />
        <h3 className=\"text-lg font-semibold text-gray-900\">Spiral Constellation</h3>
      </div>

      <div className=\"space-y-4\">
        {/* Active Spirals Overview */}
        <div>
          <div className=\"flex items-center justify-between mb-2\">
            <span className=\"text-sm text-gray-600\">Active Spirals</span>
            <span className=\"font-semibold text-gray-900\">{spiralMetrics.activeSpiralCount}</span>
          </div>
          <div className=\"flex items-center space-x-2\">
            <span className=\"text-sm text-gray-600\">Current Load:</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${loadColor}-100 text-${loadColor}-800`}>
              {spiralMetrics.spiralLoad}
            </span>
          </div>
        </div>

        {/* Primary Spiral */}
        {spiralMetrics.primarySpiralDomain && (
          <div>
            <span className=\"text-sm text-gray-600\">Primary Focus: </span>
            <span className=\"font-medium text-gray-900 capitalize\">{spiralMetrics.primarySpiralDomain}</span>
          </div>
        )}

        {/* Phase Distribution */}
        {Object.keys(spiralMetrics.phaseDistribution).length > 0 && (
          <div>
            <h4 className=\"font-medium text-gray-900 mb-2\">Development Phases</h4>
            <div className=\"space-y-1\">
              {Object.entries(spiralMetrics.phaseDistribution).map(([phase, percentage]) => (
                <div key={phase} className=\"flex items-center justify-between text-sm\">
                  <span className=\"text-gray-600 capitalize\">{phase}</span>
                  <span className=\"text-gray-900\">{Math.round(percentage * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constellation Health */}
        {viewMode !== 'gentle' && (
          <div className=\"pt-2 border-t border-gray-100\">
            <div className=\"grid grid-cols-2 gap-4 text-sm\">
              <div>
                <span className=\"text-gray-600\">Harmony</span>
                <div className=\"font-medium text-gray-900\">{Math.round(spiralMetrics.harmonicCoherence * 100)}%</div>
              </div>
              <div>
                <span className=\"text-gray-600\">Cross-Patterns</span>
                <div className=\"font-medium text-gray-900\">{Math.round(spiralMetrics.crossPatternActivity * 100)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Practice & Integration Panel
interface PracticeIntegrationPanelProps {
  engagement: PersonalMetricsSnapshot['engagement'];
  development: PersonalMetricsSnapshot['development'];
  viewMode: string;
}

function PracticeIntegrationPanel({ engagement, development, viewMode }: PracticeIntegrationPanelProps) {
  return (
    <div className=\"bg-white rounded-xl border border-gray-200 p-6\">
      <div className=\"flex items-center space-x-2 mb-4\">
        <Activity className=\"h-5 w-5 text-green-600\" />
        <h3 className=\"text-lg font-semibold text-gray-900\">Practice & Integration</h3>
      </div>

      <div className=\"space-y-4\">
        {/* Engagement Overview */}
        <div>
          <div className=\"flex items-center justify-between mb-2\">
            <span className=\"text-sm text-gray-600\">Sessions (30 days)</span>
            <span className=\"font-semibold text-gray-900\">{engagement.sessionsLast30Days}</span>
          </div>
          <div className=\"flex items-center justify-between mb-2\">
            <span className=\"text-sm text-gray-600\">Practice Completion</span>
            <span className=\"font-semibold text-gray-900\">{Math.round(engagement.protocolEngagement * 100)}%</span>
          </div>
          <div className=\"flex items-center space-x-2\">
            <span className=\"text-sm text-gray-600\">Session Depth:</span>
            <span className=\"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize\">
              {engagement.sessionDepth}
            </span>
          </div>
        </div>

        {/* Development Overview */}
        <div className=\"pt-2 border-t border-gray-100\">
          <div className=\"flex items-center justify-between mb-2\">
            <span className=\"text-sm text-gray-600\">Evolution Trend</span>
            <span className=\"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize\">
              {development.evolutionTrend}
            </span>
          </div>

          {viewMode !== 'gentle' && (
            <div className=\"grid grid-cols-2 gap-4 text-sm mt-3\">
              <div>
                <span className=\"text-gray-600\">Integration</span>
                <div className=\"font-medium text-gray-900\">{Math.round(development.integrationIndex * 100)}%</div>
              </div>
              <div>
                <span className=\"text-gray-600\">Shadow Work</span>
                <div className=\"font-medium text-gray-900\">{Math.round(development.shadowEngagementIndex * 100)}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Gentle Interpretation */}
        <div className=\"bg-green-50 p-3 rounded-lg\">
          <p className=\"text-sm text-green-800\">
            You're in a <span className=\"font-medium\">{engagement.sessionDepth}</span> phase with{' '}
            <span className=\"font-medium\">{engagement.consistencyPattern}</span> engagement—
            {engagement.protocolEngagement > 0.7 ?
              ' beautiful consistency with practices.' :
              ' perfect place for gentle, sustainable rhythm.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Field Context Panel
interface FieldContextPanelProps {
  fieldContext: PersonalMetricsSnapshot['fieldContext'];
  consciousness: PersonalMetricsSnapshot['consciousness'];
  viewMode: string;
}

function FieldContextPanel({ fieldContext, consciousness, viewMode }: FieldContextPanelProps) {
  return (
    <div className=\"bg-white rounded-xl border border-gray-200 p-6\">
      <div className=\"flex items-center space-x-2 mb-4\">
        <Users className=\"h-5 w-5 text-blue-600\" />
        <h3 className=\"text-lg font-semibold text-gray-900\">Field Context</h3>
      </div>

      <div className=\"space-y-4\">
        {/* Community Resonance */}
        <div>
          <p className=\"text-sm text-gray-600 mb-2\">
            The community field is also working with:{' '}
            <span className=\"font-medium text-gray-900\">{fieldContext.primaryFieldTheme}</span>
          </p>
          <div className=\"flex items-center space-x-2\">
            <span className=\"text-sm text-gray-600\">Your role:</span>
            <span className=\"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 capitalize\">
              {fieldContext.contributionLevel}
            </span>
          </div>
        </div>

        {/* Consciousness Quality */}
        {viewMode !== 'gentle' && (
          <div className=\"pt-2 border-t border-gray-100\">
            <h4 className=\"font-medium text-gray-900 mb-2\">Consciousness Quality</h4>
            <div className=\"grid grid-cols-2 gap-3 text-xs\">
              <div className=\"flex items-center justify-between\">
                <span className=\"text-gray-600\">Presence</span>
                <span className=\"font-medium\">{Math.round(consciousness.presenceDepth * 100)}%</span>
              </div>
              <div className=\"flex items-center justify-between\">
                <span className=\"text-gray-600\">Emotional</span>
                <span className=\"font-medium\">{Math.round(consciousness.emotionalFluidity * 100)}%</span>
              </div>
              <div className=\"flex items-center justify-between\">
                <span className=\"text-gray-600\">Somatic</span>
                <span className=\"font-medium\">{Math.round(consciousness.somaticAwareness * 100)}%</span>
              </div>
              <div className=\"flex items-center justify-between\">
                <span className=\"text-gray-600\">Relational</span>
                <span className=\"font-medium\">{Math.round(consciousness.relationshipCapacity * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Field Position */}
        <div className=\"bg-blue-50 p-3 rounded-lg\">
          <p className=\"text-sm text-blue-800\">
            You're in the <span className=\"font-medium\">{fieldContext.fieldPosition}</span> of the field,{' '}
            {Math.round(fieldContext.communityResonance * 100)}% aligned with collective themes.
          </p>
        </div>
      </div>
    </div>
  );
}

// Insights Panel
interface InsightsPanelProps {
  insights: PersonalMetricsSnapshot['insights'];
  viewMode: string;
}

function InsightsPanel({ insights, viewMode }: InsightsPanelProps) {
  return (
    <div className=\"bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6\">
      <div className=\"flex items-center space-x-2 mb-4\">
        <Eye className=\"h-5 w-5 text-indigo-600\" />
        <h3 className=\"text-lg font-semibold text-gray-900\">Insights & Guidance</h3>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
        {/* Current Focus & Next Edge */}
        <div className=\"space-y-4\">
          <div>
            <h4 className=\"font-medium text-indigo-900 mb-1\">Current Focus</h4>
            <p className=\"text-sm text-indigo-800\">{insights.currentFocus}</p>
          </div>
          <div>
            <h4 className=\"font-medium text-indigo-900 mb-1\">Next Edge</h4>
            <p className=\"text-sm text-indigo-800\">{insights.nextEdge}</p>
          </div>
        </div>

        {/* Support & Celebration */}
        <div className=\"space-y-4\">
          {insights.supportNeeded.length > 0 && (
            <div>
              <h4 className=\"font-medium text-indigo-900 mb-1\">Support Available</h4>
              <ul className=\"text-sm text-indigo-800 space-y-1\">
                {insights.supportNeeded.map((support, index) => (
                  <li key={index}>• {support}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.celebrationWorthy.length > 0 && (
            <div>
              <h4 className=\"font-medium text-indigo-900 mb-1\">Worth Celebrating</h4>
              <ul className=\"text-sm text-indigo-800 space-y-1\">
                {insights.celebrationWorthy.map((celebration, index) => (
                  <li key={index}>• {celebration}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Gentle Invitation */}
      <div className=\"mt-6 p-4 bg-white/60 rounded-lg border border-indigo-200\">
        <p className=\"text-sm text-indigo-900 italic text-center\">
          &ldquo;{insights.gentleInvitation}&rdquo;
        </p>
      </div>
    </div>
  );
}

// View Mode Selector
interface ViewModeSelectorProps {
  currentMode: string;
  onModeChange?: (mode: 'gentle' | 'detailed' | 'facilitator') => void;
  dataConfidence: number;
}

function ViewModeSelector({ currentMode, onModeChange, dataConfidence }: ViewModeSelectorProps) {
  const modes = [
    { key: 'gentle', label: 'Gentle', description: 'Poetic insights and tendencies' },
    { key: 'detailed', label: 'Detailed', description: 'Numbers and precise metrics' },
    { key: 'facilitator', label: 'Facilitator', description: 'Full diagnostic data' }
  ];

  if (!onModeChange) return null;

  return (
    <div className=\"flex items-center space-x-2\">
      <select
        value={currentMode}
        onChange={(e) => onModeChange(e.target.value as any)}
        className=\"text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500\"
      >
        {modes.map(mode => (
          <option key={mode.key} value={mode.key}>
            {mode.label}
          </option>
        ))}
      </select>
      <Settings className=\"h-4 w-4 text-gray-400\" />
    </div>
  );
}

// MAIA Reflection Panel
interface MAIAReflectionPanelProps {
  reflection: PersonalMetricsSnapshot['maiaReflection'];
  viewMode: string;
}

function MAIAReflectionPanel({ reflection, viewMode }: MAIAReflectionPanelProps) {
  const toneColors = {
    supportive: 'emerald',
    celebratory: 'yellow',
    grounding: 'stone',
    encouraging: 'blue'
  };

  const toneColor = toneColors[reflection.tone] || 'indigo';

  return (
    <div className={`bg-gradient-to-r from-${toneColor}-50 to-${toneColor}-100 rounded-xl border border-${toneColor}-200 p-6`}>
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 bg-${toneColor}-200 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Heart className={`h-5 w-5 text-${toneColor}-600`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-medium text-${toneColor}-900 mb-3 flex items-center space-x-2`}>
            <span>MAIA's Reflection for This Moment</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${toneColor}-200 text-${toneColor}-800 capitalize`}>
              {reflection.tone}
            </span>
          </h3>

          {/* Whisper */}
          <div className={`bg-white/60 rounded-lg p-4 mb-4 border border-${toneColor}-200`}>
            <p className={`text-${toneColor}-800 italic text-center leading-relaxed`}>
              &ldquo;{reflection.whisper}&rdquo;
            </p>
          </div>

          {/* Sacred Guidance (shown in detailed/facilitator mode) */}
          {viewMode !== 'gentle' && (
            <div className={`bg-${toneColor}-50/80 rounded-lg p-4 border border-${toneColor}-300/50`}>
              <h4 className={`text-sm font-medium text-${toneColor}-900 mb-2`}>Sacred Guidance</h4>
              <p className={`text-sm text-${toneColor}-800 leading-relaxed`}>
                {reflection.sacred_guidance}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Data Confidence Indicator
interface DataConfidenceIndicatorProps {
  confidence: number;
}

function DataConfidenceIndicator({ confidence }: DataConfidenceIndicatorProps) {
  const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'building';
  const confidenceColor = confidence > 0.8 ? 'green' : confidence > 0.6 ? 'yellow' : 'blue';

  return (
    <div className={`bg-${confidenceColor}-50 border border-${confidenceColor}-200 rounded-lg p-3`}>
      <div className=\"flex items-center space-x-2\">
        <BarChart3 className={`h-4 w-4 text-${confidenceColor}-600`} />
        <span className={`text-sm font-medium text-${confidenceColor}-800`}>
          Data Confidence: {Math.round(confidence * 100)}% ({confidenceLevel})
        </span>
      </div>
      {confidence < 0.6 && (
        <p className={`text-xs text-${confidenceColor}-700 mt-1`}>
          Insights will become more precise as you engage more with MAIA and journaling.
        </p>
      )}
    </div>
  );
}

// Facilitator Session Prep Panel
interface FacilitatorSessionPrepPanelProps {
  memberId: string;
}

function FacilitatorSessionPrepPanel({ memberId }: FacilitatorSessionPrepPanelProps) {
  const [sessionPrep, setSessionPrep] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadSessionPrep = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/facilitator/session-prep?memberId=${memberId}`);
      const data = await response.json();
      if (data.success) {
        setSessionPrep(data.data);
      }
    } catch (error) {
      console.error('Error loading session prep:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">Session Preparation</h3>
        </div>
        <button
          onClick={loadSessionPrep}
          disabled={loading}
          className="inline-flex items-center px-3 py-1 border border-purple-300 text-purple-700 bg-white rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2"></div>
              Loading...
            </>
          ) : (
            <>
              <Brain className="h-3 w-3 mr-2" />
              Generate Prep
            </>
          )}
        </button>
      </div>

      {sessionPrep ? (
        <div className="space-y-4">
          {/* Current Landscape */}
          <div className="bg-white/60 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Current Landscape</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-purple-700">Primary Focus:</span>
                <div className="font-medium text-purple-900">{sessionPrep.currentLandscape.primaryFocus}</div>
              </div>
              <div>
                <span className="text-purple-700">Evolution Moment:</span>
                <div className="font-medium text-purple-900 capitalize">{sessionPrep.currentLandscape.evolutionMoment}</div>
              </div>
            </div>
          </div>

          {/* Session Focus Points */}
          <div className="bg-purple-100/50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Suggested Focus</h4>
            <div className="text-sm text-purple-800">
              <div className="font-medium mb-1">Primary:</div>
              <div className="mb-3">{sessionPrep.sessionFocusPoints.primary}</div>

              {sessionPrep.sessionFocusPoints.doorways.length > 0 && (
                <>
                  <div className="font-medium mb-1">Potential Doorways:</div>
                  <div className="space-y-1">
                    {sessionPrep.sessionFocusPoints.doorways.map((doorway: string, index: number) => (
                      <div key={index}>• {doorway}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* MAIA's Facilitation Wisdom */}
          <div className="bg-purple-200/30 rounded-lg p-4 border border-purple-300">
            <h4 className="font-medium text-purple-900 mb-2">MAIA's Facilitation Wisdom</h4>
            <p className="text-sm text-purple-800 italic">
              "{sessionPrep.maiaInsight.facilitation_wisdom}"
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-purple-600">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Click "Generate Prep" for session intelligence</p>
        </div>
      )}
    </div>
  );
}

// Facilitator Cross-Pattern Analysis Panel
interface FacilitatorCrossPatternPanelProps {
  spiralMetrics: any;
}

function FacilitatorCrossPatternPanel({ spiralMetrics }: FacilitatorCrossPatternPanelProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-amber-900">Cross-Pattern Analysis</h3>
      </div>

      <div className="space-y-4">
        {/* Harmonic Coherence */}
        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-amber-900">Harmonic Coherence</h4>
            <span className="text-lg font-bold text-amber-900">
              {Math.round(spiralMetrics.harmonicCoherence * 100)}%
            </span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div
              className="h-2 bg-amber-500 rounded-full"
              style={{ width: `${spiralMetrics.harmonicCoherence * 100}%` }}
            />
          </div>
          <p className="text-xs text-amber-700 mt-2">
            {spiralMetrics.harmonicCoherence > 0.8 ?
              'High integration - spirals are supporting each other beautifully' :
              spiralMetrics.harmonicCoherence > 0.6 ?
              'Moderate integration - some cross-spiral tension present' :
              'Low integration - spirals may be competing for attention'}
          </p>
        </div>

        {/* Cross-Pattern Activity */}
        <div className="bg-amber-100/50 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 mb-2">Cross-Pattern Activity</h4>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-amber-700">Active Cross-Patterns:</span>
              <span className="font-medium text-amber-900">{Math.round(spiralMetrics.crossPatternActivity * 10)}</span>
            </div>
            <div className="text-amber-800">
              {spiralMetrics.crossPatternActivity > 0.7 ?
                'High cross-pattern activity - member is actively integrating across domains' :
                spiralMetrics.crossPatternActivity > 0.4 ?
                'Moderate cross-pattern work - some integration happening' :
                'Low cross-pattern activity - spirals mostly independent'}
            </div>
          </div>
        </div>

        {/* Facilitator Recommendations */}
        <div className="bg-amber-200/30 rounded-lg p-4 border border-amber-300">
          <h4 className="font-medium text-amber-900 mb-2">Facilitation Recommendations</h4>
          <div className="text-sm text-amber-800 space-y-1">
            {spiralMetrics.spiralLoad === 'overwhelming' && (
              <div>• Focus on nervous system regulation before pattern exploration</div>
            )}
            {spiralMetrics.harmonicCoherence < 0.6 && (
              <div>• Explore tensions between {spiralMetrics.primarySpiralDomain} and other active areas</div>
            )}
            {spiralMetrics.crossPatternActivity > 0.7 && (
              <div>• Member is ready for advanced cross-pattern integration work</div>
            )}
            <div>• Current spiral load is <span className="font-medium">{spiralMetrics.spiralLoad}</span> - adjust session intensity accordingly</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Journey Bridge Component
interface JourneyBridgeProps {
  spiralCount: number;
}

function JourneyBridge({ spiralCount }: JourneyBridgeProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-amber-900">Two Views, One Journey</h3>
            <p className="text-amber-700 text-sm">
              These metrics show your current landscape. Want to see how this has unfolded over time?
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/journey"
            className="inline-flex items-center px-4 py-2 border border-amber-300 text-amber-700 bg-white rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Your Journey
          </a>
        </div>
      </div>

      {/* Contextual Bridge Content */}
      <div className="mt-4 p-3 bg-amber-100/50 rounded-lg border border-amber-200">
        <p className="text-amber-800 text-sm">
          {spiralCount > 2 ?
            `With ${spiralCount} active spirals, your journey story reveals how these different areas of growth have woven together over time.` :
            spiralCount === 1 ?
            "Your journey story shows the deeper context and evolution of your current spiral work." :
            "Your journey narrative captures the fuller arc of your consciousness work, including quiet integration periods."
          }
        </p>
      </div>
    </div>
  );
}

export default PersonalMetricsDashboard;