'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Holoflower } from '@/components/ui/Holoflower';
import { Star, TrendingUp, Users, MessageSquare, Brain } from 'lucide-react';

interface FeedbackData {
  id: string;
  accuracy_rating: number;
  emergent_insight: string;
  session_word: string;
  consciousness_level?: number;
  unexpected_elements?: string;
  created_at: string;
  user_id: string;
}

interface Analytics {
  total_feedback: number;
  average_accuracy: number;
  top_session_words: { word: string; count: number }[];
  consciousness_levels: { [level: string]: number };
  recent_insights: {
    session_word: string;
    emergent_insight: string;
    accuracy: number;
    created_at: string;
  }[];
}

const COLORS = ['#6EE7B7', '#A0C4C7', '#94A3B8', '#E5E7EB', '#F3F4F6'];

export default function ConsciousnessAnalyticsPage() {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadFeedbackData();
  }, [timeRange]);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/consciousness-computing/feedback?limit=100&timeRange=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setFeedback(data.feedback);
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to load feedback data:', data.error);
      }
    } catch (error) {
      console.error('Error loading feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const accuracyDistribution = analytics ? [
    { rating: '1 (Poor)', count: feedback.filter(f => f.accuracy_rating === 1).length },
    { rating: '2 (Fair)', count: feedback.filter(f => f.accuracy_rating === 2).length },
    { rating: '3 (Good)', count: feedback.filter(f => f.accuracy_rating === 3).length },
    { rating: '4 (Very Good)', count: feedback.filter(f => f.accuracy_rating === 4).length },
    { rating: '5 (Excellent)', count: feedback.filter(f => f.accuracy_rating === 5).length },
  ] : [];

  const timeSeriesData = feedback
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc, curr, idx) => {
      const date = new Date(curr.created_at).toLocaleDateString();
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.sessions += 1;
        existing.avgAccuracy = (existing.avgAccuracy * (existing.sessions - 1) + curr.accuracy_rating) / existing.sessions;
      } else {
        acc.push({
          date,
          sessions: 1,
          avgAccuracy: curr.accuracy_rating
        });
      }
      return acc;
    }, [] as { date: string; sessions: number; avgAccuracy: number }[]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A1F2E] to-[#0D1B2A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Holoflower size="lg" glowIntensity="high" animate={true} />
          </div>
          <p className="text-white/70">Loading consciousness analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A1F2E] to-[#0D1B2A] p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto">
            <Holoflower size="md" glowIntensity="medium" animate={true} />
          </div>
          <h1 className="text-3xl font-light text-[#A0C4C7] tracking-wide">
            Consciousness Computing Analytics
          </h1>
          <p className="text-white/60">
            Real-time feedback and accuracy metrics for MAIA's consciousness detection system
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center space-x-3">
          {[
            { value: '1d', label: '24 Hours' },
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: 'all', label: 'All Time' }
          ].map((range) => (
            <motion.button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                timeRange === range.value
                  ? 'bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {range.label}
            </motion.button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            title="Total Sessions"
            value={analytics?.total_feedback || 0}
            subtitle="Pioneer feedback sessions"
          />
          <MetricCard
            icon={<Star className="w-6 h-6" />}
            title="Average Accuracy"
            value={analytics?.average_accuracy ? `${analytics.average_accuracy.toFixed(1)}/5` : 'N/A'}
            subtitle="Consciousness detection accuracy"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="High Accuracy Rate"
            value={`${Math.round(((feedback.filter(f => f.accuracy_rating >= 4).length) / feedback.length) * 100)}%`}
            subtitle="Sessions rated 4+ out of 5"
          />
          <MetricCard
            icon={<Brain className="w-6 h-6" />}
            title="Deep Insights"
            value={feedback.filter(f => f.emergent_insight.length > 100).length}
            subtitle="Sessions with detailed insights"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Accuracy Distribution */}
          <ChartCard title="Accuracy Rating Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accuracyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="rating" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                <YAxis tick={{ fill: '#ffffff80', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#6EE7B7" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Session Words */}
          <ChartCard title="Most Common Session Words">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.top_session_words?.slice(0, 5) || []}
                  dataKey="count"
                  nameKey="word"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {analytics?.top_session_words?.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>

        {/* Time Series */}
        <ChartCard title="Sessions Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" tick={{ fill: '#ffffff80', fontSize: 12 }} />
              <YAxis tick={{ fill: '#ffffff80', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="sessions" stroke="#6EE7B7" strokeWidth={2} />
              <Line type="monotone" dataKey="avgAccuracy" stroke="#A0C4C7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent Insights */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-light text-[#A0C4C7] mb-6">Recent Pioneer Insights</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analytics?.recent_insights?.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[#6EE7B7] font-medium">{insight.session_word}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 text-sm">Accuracy: {insight.accuracy}/5</span>
                    <span className="text-white/40 text-xs">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {insight.emergent_insight}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-[#6EE7B7]">{icon}</div>
        <h3 className="text-white font-medium">{title}</h3>
      </div>
      <div className="text-2xl font-light text-[#A0C4C7] mb-1">{value}</div>
      <p className="text-white/60 text-sm">{subtitle}</p>
    </motion.div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-medium text-[#A0C4C7] mb-6">{title}</h3>
      {children}
    </div>
  );
}