'use client';

import React from 'react';
import { motion } from 'framer-motion';

const doors = [
  { 
    icon: '🪞', 
    title: 'Mirror', 
    description: 'Reflect on your inner world' 
  },
  { 
    icon: '🌀', 
    title: 'Spiral', 
    description: 'Navigate your journey patterns' 
  },
  { 
    icon: '📓', 
    title: 'Journal', 
    description: 'Capture insights and wisdom' 
  },
  { 
    icon: '🎚️', 
    title: 'Attune', 
    description: 'Align with your sacred self' 
  }
];

// Staggered entrance animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const doorVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.9 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

export default function FourDoorsNav({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="text-center px-6 py-12 min-h-[70vh] flex flex-col justify-center items-center"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-light text-white mb-4">
          Four Sacred Doors
        </h1>
        <p className="text-lg text-neutral-400 max-w-md mx-auto">
          Each pathway offers unique ways to explore and transform
        </p>
      </motion.div>

      {/* Four Doors Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto"
      >
        {doors.map((door, index) => (
          <motion.div
            key={door.title}
            variants={doorVariants}
            className="p-6 rounded-lg bg-neutral-800/50 border border-neutral-700 hover:border-amber-400/50 transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="text-3xl mb-3">{door.icon}</div>
            <h3 className="text-lg font-medium text-white mb-2">{door.title}</h3>
            <p className="text-sm text-neutral-400">{door.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        onClick={onNext}
        className="px-8 py-3 rounded-full border-2 border-amber-400 text-amber-400 bg-transparent hover:bg-amber-400/20 transition-all duration-300 hover:scale-105"
      >
        <span className="text-lg font-light">Show Me</span>
      </motion.button>
    </motion.div>
  );
}