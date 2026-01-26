'use client';

import { motion } from 'framer-motion';

export function SlideTrust() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 relative">
      {/* Background lock icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <svg className="w-96 h-96" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Trust
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-5xl sm:text-6xl md:text-7xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Yours. Always.
      </motion.h2>

      {/* Trust points */}
      <div className="space-y-6 max-w-2xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/70 text-xl md:text-2xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Your data stays on your device.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/70 text-xl md:text-2xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Sync to our protected cloud — only if you choose.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-teal-200/80 text-xl md:text-2xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Local infrastructure. Military-grade protection.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-white/60 text-xl md:text-2xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Works even if the internet goes down.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-amber-400/70 text-lg font-light mt-4"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Not controlled by big AI.
        </motion.p>
      </div>

      {/* Visual lock icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16"
      >
        <div className="w-16 h-16 rounded-full border-2 border-teal-400/40 flex items-center justify-center">
          <svg className="w-8 h-8 text-teal-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
