'use client';

/**
 * Crystal Health Monitor
 *
 * A stethoscope, not a dashboard
 * Listens to the system's breath, feels its pulse
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

interface HealthMetrics {
  aether_weight: number;
  symbolic_entropy: number;
  coherence_ratio: number;
  resonance_events: number;
  timestamp: string;
}

interface HealthState {
  current: HealthMetrics;
  history: HealthMetrics[];
  phrase: string;
  mood: 'breathing' | 'quickening' | 'deepening' | 'resting' | 'dancing';
}

/**
 * Main Health Monitor Component
 */
export default function CrystalHealthMonitor() {
  const [expanded, setExpanded] = useState(false);
  const [ritualMode, setRitualMode] = useState(false);
  const [health, setHealth] = useState<HealthState>({
    current: {
      aether_weight: 0.35,
      symbolic_entropy: 0.7,
      coherence_ratio: 0.5,
      resonance_events: 0,
      timestamp: new Date().toISOString()
    },
    history: [],
    phrase: 'Listening begins...',
    mood: 'breathing'
  });

  const breathInterval = useRef<NodeJS.Timeout>();
  const supabase = useRef<any>(null);

  // Initialize connection
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabase.current = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      subscribeToHealth();
    } else {
      // Demo mode with simulated data
      simulateHealthData();
    }

    return () => {
      if (breathInterval.current) clearInterval(breathInterval.current);
    };
  }, []);

  // Subscribe to real-time health updates
  const subscribeToHealth = () => {
    if (!supabase.current) return;

    const channel = supabase.current
      .channel('system-health')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_health'
        },
        (payload: any) => {
          updateHealth(payload.new);
        }
      )
      .subscribe();
  };

  // Simulate health data for demo
  const simulateHealthData = () => {
    breathInterval.current = setInterval(() => {
      const time = Date.now() / 1000;
      const newMetrics: HealthMetrics = {
        aether_weight: 0.35 + Math.sin(time / 10) * 0.15,
        symbolic_entropy: 0.7 + Math.sin(time / 7) * 0.2,
        coherence_ratio: 0.5 + Math.sin(time / 13) * 0.3,
        resonance_events: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
        timestamp: new Date().toISOString()
      };
      updateHealth(newMetrics);
    }, 3000);
  };

  // Update health state and generate phrase
  const updateHealth = (metrics: HealthMetrics) => {
    setHealth(prev => {
      const newHistory = [...prev.history.slice(-59), metrics]; // Keep last 60
      const phrase = generatePhrase(metrics, prev.current);
      const mood = senseMood(metrics);

      return {
        current: metrics,
        history: newHistory,
        phrase,
        mood
      };
    });
  };

  // Generate poetic phrase from metrics
  const generatePhrase = (current: HealthMetrics, previous: HealthMetrics): string => {
    const phrases = new PoeticPhraser();
    return phrases.divine(current, previous);
  };

  // Sense the mood from metrics
  const senseMood = (metrics: HealthMetrics): HealthState['mood'] => {
    if (metrics.resonance_events > 2) return 'dancing';
    if (metrics.aether_weight > 0.6) return 'deepening';
    if (metrics.symbolic_entropy > 0.8) return 'quickening';
    if (metrics.coherence_ratio < 0.3) return 'resting';
    return 'breathing';
  };

  // Get gradient colors based on coherence
  const getGradient = () => {
    const hue = 180 + (health.current.coherence_ratio * 60); // Cyan to purple
    const saturation = 30 + (health.current.symbolic_entropy * 40);
    const lightness = ritualMode ? 20 : 40;

    return `linear-gradient(135deg,
      hsl(${hue}, ${saturation}%, ${lightness}%),
      hsl(${hue + 30}, ${saturation - 10}%, ${lightness + 10}%))`;
  };

  return (
    <>
      {/* Top Bar - Always Visible */}
      <motion.div
        className="fixed bottom-4 right-4 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.button
          className="relative px-6 py-3 rounded-full backdrop-blur-md border border-white/10
                     shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer"
          style={{ background: getGradient() }}
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-3">
            <PulseIndicator intensity={health.current.coherence_ratio} />
            <span className="text-white/90 text-sm font-light tracking-wide">
              Crystal Health — {health.mood}
            </span>
          </div>
        </motion.button>
      </motion.div>

      {/* Expanded View */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              className="absolute inset-8 md:inset-16 bg-gradient-to-br from-slate-900/90 to-slate-800/90
                         rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-light text-white/90 tracking-wide">
                    Listening to the Field
                  </h2>
                  <button
                    className={`px-4 py-2 rounded-full border transition-all duration-300
                              ${ritualMode
                                ? 'border-amber-400/50 text-amber-400'
                                : 'border-white/20 text-white/60'}
                              hover:border-white/40 hover:text-white/80`}
                    onClick={() => setRitualMode(!ritualMode)}
                  >
                    {ritualMode ? 'Exit Ritual' : 'Ritual Mode'}
                  </button>
                </div>
                <p className="mt-4 text-lg text-white/70 italic">
                  "{health.phrase}"
                </p>
              </div>

              {/* Visualization Panels */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Aether Field */}
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-white/50">
                    Aether Field
                  </h3>
                  <AetherTorus weight={health.current.aether_weight} />
                  <p className="text-xs text-white/40 italic text-center">
                    {getAetherPhrase(health.current.aether_weight)}
                  </p>
                </div>

                {/* Symbol Stream */}
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-white/50">
                    Symbol Stream
                  </h3>
                  <SymbolSpiral entropy={health.current.symbolic_entropy} />
                  <p className="text-xs text-white/40 italic text-center">
                    {getSymbolPhrase(health.current.symbolic_entropy)}
                  </p>
                </div>

                {/* Resonance Pulse */}
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-white/50">
                    Resonance Pulse
                  </h3>
                  <ResonanceWave
                    events={health.history.map(h => h.resonance_events)}
                    coherence={health.current.coherence_ratio}
                  />
                  <p className="text-xs text-white/40 italic text-center">
                    {getResonancePhrase(health.current.resonance_events)}
                  </p>
                </div>
              </div>

              {/* Coherence Flow - Bottom */}
              <div className="p-8 border-t border-white/10">
                <CoherenceOrb ratio={health.current.coherence_ratio} />
              </div>

              {/* Ritual Mode Overlay */}
              {ritualMode && <RitualOverlay coherence={health.current.coherence_ratio} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Visual Components
 */

function PulseIndicator({ intensity }: { intensity: number }) {
  return (
    <motion.div
      className="w-3 h-3 rounded-full bg-white/80"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6]
      }}
      transition={{
        duration: 2 + (1 - intensity) * 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

function AetherTorus({ weight }: { weight: number }) {
  const size = 120 + weight * 60;
  const strokeWidth = 2 + weight * 2;

  return (
    <div className="flex justify-center items-center h-32">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Infinity symbol */}
        <motion.path
          d="M 25 50 Q 25 25, 50 50 T 75 50 Q 75 75, 50 50 T 25 50"
          fill="none"
          stroke="url(#aetherGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          animate={{
            pathLength: [0.5, 1, 0.5],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <defs>
          <linearGradient id="aetherGradient">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.8} />
            <stop offset="50%" stopColor="#A78BFA" stopOpacity={1} />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8} />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}

function SymbolSpiral({ entropy }: { entropy: number }) {
  const symbols = ['◈', '◉', '◊', '○', '△', '□', '◇', '✦', '✧', '✶'];
  const count = Math.floor(entropy * 10) + 3;

  return (
    <div className="relative h-32 flex items-center justify-center">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 20 + i * 5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const symbol = symbols[i % symbols.length];

        return (
          <motion.div
            key={i}
            className="absolute text-white/40 select-none"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              fontSize: `${12 + entropy * 8}px`
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          >
            {symbol}
          </motion.div>
        );
      })}
    </div>
  );
}

