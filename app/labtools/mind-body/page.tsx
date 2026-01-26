'use client';

/**
 * Mind-Body Labs Hub
 *
 * Organized around the 7 Levels Framework with accessible entry points.
 * Foundation (Levels 1-2) → Heart & Expression (3-5) → Vision & Unity (6-7)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  Moon,
  Brain,
  Heart,
  CircleDot,
  Mic,
  Eye,
  Star,
  Network,
  Sparkles,
  ChevronRight,
  Layers
} from 'lucide-react';

interface LabItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: 'active' | 'coming-soon';
}

interface LabTier {
  id: string;
  title: string;
  subtitle: string;
  levels: string;
  description: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  icon: React.ReactNode;
  labs: LabItem[];
}

const LAB_TIERS: LabTier[] = [
  {
    id: 'foundation',
    title: 'Foundation',
    subtitle: 'Body & Emotions',
    levels: 'Levels 1-2',
    description: 'Ground your practice in physical awareness, sleep optimization, and dream exploration.',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGradient: 'from-emerald-600/20 via-teal-600/10 to-cyan-600/20',
    icon: <Activity className="w-6 h-6" />,
    labs: [
      {
        id: 'biometrics',
        title: 'Biometrics Dashboard',
        description: 'HRV, coherence, circadian rhythms & body intelligence',
        icon: <Activity className="w-5 h-5 text-emerald-400" />,
        path: '/labtools/biometrics',
        status: 'active'
      },
      {
        id: 'sleep',
        title: 'Sleep Analytics',
        description: 'Sleep patterns, stages & optimization recommendations',
        icon: <Moon className="w-5 h-5 text-blue-400" />,
        path: '/labtools/dreams',
        status: 'active'
      },
      {
        id: 'dreams',
        title: 'Dreams Laboratory',
        description: 'Dream journaling, morning capture & archetypal analysis',
        icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
        path: '/labtools/dreams',
        status: 'active'
      }
    ]
  },
  {
    id: 'heart-expression',
    title: 'Heart & Expression',
    subtitle: 'Power, Love & Truth',
    levels: 'Levels 3-5',
    description: 'Cultivate emotional coherence, heart intelligence, and authentic expression.',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgGradient: 'from-rose-600/20 via-pink-600/10 to-orange-600/20',
    icon: <Heart className="w-6 h-6" />,
    labs: [
      {
        id: 'meditation',
        title: 'Meditation Laboratory',
        description: 'Sacred geometry, presence practices & awakening states',
        icon: <CircleDot className="w-5 h-5 text-purple-400" />,
        path: '/labtools/meditation',
        status: 'active'
      },
      {
        id: 'coherence',
        title: 'Emotional Coherence',
        description: 'Heart-brain synchronization & emotional mastery',
        icon: <Heart className="w-5 h-5 text-rose-400" />,
        path: '/labtools/biometrics',
        status: 'active'
      },
      {
        id: 'voice',
        title: 'Voice & Expression',
        description: 'Authentic voice work & communication practices',
        icon: <Mic className="w-5 h-5 text-amber-400" />,
        path: '/labtools/voice',
        status: 'coming-soon'
      }
    ]
  },
  {
    id: 'vision-unity',
    title: 'Vision & Unity',
    subtitle: 'Intuition & Transcendence',
    levels: 'Levels 6-7',
    description: 'Access higher guidance, consciousness evolution, and collective intelligence.',
    color: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    bgGradient: 'from-violet-600/20 via-purple-600/10 to-indigo-600/20',
    icon: <Eye className="w-6 h-6" />,
    labs: [
      {
        id: 'consciousness',
        title: 'Consciousness Evolution',
        description: 'Gebser structures, elemental balance & evolution tracking',
        icon: <Brain className="w-5 h-5 text-violet-400" />,
        path: '/labtools/consciousness',
        status: 'active'
      },
      {
        id: 'higher-self',
        title: 'Higher Self Integration',
        description: 'Inner guidance, self-leadership & expanded awareness',
        icon: <Eye className="w-5 h-5 text-cyan-400" />,
        path: '/labtools/consciousness',
        status: 'active'
      },
      {
        id: 'collective',
        title: 'Collective Field',
        description: 'Field analytics, synchronicity & collective intelligence',
        icon: <Network className="w-5 h-5 text-indigo-400" />,
        path: '/labtools/field-analytics',
        status: 'coming-soon'
      }
    ]
  }
];

export default function MindBodyLabsHub() {
  const router = useRouter();
  const [expandedTier, setExpandedTier] = useState<string | null>('foundation');

  const handleLabClick = (lab: LabItem) => {
    if (lab.status === 'active') {
      router.push(lab.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Labs</span>
          </button>

          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400" />
            <span className="text-slate-300 text-sm font-medium">Mind-Body Labs</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 via-rose-500/20 to-emerald-500/20 flex items-center justify-center border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/30 via-rose-500/30 to-emerald-500/30 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white/80" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-light text-white mb-3"
            >
              Mind-Body Laboratory
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 max-w-lg mx-auto"
            >
              Integrated tools for consciousness exploration across the seven levels
              of human development.
            </motion.p>
          </div>

          {/* Tier Cards */}
          <div className="space-y-4">
            {LAB_TIERS.map((tier, tierIndex) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * tierIndex }}
              >
                {/* Tier Header */}
                <button
                  onClick={() => setExpandedTier(expandedTier === tier.id ? null : tier.id)}
                  className={`w-full p-5 bg-gradient-to-br ${tier.bgGradient} backdrop-blur-xl border ${tier.borderColor} rounded-2xl text-left transition-all hover:border-opacity-60`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center ${tier.color}`}>
                        {tier.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-white">{tier.title}</h2>
                          <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded-full">
                            {tier.levels}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">{tier.subtitle}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedTier === tier.id ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </motion.div>
                  </div>

                  <p className="text-slate-500 text-sm mt-3 ml-16">
                    {tier.description}
                  </p>
                </button>

                {/* Expanded Labs */}
                <AnimatePresence>
                  {expandedTier === tier.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pl-4 space-y-2">
                        {tier.labs.map((lab, labIndex) => (
                          <motion.button
                            key={lab.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * labIndex }}
                            onClick={() => handleLabClick(lab)}
                            disabled={lab.status === 'coming-soon'}
                            className={`w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all flex items-center gap-4 group ${
                              lab.status === 'coming-soon' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                              {lab.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-medium">{lab.title}</h3>
                                {lab.status === 'coming-soon' && (
                                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                                    Coming Soon
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 text-sm">{lab.description}</p>
                            </div>
                            {lab.status === 'active' && (
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Journey Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Your Journey</h3>
              <span className="text-slate-500 text-xs">7 Levels Framework</span>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                <div key={level} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full h-2 rounded-full ${
                      level <= 2 ? 'bg-emerald-500/60' :
                      level <= 5 ? 'bg-rose-500/60' :
                      'bg-violet-500/60'
                    }`}
                  />
                  <span className="text-xs text-slate-500 mt-2">{level}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-2 text-xs text-slate-600">
              <span>Foundation</span>
              <span>Heart & Expression</span>
              <span>Vision & Unity</span>
            </div>
          </motion.div>

          {/* Info */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-xs">
              Each level builds upon the previous, creating an integrated path of development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
