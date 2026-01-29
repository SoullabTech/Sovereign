'use client';

import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';

export function SlideOpening() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background sacred geometry pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-amber-400/20 rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 border border-amber-400/20 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-amber-400/20 rounded-full" />
      </div>

      {/* Holoflower */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="mb-16 flex items-center justify-center"
      >
        <div className="w-48 h-48 flex items-center justify-center">
          <Holoflower size="xxl" glowIntensity="medium" animate={true} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-white text-5xl sm:text-6xl md:text-7xl font-light tracking-wide mb-8"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        MAIA exists.
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="text-teal-200/80 text-xl sm:text-2xl md:text-3xl font-light text-center max-w-3xl leading-relaxed"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        She's been learning how to accompany humans
        <br />
        without capturing them.
      </motion.p>

      {/* Subtle tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-24 text-white/30 text-sm tracking-widest uppercase"
      >
        Consciousness Technology for Transformation
      </motion.p>
    </div>
  );
}
