'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Sun, Moon, Monitor, TrendingUp, Clock } from 'lucide-react';
import { soullabColors } from '@/lib/theme/soullabColors';

interface ThemeMetrics {
  currentDistribution: {
    light: number;
    dark: number;
    system: number;
  };
  timeOfDayPreferences: {
    morning: { light: number; dark: number; system: number };
    afternoon: { light: number; dark: number; system: number };
    evening: { light: number; dark: number; system: number };
    night: { light: number; dark: number; system: number };
  };
  dailyChanges: Array<{
    date: string;
    changes: number;
    light: number;
    dark: number;
    system: number;
  }>;
  platformBreakdown: {
    desktop: { light: number; dark: number; system: number };
    mobile: { light: number; dark: number; system: number };
    tablet: { light: number; dark: number; system: number };
  };
  totalChanges: number;
  averageChangesPerUser: number;
}

export default function ThemePreferencesWidget() {
  const [metrics, setMetrics] = useState<ThemeMetrics | null>(null);
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
        startDate = new Date('2024-01-01');
      }

      // Fetch theme change events
      const { data: events, error } = await supabase
        .from('event_logs')
        .select('*')
        .eq('event_name', 'theme_changed')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch current user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('theme');

      // Calculate current distribution
      const currentDistribution = preferences?.reduce((acc, pref) => {
        const theme = pref.theme || 'system';
        acc[theme] = (acc[theme] || 0) + 1;
        return acc;
      }, {} as any) || { light: 0, dark: 0, system: 0 };

      // Calculate time of day preferences
      const timeOfDayPreferences = events?.reduce((acc, event) => {
        const timeOfDay = event.metadata?.time_of_day || 'morning';
        const toTheme = event.metadata?.to_theme || 'system';
        
        if (!acc[timeOfDay]) {
          acc[timeOfDay] = { light: 0, dark: 0, system: 0 };
        }
        acc[timeOfDay][toTheme] = (acc[timeOfDay][toTheme] || 0) + 1;
        return acc;
      }, {} as any) || {};

      // Calculate daily changes
      const dailyData = events?.reduce((acc, event) => {
        const date = new Date(event.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { changes: 0, light: 0, dark: 0, system: 0 };
        }
        acc[date].changes++;
        const toTheme = event.metadata?.to_theme || 'system';
        acc[date][toTheme]++;
        return acc;
      }, {} as any) || {};

      const dailyChanges = Object.entries(dailyData)
        .map(([date, data]: [string, any]) => ({
          date,
          ...data
        }))
        .slice(-7);

      // Calculate platform breakdown
      const platformBreakdown = events?.reduce((acc, event) => {
        const platform = event.metadata?.platform || 'desktop';
        const toTheme = event.metadata?.to_theme || 'system';
        
        if (!acc[platform]) {
          acc[platform] = { light: 0, dark: 0, system: 0 };
        }
        acc[platform][toTheme]++;
        return acc;
      }, {} as any) || {};

      // Calculate average changes per user
      const uniqueUsers = new Set(events?.map(e => e.user_id)).size;
      const totalChanges = events?.length || 0;
      const averageChangesPerUser = uniqueUsers > 0 ? totalChanges / uniqueUsers : 0;

      setMetrics({
        currentDistribution,
        timeOfDayPreferences,
        dailyChanges,
        platformBreakdown,
        totalChanges,
        averageChangesPerUser
      });
    } catch (error) {
      console.error('Error fetching theme metrics:', error);
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
  const distributionData = [
    { name: 'Light', value: metrics.currentDistribution.light, icon: '☀️', color: soullabColors.yellow },
    { name: 'Dark', value: metrics.currentDistribution.dark, icon: '🌙', color: soullabColors.blue },
    { name: 'System', value: metrics.currentDistribution.system, icon: '🖥️', color: soullabColors.gray }
  ].filter(d => d.value > 0);

  const timeOfDayData = Object.entries(metrics.timeOfDayPreferences).map(([time, prefs]: [string, any]) => ({
    time: time.charAt(0).toUpperCase() + time.slice(1),
    light: prefs.light || 0,
    dark: prefs.dark || 0,
    system: prefs.system || 0
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

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
            Theme Preferences
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            User theme selection patterns
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
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Sun className="w-5 h-5 text-yellow-600" />
            <span className="text-xs text-yellow-600">Light</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.currentDistribution.light}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Users
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Moon className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600">Dark</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.currentDistribution.dark}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Users
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Monitor className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">System</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.currentDistribution.system}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Users
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-pink-50 dark:from-amber-900/20 dark:to-pink-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-amber-600">Changes</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.totalChanges}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Total switches
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* PIE CHART DISABLED - USER REQUEST TO REMOVE PERMANENTLY */}
        {false && (
          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Current Distribution
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Time of day preferences */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Time of Day Preferences
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeOfDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={soullabColors.opacity.gray10} />
              <XAxis dataKey="time" stroke={soullabColors.gray} tick={{ fontSize: 10 }} />
              <YAxis stroke={soullabColors.gray} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="light" fill={soullabColors.yellow} stackId="a" />
              <Bar dataKey="dark" fill={soullabColors.blue} stackId="a" />
              <Bar dataKey="system" fill={soullabColors.gray} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily changes trend */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Theme Changes Over Time
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.dailyChanges}>
              <CartesianGrid strokeDasharray="3 3" stroke={soullabColors.opacity.gray10} />
              <XAxis 
                dataKey="date" 
                stroke={soullabColors.gray}
                tick={{ fontSize: 10 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke={soullabColors.gray} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="changes" stroke={soullabColors.chart.primary} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform insights */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Platform Insights
          </h4>
          <div className="space-y-3 mt-6">
            {Object.entries(metrics.platformBreakdown).map(([platform, prefs]: [string, any]) => {
              const total = prefs.light + prefs.dark + prefs.system;
              const darkPercentage = total > 0 ? (prefs.dark / total) * 100 : 0;
              
              return (
                <div key={platform}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-neutral-600 dark:text-neutral-400">
                      {platform}
                    </span>
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {darkPercentage.toFixed(0)}% dark
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${darkPercentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Key Insights
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 text-amber-600" />
            <div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">
                Peak switching time
              </p>
              <p>Most theme changes happen in the evening</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 mt-0.5 text-green-600" />
            <div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">
                Avg changes per user
              </p>
              <p>{metrics.averageChangesPerUser.toFixed(1)} switches during beta</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}