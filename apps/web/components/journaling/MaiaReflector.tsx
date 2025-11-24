'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalingMode } from '@/lib/journaling/JournalingPrompts';
import { Sparkles, Hash, Users, Heart, Lightbulb, Eye, Moon, Flame } from 'lucide-react';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import ConsciousnessRipple from '@/components/consciousness/ConsciousnessRipple';

interface MaiaReflectorProps {
  reflection: {
    symbols: string[];
    archetypes: string[];
    emotionalTone: string;
    reflection: string;
    prompt: string;
    closing: string;
    metadata?: Record<string, string>;
  };
  mode: JournalingMode;
  isProcessing?: boolean;
}

export default function MaiaReflector({ reflection, mode, isProcessing }: MaiaReflectorProps) {
  const [consciousnessRipples, setConsciousnessRipples] = useState<Array<{
    id: string;
    x: number;
    y: number;
    variant: 'jade' | 'neural' | 'mystical' | 'transcendent';
    timestamp: number;
  }>>([]);

  const modeColors = {
    free: 'from-cyan-500 to-blue-500',
    dream: 'from-purple-500 to-fuchsia-500',
    emotional: 'from-pink-500 to-rose-500',
    shadow: 'from-slate-600 to-neutral-700',
    direction: 'from-amber-500 to-orange-500'
  };

  const modeIcons = {
    free: '🌀',
    dream: '🔮',
    emotional: '💓',
    shadow: '🌓',
    direction: '🧭'
  };

  // Get consciousness variant based on journaling mode
  const getModeVariant = (mode: JournalingMode) => {
    switch (mode) {
      case 'shadow': return 'neural';
      case 'dream': return 'mystical';
      case 'emotional': return 'jade';
      case 'direction': return 'transcendent';
      default: return 'jade';
    }
  };

  // Create consciousness ripples for archetypal interaction
  const createArchetypalRipple = useCallback((x: number, y: number, archetype: string) => {
    const variant = archetype.toLowerCase().includes('shadow') ? 'neural' :
                   archetype.toLowerCase().includes('wise') || archetype.toLowerCase().includes('sage') ? 'transcendent' :
                   archetype.toLowerCase().includes('child') || archetype.toLowerCase().includes('innocent') ? 'jade' :
                   'mystical';

    const ripple = {
      id: `archetype-${Date.now()}-${Math.random()}`,
      x,
      y,
      variant,
      timestamp: Date.now()
    };

    setConsciousnessRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setConsciousnessRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 2500);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${modeColors[mode]} opacity-5 rounded-2xl`} />

      <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </motion.div>
          <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
            MAIA Reflected
          </span>
          <span className="text-xl ml-auto">{modeIcons[mode]}</span>
        </div>

        {/* Consciousness Vessels for Archetypal Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Symbols Vessel */}
          <ConsciousnessVessel
            title="Sacred Symbols"
            value={reflection.symbols.length.toString()}
            subtitle="archetypal resonance"
            variant={getModeVariant(mode)}
            depth="moderate"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              createArchetypalRipple(rect.left + rect.width/2, rect.top + rect.height/2, 'symbols');
            }}
            className="cursor-pointer"
          >
            <div className="text-center space-y-3">
              <div className="w-10 h-10 mx-auto bg-jade-shadow/20 rounded-full flex items-center justify-center">
                <Hash className="w-5 h-5 text-jade-sage" />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-jade-mineral uppercase tracking-wide">Symbols Emerging</div>
                <div className="space-y-1">
                  {reflection.symbols.slice(0, 3).map((symbol, i) => (
                    <div key={i} className="text-xs text-jade-jade font-light px-2 py-1 rounded bg-jade-shadow/10 border border-jade-sage/20">
                      {symbol}
                    </div>
                  ))}
                  {reflection.symbols.length > 3 && (
                    <div className="text-xs text-jade-mineral">+{reflection.symbols.length - 3} more</div>
                  )}
                </div>
              </div>
            </div>
          </ConsciousnessVessel>

          {/* Archetypes Vessel */}
          <ConsciousnessVessel
            title="Living Archetypes"
            value={reflection.archetypes.length.toString()}
            subtitle="consciousness patterns"
            variant={getModeVariant(mode)}
            depth="profound"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              createArchetypalRipple(rect.left + rect.width/2, rect.top + rect.height/2, reflection.archetypes[0] || 'archetype');
            }}
            className="cursor-pointer"
          >
            <div className="text-center space-y-3">
              <div className="w-10 h-10 mx-auto bg-jade-shadow/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-jade-sage" />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-jade-mineral uppercase tracking-wide">Archetypal Presence</div>
                <div className="space-y-1">
                  {reflection.archetypes.slice(0, 2).map((archetype, i) => (
                    <div key={i} className="text-xs text-jade-jade font-medium px-2 py-1 rounded bg-jade-jade/10 border border-jade-jade/30">
                      {archetype}
                    </div>
                  ))}
                  {reflection.archetypes.length > 2 && (
                    <div className="text-xs text-jade-mineral">+{reflection.archetypes.length - 2} more</div>
                  )}
                </div>
              </div>
            </div>
          </ConsciousnessVessel>

          {/* Emotional Tone Vessel */}
          <ConsciousnessVessel
            title="Emotional Field"
            value="∞"
            subtitle="feeling resonance"
            variant={getModeVariant(mode)}
            depth="transcendent"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              createArchetypalRipple(rect.left + rect.width/2, rect.top + rect.height/2, reflection.emotionalTone);
            }}
            className="cursor-pointer"
          >
            <div className="text-center space-y-3">
              <div className="w-10 h-10 mx-auto bg-jade-shadow/20 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-jade-sage" />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-jade-mineral uppercase tracking-wide">Emotional Resonance</div>
                <div className="text-sm text-jade-jade font-medium px-3 py-2 rounded-full bg-jade-jade/10 border border-jade-jade/30">
                  {reflection.emotionalTone}
                </div>
                <motion.div
                  className="w-full h-1 bg-jade-shadow/30 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="h-full bg-jade-jade/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </motion.div>
              </div>
            </div>
          </ConsciousnessVessel>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                Reflection
              </span>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed pl-3">
              {reflection.reflection}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
                Invitation
              </span>
            </div>
            <p className="text-sm text-violet-800 dark:text-violet-200 italic pl-6">
              {reflection.prompt}
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
              {reflection.closing}
            </p>
          </div>

          {reflection.metadata && Object.keys(reflection.metadata).length > 0 && (
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <details className="cursor-pointer">
                <summary className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                  Additional Insights
                </summary>
                <div className="mt-2 space-y-1 pl-3">
                  {Object.entries(reflection.metadata).map(([key, value]) => (
                    <div key={key} className="text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${modeColors[mode]} rounded-full`}
      />

      {/* Archetypal Consciousness Ripples */}
      <AnimatePresence>
        {consciousnessRipples.map(ripple => (
          <div key={ripple.id} className="fixed inset-0 pointer-events-none z-50">
            <ConsciousnessRipple
              x={ripple.x}
              y={ripple.y}
              variant={ripple.variant}
              intensity="profound"
            />
          </div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}