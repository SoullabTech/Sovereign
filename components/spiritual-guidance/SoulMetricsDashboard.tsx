// @ts-nocheck - Prototype file, not type-checked
/**
 * MAIA Soul Metrics Dashboard
 * Trinity of Spiritual Intelligence - Visual Analytics Component
 * Sacred Interface for Spiritual Growth Tracking via Spiralogic Framework
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Calendar, TrendingUp, Heart, Brain, Compass, Flame, Droplets, Mountain, Wind, Sparkles } from 'lucide-react';

// Import our sacred schemas
import type {
  ElementalFramework,
  SpiralPhase,
  SpiritualMaturity,
  SpiritualProfile,
  VirtueMetric,
  SpiritualMemory
} from '../../lib/spiritual-guidance/ain-faith-memory-schema';

interface ElementalBalance {
  element: ElementalFramework;
  score: number;
  growth: number;
  practices: number;
  insights: number;
}

interface SpiralProgress {
  phase: SpiralPhase;
  completion: number;
  timeInPhase: number;
  keyAchievements: string[];
  nextMilestones: string[];
}

interface BiometricIntegration {
  heartRateVariability: number;
  meditationDepth: number;
  breathCoherence: number;
  sleepQuality: number;
  stressResilience: number;
}

interface SoulMetricsData {
  profile: SpiritualProfile;
  elementalBalance: ElementalBalance[];
  spiralProgress: SpiralProgress[];
  virtueMetrics: VirtueMetric[];
  recentMemories: SpiritualMemory[];
  biometrics?: BiometricIntegration;
  insights: {
    primary: string;
    secondary: string[];
    recommendations: string[];
  };
}

interface SoulMetricsDashboardProps {
  userId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

const ElementIcons = {
  fire: Flame,
  water: Droplets,
  earth: Mountain,
  air: Wind,
  aether: Sparkles
};

const ElementColors = {
  fire: '#FF6B35',
  water: '#4A90E2',
  earth: '#8B4513',
  air: '#87CEEB',
  aether: '#9370DB'
};

const SpiralColors = {
  initiation: '#FF6B6B',
  grounding: '#4ECDC4',
  collaboration: '#45B7D1',
  transformation: '#FFA07A',
  completion: '#98D8C8'
};

export const SoulMetricsDashboard: React.FC<SoulMetricsDashboardProps> = ({
  userId,
  timeRange,
  onTimeRangeChange
}) => {
  const [metricsData, setMetricsData] = useState<SoulMetricsData | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'elements' | 'spiral' | 'virtues' | 'insights'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading spiritual metrics data
    // In production, this would fetch from the AIN Faith Memory system
    const loadMetrics = async () => {
      setLoading(true);

      // Mock data representing a Christian practitioner's spiritual journey
      const mockData: SoulMetricsData = {
        profile: {
          userId,
          primaryTradition: 'christian',
          secondaryTraditions: ['contemplative'],
          spiritualMaturity: 'practitioner',
          currentSpiralPhase: 'collaboration',
          elementalAffinities: {
            fire: 0.8,
            water: 0.9,
            earth: 0.6,
            air: 0.7,
            aether: 0.5
          },
          currentChallenges: ['discernment', 'spiritual_dryness'],
          spiritualGoals: ['deeper_prayer', 'service_expansion'],
          practicePreferences: ['contemplative_prayer', 'scripture_study', 'service'],
          timeAvailability: 'moderate',
          communityPreference: 'small_group',
          languagePreferences: ['english'],
          culturalContext: 'western_christian',
          privacyLevel: 'selective',
          counselingHistory: false,
          crisisSupport: false,
          interfaithOpenness: 0.3,
          denomination: 'catholic'
        },
        elementalBalance: [
          { element: 'fire', score: 0.8, growth: 0.15, practices: 12, insights: 8 },
          { element: 'water', score: 0.9, growth: 0.22, practices: 18, insights: 12 },
          { element: 'earth', score: 0.6, growth: -0.05, practices: 6, insights: 3 },
          { element: 'air', score: 0.7, growth: 0.10, practices: 10, insights: 7 },
          { element: 'aether', score: 0.5, growth: 0.05, practices: 4, insights: 2 }
        ],
        spiralProgress: [
          {
            phase: 'initiation',
            completion: 1.0,
            timeInPhase: 180,
            keyAchievements: ['First regular prayer practice', 'Community connection'],
            nextMilestones: []
          },
          {
            phase: 'grounding',
            completion: 1.0,
            timeInPhase: 365,
            keyAchievements: ['Daily prayer discipline', 'Scripture study habit', 'Service commitment'],
            nextMilestones: []
          },
          {
            phase: 'collaboration',
            completion: 0.7,
            timeInPhase: 120,
            keyAchievements: ['Prayer group leadership', 'Spiritual mentoring'],
            nextMilestones: ['Retreat facilitation', 'Cross-cultural ministry']
          }
        ],
        virtueMetrics: [
          {
            virtueId: 'compassion',
            currentLevel: 0.8,
            trend: 'growing',
            lastAssessed: new Date().toISOString(),
            practices: [
              { practice: 'Loving-kindness meditation', frequency: 'daily', impact: 0.9 },
              { practice: 'Service to homeless', frequency: 'weekly', impact: 0.8 }
            ],
            challenges: ['Self-compassion deficit'],
            growth: [
              { date: '2024-10-01', value: 0.65 },
              { date: '2024-11-01', value: 0.72 },
              { date: '2024-12-01', value: 0.8 }
            ]
          },
          {
            virtueId: 'humility',
            currentLevel: 0.6,
            trend: 'stable',
            lastAssessed: new Date().toISOString(),
            practices: [
              { practice: 'Examination of conscience', frequency: 'daily', impact: 0.7 },
              { practice: 'Listening practice in community', frequency: 'weekly', impact: 0.6 }
            ],
            challenges: ['Intellectual pride'],
            growth: [
              { date: '2024-10-01', value: 0.58 },
              { date: '2024-11-01', value: 0.59 },
              { date: '2024-12-01', value: 0.6 }
            ]
          }
        ],
        recentMemories: [
          {
            memoryId: 'mem_001',
            userId,
            timestamp: new Date().toISOString(),
            type: 'breakthrough',
            content: 'Deep experience of divine love during Adoration',
            elementalResonance: 'water',
            traditionContext: 'catholic',
            emotions: ['awe', 'gratitude', 'peace'],
            insights: ['God\'s unconditional love', 'Importance of silent prayer'],
            practices: ['eucharistic_adoration'],
            virtueImpact: [
              { virtue: 'compassion', impact: 0.2 },
              { virtue: 'faith', impact: 0.3 }
            ],
            privacyLevel: 'private',
            tags: ['mystical', 'prayer', 'sacrament']
          }
        ],
        biometrics: {
          heartRateVariability: 0.75,
          meditationDepth: 0.82,
          breathCoherence: 0.68,
          sleepQuality: 0.71,
          stressResilience: 0.79
        },
        insights: {
          primary: 'Your water element (compassion/flow) is flourishing, while earth element (embodiment/service) could use attention.',
          secondary: [
            'Prayer life showing consistent depth and growth',
            'Service opportunities may deepen spiritual embodiment',
            'Collaboration phase progressing well with community engagement'
          ],
          recommendations: [
            'Consider adding embodied practices like walking meditation or labyrinth prayer',
            'Explore opportunities for hands-on service in your community',
            'Continue developing your gift for spiritual accompaniment'
          ]
        }
      };

      setTimeout(() => {
        setMetricsData(mockData);
        setLoading(false);
      }, 1500);
    };

    loadMetrics();
  }, [userId, timeRange]);

  if (loading || !metricsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sacred metrics...</p>
        </div>
      </div>
    );
  }

  const renderElementalBalance = () => {
    const radarData = metricsData.elementalBalance.map(element => ({
      element: element.element.charAt(0).toUpperCase() + element.element.slice(1),
      score: element.score * 100,
      fullMark: 100
    }));

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-medium mb-4 flex items-center">
            <Compass className="w-5 h-5 mr-2 text-purple-600" />
            Five Elements Balance
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="element" className="text-sm" />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar
                    name="Spiritual Balance"
                    dataKey="score"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {metricsData.elementalBalance.map((element) => {
                const Icon = ElementIcons[element.element];
                return (
                  <div key={element.element} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <Icon
                        className="w-5 h-5 mr-3"
                        style={{ color: ElementColors[element.element] }}
                      />
                      <div>
                        <p className="font-medium capitalize">{element.element}</p>
                        <p className="text-sm text-gray-600">{element.practices} practices</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{Math.round(element.score * 100)}%</p>
                      <p className={`text-sm ${element.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {element.growth >= 0 ? '+' : ''}{Math.round(element.growth * 100)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSpiralProgress = () => {
    const totalDaysInSpiral = metricsData.spiralProgress.reduce((acc, phase) => acc + phase.timeInPhase, 0);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-medium mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Spiral Journey Progress
          </h3>
          <div className="space-y-4">
            {metricsData.spiralProgress.map((phase, index) => (
              <div key={phase.phase} className="relative">
                <div className="flex items-center mb-2">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: SpiralColors[phase.phase] }}
                  ></div>
                  <h4 className="font-medium capitalize">{phase.phase.replace('_', ' ')}</h4>
                  <span className="ml-auto text-sm text-gray-600">
                    {Math.round(phase.completion * 100)}% complete
                  </span>
                </div>
                <div className="ml-7">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${phase.completion * 100}%`,
                        backgroundColor: SpiralColors[phase.phase]
                      }}
                    ></div>
                  </div>
                  {phase.keyAchievements.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Key Achievements:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {phase.keyAchievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {phase.nextMilestones.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Next Milestones:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {phase.nextMilestones.map((milestone, i) => (
                          <li key={i}>{milestone}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {phase.timeInPhase} days in this phase
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVirtueMetrics = () => {
    return (
      <div className="space-y-6">
        {metricsData.virtueMetrics.map((virtue) => (
          <div key={virtue.virtueId} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium capitalize flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                {virtue.virtueId.replace('_', ' ')}
              </h3>
              <div className="text-right">
                <p className="text-2xl font-bold">{Math.round(virtue.currentLevel * 100)}%</p>
                <p className={`text-sm ${
                  virtue.trend === 'growing' ? 'text-green-600' :
                  virtue.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {virtue.trend}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Growth Trajectory</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={virtue.growth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Level']}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Supporting Practices</h4>
                <div className="space-y-2">
                  {virtue.practices.map((practice, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{practice.practice}</p>
                        <p className="text-xs text-gray-600">{practice.frequency}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${practice.impact * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {Math.round(practice.impact * 100)}% impact
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {virtue.challenges.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Current Challenges</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {virtue.challenges.map((challenge, index) => (
                        <li key={index}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInsights = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-medium mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Sacred Intelligence Insights
          </h3>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Primary Insight</h4>
              <p className="text-blue-800">{metricsData.insights.primary}</p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Secondary Observations</h4>
              <ul className="space-y-2">
                {metricsData.insights.secondary.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3">Guided Recommendations</h4>
              <div className="space-y-3">
                {metricsData.insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded border border-purple-200">
                    <p className="text-purple-900">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {metricsData.biometrics && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-medium mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Embodied Wellness Integration
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(metricsData.biometrics.heartRateVariability * 100)}%
                </p>
                <p className="text-sm text-gray-600">HRV</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(metricsData.biometrics.meditationDepth * 100)}%
                </p>
                <p className="text-sm text-gray-600">Meditation Depth</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(metricsData.biometrics.breathCoherence * 100)}%
                </p>
                <p className="text-sm text-gray-600">Breath Coherence</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-indigo-600">
                  {Math.round(metricsData.biometrics.sleepQuality * 100)}%
                </p>
                <p className="text-sm text-gray-600">Sleep Quality</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(metricsData.biometrics.stressResilience * 100)}%
                </p>
                <p className="text-sm text-gray-600">Stress Resilience</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    const currentPhase = metricsData.spiralProgress.find(p => p.completion < 1.0) ||
                       metricsData.spiralProgress[metricsData.spiralProgress.length - 1];

    return (
      <div className="space-y-6">
        {/* Journey Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Phase</p>
                <p className="text-2xl font-bold capitalize">
                  {currentPhase?.phase.replace('_', ' ')}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: SpiralColors[currentPhase?.phase || 'initiation'] }}
              >
                {Math.round((currentPhase?.completion || 0) * 100)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Spiritual Maturity</p>
                <p className="text-2xl font-bold capitalize">
                  {metricsData.profile.spiritualMaturity}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Primary Tradition</p>
                <p className="text-2xl font-bold capitalize">
                  {metricsData.profile.primaryTradition}
                </p>
              </div>
              <Compass className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Mini Elemental Balance */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Elemental Balance Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={metricsData.elementalBalance.map(e => ({
                element: e.element.charAt(0).toUpperCase() + e.element.slice(1),
                score: e.score * 100
              }))}>
                <PolarGrid />
                <PolarAngleAxis dataKey="element" className="text-sm" />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar
                  dataKey="score"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Insights */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Recent Sacred Insights</h3>
          <div className="space-y-4">
            {metricsData.recentMemories.slice(0, 3).map((memory) => (
              <div key={memory.memoryId} className="p-4 bg-gray-50 rounded border-l-4 border-purple-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-600 capitalize">
                    {memory.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(memory.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{memory.content}</p>
                <div className="flex flex-wrap gap-2">
                  {memory.emotions.map((emotion, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Soul Metrics Dashboard</h1>
            <p className="text-purple-100 mt-2">Sacred Intelligence • Spiritual Growth Analytics</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium">{metricsData.profile.primaryTradition.charAt(0).toUpperCase() + metricsData.profile.primaryTradition.slice(1)} Journey</p>
            <p className="text-purple-200 text-sm">
              {metricsData.profile.denomination && `${metricsData.profile.denomination} • `}
              Practitioner Level
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: Compass },
            { id: 'elements', label: 'Elements', icon: Flame },
            { id: 'spiral', label: 'Spiral Journey', icon: TrendingUp },
            { id: 'virtues', label: 'Virtues', icon: Heart },
            { id: 'insights', label: 'Insights', icon: Brain }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1 text-sm rounded ${
                  timeRange === range
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === '7d' && 'Last 7 days'}
                {range === '30d' && 'Last 30 days'}
                {range === '90d' && 'Last 90 days'}
                {range === '1y' && 'Last year'}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Updated {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'elements' && renderElementalBalance()}
        {activeView === 'spiral' && renderSpiralProgress()}
        {activeView === 'virtues' && renderVirtueMetrics()}
        {activeView === 'insights' && renderInsights()}
      </div>
    </div>
  );
};