"use client";

import React from 'react';
import { Flame, Droplet, Mountain, Wind, Sparkles } from 'lucide-react';

/**
 * Diamond Model Dashboard - Faceted Metrics Visualization
 * Shows real-time elemental balance and symbolic intelligence
 */
export default function DiamondDashboard() {
  // Mock data - will be replaced with real Soulprint data
  const elementalBalance = {
    fire: 0.65,    // Will & Transformation
    water: 0.45,   // Emotion & Flow
    earth: 0.30,   // Body & Manifestation
    air: 0.55,     // Mind & Clarity
    aether: 0.70   // Spirit & Emergence
  };

  const recentSymbols = [
    { name: 'Phoenix', element: 'fire', count: 5 },
    { name: 'Ocean', element: 'water', count: 3 },
    { name: 'Mountain', element: 'earth', count: 2 },
    { name: 'Doorway', element: 'aether', count: 4 }
  ];

  const activeArchetypes = [
    { name: 'Hero', strength: 0.8 },
    { name: 'Shadow', strength: 0.6 },
    { name: 'Seeker', strength: 0.5 }
  ];

  const spiralPhase = 'Transformation';
  const transformationScore = 7.2;

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-light">Your Diamond</h1>
          <p className="text-gray-400">All facets held as One</p>
        </div>

        {/* Central Diamond Visualization */}
        <div className="relative w-full max-w-2xl mx-auto aspect-square">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* TODO: Replace with actual diamond-model.png */}
            <div className="relative w-64 h-64">
              {/* Buddha Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-300" />
                </div>
              </div>

              {/* Five Elements - Positioned around center */}
              {/* Fire - Top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all
                  ${elementalBalance.fire > 0.6 ? 'bg-red-500/30 scale-110' : 'bg-red-500/10'}`}>
                  <Flame className="w-8 h-8 text-red-400" />
                  <span className="text-xs text-gray-400 mt-1">{(elementalBalance.fire * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Water - Left */}
              <div className="absolute top-1/4 left-0 -translate-x-12">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all
                  ${elementalBalance.water > 0.6 ? 'bg-blue-500/30 scale-110' : 'bg-blue-500/10'}`}>
                  <Droplet className="w-8 h-8 text-blue-400" />
                  <span className="text-xs text-gray-400 mt-1">{(elementalBalance.water * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Earth - Bottom Left */}
              <div className="absolute bottom-4 left-8">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all
                  ${elementalBalance.earth > 0.6 ? 'bg-green-500/30 scale-110' : 'bg-green-500/10'}`}>
                  <Mountain className="w-8 h-8 text-green-400" />
                  <span className="text-xs text-gray-400 mt-1">{(elementalBalance.earth * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Air - Bottom Right */}
              <div className="absolute bottom-4 right-8">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all
                  ${elementalBalance.air > 0.6 ? 'bg-cyan-500/30 scale-110' : 'bg-cyan-500/10'}`}>
                  <Wind className="w-8 h-8 text-cyan-400" />
                  <span className="text-xs text-gray-400 mt-1">{(elementalBalance.air * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Aether - Right */}
              <div className="absolute top-1/4 right-0 translate-x-12">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all
                  ${elementalBalance.aether > 0.6 ? 'bg-ain-soph-gold/30 scale-110' : 'bg-ain-soph-blue/20'}`}>
                  <Sparkles className="w-8 h-8 text-ain-soph-amber" />
                  <span className="text-xs text-gray-400 mt-1">{(elementalBalance.aether * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">

          {/* Spiral Phase */}
          <div className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
            <h3 className="text-sm text-gray-400 uppercase tracking-wide">Spiral Phase</h3>
            <p className="text-2xl font-light">{spiralPhase}</p>
            <p className="text-xs text-gray-500">Non-linear development honored</p>
          </div>

          {/* Transformation Score */}
          <div className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
            <h3 className="text-sm text-gray-400 uppercase tracking-wide">Transformation Score</h3>
            <p className="text-2xl font-light">{transformationScore.toFixed(1)}/10</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(transformationScore / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Dominant Element */}
          <div className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
            <h3 className="text-sm text-gray-400 uppercase tracking-wide">Dominant Element</h3>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-ain-soph-amber" />
              <p className="text-2xl font-light">Aether</p>
            </div>
            <p className="text-xs text-gray-500">Spirit & Emergence</p>
          </div>

        </div>

        {/* Symbol Constellation */}
        <div className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg space-y-4">
          <h3 className="text-lg font-light">Symbol Constellation</h3>
          <div className="flex flex-wrap gap-3">
            {recentSymbols.map((symbol, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-gray-700/50 rounded-full text-sm flex items-center gap-2"
              >
                <span>{symbol.name}</span>
                <span className="text-gray-500">×{symbol.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Archetypal Dynamics */}
        <div className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg space-y-4">
          <h3 className="text-lg font-light">Active Archetypes</h3>
          <div className="space-y-3">
            {activeArchetypes.map((archetype, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{archetype.name}</span>
                  <span className="text-xs text-gray-500">{(archetype.strength * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${archetype.strength * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Suggestions */}
        <div className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg space-y-4">
          <h3 className="text-lg font-light">Integration Wisdom</h3>
          <p className="text-gray-400 leading-relaxed">
            Your Aether (spirit) and Fire (will) are strong right now. Consider inviting Earth (body)
            to ground these high energies. A somatic practice might serve your integration.
          </p>
          <button className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors">
            Explore Earth Practices
          </button>
        </div>

        {/* Footer Philosophy */}
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-gray-500 italic">
            "All facets of your life are held as One — with many faces, processing and evolving into and out of life"
          </p>
          <p className="text-xs text-gray-600">The Diamond Model</p>
        </div>

      </div>
    </div>
  );
}