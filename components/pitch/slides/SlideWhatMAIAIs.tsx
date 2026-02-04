'use client';

import { motion } from 'framer-motion';

const voices = [
  {
    name: 'Talk',
    description: 'Peer presence. Short, real.',
    example: '"Stuck. Where?"',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
  },
  {
    name: 'Care',
    description: 'Therapeutic holding. Pattern-naming, direct when needed.',
    example: '"I notice you\'ve avoided this three times now."',
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    borderColor: 'border-teal-400/30',
  },
  {
    name: 'Note',
    description: 'Witnessing. Reflects without interpreting.',
    example: '"You used \'trapped\' again. What do you notice?"',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
  },
];

export function SlideWhatMAIAIs() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        What MAIA Is
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Three voices, one presence
      </motion.h2>

      {/* Voice cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
        {voices.map((voice, index) => (
          <motion.div
            key={voice.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
            className={`${voice.bgColor} backdrop-blur-sm rounded-2xl p-8 border ${voice.borderColor}`}
          >
            <h3 className={`${voice.color} text-2xl font-medium mb-3`}>
              {voice.name}
            </h3>
            <p className="text-white/70 text-lg mb-4">
              {voice.description}
            </p>
            <p className="text-white/50 text-base italic" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {voice.example}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
