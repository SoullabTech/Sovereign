'use client';

import React, { useEffect, useState } from 'react';
import { Chrome, Globe, Smartphone, Monitor, Tablet } from 'lucide-react';

interface BrowserStats {
  browser: string;
  unlocked: number;
  failed: number;
  total: number;
  successRate: number;
  versions: string[];
  platforms: string[];
}

interface BrowserSummary {
  days: number;
  totalSessions: number;
  totalUnlocked: number;
  totalFailed: number;
  overallSuccessRate: number;
  bestPerformer: string;
  worstPerformer: string;
}

export default function AudioUnlockByBrowser() {
  const [stats, setStats] = useState<BrowserStats[]>([]);
  const [summary, setSummary] = useState<BrowserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/analytics/audio/browsers?days=${days}`);
        const data = await response.json();
        
        if (data.success) {
          setStats(data.browsers);
          setSummary(data.summary);
        } else {
          console.error('Failed to fetch browser stats:', data.error);
        }
      } catch (err) {
        console.error('❌ [BrowserStats] Failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [days]);

  const getBrowserIcon = (browser: string) => {
    const name = browser.toLowerCase();
    if (name.includes('chrome')) return <Chrome className="w-4 h-4" />;
    if (name.includes('safari')) return <Globe className="w-4 h-4" />;
    if (name.includes('firefox')) return <Globe className="w-4 h-4" />;
    if (name.includes('edge')) return <Globe className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const getPlatformIcon = (platforms: string[]) => {
    if (platforms.includes('mobile')) return <Smartphone className="w-4 h-4 text-blue-400" />;
    if (platforms.includes('tablet')) return <Tablet className="w-4 h-4 text-amber-400" />;
    return <Monitor className="w-4 h-4 text-green-400" />;
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 75) return 'text-yellow-400';
    if (rate >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSuccessBarColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-yellow-500';
    if (rate >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6 bg-neutral-900 text-white rounded-2xl shadow-lg animate-pulse">
        <div className="h-4 bg-neutral-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-neutral-800 rounded"></div>
          <div className="h-12 bg-neutral-800 rounded"></div>
          <div className="h-12 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats.length) {
    return (
      <div className="p-6 bg-neutral-900 text-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">🌐 Maia Voice Unlock by Browser</h3>
        <p className="text-neutral-400">No browser data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl shadow-lg border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-400" />
          Browser Compatibility Matrix
        </h3>
        
        {/* Day Selector */}
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-neutral-700 text-white text-sm rounded px-2 py-1 border border-neutral-600 focus:outline-none focus:border-amber-400"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-neutral-400 mb-1">Overall Success</div>
            <div className={`text-2xl font-bold ${getSuccessColor(summary.overallSuccessRate)}`}>
              {summary.overallSuccessRate}%
            </div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3 text-center border border-green-700/30">
            <div className="text-xs text-green-300 mb-1">Best Performer</div>
            <div className="text-lg font-bold text-green-400 truncate">
              {summary.bestPerformer}
            </div>
          </div>
          <div className="bg-red-900/20 rounded-lg p-3 text-center border border-red-700/30">
            <div className="text-xs text-red-300 mb-1">Needs Attention</div>
            <div className="text-lg font-bold text-red-400 truncate">
              {summary.worstPerformer}
            </div>
          </div>
        </div>
      )}

      {/* Browser Table */}
      <div className="space-y-3">
        {stats.map((browser, index) => (
          <div 
            key={browser.browser} 
            className="bg-neutral-800/30 rounded-lg p-4 hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getBrowserIcon(browser.browser)}
                  <span className="font-semibold">{browser.browser}</span>
                </div>
                {browser.platforms.length > 0 && getPlatformIcon(browser.platforms)}
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="text-green-400">
                  ✓ {browser.unlocked}
                </div>
                <div className="text-red-400">
                  ✗ {browser.failed}
                </div>
                <div className={`font-bold ${getSuccessColor(browser.successRate)}`}>
                  {browser.successRate}%
                </div>
              </div>
            </div>
            
            {/* Success Rate Bar */}
            <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${getSuccessBarColor(browser.successRate)} rounded-full transition-all duration-500`}
                style={{ width: `${browser.successRate}%` }}
              />
            </div>
            
            {/* Version Info */}
            {browser.versions.length > 0 && (
              <div className="mt-2 text-xs text-neutral-500">
                Versions: {browser.versions.slice(0, 3).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Insights */}
      {stats.length > 0 && (
        <div className="mt-6 p-4 bg-amber-900/20 rounded-lg border border-amber-700/30">
          <h4 className="text-sm font-semibold text-amber-300 mb-2">💡 Key Insights</h4>
          <ul className="space-y-1 text-xs text-neutral-300">
            {stats.some(s => s.browser.toLowerCase().includes('safari') && s.successRate < 80) && (
              <li>• Safari users may need an extra tap to enable audio (iOS limitation)</li>
            )}
            {stats.some(s => s.successRate < 70) && (
              <li>• Consider adding browser-specific guidance for low-performing browsers</li>
            )}
            {summary && summary.overallSuccessRate > 85 && (
              <li>• ✅ Audio unlock is working well across most browsers</li>
            )}
            {stats.some(s => s.platforms.includes('mobile') && s.successRate < 75) && (
              <li>• Mobile browsers showing lower success rates - may need UX improvements</li>
            )}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-neutral-500">
        Based on {summary?.totalSessions || 0} sessions • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}