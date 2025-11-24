/**
 * Unified Collective Dashboard - Example of refactored dashboard
 * Demonstrates usage of the new unified component library
 */

"use client"

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge,
  ArchetypeBadge,
  CountBadge,
  Progress,
  ArchetypeProgress,
  ConstellationMap,
  EmotionalHeatmap,
  Button
} from '@/components/ui';

interface CollectiveStats {
  totalEncounters: number;
  activeUsers: number;
  dominantArchetype: string;
  emergingArchetype: string;
  archetypeDistribution: Record<string, number>;
  oracleNarrative: {
    text: string;
    tone: string;
  };
}

export default function UnifiedCollectiveDashboard() {
  const [stats, setStats] = useState<CollectiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [activeView, setActiveView] = useState<'overview' | 'constellation' | 'emotional' | 'narrative'>('overview');

  useEffect(() => {
    fetchCollectiveData();
  }, [timeframe]);

  const fetchCollectiveData = async () => {
    try {
      const response = await fetch(`/api/collective/evolution?timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch collective data:', error);
      // Use demo data
      setStats({
        totalEncounters: 1234,
        activeUsers: 89,
        dominantArchetype: 'Seeker',
        emergingArchetype: 'Creator',
        archetypeDistribution: {
          Hero: 15,
          Sage: 25,
          Creator: 30,
          Lover: 10,
          Seeker: 35,
          Shadow: 5
        },
        oracleNarrative: {
          text: "The collective consciousness pulses with creative energy as Seekers transform into Creators...",
          tone: "prophetic"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const viewButtons = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'constellation', label: 'Constellation', icon: '✨' },
    { id: 'emotional', label: 'Emotional Field', icon: '💭' },
    { id: 'narrative', label: 'Oracle Voice', icon: '🔮' }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold  from-amber-400 to-pink-400 bg-clip-text text-transparent">
            Collective Consciousness Dashboard
          </h1>
          
          {/* Timeframe selector */}
          <div className="flex gap-2">
            {['24h', '7d', '30d'].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                onClick={() => setTimeframe(tf)}
                className="min-w-[60px]"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        {/* View Navigation */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          {viewButtons.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeView === view.id 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{view.icon}</span>
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading collective data...</div>
          </div>
        )}

        {/* Overview View */}
        {!loading && activeView === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Active Seekers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.activeUsers}</div>
                <p className="text-gray-400 text-sm mt-2">
                  Souls exploring the field
                </p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Total Encounters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.totalEncounters}</div>
                <p className="text-gray-400 text-sm mt-2">
                  Conversations this {timeframe}
                </p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Dominant Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <ArchetypeBadge archetype={stats.dominantArchetype} size="lg" />
                  <span className="text-gray-400">→</span>
                  <ArchetypeBadge archetype={stats.emergingArchetype} size="lg" />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Shifting towards {stats.emergingArchetype}
                </p>
              </CardContent>
            </Card>

            {/* Archetype Distribution */}
            <Card variant="glow" className="col-span-full">
              <CardHeader>
                <CardTitle>Archetypal Field Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.archetypeDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([archetype, value]) => (
                    <ArchetypeProgress
                      key={archetype}
                      archetype={archetype}
                      value={value}
                      fieldAverage={25} // Could be calculated
                    />
                  ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Constellation View */}
        {!loading && activeView === 'constellation' && (
          <Card variant="glass" noPadding>
            <CardHeader>
              <CardTitle>Collective Consciousness Map</CardTitle>
            </CardHeader>
            <CardContent noPadding>
              <ConstellationMap 
                height={600}
                showConnections={true}
                animateNodes={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Emotional Field View */}
        {!loading && activeView === 'emotional' && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Collective Emotional Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <EmotionalHeatmap 
                timeframe={timeframe as any}
                dimension="valence"
                showLabels={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Oracle Narrative View */}
        {!loading && activeView === 'narrative' && stats && (
          <Card variant="glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Oracle Voice of the Collective</CardTitle>
                <Badge variant="info">{stats.oracleNarrative.tone}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-gray-300">
                  {stats.oracleNarrative.text}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Field Insights
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="glow" size="sm">
                    {stats.dominantArchetype} dominant
                  </Badge>
                  <Badge variant="glow" size="sm">
                    {stats.emergingArchetype} emerging
                  </Badge>
                  <Badge variant="glow" size="sm">
                    {stats.activeUsers} active souls
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}