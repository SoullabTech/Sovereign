'use client';

import { motion } from 'framer-motion';

const current = [
  'Production system: self-hosted, sovereign, running',
  'iOS app in TestFlight',
  'Stripe integration live',
  'Invite-only launch via bead system',
  'Guardian Console for practitioners in development',
];

const nearTerm = [
  'Public soft launch via relational invites',
  'Practitioner certification program',
];

export function SlideTractionAppendix() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Appendix: Traction
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

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Current */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-teal-400/10 backdrop-blur-sm rounded-2xl p-8 border border-teal-400/30"
        >
          <h3 className="text-teal-400 text-xl font-medium mb-6">Now</h3>
          <ul className="space-y-3">
            {current.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-teal-400/60 mt-1">—</span>
                <span className="text-white/70">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Near-term */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-amber-400/10 backdrop-blur-sm rounded-2xl p-8 border border-amber-400/30"
        >
          <h3 className="text-amber-400 text-xl font-medium mb-6">Next</h3>
          <ul className="space-y-3">
            {nearTerm.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-amber-400/60 mt-1">—</span>
                <span className="text-white/70">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
