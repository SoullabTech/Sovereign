'use client';

import { motion } from 'framer-motion';

export function SlideOpening() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background sacred geometry pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-amber-400/20 rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 border border-amber-400/20 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-amber-400/20 rounded-full" />
      </div>

      {/* Holoflower - Clean rendering for pitch */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="mb-16 flex items-center justify-center relative"
      >
        {/* Soft glow behind */}
        <motion.div
          className="absolute"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.6, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-56 h-56 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(251, 191, 36, 0.15) 30%, transparent 60%)',
              filter: 'blur(20px)'
            }}
          />
        </motion.div>
        {/* Clean SVG */}
        <motion.img
          src="/holoflower.svg"
          alt="MAIA"
          className="w-48 h-48 relative z-10"
          style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))' }}
          animate={{ rotate: [0, 1, 0, -1, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-white text-5xl sm:text-6xl md:text-7xl font-light tracking-wide mb-8"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Meet MAIA.
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="text-teal-200/80 text-xl sm:text-2xl md:text-3xl font-light text-center max-w-3xl leading-relaxed"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Where the elements of soulful living come alive.
      </motion.p>
    </div>
  );
}
