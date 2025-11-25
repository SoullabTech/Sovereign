'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, Heart, Zap, Award, Calendar } from 'lucide-react';

interface NeuroplasticityDashboardProps {
  userId: string;
}

interface BrainMetrics {
  emotionalRegulation: number; // 0-100, from reflective sessions
  attentionStability: number;  // 0-100, from gratitude sessions
  emotionalProcessing: number; // 0-100, from expressive sessions
  overallNeuroplasticity: number; // 0-100, combined score
  streakDays: number;
  totalSessions: number;
  preferredMode: 'expressive' | 'gratitude' | 'reflective';
  weeklyProgress: number; // -100 to +100, change from last week
}

const mockMetrics: BrainMetrics = {
  emotionalRegulation: 78,
  attentionStability: 85,
  emotionalProcessing: 72,
  overallNeuroplasticity: 79,
  streakDays: 12,
  totalSessions: 43,
  preferredMode: 'gratitude',
  weeklyProgress: 15
};

export function NeuroplasticityDashboard({ userId }: NeuroplasticityDashboardProps) {
  const [metrics, setMetrics] = useState<BrainMetrics>(mockMetrics);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 40) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Growing';
    if (score >= 40) return 'Building';
    return 'Beginning';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Brain Health Dashboard</h2>
            <p className="text-sm text-stone-400">Tracking your neuroplasticity journey</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['week', 'month', 'all'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe as any)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedTimeframe === timeframe
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                  : 'text-stone-400 hover:text-white border border-stone-600'
              }`}
            >
              {timeframe === 'all' ? 'All Time' : `Past ${timeframe}`}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Overall Neuroplasticity</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metrics.overallNeuroplasticity}%</div>
            <div className="text-sm text-purple-300">{getScoreLabel(metrics.overallNeuroplasticity)} neural adaptation</div>

            {metrics.weeklyProgress > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm">+{metrics.weeklyProgress}% this week</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-sm">{metrics.streakDays} day streak</span>
            </div>
            <div className="text-stone-400 text-sm">{metrics.totalSessions} total sessions</div>
          </div>
        </div>
      </motion.div>

      {/* Individual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Emotional Regulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-lg border p-4 ${getScoreColor(metrics.emotionalRegulation)}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Emotional Regulation</span>
          </div>

          <div className="text-2xl font-bold mb-2">{metrics.emotionalRegulation}%</div>

          {/* Progress bar */}
          <div className="w-full bg-stone-700 rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.emotionalRegulation}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          </div>

          <p className="text-xs opacity-80">
            From reflective reframing sessions
          </p>
        </motion.div>

        {/* Attention Stability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-lg border p-4 ${getScoreColor(metrics.attentionStability)}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Attention Stability</span>
          </div>

          <div className="text-2xl font-bold mb-2">{metrics.attentionStability}%</div>

          {/* Progress bar */}
          <div className="w-full bg-stone-700 rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.attentionStability}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            />
          </div>

          <p className="text-xs opacity-80">
            From gratitude practice sessions
          </p>
        </motion.div>

        {/* Emotional Processing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-lg border p-4 ${getScoreColor(metrics.emotionalProcessing)}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">Emotional Processing</span>
          </div>

          <div className="text-2xl font-bold mb-2">{metrics.emotionalProcessing}%</div>

          {/* Progress bar */}
          <div className="w-full bg-stone-700 rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.emotionalProcessing}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>

          <p className="text-xs opacity-80">
            From expressive writing sessions
          </p>
        </motion.div>
      </div>

      {/* Science Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-200">Neuroscience Insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-300">
          <div>
            <strong className="text-purple-300">Your Preferred Mode: </strong>
            <span className="capitalize">{metrics.preferredMode}</span>
            <p className="mt-1 text-stone-400">
              {metrics.preferredMode === 'gratitude' && 'Strengthening positive attention patterns'}
              {metrics.preferredMode === 'expressive' && 'Processing unfinished emotional material'}
              {metrics.preferredMode === 'reflective' && 'Building pause-response capacity'}
            </p>
          </div>

          <div>
            <strong className="text-emerald-300">Current Focus: </strong>
            <span>
              {metrics.emotionalProcessing < 60 && 'Emotional integration'}
              {metrics.attentionStability < 60 && 'Attention retraining'}
              {metrics.emotionalRegulation < 60 && 'Resilience building'}
              {metrics.emotionalProcessing >= 60 && metrics.attentionStability >= 60 && metrics.emotionalRegulation >= 60 && 'Maintenance & growth'}
            </span>
            <p className="mt-1 text-stone-400">
              Based on your current neural development patterns
            </p>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-200">Personalized Recommendations</span>
        </div>

        <div className="space-y-2 text-sm">
          {metrics.emotionalProcessing < 70 && (
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
              <div>
                <strong className="text-purple-300">Try more expressive writing:</strong>
                <span className="text-stone-400 ml-1">15-20 minute sessions help complete emotional processing loops</span>
              </div>
            </div>
          )}

          {metrics.attentionStability < 80 && (
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <div>
                <strong className="text-emerald-300">Daily gratitude practice:</strong>
                <span className="text-stone-400 ml-1">5-7 minutes daily retrains your brain to notice stability</span>
              </div>
            </div>
          )}

          {metrics.emotionalRegulation < 75 && (
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
              <div>
                <strong className="text-blue-300">Reflective reframing:</strong>
                <span className="text-stone-400 ml-1">Practice turning challenges into learning data</span>
              </div>
            </div>
          )}

          {metrics.streakDays < 7 && (
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <div>
                <strong className="text-amber-300">Build consistency:</strong>
                <span className="text-stone-400 ml-1">Even 5 minutes daily creates stronger neural pathways than longer sporadic sessions</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}