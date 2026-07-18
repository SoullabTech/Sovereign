'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useId } from 'react';

export function HeroSection() {
  const auraId = useId().replace(/:/g, '');

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
      {/* Content — text above, holoflower below */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full pt-20 sm:pt-24">

        {/* SOULLAB */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white"
          style={{ fontFamily: "'Crimson Pro', serif" }}
        >
          Soullab
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mt-4 text-lg sm:text-xl md:text-2xl font-light text-white/60"
          style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
        >
          We build for the soul.
        </motion.p>

        {/* Luminous holoflower — focal centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
          className="relative mt-12 sm:mt-16 mb-10 sm:mb-14 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px] flex items-center justify-center"
        >
          {/* Violet aura */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="absolute h-[130%] w-[130%] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(139,92,246,0.15) 40%, rgba(139,92,246,0.00) 70%)',
                filter: 'blur(40px)',
                animation: `${auraId} 6.5s ease-in-out infinite`,
              }}
            />
            <style>{`
              @keyframes ${auraId} {
                0% { transform: scale(0.92); opacity: 0.65; }
                50% { transform: scale(1.05); opacity: 0.90; }
                100% { transform: scale(0.92); opacity: 0.65; }
              }
            `}</style>
          </div>

          {/* Single translucent holoflower — slow rotation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-[92%] w-[92%] animate-[spin_180s_linear_infinite] motion-reduce:animate-none opacity-60">
              <Image
                src="/holoflower.png"
                alt="The Holoflower — Soullab's elemental mandala, slowly turning"
                fill
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 400px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Descriptor */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          className="text-sm sm:text-base text-white/35 max-w-lg mx-auto mb-10"
          style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
        >
          Technology should help you become more yourself,
          not more dependent on technology.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: 'easeOut' }}
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
            className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 border border-white/15 hover:border-white/30 text-white/60 hover:text-white font-medium text-base transition-colors"
          >
            Work with Soullab
          </button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-14 text-white/20 text-xs tracking-widest uppercase"
        >
          Private by design &middot; Self-hosted &middot; You control what's remembered
        </motion.p>
      </div>
    </section>
  );
}