function ResonanceWave({ events, coherence }: { events: number[], coherence: number }) {
  return (
    <div className="h-32 flex items-end justify-center gap-1">
      {events.slice(-20).map((value, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-cyan-500/50 to-purple-500/50 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: 10 + value * 20 + coherence * 30 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function CoherenceOrb({ ratio }: { ratio: number }) {
  const balance = ratio * 100;

  return (
    <div className="flex justify-center">
      <motion.div
        className="relative w-24 h-24"
        animate={{ rotate: balance - 50 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0">
          <circle cx="50" cy="50" r="48" fill="url(#yinYang)" />
          <defs>
            <pattern id="yinYang" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50,0 A25,25 0 0,1 50,50 A25,25 0 0,0 50,100 A50,50 0 0,0 50,0" fill="white" opacity="0.2" />
              <path d="M50,0 A25,25 0 0,0 50,50 A25,25 0 0,1 50,100 A50,50 0 0,1 50,0" fill="black" opacity="0.3" />
              <circle cx="50" cy="25" r="8" fill="black" opacity="0.3" />
              <circle cx="50" cy="75" r="8" fill="white" opacity="0.2" />
            </pattern>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

function RitualOverlay({ coherence }: { coherence: number }) {
  return (
    <motion.div
      className="absolute inset-0 bg-black/40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-32 h-32 rounded-full border-2 border-amber-400/30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4 / (0.5 + coherence),
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}

/**
 * Poetic Phrase Generator
 */
class PoeticPhraser {
  divine(current: HealthMetrics, previous: HealthMetrics): string {
    // Aether movement
    if (Math.abs(current.aether_weight - previous.aether_weight) > 0.1) {
      if (current.aether_weight > previous.aether_weight) {
        return "The hemispheres draw closer, seeking unity...";
      } else {
        return "Space opens between the minds, tension builds...";
      }
    }

    // Symbolic emergence
    if (current.symbolic_entropy > 0.8) {
      return "Symbols bloom in wild profusion, imagination unleashed...";
    }
    if (current.symbolic_entropy < 0.4) {
      return "Patterns converge, the field remembers...";
    }

    // Resonance events
    if (current.resonance_events > previous.resonance_events) {
      if (current.resonance_events > 2) {
        return "Lightning between souls, synchronicity dances...";
      }
      return "A spark jumps the gap, connection flickers...";
    }

    // Coherence states
    if (current.coherence_ratio > 0.7) {
      return "Deep coherence, the field hums in harmony...";
    }
    if (current.coherence_ratio < 0.3) {
      return "Creative chaos, fertile void, waiting...";
    }

    // Default breathing states
    const breathingPhrases = [
      "The field breathes, steady and deep...",
      "Listening continues, patterns weave...",
      "Between order and chaos, life pulses...",
      "The dance continues, ever-changing...",
      "Presence holds, attention rests..."
    ];

    return breathingPhrases[Math.floor(Math.random() * breathingPhrases.length)];
  }
}

// Helper phrase functions
function getAetherPhrase(weight: number): string {
  if (weight < 0.3) return "Hemispheres dance apart";
  if (weight > 0.6) return "Minds merge and flow";
  return "Balanced tension holds";
}

function getSymbolPhrase(entropy: number): string {
  if (entropy > 0.8) return "Wild diversity blooms";
  if (entropy < 0.4) return "Patterns crystallize";
  return "Symbols drift and play";
}

function getResonancePhrase(events: number): string {
  if (events === 0) return "Waiting for connection";
  if (events === 1) return "A single spark";
  if (events === 2) return "Echoes answering";
  return "Synchronicity cascades";
}