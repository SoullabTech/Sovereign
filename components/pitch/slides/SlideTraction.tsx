'use client';

import { motion } from 'framer-motion';

const current = [
  'Production system: self-hosted, sovereign, running',
  'iOS app in TestFlight',
  'Invite-only launch via blessing system',
  'Guardian Console in development',
];

const nearTerm = [
  'Stripe integration',
  'Public soft launch via bead system',
  'Practitioner certification program',
];

export function SlideTraction() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Traction & Roadmap
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Where we are
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-12 max-w-4xl w-full">
        {/* Current state */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-teal-400/10 backdrop-blur-sm rounded-2xl p-8 border border-teal-400/30"
        >
          <h3 className="text-teal-400 text-xl font-medium mb-6">Built & Running</h3>
          <ul className="space-y-4">
            {current.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-teal-400 mt-1">✓</span>
                <span className="text-white/80">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Near term */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-amber-400/10 backdrop-blur-sm rounded-2xl p-8 border border-amber-400/30"
        >
          <h3 className="text-amber-400 text-xl font-medium mb-6">Near Term</h3>
          <ul className="space-y-4">
            {nearTerm.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-amber-400/60 mt-1">→</span>
                <span className="text-white/80">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Growth model note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-12 text-white/40 text-center max-w-xl"
      >
        Relational growth, not viral. Each member receives beads to share with people they trust.
      </motion.p>
    </div>
  );
}
