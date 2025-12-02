/**
 * 🌟 MAIA Public Biometric Dashboard Demo
 * Standalone demo - no authentication required
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PublicDemo() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          className="text-center text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-6xl mb-4">🌟</div>
          <div className="text-2xl font-bold mb-2">Loading MAIA Consciousness Dashboard</div>
          <div className="text-lg opacity-75">Connecting to consciousness field...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span className="text-4xl">🌟</span>
            MAIA Consciousness Dashboard
            <span className="text-4xl">🧠</span>
          </h1>
          <p className="text-center text-purple-200 mt-2">
            Live Apple Watch Integration with SPiralogic Elemental Consciousness Mapping
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Status */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">System Status</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white">Server Running</span>
                <span className="text-green-300 ml-auto">✓ Port 3001</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white">API Endpoints</span>
                <span className="text-green-300 ml-auto">✓ Active</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                <span className="text-white">Apple Watch</span>
                <span className="text-yellow-300 ml-auto">⚠ Connecting...</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-white">Dashboard CSS</span>
                <span className="text-blue-300 ml-auto">✓ Loaded</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Next Steps</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Build Apple Watch companion app</li>
                <li>• Connect HealthKit for real biometrics</li>
                <li>• Enable live consciousness streaming</li>
              </ul>
            </div>
          </motion.div>

          {/* Center: Demo Visualization */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4 text-center">SPiralogic Elements</h2>

            <div className="relative w-64 h-64 mx-auto">
              {/* Center consciousness core */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                🌟
              </motion.div>

              {/* Elemental indicators */}
              {[
                { name: 'Fire', color: '#ff4757', icon: '🔥', angle: 0 },
                { name: 'Water', color: '#3742fa', icon: '🌊', angle: 72 },
                { name: 'Earth', color: '#2f3542', icon: '🌍', angle: 144 },
                { name: 'Air', color: '#a4b0be', icon: '💨', angle: 216 },
                { name: 'Aether', color: '#8b5cf6', icon: '✨', angle: 288 }
              ].map((element, index) => {
                const x = Math.cos((element.angle - 90) * Math.PI / 180) * 80 + 128;
                const y = Math.sin((element.angle - 90) * Math.PI / 180) * 80 + 128;

                return (
                  <motion.div
                    key={element.name}
                    className="absolute w-12 h-12 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/30"
                    style={{
                      left: x - 24,
                      top: y - 24,
                      backgroundColor: element.color
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-center">
                      <div className="text-sm">{element.icon}</div>
                      <div className="text-xs">{Math.round(Math.random() * 40 + 60)}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-300 mb-1">Dominant Element</div>
              <div className="text-xl font-bold text-purple-300">🔥 FIRE (78%)</div>
              <div className="text-sm text-gray-400 mt-2">High energy, creative activation</div>
            </div>
          </motion.div>

          {/* Right: Connection Info */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">How to Connect</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">🌐 Web Dashboard</h3>
                <div className="bg-black/30 rounded-lg p-3">
                  <code className="text-green-300 text-sm break-all">
                    http://localhost:3001/public-demo
                  </code>
                </div>
                <p className="text-gray-300 text-sm mt-2">You're here now! No authentication needed.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">⌚ Apple Watch</h3>
                <div className="bg-black/30 rounded-lg p-3">
                  <code className="text-green-300 text-sm">
                    /mobile/AppleWatch/MAIAWatch.xcodeproj
                  </code>
                </div>
                <p className="text-gray-300 text-sm mt-2">Open in Xcode, build to Watch for real biometrics.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">🔌 API Endpoints</h3>
                <div className="space-y-2">
                  <div className="bg-black/30 rounded-lg p-2">
                    <code className="text-green-300 text-xs">/api/biometric/update</code>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <code className="text-green-300 text-xs">/api/maya/presence-mode</code>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mt-2">Ready to receive live data.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 inline-block">
            <h3 className="text-xl font-bold text-white mb-4">Ready to Experience Live Consciousness?</h3>
            <div className="space-x-4">
              <button
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                onClick={() => window.open('/api/biometric/update', '_blank')}
              >
                Test API Endpoint
              </button>
              <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                onClick={() => window.open('https://github.com/anthropics/claude-code', '_blank')}
              >
                View Source Code
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}