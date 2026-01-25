'use client';

import { motion } from 'framer-motion';

const markets = [
  { size: '$15B', label: 'Coaching', growth: '15% annually' },
  { size: '$5B', label: 'Wellness apps', growth: '12% annually' },
  { size: '$200B+', label: 'Enterprise learning', growth: 'shifting to AI' },
];

export function SlideMarketAppendix() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Appendix: Market
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Where MAIA sits
      </motion.h2>

      {/* Market cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
        {markets.map((market, index) => (
          <motion.div
            key={market.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center"
          >
            <p className="text-amber-400 text-4xl font-light mb-2">{market.size}</p>
            <p className="text-white/80 text-lg mb-2">{market.label}</p>
            <p className="text-white/40 text-sm">{market.growth}</p>
          </motion.div>
        ))}
      </div>

      {/* The positioning */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-white/60 text-xl text-center max-w-2xl"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        MAIA sits at the intersection — where personal development meets actual depth.
      </motion.p>
    </div>
  );
}
