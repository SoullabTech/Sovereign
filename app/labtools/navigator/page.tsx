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
  const [serviceError, setServiceError] = useState<string | null>(null);

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
    setServiceError(null);

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
      const msg = error instanceof Error ? error.message : 'Unknown error';
      if (msg.includes('503')) {
        setServiceError('Navigator consciousness server is offline. Start the beta server (port 3008) or check BETA_SERVER_URL.');
      } else {
        setServiceError(`Navigator Lab unavailable: ${msg}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const submitLabEvaluation = async () => {
    if (!activeScenario || !navigatorDecision || humanRating === null) return;

    setIsSubmittingFeedback(true);
    setFeedbackStatus('idle');

    try {
      const response = await fetch('/api/navigator-lab/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decisionId: navigatorDecision.decisionId,
          rating: humanRating,
          notes: labNotes,
          scenarioId: activeScenario.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📝 Lab evaluation saved:', data);

      setFeedbackStatus('success');

      // Update session history with feedback
      setSessionHistory(prev => prev.map((session, index) =>
        index === 0 && session.decision.decisionId === navigatorDecision.decisionId
          ? { ...session, feedback: { rating: humanRating, notes: labNotes } }
          : session
      ));

      // Clear form after brief delay to show success
      setTimeout(() => {
        setLabNotes('');
        setHumanRating(null);
        setFeedbackStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('❌ Failed to save evaluation:', error);
      setFeedbackStatus('error');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Spiralogic facet colors - using amber-aligned palette
  const getFacetColor = (facet: string) => {
    const colorMap: Record<string, string> = {
      'Fire1': 'from-orange-400 to-red-500',
      'Fire2': 'from-red-400 to-rose-500',
      'Water1': 'from-blue-400 to-cyan-400',
      'Water2': 'from-blue-500 to-indigo-500',
      'Earth1': 'from-emerald-400 to-green-500',
      'Earth2': 'from-teal-400 to-emerald-500',
      'Air1': 'from-amber-300 to-yellow-400',
      'Air2': 'from-amber-400 to-orange-400',
      'Air3': 'from-violet-400 to-purple-500',
      'Aether1': 'from-purple-400 to-violet-500',
      'Core': 'from-[#D4B896] to-[#B8935A]'
    };
    return colorMap[facet] || 'from-[#D4B896]/50 to-[#B8935A]/50';
  };

  // Spiralogic facet badge color (solid for dark backgrounds)
  const getFacetBadgeColor = (facet: string) => {
    const colorMap: Record<string, string> = {
      'Fire1': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Fire2': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Water1': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Water2': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Earth1': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'Earth2': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      'Air1': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Air2': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'Air3': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      'Aether1': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Core': 'bg-[#D4B896]/20 text-[#D4B896] border-[#D4B896]/30'
    };
    return colorMap[facet] || 'bg-white/10 text-white/70 border-white/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">

      {/* Header */}
      <div className="bg-[#0f1419]/80 backdrop-blur-sm border-b border-[#D4B896]/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                         border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </motion.button>

              <div>
                <h1 className="text-xl font-semibold text-[#D4B896] flex items-center space-x-2">
                  <Compass className="w-6 h-6" />
                  <span>Navigator Lab</span>
                </h1>
                <p className="text-sm text-white/50">Wisdom Training & Spiralogic Integration</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right text-xs">
                <div className="text-white/50">Sessions Today</div>
                <div className="text-[#D4B896] font-medium">{sessionHistory.length}</div>
              </div>
              <BookOpen className="w-5 h-5 text-[#D4B896]/60" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column - Scenario Selection */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl border border-[#D4B896]/10 p-6">
              <h2 className="text-lg font-semibold text-[#D4B896] mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5" />
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
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      activeScenario?.id === scenario.id
                        ? 'bg-[#D4B896]/20 border-[#D4B896]/40'
                        : 'bg-white/5 hover:bg-[#D4B896]/10 border-transparent hover:border-[#D4B896]/20'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-medium text-white/90 text-sm">{scenario.name}</div>
                    <div className="text-xs text-white/50 mt-1">{scenario.description}</div>
                    {scenario.expectedFacet && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getFacetColor(scenario.expectedFacet)}`}></div>
                        <span className="text-xs text-white/40">
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
              <div className="bg-white/5 rounded-xl border border-[#D4B896]/10 p-6">
                <h3 className="text-md font-semibold text-white/80 mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-[#D4B896]/60" />
                  <span>Recent Sessions</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessionHistory.slice(0, 5).map((session, index) => (
                    <div key={index} className="text-xs p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-white/70">{session.scenario.name}</div>
                        {session.feedback && (
                          <span className="text-[#D4B896] text-xs">★ {session.feedback.rating}</span>
                        )}
                      </div>
                      <div className="text-white/40 mt-1">{session.decision.recommendedProtocolId}</div>
                      <div className="text-white/30 mt-1">{new Date(session.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Navigator Decision Display */}
          <div className="space-y-6">
            {isProcessing && (
              <div className="bg-white/5 rounded-xl border border-[#D4B896]/10 p-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-[#D4B896]/30 border-t-[#D4B896] rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-white/60">Navigator analyzing scenario...</div>
                </div>
              </div>
            )}

            {!isProcessing && serviceError && (
              <div className="bg-red-900/20 rounded-xl border border-red-500/30 p-8">
                <div className="text-center">
                  <Compass className="w-12 h-12 text-red-400/50 mx-auto mb-4" />
                  <div className="text-red-300 text-sm font-medium mb-2">Service Unavailable</div>
                  <div className="text-red-200/60 text-xs">{serviceError}</div>
                </div>
              </div>
            )}

            {!isProcessing && !navigatorDecision && !serviceError && (
              <div className="bg-white/5 rounded-xl border border-[#D4B896]/10 p-8">
                <div className="text-center">
                  <Compass className="w-12 h-12 text-[#D4B896]/30 mx-auto mb-4" />
                  <div className="text-white/50 text-sm">Select a scenario to begin</div>
                  <div className="text-white/30 text-xs mt-2">Navigator will analyze and recommend guidance</div>
                </div>
              </div>
            )}

            {navigatorDecision && activeScenario && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-xl border border-[#D4B896]/20 p-6"
              >
                <h2 className="text-lg font-semibold text-[#D4B896] mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Navigator Decision</span>
                </h2>

                <div className="space-y-4">
                  {/* Protocol Recommendation */}
                  <div className="bg-[#D4B896]/10 rounded-lg p-4 border border-[#D4B896]/20">
                    <div className="text-sm font-medium text-[#D4B896]/80 mb-1">Recommended Protocol</div>
                    <div className="text-white/90 font-medium">{navigatorDecision.recommendedProtocolId}</div>
                  </div>

                  {/* Decision Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/40 mb-1 text-xs">Guidance Tone</div>
                      <div className="text-white/80 font-medium">{navigatorDecision.guidanceTone}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/40 mb-1 text-xs">Depth Level</div>
                      <div className="text-white/80 font-medium">{navigatorDecision.depthLevel}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/40 mb-1 text-xs">Confidence</div>
                      <div className="text-white/80 font-medium">{(navigatorDecision.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/40 mb-1 text-xs">Facilitator Required</div>
                      <div className={`font-medium ${navigatorDecision.requiresFacilitator ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {navigatorDecision.requiresFacilitator ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  {/* Spiralogic Signature */}
                  {navigatorDecision.spiralogicSignature && (
                    <div className="bg-violet-500/10 rounded-lg p-4 border border-violet-500/20">
                      <div className="text-sm font-medium text-violet-300/80 mb-2">Spiralogic Signature</div>
                      <div className="flex items-center flex-wrap gap-2 text-sm">
                        {navigatorDecision.spiralogicSignature.spiral_facet && (
                          <span className={`px-2 py-1 rounded-full border text-xs ${getFacetBadgeColor(navigatorDecision.spiralogicSignature.spiral_facet)}`}>
                            {navigatorDecision.spiralogicSignature.spiral_facet}
                          </span>
                        )}
                        {navigatorDecision.spiralogicSignature.spiral_phase && (
                          <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs border border-white/10">
                            {navigatorDecision.spiralogicSignature.spiral_phase}
                          </span>
                        )}
                        {navigatorDecision.spiralogicSignature.spiral_domain && (
                          <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs border border-white/10">
                            {navigatorDecision.spiralogicSignature.spiral_domain}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Risk Flags */}
                  {navigatorDecision.riskFlags && navigatorDecision.riskFlags.length > 0 && (
                    <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                      <div className="text-sm font-medium text-amber-300/80 mb-2">Risk Flags</div>
                      <div className="flex flex-wrap gap-2">
                        {navigatorDecision.riskFlags.map((flag, index) => (
                          <span key={index} className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigator Reasoning */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-medium text-white/60 mb-2">Navigator Reasoning</div>
                    <div className="text-white/70 text-sm leading-relaxed">{navigatorDecision.reasoning}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Lab Evaluation */}
          <div className="space-y-6">
            {navigatorDecision && activeScenario && (
              <div className="bg-white/5 rounded-xl border border-[#D4B896]/10 p-6">
                <h3 className="text-lg font-semibold text-[#D4B896] mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Lab Evaluation</span>
                </h3>

                {/* Expected vs Actual Comparison */}
                <div className="mb-6 bg-white/5 rounded-lg p-4">
                  <div className="text-sm font-medium text-white/60 mb-3">Expected vs Navigator</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40">Expected Facet:</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getFacetBadgeColor(activeScenario.expectedFacet || '')}`}>
                        {activeScenario.expectedFacet || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40">Navigator Detected:</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getFacetBadgeColor(navigatorDecision.spiralogicSignature?.spiral_facet || '')}`}>
                        {navigatorDecision.spiralogicSignature?.spiral_facet || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Expected Phase:</span>
                      <span className="text-white/70">{activeScenario.expectedPhase || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Navigator Phase:</span>
                      <span className="text-white/70">{navigatorDecision.spiralogicSignature?.spiral_phase || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Human Rating */}
                <div className="mb-5">
                  <div className="text-sm font-medium text-white/70 mb-3">Your Wisdom Rating</div>
                  <div className="flex space-x-3">
                    {[1, 2, 3].map((rating) => (
                      <motion.button
                        key={rating}
                        onClick={() => setHumanRating(rating)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-12 h-12 rounded-xl border-2 text-sm font-medium transition-all ${
                          humanRating === rating
                            ? 'bg-[#D4B896] text-[#0f1419] border-[#D4B896]'
                            : 'bg-white/5 text-white/60 border-white/20 hover:border-[#D4B896]/50 hover:text-[#D4B896]'
                        }`}
                      >
                        {rating}
                      </motion.button>
                    ))}
                  </div>
                  <div className="text-xs text-white/40 mt-3 leading-relaxed">
                    1 = Missing something important<br />
                    2 = Half right<br />
                    3 = What I'd do
                  </div>
                </div>

                {/* Lab Notes */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-white/70 mb-2 block">Lab Notes</label>
                  <textarea
                    value={labNotes}
                    onChange={(e) => setLabNotes(e.target.value)}
                    placeholder="What was wise about this? What would you adjust? If you were guiding this person live..."
                    className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80
                             placeholder-white/30 resize-none focus:ring-2 focus:ring-[#D4B896]/50 focus:border-[#D4B896]/50
                             transition-all"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={submitLabEvaluation}
                  disabled={!humanRating || isSubmittingFeedback}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                    feedbackStatus === 'success'
                      ? 'bg-emerald-500 text-white'
                      : feedbackStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-gradient-to-r from-[#D4B896] to-[#B8935A] text-[#0f1419] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSubmittingFeedback ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#0f1419]/30 border-t-[#0f1419] rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </span>
                  ) : feedbackStatus === 'success' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Evaluation Recorded</span>
                    </span>
                  ) : feedbackStatus === 'error' ? (
                    'Failed to Save — Try Again'
                  ) : (
                    'Record Lab Evaluation'
                  )}
                </motion.button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/5 rounded-xl border border-[#D4B896]/10 p-6">
              <h3 className="text-md font-semibold text-white/80 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  onClick={() => window.open('http://localhost:3008/navigator-admin', '_blank')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-white/5 hover:bg-[#D4B896]/10 rounded-xl
                           border border-transparent hover:border-[#D4B896]/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white/80 group-hover:text-[#D4B896] transition-colors">View Admin Dashboard</div>
                      <div className="text-white/40 text-xs mt-0.5">See all Navigator decisions & Spiralogic data</div>
                    </div>
                    <span className="text-[#D4B896]/40 group-hover:text-[#D4B896]/80 transition-all">→</span>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => router.push('/labtools/metrics')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-white/5 hover:bg-[#D4B896]/10 rounded-xl
                           border border-transparent hover:border-[#D4B896]/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white/80 group-hover:text-[#D4B896] transition-colors">Personal Metrics</div>
                      <div className="text-white/40 text-xs mt-0.5">View your consciousness computing data</div>
                    </div>
                    <span className="text-[#D4B896]/40 group-hover:text-[#D4B896]/80 transition-all">→</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}