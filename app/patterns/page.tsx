'use client';

/**
 * Patterns - Meaning-Making Laboratory
 *
 * A lab for pattern recognition across time, psyche, body, and relationship.
 * Uses symbolic, psychological, somatic, and relational lenses.
 *
 * Dune-inspired aesthetics with sage/teal consciousness theme.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  Focus,
  Fingerprint,
  Users,
  CheckSquare,
  Sparkles,
  Waves,
  Compass
} from 'lucide-react';

interface PatternTool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  color: string;
}

const patternTools: PatternTool[] = [
  {
    id: 'field-snapshot',
    title: 'Field Snapshot',
    description: 'See what\'s active right now — signals, themes, and timing layers.',
    icon: Activity,
    path: '/patterns/field-snapshot',
    badge: 'Now',
    color: 'from-teal-500 to-cyan-600'
  },
  {
    id: 'theme-focus',
    title: 'Theme Focus',
    description: 'Zoom in on a single motif and work it through reflection + practice.',
    icon: Focus,
    path: '/patterns/theme-focus',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'pattern-profile',
    title: 'Personal Pattern Profile',
    description: 'Add birth data to refine pattern resolution. Not fate — just structure.',
    icon: Fingerprint,
    path: '/astrology',
    badge: 'Optional',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'relational',
    title: 'Relational Dynamics',
    description: 'Explore resonance, friction, and growth edges in relationship space.',
    icon: Users,
    path: '/patterns/relational',
    color: 'from-teal-600 to-emerald-600'
  },
  {
    id: 'integration',
    title: 'Integration Protocols',
    description: 'Translate insight into action — journaling, rituals, experiments, next steps.',
    icon: CheckSquare,
    path: '/patterns/integration',
    color: 'from-green-500 to-teal-600'
  }
];

export default function PatternsPage() {
  const router = useRouter();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2027] to-[#1a3a3a] relative overflow-hidden">
      {/* Atmospheric elements */}
      <div className="absolute inset-0 opacity-30">
        {/* Spice-like particles */}
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() > 0.8 ? '3px' : '2px',
              height: Math.random() > 0.8 ? '3px' : '2px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: Math.random() > 0.5 ? '#5eead4' : '#2dd4bf',
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-teal-900/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-emerald-900/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="p-2 rounded-lg bg-teal-900/30 border border-teal-700/30
                     text-teal-300 hover:bg-teal-800/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-teal-100 flex items-center gap-3">
              <Waves className="w-8 h-8 text-teal-400" />
              Patterns
            </h1>
            <p className="text-teal-300/70 text-sm mt-1">
              A lab for meaning-making across time, psyche, body, and relationship
            </p>
          </div>
        </div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 bg-gradient-to-br from-teal-900/40 to-emerald-900/30
                   border border-teal-700/30 rounded-xl backdrop-blur-sm"
        >
          <p className="text-teal-100 leading-relaxed">
            We use multiple lenses — symbolic, psychological, somatic, and relational — to support
            pattern recognition, reflection, and integration. These tools are offered as frameworks
            for orientation, not belief or prediction.
          </p>
        </motion.div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patternTools.map((tool, index) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(tool.path)}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              className={`group relative p-6 rounded-xl text-left transition-all duration-300
                        bg-gradient-to-br from-[#0f2a2a]/80 to-[#1a3535]/60
                        border border-teal-700/30 hover:border-teal-500/50
                        hover:shadow-lg hover:shadow-teal-900/30`}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${tool.color}
                            opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="relative flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${tool.color}
                              shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-teal-100 group-hover:text-white transition-colors">
                      {tool.title}
                    </h3>
                    {tool.badge && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-teal-800/50 text-teal-300 border border-teal-600/30">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-teal-300/70 text-sm leading-relaxed group-hover:text-teal-200/80 transition-colors">
                    {tool.description}
                  </p>
                </div>

                <motion.div
                  animate={{ x: hoveredTool === tool.id ? 4 : 0 }}
                  className="text-teal-500 group-hover:text-teal-300 transition-colors"
                >
                  →
                </motion.div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-4 rounded-lg bg-teal-900/20 border border-teal-800/30"
        >
          <p className="text-sm text-teal-400">
            <span className="text-teal-300 font-medium">Tip:</span> If you're not sure where to start,
            open <span className="text-teal-200 font-medium">Field Snapshot</span>, then move into{' '}
            <span className="text-teal-200 font-medium">Integration Protocols</span>.
          </p>
        </motion.div>

        {/* Footer decoration */}
        <div className="mt-12 flex justify-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <Compass className="w-8 h-8 text-teal-600/40" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
