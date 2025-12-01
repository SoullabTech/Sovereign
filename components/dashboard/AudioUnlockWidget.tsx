'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, TrendingUp, TrendingDown } from 'lucide-react';

interface AudioStats {
  total: number;
  unlocked: number;
  failed: number;
  percent: number;
  browsers: Record<string, {
    total: number;
    unlocked: number;
    percent: number;
  }>;
}

export default function AudioUnlockWidget() {
  const [stats, setStats] = useState<AudioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/audio');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.error || 'Failed to fetch stats');
        }
      } catch (err) {
        console.error('❌ [Widget] Failed to fetch stats', err);
        setError('Failed to connect to analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-neutral-900 text-white rounded-2xl shadow-lg animate-pulse">
        <div className="h-4 bg-neutral-800 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-neutral-800 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-neutral-900 text-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <VolumeX className="w-5 h-5" />
          Audio Unlock Stats
        </h3>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const trend = stats.percent > 70 ? 'up' : 'down';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl shadow-lg border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-amber-400" />
          Maia Voice Unlock
        </h3>
        <span className="text-xs text-neutral-400">Last 24h</span>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-xs text-neutral-400">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.unlocked}</div>
          <div className="text-xs text-neutral-400">Unlocked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
          <div className="text-xs text-neutral-400">Failed</div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-300">Success Rate</span>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="font-bold">{stats.percent}%</span>
          </div>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      </div>

      {/* Browser Breakdown */}
      {Object.keys(stats.browsers).length > 0 && (
        <div className="pt-4 border-t border-neutral-700">
          <h4 className="text-sm font-semibold mb-3 text-neutral-300">Browser Success Rates</h4>
          <div className="space-y-2">
            {Object.entries(stats.browsers)
              .sort(([, a], [, b]) => b.percent - a.percent)
              .slice(0, 3)
              .map(([browser, data]) => (
                <div key={browser} className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">{browser}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-neutral-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${data.percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-neutral-300">
                      {data.percent}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Footer Message */}
      <div className="mt-4 text-center">
        <p className="text-xs text-neutral-500">
          {stats.percent >= 80 ? '🎉 Excellent audio unlock rate!' :
           stats.percent >= 60 ? '✅ Good performance' :
           '⚠️ Consider optimizing audio unlock'}
        </p>
      </div>
    </div>
  );
}