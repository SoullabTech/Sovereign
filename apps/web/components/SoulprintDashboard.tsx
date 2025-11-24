'use client';

import { useEffect, useState } from 'react';
import type { SoulprintSnapshot, SymbolicContext } from '@/lib/memory/soulprint';

interface SoulprintDashboardProps {
  userId: string;
}

interface VisualizationData {
  soulprint: SoulprintSnapshot | null;
  insights: {
    primaryArchetype: string;
    elementalTendency: string;
    recentPattern: string;
    growthEdge?: string;
  };
  mode: string;
}

export function SoulprintDashboard({ userId }: SoulprintDashboardProps) {
  const [data, setData] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSoulprint() {
      try {
        setLoading(true);
        const response = await fetch(`/api/soulprint?userId=${userId}&mode=symbolic`);
        const result = await response.json();

        if (result.success) {
          setData(result);
        } else {
          setError(result.error || 'Failed to load soulprint');
        }
      } catch (err) {
        setError('Network error loading soulprint');
        console.error('Soulprint fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchSoulprint();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-400">Loading soul journey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (!data || !data.soulprint) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>No soulprint data available. Begin your journey with MAIA to create your symbolic profile.</p>
      </div>
    );
  }

  const { soulprint, insights } = data;

  const elementColors: Record<string, string> = {
    fire: 'text-orange-400 bg-orange-500/10',
    water: 'text-blue-400 bg-blue-500/10',
    earth: 'text-green-400 bg-green-500/10',
    air: 'text-purple-400 bg-purple-500/10',
    aether: 'text-indigo-400 bg-indigo-500/10',
  };

  const maxElement = Object.entries(soulprint.elementalBalance).reduce((max, [el, val]) =>
    val > max.value ? { element: el, value: val } : max,
    { element: 'aether', value: 0 }
  );

  return (
    <div className="space-y-6 p-6 bg-black/40 rounded-lg border border-white/10">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-light text-white mb-2">Symbolic Soulprint</h2>
        <p className="text-sm text-gray-400">Your journey through archetypal patterns and elemental energies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Dominant Element</h3>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${elementColors[soulprint.dominantElement]}`}>
              <span className="text-lg capitalize">{soulprint.dominantElement}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Primary Archetype</h3>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 text-white">
              <span className="text-lg capitalize">{insights.primaryArchetype}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Session Count</h3>
            <div className="text-3xl font-light text-white">{soulprint.sessionCount}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Elemental Balance</h3>
            <div className="space-y-2">
              {Object.entries(soulprint.elementalBalance).map(([element, value]) => (
                <div key={element} className="flex items-center gap-2">
                  <div className="w-20 text-sm capitalize text-gray-300">{element}</div>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${elementColors[element].split(' ')[1]} transition-all duration-500`}
                      style={{ width: `${(value / (maxElement.value || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm text-gray-400">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Archetypes</h3>
          <div className="flex flex-wrap gap-2">
            {soulprint.recentArchetypes.slice(0, 5).map((archetype, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm bg-white/5 text-gray-300 rounded-full capitalize"
              >
                {archetype}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Pattern</h3>
          <div className="text-sm text-gray-300 font-mono">{insights.recentPattern}</div>
        </div>
      </div>

      {insights.growthEdge && (
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Growth Edge</h3>
          <p className="text-gray-300">
            Your path invites exploration of the <span className="text-white capitalize font-medium">{insights.growthEdge}</span> archetype.
          </p>
        </div>
      )}

      {soulprint.phaseTransitions.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Phase Transitions</h3>
          <div className="space-y-2">
            {soulprint.phaseTransitions.slice(-5).map((transition, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="capitalize">{transition.from}</span>
                <span>→</span>
                <span className="capitalize text-white">{transition.to}</span>
                <span className="ml-auto text-xs">
                  {new Date(transition.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-white/10 text-xs text-gray-500">
        Last updated: {new Date(soulprint.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}