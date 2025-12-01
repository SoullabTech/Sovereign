'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

// Sacred breathing animation (golden ratio timing)
const breathingVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 1.618, ease: 'easeOut' }
  }
};

// Continuous breathing pulse
const pulseVariants = {
  breathing: {
    scale: [1, 1.08, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 4, // Slow, meditative breathing
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Ripple effect on interaction
const rippleVariants = {
  initial: { scale: 0, opacity: 0.6 },
  animate: {
    scale: 2,
    opacity: 0,
    transition: { duration: 0.8, ease: 'easeOut' }
  }
};

export default function LogoThreshold({ onNext }: { onNext: () => void }) {
  const [showRipple, setShowRipple] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const controls = useAnimation();

  // Initialize entrance sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      controls.start('breathing');
    }, 1000);
    return () => clearTimeout(timer);
  }, [controls]);

  // Handle logo interaction
  const handleLogoClick = () => {
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 800);
  };

  // Handle continue with ceremonial delay
  const handleContinue = () => {
    controls.stop();
    controls.start({
      scale: 1.1,
      transition: { duration: 0.3 }
    }).then(() => {
      setTimeout(onNext, 400);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="text-center px-6 py-12 min-h-[70vh] flex flex-col justify-center items-center"
    >
      {/* Sacred Logo Section */}
      <div className="relative mb-12 flex justify-center">
        {/* Background sacred geometry */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-amber-400">
          <div className="w-48 h-48 border border-current rounded-full" />
          <div className="absolute w-32 h-32 border border-current rounded-full" />
          <div className="absolute w-16 h-16 border border-current rounded-full" />
        </div>

        {/* Ripple effect overlay */}
        {showRipple && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial="initial"
            animate="animate"
            variants={rippleVariants}
          >
            <div className="w-24 h-24 rounded-full border-2 border-amber-400 opacity-30" />
          </motion.div>
        )}

        {/* Main Logo */}
        <motion.div
          variants={breathingVariants}
          animate={isReady ? controls : 'visible'}
          className="relative z-10 cursor-pointer select-none"
          onClick={handleLogoClick}
        >
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full blur-xl bg-amber-400/40 scale-120" />
            
            {/* Logo circle */}
            <div className="relative w-24 h-24 rounded-full border-2 border-amber-400 bg-neutral-900 flex items-center justify-center text-2xl font-light tracking-wider text-amber-400">
              SL
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sacred Welcome Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mb-12 space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-wide text-white">
          Welcome
        </h1>
        
        <p className="text-lg md:text-xl font-light leading-relaxed max-w-md mx-auto text-neutral-400">
          ✨ This is your <span className="text-amber-400">Soullab</span> — 
          a sacred space for inner exploration and conscious transformation.
        </p>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <button
          onClick={handleContinue}
          className="group relative px-8 py-3 rounded-full border-2 border-amber-400 text-amber-400 bg-transparent transition-all duration-300 hover:scale-105 hover:bg-amber-400/20 active:scale-95"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 rounded-full blur bg-amber-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          
          <span className="relative text-lg font-light tracking-wide">
            Begin
          </span>
        </button>
      </motion.div>

      {/* Subtle instruction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="mt-8 text-sm opacity-50 text-neutral-400"
      >
        Take a breath. Set an intention. Click the logo if you feel called to.
      </motion.p>
    </motion.div>
  );
}