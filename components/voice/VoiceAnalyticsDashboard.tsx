'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Clock, Mic, TrendingUp, Zap,
  Flame, Droplet, Mountain, Wind, Sparkles,
  Calendar, Target, Activity
} from 'lucide-react';
import { voiceJournalingService, VoiceJournalSession } from '@/lib/journaling/VoiceJournalingService';
import { JOURNALING_MODES } from '@/lib/journaling/JournalingPrompts';

interface VoiceAnalyticsDashboardProps {
  userId: string;
  onClose?: () => void;
}

interface ElementStats {
  count: number;
  totalDuration: number;
  totalWords: number;
  avgTransformation: number;
}

interface TransformationTrigger {
  mode: string;
  element: string;
  score: number;
  timestamp: Date;
  symbols: string[];
}

export default function VoiceAnalyticsDashboard({ userId, onClose }: VoiceAnalyticsDashboardProps) {
  const [sessions, setSessions] = useState<VoiceJournalSession[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    const allSessions = voiceJournalingService.getSessionHistory(userId);
    setSessions(allSessions);
  }, [userId]);

  const filteredSessions = sessions.filter(session => {
    if (selectedPeriod === 'all') return true;

    const sessionDate = new Date(session.startTime);
    const now = new Date();
    const daysAgo = selectedPeriod === 'week' ? 7 : 30;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return sessionDate >= cutoff;
  });

  const totalSessions = filteredSessions.length;
  const totalWords = filteredSessions.reduce((sum, s) => sum + s.wordCount, 0);
  const totalDuration = filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const avgSessionLength = totalSessions > 0 ? totalDuration / totalSessions : 0;

  const elementStats: Record<string, ElementStats> = {
    fire: { count: 0, totalDuration: 0, totalWords: 0, avgTransformation: 0 },
    water: { count: 0, totalDuration: 0, totalWords: 0, avgTransformation: 0 },
    earth: { count: 0, totalDuration: 0, totalWords: 0, avgTransformation: 0 },
    air: { count: 0, totalDuration: 0, totalWords: 0, avgTransformation: 0 },
    aether: { count: 0, totalDuration: 0, totalWords: 0, avgTransformation: 0 },
  };

  const modeStats: Record<string, number> = {};

  const transformationTriggers: TransformationTrigger[] = [];

  filteredSessions.forEach(session => {
    const element = session.element;
    elementStats[element].count++;
    elementStats[element].totalDuration += session.duration || 0;
    elementStats[element].totalWords += session.wordCount;

    modeStats[session.mode] = (modeStats[session.mode] || 0) + 1;

    if (session.analysis) {
      const score = session.analysis.transformationScore || 0;
      elementStats[element].avgTransformation += score;

      if (score > 70) {
        transformationTriggers.push({
          mode: session.mode,
          element: session.element,
          score,
          timestamp: session.startTime,
          symbols: session.analysis.symbols || [],
        });
      }
    }
  });

  Object.values(elementStats).forEach(stat => {
    if (stat.count > 0) {
      stat.avgTransformation = stat.avgTransformation / stat.count;
    }
  });

  transformationTriggers.sort((a, b) => b.score - a.score);

  const elementIcons: Record<string, any> = {
    fire: Flame,
    water: Droplet,
    earth: Mountain,
    air: Wind,
    aether: Sparkles,
  };

  const elementColors: Record<string, string> = {
    fire: 'from-red-500 to-orange-500',
    water: 'from-blue-500 to-cyan-500',
    earth: 'from-green-600 to-emerald-600',
    air: 'from-sky-400 to-indigo-400',
    aether: 'from-purple-500 to-violet-600',
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

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
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Voice Analytics
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Your voice journaling insights
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Close
            </button>
          </div>

          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-indigo-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {period === 'week' ? 'Last Week' : period === 'month' ? 'Last Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Sessions</span>
              </div>
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{totalSessions}</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Words</span>
              </div>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {totalWords.toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Total Time</span>
              </div>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                {formatDuration(totalDuration)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border border-rose-200 dark:border-rose-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-medium text-rose-900 dark:text-rose-100">Avg Session</span>
              </div>
              <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                {formatDuration(avgSessionLength)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Element Usage
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(elementStats)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([element, stats]) => {
                    const Icon = elementIcons[element];
                    const percentage = totalSessions > 0 ? (stats.count / totalSessions) * 100 : 0;

                    return (
                      <div key={element} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span className="capitalize font-medium">{element}</span>
                          </div>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {stats.count} sessions ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={`h-full bg-gradient-to-r ${elementColors[element]}`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-500">
                          <span>{formatDuration(stats.totalDuration)}</span>
                          <span>{stats.totalWords} words</span>
                          <span>Δ {stats.avgTransformation.toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Mode Distribution
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(modeStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mode, count]) => {
                    const modeInfo = JOURNALING_MODES[mode as keyof typeof JOURNALING_MODES];
                    const percentage = totalSessions > 0 ? (count / totalSessions) * 100 : 0;

                    return (
                      <div key={mode} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{modeInfo?.icon || '📝'}</span>
                            <span className="font-medium">{modeInfo?.name || mode}</span>
                          </div>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {transformationTriggers.length > 0 && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
                  Transformation Triggers (Score &gt; 70%)
                </h3>
              </div>

              <div className="space-y-3">
                {transformationTriggers.slice(0, 5).map((trigger, index) => {
                  const Icon = elementIcons[trigger.element];
                  const modeInfo = JOURNALING_MODES[trigger.mode as keyof typeof JOURNALING_MODES];

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white dark:bg-neutral-800 border border-violet-200 dark:border-violet-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{modeInfo?.name || trigger.mode}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                            {trigger.score}%
                          </span>
                        </div>
                      </div>

                      {trigger.symbols.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {trigger.symbols.slice(0, 4).map((symbol, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        {new Date(trigger.timestamp).toLocaleDateString()} at{' '}
                        {new Date(trigger.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {totalSessions === 0 && (
            <div className="text-center py-12">
              <Mic className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No voice sessions yet
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Start your first voice journaling session to see analytics
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}