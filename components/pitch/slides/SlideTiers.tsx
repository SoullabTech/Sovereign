'use client';

import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Presence',
    price: 'Free',
    description: 'Meet MAIA. Journal. Reflect.',
    detail: 'Everything in the moment.',
    color: 'text-white',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/20',
  },
  {
    name: 'Continuity',
    price: '$5–15/mo',
    priceNote: 'pay what feels right',
    description: 'MAIA remembers alongside you.',
    detail: 'Patterns across time. Becoming visible.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    borderColor: 'border-teal-400/30',
    featured: true,
  },
  {
    name: 'Stewardship',
    price: '$35/mo',
    description: 'For practitioners who hold space.',
    detail: 'Guardian Console. Client tools.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
  },
];

export function SlideTiers() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Three Ways to Be Here
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Relationship, not transaction
      </motion.h2>

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
            className={`${tier.bgColor} backdrop-blur-sm rounded-2xl p-8 border ${tier.borderColor} ${
              tier.featured ? 'ring-2 ring-teal-400/30 scale-105' : ''
            }`}
          >
            <h3 className={`${tier.color} text-2xl font-medium mb-2`}>
              {tier.name}
            </h3>
            <div className="mb-4">
              <span className="text-white text-xl">{tier.price}</span>
              {tier.priceNote && (
                <span className="text-white/40 text-sm block mt-1">{tier.priceNote}</span>
              )}
            </div>
            <p className="text-white/70 text-base mb-2">{tier.description}</p>
            <p className="text-white/40 text-sm">{tier.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Pioneer callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center"
      >
        <p className="text-white/40 text-base">
          <span className="text-amber-300">Pioneer</span> — $222 once, never again.
        </p>
        <p className="text-white/25 text-sm mt-1">
          Founding believers. Honored forever. Price locked for life.
        </p>
      </motion.div>
    </div>
  );
}
