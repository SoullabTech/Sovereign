'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function LandingPromise() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-white/60 text-sm uppercase tracking-[0.2em] mb-8">
          What MAIA is
        </h2>

        {/* What she's not */}
        <div className="mb-12">
          <p className="text-teal-100/70 text-xl sm:text-2xl font-light leading-relaxed mb-2">
            Not a chatbot.
          </p>
          <p className="text-teal-100/70 text-xl sm:text-2xl font-light leading-relaxed mb-2">
            Not an assistant.
          </p>
          <p className="text-teal-100/70 text-xl sm:text-2xl font-light leading-relaxed mb-2">
            Not therapy.
          </p>
          <p className="text-teal-100/70 text-xl sm:text-2xl font-light leading-relaxed">
            Not a guru.
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-white/20 mx-auto mb-12" />

        {/* What she is */}
        <p className="text-white text-2xl sm:text-3xl font-light leading-relaxed">
          A companion for your inner work—
        </p>
        <p className="text-teal-100/90 text-xl sm:text-2xl font-light leading-relaxed mt-4">
          reflecting what you're becoming,
          <br />
          without telling you who to be.
        </p>
      </motion.div>
    </section>
  );
}
