'use client';

import { motion } from 'framer-motion';

const requirements = [
  { step: '1', text: 'Train at this level across multiple disciplines', years: '10+ years' },
  { step: '2', text: 'Practice for decades with real clients', years: '35+ years' },
  { step: '3', text: 'Synthesize into coherent frameworks', years: '25+ years' },
  { step: '4', text: 'Then build the technology', years: '—' },
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
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        You can't copy a lifetime
      </motion.h2>

      {/* What a competitor needs */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-white/50 text-lg mb-8"
      >
        A competitor would need to:
      </motion.p>

      <div className="space-y-4 max-w-2xl w-full mb-12">
        {requirements.map((req, index) => (
          <motion.div
            key={req.step}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
            className="flex items-center gap-4 bg-white/5 rounded-xl px-6 py-4"
          >
            <span className="text-amber-400/60 text-lg font-mono">{req.step}</span>
            <span className="text-white/80 text-lg flex-1">{req.text}</span>
            <span className="text-white/30 text-sm font-mono">{req.years}</span>
          </motion.div>
        ))}
      </div>

      {/* Punchline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-8 py-6"
      >
        <p className="text-amber-200 text-xl md:text-2xl text-center font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
          They can't skip steps 1–3.
        </p>
      </motion.div>

      {/* Trust compound note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="mt-8 text-white/40 text-center max-w-xl"
      >
        Code can be copied. Trust compounds. Ethics embedded in architecture can't be retrofitted.
      </motion.p>
    </div>
  );
}
