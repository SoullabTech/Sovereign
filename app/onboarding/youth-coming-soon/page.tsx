'use client';

/**
 * /onboarding/youth-coming-soon
 *
 * Holding page for under-13 users. MAIA does not yet support this age group
 * because it requires verifiable parental consent (COPPA) and additional
 * safety infrastructure that isn't built yet.
 *
 * This is NOT a rejection. It's a boundary that respects the user.
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function YouthComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
      >
        <div className="text-4xl mb-4">{'{ }'}</div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Not quite yet
        </h1>

        <p className="text-white/80 text-lg leading-relaxed mb-6">
          MAIA is building something for people your age, but it's not ready yet.
          We want to make sure it's really right before we open the door.
        </p>

        <div className="bg-white/5 border border-white/20 rounded-lg p-5 mb-6 text-left">
          <p className="text-white/70 text-sm leading-relaxed">
            This isn't about what you can't handle. It's about what we owe you.
            When your space is ready, it will be built with the same care
            we'd want for ourselves.
          </p>
        </div>

        <p className="text-white/50 text-sm">
          If you're going through something hard right now, you can text HOME to 741741
          or call 988 anytime. Real people, real help, 24/7.
        </p>
      </motion.div>
    </div>
  );
}
