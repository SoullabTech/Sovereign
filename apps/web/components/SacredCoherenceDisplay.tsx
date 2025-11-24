"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Brain, Sparkles, Flower2, Wind, Droplets, Mountain, Flame } from 'lucide-react';

interface SacredCoherenceProps {
  element: string;
  trustLevel: number;
  dualVoice?: {
    wholeness: string;
    friction: string;
    therapeuticPractice?: string;
    indigenousPractice?: string;
    microStep: string;
  };
  visible?: boolean;
}

export default function SacredCoherenceDisplay({
  element,
  trustLevel,
  dualVoice,
  visible = true
}: SacredCoherenceProps) {
  const [selectedVoice, setSelectedVoice] = useState<'both' | 'therapeutic' | 'indigenous'>('both');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setAnimateIn(true), 100);
    } else {
      setAnimateIn(false);
    }
  }, [visible]);

  if (!visible || !dualVoice) return null;

  const getElementIcon = () => {
    switch (element.toLowerCase()) {
      case 'fire': return <Flame className="w-5 h-5 text-red-400" />;
      case 'water': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'earth': return <Mountain className="w-5 h-5 text-green-400" />;
      case 'air': return <Wind className="w-5 h-5 text-yellow-400" />;
      default: return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const getTrustLevelText = () => {
    if (trustLevel > 0.7) return 'Deep Trust';
    if (trustLevel > 0.3) return 'Growing Connection';
    return 'New Journey';
  };

  return (
    <div className={`
      fixed bottom-20 right-4 w-96 
      bg-gradient-to-br from-slate-900/95 to-slate-800/95 
      backdrop-blur-lg rounded-2xl shadow-2xl
      border border-slate-700/50
      transition-all duration-500 transform
      ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          {getElementIcon()}
          <h3 className="text-white font-medium">Sacred Coherence</h3>
        </div>
        <span className="text-xs text-slate-400">{getTrustLevelText()}</span>
      </div>

      {/* Voice Selector */}
      <div className="flex gap-2 p-3 border-b border-slate-700/50">
        <button
          onClick={() => setSelectedVoice('both')}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedVoice === 'both' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Both Voices
        </button>
        <button
          onClick={() => setSelectedVoice('therapeutic')}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedVoice === 'therapeutic' 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Brain className="inline w-3 h-3 mr-1" />
          Therapeutic
        </button>
        <button
          onClick={() => setSelectedVoice('indigenous')}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedVoice === 'indigenous' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="inline w-3 h-3 mr-1" />
          Indigenous
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Wholeness Mirror */}
        {(selectedVoice === 'both' || selectedVoice === 'indigenous') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Flower2 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Wholeness Mirror</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {dualVoice.wholeness}
            </p>
          </div>
        )}

        {/* Friction Naming */}
        {(selectedVoice === 'both' || selectedVoice === 'therapeutic') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Pattern Recognition</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {dualVoice.friction}
            </p>
          </div>
        )}

        {/* Practices */}
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Practices for Rebalancing
          </div>

          {/* Therapeutic Practice */}
          {(selectedVoice === 'both' || selectedVoice === 'therapeutic') && dualVoice.therapeuticPractice && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">Clinical Approach</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {dualVoice.therapeuticPractice}
              </p>
            </div>
          )}

          {/* Indigenous Practice */}
          {(selectedVoice === 'both' || selectedVoice === 'indigenous') && dualVoice.indigenousPractice && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Sacred Approach</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {dualVoice.indigenousPractice}
              </p>
            </div>
          )}
        </div>

        {/* Micro Step */}
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Your Next Micro-Step</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {dualVoice.microStep}
          </p>
        </div>

        {/* Continuity Note */}
        <div className="pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 italic text-center">
            You are not broken. You are recalibrating.
          </p>
        </div>
      </div>

      {/* Elemental Balance Indicator */}
      <div className="p-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Current Element</span>
          <div className="flex items-center gap-2">
            {getElementIcon()}
            <span className="text-slate-300 capitalize">{element}</span>
          </div>
        </div>
        <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-blue-500 transition-all duration-1000"
            style={{ width: `${trustLevel * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}