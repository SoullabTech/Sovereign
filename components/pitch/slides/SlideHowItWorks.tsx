'use client';

import { motion } from 'framer-motion';

export function SlideHowItWorks() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        How It Works
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        The long conversation
      </motion.h2>

      {/* The flow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {['Write', 'Talk', 'Capture', 'Reflect'].map((step, index) => (
          <span key={step} className="text-white/60 text-lg">
            {step}
            {index < 3 && <span className="text-teal-400/40 mx-3">→</span>}
          </span>
        ))}
      </motion.div>

      {/* Human description */}
      <div className="space-y-6 max-w-2xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/70 text-lg md:text-xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Your journal entries become conversations.
          <br />
          Your conversations become captures — not transcripts, but what mattered.
          <br />
          Your captures reveal patterns across months and years.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-teal-200/80 text-xl md:text-2xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          MAIA doesn't remember everything — only what matters.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-white/50 text-lg font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Some moments are held gently and left untouched.
          <br />
          Your wisdom compounds. She gets out of the way when needed.
        </motion.p>
      </div>

      {/* Sanctuary callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-16 bg-purple-500/10 border border-purple-400/30 rounded-xl px-8 py-4"
      >
        <p className="text-purple-200 text-lg text-center">
          <span className="text-purple-400 font-medium">Sanctuary Mode</span>
          {' '}— for what needs to stay in the moment.
        </p>
      </motion.div>
    </div>
  );
}
