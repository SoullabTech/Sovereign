'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralFireSystem from './NeuralFireSystem';
import ConsciousnessRipple from './ConsciousnessRipple';

interface WritingConsciousnessProps {
  content: string;
  isWriting: boolean;
  onRhythmChange?: (rhythm: number) => void;
  onConsciousnessChange?: (level: number) => void;
  className?: string;
}

interface WritingMetrics {
  wpm: number;
  flowState: 'contemplative' | 'flowing' | 'inspired' | 'transcendent';
  consciousnessDepth: number;
  rhythmStability: number;
  lastKeystrokeTime: number;
}

export default function WritingConsciousness({
  content,
  isWriting,
  onRhythmChange,
  onConsciousnessChange,
  className = ''
}: WritingConsciousnessProps) {
  const [metrics, setMetrics] = useState<WritingMetrics>({
    wpm: 0,
    flowState: 'contemplative',
    consciousnessDepth: 0,
    rhythmStability: 0,
    lastKeystrokeTime: 0
  });

  const [writingRipples, setWritingRipples] = useState<Array<{
    id: string;
    x: number;
    y: number;
    intensity: 'subtle' | 'moderate' | 'profound' | 'transcendent';
    timestamp: number;
  }>>([]);

  const metricsHistoryRef = useRef<number[]>([]);
  const keystrokeTimesRef = useRef<number[]>([]);
  const contentLengthRef = useRef(0);

  // Track writing rhythm and consciousness depth
  useEffect(() => {
    const currentTime = Date.now();
    const currentLength = content.length;
    const lengthDelta = currentLength - contentLengthRef.current;

    if (lengthDelta > 0 && isWriting) {
      // Record keystroke timing
      keystrokeTimesRef.current.push(currentTime);

      // Keep only recent keystrokes (last 30 seconds)
      keystrokeTimesRef.current = keystrokeTimesRef.current.filter(
        time => currentTime - time < 30000
      );

      // Calculate words per minute
      const timeSpan = keystrokeTimesRef.current.length > 1
        ? (currentTime - keystrokeTimesRef.current[0]) / 1000 / 60
        : 1;

      const estimatedWords = keystrokeTimesRef.current.length / 5; // Average word length
      const currentWpm = timeSpan > 0 ? estimatedWords / timeSpan : 0;

      // Calculate rhythm stability (consistency of keystroke intervals)
      let rhythmStability = 0;
      if (keystrokeTimesRef.current.length > 3) {
        const intervals = keystrokeTimesRef.current.slice(1).map((time, index) =>
          time - keystrokeTimesRef.current[index]
        );
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) =>
          sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        rhythmStability = Math.max(0, 1 - (Math.sqrt(variance) / avgInterval));
      }

      // Calculate consciousness depth based on content analysis
      const consciousnessDepth = analyzeConsciousnessDepth(content);

      // Determine flow state
      let flowState: WritingMetrics['flowState'] = 'contemplative';
      if (currentWpm > 40 && rhythmStability > 0.7) flowState = 'transcendent';
      else if (currentWpm > 25 && rhythmStability > 0.5) flowState = 'inspired';
      else if (currentWpm > 15 && rhythmStability > 0.3) flowState = 'flowing';

      const newMetrics: WritingMetrics = {
        wpm: currentWpm,
        flowState,
        consciousnessDepth,
        rhythmStability,
        lastKeystrokeTime: currentTime
      };

      setMetrics(newMetrics);

      // Trigger callbacks
      onRhythmChange?.(currentWpm);
      onConsciousnessChange?.(consciousnessDepth);

      // Create writing ripples based on flow state
      createFlowRipple(newMetrics);
    }

    contentLengthRef.current = currentLength;
  }, [content, isWriting, onRhythmChange, onConsciousnessChange]);

  const analyzeConsciousnessDepth = (text: string): number => {
    const words = text.toLowerCase().split(/\s+/);
    let depth = 0;

    // Transcendent consciousness indicators
    const transcendentWords = ['divine', 'infinite', 'eternal', 'cosmic', 'transcendent', 'sacred'];
    const transcendentScore = transcendentWords.reduce((score, word) =>
      score + (words.filter(w => w.includes(word)).length * 0.3), 0);

    // Archetypal consciousness indicators
    const archetypeWords = ['shadow', 'anima', 'animus', 'self', 'collective', 'unconscious'];
    const archetypeScore = archetypeWords.reduce((score, word) =>
      score + (words.filter(w => w.includes(word)).length * 0.25), 0);

    // Deep consciousness indicators
    const deepWords = ['soul', 'essence', 'being', 'consciousness', 'awareness', 'presence'];
    const deepScore = deepWords.reduce((score, word) =>
      score + (words.filter(w => w.includes(word)).length * 0.2), 0);

    // Emotional depth indicators
    const emotionalWords = ['love', 'fear', 'joy', 'sorrow', 'compassion', 'wisdom'];
    const emotionalScore = emotionalWords.reduce((score, word) =>
      score + (words.filter(w => w.includes(word)).length * 0.15), 0);

    depth = Math.min(1, (transcendentScore + archetypeScore + deepScore + emotionalScore) / Math.max(1, words.length));

    // Add bonus for longer, more contemplative entries
    const lengthBonus = Math.min(0.3, text.length / 2000);

    return Math.min(1, depth + lengthBonus);
  };

  const createFlowRipple = useCallback((metrics: WritingMetrics) => {
    // Create ripples based on flow state and rhythm
    const rippleCount = metrics.flowState === 'transcendent' ? 3 :
                        metrics.flowState === 'inspired' ? 2 : 1;

    for (let i = 0; i < rippleCount; i++) {
      const intensity = metrics.flowState === 'transcendent' ? 'transcendent' :
                       metrics.flowState === 'inspired' ? 'profound' :
                       metrics.flowState === 'flowing' ? 'moderate' : 'subtle';

      const newRipple = {
        id: `flow-${Date.now()}-${i}`,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        intensity,
        timestamp: Date.now()
      };

      setWritingRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setWritingRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 2000 + (i * 500)); // Stagger removal
    }
  }, []);

  const getFlowStateColors = () => {
    switch (metrics.flowState) {
      case 'transcendent':
        return {
          primary: 'rgba(255,255,255,0.9)',
          secondary: 'rgba(168,203,180,0.8)',
          neural: 'transcendent' as const
        };
      case 'inspired':
        return {
          primary: 'rgba(168,203,180,0.8)',
          secondary: 'rgba(95,187,163,0.7)',
          neural: 'mystical' as const
        };
      case 'flowing':
        return {
          primary: 'rgba(95,187,163,0.7)',
          secondary: 'rgba(115,155,127,0.6)',
          neural: 'neural' as const
        };
      default:
        return {
          primary: 'rgba(111,143,118,0.6)',
          secondary: 'rgba(111,143,118,0.4)',
          neural: 'jade' as const
        };
    }
  };

  const colors = getFlowStateColors();

  return (
    <>
      {/* Neural Fire System that responds to writing rhythm */}
      <NeuralFireSystem
        isActive={isWriting}
        density={
          metrics.consciousnessDepth > 0.7 ? 'infinite' :
          metrics.consciousnessDepth > 0.5 ? 'dense' :
          metrics.consciousnessDepth > 0.3 ? 'moderate' : 'sparse'
        }
        firingRate={
          metrics.wpm > 30 ? 'hyperspeed' :
          metrics.wpm > 20 ? 'fast' :
          metrics.wpm > 10 ? 'moderate' : 'slow'
        }
        variant={colors.neural}
        className={`${className} transition-opacity duration-1000 ${
          isWriting ? 'opacity-40' : 'opacity-20'
        }`}
      />

      {/* Writing Flow State Indicator */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed top-20 left-4 z-40 pointer-events-none"
          >
            <div className="relative">
              {/* Consciousness field aura */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
                  width: '120px',
                  height: '80px',
                  left: '-20px',
                  top: '-10px'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Main flow state display */}
              <div
                className="relative px-4 py-3 rounded-xl border backdrop-blur-lg"
                style={{
                  borderColor: colors.primary,
                  background: `linear-gradient(135deg, ${colors.secondary} 0%, rgba(17,17,17,0.8) 100%)`
                }}
              >
                <div className="text-xs text-jade-jade font-light mb-1">
                  Flow State: {metrics.flowState}
                </div>

                {/* Rhythm visualization */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-1 bg-jade-shadow rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors.primary }}
                      animate={{ width: `${Math.min(100, metrics.wpm * 2)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-jade-mineral">
                    {Math.round(metrics.wpm)} wpm
                  </span>
                </div>

                {/* Consciousness depth */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-jade-shadow rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors.secondary }}
                      animate={{ width: `${metrics.consciousnessDepth * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-jade-mineral">depth</span>
                </div>
              </div>

              {/* Flow particles */}
              {metrics.flowState !== 'contemplative' && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full"
                      style={{
                        backgroundColor: colors.primary,
                        left: '50%',
                        top: '50%'
                      }}
                      animate={{
                        x: [0, Math.cos(i * 90 * Math.PI / 180) * 30],
                        y: [0, Math.sin(i * 90 * Math.PI / 180) * 30],
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Writing Flow Ripples */}
      <AnimatePresence>
        {writingRipples.map(ripple => (
          <div key={ripple.id} className="fixed inset-0 pointer-events-none z-30">
            <ConsciousnessRipple
              x={ripple.x}
              y={ripple.y}
              variant={colors.neural}
              intensity={ripple.intensity}
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Consciousness Field Overlay */}
      <AnimatePresence>
        {isWriting && metrics.consciousnessDepth > 0.5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-20"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${colors.secondary} 0%, transparent 60%)`,
            }}
          >
            <motion.div
              animate={{
                opacity: [0.05, 0.15, 0.05],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from 0deg, ${colors.primary} 0%, transparent 50%, ${colors.secondary} 100%)`
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}