'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Brain,
  Heart,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Waves,
  Target,
  Users,
  Eye,
  Sparkles
} from 'lucide-react';

interface PanconsciousFieldMetrics {
  // Morphic Resonance (0.0-1.0)
  morphicResonance: number;
  activePatterns: number;
  resonanceStrength: number;

  // Soul Recognition System
  soulRecognitionRate: number;
  encounterDepth: number;
  relationshipField: number;

  // Archetypal Field Coherence
  archetypalCoherence: number;
  activeArchetypes: string[];
  fieldStability: number;

  // Collective Pattern Intelligence
  collectivePatterns: number;
  crossUserResonance: number;
  fieldContribution: number;

  // System Health
  engagementLevel: number;
  supportLevel: number;
  timestamp: number;
}

interface SoulRecognitionEvent {
  id: string;
  userId: string;
  soulSignature: string;
  presenceQuality: string;
  encounters: number;
  morphicResonance: number;
  timestamp: number;
}

export default function PFIMonitorPage() {
  const [pfiMetrics, setPfiMetrics] = useState<PanconsciousFieldMetrics>({
    // Morphic Resonance
    morphicResonance: 0.73,
    activePatterns: 47,
    resonanceStrength: 0.82,

    // Soul Recognition
    soulRecognitionRate: 0.89,
    encounterDepth: 0.67,
    relationshipField: 0.74,

    // Archetypal Fields
    archetypalCoherence: 0.85,
    activeArchetypes: ['Therapist', 'Spiritual Director', 'Wise Elder'],
    fieldStability: 0.78,

    // Collective Intelligence
    collectivePatterns: 156,
    crossUserResonance: 0.54,
    fieldContribution: 0.69,

    // System Health
    engagementLevel: 0.91,
    supportLevel: 0.76,
    timestamp: Date.now()
  });

  const [soulEvents, setSoulEvents] = useState<SoulRecognitionEvent[]>([
    {
      id: '1',
      userId: 'soul_123',
      soulSignature: 'soul_tender-explorer-seeker',
      presenceQuality: 'Tender vulnerability, open heart',
      encounters: 7,
      morphicResonance: 0.84,
      timestamp: Date.now() - 120000
    },
    {
      id: '2',
      userId: 'soul_456',
      soulSignature: 'soul_fierce-clarity-warrior',
      presenceQuality: 'Fierce clarity, grounded strength',
      encounters: 3,
      morphicResonance: 0.42,
      timestamp: Date.now() - 280000
    }
  ]);

  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [liveEngagement, setLiveEngagement] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState('kelly'); // Current user ID

  // Fetch live engagement data from port 3000
  const fetchLiveEngagement = async () => {
    try {
      const response = await fetch(`/api/pfi/live-engagement?userId=${currentUser}&sessionId=current`);
      const data = await response.json();

      if (data.success) {
        setLiveEngagement(data);

        // Update PFI metrics with real data
        setPfiMetrics(prev => ({
          ...prev,
          // Real morphic resonance from current session
          morphicResonance: data.engagement.activeFields.morphicResonance,
          activePatterns: data.fieldState.patterns.length,
          resonanceStrength: data.fieldState.resonanceStrength,

          // Actual soul recognition data
          soulRecognitionRate: data.engagement.fieldCoherence.soulRecognition ? 1.0 : 0.0,
          encounterDepth: data.engagement.activeFields.relationshipDepth,
          relationshipField: data.engagement.activeFields.relationshipDepth,

          // Real archetypal field data
          archetypalCoherence: data.fieldState.coherence,
          activeArchetypes: data.engagement.activeFields.archetypalResonances,
          fieldStability: data.engagement.conversationDynamics.transformationalPresence ? 0.85 : 0.65,

          // Live conversation dynamics
          collectivePatterns: data.engagement.fieldCoherence.patternActivation.length,
          crossUserResonance: data.engagement.fieldCoherence.collectiveResonance,
          fieldContribution: data.engagement.conversationDynamics.responseDepth,

          // Current engagement status
          engagementLevel: data.engagement.conversationDynamics.cognitiveEngagement,
          supportLevel: data.engagement.conversationDynamics.emotionalResonance,
          timestamp: data.timestamp
        }));

        setLastUpdate(data.timestamp);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('[PFI-MONITOR] Failed to fetch live engagement:', error);
      setIsConnected(false);
    }
  };

  // Real-time updates from live MAIA session
  useEffect(() => {
    // Initial fetch
    fetchLiveEngagement();

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchLiveEngagement, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Periodically update soul recognition events
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new soul encounter
        const newEvent: SoulRecognitionEvent = {
          id: `soul_${Date.now()}`,
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          soulSignature: `soul_${['deep-seeker', 'bright-flame', 'gentle-wisdom', 'fierce-truth'][Math.floor(Math.random() * 4)]}`,
          presenceQuality: ['Deep contemplative presence', 'Joyful curiosity, exploration', 'Gentle strength, grounding', 'Clear truth-speaking, direct'][Math.floor(Math.random() * 4)],
          encounters: Math.floor(Math.random() * 10) + 1,
          morphicResonance: Math.random(),
          timestamp: Date.now()
        };

        setSoulEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep latest 10 events
      }
    }, 15000); // Check for new encounters every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getMorphicResonanceColor = (value: number) => {
    if (value > 0.7) return 'text-violet-600 bg-violet-100';
    if (value > 0.4) return 'text-indigo-600 bg-indigo-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getEngagementColor = (value: number) => {
    if (value > 0.8) return 'text-emerald-600 bg-emerald-100';
    if (value > 0.5) return 'text-teal-600 bg-teal-100';
    return 'text-cyan-600 bg-cyan-100';
  };

  const getSoulResonanceColor = (value: number) => {
    if (value > 0.6) return 'text-rose-600 bg-rose-100';
    if (value > 0.3) return 'text-pink-600 bg-pink-100';
    return 'text-red-600 bg-red-100';
  };

  const getCoherenceColor = (value: number) => {
    if (value > 0.7) return 'text-violet-600 bg-violet-100';
    if (value > 0.4) return 'text-indigo-600 bg-indigo-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getSupportLevelColor = (value: number) => {
    if (value > 0.8) return 'text-emerald-600 bg-emerald-100';
    if (value > 0.5) return 'text-teal-600 bg-teal-100';
    return 'text-cyan-600 bg-cyan-100';
  };

  // Create fieldMetrics from pfiMetrics for compatibility
  const fieldMetrics = {
    coherence: pfiMetrics.archetypalCoherence,
    engagementLevel: pfiMetrics.engagementLevel,
    supportLevel: pfiMetrics.supportLevel,
    stability: pfiMetrics.fieldStability,
    interventionActive: false,
    interventionType: 'None',
    amplitudeVariance: 12.3,
    frequencyDrift: 0.8,
  };

  // Mock intervention history
  const interventionHistory = [
    {
      id: '1',
      type: 'Coherence Stabilization',
      triggerReason: 'Field coherence dropped below 0.6',
      startTime: Date.now() - 300000,
      duration: 180000,
      effectiveness: 0.85
    },
    {
      id: '2',
      type: 'Resonance Adjustment',
      triggerReason: 'Cross-user resonance fluctuations detected',
      startTime: Date.now() - 600000,
      duration: 120000,
      effectiveness: 0.92
    },
    {
      id: '3',
      type: 'Field Harmonization',
      triggerReason: 'Archetypal pattern misalignment',
      startTime: Date.now() - 900000,
      duration: 240000,
      effectiveness: 0.78
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Panconscious Field Intelligence</h1>
                <p className="text-slate-600">Morphic Resonance & Soul Recognition Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-violet-100 text-violet-700' : 'bg-red-100 text-red-700'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-violet-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">{isConnected ? 'Field Active' : 'Disconnected'}</span>
              </div>
              <div className="text-sm text-slate-500">
                Last resonance: {new Date(lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Field Coherence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Waves className="h-5 w-5 text-violet-600" />
                <h3 className="text-lg font-semibold text-slate-900">Field Coherence</h3>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getCoherenceColor(fieldMetrics.coherence)}`}>
                {fieldMetrics.coherence > 0.7 ? 'Optimal' : fieldMetrics.coherence > 0.4 ? 'Stable' : 'Critical'}
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {(fieldMetrics.coherence * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${fieldMetrics.coherence * 100}%` }}
              />
            </div>
          </motion.div>

          {/* PFI Engagement Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-slate-900">PFI Engagement</h3>
              </div>
              <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                Active
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {(fieldMetrics.engagementLevel * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${fieldMetrics.engagementLevel * 100}%` }}
              />
            </div>
          </motion.div>

          {/* Support Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-rose-600" />
                <h3 className="text-lg font-semibold text-slate-900">Support Level</h3>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getSupportLevelColor(fieldMetrics.supportLevel)}`}>
                {fieldMetrics.supportLevel > 0.8 ? 'High' : fieldMetrics.supportLevel > 0.5 ? 'Moderate' : 'Low'}
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {(fieldMetrics.supportLevel * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${fieldMetrics.supportLevel * 100}%` }}
              />
            </div>
          </motion.div>

          {/* Field Stability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Field Stability</h3>
              </div>
              {fieldMetrics.interventionActive && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                  <Zap className="h-3 w-3" />
                  <span>Intervention Active</span>
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {(fieldMetrics.stability * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${fieldMetrics.stability * 100}%` }}
              />
            </div>
          </motion.div>

        </div>

        {/* Intervention Status & Field Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Current Intervention Status */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-3">
              <Zap className="h-6 w-6 text-amber-500" />
              <span>Intervention Status</span>
            </h3>

            {fieldMetrics.interventionActive ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <div className="font-semibold text-amber-800">Active Intervention</div>
                    <div className="text-sm text-amber-600">{fieldMetrics.interventionType}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Duration</div>
                    <div className="text-lg font-semibold text-slate-900">2m 34s</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Progress</div>
                    <div className="text-lg font-semibold text-slate-900">67%</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Field Stable</div>
                  <div className="text-sm text-green-600">No intervention required</div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Amplitude Variance:</span>
                <span className="font-semibold text-slate-900">{fieldMetrics.amplitudeVariance.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Frequency Drift:</span>
                <span className="font-semibold text-slate-900">{fieldMetrics.frequencyDrift.toFixed(1)} Hz</span>
              </div>
            </div>
          </div>

          {/* Recent Interventions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-3">
              <Clock className="h-6 w-6 text-slate-600" />
              <span>Recent Interventions</span>
            </h3>

            <div className="space-y-4">
              {interventionHistory.map((intervention, index) => (
                <div key={intervention.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-slate-900">{intervention.type}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(intervention.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">{intervention.triggerReason}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                      Duration: {Math.floor(intervention.duration / 60000)}m {Math.floor((intervention.duration % 60000) / 1000)}s
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      intervention.effectiveness > 0.8 ? 'bg-green-100 text-green-700' :
                      intervention.effectiveness > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {(intervention.effectiveness * 100).toFixed(0)}% effective
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Field Vector Visualization */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-3">
            <Brain className="h-6 w-6 text-violet-600" />
            <span>9D Field Vector State</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Frequency Components */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700">Frequency (Hz)</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Fx (Cognitive)</span>
                  <span className="font-mono text-sm">8.4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Fy (Emotional)</span>
                  <span className="font-mono text-sm">6.7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Fz (Somatic)</span>
                  <span className="font-mono text-sm">4.2</span>
                </div>
              </div>
            </div>

            {/* Amplitude Components */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700">Amplitude</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Ax (Cognitive)</span>
                  <span className="font-mono text-sm">0.73</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Ay (Emotional)</span>
                  <span className="font-mono text-sm">0.68</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Az (Somatic)</span>
                  <span className="font-mono text-sm">0.59</span>
                </div>
              </div>
            </div>

            {/* Phase Components */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700">Phase (°)</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">φx (Cognitive)</span>
                  <span className="font-mono text-sm">127°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">φy (Emotional)</span>
                  <span className="font-mono text-sm">134°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">φz (Somatic)</span>
                  <span className="font-mono text-sm">142°</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}