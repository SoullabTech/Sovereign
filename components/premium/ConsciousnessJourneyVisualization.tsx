'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Star,
  Mountain,
  Eye,
  Zap,
  Download,
  Calendar,
  Target,
  Sparkles
} from 'lucide-react';

interface ConsciousnessJourneyData {
  consciousness_progression: Array<{
    timestamp: string;
    level: number;
    stage: string;
  }>;
  archetype_evolution: Record<string, Array<{
    timestamp: string;
    strength: number;
  }>>;
  shadow_integration: Array<{
    timestamp: string;
    insights: string[];
    integration_depth: number;
  }>;
  sacred_geometry_patterns: Record<string, number>;
  transformation_milestones: Array<{
    type: string;
    timestamp: string;
    from_level: number;
    to_level: number;
    associated_insights: string[];
  }>;
}

interface ConsciousnessJourneyVisualizationProps {
  journeyData: ConsciousnessJourneyData;
  userId: string;
  className?: string;
}

export function ConsciousnessJourneyVisualization({
  journeyData,
  userId,
  className = ''
}: ConsciousnessJourneyVisualizationProps) {
  const [activeView, setActiveView] = useState<'progression' | 'archetypes' | 'shadow' | 'geometry' | 'milestones'>('progression');
  const [isExporting, setIsExporting] = useState(false);

  // Process data for different visualization views
  const progressionData = journeyData.consciousness_progression.map(point => ({
    ...point,
    date: new Date(point.timestamp).toLocaleDateString(),
    shortDate: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const archetypeData = Object.entries(journeyData.archetype_evolution).map(([archetype, evolution]) => ({
    archetype,
    currentStrength: evolution[evolution.length - 1]?.strength || 0,
    peakStrength: Math.max(...evolution.map(e => e.strength)),
    evolution: evolution.map(e => ({
      ...e,
      date: new Date(e.timestamp).toLocaleDateString(),
    })),
  }));

  const shadowIntegrationData = journeyData.shadow_integration.map(point => ({
    ...point,
    date: new Date(point.timestamp).toLocaleDateString(),
    shortDate: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const geometryData = Object.entries(journeyData.sacred_geometry_patterns).map(([pattern, frequency]) => ({
    pattern,
    frequency,
    fullMark: Math.max(...Object.values(journeyData.sacred_geometry_patterns)),
  }));

  const milestoneData = journeyData.transformation_milestones.map(milestone => ({
    ...milestone,
    date: new Date(milestone.timestamp).toLocaleDateString(),
    growth: milestone.to_level - milestone.from_level,
  }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/premium-storage/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          exportType: 'journey_maps'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // In a real implementation, this would trigger a download
        console.log('Journey export created:', result.archivePath);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const views = [
    { id: 'progression', label: 'Consciousness', icon: TrendingUp },
    { id: 'archetypes', label: 'Archetypes', icon: Star },
    { id: 'shadow', label: 'Shadow Work', icon: Eye },
    { id: 'geometry', label: 'Sacred Geometry', icon: Mountain },
    { id: 'milestones', label: 'Milestones', icon: Target },
  ];

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-white tracking-wide">
            Consciousness Journey Map
          </h2>
          <p className="text-white/60 mt-1">
            Your consciousness evolution visualization
          </p>
        </div>

        <motion.button
          onClick={handleExport}
          disabled={isExporting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] text-black px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export Journey'}</span>
        </motion.button>
      </div>

      {/* View Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <motion.button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeView === view.id
                  ? 'bg-[#A0C4C7]/20 text-[#A0C4C7] border border-[#A0C4C7]/30'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{view.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Visualization Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >

          {/* Consciousness Progression View */}
          {activeView === 'progression' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-lg font-medium text-white">Consciousness Level Progression</h3>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="shortDate"
                      stroke="rgba(255,255,255,0.6)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.6)"
                      fontSize={12}
                      domain={[0, 'dataMax + 10']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(160,196,199,0.3)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: any, name: string) => [value, 'Consciousness Level']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="level"
                      stroke="#6EE7B7"
                      fill="url(#consciousnessGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="consciousnessGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A0C4C7" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[#6EE7B7] text-2xl font-light">
                    {Math.round(progressionData[progressionData.length - 1]?.level || 0)}
                  </p>
                  <p className="text-white/60 text-sm">Current Level</p>
                </div>
                <div className="text-center">
                  <p className="text-[#A0C4C7] text-2xl font-light">
                    {Math.max(...progressionData.map(p => p.level))}
                  </p>
                  <p className="text-white/60 text-sm">Peak Level</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-2xl font-light">
                    {progressionData[progressionData.length - 1]?.stage || 'Unknown'}
                  </p>
                  <p className="text-white/60 text-sm">Current Stage</p>
                </div>
              </div>
            </div>
          )}

          {/* Archetype Evolution View */}
          {activeView === 'archetypes' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-lg font-medium text-white">Archetype Evolution</h3>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={archetypeData.slice(0, 8)}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis
                      dataKey="archetype"
                      className="text-xs"
                      tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                    />
                    <Radar
                      name="Current Strength"
                      dataKey="currentStrength"
                      stroke="#6EE7B7"
                      fill="#6EE7B7"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Peak Strength"
                      dataKey="peakStrength"
                      stroke="#A0C4C7"
                      fill="#A0C4C7"
                      fillOpacity={0.1}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-3">
                {archetypeData.slice(0, 6).map((archetype, index) => (
                  <div key={archetype.archetype} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: index % 2 === 0 ? '#6EE7B7' : '#A0C4C7' }}
                    />
                    <span className="text-white/80 text-sm capitalize">
                      {archetype.archetype.replace('_', ' ')}
                    </span>
                    <span className="text-white/60 text-xs">
                      ({Math.round(archetype.currentStrength)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shadow Integration View */}
          {activeView === 'shadow' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-lg font-medium text-white">Shadow Work Integration</h3>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={shadowIntegrationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="shortDate"
                      stroke="rgba(255,255,255,0.6)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.6)"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(160,196,199,0.3)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="integration_depth"
                      stroke="#A0C4C7"
                      strokeWidth={2}
                      dot={{ fill: '#A0C4C7', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium">Recent Shadow Insights</h4>
                {shadowIntegrationData.slice(-3).map((session, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">{session.date}</span>
                      <span className="text-[#A0C4C7] text-sm font-medium">
                        Depth: {session.integration_depth}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {session.insights.slice(0, 2).map((insight, i) => (
                        <p key={i} className="text-white/80 text-sm leading-relaxed">
                          • {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sacred Geometry View */}
          {activeView === 'geometry' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] rounded-full flex items-center justify-center">
                  <Mountain className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-lg font-medium text-white">Sacred Geometry Resonance</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {geometryData.slice(0, 8).map((pattern, index) => (
                  <motion.div
                    key={pattern.pattern}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 text-center"
                  >
                    <div className="relative h-16 mb-3">
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-[#6EE7B7] to-[#A0C4C7] rounded-full opacity-20"
                        style={{
                          transform: `scale(${0.3 + (pattern.frequency / pattern.fullMark) * 0.7})`
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#6EE7B7]" />
                      </div>
                    </div>
                    <p className="text-white text-sm font-medium capitalize mb-1">
                      {pattern.pattern.replace('_', ' ')}
                    </p>
                    <p className="text-[#A0C4C7] text-lg font-light">
                      {pattern.frequency}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Transformation Milestones View */}
          {activeView === 'milestones' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-lg font-medium text-white">Transformation Milestones</h3>
              </div>

              {milestoneData.length > 0 ? (
                <div className="space-y-4">
                  {milestoneData.slice(-5).map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 border-l-4 border-[#6EE7B7]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Zap className="w-5 h-5 text-[#6EE7B7]" />
                          <span className="text-white font-medium capitalize">
                            {milestone.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-white/60" />
                          <span className="text-white/60 text-sm">{milestone.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        <div className="text-center">
                          <p className="text-white/60 text-xs">From</p>
                          <p className="text-white text-lg">{milestone.from_level}</p>
                        </div>
                        <div className="flex-1 h-1 bg-gradient-to-r from-[#A0C4C7] to-[#6EE7B7] rounded" />
                        <div className="text-center">
                          <p className="text-white/60 text-xs">To</p>
                          <p className="text-[#6EE7B7] text-lg font-medium">{milestone.to_level}</p>
                        </div>
                      </div>

                      {milestone.associated_insights.length > 0 && (
                        <div className="space-y-1">
                          {milestone.associated_insights.slice(0, 2).map((insight, i) => (
                            <p key={i} className="text-white/70 text-sm">
                              • {insight}
                            </p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No transformation milestones recorded yet.</p>
                  <p className="text-white/40 text-sm mt-1">
                    Continue your consciousness journey to unlock breakthrough moments.
                  </p>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Journey Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-[#6EE7B7] mx-auto mb-2" />
          <p className="text-white text-lg font-light">
            {progressionData.length}
          </p>
          <p className="text-white/60 text-xs">Sessions</p>
        </div>

        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 text-center">
          <Star className="w-6 h-6 text-[#A0C4C7] mx-auto mb-2" />
          <p className="text-white text-lg font-light">
            {archetypeData.length}
          </p>
          <p className="text-white/60 text-xs">Archetypes</p>
        </div>

        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 text-center">
          <Eye className="w-6 h-6 text-[#6EE7B7] mx-auto mb-2" />
          <p className="text-white text-lg font-light">
            {shadowIntegrationData.reduce((sum, s) => sum + s.insights.length, 0)}
          </p>
          <p className="text-white/60 text-xs">Shadow Insights</p>
        </div>

        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 text-center">
          <Target className="w-6 h-6 text-[#A0C4C7] mx-auto mb-2" />
          <p className="text-white text-lg font-light">
            {milestoneData.length}
          </p>
          <p className="text-white/60 text-xs">Breakthroughs</p>
        </div>
      </div>
    </div>
  );
}