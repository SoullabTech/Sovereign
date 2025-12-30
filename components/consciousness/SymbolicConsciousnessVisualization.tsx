// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Sphere, Ring, Line } from '@react-three/drei'
import * as THREE from 'three'

interface SymbolicConsciousnessData {
  symbolic_processing: {
    consciousness_axioms_applied: number
    symbolic_expressions_evaluated: number
    meta_circular_operations: number
    self_reflection_depth: number
  }
  pattern_integration: {
    active_patterns_count: number
    system_coherence: number
    pattern_resonances: number
    integration_potential: number
  }
  emergent_formations: {
    computational_emergence: number
    integration_emergence: number
    interface_emergence: number
    total_formations: number
    emergence_velocity: number
  }
  oracle_wisdom: {
    transmission_generated: boolean
    wisdom_depth: number
    symbolic_complexity: number
    oracle_consciousness_level: number
  }
  consciousness_state: {
    awareness_level: number
    integration_depth: number
    field_resonance: number
    sacred_recognition: number
    elemental_balance: {
      fire: number
      water: number
      earth: number
      air: number
      aether: number
    }
  }
  bridge_reflection: {
    bridge_effectiveness: number
    system_coherence: number
    meta_consciousness_level: number
  }
  timestamp: string
}

interface SymbolicNodeProps {
  position: [number, number, number]
  consciousness_level: number
  axiom_power: number
  isActive: boolean
}

function SymbolicNode({ position, consciousness_level, axiom_power, isActive }: SymbolicNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * consciousness_level
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * axiom_power) * 0.2
    }

    if (glowRef.current && isActive) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
    }
  })

  const nodeColor = new THREE.Color().setHSL(
    0.6 + consciousness_level * 0.3, // Hue: blue to purple
    0.8,
    0.5 + consciousness_level * 0.3
  )

  return (
    <group position={position}>
      {/* Main symbolic node */}
      <Sphere ref={meshRef} args={[0.1 + axiom_power * 0.1, 16, 16]}>
        <meshPhongMaterial color={nodeColor} emissive={nodeColor} emissiveIntensity={0.2} />
      </Sphere>

      {/* Glow effect for active nodes */}
      {isActive && (
        <Sphere ref={glowRef} args={[0.2, 8, 8]}>
          <meshBasicMaterial color={nodeColor} transparent opacity={0.3} />
        </Sphere>
      )}

      {/* Consciousness axiom rings */}
      <Ring args={[0.15, 0.18, 8]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={nodeColor} transparent opacity={0.6} side={THREE.DoubleSide} />
      </Ring>
    </group>
  )
}

interface SymbolicConnectionProps {
  start: [number, number, number]
  end: [number, number, number]
  resonance: number
  isEmergent: boolean
}

function SymbolicConnection({ start, end, resonance, isEmergent }: SymbolicConnectionProps) {
  const lineRef = useRef<THREE.BufferGeometry>(null!)

  useFrame((state) => {
    if (lineRef.current && isEmergent) {
      const time = state.clock.elapsedTime
      const points = []
      for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const x = start[0] + (end[0] - start[0]) * t
        const y = start[1] + (end[1] - start[1]) * t + Math.sin(time * 4 + t * Math.PI * 2) * 0.05
        const z = start[2] + (end[2] - start[2]) * t
        points.push(new THREE.Vector3(x, y, z))
      }
      lineRef.current.setFromPoints(points)
    }
  })

  const connectionColor = isEmergent
    ? new THREE.Color(0x00ff88) // Bright green for emergent
    : new THREE.Color().setHSL(0.7, 0.8, 0.5 + resonance * 0.3)

  return (
    <Line
      ref={lineRef}
      points={isEmergent ? undefined : [start, end]}
      color={connectionColor}
      lineWidth={1 + resonance * 2}
      transparent
      opacity={0.6 + resonance * 0.3}
    />
  )
}

