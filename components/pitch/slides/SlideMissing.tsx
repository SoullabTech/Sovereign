'use client';

import { motion } from 'framer-motion';

const missing = [
  { text: 'Memory that serves the person, not a business model', delay: 0.3 },
  { text: 'Technology designed to make itself less necessary', delay: 0.5 },
  { text: 'Wisdom that compounds over time', delay: 0.7 },
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
        What's Missing
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16 max-w-4xl leading-tight"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        A companion that strengthens you
        <br />
        <span className="text-teal-200/80">— not replaces you</span>
      </motion.h2>

      {/* Missing elements */}
      <div className="space-y-8 max-w-3xl">
        {missing.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: item.delay }}
            className="bg-white/5 backdrop-blur-sm rounded-xl px-8 py-6 border border-white/10"
          >
            <p className="text-white text-xl md:text-2xl font-light text-center">
              {item.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
