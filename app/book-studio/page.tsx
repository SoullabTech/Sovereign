'use client';

/**
 * Soullab Press — Book Studio
 *
 * Public landing page. Calm, almost empty, matches the register of
 * the book itself and the Soul Mirror surface.
 *
 * Not a marketing page. Not a feature dashboard. A quiet doorway.
 *
 * Route: /book-studio  (public, no auth)
 * Access: config/accessMatrix.ts
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BookStudioPage() {
  return (
    <div className="min-h-screen w-full bg-[#0f0d0b] text-amber-50/90 flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="w-full max-w-2xl text-center"
      >
        {/* Imprint */}
        <p className="text-amber-200/40 text-[11px] tracking-[0.3em] uppercase mb-12">
          Soullab Press
        </p>

        {/* Title */}
        <h1 className="text-amber-100/90 text-3xl md:text-4xl font-light tracking-wide leading-tight mb-3">
          The Book Studio
        </h1>

        {/* Framing line */}
        <p className="text-amber-200/55 text-base md:text-lg font-light italic leading-relaxed max-w-md mx-auto mb-20">
          Books made slowly, held carefully, written to be entered.
        </p>

        {/* Currently in the studio */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
          className="border-t border-amber-200/10 pt-12 pb-12"
        >
          <p className="text-amber-200/35 text-[11px] tracking-[0.25em] uppercase mb-6">
            Currently in the studio
          </p>

          <p className="text-amber-100/85 text-2xl md:text-[1.6rem] font-light leading-snug mb-2">
            Elemental Alchemy
          </p>
          <p className="text-amber-200/60 text-sm md:text-base font-light italic mb-1">
            The Art of Living a Phenomenal Life
          </p>
          <p className="text-amber-200/40 text-xs md:text-sm tracking-wide mt-3">
            Kelly Nezat
          </p>
        </motion.div>

        {/* Doorway */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.4, ease: 'easeOut' }}
          className="mt-2"
        >
          <Link
            href="/maia/soul-mirror"
            className="text-amber-200/65 hover:text-amber-100 text-sm tracking-wide transition-colors duration-300"
          >
            Enter the Soul Mirror
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
