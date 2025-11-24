"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Eye, Heart, Zap } from 'lucide-react';

interface DaimonicEncounter {
  id: string;
  title: string;
  symbol: string;
  message: string;
  actionPrompt: string;
  archetype: string;
  energyState: string;
  triggerContext: any;
  timestamp: number;
}

interface DaimonCardProps {
  encounter: DaimonicEncounter;
  onDismiss: () => void;
  onReflect?: (encounterId: string, reflection: string) => void;
}

export default function DaimonCard({ encounter, onDismiss, onReflect }: DaimonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflection, setReflection] = useState('');

  const getEnergyStateColor = (state: string) => {
    const colors = {
      emerging: 'from-green-500/20 to-emerald-600/20',
      crystallizing: 'from-blue-500/20 to-cyan-600/20',
      transforming: 'from-amber-500/20 to-violet-600/20',
      integrating: 'from-yellow-500/20 to-amber-600/20',
      awakening: 'from-pink-500/20 to-rose-600/20',
      challenging: 'from-red-500/20 to-orange-600/20',
      beckoning: 'from-indigo-500/20 to-amber-600/20',
      warning: 'from-orange-500/20 to-red-600/20',
      celebrating: 'from-yellow-500/20 to-green-600/20',
      mourning: 'from-gray-500/20 to-slate-600/20'
    };
    return colors[state] || colors.emerging;
  };

  const getArchetypeIcon = (archetype: string) => {
    const icons = {
      'The Shadow': '🌑',
      'The Anima/Animus': '⚯',
      'The Wise Elder': '🧙‍♂️',
      'The Innocent Child': '👶',
      'The Rebel': '⚡',
      'The Creator': '🎨',
      'The Destroyer': '💥',
      'The Healer': '💚',
      'The Seeker': '🔍',
      'The Guardian': '🛡️',
      'The Trickster': '🃏',
      'The Lover': '💝',
      'The Warrior': '⚔️',
      'The Sage': '📜'
    };
    return icons[archetype] || '🌟';
  };



  const handleReflect = async () => {
    if (reflection.trim() && onReflect) {
      await onReflect(encounter.id, reflection);
      setReflection('');
      setIsReflecting(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl  ${getEnergyStateColor(encounter.energyState)} backdrop-blur-sm border border-white/10`}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{encounter.symbol}</span>
            <span className="text-lg">{getArchetypeIcon(encounter.archetype)}</span>
          </div>
          <div className="text-xs text-white/60">
            {formatTime(encounter.timestamp)}
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-white/90 mb-1">
          {encounter.title}
        </h3>
        
        <div className="flex items-center space-x-2 text-xs text-white/70">
          <span className="px-2 py-1 rounded-full bg-white/10">
            {encounter.archetype}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/10">
            {encounter.energyState}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Message */}
              <div>
                <h4 className="text-xs font-medium text-white/80 mb-2">
                  Message
                </h4>
                <p className="text-sm text-white/90 leading-relaxed">
                  {encounter.message}
                </p>
              </div>

              {/* Action Prompt */}
              <div>
                <h4 className="text-xs font-medium text-white/80 mb-2">
                  Reflection Prompt
                </h4>
                <p className="text-sm text-white/90 italic">
                  {encounter.actionPrompt}
                </p>
              </div>

              {/* Reflection Input */}
              {!isReflecting ? (
                <button
                  onClick={() => setIsReflecting(true)}
                  className="w-full py-2 px-3 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/90"
                >
                  Reflect on this encounter
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Share your thoughts about this encounter..."
                    className="w-full p-3 bg-white/10 rounded-lg text-sm text-white placeholder-white/60 resize-none focus:outline-none focus:ring-1 focus:ring-white/30"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsReflecting(false)}
                      className="px-3 py-1 text-xs text-white/70 hover:text-white/90"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReflect}
                      disabled={!reflection.trim()}
                      className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-white"
                    >
                      Save Reflection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Energy State Indicator */}
      <div className="absolute top-0 right-0 w-1 h-full">
        <div 
          className={`w-full h-full  ${getEnergyStateColor(encounter.energyState)} opacity-60`}
        />
      </div>
    </motion.div>
  );
}