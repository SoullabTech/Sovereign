'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const promises = [
  {
    text: "Your data stays yours. Always.",
    emphasis: true
  },
  {
    text: "No training on your conversations.",
    emphasis: false
  },
  {
    text: "No selling your patterns.",
    emphasis: false
  },
  {
    text: "Self-hosted. Open architecture.",
    emphasis: false
  },
  {
    text: "You can leave anytime and take everything.",
    emphasis: true
  }
];

export function LandingSovereignty() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-white/60 text-sm uppercase tracking-[0.2em] mb-12">
          The sovereignty promise
        </h2>

        <div className="space-y-6">
          {promises.map((promise, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`text-xl sm:text-2xl font-light leading-relaxed ${
                promise.emphasis
                  ? 'text-white'
                  : 'text-teal-100/70'
              }`}
            >
              {promise.text}
            </motion.p>
          ))}
        </div>

        {/* Visual anchor - shield/lock metaphor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 flex justify-center"
        >
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
