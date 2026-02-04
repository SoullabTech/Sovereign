'use client';

import { motion } from 'framer-motion';

const modalities = [
  'Energy Healing',
  'Bodywork',
  'Hypnotherapy',
  'Shamanic Journeywork',
  'Jungian Archetypal Work',
  'NLP',
];

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
        35 Years of Integration
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Born from practice, not theory
      </motion.h2>

      {/* Credentials flow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col items-center gap-4 mb-12"
      >
        <div className="text-teal-200/80 text-xl">PhD Program — Clinical/Developmental Psychology</div>
        <div className="text-white/30">↓</div>
        <div className="text-teal-200/80 text-xl">Harvard Mind Body Institute — 2 Year Practicum</div>
        <div className="text-white/30">↓</div>
        <div className="text-amber-200/80 text-xl font-medium">35+ Years Private Practice</div>
      </motion.div>

      {/* Modalities grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-3xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modalities.map((modality, index) => (
            <motion.div
              key={modality}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              className="text-white/70 text-center py-2"
            >
              {modality}
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="text-white/40 text-center mt-4 text-sm"
        >
          Not sequential — integrated. All elements of human experience unified.
        </motion.p>
      </motion.div>

      {/* Bottom insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="mt-12 flex flex-col items-center"
      >
        <div className="text-white/30 mb-4">↓</div>
        <div className="text-amber-400 text-2xl font-medium">Spiralogic</div>
        <div className="text-white/50 text-lg">25 years of framework development</div>
        <div className="text-white/30 mt-4 mb-2">↓</div>
        <div className="text-teal-400 text-2xl font-medium">MAIA</div>
      </motion.div>
    </div>
  );
}
