'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@/lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, MessageSquare, Heart, AlertCircle } from 'lucide-react';

interface ReflectionMetrics {
  totalSubmissions: number;
  submissionRate: number;
  avgEngagementScore: number;
  moodDistribution: {
    positive: number;
    neutral: number;
    challenging: number;
  };
  fieldCompletion: {
    feeling: number;
    surprise: number;
    frustration: number;
  };
  dailyTrend: Array<{
    date: string;
    submissions: number;
    engagement: number;
  }>;
  wouldReturn: {
    yes: number;
    maybe: number;
    no: number;
  };
}

export default function ReflectionMetricsWidget() {
  const [metrics, setMetrics] = useState<ReflectionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  async function fetchMetrics() {
    try {
      const now = new Date();
      let startDate = new Date();
      
      if (timeRange === '7d') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === '30d') {
        startDate.setDate(now.getDate() - 30);
      } else {
        startDate = new Date('2024-01-01'); // Start of beta
      }

      // Fetch feedback submissions
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('beta_feedback')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Fetch engagement events
      const { data: eventData, error: eventError } = await supabase
        .from('event_logs')
        .select('*')
        .eq('event_type', 'reflection')
        .gte('created_at', startDate.toISOString());

      if (eventError) throw eventError;

      // Calculate metrics
      const totalSubmissions = feedbackData?.length || 0;
      
      // Calculate submission rate (submissions per session)
      const uniqueSessions = new Set(feedbackData?.map(f => f.session_id)).size;
      const submissionRate = uniqueSessions > 0 ? (totalSubmissions / uniqueSessions) * 100 : 0;

      // Mood distribution
      const moodCounts = feedbackData?.reduce((acc, f) => {
        if (f.mood) acc[f.mood] = (acc[f.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Field completion rates
      const fieldCompletion = {
        feeling: feedbackData?.filter(f => f.feeling).length || 0,
        surprise: feedbackData?.filter(f => f.surprise).length || 0,
        frustration: feedbackData?.filter(f => f.frustration).length || 0
      };

      // Would return distribution
      const wouldReturnCounts = feedbackData?.reduce((acc, f) => {
        if (f.would_return) acc[f.would_return] = (acc[f.would_return] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Daily trend
      const dailyData = feedbackData?.reduce((acc, f) => {
        const date = new Date(f.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { submissions: 0, totalEngagement: 0 };
        }
        acc[date].submissions++;
        // Extract engagement score from event metadata if available
        const event = eventData?.find(e => e.session_id === f.session_id);
        if (event?.metadata?.engagement_score) {
          acc[date].totalEngagement += event.metadata.engagement_score;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const dailyTrend = Object.entries(dailyData).map(([date, data]: [string, any]) => ({
        date,
        submissions: data.submissions,
        engagement: data.totalEngagement / data.submissions || 0
      })).slice(-7); // Last 7 days for chart

      // Average engagement score
      const avgEngagementScore = eventData?.reduce((sum, e) => 
        sum + (e.metadata?.engagement_score || 0), 0) / (eventData?.length || 1) || 0;

      setMetrics({
        totalSubmissions,
        submissionRate,
        avgEngagementScore,
        moodDistribution: {
          positive: moodCounts.positive || 0,
          neutral: moodCounts.neutral || 0,
          challenging: moodCounts.challenging || 0
        },
        fieldCompletion,
        dailyTrend,
        wouldReturn: {
          yes: wouldReturnCounts.yes || 0,
          maybe: wouldReturnCounts.maybe || 0,
          no: wouldReturnCounts.no || 0
        }
      });
    } catch (error) {
      console.error('Error fetching reflection metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-48 mb-4" />
        <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
    );
  }

  if (!metrics) return null;

  // Prepare chart data
  const moodData = [
    { name: 'Positive', value: metrics.moodDistribution.positive, color: '#10b981' },
    { name: 'Neutral', value: metrics.moodDistribution.neutral, color: '#6366f1' },
    { name: 'Challenging', value: metrics.moodDistribution.challenging, color: '#f97316' }
  ].filter(d => d.value > 0);

  const fieldData = [
    { field: 'Feeling', rate: (metrics.fieldCompletion.feeling / metrics.totalSubmissions) * 100 },
    { field: 'Surprise', rate: (metrics.fieldCompletion.surprise / metrics.totalSubmissions) * 100 },
    { field: 'Frustration', rate: (metrics.fieldCompletion.frustration / metrics.totalSubmissions) * 100 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            Reflection Insights
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Beta user feedback analytics
          </p>
        </div>
        
        {/* Time range selector */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {(['7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm transition ${
                timeRange === range
                  ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-50 to-indigo-50 dark:from-amber-900/20 dark:to-indigo-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-amber-600">Total</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.totalSubmissions}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Reflections
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs text-green-600">Rate</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.submissionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Per session
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600">Score</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.avgEngagementScore.toFixed(0)}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Engagement
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-xs text-orange-600">Return</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.wouldReturn.yes > 0 
              ? Math.round((metrics.wouldReturn.yes / (metrics.wouldReturn.yes + metrics.wouldReturn.maybe + metrics.wouldReturn.no)) * 100)
              : 0}%
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Would return
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily trend */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Daily Submissions
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mood distribution */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Mood Distribution
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={moodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Field completion */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Field Completion Rates
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="field" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
              <Bar dataKey="rate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Return likelihood */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Would Return to Maia
          </h4>
          <div className="space-y-3 mt-6">
            {Object.entries(metrics.wouldReturn).map(([answer, count]) => {
              const total = Object.values(metrics.wouldReturn).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = { yes: 'bg-green-500', maybe: 'bg-blue-500', no: 'bg-orange-500' };
              
              return (
                <div key={answer}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-neutral-600 dark:text-neutral-400">
                      {answer}
                    </span>
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={colors[answer as keyof typeof colors]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}