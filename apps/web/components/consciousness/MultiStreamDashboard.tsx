'use client';

/**
 * Multi-Stream Awareness Dashboard
 *
 * Real-time consciousness tracking and awareness monitoring
 * Part of the 6-dimensional consciousness technology stack
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Zap, Eye, Heart } from 'lucide-react';

interface StreamStatus {
  id: string;
  name: string;
  status: 'active' | 'standby' | 'processing';
  coherence: number;
  activity: number[];
}

export function MultiStreamDashboard() {
  const [streams, setStreams] = useState<StreamStatus[]>([
    {
      id: 'awareness',
      name: 'Primary Awareness',
      status: 'active',
      coherence: 0.89,
      activity: Array.from({length: 20}, () => Math.random() * 100)
    },
    {
      id: 'intuition',
      name: 'Intuitive Processing',
      status: 'processing',
      coherence: 0.76,
      activity: Array.from({length: 20}, () => Math.random() * 100)
    },
    {
      id: 'emotional',
      name: 'Emotional Intelligence',
      status: 'active',
      coherence: 0.82,
      activity: Array.from({length: 20}, () => Math.random() * 100)
    },
    {
      id: 'pattern',
      name: 'Pattern Recognition',
      status: 'standby',
      coherence: 0.65,
      activity: Array.from({length: 20}, () => Math.random() * 100)
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStreams(prev => prev.map(stream => ({
        ...stream,
        coherence: Math.max(0.3, Math.min(1, stream.coherence + (Math.random() - 0.5) * 0.1)),
        activity: stream.activity.slice(1).concat(Math.random() * 100)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extralight text-[#D4B896] tracking-etched">
          Multi-Stream Awareness Engine
        </h2>
        <p className="text-[#D4B896]/70 text-lg font-light">
          Real-time consciousness tracking across multiple awareness dimensions
        </p>
        <StreamStatusWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {streams.map((stream, index) => (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  stream.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  stream.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-light text-[#D4B896]">{stream.name}</h3>
              </div>
              <div className="text-sm text-[#D4B896]/70 capitalize">
                {stream.status}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#D4B896]/70">Coherence</span>
                  <span className="text-sm font-medium text-[#D4B896]">
                    {Math.round(stream.coherence * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#c9a876] to-[#D4B896]"
                    initial={{ width: 0 }}
                    animate={{ width: `${stream.coherence * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div>
                <div className="text-sm text-[#D4B896]/70 mb-2">Activity Pattern</div>
                <div className="h-16 flex items-end gap-1">
                  {stream.activity.map((value, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#c9a876]/30 to-[#D4B896]/60 rounded-sm"
                      style={{ height: `${value}%` }}
                      animate={{ height: `${value}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm text-center">
        <h3 className="text-xl font-light text-[#D4B896] mb-4">System Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-[#D4B896]/70">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Pattern Recognition</span>
            </div>
            <div className="text-2xl font-extralight text-[#c9a876]">
              {Math.round(streams.reduce((acc, s) => acc + s.coherence, 0) / streams.length * 100)}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-[#D4B896]/70">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Active Streams</span>
            </div>
            <div className="text-2xl font-extralight text-[#c9a876]">
              {streams.filter(s => s.status === 'active').length}/{streams.length}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-[#D4B896]/70">
              <Heart className="w-4 h-4" />
              <span className="text-sm">System Health</span>
            </div>
            <div className="text-2xl font-extralight text-[#c9a876]">Optimal</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StreamStatusWidget() {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4">
      <motion.div
        className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <span className="text-sm text-[#D4B896]/70">Multi-Stream Processing Active</span>
    </div>
  );
}