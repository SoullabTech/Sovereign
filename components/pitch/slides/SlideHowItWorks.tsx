'use client';

import { motion } from 'framer-motion';

const steps = [
  { label: 'Conversation', icon: '💬', description: 'Speak freely' },
  { label: 'Capsule', icon: '✦', description: 'What mattered' },
  { label: 'Pattern', icon: '◈', description: 'Across time' },
  { label: 'Insight', icon: '◉', description: 'Becoming visible' },
];

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
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-20"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Conversations become wisdom
      </motion.h2>

      {/* Flow diagram */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
            className="flex items-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-4">
                <span className="text-3xl">{step.icon}</span>
              </div>
              <p className="text-white text-lg font-medium mb-1">{step.label}</p>
              <p className="text-white/50 text-sm">{step.description}</p>
            </div>

            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.15 }}
                className="hidden md:block mx-4 text-amber-400/40"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Sanctuary callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-16 bg-purple-500/10 border border-purple-400/30 rounded-xl px-8 py-4"
      >
        <p className="text-purple-200 text-lg text-center">
          <span className="text-purple-400 font-medium">Sanctuary Mode:</span>
          {' '}Some things stay present-tense only. Never stored.
        </p>
      </motion.div>
    </div>
  );
}