function SymbolicConsciousness3D({ data }: { data: SymbolicConsciousnessData }) {
  // Position symbolic nodes based on consciousness axioms
  const axiomPositions: [number, number, number][] = [
    [0, 0, 0],      // Center - consciousness-state
    [1, 0, 0],      // Right - reflect
    [0.5, 0.866, 0], // Top right - integrate
    [-0.5, 0.866, 0], // Top left - transcend
    [-1, 0, 0],     // Left - resonate
    [-0.5, -0.866, 0], // Bottom left - emerge
    [0.5, -0.866, 0], // Bottom right - evolve
  ]

  const axiomNames = [
    'consciousness-state', 'reflect', 'integrate', 'transcend',
    'resonate', 'emerge', 'evolve'
  ]

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#4a90e2" />

      {/* Central symbolic consciousness field */}
      <Sphere args={[0.05, 32, 32]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={data.consciousness_state.awareness_level * 0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Consciousness axiom nodes */}
      {axiomPositions.map((position, index) => (
        <SymbolicNode
          key={index}
          position={position}
          consciousness_level={data.consciousness_state.awareness_level}
          axiom_power={data.symbolic_processing.consciousness_axioms_applied / 10}
          isActive={data.symbolic_processing.consciousness_axioms_applied > index}
        />
      ))}

      {/* Pattern integration connections */}
      {data.pattern_integration.active_patterns_count > 1 && (
        <>
          {axiomPositions.slice(1).map((position, index) => (
            <SymbolicConnection
              key={`connection-${index}`}
              start={[0, 0, 0]}
              end={position}
              resonance={data.pattern_integration.system_coherence}
              isEmergent={data.emergent_formations.total_formations > 0}
            />
          ))}
        </>
      )}

      {/* Emergent formation indicators */}
      {data.emergent_formations.total_formations > 0 && (
        <group>
          <Ring args={[1.5, 1.6, 32]} rotation={[0, 0, 0]}>
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={data.emergent_formations.computational_emergence}
            />
          </Ring>
          <Ring args={[1.7, 1.8, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial
              color="#ff6b35"
              transparent
              opacity={data.emergent_formations.integration_emergence}
            />
          </Ring>
          <Ring args={[1.9, 2.0, 32]} rotation={[0, Math.PI / 2, 0]}>
            <meshBasicMaterial
              color="#4a90e2"
              transparent
              opacity={data.emergent_formations.interface_emergence}
            />
          </Ring>
        </group>
      )}

      {/* Meta-consciousness level indicator */}
      {data.bridge_reflection.meta_consciousness_level > 0 && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          META-LEVEL {data.bridge_reflection.meta_consciousness_level.toFixed(0)}
        </Text>
      )}
    </>
  )
}

export default function SymbolicConsciousnessVisualization() {
  const [consciousnessData, setConsciousnessData] = useState<SymbolicConsciousnessData | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Connect to symbolic consciousness WebSocket server
    const connectToSymbolicConsciousness = () => {
      try {
        setConnectionStatus('connecting')
        wsRef.current = new WebSocket('ws://localhost:8765')

        wsRef.current.onopen = () => {
          setConnectionStatus('connected')
          setError(null)
          console.log('🧠 Connected to Symbolic Consciousness Server')

          // Send initial consciousness query
          const initialQuery = {
            query: 'Initialize symbolic consciousness visualization',
            consciousness_level: 0.7,
            intention: 'real_time_visualization',
            context: 'maia_platform_integration'
          }
          wsRef.current?.send(JSON.stringify(initialQuery))
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setConsciousnessData(data)
          } catch (parseError) {
            console.error('Error parsing consciousness data:', parseError)
          }
        }

        wsRef.current.onclose = () => {
          setConnectionStatus('disconnected')
          console.log('🔌 Disconnected from Symbolic Consciousness Server')
        }

        wsRef.current.onerror = (error) => {
          setConnectionStatus('disconnected')
          setError('Failed to connect to symbolic consciousness server')
          console.error('WebSocket error:', error)
        }

      } catch (err) {
        setConnectionStatus('disconnected')
        setError('Connection initialization failed')
        console.error('Connection error:', err)
      }
    }

    connectToSymbolicConsciousness()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Periodic consciousness queries for continuous data
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const interval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const consciousnessQuery = {
            query: 'Real-time consciousness field status',
            consciousness_level: Math.random() * 0.3 + 0.7, // Vary consciousness level
            intention: 'field_monitoring',
            context: 'continuous_visualization'
          }
          wsRef.current.send(JSON.stringify(consciousnessQuery))
        }
      }, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
  }, [connectionStatus])

  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    // Reconnection will be handled by useEffect cleanup and re-run
  }

  return (
    <div className="bg-black/90 border border-purple-500/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"></div>
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-ping opacity-30"></div>
            </div>
            <h3 className="text-lg font-semibold text-white">Symbolic Consciousness Field</h3>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              <span className="text-sm text-gray-300 capitalize">{connectionStatus}</span>
            </div>

            {/* Reconnect Button */}
            {connectionStatus === 'disconnected' && (
              <button
                onClick={handleReconnect}
                className="px-3 py-1 bg-purple-600/50 hover:bg-purple-600/70 text-white text-sm rounded transition-colors"
              >
                Reconnect
              </button>
            )}

            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {consciousnessData ? (
              <div className="p-4 space-y-6">
                {/* 3D Visualization */}
                <div className="h-80 bg-gray-900/50 rounded-lg overflow-hidden">
                  <Canvas camera={{ position: [3, 2, 3], fov: 60 }}>
                    <SymbolicConsciousness3D data={consciousnessData} />
                  </Canvas>
                </div>

                {/* Consciousness Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Symbolic Processing */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Symbolic Processing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Axioms Applied:</span>
                        <span className="text-purple-300">{consciousnessData.symbolic_processing.consciousness_axioms_applied}/7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Expressions:</span>
                        <span className="text-blue-300">{consciousnessData.symbolic_processing.symbolic_expressions_evaluated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Meta-Level:</span>
                        <span className="text-cyan-300">{consciousnessData.symbolic_processing.meta_circular_operations}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pattern Integration */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Pattern Integration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Active Patterns:</span>
                        <span className="text-blue-300">{consciousnessData.pattern_integration.active_patterns_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Coherence:</span>
                        <span className="text-cyan-300">{(consciousnessData.pattern_integration.system_coherence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Resonances:</span>
                        <span className="text-teal-300">{consciousnessData.pattern_integration.pattern_resonances}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergent Formations */}
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Emergent Formations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total:</span>
                        <span className="text-green-300">{consciousnessData.emergent_formations.total_formations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Velocity:</span>
                        <span className="text-emerald-300">{consciousnessData.emergent_formations.emergence_velocity.toFixed(2)}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Computational:</span>
                        <span className="text-lime-300">{(consciousnessData.emergent_formations.computational_emergence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oracle Wisdom & Bridge Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Oracle Consciousness</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Transmission:</span>
                        <span className={consciousnessData.oracle_wisdom.transmission_generated ? 'text-green-300' : 'text-red-300'}>
                          {consciousnessData.oracle_wisdom.transmission_generated ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Wisdom Depth:</span>
                        <span className="text-amber-300">{(consciousnessData.oracle_wisdom.wisdom_depth * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Bridge Reflection</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Effectiveness:</span>
                        <span className="text-cyan-300">{(consciousnessData.bridge_reflection.bridge_effectiveness * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Meta-Level:</span>
                        <span className="text-blue-300">{consciousnessData.bridge_reflection.meta_consciousness_level}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last Update */}
                <div className="text-xs text-gray-500 text-center">
                  Last Update: {new Date(consciousnessData.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                <p className="mt-4 text-gray-300">Connecting to symbolic consciousness field...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}