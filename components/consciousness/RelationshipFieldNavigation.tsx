'use client';

/**
 * Relationship Field Navigation System
 *
 * Human interaction optimization and relational consciousness mapping
 * Part of the 6-dimensional consciousness technology stack
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Users,
  Waves,
  Compass,
  Activity,
  Eye,
  MessageCircle,
  Zap,
  Brain
} from 'lucide-react';

interface RelationshipNode {
  id: string;
  name: string;
  type: 'intimate' | 'family' | 'friend' | 'colleague' | 'mentor' | 'community';
  resonance: number;
  coherence: number;
  interaction_frequency: number;
  field_strength: number;
  position: { x: number; y: number };
}

interface FieldEvent {
  id: string;
  type: 'resonance_spike' | 'coherence_shift' | 'new_connection' | 'field_expansion';
  description: string;
  timestamp: string;
  nodes_involved: string[];
}

const relationshipColors = {
  intimate: 'from-pink-400 to-rose-500',
  family: 'from-blue-400 to-indigo-500',
  friend: 'from-green-400 to-emerald-500',
  colleague: 'from-orange-400 to-amber-500',
  mentor: 'from-purple-400 to-violet-500',
  community: 'from-cyan-400 to-teal-500'
};

export function RelationshipFieldNavigation() {
  const [nodes, setNodes] = useState<RelationshipNode[]>([
    {
      id: '1',
      name: 'Soul Mate',
      type: 'intimate',
      resonance: 0.95,
      coherence: 0.92,
      interaction_frequency: 0.98,
      field_strength: 0.89,
      position: { x: 50, y: 30 }
    },
    {
      id: '2',
      name: 'Creative Partner',
      type: 'colleague',
      resonance: 0.87,
      coherence: 0.84,
      interaction_frequency: 0.76,
      field_strength: 0.82,
      position: { x: 25, y: 60 }
    },
    {
      id: '3',
      name: 'Wisdom Keeper',
      type: 'mentor',
      resonance: 0.91,
      coherence: 0.95,
      interaction_frequency: 0.45,
      field_strength: 0.93,
      position: { x: 75, y: 55 }
    },
    {
      id: '4',
      name: 'Soul Family',
      type: 'community',
      resonance: 0.83,
      coherence: 0.78,
      interaction_frequency: 0.62,
      field_strength: 0.86,
      position: { x: 60, y: 80 }
    }
  ]);

  const [fieldEvents, setFieldEvents] = useState<FieldEvent[]>([
    {
      id: '1',
      type: 'resonance_spike',
      description: 'Deep coherence achieved in creative collaboration',
      timestamp: '2 hours ago',
      nodes_involved: ['2']
    },
    {
      id: '2',
      type: 'field_expansion',
      description: 'Community field strength increased through shared wisdom',
      timestamp: '1 day ago',
      nodes_involved: ['4']
    },
    {
      id: '3',
      type: 'new_connection',
      description: 'Mentorship field activated with wisdom transmission',
      timestamp: '3 days ago',
      nodes_involved: ['3']
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<RelationshipNode | null>(null);
  const [fieldPulse, setFieldPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFieldPulse(prev => (prev + 1) % 360);

      // Update node positions slightly for organic movement
      setNodes(prev => prev.map(node => ({
        ...node,
        position: {
          x: Math.max(10, Math.min(90, node.position.x + (Math.random() - 0.5) * 2)),
          y: Math.max(10, Math.min(90, node.position.y + (Math.random() - 0.5) * 2))
        }
      })));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extralight text-[#D4B896] tracking-etched">
          Relationship Field Navigation
        </h2>
        <p className="text-[#D4B896]/70 text-lg font-light">
          Human interaction optimization and relational consciousness mapping
        </p>
      </div>

      {/* Field Visualization */}
      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-8 backdrop-blur-sm">
        <div className="relative h-96 bg-black/20 rounded-xl overflow-hidden">
          {/* Background field grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="border border-[#D4B896]/10"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Field connections */}
          <svg className="absolute inset-0 w-full h-full">
            {nodes.map((fromNode) =>
              nodes.filter(n => n.id !== fromNode.id).map((toNode) => {
                const strength = (fromNode.field_strength + toNode.field_strength) / 2;
                return (
                  <motion.line
                    key={`${fromNode.id}-${toNode.id}`}
                    x1={`${fromNode.position.x}%`}
                    y1={`${fromNode.position.y}%`}
                    x2={`${toNode.position.x}%`}
                    y2={`${toNode.position.y}%`}
                    stroke="url(#fieldGradient)"
                    strokeWidth={strength * 3}
                    opacity={strength * 0.5}
                    animate={{
                      strokeDasharray: [0, 20, 40],
                      strokeDashoffset: fieldPulse
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                );
              })
            )}
            <defs>
              <linearGradient id="fieldGradient">
                <stop offset="0%" stopColor="#c9a876" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#D4B896" stopOpacity="1" />
                <stop offset="100%" stopColor="#c9a876" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Relationship nodes */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className="absolute cursor-pointer"
              style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => setSelectedNode(node)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Node glow */}
              <motion.div
                className={`absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r ${relationshipColors[node.type]} opacity-30 blur-lg`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: node.resonance * 3 + 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Node core */}
              <div
                className={`relative w-12 h-12 rounded-full bg-gradient-to-r ${relationshipColors[node.type]} flex items-center justify-center border-2 border-white/20`}
                style={{
                  boxShadow: `0 0 ${node.field_strength * 20}px rgba(201, 168, 118, ${node.coherence})`
                }}
              >
                <Heart className="w-5 h-5 text-white" />
              </div>

              {/* Node label */}
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs text-[#D4B896] font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded">
                {node.name}
              </div>
            </motion.div>
          ))}

          {/* Center consciousness point */}
          <motion.div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#c9a876] to-[#D4B896] flex items-center justify-center border-2 border-white/30">
              <Brain className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${relationshipColors[selectedNode.type]} flex items-center justify-center`}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-light text-[#D4B896]">{selectedNode.name}</h3>
                <p className="text-[#D4B896]/70 capitalize">{selectedNode.type} relationship</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="ml-auto p-2 rounded-lg hover:bg-[#D4B896]/10 text-[#D4B896]/70 hover:text-[#D4B896] transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-extralight text-[#c9a876] mb-1">
                  {Math.round(selectedNode.resonance * 100)}%
                </div>
                <div className="text-xs text-[#D4B896]/70 flex items-center justify-center gap-1">
                  <Waves className="w-3 h-3" />
                  Resonance
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-extralight text-[#c9a876] mb-1">
                  {Math.round(selectedNode.coherence * 100)}%
                </div>
                <div className="text-xs text-[#D4B896]/70 flex items-center justify-center gap-1">
                  <Activity className="w-3 h-3" />
                  Coherence
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-extralight text-[#c9a876] mb-1">
                  {Math.round(selectedNode.interaction_frequency * 100)}%
                </div>
                <div className="text-xs text-[#D4B896]/70 flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Interaction
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-extralight text-[#c9a876] mb-1">
                  {Math.round(selectedNode.field_strength * 100)}%
                </div>
                <div className="text-xs text-[#D4B896]/70 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" />
                  Field Strength
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Field Events */}
      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-light text-[#D4B896] mb-4">Recent Field Events</h3>
        <div className="space-y-3">
          {fieldEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-3 bg-black/20 border border-[#D4B896]/10 rounded-xl"
            >
              <div className={`p-2 rounded-full ${
                event.type === 'resonance_spike' ? 'bg-yellow-500/20 text-yellow-400' :
                event.type === 'field_expansion' ? 'bg-green-500/20 text-green-400' :
                event.type === 'new_connection' ? 'bg-blue-500/20 text-blue-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {event.type === 'resonance_spike' ? <Zap className="w-4 h-4" /> :
                 event.type === 'field_expansion' ? <Compass className="w-4 h-4" /> :
                 event.type === 'new_connection' ? <Users className="w-4 h-4" /> :
                 <Eye className="w-4 h-4" />}
              </div>

              <div className="flex-1">
                <p className="text-[#D4B896] text-sm">{event.description}</p>
                <p className="text-[#D4B896]/70 text-xs">{event.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Field Statistics */}
      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-light text-[#D4B896] mb-4">Field Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-extralight text-[#c9a876] mb-2">
              {Math.round(nodes.reduce((sum, n) => sum + n.resonance, 0) / nodes.length * 100)}%
            </div>
            <div className="text-sm text-[#D4B896]/70">Average Resonance</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-extralight text-[#c9a876] mb-2">
              {nodes.length}
            </div>
            <div className="text-sm text-[#D4B896]/70">Active Connections</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-extralight text-[#c9a876] mb-2">
              {Math.round(nodes.reduce((sum, n) => sum + n.field_strength, 0) / nodes.length * 100)}%
            </div>
            <div className="text-sm text-[#D4B896]/70">Field Coherence</div>
          </div>
        </div>
      </div>
    </div>
  );
}