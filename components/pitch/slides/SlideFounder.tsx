'use client';

import { motion } from 'framer-motion';

export function SlideFounder() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        35 Years of Practice
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Designed by someone who's been in the room
      </motion.h2>

      {/* The story */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-2xl text-center space-y-6 mb-12"
      >
        <p className="text-white/70 text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
          MAIA wasn't designed by engineers guessing what growth looks like.
        </p>
        <p className="text-teal-200/80 text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
          She was shaped by decades of sitting with people —
          <br />
          through change, grief, awakening, and becoming.
        </p>
      </motion.div>

      {/* Credentials - quiet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl text-center"
      >
        <div className="space-y-3 text-white/60 mb-6">
          <p>Harvard Mind Body Institute</p>
          <p>35+ years private practice</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-white/50 text-sm">
          {['Energy work', 'Depth psychology', 'Somatic practice', 'Archetypal work', 'CBT', 'NLP', 'Shamanic traditions'].map((mod, index) => (
            <span key={mod}>
              {mod}{index < 6 ? ' · ' : ''}
            </span>
          ))}
        </div>
      </motion.div>

      {/* The line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-10 text-white/40 text-base"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        This isn't theory. It's lived practice.
      </motion.p>
    </div>
  );
}
