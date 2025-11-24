'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, Chrome, Globe } from 'lucide-react';
import { soullabColors } from '@/lib/theme/soullabColors';

interface TrendPoint {
  day: string;
  total: number;
  unlocked: number;
  failed: number;
  percent: number;
  browsers: Record<string, number>;
}

interface TrendData {
  trend: TrendPoint[];
  summary: {
    days: number;
    totalSessions: number;
    totalUnlocked: number;
    averagePercent: number;
  };
}

export default function AudioUnlockTrend() {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const response = await fetch(`/api/analytics/audio/trend?days=${days}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          console.error('Failed to fetch trend:', result.error);
        }
      } catch (err) {
        console.error('❌ [Trend] Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [days]);

  if (loading) {
    return (
      <div className="p-6 bg-neutral-900 text-white rounded-2xl shadow-lg animate-pulse">
        <div className="h-4 bg-neutral-800 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-neutral-800 rounded"></div>
      </div>
    );
  }

  if (!data || !data.trend.length) {
    return (
      <div className="p-6 bg-neutral-900 text-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">📈 Maia Voice Unlock Trend</h3>
        <p className="text-neutral-400">No data available</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-700">
          <p className="text-white font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">Success Rate:</span>
              <span className="font-bold" style={{ color: soullabColors.green }}>{data.percent}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">Sessions:</span>
              <span className="text-white">{data.total}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">Unlocked:</span>
              <span style={{ color: soullabColors.green }}>{data.unlocked}</span>
            </div>
            {data.failed > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-neutral-400">Failed:</span>
                <span style={{ color: soullabColors.red }}>{data.failed}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const isImproving = data.trend.length >= 2 && 
    data.trend[data.trend.length - 1].percent > data.trend[0].percent;

  return (
    <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl shadow-lg border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: soullabColors.yellow }} />
          Maia Voice Unlock Trend
        </h3>
        
        {/* Day Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-neutral-700 text-white text-sm rounded px-2 py-1 border border-neutral-600 focus:outline-none"
            style={{ borderColor: soullabColors.gray + '40' }}
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: soullabColors.blue }}>
            {data.summary.averagePercent}%
          </div>
          <div className="text-xs text-neutral-400">Avg Success</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: soullabColors.gray }}>
            {data.summary.totalSessions}
          </div>
          <div className="text-xs text-neutral-400">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: soullabColors.green }}>
            {data.summary.totalUnlocked}
          </div>
          <div className="text-xs text-neutral-400">Unlocked</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: isImproving ? soullabColors.green : soullabColors.yellow }}>
            {isImproving ? '↑' : '→'}
          </div>
          <div className="text-xs text-neutral-400">Trend</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data.trend.map(d => ({
              ...d,
              day: formatDate(d.day)
            }))}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={soullabColors.blue} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={soullabColors.blue} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={soullabColors.gray + '20'} />
            <XAxis 
              dataKey="day" 
              stroke={soullabColors.gray}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              stroke={soullabColors.gray}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="percent" 
              stroke={soullabColors.blue}
              strokeWidth={2}
              fill="url(#colorSuccess)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Browser Performance Insights */}
      {data.trend.length > 0 && (
        <div className="pt-4 border-t border-neutral-700">
          <h4 className="text-sm font-semibold mb-3 text-neutral-300">Browser Insights</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Calculate browser averages */}
            {(() => {
              const browserTotals: Record<string, number> = {};
              const browserCounts: Record<string, number> = {};
              
              data.trend.forEach(day => {
                Object.entries(day.browsers || {}).forEach(([browser, count]) => {
                  browserTotals[browser] = (browserTotals[browser] || 0) + count;
                  browserCounts[browser] = (browserCounts[browser] || 0) + 1;
                });
              });
              
              return Object.entries(browserTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([browser, total]) => {
                  const Icon = browser === 'Chrome' ? Chrome : 
                              browser === 'Safari' ? Safari : 
                              TrendingUp;
                  return (
                    <div key={browser} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs text-neutral-300">{browser}:</span>
                      <span className="text-xs font-bold text-white ml-auto">
                        {Math.round(total / browserCounts[browser])} avg/day
                      </span>
                    </div>
                  );
                });
            })()}
          </div>
        </div>
      )}

      {/* Footer Message */}
      <div className="mt-4 text-center">
        <p className="text-xs text-neutral-500">
          {isImproving 
            ? '📈 Voice unlock rate is improving!'
            : data.summary.averagePercent >= 70
            ? '✅ Stable performance'
            : '⚠️ Consider investigating unlock failures'}
        </p>
      </div>
    </div>
  );
}