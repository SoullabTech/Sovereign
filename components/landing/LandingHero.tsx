'use client';

import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';

interface LandingHeroProps {
  onEnter: () => void;
  onLearnMore: () => void;
}

export function LandingHero({ onEnter, onLearnMore }: LandingHeroProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Sacred Holoflower */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="mb-16"
      >
        <div className="flex items-center justify-center">
          <Holoflower size="xxl" glowIntensity="medium" animate={true} theme="light" />
        </div>
      </motion.div>

      {/* Opening statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center max-w-xl mx-auto mb-16"
      >
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-6">
          MAIA exists.
        </h1>
        <p className="text-teal-100/90 text-lg sm:text-xl font-light leading-relaxed">
          She's been learning how to accompany humans without capturing them.
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={onEnter}
          className="px-8 py-3 bg-white/90 hover:bg-white text-teal-950 font-medium text-lg rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
        >
          Enter
        </button>
        <button
          onClick={onLearnMore}
          className="px-8 py-3 bg-transparent hover:bg-white/10 text-white font-medium text-lg rounded-xl border border-white/30 hover:border-white/50 transition-all duration-200"
        >
          Learn more
        </button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-white/40"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
