'use client';

import { motion } from 'framer-motion';

const markets = [
  { name: 'Coaching', size: '$15B', growth: '+15% annually', color: 'text-amber-400' },
  { name: 'Meditation/Wellness Apps', size: '$5B', growth: '+12% annually', color: 'text-teal-400' },
  { name: 'Enterprise Learning', size: '$200B+', growth: '+8% annually', color: 'text-purple-400' },
];

export function SlideMarket() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        The Market
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Beyond tools. Into transformation.
      </motion.h2>

      {/* Market size cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl w-full mb-16">
        {markets.map((market, index) => (
          <motion.div
            key={market.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center"
          >
            <p className={`${market.color} text-4xl font-light mb-2`}>{market.size}</p>
            <p className="text-white text-lg mb-2">{market.name}</p>
            <p className="text-white/40 text-sm">{market.growth}</p>
          </motion.div>
        ))}
      </div>

      {/* Intersection insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gradient-to-r from-amber-400/10 via-teal-400/10 to-purple-400/10 border border-white/20 rounded-xl px-10 py-6"
      >
        <p className="text-white text-xl text-center">
          MAIA sits at the intersection:
          <span className="block mt-2 text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-teal-400 to-purple-400">
            Consciousness Technology
          </span>
        </p>
      </motion.div>

      {/* Differentiator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-8 text-white/40 text-center max-w-xl"
      >
        Not competing in any single market — creating a new category.
      </motion.p>
    </div>
  );
}
