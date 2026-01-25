'use client';

import { motion } from 'framer-motion';

const problems = [
  { text: 'Most AI learned from internet groupthink.', delay: 0.2 },
  { text: 'We thought you deserved something richer.', delay: 0.5 },
  { text: 'Something that speaks to mind, body, spirit, and emotions.', delay: 0.8 },
];

export function SlideProblem() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        The Problem
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16 max-w-4xl"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        You deserve better.
      </motion.h2>

      {/* Problem points */}
      <div className="space-y-6 max-w-3xl">
        {problems.map((problem, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: problem.delay }}
            className="flex items-start gap-4"
          >
            <span className="text-amber-400/60 mt-1">—</span>
            <p className="text-white/70 text-xl md:text-2xl font-light leading-relaxed">
              {problem.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
