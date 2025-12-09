/**
 * 🧭 NAVIGATOR LAB - Sacred Wisdom Training Interface
 *
 * Integration point for Navigator + Spiralogic within LabTools ecosystem
 * Provides seamless access to consciousness guidance training and evaluation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Brain,
  Compass,
  Star,
  Eye,
  Heart,
  Zap,
  Target,
  BookOpen,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

// Navigator + Spiralogic Integration Types
interface SpiralogicSignature {
  spiral_domain: string | null;
  spiral_phase: string | null;
  spiral_facet: string | null;
}

interface NavigatorDecision {
  decisionId: string;
  recommendedProtocolId: string;
  guidanceTone: string;
  depthLevel: string;
  riskFlags: string[];
  requiresFacilitator: boolean;
  confidence: number;
  reasoning: string;
  spiralogicSignature?: SpiralogicSignature;
}

interface LabScenario {
  id: string;
  name: string;
  category: 'archetypal' | 'real_session' | 'custom';
  description: string;
  message: string;
  expectedFacet?: string;
  expectedPhase?: string;
  expectedDomain?: string;
}

export default function NavigatorLabPage() {
  const router = useRouter();
  const [activeScenario, setActiveScenario] = useState<LabScenario | null>(null);
  const [navigatorDecision, setNavigatorDecision] = useState<NavigatorDecision | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [labNotes, setLabNotes] = useState('');
  const [humanRating, setHumanRating] = useState<number | null>(null);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  // Archetypal test scenarios
  const archetypeScenarios: LabScenario[] = [
    {
      id: 'fire2_overwhelm',
      name: 'Fire2 Descent Overwhelm',
      category: 'archetypal',
      description: 'Classic Fire2 burnout - entrepreneur feeling overwhelmed by their calling',
      message: 'I am so overwhelmed by my work. I started this creative project with passion but now I feel burnt out and exhausted. I keep pushing through but my nervous system is fried. I feel shame around not keeping up with all the demands.',
      expectedFacet: 'Fire2',
      expectedPhase: 'descent',
      expectedDomain: 'vocation'
    },
    {
      id: 'water2_numbness',
      name: 'Water2 Numbness',
      category: 'archetypal',
      description: 'Deep water shutdown - person going through motions, disconnected from emotions',
      message: 'I feel numb lately. Going through the motions of life but nothing really matters. I can function at work and in relationships but I feel disconnected from my emotions. Everything feels flat and grey.',
      expectedFacet: 'Water2',
      expectedPhase: 'descent',
      expectedDomain: 'initiation'
    },
    {
      id: 'earth2_overstructure',
      name: 'Earth2 Over-Structure',
      category: 'archetypal',
      description: 'Trapped in systems that once served but now feel dead, perfectionist patterns',
      message: 'I have built such detailed systems and routines in my life, but now they feel like a prison. Everything has to be perfect and done the "right way" but I have lost touch with what I actually want. The structure is choking out my authentic impulse.',
      expectedFacet: 'Earth2',
      expectedPhase: 'call',
      expectedDomain: 'initiation'
    },
    {
      id: 'air3_analysis',
      name: 'Air3 Analysis Spiral',
      category: 'archetypal',
      description: 'Mental loops, overthinking, paralyzed by seeing too many perspectives',
      message: 'I cannot stop analyzing every decision. I see all these different perspectives and possibilities and I get paralyzed. But what if this happens? But what if that happens? My mind just keeps spinning and I cannot take action.',
      expectedFacet: 'Air3',
      expectedPhase: 'call',
      expectedDomain: 'initiation'
    },
    {
      id: 'earth1_disconnection',
      name: 'Earth1 Disconnection',
      category: 'archetypal',
      description: 'Lost connection to body/earth, spacey, ungrounded, floating through life',
      message: 'I feel so disconnected from my body and from the earth. I am floating through life, spacing out all the time. I cannot feel my feet on the ground. I need to get grounded and connected to something real and practical.',
      expectedFacet: 'Earth1',
      expectedPhase: 'call',
      expectedDomain: 'initiation'
    },
    {
      id: 'spiritual_emergency',
      name: 'Fire3/Water2 Spiritual Emergency',
      category: 'archetypal',
      description: 'Intense awakening experience overwhelming their system, boundary dissolution',
      message: 'I had this incredible spiritual opening last week and I cannot integrate it. Everything feels too much, too intense. I am having visions and feeling connected to everything but my body and mind cannot handle it. I feel both ecstatic and terrified.',
      expectedFacet: 'Fire2', // Should map to Fire2 since Fire3 not in simple map
      expectedPhase: 'descent',
      expectedDomain: 'initiation'
    }
  ];

  const handleBack = () => {
    router.push('/labtools');
  };

  const runScenario = async (scenario: LabScenario) => {
    setActiveScenario(scenario);
    setIsProcessing(true);
    setNavigatorDecision(null);
    setHumanRating(null);
    setLabNotes('');

    try {
      console.log('🧭 Running Navigator Lab scenario:', scenario.name);

      const response = await fetch('/api/navigator-lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: scenario.message,
          scenarioType: 'navigator_lab',
          sessionContext: {
            scenarioId: scenario.id,
            expectedFacet: scenario.expectedFacet,
            expectedPhase: scenario.expectedPhase,
            expectedDomain: scenario.expectedDomain
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.navigatorDecision) {
        setNavigatorDecision(data.navigatorDecision);

        // Save session to history
        const sessionRecord = {
          timestamp: new Date().toISOString(),
          scenario,
          decision: data.navigatorDecision,
          awareness: data.awareness
        };
        setSessionHistory(prev => [sessionRecord, ...prev.slice(0, 9)]); // Keep last 10
      }

    } catch (error) {
      console.error('❌ Navigator Lab error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitLabEvaluation = async () => {
    if (!activeScenario || !navigatorDecision || humanRating === null) return;

    const evaluation = {
      scenarioId: activeScenario.id,
      decisionId: navigatorDecision.decisionId,
      humanRating,
      notes: labNotes,
      timestamp: new Date().toISOString()
    };

    console.log('📝 Lab evaluation submitted:', evaluation);

    // Here you could save to your training notes system
    // For now, we'll just log and clear the form
    setLabNotes('');
    setHumanRating(null);
    alert(`Evaluation recorded for ${activeScenario.name}! Rating: ${humanRating}/3`);
  };

  const getFacetColor = (facet: string) => {
    const colorMap: Record<string, string> = {
      'Fire1': 'from-orange-500 to-red-500',
      'Fire2': 'from-red-500 to-pink-500',
      'Water1': 'from-blue-400 to-cyan-400',
      'Water2': 'from-blue-600 to-indigo-600',
      'Earth1': 'from-green-400 to-emerald-500',
      'Earth2': 'from-emerald-600 to-teal-600',
      'Air1': 'from-yellow-400 to-amber-400',
      'Air2': 'from-amber-500 to-orange-500',
      'Air3': 'from-purple-400 to-violet-500',
      'Aether1': 'from-violet-500 to-purple-600',
      'Core': 'from-gray-400 to-gray-600'
    };
    return colorMap[facet] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </motion.button>

              <div>
                <h1 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
                  <Compass className="w-6 h-6 text-blue-600" />
                  <span>Navigator Lab</span>
                </h1>
                <p className="text-sm text-slate-600">Wisdom Training & Spiralogic Integration</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right text-xs">
                <div className="text-slate-500">Sessions Today</div>
                <div className="text-slate-700 font-medium">{sessionHistory.length}</div>
              </div>
              <BookOpen className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column - Scenario Selection */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span>Archetypal Scenarios</span>
              </h2>

              <div className="space-y-3">
                {archetypeScenarios.map((scenario) => (
                  <motion.button
                    key={scenario.id}
                    onClick={() => runScenario(scenario)}
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      activeScenario?.id === scenario.id
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-medium text-slate-800 text-sm">{scenario.name}</div>
                    <div className="text-xs text-slate-600 mt-1">{scenario.description}</div>
                    {scenario.expectedFacet && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getFacetColor(scenario.expectedFacet)}`}></div>
                        <span className="text-xs text-slate-500">
                          {scenario.expectedFacet} • {scenario.expectedPhase} • {scenario.expectedDomain}
                        </span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Session History */}
            {sessionHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span>Recent Sessions</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessionHistory.slice(0, 5).map((session, index) => (
                    <div key={index} className="text-xs p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium text-slate-700">{session.scenario.name}</div>
                      <div className="text-slate-500 mt-1">{session.decision.recommendedProtocolId}</div>
                      <div className="text-slate-400 mt-1">{new Date(session.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Navigator Decision Display */}
          <div className="space-y-6">
            {isProcessing && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-slate-600">Navigator analyzing scenario...</div>
                </div>
              </div>
            )}

            {navigatorDecision && activeScenario && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>Navigator Decision</span>
                </h2>

                <div className="space-y-4">
                  {/* Protocol Recommendation */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900 mb-1">Recommended Protocol</div>
                    <div className="text-blue-800">{navigatorDecision.recommendedProtocolId}</div>
                  </div>

                  {/* Decision Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 mb-1">Guidance Tone</div>
                      <div className="text-slate-800 font-medium">{navigatorDecision.guidanceTone}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Depth Level</div>
                      <div className="text-slate-800 font-medium">{navigatorDecision.depthLevel}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Confidence</div>
                      <div className="text-slate-800 font-medium">{(navigatorDecision.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Facilitator Required</div>
                      <div className="text-slate-800 font-medium">{navigatorDecision.requiresFacilitator ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* Spiralogic Signature */}
                  {navigatorDecision.spiralogicSignature && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-purple-900 mb-2">Spiralogic Signature</div>
                      <div className="flex items-center space-x-4 text-sm">
                        {navigatorDecision.spiralogicSignature.spiral_facet && (
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getFacetColor(navigatorDecision.spiralogicSignature.spiral_facet)}`}></div>
                            <span className="text-purple-800">{navigatorDecision.spiralogicSignature.spiral_facet}</span>
                          </div>
                        )}
                        {navigatorDecision.spiralogicSignature.spiral_phase && (
                          <span className="text-purple-700">{navigatorDecision.spiralogicSignature.spiral_phase}</span>
                        )}
                        {navigatorDecision.spiralogicSignature.spiral_domain && (
                          <span className="text-purple-600">{navigatorDecision.spiralogicSignature.spiral_domain}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Risk Flags */}
                  {navigatorDecision.riskFlags && navigatorDecision.riskFlags.length > 0 && (
                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-amber-900 mb-2">Risk Flags</div>
                      <div className="flex flex-wrap gap-2">
                        {navigatorDecision.riskFlags.map((flag, index) => (
                          <span key={index} className="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigator Reasoning */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-700 mb-2">Navigator Reasoning</div>
                    <div className="text-slate-600 text-sm">{navigatorDecision.reasoning}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Lab Evaluation */}
          <div className="space-y-6">
            {navigatorDecision && activeScenario && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Lab Evaluation</span>
                </h3>

                {/* Expected vs Actual Comparison */}
                <div className="mb-6">
                  <div className="text-sm font-medium text-slate-700 mb-3">Expected vs Navigator</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expected Facet:</span>
                      <span className="text-slate-800">{activeScenario.expectedFacet || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Navigator Detected:</span>
                      <span className="text-slate-800">{navigatorDecision.spiralogicSignature?.spiral_facet || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expected Phase:</span>
                      <span className="text-slate-800">{activeScenario.expectedPhase || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Navigator Phase:</span>
                      <span className="text-slate-800">{navigatorDecision.spiralogicSignature?.spiral_phase || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Human Rating */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-slate-700 mb-3">Your Wisdom Rating</div>
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((rating) => (
                      <motion.button
                        key={rating}
                        onClick={() => setHumanRating(rating)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-all ${
                          humanRating === rating
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {rating}
                      </motion.button>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    1 = Missing something important • 2 = Half right • 3 = What I'd do
                  </div>
                </div>

                {/* Lab Notes */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Lab Notes</label>
                  <textarea
                    value={labNotes}
                    onChange={(e) => setLabNotes(e.target.value)}
                    placeholder="What was wise about this? What would you adjust? If you were guiding this person live..."
                    className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={submitLabEvaluation}
                  disabled={!humanRating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  Record Lab Evaluation
                </motion.button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-md font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.open('http://localhost:3008/navigator-admin', '_blank')}
                  className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg text-sm transition-colors"
                >
                  <div className="font-medium text-slate-700">View Admin Dashboard</div>
                  <div className="text-slate-500 text-xs">See all Navigator decisions & Spiralogic data</div>
                </button>
                <button
                  onClick={() => router.push('/labtools/metrics')}
                  className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg text-sm transition-colors"
                >
                  <div className="font-medium text-slate-700">Personal Metrics</div>
                  <div className="text-slate-500 text-xs">View your consciousness computing data</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}