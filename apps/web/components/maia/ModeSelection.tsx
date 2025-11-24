'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Edit3 } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { JournalingMode, JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import { useMaiaStore } from '@/lib/maia/state';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import ConsciousnessRipple from '@/components/consciousness/ConsciousnessRipple';
import NeuralFireSystem from '@/components/consciousness/NeuralFireSystem';

export default function ModeSelection() {
  console.log('🌸 ModeSelection component mounting...');
  const setMode = useMaiaStore((state) => state.setMode);
  const [consciousnessRipples, setConsciousnessRipples] = useState<{
    id: string;
    x: number;
    y: number;
    variant: 'jade' | 'neural' | 'mystical' | 'transcendent';
    timestamp: number;
  }[]>([]);
  const [voiceModePreferences, setVoiceModePreferences] = useState<Record<JournalingMode, boolean>>({
    free: false,
    direction: false,
    dream: false,
    emotional: false,
    shadow: false,
    expressive: false,
    gratitude: false,
    reflective: false
  });
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);

  // Reorganized for better visual balance: 2 primary gateways on top, 3 exploration gateways below, 3 neuroscience gateways at bottom
  const firstRowModes: JournalingMode[] = ['free', 'direction'];
  const secondRowModes: JournalingMode[] = ['dream', 'emotional', 'shadow'];
  const neuroscienceRowModes: JournalingMode[] = ['expressive', 'gratitude', 'reflective'];

  // Voice support detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsVoiceSupported(!!SpeechRecognition);
    }
  }, []);

  // Toggle voice preference for a specific mode
  const toggleVoicePreference = useCallback((mode: JournalingMode, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent gateway click
    setVoiceModePreferences(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
  }, []);

  // Create consciousness ripples for mode selection
  const createConsciousnessRipple = useCallback((x: number, y: number, mode: JournalingMode) => {
    const variant = mode === 'shadow' ? 'neural' :
                   mode === 'dream' ? 'mystical' :
                   mode === 'direction' ? 'transcendent' :
                   'jade';

    const ripple = {
      id: `mode-${Date.now()}-${Math.random()}`,
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

  // Handle consciousness gateway selection
  const handleGatewayClick = useCallback((mode: JournalingMode, e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Consciousness Gateway Clicked:', mode, 'Voice mode:', voiceModePreferences[mode]);
    const rect = e.currentTarget.getBoundingClientRect();
    createConsciousnessRipple(rect.left + rect.width/2, rect.top + rect.height/2, mode);

    // Set mode with voice preference
    setTimeout(() => setMode(mode, voiceModePreferences[mode]), 300);
  }, [voiceModePreferences, createConsciousnessRipple, setMode]);

  // Get mode-specific vessel variant
  const getModeVariant = (mode: JournalingMode) => {
    switch (mode) {
      case 'free': return 'jade';
      case 'shadow': return 'neural';
      case 'dream': return 'mystical';
      case 'emotional': return 'jade';
      case 'direction': return 'transcendent';
      // Neuroscience modes - brain-healing colors
      case 'expressive': return 'neural'; // Brain/neural networks
      case 'gratitude': return 'jade'; // Heart/stability
      case 'reflective': return 'transcendent'; // Wisdom/integration
      default: return 'jade';
    }
  };

  return (
    <>
      {/* Neural Fire Background */}
      <NeuralFireSystem
        isActive={true}
        density="moderate"
        firingRate="slow"
        variant="jade"
        className="fixed inset-0 z-0 opacity-20"
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 bg-gradient-radial from-jade-forest/5 via-transparent to-jade-abyss/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-jade-copper/5 via-transparent to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto p-8">
          {/* Sacred Header */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-jade-copper/20 to-jade-shadow/40 rounded-2xl backdrop-blur-sm" />
              <div className="absolute inset-0 border border-jade-sage/30 rounded-2xl" />

              <div className="relative p-8">
                <h2 className="text-4xl font-light text-jade-light mb-4 tracking-wide">
                  Sacred Consciousness Portal
                </h2>
                <p className="text-jade-mineral font-light text-lg">
                  Choose your mode of inner exploration
                </p>
              </div>
            </div>
          </div>

          {/* First Row - Two Primary Consciousness Gateways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {firstRowModes.map((mode, index) => {
              const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode];
              return (
                <div key={mode} className="h-full">
                  <ConsciousnessVessel
                    title={modeInfo.name}
                    subtitle={voiceModePreferences[mode] ? "voice gateway" : "consciousness gateway"}
                    variant={getModeVariant(mode)}
                    depth="profound"
                    size="large"
                    onClick={(e) => handleGatewayClick(mode, e)}
                    className="cursor-pointer transition-all duration-500 hover:scale-105 h-full"
                  >
                    <div className="text-center space-y-4">
                      {/* Sacred Flower of Life */}
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 64 64"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Background circle */}
                          <circle
                            cx="32"
                            cy="32"
                            r="30"
                            fill={`url(#flowerGradient-${mode})`}
                            stroke="rgba(168,203,180,0.6)"
                            strokeWidth="1"
                            className="backdrop-blur-sm"
                          />

                          {/* Flower of Life Pattern - 7 circles in sacred formation */}
                          {/* Center circle */}
                          <motion.circle
                            cx="32"
                            cy="32"
                            r="8"
                            fill="none"
                            stroke="rgba(168,203,180,0.9)"
                            strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                          />

                          {/* Surrounding 6 circles */}
                          {Array.from({ length: 6 }).map((_, i) => {
                            const angle = (i * 60) * (Math.PI / 180);
                            const radius = 10;
                            const x = 32 + Math.cos(angle) * radius;
                            const y = 32 + Math.sin(angle) * radius;
                            return (
                              <motion.circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="8"
                                fill="none"
                                stroke="rgba(168,203,180,0.8)"
                                strokeWidth="1.2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{
                                  duration: 2,
                                  delay: i * 0.2,
                                  ease: "easeInOut"
                                }}
                              />
                            );
                          })}

                          {/* Sacred center dot */}
                          <motion.circle
                            cx="32"
                            cy="32"
                            r="2.5"
                            fill="rgba(168,203,180,1)"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />

                          {/* Gradient definition */}
                          <defs>
                            <radialGradient id={`flowerGradient-${mode}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="rgba(168,203,180,0.1)" />
                              <stop offset="70%" stopColor="rgba(111,143,118,0.2)" />
                              <stop offset="100%" stopColor="rgba(31,58,42,0.3)" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-jade-mineral uppercase tracking-wide">Sacred Path</div>
                        <div className="text-sm text-jade-sage leading-relaxed px-2">
                          {modeInfo.description}
                        </div>
                        <div className="text-xs italic text-jade-copper/80 px-3 py-2 rounded bg-jade-shadow/20 border border-jade-sage/20">
                          "{modeInfo.prompt}"
                        </div>

                        {/* Voice Mode Toggle */}
                        {isVoiceSupported && (
                          <div className="pt-3 border-t border-jade-sage/20">
                            <div className="flex items-center justify-center gap-3">
                              <motion.button
                                onClick={(e) => toggleVoicePreference(mode, e)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                                  voiceModePreferences[mode]
                                    ? 'bg-jade-jade/30 border border-jade-jade/50 shadow-sm'
                                    : 'bg-jade-shadow/20 border border-jade-sage/30'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  {voiceModePreferences[mode] ? (
                                    <Mic className="w-3 h-3 text-jade-jade" />
                                  ) : (
                                    <Edit3 className="w-3 h-3 text-jade-sage" />
                                  )}
                                  <span className={`text-xs font-light ${
                                    voiceModePreferences[mode] ? 'text-jade-jade' : 'text-jade-sage'
                                  }`}>
                                    {voiceModePreferences[mode] ? 'Voice' : 'Text'}
                                  </span>
                                </div>
                              </motion.button>
                            </div>
                            <div className="text-center mt-2">
                              <span className="text-xs text-jade-mineral/60">
                                {voiceModePreferences[mode] ? 'Speak your truth' : 'Write your thoughts'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </ConsciousnessVessel>
                </div>
              );
            })}
          </div>

          {/* Second Row - Three Exploration Consciousness Gateways */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {secondRowModes.map((mode, index) => {
              const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode];
              return (
                <div key={mode} className="h-full">
                  <ConsciousnessVessel
                    title={modeInfo.name}
                    subtitle={voiceModePreferences[mode] ? "voice gateway" : "consciousness gateway"}
                    variant={getModeVariant(mode)}
                    depth="profound"
                    size="large"
                    onClick={(e) => handleGatewayClick(mode, e)}
                    className="cursor-pointer transition-all duration-500 hover:scale-105 h-full"
                  >
                    <div className="text-center space-y-4">
                      {/* Sacred Flower of Life */}
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 64 64"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Background circle */}
                          <circle
                            cx="32"
                            cy="32"
                            r="30"
                            fill={`url(#flowerGradient-${mode})`}
                            stroke="rgba(168,203,180,0.6)"
                            strokeWidth="1"
                            className="backdrop-blur-sm"
                          />

                          {/* Flower of Life Pattern - 7 circles in sacred formation */}
                          {/* Center circle */}
                          <motion.circle
                            cx="32"
                            cy="32"
                            r="8"
                            fill="none"
                            stroke="rgba(168,203,180,0.9)"
                            strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                          />

                          {/* Surrounding 6 circles */}
                          {Array.from({ length: 6 }).map((_, i) => {
                            const angle = (i * 60) * (Math.PI / 180);
                            const radius = 10;
                            const x = 32 + Math.cos(angle) * radius;
                            const y = 32 + Math.sin(angle) * radius;
                            return (
                              <motion.circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="8"
                                fill="none"
                                stroke="rgba(168,203,180,0.8)"
                                strokeWidth="1.2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{
                                  duration: 2,
                                  delay: i * 0.2,
                                  ease: "easeInOut"
                                }}
                              />
                            );
                          })}

                          {/* Sacred center dot */}
                          <motion.circle
                            cx="32"
                            cy="32"
                            r="2.5"
                            fill="rgba(168,203,180,1)"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />

                          {/* Gradient definition */}
                          <defs>
                            <radialGradient id={`flowerGradient-${mode}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="rgba(168,203,180,0.1)" />
                              <stop offset="70%" stopColor="rgba(111,143,118,0.2)" />
                              <stop offset="100%" stopColor="rgba(31,58,42,0.3)" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-jade-mineral uppercase tracking-wide">Sacred Path</div>
                        <div className="text-sm text-jade-sage leading-relaxed px-2">
                          {modeInfo.description}
                        </div>
                        <div className="text-xs italic text-jade-copper/80 px-3 py-2 rounded bg-jade-shadow/20 border border-jade-sage/20">
                          "{modeInfo.prompt}"
                        </div>

                        {/* Voice Mode Toggle */}
                        {isVoiceSupported && (
                          <div className="pt-3 border-t border-jade-sage/20">
                            <div className="flex items-center justify-center gap-3">
                              <motion.button
                                onClick={(e) => toggleVoicePreference(mode, e)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                                  voiceModePreferences[mode]
                                    ? 'bg-jade-jade/30 border border-jade-jade/50 shadow-sm'
                                    : 'bg-jade-shadow/20 border border-jade-sage/30'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  {voiceModePreferences[mode] ? (
                                    <Mic className="w-3 h-3 text-jade-jade" />
                                  ) : (
                                    <Edit3 className="w-3 h-3 text-jade-sage" />
                                  )}
                                  <span className={`text-xs font-light ${
                                    voiceModePreferences[mode] ? 'text-jade-jade' : 'text-jade-sage'
                                  }`}>
                                    {voiceModePreferences[mode] ? 'Voice' : 'Text'}
                                  </span>
                                </div>
                              </motion.button>
                            </div>
                            <div className="text-center mt-2">
                              <span className="text-xs text-jade-mineral/60">
                                {voiceModePreferences[mode] ? 'Speak your truth' : 'Write your thoughts'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </ConsciousnessVessel>
                </div>
              );
            })}
          </div>

          {/* Third Row - Neuroscience-Backed Brain Healing Gateways */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl backdrop-blur-sm" />
                <div className="absolute inset-0 border border-purple-500/20 rounded-xl" />

                <div className="relative px-6 py-4">
                  <h3 className="text-xl font-light text-jade-light mb-2">Brain Healing Portals</h3>
                  <p className="text-sm text-jade-mineral font-light">
                    Neuroscience-backed practices that heal your brain through writing
                  </p>
                  <div className="text-xs text-jade-copper/70 mt-2 italic">
                    Based on Stanford 2021 research • Elemental wisdom meets modern brain science
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {neuroscienceRowModes.map((mode, index) => {
                const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode];
                return (
                  <div key={mode} className="h-full">
                    <ConsciousnessVessel
                      title={modeInfo.name}
                      subtitle={voiceModePreferences[mode] ? "neural voice gateway" : "neural healing gateway"}
                      variant={getModeVariant(mode)}
                      depth="profound"
                      size="large"
                      onClick={(e) => handleGatewayClick(mode, e)}
                      className="cursor-pointer transition-all duration-500 hover:scale-105 h-full"
                    >
                      <div className="text-center space-y-4">
                        {/* Neural Symbol - Brain + Sacred Geometry */}
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <svg
                            className="w-full h-full"
                            viewBox="0 0 64 64"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Background circle */}
                            <circle
                              cx="32"
                              cy="32"
                              r="30"
                              fill={`url(#neuralGradient-${mode})`}
                              stroke="rgba(139,69,255,0.6)"
                              strokeWidth="1"
                              className="backdrop-blur-sm"
                            />

                            {/* Brain-inspired neural network pattern */}
                            <motion.circle
                              cx="32"
                              cy="32"
                              r="8"
                              fill="none"
                              stroke="rgba(139,69,255,0.9)"
                              strokeWidth="1.5"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 2, ease: "easeInOut" }}
                            />

                            {/* Neural connections */}
                            {Array.from({ length: 8 }).map((_, i) => {
                              const angle = (i * 45) * (Math.PI / 180);
                              const radius = 12;
                              const x = 32 + Math.cos(angle) * radius;
                              const y = 32 + Math.sin(angle) * radius;
                              return (
                                <motion.g key={i}>
                                  <motion.circle
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill="rgba(139,69,255,0.7)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                      duration: 1.5,
                                      delay: i * 0.15,
                                      ease: "easeInOut"
                                    }}
                                  />
                                  <motion.line
                                    x1="32"
                                    y1="32"
                                    x2={x}
                                    y2={y}
                                    stroke="rgba(139,69,255,0.5)"
                                    strokeWidth="1"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                      duration: 1.5,
                                      delay: i * 0.1,
                                      ease: "easeInOut"
                                    }}
                                  />
                                </motion.g>
                              );
                            })}

                            {/* Pulsing center */}
                            <motion.circle
                              cx="32"
                              cy="32"
                              r="3"
                              fill="rgba(139,69,255,1)"
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

                            {/* Gradient definition */}
                            <defs>
                              <radialGradient id={`neuralGradient-${mode}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(139,69,255,0.1)" />
                                <stop offset="70%" stopColor="rgba(99,102,241,0.2)" />
                                <stop offset="100%" stopColor="rgba(59,7,100,0.3)" />
                              </radialGradient>
                            </defs>
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-purple-300 uppercase tracking-wide">Neural Healing</div>
                          <div className="text-sm text-jade-sage leading-relaxed px-2">
                            {modeInfo.description}
                          </div>
                          <div className="text-xs italic text-purple-200/80 px-3 py-2 rounded bg-purple-900/20 border border-purple-500/20">
                            "{modeInfo.prompt}"
                          </div>

                          {/* Neuroscience info */}
                          {(modeInfo as any).neuroscienceNote && (
                            <div className="text-xs text-blue-300/70 px-2 py-2 rounded bg-blue-900/10 border border-blue-500/20">
                              🧠 {(modeInfo as any).neuroscienceNote}
                            </div>
                          )}

                          {/* Duration info */}
                          {(modeInfo as any).duration && (
                            <div className="text-xs text-emerald-300/70 px-2 py-1 rounded bg-emerald-900/10 border border-emerald-500/20">
                              ⏱ {(modeInfo as any).duration}
                            </div>
                          )}

                          {/* Voice Mode Toggle */}
                          {isVoiceSupported && (
                            <div className="pt-3 border-t border-jade-sage/20">
                              <div className="flex items-center justify-center gap-3">
                                <motion.button
                                  onClick={(e) => toggleVoicePreference(mode, e)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                                    voiceModePreferences[mode]
                                      ? 'bg-purple-500/30 border border-purple-500/50 shadow-sm'
                                      : 'bg-jade-shadow/20 border border-jade-sage/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    {voiceModePreferences[mode] ? (
                                      <Mic className="w-3 h-3 text-purple-300" />
                                    ) : (
                                      <Edit3 className="w-3 h-3 text-jade-sage" />
                                    )}
                                    <span className={`text-xs font-light ${
                                      voiceModePreferences[mode] ? 'text-purple-300' : 'text-jade-sage'
                                    }`}>
                                      {voiceModePreferences[mode] ? 'Voice' : 'Text'}
                                    </span>
                                  </div>
                                </motion.button>
                              </div>
                              <div className="text-center mt-2">
                                <span className="text-xs text-jade-mineral/60">
                                  {voiceModePreferences[mode] ? 'Speak to heal your brain' : 'Write to rewire neural pathways'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </ConsciousnessVessel>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sacred Footer */}
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-jade-shadow/20 rounded-xl backdrop-blur-sm" />
              <div className="relative px-6 py-4">
                <p className="text-jade-mineral font-light italic">
                  Your words are private and sacred. MAIA witnesses with reverence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consciousness Ripples */}
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
    </>
  );
}