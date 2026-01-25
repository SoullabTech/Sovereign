'use client';

import { motion } from 'framer-motion';

export function SlideWhyMe() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Why Me
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Designed by someone who's been in the room.
      </motion.h2>

      {/* The story - tight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-2xl text-center space-y-6 mb-12"
      >
        <p className="text-white/70 text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
          35 years helping people become their best selves —
          <br />
          mind, body, spirit, and emotions.
        </p>
        <p className="text-white/60 text-lg" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Guide. Healer. Counselor. Explorer of consciousness.
        </p>
      </motion.div>

      {/* The line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="text-teal-200 text-xl"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        We don't make it up. We live it.
      </motion.p>
    </div>
  );
}
