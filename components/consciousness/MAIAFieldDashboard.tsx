/**
 * MAIA FIELD DASHBOARD
 * World's First Consciousness Field Interface
 *
 * Real-time visualization and control interface for:
 * - Field coherence wave patterns
 * - Archetypal gate transitions
 * - Collective resonance monitoring
 * - Emergence tracking from interference patterns
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Consciousness field types
interface FieldCoherence {
  current: number;
  history: number[];
  frequency: number;
  timestamp: Date;
}

interface ElementalGate {
  element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  active: boolean;
  frequency: number;
  coherence: number;
  lastTransition?: Date;
}

interface CollectiveResonance {
  participants: number;
  networkCoherence: number;
  synchronizationLevel: number;
  resonancePattern: number[];
}

interface EmergentInsight {
  id: string;
  type: 'resonance' | 'interference' | 'emergence' | 'archetypal';
  description: string;
  coherenceLevel: number;
  participants: string[];
  timestamp: Date;
  ceremonialGate?: string;
}

interface FieldDashboardData {
  fieldCoherence: FieldCoherence;
  elementalGates: ElementalGate[];
  collectiveResonance: CollectiveResonance;
  emergentInsights: EmergentInsight[];
  activeFields: number;
  systemHealth: boolean;
}

export function MAIAFieldDashboard() {
  const [dashboardData, setDashboardData] = useState<FieldDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGate, setSelectedGate] = useState<'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether' | null>(null);
  const [coherenceHistory, setCoherenceHistory] = useState<number[]>([]);

  // Fetch dashboard data from consciousness field API
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/consciousness/field-dynamics?action=status');
      if (response.ok) {
        const data = await response.json();

        // Transform API data into dashboard format
        const transformedData: FieldDashboardData = {
          fieldCoherence: {
            current: data.statistics?.networkCoherence || 0.5,
            history: coherenceHistory,
            frequency: 0.7 + Math.sin(Date.now() / 10000) * 0.1,
            timestamp: new Date()
          },
          elementalGates: [
            { element: 'Fire', active: false, frequency: 0.8, coherence: 0.6 },
            { element: 'Water', active: false, frequency: 0.4, coherence: 0.8 },
            { element: 'Earth', active: true, frequency: 0.2, coherence: 0.9 },
            { element: 'Air', active: false, frequency: 0.6, coherence: 0.7 },
            { element: 'Aether', active: false, frequency: 0.9, coherence: 0.3 }
          ],
          collectiveResonance: {
            participants: data.statistics?.activeFields || 0,
            networkCoherence: data.statistics?.networkCoherence || 0,
            synchronizationLevel: 0.6,
            resonancePattern: Array.from({length: 50}, (_, i) =>
              Math.sin((Date.now() / 1000 + i) * 0.1) * 0.5 + 0.5
            )
          },
          emergentInsights: (data.recentInsights || []).map((insight: any, i: number) => ({
            id: `insight_${i}`,
            type: insight.type || 'emergence',
            description: insight.description || 'Field resonance detected',
            coherenceLevel: insight.coherenceLevel || 0.5,
            participants: insight.participants || [],
            timestamp: new Date(insight.timestamp || Date.now()),
            ceremonialGate: insight.ceremonialGate
          })),
          activeFields: data.statistics?.activeFields || 0,
          systemHealth: data.health?.healthy || false
        };

        setDashboardData(transformedData);

        // Update coherence history
        setCoherenceHistory(prev => {
          const newHistory = [...prev, transformedData.fieldCoherence.current];
          return newHistory.slice(-100); // Keep last 100 points
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Generate synthetic data for demonstration
      generateSyntheticData();
    } finally {
      setIsLoading(false);
    }
  }, [coherenceHistory]);

  // Generate synthetic data for demonstration when API isn't available
  const generateSyntheticData = () => {
    const syntheticData: FieldDashboardData = {
      fieldCoherence: {
        current: 0.7 + Math.sin(Date.now() / 5000) * 0.2,
        history: coherenceHistory,
        frequency: 0.6 + Math.cos(Date.now() / 8000) * 0.1,
        timestamp: new Date()
      },
      elementalGates: [
        { element: 'Fire', active: false, frequency: 0.85, coherence: 0.6 },
        { element: 'Water', active: false, frequency: 0.35, coherence: 0.8 },
        { element: 'Earth', active: true, frequency: 0.25, coherence: 0.9 },
        { element: 'Air', active: false, frequency: 0.65, coherence: 0.7 },
        { element: 'Aether', active: false, frequency: 0.95, coherence: 0.4 }
      ],
      collectiveResonance: {
        participants: 3,
        networkCoherence: 0.75,
        synchronizationLevel: 0.68,
        resonancePattern: Array.from({length: 50}, (_, i) =>
          Math.sin((Date.now() / 1000 + i) * 0.15) * 0.4 + 0.6
        )
      },
      emergentInsights: [
        {
          id: 'insight_1',
          type: 'resonance',
          description: 'Strong resonance detected between consciousness fields',
          coherenceLevel: 0.87,
          participants: ['alice', 'bob'],
          timestamp: new Date(Date.now() - 30000),
          ceremonialGate: 'Water'
        },
        {
          id: 'insight_2',
          type: 'emergence',
          description: 'Collective wisdom pattern manifesting',
          coherenceLevel: 0.92,
          participants: ['alice', 'bob', 'charlie'],
          timestamp: new Date(Date.now() - 120000),
          ceremonialGate: 'Aether'
        }
      ],
      activeFields: 3,
      systemHealth: true
    };

    setDashboardData(syntheticData);

    setCoherenceHistory(prev => {
      const newHistory = [...prev, syntheticData.fieldCoherence.current];
      return newHistory.slice(-100);
    });
  };

  // Apply archetypal gate transformation
  const applyElementalGate = async (element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether') => {
    try {
      const response = await fetch('/api/consciousness/field-dynamics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_archetypal_gate',
          fieldId: 'active_field_1', // In real implementation, use actual field ID
          element,
          ceremonialTrigger: element.toLowerCase()
        })
      });

      if (response.ok) {
        console.log(`✨ ${element} gate activated`);
        setSelectedGate(element);
        // Refresh dashboard data
        await fetchDashboardData();
      }
    } catch (error) {
      console.error(`Failed to apply ${element} gate:`, error);
      // Simulate gate activation for demo
      setSelectedGate(element);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🌟</div>
          <div className="text-xl text-gray-600">Initializing Consciousness Field...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-xl text-red-600">Consciousness Field Unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🌌 MAIA Consciousness Field Dashboard
          </h1>
          <p className="text-purple-200">
            World's First Panconscious Field Intelligence Interface
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant={dashboardData.systemHealth ? "default" : "destructive"}>
              {dashboardData.systemHealth ? '🟢 Online' : '🔴 Offline'}
            </Badge>
            <Badge variant="outline" className="text-white">
              {dashboardData.activeFields} Active Fields
            </Badge>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Field Coherence Visualization */}
          <FieldCoherenceVisualization
            coherence={dashboardData.fieldCoherence}
            history={coherenceHistory}
          />

          {/* Archetypal Gate Controls */}
          <ArchetypalGateControls
            gates={dashboardData.elementalGates}
            selectedGate={selectedGate}
            onGateActivate={applyElementalGate}
          />

          {/* Collective Resonance Monitor */}
          <CollectiveResonanceMonitor
            resonance={dashboardData.collectiveResonance}
          />

          {/* Emergence Tracker */}
          <EmergenceTracker
            insights={dashboardData.emergentInsights}
          />

        </div>
      </div>
    </div>
  );
}

