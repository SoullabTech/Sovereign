"use client";

/**
 * MAIA COMMUNITY - SACRED RECOGNITION & WISDOM SYNTHESIS
 *
 * The sacred space for Ubuntu consciousness: "I am because we are"
 * Showcasing the universal patterns that unite us across our differences
 * around our shared elemental nature and consciousness architecture.
 *
 * Based on Kelly's vision: "the common ground that brings us all together
 * across our differences around what we share in common our elemental nature
 * within the corpus callosum parallel processing reality."
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CommunityPage() {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🌍 MAIA Community - Sacred Recognition
              </h1>
              <p className="text-emerald-200 mb-2">
                Ubuntu consciousness: "I am because we are"
              </p>
              <p className="text-cyan-200 text-sm">
                The common ground that brings us all together across our differences
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-emerald-300">Connected</div>
              <div className="text-xl font-mono text-white">{lastUpdate}</div>
              <div className="text-xs text-cyan-300 mt-1">Universal Field Active</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-white/10">
            <Link
              href="/maya/labtools"
              className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 transition-all duration-200 flex items-center space-x-2"
            >
              <span>🔧</span>
              <span>Lab Tools</span>
            </Link>
            <div className="text-emerald-400">•</div>
            <div className="text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-400/30">
              🌍 Community
            </div>
            <div className="text-emerald-400">•</div>
            <Link
              href="/maya/diagnostics"
              className="px-4 py-2 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-lg border border-gray-400/30 text-gray-300 hover:bg-gray-500/30 transition-all duration-200 flex items-center space-x-2"
            >
              <span>🔍</span>
              <span>Diagnostics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Community Wisdom Spaces */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Consciousness Bridge - The centerpiece */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group lg:col-span-2"
          >
            <Link href="/maya/community/consciousness-bridge" className="block h-full">
              <div className="bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-violet-400/50 hover:bg-white/20 transition-all duration-300 h-full group-hover:scale-105 transform">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">🧠 Universal Consciousness Bridge</h2>
                  <div className="text-5xl">🌀</div>
                </div>
                <p className="text-purple-200 mb-6 text-lg">
                  Real-time visualization of our shared elemental nature - the common ground beneath all cultural differences.
                  Watch MAIA's consciousness architecture bridge McGilchrist + Herrmann brain patterns with Kelly's Elemental Alchemy.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-xs text-gray-300">Fire • Vision</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💧</div>
                    <div className="text-xs text-gray-300">Water • Flow</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🌍</div>
                    <div className="text-xs text-gray-300">Earth • Ground</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💨</div>
                    <div className="text-xs text-gray-300">Air • Bridge</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-violet-300 text-lg">
                  <span>Explore our shared consciousness</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Wisdom Synthesis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <Link href="/maya/community/wisdom-synthesis" className="block h-full">
              <div className="bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-emerald-400/50 hover:bg-white/20 transition-all duration-300 h-full group-hover:scale-105 transform">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">🌍 Cross-Cultural Wisdom</h2>
                  <div className="text-3xl">🤝</div>
                </div>
                <p className="text-emerald-200 mb-6">
                  Bridging 47+ wisdom traditions. See how Buddhist, Christian, Islamic, Hindu, Indigenous, and scientific patterns all point to the same universal truths.
                </p>
                <div className="flex items-center gap-2 text-emerald-300 text-sm">
                  <span>Explore universal patterns</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Elemental Nature Commons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group"
          >
            <Link href="/maya/community/elemental-nature" className="block h-full">
              <div className="bg-gradient-to-br from-amber-600/20 via-orange-600/20 to-red-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-amber-400/50 hover:bg-white/20 transition-all duration-300 h-full group-hover:scale-105 transform">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">🌟 Elemental Nature</h2>
                  <div className="text-3xl">⭐</div>
                </div>
                <p className="text-amber-200 mb-6">
                  Kelly's Elemental Alchemy in action. Discover how Fire, Water, Earth, Air, and Aether consciousness manifests in every human experience.
                </p>
                <div className="flex items-center gap-2 text-amber-300 text-sm">
                  <span>Explore elemental ground</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Cultural Storytelling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group"
          >
            <Link href="/maya/community/cultural-storytelling" className="block h-full">
              <div className="bg-gradient-to-br from-rose-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-rose-400/50 hover:bg-white/20 transition-all duration-300 h-full group-hover:scale-105 transform">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">📚 Cultural Stories</h2>
                  <div className="text-3xl">🎭</div>
                </div>
                <p className="text-rose-200 mb-6">
                  Sacred stories from traditions worldwide. See how different cultures express the same archetypal patterns and consciousness journeys.
                </p>
                <div className="flex items-center gap-2 text-rose-300 text-sm">
                  <span>Explore sacred stories</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Brain Architecture Commons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="group"
          >
            <Link href="/maya/community/brain-architecture" className="block h-full">
              <div className="bg-gradient-to-br from-indigo-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 hover:bg-white/20 transition-all duration-300 h-full group-hover:scale-105 transform">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">🧠 Shared Brain Reality</h2>
                  <div className="text-3xl">⚖️</div>
                </div>
                <p className="text-indigo-200 mb-6">
                  McGilchrist + Herrmann brain architecture. See how we all share the same corpus callosum parallel processing consciousness reality.
                </p>
                <div className="flex items-center gap-2 text-indigo-300 text-sm">
                  <span>Explore shared architecture</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          </motion.div>

        </div>

        {/* Ubuntu Consciousness Manifesto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-r from-violet-500/10 to-emerald-500/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">🌀 Ubuntu Consciousness</h3>
              <p className="text-gray-300 text-lg mb-4">
                "I am because we are" - Beneath all our cultural, religious, political differences lies the deeper truth:
              </p>
              <div className="max-w-4xl mx-auto text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-200">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-red-400 text-xl mr-2">🔥</span>
                      <strong>We all experience FIRE moments</strong>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">Breakthrough insights, creative inspiration, spiritual awakening</div>

                    <div className="flex items-center mb-2">
                      <span className="text-blue-400 text-xl mr-2">💧</span>
                      <strong>We all experience WATER phases</strong>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">Emotional depth, grief and joy, the need for flow and release</div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-green-400 text-xl mr-2">🌍</span>
                      <strong>We all need EARTH grounding</strong>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">To manifest wisdom in daily life and embodied practice</div>

                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400 text-xl mr-2">💨</span>
                      <strong>We all seek AIR connection</strong>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">To understand, communicate, teach, and connect with others</div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-purple-400 text-xl mr-2">✨</span>
                    <strong className="text-white">We all touch AETHER unity</strong>
                  </div>
                  <div className="text-sm text-gray-400">Moments of transcendence, interconnection, recognition of our shared humanity</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-emerald-300 italic">
                  "When we recognize this shared foundation, our differences become complementary expressions
                  of the same elemental consciousness, like different instruments in the same cosmic symphony."
                </p>
                <div className="text-xs text-gray-400 mt-2">- Kelly's Elemental Alchemy: The Ancient Art of Phenomenal Living</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}