'use client';

import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';

export function SlideAsk() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 relative">
      {/* Background sacred geometry */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-amber-400/20 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-teal-400/20 rounded-full" />
      </div>

      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-amber-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        The Ask
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Join the founding circle
      </motion.h2>

      {/* Three paths */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full mb-16">
        {/* Investors */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-amber-400/10 backdrop-blur-sm rounded-2xl p-8 border border-amber-400/30 text-center"
        >
          <h3 className="text-amber-400 text-xl font-medium mb-4">For Investors</h3>
          <p className="text-white/70 mb-4">Seed round open</p>
          <p className="text-white/50 text-sm">
            Engineering, practitioner ecosystem, licensing infrastructure
          </p>
        </motion.div>

        {/* Practitioners */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="bg-teal-400/10 backdrop-blur-sm rounded-2xl p-8 border border-teal-400/30 text-center"
        >
          <h3 className="text-teal-400 text-xl font-medium mb-4">For Practitioners</h3>
          <p className="text-white/70 mb-4">Early Stewardship access</p>
          <p className="text-white/50 text-sm">
            Shape the Guardian Console. Supervision tools. Client integration.
          </p>
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-purple-400/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30 text-center"
        >
          <h3 className="text-purple-400 text-xl font-medium mb-4">For Members</h3>
          <p className="text-white/70 mb-4">The door is open</p>
          <p className="text-white/50 text-sm">
            Enter through relationship. Receive a bead. Begin.
          </p>
        </motion.div>
      </div>

      {/* Holoflower */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="mb-8"
      >
        <div className="w-24 h-24">
          <Holoflower size="xl" glowIntensity="low" animate={true} />
        </div>
      </motion.div>

      {/* Closing line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="text-white/60 text-xl text-center italic"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        "Sovereignty is never paywalled."
      </motion.p>

      {/* Contact */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="absolute bottom-24 text-white/30 text-sm"
      >
        kelly@soullab.life · soullab.life
      </motion.p>
    </div>
  );
}
