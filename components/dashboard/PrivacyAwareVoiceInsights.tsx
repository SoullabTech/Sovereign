'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Eye,
  EyeOff,
  Mic,
  Settings,
  TrendingUp,
  Flame,
  Wind,
  Sparkles as SparklesIcon,
  Brain,
  Activity,
  Waves
} from 'lucide-react';
import { useMaiaStore } from '@/lib/maia/state';
import { PrivacyAwareCognitiveVoiceProcessor } from '@/lib/maia/privacyAwareCognitiveVoice';

interface VoiceInsightsProps {
  userId?: string;
  className?: string;
  compact?: boolean;
}

export default function PrivacyAwareVoiceInsights({
  userId = 'demo-user',
  className = '',
  compact = false
}: VoiceInsightsProps) {
  const { entries } = useMaiaStore();
  const [cognitiveInsights, setCognitiveInsights] = useState<any>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasVoiceData, setHasVoiceData] = useState(false);

  useEffect(() => {
    loadVoiceInsights();
  }, [entries.length, userId]);

  const loadVoiceInsights = async () => {
    setLoading(true);
    try {
      // Find voice entries with cognitive analysis
      const voiceEntries = entries.filter(entry =>
        entry.isVoice && entry.cognitiveAnalysis
      );

      setHasVoiceData(voiceEntries.length > 0);

      if (voiceEntries.length > 0 && userId) {
        const cognitiveProcessor = new PrivacyAwareCognitiveVoiceProcessor(userId);
        const recentVoiceEntry = voiceEntries[0]; // Most recent

        if (recentVoiceEntry.cognitiveAnalysis) {
          const memberInsights = await cognitiveProcessor.generateMemberFriendlySummary(
            recentVoiceEntry.cognitiveAnalysis
          );
          setCognitiveInsights(memberInsights);
          console.log('🎯 [Voice Insights Dashboard] Loaded privacy-aware cognitive insights');
        }
      }
    } catch (error) {
      console.warn('⚠️ [Voice Insights Dashboard] Privacy-aware cognitive insights failed to load:', error.message);
      setCognitiveInsights(null);
    } finally {
      setLoading(false);
    }
  };

  if (!hasVoiceData) {
    return (
      <div className={`p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
            <Mic className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Voice Insights
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Privacy-aware voice pattern analysis
            </p>
          </div>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Record voice journal entries to unlock personalized insights about your speaking patterns, energy flow, and expression clarity.
        </p>
        <div className="mt-4 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
          <p className="text-xs text-violet-700 dark:text-violet-300">
            🔒 All voice analysis respects your privacy settings and is only visible to you.
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500 text-white">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-900 dark:text-emerald-100">
                Voice Insights Available
              </h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {showInsights ? 'Privacy-aware insights active' : 'Click to reveal insights'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-colors"
          >
            {showInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {showInsights && cognitiveInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700"
            >
              <div className="space-y-2 text-sm">
                {cognitiveInsights.energyPatterns?.dominant && (
                  <div className="flex items-center gap-2">
                    <Flame className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-800 dark:text-emerald-200">
                      {cognitiveInsights.energyPatterns.dominant} energy flow
                    </span>
                  </div>
                )}

                {cognitiveInsights.coherenceProfile?.trend && (
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-800 dark:text-emerald-200">
                      {cognitiveInsights.coherenceProfile.trend === 'emerging'
                        ? 'Clarity emerging'
                        : 'Voice coherence stable'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Voice Essence Insights
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Privacy-aware analysis of your speaking patterns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
          >
            <Shield className="w-4 h-4" />
            {showInsights ? 'Hide' : 'Show'} Insights
            {showInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInsights && cognitiveInsights ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Voice Characteristics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cognitiveInsights.energyPatterns?.dominant && (
                <div className="p-4 rounded-lg bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      Energy Signature
                    </span>
                  </div>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    Your voice carries <strong>{cognitiveInsights.energyPatterns.dominant}</strong> elemental patterns,
                    reflecting your current energetic state.
                  </p>
                </div>
              )}

              {cognitiveInsights.breathPattern?.quality && (
                <div className="p-4 rounded-lg bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      Breath Wisdom
                    </span>
                  </div>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    {cognitiveInsights.breathPattern.quality === 'deep'
                      ? 'Your breathing reflects a grounded, present state of being.'
                      : 'Your breath suggests energy moving through transition and change.'}
                  </p>
                </div>
              )}

              {cognitiveInsights.coherenceProfile?.trend && (
                <div className="p-4 rounded-lg bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      Clarity Evolution
                    </span>
                  </div>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    {cognitiveInsights.coherenceProfile.trend === 'emerging'
                      ? 'Beautiful clarity is emerging in your voice and expression.'
                      : 'Your voice coherence reflects your inner landscape\'s current state.'}
                  </p>
                </div>
              )}

              {cognitiveInsights.wisdomDirection && (
                <div className="p-4 rounded-lg bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      Growth Direction
                    </span>
                  </div>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    {cognitiveInsights.wisdomDirection}
                  </p>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 pt-4 border-t border-emerald-200 dark:border-emerald-700">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    <span className="font-medium">Privacy-First Analysis:</span> These insights are generated
                    from your voice patterns using local processing and are only visible to you.
                    All cognitive analysis respects your privacy settings.
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Manage your privacy settings in the Privacy & Permissions panel.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : showInsights ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {loading ? (
                <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
              ) : (
                <Waves className="w-5 h-5 text-emerald-600" />
              )}
              <span className="text-emerald-700 dark:text-emerald-300">
                {loading ? 'Analyzing voice patterns...' : 'No cognitive insights available yet'}
              </span>
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {loading
                ? 'Processing your privacy-aware voice analysis...'
                : 'Create more voice journal entries to enable deeper insights.'}
            </p>
          </motion.div>
        ) : (
          <div className="text-center py-6">
            <p className="text-emerald-700 dark:text-emerald-300">
              Click "Show Insights" to view your privacy-aware voice analysis
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}