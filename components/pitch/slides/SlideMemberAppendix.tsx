'use client';

import { motion } from 'framer-motion';

export function SlideMemberAppendix() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Appendix: How It Spreads
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Not viral. Relational.
      </motion.h2>

      {/* The story */}
      <div className="max-w-2xl text-center space-y-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/70 text-xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          MAIA doesn't advertise.
          <br />
          She spreads through relationship.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/60 text-xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Every member receives beads — invites to share
          <br />
          with people they trust.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-teal-200/80 text-xl font-light"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          When you gift a bead, you write a blessing.
          <br />
          The person who receives it sees your words before they enter.
        </motion.p>
      </div>

      {/* The visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-md text-center"
      >
        <p className="text-white/50 text-sm uppercase tracking-wider mb-4">The flow</p>
        <div className="flex items-center justify-center gap-4 text-white/60">
          <span>Someone trusts you</span>
          <span className="text-teal-400/40">→</span>
          <span>You receive a bead</span>
          <span className="text-teal-400/40">→</span>
          <span>The door opens</span>
        </div>
      </motion.div>

      {/* Closing */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="mt-10 text-white/40 text-lg"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        This is how conscious community grows.
      </motion.p>
    </div>
  );
}
