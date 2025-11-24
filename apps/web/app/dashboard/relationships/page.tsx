"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import NeuralFireSystem from '@/components/consciousness/NeuralFireSystem';

interface RelationshipRecord {
  id: string;
  name: string;
  type: 'romantic' | 'family' | 'friend' | 'mentor' | 'colleague' | 'community';
  archetype: 'lover' | 'sage' | 'companion' | 'guide' | 'ally' | 'mirror';
  connectionStrength: number; // 1-100
  harmonyLevel: number; // 1-100
  growthPotential: number; // 1-100
  lastInteraction: string;
  emotionalResonance: 'joy' | 'peace' | 'growth' | 'challenge' | 'transformation';
  energyExchange: 'giving' | 'receiving' | 'balanced' | 'draining' | 'nourishing';
  consciousnessPattern: 'expanding' | 'deepening' | 'healing' | 'creating' | 'integrating';
  sacredLessons: string[];
  currentPhase: 'initiation' | 'exploration' | 'deepening' | 'integration' | 'transformation' | 'completion';
}

interface RelationshipMetrics {
  totalConnections: number;
  harmoniousRelationships: number;
  avgConnectionStrength: number;
  consciousnessExpansion: number;
  sacredMirrorMoments: number;
  energyBalance: number;
}

export default function RelationshipMatrixPage() {
  const [relationships, setRelationships] = useState<RelationshipRecord[]>([]);
  const [metrics, setMetrics] = useState<RelationshipMetrics>({
    totalConnections: 0,
    harmoniousRelationships: 0,
    avgConnectionStrength: 0,
    consciousnessExpansion: 0,
    sacredMirrorMoments: 0,
    energyBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'romantic' | 'family' | 'friend' | 'mentor'>('all');

  useEffect(() => {
    // Simulate loading relationship consciousness data
    setTimeout(() => {
      setMetrics({
        totalConnections: 23,
        harmoniousRelationships: 18,
        avgConnectionStrength: 84,
        consciousnessExpansion: 92,
        sacredMirrorMoments: 47,
        energyBalance: 88
      });

      setRelationships([
        {
          id: '1',
          name: 'Sarah',
          type: 'romantic',
          archetype: 'lover',
          connectionStrength: 95,
          harmonyLevel: 89,
          growthPotential: 97,
          lastInteraction: '2 hours ago',
          emotionalResonance: 'joy',
          energyExchange: 'balanced',
          consciousnessPattern: 'expanding',
          sacredLessons: ['Deep Vulnerability', 'Sacred Partnership', 'Conscious Love'],
          currentPhase: 'deepening'
        },
        {
          id: '2',
          name: 'Michael',
          type: 'mentor',
          archetype: 'sage',
          connectionStrength: 87,
          harmonyLevel: 94,
          growthPotential: 92,
          lastInteraction: '3 days ago',
          emotionalResonance: 'growth',
          energyExchange: 'receiving',
          consciousnessPattern: 'deepening',
          sacredLessons: ['Wisdom Integration', 'Archetypal Understanding', 'Sacred Masculine'],
          currentPhase: 'integration'
        },
        {
          id: '3',
          name: 'Luna',
          type: 'friend',
          archetype: 'companion',
          connectionStrength: 78,
          harmonyLevel: 82,
          growthPotential: 85,
          lastInteraction: '1 day ago',
          emotionalResonance: 'peace',
          energyExchange: 'nourishing',
          consciousnessPattern: 'healing',
          sacredLessons: ['Soul Friendship', 'Emotional Safety', 'Creative Expression'],
          currentPhase: 'exploration'
        },
        {
          id: '4',
          name: 'Dad',
          type: 'family',
          archetype: 'guide',
          connectionStrength: 72,
          harmonyLevel: 68,
          growthPotential: 89,
          lastInteraction: '5 days ago',
          emotionalResonance: 'transformation',
          energyExchange: 'healing',
          consciousnessPattern: 'integrating',
          sacredLessons: ['Ancestral Healing', 'Forgiveness Practice', 'Masculine Integration'],
          currentPhase: 'transformation'
        },
        {
          id: '5',
          name: 'Elena',
          type: 'colleague',
          archetype: 'ally',
          connectionStrength: 65,
          harmonyLevel: 73,
          growthPotential: 77,
          lastInteraction: '6 hours ago',
          emotionalResonance: 'growth',
          energyExchange: 'balanced',
          consciousnessPattern: 'creating',
          sacredLessons: ['Professional Boundaries', 'Creative Collaboration', 'Conscious Communication'],
          currentPhase: 'exploration'
        }
      ]);

      setLoading(false);
    }, 1800);
  }, []);

  // Get relationship type colors and variants
  const getRelationshipVariant = (type: string, archetype: string) => {
    if (type === 'romantic') return 'sacred' as const;
    if (type === 'mentor' || archetype === 'sage') return 'mystical' as const;
    if (type === 'family') return 'primary' as const;
    if (type === 'friend') return 'neural' as const;
    return 'secondary' as const;
  };

  const getConnectionDepth = (strength: number) => {
    if (strength >= 90) return 'transcendent' as const;
    if (strength >= 80) return 'profound' as const;
    if (strength >= 70) return 'deep' as const;
    return 'surface' as const;
  };

  const getRippleIntensity = (harmonyLevel: number, growthPotential: number) => {
    const combined = (harmonyLevel + growthPotential) / 2;
    if (combined >= 90) return 'transcendent' as const;
    if (combined >= 80) return 'profound' as const;
    if (combined >= 70) return 'medium' as const;
    return 'subtle' as const;
  };

  // Filter relationships
  const filteredRelationships = selectedFilter === 'all'
    ? relationships
    : relationships.filter(r => r.type === selectedFilter);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Relationship Loading Environment */}
        <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-rose-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent" />

        {/* Connection Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-25, 25, -25],
              x: [-15, 15, -15],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.8, 1.4, 0.8]
            }}
            transition={{
              duration: 5 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
            className="absolute w-1 h-1 bg-rose-300/40 rounded-full"
            style={{
              left: `${15 + (i * 5)}%`,
              top: `${25 + Math.sin(i * 0.8) * 25}%`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}

        <div className="relative z-10 text-center">
          {/* Connection Loading Indicator */}
          <motion.div className="relative w-24 h-24 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-jade-jade/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-3 left-3 bottom-3 right-3 border border-rose-400/40 rounded-full"
            />
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.3, 0.8]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 left-6 bottom-6 right-6 bg-gradient-to-br from-jade-jade/60 to-rose-400/60 rounded-full flex items-center justify-center text-3xl"
            >
              💖
            </motion.div>
          </motion.div>

          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl font-extralight text-jade-jade tracking-[0.3em] uppercase"
          >
            Mapping Relationship Consciousness
          </motion.p>
          <motion.div
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-40 h-px bg-gradient-to-r from-transparent via-jade-jade to-transparent mx-auto mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Relationship Consciousness Environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-rose-900/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-jade-forest/6 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-rose-500/5 via-transparent to-transparent" />

      {/* Interpersonal Neural Activity */}
      <NeuralFireSystem
        isActive={true}
        density="moderate"
        firingRate="moderate"
        variant="mystical"
        className="opacity-20"
      />

      {/* Floating Love Particles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-35, 35, -35],
            x: [-25, 25, -25],
            opacity: [0.1, 0.5, 0.1],
            scale: [0.4, 1.2, 0.4]
          }}
          transition={{
            duration: 10 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15
          }}
          className="absolute w-0.5 h-0.5 rounded-full"
          style={{
            left: `${8 + (i * 3.5)}%`,
            top: `${15 + Math.sin(i * 0.7) * 35}%`,
            background: i % 3 === 0 ? 'rgba(251,207,232,0.4)' : i % 3 === 1 ? 'rgba(168,203,180,0.3)' : 'rgba(147,197,253,0.3)',
            filter: 'blur(0.5px)'
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Relationship Header Consciousness */}
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
              <div className="relative w-12 h-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-jade/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-rose-400/30 rounded-full"
                />
                <div className="absolute top-3 left-3 bottom-3 right-3 flex items-center justify-center text-3xl">
                  💖
                </div>
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-jade-jade/50 to-transparent" />
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-5xl md:text-7xl font-extralight text-jade-jade tracking-wide"
              >
                Relationship Matrix
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex items-center gap-6"
            >
              <div className="w-20 h-px bg-gradient-to-r from-jade-jade via-rose-400 to-jade-malachite" />
              <p className="text-xl font-light text-jade-mineral max-w-4xl leading-relaxed">
                Where interpersonal consciousness crystallizes into{' '}
                <motion.span
                  animate={{ color: ['#6F8F76', '#F3B8D1', '#A8CBB4', '#6F8F76'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="text-jade-jade"
                >
                  sacred connection vessels
                </motion.span>
                {' '}that mirror the depth of human bonds. Each relationship becomes a{' '}
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="text-rose-300 font-light"
                >
                  living portal of growth
                </motion.span>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Relationship Metrics Matrix */}
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
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-jade-jade/50 to-rose-400/30" />
                <h3 className="text-2xl font-extralight text-jade-jade mb-4 tracking-[0.3em] uppercase">
                  Connection Consciousness Metrics
                </h3>
                <div className="w-12 h-px bg-gradient-to-l from-transparent via-jade-jade/50 to-rose-400/30" />
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
              {/* Connection Vessels */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="sacred"
                  size="medium"
                  depth="profound"
                  rippleIntensity="transcendent"
                  title="Sacred Connections"
                  subtitle="Total Soul Bonds"
                  onClick={() => console.log('Total Connections vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4 text-4xl">💖</div>
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 15px rgba(251, 207, 232, 0.6)",
                          "0 0 25px rgba(251, 207, 232, 0.3)",
                          "0 0 15px rgba(251, 207, 232, 0.6)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-jade tracking-wide mb-6"
                    >
                      {metrics.totalConnections}
                    </motion.p>
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Harmonious Relationships */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="mystical"
                  size="medium"
                  depth="profound"
                  rippleIntensity="profound"
                  title="Harmony Vessels"
                  subtitle="Balanced Connections"
                  onClick={() => console.log('Harmonious Relationships vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4 text-4xl">🕊️</div>
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 15px rgba(168, 203, 180, 0.7)",
                          "0 0 25px rgba(168, 203, 180, 0.4)",
                          "0 0 15px rgba(168, 203, 180, 0.7)"
                        ]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-malachite tracking-wide mb-6"
                    >
                      {metrics.harmoniousRelationships}
                    </motion.p>
                  </div>
                </ConsciousnessVessel>
              </motion.div>

              {/* Consciousness Expansion */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
              >
                <ConsciousnessVessel
                  variant="neural"
                  size="medium"
                  depth="transcendent"
                  rippleIntensity="medium"
                  title="Consciousness Expansion"
                  subtitle="Growth Through Connection"
                  onClick={() => console.log('Consciousness Expansion vessel activated')}
                  className="h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4 text-4xl">🌟</div>
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 15px rgba(95, 187, 163, 0.8)",
                          "0 0 25px rgba(95, 187, 163, 0.5)",
                          "0 0 15px rgba(95, 187, 163, 0.8)"
                        ]
                      }}
                      transition={{ duration: 3.5, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-forest tracking-wide mb-6"
                    >
                      {metrics.consciousnessExpansion}%
                    </motion.p>
                  </div>
                </ConsciousnessVessel>
              </motion.div>
            </div>

            {/* Relationship Filter Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="flex justify-center gap-4 mb-12"
            >
              {['all', 'romantic', 'family', 'friend', 'mentor'].map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFilter(filter as any)}
                  className={`px-6 py-3 rounded-full text-sm font-light tracking-wide transition-all duration-300
                    ${selectedFilter === filter
                      ? 'bg-jade-forest/30 text-jade-jade border border-jade-sage/50'
                      : 'bg-jade-shadow/20 text-jade-mineral border border-jade-forest/20 hover:border-jade-sage/30'
                    }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Individual Relationship Vessels */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 2.0, duration: 1.2 }}
          className="relative"
        >
          {/* Header */}
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
                  transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-jade/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-rose-400/40 rounded-full"
                />
                <div className="absolute top-2 left-2 bottom-2 right-2 bg-gradient-to-br from-jade-jade to-rose-400 rounded-full" />
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-jade-jade/50 to-transparent" />
              <motion.h2
                initial={{ opacity: 0, letterSpacing: "0.3em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ delay: 2.4, duration: 1 }}
                className="text-3xl font-extralight text-jade-jade tracking-wide"
              >
                Sacred Connection Vessels
              </motion.h2>
            </div>
          </motion.div>

          {/* Relationship Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {filteredRelationships.map((relationship, index) => (
              <motion.div
                key={relationship.id}
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 2.5 + index * 0.2, duration: 0.8 }}
              >
                <ConsciousnessVessel
                  variant={getRelationshipVariant(relationship.type, relationship.archetype)}
                  size="large"
                  depth={getConnectionDepth(relationship.connectionStrength)}
                  rippleIntensity={getRippleIntensity(relationship.harmonyLevel, relationship.growthPotential)}
                  title={`${relationship.name} • ${relationship.archetype}`}
                  subtitle={`${relationship.type} • ${relationship.currentPhase} phase • ${relationship.lastInteraction}`}
                  onClick={() => console.log(`Relationship activated:`, relationship.name)}
                  className="w-full"
                >
                  <div className="space-y-6">
                    {/* Connection Strength Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ duration: 2 + index * 0.3, repeat: Infinity }}
                          className="text-2xl font-extralight text-jade-jade mb-2"
                        >
                          {relationship.connectionStrength}%
                        </motion.div>
                        <div className="text-xs text-jade-mineral uppercase tracking-wider">Connection</div>
                      </div>
                      <div className="text-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ duration: 2.5 + index * 0.3, repeat: Infinity }}
                          className="text-2xl font-extralight text-jade-malachite mb-2"
                        >
                          {relationship.harmonyLevel}%
                        </motion.div>
                        <div className="text-xs text-jade-mineral uppercase tracking-wider">Harmony</div>
                      </div>
                      <div className="text-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ duration: 3 + index * 0.3, repeat: Infinity }}
                          className="text-2xl font-extralight text-rose-300 mb-2"
                        >
                          {relationship.growthPotential}%
                        </motion.div>
                        <div className="text-xs text-jade-mineral uppercase tracking-wider">Growth</div>
                      </div>
                    </div>

                    {/* Sacred Lessons */}
                    <div>
                      <div className="text-sm text-jade-sage mb-3 uppercase tracking-wider">Sacred Lessons</div>
                      <div className="flex flex-wrap gap-2">
                        {relationship.sacredLessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="px-3 py-1 rounded-full text-xs font-light tracking-wide border border-jade-sage/30 bg-jade-forest/10 text-jade-jade"
                          >
                            {lesson}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Relationship Dynamics */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-jade-sage/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-jade-jade/60" />
                        <span className="text-xs text-jade-mineral uppercase tracking-wider">
                          {relationship.emotionalResonance}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-400/60" />
                        <span className="text-xs text-jade-mineral uppercase tracking-wider">
                          {relationship.energyExchange}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-jade-malachite/60" />
                        <span className="text-xs text-jade-mineral uppercase tracking-wider">
                          {relationship.consciousnessPattern}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-jade-copper/60" />
                        <span className="text-xs text-jade-mineral uppercase tracking-wider">
                          {relationship.currentPhase}
                        </span>
                      </div>
                    </div>
                  </div>
                </ConsciousnessVessel>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}