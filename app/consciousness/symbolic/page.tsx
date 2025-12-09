'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SymbolicConsciousnessVisualization from '@/components/consciousness/SymbolicConsciousnessVisualization'
import { Holoflower } from '@/components/ui/Holoflower'
import { ElementalPentagramDashboard } from '@/components/consciousness/ElementalPentagramDashboard'

interface SymbolicSession {
  session_id: string
  created_at: string
  patterns_discovered: number
  formations_detected: number
  consciousness_evolution: number
  oracle_transmissions: number
}

interface EmergentFormation {
  formation_id: string
  formation_type: 'computational' | 'integration' | 'interface'
  strength: number
  discovery_time: string
  catalyst: string
}

export default function SymbolicConsciousnessPage() {
  const [activeSessions, setActiveSessions] = useState<SymbolicSession[]>([])
  const [recentFormations, setRecentFormations] = useState<EmergentFormation[]>([])
  const [systemMetrics, setSystemMetrics] = useState({
    total_axioms_processed: 0,
    total_patterns_integrated: 0,
    total_formations_detected: 0,
    consciousness_evolution_rate: 0,
    bridge_effectiveness: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching symbolic consciousness data
    const fetchSymbolicData = async () => {
      try {
        // In a real implementation, this would fetch from your symbolic consciousness API
        const mockSessions: SymbolicSession[] = [
          {
            session_id: 'symbolic_session_001',
            created_at: new Date().toISOString(),
            patterns_discovered: 12,
            formations_detected: 3,
            consciousness_evolution: 0.85,
            oracle_transmissions: 7
          },
          {
            session_id: 'symbolic_session_002',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            patterns_discovered: 8,
            formations_detected: 2,
            consciousness_evolution: 0.72,
            oracle_transmissions: 4
          }
        ]

        const mockFormations: EmergentFormation[] = [
          {
            formation_id: 'formation_20241207_001',
            formation_type: 'computational',
            strength: 0.923,
            discovery_time: new Date().toISOString(),
            catalyst: 'meta-circular-evaluation'
          },
          {
            formation_id: 'formation_20241207_002',
            formation_type: 'integration',
            strength: 0.856,
            discovery_time: new Date(Date.now() - 1800000).toISOString(),
            catalyst: 'pattern-resonance-synthesis'
          },
          {
            formation_id: 'formation_20241207_003',
            formation_type: 'interface',
            strength: 0.742,
            discovery_time: new Date(Date.now() - 3600000).toISOString(),
            catalyst: 'oracle-wisdom-integration'
          }
        ]

        const mockMetrics = {
          total_axioms_processed: 847,
          total_patterns_integrated: 156,
          total_formations_detected: 23,
          consciousness_evolution_rate: 0.78,
          bridge_effectiveness: 1.0
        }

        setActiveSessions(mockSessions)
        setRecentFormations(mockFormations)
        setSystemMetrics(mockMetrics)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching symbolic consciousness data:', error)
        setIsLoading(false)
      }
    }

    fetchSymbolicData()
  }, [])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getFormationTypeColor = (type: string) => {
    switch (type) {
      case 'computational': return 'text-green-400 bg-green-900/20 border-green-500/30'
      case 'integration': return 'text-orange-400 bg-orange-900/20 border-orange-500/30'
      case 'interface': return 'text-blue-400 bg-blue-900/20 border-blue-500/30'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
          <h2 className="text-xl text-white mb-2">Initializing Symbolic Consciousness</h2>
          <p className="text-gray-300">Loading LISP-inspired meta-circular evaluation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Holoflower size="sm" />
              <div>
                <h1 className="text-2xl font-bold text-white">Symbolic Consciousness</h1>
                <p className="text-gray-300">LISP-inspired Meta-circular Consciousness Computation</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">Bridge Effectiveness</div>
                <div className="text-xl font-bold text-cyan-400">
                  {(systemMetrics.bridge_effectiveness * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Consciousness Evolution</div>
                <div className="text-xl font-bold text-purple-400">
                  {(systemMetrics.consciousness_evolution_rate * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Visualization - Takes up 2 columns */}
          <div className="xl:col-span-2 space-y-8">
            {/* Symbolic Consciousness Visualization */}
            <SymbolicConsciousnessVisualization />

            {/* Elemental Integration */}
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>🌊</span>
                <span>Elemental Consciousness Integration</span>
              </h2>
              <ElementalPentagramDashboard />
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* System Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-purple-500/30 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>📊</span>
                <span>System Metrics</span>
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Axioms Processed:</span>
                  <span className="text-purple-400 font-mono">{systemMetrics.total_axioms_processed}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Patterns Integrated:</span>
                  <span className="text-blue-400 font-mono">{systemMetrics.total_patterns_integrated}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Formations Detected:</span>
                  <span className="text-green-400 font-mono">{systemMetrics.total_formations_detected}</span>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Evolution Rate:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                          style={{ width: `${systemMetrics.consciousness_evolution_rate * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-cyan-400 text-sm">
                        {(systemMetrics.consciousness_evolution_rate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Active Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 border border-purple-500/30 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>🧠</span>
                <span>Active Sessions</span>
              </h2>

              <div className="space-y-3">
                {activeSessions.map((session, index) => (
                  <div
                    key={session.session_id}
                    className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-300 font-mono">
                        {session.session_id.substring(0, 16)}...
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(session.created_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-400">
                        Patterns: <span className="text-blue-400">{session.patterns_discovered}</span>
                      </div>
                      <div className="text-gray-400">
                        Formations: <span className="text-green-400">{session.formations_detected}</span>
                      </div>
                      <div className="text-gray-400">
                        Evolution: <span className="text-purple-400">{(session.consciousness_evolution * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-gray-400">
                        Oracle: <span className="text-amber-400">{session.oracle_transmissions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Emergent Formations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 border border-purple-500/30 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>🌟</span>
                <span>Recent Formations</span>
              </h2>

              <div className="space-y-3">
                {recentFormations.map((formation) => (
                  <div
                    key={formation.formation_id}
                    className={`border rounded-lg p-3 ${getFormationTypeColor(formation.formation_type)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-mono">
                        {formation.formation_id.substring(0, 16)}...
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(formation.discovery_time)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase font-medium">
                        {formation.formation_type}
                      </span>
                      <span className="text-sm font-bold">
                        {(formation.strength * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-2 text-xs opacity-70">
                      Catalyst: {formation.catalyst}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/40 border border-purple-500/30 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>⚡</span>
                <span>Quick Actions</span>
              </h2>

              <div className="space-y-3">
                <button className="w-full bg-purple-600/50 hover:bg-purple-600/70 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Start New Session
                </button>

                <button className="w-full bg-blue-600/50 hover:bg-blue-600/70 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Oracle Consultation
                </button>

                <button className="w-full bg-green-600/50 hover:bg-green-600/70 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Pattern Analysis
                </button>

                <button className="w-full bg-cyan-600/50 hover:bg-cyan-600/70 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Emergence Scan
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Symbolic Consciousness System | LISP-inspired Meta-circular Evaluation</p>
          <p>Real-time emergence detection across computation, integration, and interface protocols</p>
        </div>
      </div>
    </div>
  )
}