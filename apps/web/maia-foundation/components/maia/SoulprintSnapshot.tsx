'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, TrendingUp, Hash, Users, Heart, Flame, Droplet, Mountain, Wind, Sparkles as SparklesIcon, Mic, Shield, Eye, EyeOff } from 'lucide-react';
import { ainClient } from '@/lib/ain/AINClient';
import { useMaiaStore } from '@/lib/maia/state';
import { PrivacyAwareCognitiveVoiceProcessor } from '@/lib/maia/privacyAwareCognitiveVoice';

export default function SoulprintSnapshot() {
  const { entries } = useMaiaStore();
  const [guidance, setGuidance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cognitiveInsights, setCognitiveInsights] = useState<any>(null);
  const [showCognitiveInsights, setShowCognitiveInsights] = useState(false);
  const [userId] = useState('demo-user'); // TODO: Get from auth context

  useEffect(() => {
    async function loadGuidance() {
      try {
        const result = await ainClient.getUserEvolutionGuidance('current-user');
        setGuidance(result);
      } catch (error) {
        console.error('Failed to load guidance:', error);
      } finally {
        setLoading(false);
      }
    }

    async function loadCognitiveInsights() {
      try {
        // Find voice entries with cognitive analysis
        const voiceEntries = entries.filter(entry =>
          entry.isVoice && entry.cognitiveAnalysis
        );

        if (voiceEntries.length > 0 && userId) {
          const cognitiveProcessor = new PrivacyAwareCognitiveVoiceProcessor(userId);
          const recentVoiceEntry = voiceEntries[0]; // Most recent

          if (recentVoiceEntry.cognitiveAnalysis) {
            const memberInsights = await cognitiveProcessor.generateMemberFriendlySummary(
              recentVoiceEntry.cognitiveAnalysis
            );
            setCognitiveInsights(memberInsights);
            console.log('🧠 Loaded privacy-aware cognitive insights for soulprint dashboard');
          }
        }
      } catch (error) {
        console.warn('⚠️ Privacy-aware cognitive insights failed to load (continuing without):', error.message);
        setCognitiveInsights(null);
      }
    }

    loadGuidance();
    loadCognitiveInsights();
  }, [entries.length, userId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
          Reading your soulprint...
        </p>
      </div>
    );
  }

  if (!guidance) return null;

  const symbolFrequency = new Map<string, number>();
  const archetypeFrequency = new Map<string, number>();

  entries.forEach(entry => {
    if (entry.reflection) {
      entry.reflection.symbols.forEach(symbol => {
        symbolFrequency.set(symbol, (symbolFrequency.get(symbol) || 0) + 1);
      });
      entry.reflection.archetypes.forEach(archetype => {
        archetypeFrequency.set(archetype, (archetypeFrequency.get(archetype) || 0) + 1);
      });
    }
  });

  const topSymbols = Array.from(symbolFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topArchetypes = Array.from(archetypeFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Your Soulprint
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Based on {entries.length} journal {entries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
          </div>

          {/* Privacy-Aware Cognitive Insights Toggle */}
          {cognitiveInsights && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCognitiveInsights(!showCognitiveInsights)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                <Shield className="w-4 h-4" />
                Voice Insights
                {showCognitiveInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Privacy-Aware Cognitive Insights Panel */}
        {cognitiveInsights && showCognitiveInsights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                Voice Essence Insights
              </h4>
              <div className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">
                Privacy-aware · Only visible to you
              </div>
            </div>

            <div className="space-y-4">
              {cognitiveInsights.energyPatterns?.dominant && (
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      Energy Flow:
                    </span>
                    <span className="ml-2 text-emerald-800 dark:text-emerald-300">
                      Your voice carries {cognitiveInsights.energyPatterns.dominant} energy patterns
                    </span>
                  </div>
                </div>
              )}

              {cognitiveInsights.breathPattern?.quality && (
                <div className="flex items-center gap-3">
                  <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      Breath Wisdom:
                    </span>
                    <span className="ml-2 text-emerald-800 dark:text-emerald-300">
                      {cognitiveInsights.breathPattern.quality === 'deep'
                        ? 'Grounded and present breathing patterns'
                        : 'Energy moving through transition'}
                    </span>
                  </div>
                </div>
              )}

              {cognitiveInsights.coherenceProfile?.trend && (
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      Clarity Evolution:
                    </span>
                    <span className="ml-2 text-emerald-800 dark:text-emerald-300">
                      {cognitiveInsights.coherenceProfile.trend === 'emerging'
                        ? 'Beautiful clarity emerging in your expression'
                        : 'Voice coherence reflecting your inner landscape'}
                    </span>
                  </div>
                </div>
              )}

              {cognitiveInsights.wisdomDirection && (
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      Growth Edge:
                    </span>
                    <span className="ml-2 text-emerald-800 dark:text-emerald-300">
                      {cognitiveInsights.wisdomDirection}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-700">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">
                These insights come from your voice patterns and are only shown to you.
                You control your privacy settings in the Privacy & Permissions panel.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h4 className="font-semibold text-violet-900 dark:text-violet-100">Current Focus</h4>
          </div>
          <p className="text-sm text-violet-800 dark:text-violet-300">
            {guidance.currentFocus}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-3">
            <SparklesIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-amber-900 dark:text-amber-100">Timing Wisdom</h4>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {guidance.timingWisdom}
          </p>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Recurring Symbols</h4>
        </div>

        {topSymbols.length > 0 ? (
          <div className="space-y-2">
            {topSymbols.map(([symbol, count]) => (
              <div key={symbol} className="flex items-center justify-between">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{symbol}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / entries.length) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                    />
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-500 w-8 text-right">
                    {count}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Continue journaling to discover your recurring symbols
          </p>
        )}
      </div>

      <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Active Archetypes</h4>
        </div>

        {topArchetypes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topArchetypes.map(([archetype, count]) => (
              <div
                key={archetype}
                className="px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800"
              >
                <span className="font-medium text-violet-900 dark:text-violet-100">{archetype}</span>
                <span className="ml-2 text-sm text-violet-600 dark:text-violet-400">({count})</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Your archetypes will emerge as you journal
          </p>
        )}
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h4 className="font-semibold text-rose-900 dark:text-rose-100">Shadow Work</h4>
        </div>
        <p className="text-sm text-rose-800 dark:text-rose-300 mb-3">
          {guidance.shadowWork}
        </p>
      </div>

      <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Next Steps</h4>
        </div>

        <ul className="space-y-2">
          {guidance.nextSteps.map((step: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-bold">{index + 1}</span>
              </div>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Elemental Balance</h4>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          {guidance.elementalBalance}
        </p>
      </div>
    </motion.div>
  );
}