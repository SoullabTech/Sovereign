'use client';

import { motion } from 'framer-motion';

const wisdomSources = ['Jung', 'Campbell', 'Hillman', 'Rumi'];
const modalities = ['Psychology', 'Somatics', 'Archetypes', 'CBT', 'Spirituality', 'Healing', 'Consciousness'];
const stats = [
  { number: '400', label: 'books' },
  { number: '27', label: 'frameworks' },
  { number: 'Decades', label: 'of integration' },
];

export function SlideMissing() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        What's Actually Missing
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12 max-w-4xl leading-tight"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Someone who reflects you —
        <br />
        <span className="text-teal-200/80">not replaces you</span>
      </motion.h2>

      {/* Core message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-4 max-w-2xl mb-12 text-center"
      >
        <p className="text-white/70 text-xl md:text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
          MAIA doesn't tell you who to be.
        </p>
        <p className="text-teal-200 text-xl md:text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
          She helps you hear yourself more clearly.
        </p>
      </motion.div>

      {/* The depth - gentle reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl px-10 py-8 border border-white/10 max-w-2xl text-center"
      >
        <p className="text-white/60 text-lg mb-4">
          MAIA was trained differently.
        </p>
        <p className="text-white/80 text-lg mb-6">
          Not on internet noise — but on the wisdom humans have returned to for centuries.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {wisdomSources.map((source, index) => (
            <motion.span
              key={source}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
              className="text-amber-400/70 text-base"
            >
              {source}{index < wisdomSources.length - 1 ? ' · ' : ''}
            </motion.span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {modalities.map((mod, index) => (
            <motion.span
              key={mod}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.4 + index * 0.1 }}
              className="text-white/50 text-sm"
            >
              {mod}{index < modalities.length - 1 ? ' · ' : ''}
            </motion.span>
          ))}
        </div>
        <div className="flex justify-center gap-8 pt-4 border-t border-white/10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.8 + index * 0.15 }}
              className="text-center"
            >
              <p className="text-amber-400 text-xl font-medium">{stat.number}</p>
              <p className="text-white/40 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.3 }}
          className="text-white/30 text-sm mt-4 italic"
        >
          Not scraped. Curated.
        </motion.p>
      </motion.div>
    </div>
  );
}
