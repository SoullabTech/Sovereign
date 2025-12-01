"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import NeuralFireSystem from '@/components/consciousness/NeuralFireSystem';

interface DreamRecord {
  id: string;
  date: string;
  title: string;
  essence: string;
  symbols: string[];
  lucidity: 'unconscious' | 'semi-aware' | 'lucid' | 'transcendent';
  emotion: 'fear' | 'joy' | 'mystery' | 'transformation' | 'peace';
  archetype: 'shadow' | 'anima' | 'sage' | 'child' | 'hero' | 'mother';
  sleepQuality: number;
  duration: number;
  lunarPhase: 'new' | 'waxing' | 'full' | 'waning';
}

interface SleepMetrics {
  totalDreams: number;
  lucidDreams: number;
  avgSleepQuality: number;
  deepestSymbol: string;
  currentLunarPhase: 'new' | 'waxing' | 'full' | 'waning';
  circadianAlignment: number;
}

export default function DreamsArchivePage() {
  const [dreamRecords, setDreamRecords] = useState<DreamRecord[]>([]);
  const [sleepMetrics, setSleepMetrics] = useState<SleepMetrics>({
    totalDreams: 0,
    lucidDreams: 0,
    avgSleepQuality: 0,
    deepestSymbol: '',
    currentLunarPhase: 'waxing',
    circadianAlignment: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('night');

  // Determine time of day for appropriate jade/lunar theming
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) setTimeOfDay('dawn');
    else if (hour >= 10 && hour < 17) setTimeOfDay('day');
    else if (hour >= 17 && hour < 21) setTimeOfDay('dusk');
    else setTimeOfDay('night');
  }, []);

  useEffect(() => {
    // Simulate loading dream consciousness data
    setTimeout(() => {
      setSleepMetrics({
        totalDreams: 47,
        lucidDreams: 12,
        avgSleepQuality: 87,
        deepestSymbol: 'Sacred Water',
        currentLunarPhase: 'waxing',
        circadianAlignment: 92
      });

      setDreamRecords([
        {
          id: '1',
          date: 'Last night',
          title: 'The Jade Temple Ceremony',
          essence: 'I stood in an ancient jade temple where crystalline waters flowed through sacred geometric channels. Elder wisdom keepers shared profound teachings about the nature of consciousness.',
          symbols: ['Jade Temple', 'Flowing Water', 'Ancient Wisdom', 'Sacred Geometry'],
          lucidity: 'lucid',
          emotion: 'transformation',
          archetype: 'sage',
          sleepQuality: 94,
          duration: 8.5,
          lunarPhase: 'waxing'
        },
        {
          id: '2',
          date: '2 nights ago',
          title: 'The Neural Network Forest',
          essence: 'Walking through a mystical forest where trees were connected by glowing neural pathways. Each step created ripples of consciousness through the living network.',
          symbols: ['Living Trees', 'Neural Pathways', 'Glowing Connections', 'Forest Consciousness'],
          lucidity: 'semi-aware',
          emotion: 'mystery',
          archetype: 'child',
          sleepQuality: 89,
          duration: 7.2,
          lunarPhase: 'waxing'
        },
        {
          id: '3',
          date: '5 nights ago',
          title: 'Shadow Integration Chamber',
          essence: 'In a deep underground chamber, I faced my shadow aspects with compassion. Dark jade transformed into light as I embraced the hidden parts of myself.',
          symbols: ['Underground Chamber', 'Shadow Self', 'Dark Jade', 'Transformation Light'],
          lucidity: 'transcendent',
          emotion: 'transformation',
          archetype: 'shadow',
          sleepQuality: 96,
          duration: 9.1,
          lunarPhase: 'full'
        }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  // Get time-based color scheme
  const getTimeBasedColors = () => {
    const schemes = {
      dawn: {
        primary: 'from-jade-pale via-jade-seafoam to-rose-200',
        accent: 'rgba(168,203,180,0.4)',
        neural: 'mystical' as const
      },
      day: {
        primary: 'from-jade-jade via-jade-malachite to-jade-forest',
        accent: 'rgba(111,143,118,0.6)',
        neural: 'jade' as const
      },
      dusk: {
        primary: 'from-jade-bronze via-jade-copper to-purple-400',
        accent: 'rgba(151,187,163,0.5)',
        neural: 'neural' as const
      },
      night: {
        primary: 'from-jade-abyss via-jade-shadow to-indigo-900',
        accent: 'rgba(168,203,180,0.3)',
        neural: 'transcendent' as const
      }
    };
    return schemes[timeOfDay];
  };

  const timeColors = getTimeBasedColors();

  // Get lunar phase visual representation
  const getLunarPhaseIcon = (phase: string) => {
    const phases = {
      new: '🌑',
      waxing: '🌓',
      full: '🌕',
      waning: '🌗'
    };
    return phases[phase as keyof typeof phases] || '🌙';
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Lunar Loading Environment */}
        <div className={`absolute inset-0 bg-gradient-to-br ${timeColors.primary}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-jade-forest/5 via-transparent to-transparent" />

        {/* Dream Particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
            className={`absolute w-1 h-1 bg-jade-jade/40 rounded-full`}
            style={{
              left: `${20 + (i * 7)}%`,
              top: `${30 + Math.sin(i) * 20}%`
            }}
          />
        ))}

        <div className="relative z-10 text-center">
          {/* Lunar Loading Indicator */}
          <motion.div className="relative w-20 h-20 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-jade-jade/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 left-2 bottom-2 right-2 border border-jade-malachite/40 rounded-full"
            />
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-4 bottom-4 right-4 bg-jade-jade/60 rounded-full flex items-center justify-center text-2xl"
            >
              🌙
            </motion.div>
          </motion.div>

          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl font-extralight text-jade-jade tracking-[0.3em] uppercase"
          >
            Accessing Dream Archives
          </motion.p>
          <motion.div
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-32 h-px bg-gradient-to-r from-transparent via-jade-jade to-transparent mx-auto mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Lunar Atmospheric Environment */}
      <div className={`absolute inset-0 bg-gradient-to-br ${timeColors.primary}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-jade-forest/6 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-indigo-500/8 via-transparent to-transparent" />

      {/* Lunar Neural Activity */}
      <NeuralFireSystem
        isActive={true}
        density="sparse"
        firingRate="slow"
        variant={timeColors.neural}
        className="opacity-25"
      />

      {/* Floating Dream Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            opacity: [0.1, 0.6, 0.1],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 8 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2
          }}
          className="absolute w-0.5 h-0.5 bg-jade-jade/30 rounded-full"
          style={{
            left: `${10 + (i * 4)}%`,
            top: `${20 + Math.sin(i * 0.5) * 30}%`,
            filter: 'blur(0.5px)'
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Lunar Header Consciousness */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="mb-20 relative"
        >
          <div className="relative max-w-6xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center gap-8 mb-10"
            >
              <div className="relative w-10 h-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-jade/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-indigo-400/30 rounded-full"
                />
                <div className="absolute top-2 left-2 bottom-2 right-2 flex items-center justify-center text-2xl">
                  {getLunarPhaseIcon(sleepMetrics.currentLunarPhase)}
                </div>
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-jade-jade/50 to-transparent" />
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-5xl md:text-7xl font-extralight text-jade-jade tracking-wide"
              >
                Dreams Archive Portal
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex items-center gap-6"
            >
              <div className="w-20 h-px bg-gradient-to-r from-jade-jade via-indigo-400 to-jade-malachite" />
              <p className="text-xl font-light text-jade-mineral max-w-4xl leading-relaxed">
                Where consciousness meets the lunar unconscious, dreams crystallize into{' '}
                <motion.span
                  animate={{ color: ['#6F8F76', '#A8CBB4', '#6F8F76'] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-jade-jade"
                >
                  sacred wisdom vessels
                </motion.span>
                {' '}of the sleeping mind. Current lunar phase:{' '}
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-jade-jade font-light"
                >
                  {sleepMetrics.currentLunarPhase} {getLunarPhaseIcon(sleepMetrics.currentLunarPhase)}
                </motion.span>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Sleep Consciousness Metrics Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="mb-20 relative"
        >
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center justify-center gap-6 mb-6"
              >
                <div className="w-10 h-px bg-gradient-to-r from-transparent via-jade-jade/50 to-indigo-400/30" />
                <h3 className="text-2xl font-extralight text-jade-jade mb-4 tracking-[0.3em] uppercase">
                  Sleep Consciousness Metrics
                </h3>
                <div className="w-10 h-px bg-gradient-to-l from-transparent via-jade-jade/50 to-indigo-400/30" />
              </motion.div>

              <motion.div
                animate={{
                  scaleX: [0.8, 1.4, 0.8],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-40 h-px bg-gradient-to-r from-jade-jade via-indigo-400 to-jade-malachite mx-auto"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Dream Consciousness Vessel 1 - Total Dreams */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="mystical"
                  size="medium"
                  depth="profound"
                  rippleIntensity="transcendent"
                  title="Dream Vessels"
                  subtitle="Consciousness Journeys"
                  onClick={() => console.log('Total Dreams vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4 text-4xl">{getLunarPhaseIcon('full')}</div>
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 15px rgba(168, 203, 180, 0.6)",
                          "0 0 25px rgba(168, 203, 180, 0.3)",
                          "0 0 15px rgba(168, 203, 180, 0.6)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-jade tracking-wide mb-6"
                    >
                      {sleepMetrics.totalDreams}
                    </motion.p>
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Dream Consciousness Vessel 2 - Lucid Dreams */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="neural"
                  size="medium"
                  depth="transcendent"
                  rippleIntensity="profound"
                  title="Lucid Awakenings"
                  subtitle="Conscious Dreaming"
                  onClick={() => console.log('Lucid Dreams vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4 text-4xl">👁️</div>
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 15px rgba(95, 187, 163, 0.7)",
                          "0 0 25px rgba(95, 187, 163, 0.4)",
                          "0 0 15px rgba(95, 187, 163, 0.7)"
                        ]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-malachite tracking-wide mb-6"
                    >
                      {sleepMetrics.lucidDreams}
                    </motion.p>
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Dream Consciousness Vessel 3 - Sleep Quality */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="sacred"
                  size="medium"
                  depth="profound"
                  rippleIntensity="medium"
                  title="Sleep Resonance"
                  subtitle="Rest Quality Harmony"
                  onClick={() => console.log('Sleep Quality vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4 text-4xl">🌙</div>
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 15px rgba(168, 203, 180, 0.8)",
                          "0 0 25px rgba(168, 203, 180, 0.5)",
                          "0 0 15px rgba(168, 203, 180, 0.8)"
                        ]
                      }}
                      transition={{ duration: 3.5, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-jade tracking-wide mb-6"
                    >
                      {sleepMetrics.avgSleepQuality}%
                    </motion.p>
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Dream Consciousness Vessel 4 - Circadian Alignment */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.6, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="primary"
                  size="medium"
                  depth="deep"
                  rippleIntensity="subtle"
                  title="Circadian Harmony"
                  subtitle="Natural Rhythm Sync"
                  onClick={() => console.log('Circadian vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4 text-4xl">⏰</div>
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 15px rgba(111, 143, 118, 0.6)",
                          "0 0 25px rgba(111, 143, 118, 0.3)",
                          "0 0 15px rgba(111, 143, 118, 0.6)"
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-forest tracking-wide mb-6"
                    >
                      {sleepMetrics.circadianAlignment}%
                    </motion.p>
                  </div>
                </ConsciousnessVessel>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Dream Records Archive */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 2.0, duration: 1.2 }}
          className="relative"
        >
          {/* Archive Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="mb-12 relative"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-6 h-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-jade/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-indigo-400/40 rounded-full"
                />
                <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full" />
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-jade-jade/50 to-transparent" />
              <motion.h2
                initial={{ opacity: 0, letterSpacing: "0.3em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ delay: 2.4, duration: 1 }}
                className="text-3xl font-extralight text-jade-jade tracking-wide"
              >
                Recent Dream Crystallizations
              </motion.h2>
            </div>
          </motion.div>

          {/* Interactive Dream Records */}
          <div className="space-y-8">
            {dreamRecords.map((dream, index) => {
              const getArchetypeVariant = () => {
                switch(dream.archetype) {
                  case 'shadow': return 'primary' as const;
                  case 'anima': return 'mystical' as const;
                  case 'sage': return 'sacred' as const;
                  case 'child': return 'neural' as const;
                  case 'hero': return 'secondary' as const;
                  case 'mother': return 'mystical' as const;
                  default: return 'primary' as const;
                }
              };

              const getLucidityLevel = () => {
                switch(dream.lucidity) {
                  case 'unconscious': return 'surface' as const;
                  case 'semi-aware': return 'deep' as const;
                  case 'lucid': return 'profound' as const;
                  case 'transcendent': return 'transcendent' as const;
                  default: return 'deep' as const;
                }
              };

              return (
                <motion.div
                  key={dream.id}
                  initial={{ opacity: 0, y: 20, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 2.5 + index * 0.3, duration: 0.8 }}
                >
                  <ConsciousnessVessel
                    variant={getArchetypeVariant()}
                    size="large"
                    depth={getLucidityLevel()}
                    rippleIntensity={dream.lucidity === 'transcendent' ? 'transcendent' : dream.lucidity === 'lucid' ? 'profound' : 'medium'}
                    title={`${dream.title} ${getLunarPhaseIcon(dream.lunarPhase)}`}
                    subtitle={`${dream.date} • ${dream.archetype} archetype • ${dream.lucidity} awareness`}
                    onClick={() => console.log(`Dream activated:`, dream.title)}
                    className="w-full"
                  >
                    <div className="space-y-6">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.7 + index * 0.3 }}
                        className="text-jade-jade leading-relaxed text-lg font-light tracking-wide"
                      >
                        {dream.essence}
                      </motion.p>

                      {/* Dream Symbols */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2.9 + index * 0.3 }}
                        className="flex flex-wrap gap-3"
                      >
                        {dream.symbols.map((symbol, symbolIndex) => (
                          <div
                            key={symbolIndex}
                            className="px-3 py-1 rounded-full text-xs font-light tracking-wide border border-jade-sage/30 bg-jade-forest/10 text-jade-mineral"
                          >
                            {symbol}
                          </div>
                        ))}
                      </motion.div>

                      {/* Dream Metrics */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 3.1 + index * 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-jade-sage/20"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-jade-jade/60" />
                          <span className="text-xs text-jade-mineral uppercase tracking-wider">
                            Sleep: {dream.sleepQuality}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400/60" />
                          <span className="text-xs text-jade-mineral uppercase tracking-wider">
                            {dream.duration}h duration
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-jade-malachite/60" />
                          <span className="text-xs text-jade-mineral uppercase tracking-wider">
                            {dream.emotion}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-jade-copper/60" />
                          <span className="text-xs text-jade-mineral uppercase tracking-wider">
                            {dream.lunarPhase} moon
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </ConsciousnessVessel>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}