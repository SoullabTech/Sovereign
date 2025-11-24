'use client';

import { useState } from 'react';
import { SoulprintDashboard } from '@/components/SoulprintDashboard';

export default function SoulDashboardPage() {
  const [userId, setUserId] = useState('guest');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light text-white">
              Soul Journey Dashboard
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Visualize your symbolic journey through archetypal patterns, elemental energies, and spiral phases.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <label className="text-sm text-gray-400">User ID:</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none focus:ring-0 w-32"
                placeholder="Enter user ID"
              />
            </div>
          </div>

          <SoulprintDashboard userId={userId} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="p-6 bg-black/40 rounded-lg border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">Symbolic Memory</h3>
              <p className="text-sm text-gray-400">
                MAIA tracks your archetypal patterns across sessions, building a living soulprint that informs future interactions.
              </p>
            </div>

            <div className="p-6 bg-black/40 rounded-lg border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">Adaptive Voice</h3>
              <p className="text-sm text-gray-400">
                Voice characteristics automatically adjust based on your dominant element and primary archetype — Oracle, Mentor, Mirror, or Catalyst.
              </p>
            </div>

            <div className="p-6 bg-black/40 rounded-lg border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">Growth Edges</h3>
              <p className="text-sm text-gray-400">
                Discover archetypal territories you haven&apos;t explored yet — invitations for expansion and integration.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
            <h3 className="text-xl font-medium text-white mb-3">How It Works</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <span className="text-indigo-400 font-medium">1. Interaction Logging:</span> Every conversation with MAIA is tracked — element, archetype, phase, and emotional tone.
              </p>
              <p>
                <span className="text-ain-soph-amber font-medium">2. Pattern Recognition:</span> Soulprint engine calculates dominant patterns, frequent archetypes, and phase transitions.
              </p>
              <p>
                <span className="text-pink-400 font-medium">3. Adaptive Response:</span> MAIA uses your soulprint to inform tone, metaphor choice, and voice characteristics in future sessions.
              </p>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-sm text-gray-500">
              Soulprint Architecture v2.1 | Symbolic Intelligence Layer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}