'use client';

import { motion } from 'framer-motion';

export function SlideWhatYouDo() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-purple-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        What You Do
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Journal. Talk. Capture. Explore.
      </motion.h2>

      {/* The concrete moment */}
      <div className="max-w-2xl text-center space-y-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/70 text-xl md:text-2xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Write your morning. Record a dream.
          <br />
          MAIA asks one question.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-teal-200/80 text-xl md:text-2xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Tomorrow, she remembers.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-white/60 text-xl md:text-2xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Over months, patterns emerge.
          <br />
          You start seeing yourself differently.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-white/50 text-lg font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Some moments stay private. Your wisdom compounds.
        </motion.p>
      </div>

      {/* The line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="mt-16 bg-purple-500/10 border border-purple-400/30 rounded-xl px-8 py-4"
      >
        <p className="text-purple-200 text-lg text-center" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Journaling that talks back.
        </p>
      </motion.div>
    </div>
  );
}
