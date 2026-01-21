'use client';

/**
 * Patterns - Symbolic Systems & Cycles
 *
 * Umbrella page for pattern recognition tools.
 * Astrology is one symbolic input among several.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Clock, Users, Compass, BookOpen } from 'lucide-react';

export default function PatternsPage() {
  const router = useRouter();

  const modules = [
    {
      id: 'cycles',
      icon: Clock,
      title: 'Cycle Snapshot',
      description: 'What patterns are active now?',
      path: '/astrology',
      available: true,
    },
    {
      id: 'archetypes',
      icon: Compass,
      title: 'Archetype Focus',
      description: 'Which themes are asking for attention?',
      path: '/journey',
      available: true,
    },
    {
      id: 'blueprint',
      icon: Sparkles,
      title: 'Personal Blueprint',
      description: 'Add timing data to refine pattern resolution',
      path: '/astrology',
      available: true,
      note: 'optional',
    },
    {
      id: 'relational',
      icon: Users,
      title: 'Interpersonal Resonance',
      description: 'Explore relational dynamics',
      path: '/astrology/synastry',
      available: true,
    },
    {
      id: 'integration',
      icon: BookOpen,
      title: 'Integration Practices',
      description: 'Translate insight into action',
      path: '/labtools/journal',
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0f1a]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/maia')}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-medium text-amber-100">Patterns</h1>
            <p className="text-sm text-slate-500">Symbolic systems & cycles</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-light text-amber-100 mb-4">
            Patterns of Meaning Across Time, Psyche, and Body
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore symbolic systems as tools for reflection, orientation, and integration.
            Not fate. Not fortune-telling. A map for meaning-making.
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module, index) => (
            <motion.button
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => module.available && router.push(module.path)}
              disabled={!module.available}
              className={`
                p-6 rounded-xl border text-left transition-all
                ${module.available
                  ? 'bg-[#111827] border-slate-700/50 hover:border-amber-500/50 hover:bg-[#1a2234]'
                  : 'bg-[#0d1117] border-slate-800/30 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <module.icon className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-amber-100">{module.title}</h3>
                    {module.note && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
                        {module.note}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Positioning Statement */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-slate-500 mt-12 max-w-xl mx-auto"
        >
          This platform explores consciousness through multiple lenses—symbolic, psychological,
          somatic, and relational. Pattern systems are offered as optional frameworks for
          recognition, not as belief or prediction.
        </motion.p>
      </section>
    </div>
  );
}
