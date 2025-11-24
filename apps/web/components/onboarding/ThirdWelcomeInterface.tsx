'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ThirdWelcomeInterfaceProps {
  onNext: () => void;
  onBack?: () => void;
}

export default function ThirdWelcomeInterface({ onNext, onBack }: ThirdWelcomeInterfaceProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dark navy background matching screenshot #3 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #0a0f1a 0%, #1e293b 50%, #0a0f1a 100%)`
        }}
      />

      {/* Content matching screenshot #3 exactly */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-8 max-w-5xl mx-auto">

        {/* Main heading from screenshot */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl font-thin text-white mb-12 tracking-wide leading-tight max-w-4xl"
        >
          MAIA learns from your
          <br />
          patterns of thought
        </motion.h1>

        {/* Subheading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-2xl text-white/80 mb-16 font-light leading-relaxed max-w-3xl"
        >
          Through journaling, voice notes, and reflection, we build a deeper understanding together
        </motion.div>

        {/* Orange/amber accent text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-2xl mb-16 font-light"
          style={{ color: '#f59e0b' }}
        >
          Your privacy is sacred
        </motion.div>

        {/* Secondary text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="text-xl text-white/70 mb-16 font-light max-w-2xl leading-relaxed"
        >
          All interactions remain between you and MAIA. Nothing is shared or stored externally.
        </motion.div>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="px-12 py-5 rounded-full text-xl font-medium transition-all duration-300 shadow-2xl tracking-wide"
          style={{
            background: '#f59e0b',
            color: '#1e293b'
          }}
        >
          I understand
        </motion.button>
      </div>
    </div>
  );
}