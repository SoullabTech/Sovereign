'use client';

import { motion } from 'framer-motion';

const tools = [
  {
    name: 'Journal',
    description: 'Write your days. Record your dreams. Then talk to MAIA about them.',
    detail: 'Not just storage. Dialogue. She helps you see what you wrote from new angles.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    borderColor: 'border-teal-400/30',
  },
  {
    name: 'Capture',
    description: 'Some conversations deserve to be kept.',
    detail: 'Capture distills the essence — not a transcript, but what mattered. For future you.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
  },
  {
    name: 'Explore',
    description: 'Tools that help you see all the facets of your nature.',
    detail: 'Patterns. Themes. Blind spots. Gifts. The parts you forget and the ones you avoid.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
  },
];

export function SlideTools() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-purple-400/60 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Tools for Seeing Yourself
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        A full system for inner work
      </motion.h2>

      {/* Tool cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
            className={`${tool.bgColor} backdrop-blur-sm rounded-2xl p-8 border ${tool.borderColor}`}
          >
            <h3 className={`${tool.color} text-2xl font-medium mb-3`}>
              {tool.name}
            </h3>
            <p className="text-white/80 text-lg mb-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {tool.description}
            </p>
            <p className="text-white/50 text-base" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {tool.detail}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Connection line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="text-white/50 text-lg text-center"
        style={{ fontFamily: 'Crimson Pro, serif' }}
      >
        Everything connects. Nothing is lost.
      </motion.p>
    </div>
  );
}
