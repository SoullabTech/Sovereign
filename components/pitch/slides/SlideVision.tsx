'use client';

import { motion } from 'framer-motion';

export function SlideVision() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 relative">
      {/* Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 border border-teal-400/20 rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 border border-amber-400/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full" />
      </div>

      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        The Vision
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        MAIA is the beginning.
      </motion.h2>

      {/* The vision */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-2xl text-center space-y-8 mb-12"
      >
        <p className="text-white/70 text-xl" style={{ fontFamily: 'Crimson Pro, serif' }}>
          AIN — our consciousness engine — will power what comes next.
        </p>

        <p className="text-white/60 text-lg" style={{ fontFamily: 'Crimson Pro, serif' }}>
          A sovereign platform for consciousness AI.<br />
          Others build. We provide the depth.
        </p>
      </motion.div>

      {/* Powered by */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col items-center"
      >
        <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-3">
          Powered by
        </p>
        <p className="text-teal-200 text-3xl tracking-wide" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Soullab
        </p>
      </motion.div>
    </div>
  );
}
