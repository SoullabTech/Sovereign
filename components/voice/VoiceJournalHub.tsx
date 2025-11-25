'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, BarChart3, Download, Brain, PlayCircle, Sparkles,
  TrendingUp, Clock
} from 'lucide-react';
import { voiceJournalingService } from '@/lib/journaling/VoiceJournalingService';
import { elementalMemoryTrainer } from '@/lib/voice/ElementalMemoryTraining';
import VoiceAnalyticsDashboard from './VoiceAnalyticsDashboard';
import VoiceSessionReplay from './VoiceSessionReplay';
import MayaVoiceJournal from './MayaVoiceJournal';

interface VoiceJournalHubProps {
  userId: string;
  onClose?: () => void;
}

export default function VoiceJournalHub({ userId, onClose }: VoiceJournalHubProps) {
  const [view, setView] = useState<'home' | 'journal' | 'analytics' | 'replay' | 'training'>('home');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const sessions = voiceJournalingService.getSessionHistory(userId);
  const metrics = voiceJournalingService.getMetrics(userId);
  const insights = elementalMemoryTrainer.getElementalInsights(userId);

  const handleViewSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setView('replay');
  };

  if (view === 'journal') {
    return <MayaVoiceJournal />;
  }

  if (view === 'analytics') {
    return <VoiceAnalyticsDashboard userId={userId} onClose={() => setView('home')} />;
  }

  if (view === 'replay' && selectedSessionId) {
    const session = sessions.find(s => s.id === selectedSessionId);
    if (session) {
      return <VoiceSessionReplay session={session} onClose={() => setView('home')} />;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Voice Journal Hub</h2>
                <p className="text-sm text-white/80">Your complete voice journaling workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Sessions</span>
              </div>
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                {metrics.totalSessions}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Words Spoken</span>
              </div>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {metrics.totalWords.toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Favorite Mode</span>
              </div>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-100 capitalize">
                {metrics.favoriteMode}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('journal')}
              className="p-6 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-left shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <Mic className="w-8 h-8" />
                <span className="text-sm opacity-80">Start Now</span>
              </div>
              <h3 className="text-xl font-bold mb-1">New Voice Session</h3>
              <p className="text-sm opacity-90">Begin a new voice journaling session with MAIA</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('analytics')}
              className="p-6 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white text-left shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="w-8 h-8" />
                <span className="text-sm opacity-80">View Stats</span>
              </div>
              <h3 className="text-xl font-bold mb-1">Voice Analytics</h3>
              <p className="text-sm opacity-90">Deep insights into your voice journaling patterns</p>
            </motion.button>
          </div>

          {insights.mostDeveloped !== 'none' && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
                  Elemental Insights
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-violet-800 dark:text-violet-300">
                  <strong>Most Developed:</strong> {insights.mostDeveloped}
                </p>
                {insights.needsAttention !== 'balanced' && (
                  <p className="text-sm text-violet-800 dark:text-violet-300">
                    <strong>Needs Attention:</strong> {insights.needsAttention}
                  </p>
                )}
                <div className="mt-3 space-y-1">
                  {insights.recommendations.map((rec, i) => (
                    <p key={i} className="text-sm text-violet-700 dark:text-violet-400">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {sessions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Recent Sessions
              </h3>
              <div className="space-y-2">
                {sessions.slice(0, 5).map((session) => (
                  <motion.button
                    key={session.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleViewSession(session.id)}
                    className="w-full p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                            {session.mode}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500">
                            {new Date(session.startTime).toLocaleDateString()} • {session.wordCount} words
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          session.element === 'fire' ? 'bg-orange-500' :
                          session.element === 'water' ? 'bg-blue-500' :
                          session.element === 'earth' ? 'bg-green-500' :
                          session.element === 'air' ? 'bg-sky-500' :
                          'bg-purple-500'
                        }`} />
                        {session.analysis?.transformationScore && (
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {session.analysis.transformationScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}