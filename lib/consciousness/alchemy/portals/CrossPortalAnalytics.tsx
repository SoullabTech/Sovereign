// @ts-nocheck
/**
 * Cross-Portal Analytics and Insights System
 *
 * Advanced analytics providing actionable insights across the consciousness portal ecosystem,
 * including journey mapping, cultural effectiveness analysis, and AI-driven recommendations.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Users,
  ArrowRight,
  Brain,
  Target,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Eye,
  Clock,
  Star,
  AlertCircle,
  CheckCircle2,
  Globe
} from 'lucide-react';
import {
  PortalId,
  ComplexityTier,
  SafetyLevel,
  PORTAL_METADATA,
  COMPLEXITY_METADATA
} from './PortalTypes';

// Analytics data interfaces
interface UserJourney {
  userId: string;
  steps: {
    portalId: PortalId;
    complexityTier: ComplexityTier;
    duration: number;
    outcomeScore: number;
    timestamp: Date;
  }[];
  overallSuccess: number;
  culturalBackground: string;
}

interface PortalEffectivenessData {
  portalId: PortalId;
  consciousnessState: string;
  successRate: number;
  averageEngagement: number;
  complexityOptimal: ComplexityTier;
  culturalResonance: number;
  safetyScore: number;
  recommendationStrength: number;
}

interface CrossPortalInsight {
  id: string;
  type: 'optimization' | 'warning' | 'opportunity' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  confidence: number;
  evidence: string[];
}

interface AnalyticsProps {
  className?: string;
}

export const CrossPortalAnalytics: React.FC<AnalyticsProps> = ({ className = '' }) => {
  const [activeView, setActiveView] = useState<'journeys' | 'effectiveness' | 'insights' | 'recommendations'>('journeys');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [journeyData, setJourneyData] = useState<UserJourney[]>([]);
  const [effectivenessData, setEffectivenessData] = useState<PortalEffectivenessData[]>([]);
  const [insights, setInsights] = useState<CrossPortalInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock analytics data
  useEffect(() => {
    const generateJourneyData = (): UserJourney[] => {
      const journeys: UserJourney[] = [];
      const portals = Object.keys(PORTAL_METADATA) as PortalId[];
      const complexityTiers: ComplexityTier[] = ['beginner', 'intermediate', 'advanced'];
      const cultures = ['western_therapeutic', 'eastern_spiritual', 'indigenous_shamanic', 'academic_rational'];

      for (let i = 0; i < 50; i++) {
        const steps = [];
        const stepCount = Math.floor(Math.random() * 4) + 1;

        for (let j = 0; j < stepCount; j++) {
          steps.push({
            portalId: portals[Math.floor(Math.random() * portals.length)],
            complexityTier: complexityTiers[Math.floor(Math.random() * complexityTiers.length)],
            duration: Math.floor(Math.random() * 30) + 5,
            outcomeScore: Math.random() * 5,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          });
        }

        journeys.push({
          userId: `user_${i}`,
          steps,
          overallSuccess: Math.random() * 5,
          culturalBackground: cultures[Math.floor(Math.random() * cultures.length)]
        });
      }

      return journeys;
    };

    const generateEffectivenessData = (): PortalEffectivenessData[] => {
      const portals = Object.keys(PORTAL_METADATA) as PortalId[];
      const states = ['lead_crisis', 'iron_boundary', 'mercury_flow', 'gold_integration'];
      const complexityTiers: ComplexityTier[] = ['beginner', 'intermediate', 'advanced'];

      return portals.flatMap(portalId =>
        states.map(state => ({
          portalId,
          consciousnessState: state,
          successRate: Math.random() * 0.6 + 0.3,
          averageEngagement: Math.random() * 4 + 1,
          complexityOptimal: complexityTiers[Math.floor(Math.random() * complexityTiers.length)],
          culturalResonance: Math.random() * 5,
          safetyScore: Math.random() * 2 + 3,
          recommendationStrength: Math.random()
        }))
      );
    };

    const generateInsights = (): CrossPortalInsight[] => {
      return [
        {
          id: 'insight_1',
          type: 'optimization',
          title: 'Therapeutic Portal Showing 23% Higher Success in Lead Crisis',
          description: 'Users experiencing lead crisis show significantly better outcomes when routed through therapeutic portal versus shamanic for Western cultural backgrounds.',
          impact: 'high',
          actionable: true,
          confidence: 0.87,
          evidence: ['127 user journeys analyzed', 'Cross-validated over 30 days', 'Cultural background correlation: 0.73']
        },
        {
          id: 'insight_2',
          type: 'opportunity',
          title: 'Untapped Complexity Progression Path Identified',
          description: 'Users successfully completing beginner→advanced jumps in Corporate portal show 40% higher long-term engagement.',
          impact: 'medium',
          actionable: true,
          confidence: 0.74,
          evidence: ['43 successful progression paths', 'Engagement tracking over 60 days', 'Statistically significant (p<0.05)']
        },
        {
          id: 'insight_3',
          type: 'warning',
          title: 'Safety Incidents Clustering in Academic Portal Advanced Tier',
          description: 'Elevated safety incidents detected when users with limited consciousness work experience access advanced academic portal content.',
          impact: 'high',
          actionable: true,
          confidence: 0.92,
          evidence: ['12 safety incidents in 7 days', 'User experience profiling', 'Recommendation: Add experience gating']
        },
        {
          id: 'insight_4',
          type: 'trend',
          title: 'Evening Sessions Show 31% Higher Portal Switching Rate',
          description: 'Users are significantly more likely to explore multiple portal perspectives during evening sessions, suggesting higher openness to cultural adaptation.',
          impact: 'medium',
          actionable: false,
          confidence: 0.81,
          evidence: ['Temporal analysis of 2,300 sessions', 'Portal switching rate correlation', 'Circadian pattern identified']
        }
      ];
    };

    setTimeout(() => {
      setJourneyData(generateJourneyData());
      setEffectivenessData(generateEffectivenessData());
      setInsights(generateInsights());
      setIsLoading(false);
    }, 1200);
  }, [timeRange]);

  // Analytics computations
  const journeyAnalytics = useMemo(() => {
    if (!journeyData.length) return null;

    const portalTransitions: Record<string, number> = {};
    const complexityProgression: Record<string, number> = {};
    let totalSwitches = 0;
    let successfulJourneys = 0;

    journeyData.forEach(journey => {
      if (journey.overallSuccess > 3) successfulJourneys++;

      for (let i = 0; i < journey.steps.length - 1; i++) {
        const from = journey.steps[i].portalId;
        const to = journey.steps[i + 1].portalId;
        const transitionKey = `${from}_${to}`;
        portalTransitions[transitionKey] = (portalTransitions[transitionKey] || 0) + 1;
        totalSwitches++;

        const complexityKey = `${journey.steps[i].complexityTier}_${journey.steps[i + 1].complexityTier}`;
        complexityProgression[complexityKey] = (complexityProgression[complexityKey] || 0) + 1;
      }
    });

    const topTransitions = Object.entries(portalTransitions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalJourneys: journeyData.length,
      successRate: successfulJourneys / journeyData.length,
      averageSteps: journeyData.reduce((sum, journey) => sum + journey.steps.length, 0) / journeyData.length,
      portalSwitchRate: totalSwitches / journeyData.length,
      topTransitions,
      complexityProgression
    };
  }, [journeyData]);

  const effectivenessAnalytics = useMemo(() => {
    if (!effectivenessData.length) return null;

    const portalRankings = Object.keys(PORTAL_METADATA).map(portalId => {
      const portalData = effectivenessData.filter(d => d.portalId === portalId);
      const avgSuccess = portalData.reduce((sum, d) => sum + d.successRate, 0) / portalData.length;
      const avgSafety = portalData.reduce((sum, d) => sum + d.safetyScore, 0) / portalData.length;
      const avgResonance = portalData.reduce((sum, d) => sum + d.culturalResonance, 0) / portalData.length;

      return {
        portalId: portalId as PortalId,
        overallScore: (avgSuccess * 0.4) + (avgSafety * 0.3) + (avgResonance * 0.3),
        successRate: avgSuccess,
        safetyScore: avgSafety,
        culturalResonance: avgResonance
      };
    }).sort((a, b) => b.overallScore - a.overallScore);

    return { portalRankings };
  }, [effectivenessData]);

  const JourneyFlowVisualization: React.FC = () => (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-white font-semibold mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        User Journey Flow Analysis
      </h3>

      {journeyAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{journeyAnalytics.totalJourneys}</p>
              <p className="text-xs text-gray-400">Total Journeys</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{(journeyAnalytics.successRate * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-400">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{journeyAnalytics.averageSteps.toFixed(1)}</p>
              <p className="text-xs text-gray-400">Avg Steps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{(journeyAnalytics.portalSwitchRate * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-400">Switch Rate</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Most Common Portal Transitions</h4>
            <div className="space-y-2">
              {journeyAnalytics.topTransitions.map(([transition, count], idx) => {
                const [from, to] = transition.split('_');
                const fromMeta = PORTAL_METADATA[from as PortalId];
                const toMeta = PORTAL_METADATA[to as PortalId];

                return (
                  <div key={transition} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm">#{idx + 1}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${fromMeta.iconGradient}`}></div>
                        <span className="text-white text-sm">{fromMeta.displayName}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${toMeta.iconGradient}`}></div>
                        <span className="text-white text-sm">{toMeta.displayName}</span>
                      </div>
                    </div>
                    <span className="text-blue-400 font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const EffectivenessRankings: React.FC = () => (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-white font-semibold mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2" />
        Portal Effectiveness Rankings
      </h3>

      {effectivenessAnalytics && (
        <div className="space-y-3">
          {effectivenessAnalytics.portalRankings.map((ranking, idx) => {
            const metadata = PORTAL_METADATA[ranking.portalId];
            return (
              <div key={ranking.portalId} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-bold ${
                    idx === 0 ? 'text-yellow-400' :
                    idx === 1 ? 'text-gray-300' :
                    idx === 2 ? 'text-orange-400' : 'text-gray-500'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${metadata.iconGradient}`}></div>
                  <div>
                    <p className="text-white font-medium">{metadata.displayName}</p>
                    <p className="text-xs text-gray-400">{metadata.targetAudience}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{(ranking.overallScore * 100).toFixed(1)}</p>
                  <div className="flex space-x-2 text-xs">
                    <span className="text-green-400">S: {(ranking.successRate * 100).toFixed(0)}%</span>
                    <span className="text-blue-400">R: {ranking.culturalResonance.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const InsightCards: React.FC = () => (
    <div className="space-y-4">
      {insights.map((insight) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border-l-4 ${
            insight.type === 'optimization'
              ? 'border-green-500 bg-green-500/10'
              : insight.type === 'warning'
                ? 'border-red-500 bg-red-500/10'
                : insight.type === 'opportunity'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-purple-500 bg-purple-500/10'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {insight.type === 'optimization' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
              {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {insight.type === 'opportunity' && <Lightbulb className="w-5 h-5 text-blue-400" />}
              {insight.type === 'trend' && <TrendingUp className="w-5 h-5 text-purple-400" />}

              <h4 className="text-white font-semibold">{insight.title}</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                insight.impact === 'high'
                  ? 'bg-red-500/20 text-red-400'
                  : insight.impact === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
              }`}>
                {insight.impact.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">{(insight.confidence * 100).toFixed(0)}% confidence</span>
            </div>
          </div>

          <p className="text-gray-300 mb-4">{insight.description}</p>

          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Supporting Evidence:</p>
            <ul className="space-y-1">
              {insight.evidence.map((evidence, idx) => (
                <li key={idx} className="text-xs text-gray-500 flex items-center">
                  <div className="w-1 h-1 bg-gray-500 rounded-full mr-2"></div>
                  {evidence}
                </li>
              ))}
            </ul>
          </div>

          {insight.actionable && (
            <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
              Generate Action Plan
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-[400px]`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          {[
            { id: 'journeys', label: 'Journey Analysis', icon: Activity },
            { id: 'effectiveness', label: 'Portal Effectiveness', icon: Target },
            { id: 'insights', label: 'AI Insights', icon: Brain },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeView === id
                  ? 'bg-blue-500/20 border border-blue-400 text-blue-300'
                  : 'bg-white/5 border border-gray-700 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Content Views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'journeys' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <JourneyFlowVisualization />
              <EffectivenessRankings />
            </div>
          )}

          {activeView === 'effectiveness' && (
            <div className="grid grid-cols-1 gap-6">
              <EffectivenessRankings />
            </div>
          )}

          {activeView === 'insights' && <InsightCards />}

          {activeView === 'recommendations' && (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                AI-Generated Recommendations
              </h3>
              <div className="text-center text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>AI recommendation engine coming soon...</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CrossPortalAnalytics;