'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
export function HeroSection() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #111827 0%, #0b0f1c 70%)',
      }}
    >
      {/* Background logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07]">
        <motion.img
          src="/holoflower.png"
          alt=""
          className="w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] object-contain"
          animate={{ scale: [1, 1.03, 1], rotate: [0, 3, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl">
        {/* Opening line — the pull */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-base sm:text-lg italic text-white/50 mb-8 tracking-wide"
          style={{ fontFamily: "'Crimson Pro', serif" }}
        >
          Do you believe in magic?
        </motion.p>

        {/* SOULLAB */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-6 text-white"
          style={{ fontFamily: "'Crimson Pro', serif" }}
        >
          Soullab
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="text-xl sm:text-2xl md:text-3xl font-light text-white/70 mb-4"
          style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
        >
          We build for the soul.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
          className="text-base sm:text-lg text-white/40 mb-12 max-w-2xl mx-auto"
          style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
        >
          Consciousness AI &amp; relational intelligence systems.
          We built AIN — the engine that brings soul to any app, site, or platform.
        </motion.p>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1.1, ease: 'easeOut' }}
          className="w-16 h-[2px] bg-maia-spice-500 mx-auto mb-12"
        />

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/enter"
            className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 bg-maia-spice-500 hover:bg-maia-spice-400 text-black font-semibold text-base transition-colors shadow-lg shadow-maia-spice-500/20"
          >
            Enter MAIA
          </Link>
          <button
            onClick={scrollToContact}
            className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium text-base transition-colors"
          >
            Work with Soullab
          </button>
        </motion.div>

        {/* Context line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.7 }}
          className="mt-16 text-white/30 text-sm font-light max-w-md mx-auto"
        >
          Consciousness AI &middot; Relational Intelligence &middot; Sovereign Infrastructure
        </motion.p>

        {/* Trust anchor — safety as aftertaste */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.1 }}
          className="mt-3 text-white/20 text-xs tracking-widest uppercase"
        >
          Private by design &middot; Your data never leaves your hands
        </motion.p>
      </div>
    </section>
  );
}