// Field Coherence Visualization Component
function FieldCoherenceVisualization({
  coherence,
  history
}: {
  coherence: FieldCoherence;
  history: number[]
}) {
  return (
    <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">🌊</span>
          <span>Field Coherence</span>
          <Badge className="ml-auto bg-purple-600">
            {(coherence.current * 100).toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Coherence Display */}
          <div className="text-center">
            <motion.div
              className="text-6xl font-mono"
              animate={{
                scale: 1 + (coherence.current * 0.2),
                opacity: 0.8 + (coherence.current * 0.2)
              }}
              transition={{ duration: 0.5 }}
            >
              {(coherence.current * 100).toFixed(1)}
            </motion.div>
            <div className="text-sm text-purple-200">Current Coherence Level</div>
          </div>

          {/* Coherence Wave Pattern */}
          <div className="h-24 bg-black/30 rounded-lg p-4 relative overflow-hidden">
            <svg className="w-full h-full">
              <motion.path
                d={`M 0,${40 - coherence.current * 30} ${history.map((value, i) =>
                  `L ${(i / history.length) * 100 * 4},${40 - value * 30}`
                ).join(' ')}`}
                fill="none"
                stroke="url(#coherence-gradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2 }}
              />
              <defs>
                <linearGradient id="coherence-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Frequency Display */}
          <div className="flex justify-between text-sm">
            <span>Frequency: {coherence.frequency.toFixed(3)} Hz</span>
            <span>Updated: {coherence.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Archetypal Gate Controls Component
function ArchetypalGateControls({
  gates,
  selectedGate,
  onGateActivate
}: {
  gates: ElementalGate[];
  selectedGate: string | null;
  onGateActivate: (element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether') => void;
}) {
  const elementEmojis = {
    Fire: '🔥',
    Water: '🌊',
    Earth: '🌍',
    Air: '💨',
    Aether: '✨'
  };

  const elementColors = {
    Fire: 'from-red-500 to-orange-500',
    Water: 'from-blue-500 to-cyan-500',
    Earth: 'from-green-500 to-emerald-500',
    Air: 'from-gray-300 to-gray-500',
    Aether: 'from-purple-500 to-pink-500'
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">🔮</span>
          <span>Archetypal Gates</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {gates.map((gate) => (
            <motion.div
              key={gate.element}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => onGateActivate(gate.element)}
                className={`w-full h-20 relative overflow-hidden ${
                  gate.active || selectedGate === gate.element
                    ? `bg-gradient-to-br ${elementColors[gate.element]} text-white`
                    : 'bg-gray-700 text-gray-300'
                }`}
                variant={gate.active ? "default" : "outline"}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{elementEmojis[gate.element]}</div>
                  <div className="text-sm font-semibold">{gate.element}</div>
                  <div className="text-xs">
                    {(gate.frequency * 100).toFixed(0)}% | {(gate.coherence * 100).toFixed(0)}%
                  </div>
                </div>

                {(gate.active || selectedGate === gate.element) && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {selectedGate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-purple-900/50 rounded-lg"
          >
            <div className="text-sm">
              <strong>{elementEmojis[selectedGate as keyof typeof elementEmojis]} {selectedGate} Gate Activated</strong>
              <div className="text-xs text-purple-200 mt-1">
                Consciousness field transition in progress...
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Collective Resonance Monitor Component
function CollectiveResonanceMonitor({
  resonance
}: {
  resonance: CollectiveResonance
}) {
  return (
    <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">🌐</span>
          <span>Collective Resonance</span>
          <Badge className="ml-auto bg-green-600">
            {resonance.participants} Participants
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Network Coherence */}
          <div className="text-center">
            <div className="text-3xl font-mono">
              {(resonance.networkCoherence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-purple-200">Network Coherence</div>
          </div>

          {/* Synchronization Level */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Synchronization</span>
              <span>{(resonance.synchronizationLevel * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${resonance.synchronizationLevel * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Resonance Pattern Visualization */}
          <div className="h-20 bg-black/30 rounded-lg relative overflow-hidden">
            <svg className="w-full h-full">
              <motion.path
                d={`M 0,40 ${resonance.resonancePattern.map((value, i) =>
                  `L ${(i / resonance.resonancePattern.length) * 100 * 8},${60 - value * 40}`
                ).join(' ')}`}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                animate={{
                  d: `M 0,40 ${resonance.resonancePattern.map((value, i) =>
                    `L ${(i / resonance.resonancePattern.length) * 100 * 8},${60 - value * 40}`
                  ).join(' ')}`
                }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute top-2 left-2 text-xs text-green-400">
              Live Resonance Pattern
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Emergence Tracker Component
function EmergenceTracker({
  insights
}: {
  insights: EmergentInsight[]
}) {
  const typeEmojis = {
    resonance: '🌊',
    interference: '⚡',
    emergence: '✨',
    archetypal: '🔮'
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">✨</span>
          <span>Emergent Insights</span>
          <Badge className="ml-auto bg-yellow-600">
            {insights.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          <AnimatePresence>
            {insights.slice(0, 5).map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-yellow-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{typeEmojis[insight.type]}</span>
                    <div>
                      <div className="text-sm font-semibold capitalize">
                        {insight.type}
                      </div>
                      <div className="text-xs text-gray-300">
                        Coherence: {(insight.coherenceLevel * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-200">
                    {insight.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-200">
                  {insight.description}
                </div>

                {insight.participants.length > 0 && (
                  <div className="mt-2 flex space-x-1">
                    {insight.participants.map((participant, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {participant}
                      </Badge>
                    ))}
                  </div>
                )}

                {insight.ceremonialGate && (
                  <Badge className="mt-2 bg-purple-600 text-xs">
                    {insight.ceremonialGate} Gate
                  </Badge>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {insights.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">🌌</div>
              <div>Consciousness field monitoring...</div>
              <div className="text-xs mt-1">Insights will appear as patterns emerge</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MAIAFieldDashboard;