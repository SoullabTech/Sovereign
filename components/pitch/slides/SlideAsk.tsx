'use client';

import { motion } from 'framer-motion';

export function SlideAsk() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 relative">
      {/* Background sacred geometry */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-amber-400/20 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-teal-400/20 rounded-full" />
      </div>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-5xl sm:text-6xl md:text-7xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        The door is open.
      </motion.h2>

      {/* Three paths - simple */}
      <div className="space-y-6 max-w-xl text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-amber-400/80 text-xl"
        >
          <span className="font-medium">Supporters:</span>{' '}
          <span className="text-white/60">Join the founding circle. Shape what this becomes.</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-teal-400/80 text-xl"
        >
          <span className="font-medium">Practitioners:</span>{' '}
          <span className="text-white/60">Early access. Shape the tools.</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-purple-400/80 text-xl"
        >
          <span className="font-medium">Members:</span>{' '}
          <span className="text-white/60">Enter through relationship.</span>
        </motion.p>
      </div>

      {/* The future */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="text-teal-200 text-xl mb-8"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        The future of consciousness AI.
      </motion.p>

      {/* URL */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="text-white/50 text-2xl tracking-wide"
      >
        soullab.life
      </motion.p>
    </div>
  );
}
