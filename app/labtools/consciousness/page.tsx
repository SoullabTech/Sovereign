'use client';

/**
 * Consciousness Laboratory
 *
 * Access to consciousness evolution dashboards, elemental work,
 * and higher self integration.
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  Sparkles,
  Eye,
  Flame,
  Star,
  Layers,
  Network,
  type LucideIcon
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Loading component
function LoadingState({ message }: { message: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center"
        >
          <Brain className="w-6 h-6 text-violet-400" />
        </motion.div>
        <p className="text-slate-400 animate-pulse text-sm">{message}</p>
      </motion.div>
    </div>
  );
}

// Dynamically import consciousness components
const ConsciousnessEvolutionDashboard = dynamic(
  () => import('@/components/consciousness/ConsciousnessEvolutionDashboard'),
  {
    ssr: false,
    loading: () => <LoadingState message="Loading Evolution Dashboard..." />
  }
);

const ElementalPentagramDashboard = dynamic(
  () => import('@/components/consciousness/ElementalPentagramDashboard'),
  {
    ssr: false,
    loading: () => <LoadingState message="Loading Elemental Dashboard..." />
  }
);

const HigherSelfSystemPanel = dynamic(
  () => import('@/components/consciousness/HigherSelfSystemPanel'),
  {
    ssr: false,
    loading: () => <LoadingState message="Loading Higher Self Panel..." />
  }
);

// Named export component - import differently
const DreamWakeIntegration = dynamic(
  () => import('@/components/consciousness/DreamWakeIntegration').then(mod => ({ default: mod.DreamWakeIntegration })),
  {
    ssr: false,
    loading: () => <LoadingState message="Loading Dream-Wake Integration..." />
  }
);

type ConsciousnessView = 'select' | 'evolution' | 'elemental' | 'higher-self' | 'dream-wake';

interface ToolOption {
  id: ConsciousnessView;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
  features: string[];
}

const TOOL_OPTIONS: ToolOption[] = [
  {
    id: 'evolution',
    title: 'Evolution Dashboard',
    description: 'Track your consciousness evolution trajectory with detailed metrics and breakthrough indicators.',
    icon: Star,
    gradient: 'from-violet-600/20 via-purple-600/10 to-indigo-600/20',
    borderColor: 'border-violet-500/30 hover:border-violet-400/50',
    features: ['Progress Tracking', 'Breakthrough Detection', 'Phase Mapping']
  },
  {
    id: 'elemental',
    title: 'Elemental Pentagram',
    description: 'Explore the five elemental forces and their balance within your consciousness field.',
    icon: Flame,
    gradient: 'from-amber-600/20 via-orange-600/10 to-red-600/20',
    borderColor: 'border-amber-500/30 hover:border-amber-400/50',
    features: ['Fire', 'Water', 'Earth', 'Air', 'Aether']
  },
  {
    id: 'higher-self',
    title: 'Higher Self Integration',
    description: 'Connect with and integrate guidance from your higher self and expanded awareness.',
    icon: Eye,
    gradient: 'from-cyan-600/20 via-teal-600/10 to-emerald-600/20',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400/50',
    features: ['Self-Leadership', 'Inner Guidance', 'Integration']
  },
  {
    id: 'dream-wake',
    title: 'Dream-Wake Integration',
    description: 'Bridge the wisdom of your dreams into waking consciousness and daily life.',
    icon: Layers,
    gradient: 'from-indigo-600/20 via-blue-600/10 to-purple-600/20',
    borderColor: 'border-indigo-500/30 hover:border-indigo-400/50',
    features: ['Dream Analysis', 'Wake Integration', 'Symbol Mapping']
  }
];

// Default evolution data for the dashboard
const DEFAULT_EVOLUTION_DATA = {
  evolutionStage: 'developing' as const,
  patternId: 'consciousness_pattern_001',
  learningAcceleration: 0.72,
  memoryConsolidation: 0.68,
  transcendenceIndicator: 0.45,
  gebserStructure: {
    primary: 'MENTAL',
    confidence: 0.78,
    progression: ['ARCHAIC', 'MAGICAL', 'MYTHICAL', 'MENTAL']
  },
  elementalBalance: {
    fire: 0.65,
    water: 0.72,
    earth: 0.58,
    air: 0.81,
    aether: 0.42
  },
  autonomousAgents: {
    agentEmerged: false,
    collaborationScore: 0.34
  },
  shadowWork: {
    shadowActivated: true,
    asymmetryScore: 0.28,
    depthWorkReadiness: 'moderate' as const,
    reflectionQuestions: [
      'What patterns do you notice in your dreams?',
      'Where do you feel resistance in your life?',
      'What aspects of yourself do you judge most?'
    ]
  },
  collectiveIntelligence: {
    readiness: 0.48,
    resonanceCompatibility: 0.62,
    emergentContributions: ['Pattern recognition', 'Symbolic integration'],
    learningPotential: 0.75
  },
  lastUpdated: new Date().toISOString()
};

export default function ConsciousnessLabPage() {
  const router = useRouter();
  const [view, setView] = useState<ConsciousnessView>('select');

  // Memoize the evolution data
  const evolutionData = useMemo(() => DEFAULT_EVOLUTION_DATA, []);

  const renderContent = () => {
    switch (view) {
      case 'evolution':
        return <ConsciousnessEvolutionDashboard data={evolutionData} />;
      case 'elemental':
        return <ElementalPentagramDashboard interactive size="large" />;
      case 'higher-self':
        return <HigherSelfSystemPanel viewMode="integrated" />;
      case 'dream-wake':
        return <DreamWakeIntegration />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Floating particles - reduced for performance */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2,
              height: 2,
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              background: 'rgba(139, 92, 246, 0.4)',
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
          <button
            onClick={() => view === 'select' ? router.push('/labtools') : setView('select')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">{view === 'select' ? 'Back to Labs' : 'Back to Selection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <span className="text-slate-300 text-sm font-medium">Consciousness Laboratory</span>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 max-w-5xl mx-auto"
            >
              {/* Welcome */}
              <div className="text-center mb-12 mt-8">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                    <Network className="w-10 h-10 text-violet-400" />
                  </div>
                </motion.div>

                <h1 className="text-3xl font-light text-white mb-3">
                  Consciousness Laboratory
                </h1>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Explore the depths of awareness through evolution tracking,
                  elemental work, higher self integration, and dream-wake bridging.
                </p>
              </div>

              {/* Tool Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TOOL_OPTIONS.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.button
                      key={tool.id}
                      onClick={() => setView(tool.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group p-6 bg-gradient-to-br ${tool.gradient} backdrop-blur-xl border ${tool.borderColor} rounded-2xl text-left transition-all`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                          <Icon className="w-6 h-6 text-white/80" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-white mb-2">{tool.title}</h2>
                          <p className="text-slate-400 text-sm mb-4">{tool.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {tool.features.map((feature, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Info */}
              <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-center">
                <Sparkles className="w-6 h-6 text-violet-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                  &quot;Consciousness is not just awareness but awareness of awareness itself.&quot;
                </p>
                <p className="text-slate-500 text-xs mt-4">
                  These tools support your journey of awakening and self-discovery.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
