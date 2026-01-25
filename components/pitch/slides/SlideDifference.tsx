'use client';

import { motion } from 'framer-motion';

const sources = ['Jung', 'Campbell', 'CBT', 'Somatic work', 'Archetypal traditions'];

export function SlideDifference() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        The Difference
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        A companion for the adventure
        <br />
        <span className="text-teal-200/80">of becoming yourself.</span>
      </motion.h2>

      {/* The story */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-2xl text-center space-y-6 mb-10"
      >
        <p className="text-white/70 text-xl" style={{ fontFamily: 'Crimson Pro, serif' }}>
          MAIA was trained differently.
        </p>
        <p className="text-white/60 text-xl" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Not on internet noise — on the psychology and philosophy that actually hold up.
        </p>
      </motion.div>

      {/* Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        {sources.map((source, index) => (
          <motion.span
            key={source}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
            className="text-amber-400/70 text-lg"
          >
            {source}{index < sources.length - 1 ? ' · ' : ''}
          </motion.span>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="text-white/50 text-base mb-10"
      >
        400 books. 27 frameworks. Curated, not scraped.
      </motion.p>

      {/* Closing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="text-center space-y-2"
      >
        <p className="text-white/60 text-xl" style={{ fontFamily: 'Crimson Pro, serif' }}>
          She doesn't tell you who to be.
        </p>
        <p className="text-teal-200 text-xl" style={{ fontFamily: 'Crimson Pro, serif' }}>
          She helps you hear yourself more clearly.
        </p>
      </motion.div>
    </div>
  );
}
