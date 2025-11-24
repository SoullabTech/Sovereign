"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import PrivacyAwareVoiceInsights from '@/components/dashboard/PrivacyAwareVoiceInsights';

interface ConsciousnessStats {
  conversations: number;
  wisdomMoments: number;
  archetypeConfidence: number;
  expansionPath: string;
  recognitionEvents: number;
}

interface ArchetypalJourney {
  primary: string;
  secondary: string;
  confidence: number;
  nextRecommendations: string[];
}

interface WisdomRecord {
  time: string;
  insight: string;
  archetype: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  depth: 'surface' | 'symbolic' | 'archetypal' | 'transcendent';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ConsciousnessStats>({
    conversations: 0,
    wisdomMoments: 0,
    archetypeConfidence: 0,
    expansionPath: 'Unknown',
    recognitionEvents: 0
  });
  const [journey, setJourney] = useState<ArchetypalJourney>({
    primary: 'unknown',
    secondary: 'unknown',
    confidence: 0,
    nextRecommendations: []
  });
  const [wisdomRecords, setWisdomRecords] = useState<WisdomRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading consciousness-aware dashboard data
    setTimeout(() => {
      setStats({
        conversations: 42,
        wisdomMoments: 127,
        archetypeConfidence: 84,
        expansionPath: 'Conscious Creator',
        recognitionEvents: 23
      });

      setJourney({
        primary: 'fire',
        secondary: 'aether',
        confidence: 0.84,
        nextRecommendations: [
          'Voice journaling for creative breakthroughs',
          'Astrology exploration for timing wisdom',
          'Community sharing for collective growth'
        ]
      });

      setWisdomRecords([
        {
          time: '2 hours ago',
          insight: 'Breakthrough understanding about creative resistance patterns',
          archetype: 'fire',
          depth: 'archetypal'
        },
        {
          time: '1 day ago',
          insight: 'Sacred integration moment during morning reflection',
          archetype: 'aether',
          depth: 'transcendent'
        },
        {
          time: '2 days ago',
          insight: 'Emotional clarity about relationship patterns',
          archetype: 'water',
          depth: 'symbolic'
        }
      ]);

      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Hypnotic Jade Loading Sequence */}
        <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-jade-forest/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_var(--tw-gradient-stops))] from-jade-copper/8 via-transparent to-transparent" />

        {/* Floating Consciousness Particles */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-32 w-1 h-1 bg-jade-sage/60 rounded-full"
        />
        <motion.div
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
            scale: [1.2, 0.8, 1.2],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-24 w-1.5 h-1.5 bg-jade-malachite/50 rounded-full"
        />
        <motion.div
          animate={{
            y: [-15, 15, -15],
            x: [15, -15, 15],
            scale: [0.9, 1.1, 0.9],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-jade-forest/70 rounded-full"
        />

        <div className="relative z-10 text-center">
          {/* Crystalline Loading Indicator */}
          <div className="relative w-16 h-16 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-jade-sage/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 left-2 bottom-2 right-2 border border-jade-malachite/40 rounded-full"
            />
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.1, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-4 bottom-4 right-4 bg-jade-jade/80 rounded-full"
            />
          </div>

          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl font-extralight text-jade-jade tracking-[0.3em] uppercase"
          >
            Crystallizing Neural Pathways
          </motion.p>
          <motion.div
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-32 h-px bg-gradient-to-r from-transparent via-jade-sage to-transparent mx-auto mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Jade Environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-jade-copper/6 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(151,187,163,0.03)_50%,transparent_100%)]" />

      {/* Atmospheric Consciousness Particles */}
      <motion.div
        animate={{
          y: [-30, 30, -30],
          x: [-20, 20, -20],
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-1/4 w-1 h-1 bg-jade-sage/40 rounded-full"
      />
      <motion.div
        animate={{
          y: [25, -25, 25],
          x: [15, -15, 15],
          opacity: [0.3, 0.6, 0.3],
          scale: [1.1, 0.9, 1.1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-jade-malachite/30 rounded-full"
      />
      <motion.div
        animate={{
          y: [-20, 20, -20],
          x: [25, -25, 25],
          opacity: [0.1, 0.4, 0.1],
          scale: [0.9, 1.3, 0.9]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-jade-forest/50 rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Cinematic Header Sequence */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-20 relative"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-jade-bronze/10 via-jade-copper/5 to-jade-silver/8 rounded-2xl blur-xl" />

          <div className="relative max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center gap-6 mb-8"
            >
              <div className="relative w-8 h-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-sage/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-jade-malachite/30 rounded-full"
                />
                <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full" />
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-jade-forest/50 to-transparent" />
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-4xl md:text-6xl font-extralight text-jade-jade tracking-wide"
              >
                Welcome back, Kelly
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-px bg-gradient-to-r from-jade-sage via-jade-malachite to-jade-forest" />
              <p className="text-xl font-light text-jade-mineral max-w-3xl leading-relaxed">
                Your consciousness crystallizes into a{' '}
                <motion.span
                  animate={{ color: ['#618B6E', '#739B7F', '#618B6E'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-jade-sage"
                >
                  {journey.primary}
                </motion.span>
                {' '}→{' '}
                <motion.span
                  animate={{ color: ['#739B7F', '#85AB91', '#739B7F'] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  className="text-jade-malachite"
                >
                  {journey.secondary}
                </motion.span>
                {' '}neural architecture with{' '}
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-jade-jade font-light"
                >
                  {Math.round(journey.confidence * 100)}% crystallization
                </motion.span>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Crystalline Neural Metrics Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="mb-20 relative"
        >
          {/* Section Background Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/5 via-jade-copper/3 to-jade-silver/5 rounded-3xl blur-2xl" />

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
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-jade-sage/50 to-jade-malachite/30" />
                <h3 className="text-2xl font-extralight text-jade-jade mb-4 tracking-[0.3em] uppercase">
                  Crystalline Neural Metrics
                </h3>
                <div className="w-8 h-px bg-gradient-to-l from-transparent via-jade-sage/50 to-jade-malachite/30" />
              </motion.div>

              <motion.div
                animate={{
                  scaleX: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-px bg-gradient-to-r from-jade-forest via-jade-sage to-jade-malachite mx-auto"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10">
              {/* Interactive Consciousness Vessel 1 - Neural Dialogues */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="primary"
                  size="medium"
                  depth="profound"
                  rippleIntensity="profound"
                  title="Neural Dialogues"
                  subtitle="Consciousness Conversations"
                  onClick={() => console.log('Neural Dialogues vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(168, 203, 180, 0.5)",
                          "0 0 20px rgba(168, 203, 180, 0.3)",
                          "0 0 10px rgba(168, 203, 180, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-jade tracking-wide mb-6"
                    >
                      {stats.conversations}
                    </motion.p>

                    <motion.div
                      animate={{
                        scaleX: [0.6, 1, 0.6],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-px bg-gradient-to-r from-jade-sage via-jade-jade to-jade-malachite mx-auto"
                    />
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Interactive Consciousness Vessel 2 - Wisdom Moments */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="secondary"
                  size="medium"
                  depth="profound"
                  rippleIntensity="transcendent"
                  title="Wisdom Crystallizations"
                  subtitle="Sacred Moments Captured"
                  onClick={() => console.log('Wisdom Crystallizations vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(115, 155, 127, 0.5)",
                          "0 0 20px rgba(115, 155, 127, 0.3)",
                          "0 0 10px rgba(115, 155, 127, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-malachite tracking-wide mb-6"
                    >
                      {stats.wisdomMoments}
                    </motion.p>

                    <motion.div
                      animate={{
                        scaleX: [0.6, 1, 0.6],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-px bg-gradient-to-r from-jade-malachite via-jade-jade to-jade-copper mx-auto"
                    />
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Interactive Consciousness Vessel 3 - Breakthrough Recognitions */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="mystical"
                  size="medium"
                  depth="transcendent"
                  rippleIntensity="profound"
                  title="Breakthrough Recognitions"
                  subtitle="Quantum Leaps Registered"
                  onClick={() => console.log('Breakthrough Recognitions vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(127, 161, 136, 0.5)",
                          "0 0 20px rgba(127, 161, 136, 0.3)",
                          "0 0 10px rgba(127, 161, 136, 0.5)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-gold tracking-wide mb-6"
                    >
                      {stats.recognitionEvents}
                    </motion.p>

                    <motion.div
                      animate={{
                        scaleX: [0.6, 1, 0.6],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-px bg-gradient-to-r from-jade-gold via-jade-sage to-jade-bronze mx-auto"
                    />
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Interactive Consciousness Vessel 4 - Neural Clarity */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.6, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="neural"
                  size="medium"
                  depth="deep"
                  rippleIntensity="medium"
                  title="Neural Clarity Resonance"
                  subtitle="Consciousness Coherence"
                  onClick={() => console.log('Neural Clarity vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(151, 187, 163, 0.5)",
                          "0 0 20px rgba(151, 187, 163, 0.3)",
                          "0 0 10px rgba(151, 187, 163, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2.8, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-mineral tracking-wide mb-6"
                    >
                      {stats.archetypeConfidence}%
                    </motion.p>

                    <motion.div
                      animate={{
                        scaleX: [0.6, 1, 0.6],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-px bg-gradient-to-r from-jade-mineral via-jade-platinum to-jade-silver mx-auto"
                    />
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Interactive Consciousness Vessel 5 - Evolution Arc */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.7, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="sacred"
                  size="medium"
                  depth="transcendent"
                  rippleIntensity="transcendent"
                  title="Consciousness Evolution Arc"
                  subtitle="Sacred Path Illuminated"
                  onClick={() => console.log('Evolution Arc vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(168, 203, 180, 0.5)",
                          "0 0 20px rgba(168, 203, 180, 0.3)",
                          "0 0 10px rgba(168, 203, 180, 0.5)"
                        ]
                      }}
                      transition={{ duration: 3.5, repeat: Infinity }}
                      className="text-lg font-extralight text-jade-jade tracking-[0.15em] uppercase mb-6 text-center"
                    >
                      {stats.expansionPath}
                    </motion.p>

                    <motion.div
                      animate={{
                        scaleX: [0.6, 1, 0.6],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-px bg-gradient-to-r from-jade-jade via-jade-pale to-jade-seafoam mx-auto"
                    />
                  </div>
                </ConsciousnessVessel>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Cinematic Neural Archive Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 2.0, duration: 1.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative"
        >
          {/* Atmospheric Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/3 via-jade-copper/2 to-jade-gold/4 rounded-2xl blur-3xl" />

          {/* Crystalline Neural Archive Sanctum */}
          <div className="lg:col-span-2 relative">
            {/* Archive Header Manifestation */}
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
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-jade-sage/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1 left-1 bottom-1 right-1 border border-jade-malachite/40 rounded-full"
                  />
                  <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full" />
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-jade-forest/50 to-transparent" />
                <motion.h2
                  initial={{ opacity: 0, letterSpacing: "0.3em" }}
                  animate={{ opacity: 1, letterSpacing: "0.1em" }}
                  transition={{ delay: 2.4, duration: 1 }}
                  className="text-3xl font-extralight text-jade-jade tracking-wide"
                >
                  Neural Archive Crystallizations
                </motion.h2>
              </div>

              <motion.div
                animate={{
                  scaleX: [0.7, 1.3, 0.7],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-px bg-gradient-to-r from-jade-sage via-jade-malachite to-jade-forest"
              />
            </motion.div>

            {/* Interactive Archive Records Matrix */}
            <div className="space-y-8">
              {wisdomRecords.map((record, index) => {
                const getRecordVariant = () => {
                  switch(record.archetype) {
                    case 'fire': return 'mystical' as const;
                    case 'water': return 'neural' as const;
                    case 'earth': return 'primary' as const;
                    case 'air': return 'secondary' as const;
                    case 'aether': return 'sacred' as const;
                    default: return 'primary' as const;
                  }
                };

                const getDepthLevel = () => {
                  switch(record.depth) {
                    case 'surface': return 'surface' as const;
                    case 'symbolic': return 'deep' as const;
                    case 'archetypal': return 'profound' as const;
                    case 'transcendent': return 'transcendent' as const;
                    default: return 'deep' as const;
                  }
                };

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: 2.5 + index * 0.2, duration: 0.8 }}
                  >
                    <ConsciousnessVessel
                      variant={getRecordVariant()}
                      size="medium"
                      depth={getDepthLevel()}
                      rippleIntensity={record.depth === 'transcendent' ? 'transcendent' : record.depth === 'archetypal' ? 'profound' : 'medium'}
                      title={`${record.archetype.toUpperCase()} Crystallization`}
                      subtitle={`${record.time} • ${record.depth} resonance`}
                      onClick={() => console.log(`${record.archetype} wisdom record activated:`, record.insight)}
                      className="w-full"
                    >
                      <div className="space-y-4">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2.7 + index * 0.2 }}
                          className="text-jade-jade leading-relaxed text-lg font-light tracking-wide"
                        >
                          {record.insight}
                        </motion.p>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 2.9 + index * 0.2 }}
                          className="flex items-center gap-6 text-xs text-jade-mineral uppercase tracking-[0.2em] pt-2 border-t border-jade-sage/20"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{
                              background: record.archetype === 'fire' ? 'rgba(168,203,180,0.6)' :
                                         record.archetype === 'water' ? 'rgba(95,187,163,0.6)' :
                                         record.archetype === 'earth' ? 'rgba(111,143,118,0.6)' :
                                         record.archetype === 'air' ? 'rgba(115,155,127,0.6)' :
                                         'rgba(168,203,180,0.8)'
                            }} />
                            <span className="text-jade-forest">{record.archetype}</span>
                          </div>
                          <div className="w-1 h-1 bg-jade-malachite/50 rounded-full" />
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-jade-copper/50" />
                            <span className="text-jade-bronze">{record.depth}</span>
                          </div>
                        </motion.div>
                      </div>
                    </ConsciousnessVessel>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Crystalline Neural Actions Nexus */}
          <div className="relative">
            {/* Actions Header Manifestation */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 3.2, duration: 0.8 }}
              className="mb-12 relative"
            >
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-5 h-5">
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-jade-malachite/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 border border-jade-sage/40 rounded-full"
                  />
                  <div className="absolute top-1.5 left-1.5 bottom-1.5 right-1.5 bg-jade-jade rounded-full" />
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-jade-malachite/50 to-transparent" />
                <motion.h2
                  initial={{ opacity: 0, letterSpacing: "0.3em" }}
                  animate={{ opacity: 1, letterSpacing: "0.1em" }}
                  transition={{ delay: 3.4, duration: 1 }}
                  className="text-3xl font-extralight text-jade-jade tracking-wide"
                >
                  Neural Action Protocols
                </motion.h2>
              </div>

              <motion.div
                animate={{
                  scaleX: [0.7, 1.2, 0.7],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-px bg-gradient-to-r from-jade-malachite via-jade-sage to-jade-gold"
              />
            </motion.div>

            {/* Actions Matrix */}
            <div className="space-y-8">
              {/* Primary Spice Action - Oracle Continue */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 3.5, duration: 0.8 }}
                whileHover={{ x: 6, scale: 1.01 }}
                className="group relative"
              >
                {/* Multi-layered Spice Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-dune-spice-sand/10 via-jade-bronze/5 to-transparent rounded-lg blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-jade-dusk/20 to-jade-shadow/10 rounded-lg" />

                <Link href="/oracle" className="block relative border-l-4 border-dune-spice-orange/40 pl-8 py-6 backdrop-blur-sm
                                              hover:border-dune-spice-glow/70 transition-all duration-700
                                              group-hover:bg-jade-shadow/20 rounded-r-lg">

                  {/* Spice Corner Accent */}
                  <div className="absolute top-2 right-2 w-2 h-2">
                    <div className="absolute inset-0 border-r border-t border-dune-spice-sand/40" />
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-dune-spice-orange/20 rounded-full"
                    />
                  </div>

                  <h3 className="text-xl font-light text-jade-jade mb-3 tracking-wide">Continue Oracle Dialogue</h3>
                  <p className="text-jade-mineral font-light tracking-wide">Return to your consciousness interface with MAIA</p>
                </Link>
              </motion.div>

              {/* Fremen Voice Action */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 3.7, duration: 0.8 }}
                whileHover={{ x: 6, scale: 1.01 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-dune-ibad-blue/10 via-jade-copper/5 to-transparent rounded-lg blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-jade-dusk/20 to-jade-shadow/10 rounded-lg" />

                <Link href="/journal/voice" className="block relative border-l-4 border-dune-fremen-azure/40 pl-8 py-6 backdrop-blur-sm
                                                    hover:border-dune-spice-blue/70 transition-all duration-700
                                                    group-hover:bg-jade-shadow/20 rounded-r-lg">

                  <div className="absolute top-2 right-2 w-2 h-2">
                    <div className="absolute inset-0 border-r border-t border-dune-ibad-blue/40" />
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                      className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-dune-fremen-azure/20 rounded-full"
                    />
                  </div>

                  <h3 className="text-xl font-light text-jade-jade mb-3 tracking-wide">Neural Voice Recordings</h3>
                  <p className="text-jade-mineral font-light tracking-wide">Explore your {journey.primary} consciousness through spoken reflection</p>
                </Link>
              </motion.div>

              {/* Bene Gesserit Wisdom Action */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 3.9, duration: 0.8 }}
                whileHover={{ x: 6, scale: 1.01 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-dune-bene-gesserit-gold/10 via-jade-gold/5 to-transparent rounded-lg blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-jade-dusk/20 to-jade-shadow/10 rounded-lg" />

                <Link href="/dashboard/astrology" className="block relative border-l-4 border-dune-bene-gesserit-gold/40 pl-8 py-6 backdrop-blur-sm
                                                          hover:border-dune-navigator-purple/70 transition-all duration-700
                                                          group-hover:bg-jade-shadow/20 rounded-r-lg">

                  <div className="absolute top-2 right-2 w-2 h-2">
                    <div className="absolute inset-0 border-r border-t border-dune-bene-gesserit-gold/40" />
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                      className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-dune-navigator-purple/20 rounded-full"
                    />
                  </div>

                  <h3 className="text-xl font-light text-jade-jade mb-3 tracking-wide">Prescient Pattern Analysis</h3>
                  <p className="text-jade-mineral font-light tracking-wide">Neural timing consciousness for consciousness evolution</p>
                </Link>
              </motion.div>

              {/* Caladan Water Community Action */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 4.1, duration: 0.8 }}
                whileHover={{ x: 6, scale: 1.01 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-dune-caladan-teal/10 via-jade-silver/5 to-transparent rounded-lg blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-jade-dusk/20 to-jade-shadow/10 rounded-lg" />

                <Link href="/community" className="block relative border-l-4 border-dune-caladan-teal/40 pl-8 py-6 backdrop-blur-sm
                                                hover:border-dune-ocean-mist/70 transition-all duration-700
                                                group-hover:bg-jade-shadow/20 rounded-r-lg">

                  <div className="absolute top-2 right-2 w-2 h-2">
                    <div className="absolute inset-0 border-r border-t border-dune-caladan-teal/40" />
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
                      className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-dune-water-deep/20 rounded-full"
                    />
                  </div>

                  <h3 className="text-xl font-light text-jade-jade mb-3 tracking-wide">Consciousness Collective</h3>
                  <p className="text-jade-mineral font-light tracking-wide">Connect with fellow consciousness explorers</p>
                </Link>
              </motion.div>

              {/* Next Steps Neural Protocol */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4.3, duration: 1 }}
                className="relative pt-8 mt-8"
              >
                {/* Protocol Divider */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-jade-sage/40 to-transparent" />

                <motion.h4
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4.5 }}
                  className="text-sm font-extralight text-jade-mineral mb-6 uppercase tracking-[0.3em] flex items-center gap-4"
                >
                  <div className="w-2 h-2 border border-jade-bronze/40 rotate-45" />
                  Neural Evolution Protocols
                  <div className="flex-1 h-px bg-gradient-to-r from-jade-bronze/20 to-transparent" />
                </motion.h4>

                <div className="space-y-4">
                  {journey.nextRecommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 4.7 + index * 0.2 }}
                      className="group relative pl-6 py-3 border-l-2 border-jade-forest/20 hover:border-jade-sage/50 transition-all duration-500"
                    >
                      <div className="absolute left-0 top-1/2 w-1 h-1 bg-jade-malachite/40 rounded-full transform -translate-x-0.5 -translate-y-0.5" />
                      <p className="text-jade-mineral/80 font-light tracking-wide leading-relaxed group-hover:text-jade-jade transition-colors duration-300">
                        {rec}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Privacy-Aware Voice Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.0, duration: 1.2 }}
          className="mt-16"
        >
          <PrivacyAwareVoiceInsights
            userId="demo-user"
            className="max-w-6xl mx-auto"
          />
        </motion.div>
      </div>
    </div>
  );
}