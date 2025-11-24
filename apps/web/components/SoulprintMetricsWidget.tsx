'use client';

import { useEffect, useState } from 'react';
import { soulprintTracker, Soulprint } from '@/lib/beta/SoulprintTracking';
import { metricsEngine, ComprehensiveMetricsSnapshot } from '@/lib/metrics/PsychospiritualMetricsEngine';

interface SoulprintMetricsWidgetProps {
  userId: string;
  compact?: boolean;
}

export function SoulprintMetricsWidget({ userId, compact = false }: SoulprintMetricsWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [soulprint, setSoulprint] = useState<Soulprint | null>(null);
  const [metrics, setMetrics] = useState<ComprehensiveMetricsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();

    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadMetrics = () => {
    try {
      const sp = soulprintTracker.getSoulprint(userId);
      const m = metricsEngine.generateComprehensiveSnapshot(userId);

      setSoulprint(sp);
      setMetrics(m);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setLoading(false);
    }
  };

  if (loading || !soulprint || !metrics) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-20 right-4 px-4 py-3 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center gap-2"
        title="View your symbolic journey"
      >
        <span className="text-lg">🔮</span>
        {!compact && <span className="text-sm font-medium">Journey</span>}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-2xl z-40 overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔮</span>
          <div>
            <h3 className="font-bold text-sm">Your Journey</h3>
            <p className="text-xs text-purple-100">{metrics.journeyDuration} days</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Growth Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Growth</span>
            <span className="text-lg font-bold text-purple-600">
              {(metrics.growthIndex.overallScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
              style={{ width: `${metrics.growthIndex.overallScore * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.growthIndex.trend === 'ascending' ? '📈 Rising' :
             metrics.growthIndex.trend === 'descending' ? '📉 Falling' : '➡️ Stable'}
          </p>
        </div>

        {/* Current Archetype */}
        {metrics.archetypeCoherence.activeArchetypes.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Active Archetypes</span>
            <div className="flex flex-wrap gap-2">
              {metrics.archetypeCoherence.activeArchetypes.slice(0, 3).map(arch => (
                <span
                  key={arch}
                  className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium"
                >
                  🎭 {arch}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Symbols */}
        {metrics.symbolicEvolution.topSymbols.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Key Symbols</span>
            <div className="space-y-1">
              {metrics.symbolicEvolution.topSymbols.slice(0, 3).map(s => (
                <div key={s.symbol} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">
                    {getElementIcon(s.elementalResonance)} {s.symbol}
                  </span>
                  <span className="text-gray-500">{s.frequency}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotional State */}
        {metrics.emotionalLandscape.dominantEmotions.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Emotions</span>
            <div className="flex flex-wrap gap-1">
              {metrics.emotionalLandscape.dominantEmotions.slice(0, 4).map(e => (
                <span
                  key={e.emotion}
                  className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700"
                >
                  {e.emotion}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Milestones */}
        {soulprint.milestones.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">
              Recent Milestones ({soulprint.milestones.length})
            </span>
            <div className="space-y-2">
              {soulprint.milestones.slice(-2).reverse().map((m, i) => (
                <div key={i} className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                  <div className="font-medium text-gray-800">
                    {getMilestoneIcon(m.type)} {m.type}
                  </div>
                  <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                    {m.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {metrics.alerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <span className="text-sm font-medium text-yellow-800 block mb-2">
              ⚠️ Insights
            </span>
            {metrics.alerts.slice(0, 2).map((alert, i) => (
              <p key={i} className="text-xs text-yellow-700 mb-1">{alert}</p>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {metrics.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <span className="text-sm font-medium text-blue-800 block mb-2">
              💡 Suggestions
            </span>
            {metrics.recommendations.slice(0, 2).map((rec, i) => (
              <p key={i} className="text-xs text-blue-700 mb-1">{rec}</p>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{soulprint.activeSymbols.length}</div>
            <div className="text-xs text-gray-500">Symbols</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{soulprint.milestones.length}</div>
            <div className="text-xs text-gray-500">Milestones</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-teal-600">
              {(metrics.shadowIntegration.integrationScore * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">Shadow</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t text-center">
        <a
          href="/demo/timeline"
          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
        >
          View Full Timeline →
        </a>
      </div>
    </div>
  );
}

function getElementIcon(element?: string): string {
  const icons: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '💨',
    aether: '✨'
  };
  return element ? icons[element] : '🔮';
}

function getMilestoneIcon(type: string): string {
  const icons: Record<string, string> = {
    breakthrough: '⚡',
    threshold: '🚪',
    integration: '🔗',
    'shadow-encounter': '🌑',
    awakening: '🌅'
  };
  return icons[type] || '🌟';
}