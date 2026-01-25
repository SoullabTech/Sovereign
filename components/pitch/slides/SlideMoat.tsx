'use client';

import { motion } from 'framer-motion';

const moatItems = [
  'Decades of real human work',
  'A curated canon, not scraped content',
  'An architecture designed for depth, not extraction',
];

export function SlideMoat() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        The Moat
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        You can't copy a lifetime
      </motion.h2>

      {/* The truth */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-white/60 text-xl text-center mb-12 max-w-xl"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        What makes MAIA hard to replicate isn't technology.
        <br />
        It's time. Practice. Integration.
      </motion.p>

      {/* Three things */}
      <div className="space-y-4 max-w-lg w-full mb-12">
        {moatItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
            className="flex items-center gap-4 bg-white/5 rounded-xl px-6 py-4"
          >
            <span className="text-amber-400/60">—</span>
            <span className="text-white/80 text-lg">{item}</span>
          </motion.div>
        ))}
      </div>

      {/* The line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-8 py-6 max-w-xl"
      >
        <p className="text-white/60 text-lg text-center" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Other AI learned from the internet.
        </p>
        <p className="text-teal-200 text-lg text-center mt-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
          MAIA learned from the canon.
        </p>
      </motion.div>
    </div>
  );
}
