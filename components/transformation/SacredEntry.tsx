'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SacredEntryProps {
  onComplete: (data: { name: string; passcode: string }) => void;
}

export function SacredEntry({ onComplete }: SacredEntryProps) {
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [consciousness, setConsciousness] = useState(0);

  // Sacred consciousness breathing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setConsciousness(c => (c + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const handleNameComplete = () => {
    if (name.trim().length >= 2) {
      setShowPasscode(true);
    }
  };

  const handleSubmit = async () => {
    setIsValidating(true);
    // Sacred pause for validation
    await new Promise(resolve => setTimeout(resolve, 1200));
    onComplete({ name: name.trim(), passcode: passcode.toUpperCase() });
  };

  const consciousnessGlow = {
    filter: `brightness(${1 + Math.sin(consciousness * 0.1) * 0.2})`,
    transform: `scale(${1 + Math.sin(consciousness * 0.08) * 0.05})`,
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sacred Gradient Background - Sage Foundation */}
      <div
        className="absolute inset-0 transition-all duration-[4000ms]"
        style={{
          background: `linear-gradient(135deg,
            #f0fdf4 0%,
            #dcfce7 25%,
            #bbf7d0 50%,
            #86efac 100%
          )`
        }}
      />

      {/* Sacred Geometry Layer */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={consciousnessGlow}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <radialGradient id="sacredGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#22c55e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.3" />
              </radialGradient>
              <filter id="sacredBlur">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>

            {/* Sacred Holoflower */}
            <g transform="translate(60,60)">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.path
                  key={i}
                  d="M0,-30 Q-15,-20 -20,0 Q-15,20 0,30 Q15,20 20,0 Q15,-20 0,-30"
                  fill="url(#sacredGlow)"
                  filter="url(#sacredBlur)"
                  transform={`rotate(${i * 60})`}
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}

              {/* Center consciousness point */}
              <circle
                cx="0"
                cy="0"
                r="3"
                fill="#fde047"
                opacity="0.9"
              />
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Header - Soullab Presence */}
        <div className="pt-16 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <h1 className="text-2xl font-light text-sage-900 tracking-[0.2em] mb-2">
              SOULLAB
            </h1>
            <div className="w-16 h-[1px] bg-sage-600 mx-auto opacity-50" />
          </motion.div>
        </div>

        {/* Sacred Welcome */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">
          <motion.div
            className="max-w-md text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, delay: 1 }}
          >

            {/* Welcome Message */}
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-sage-900 font-serif leading-relaxed">
                You've been invited to explore consciousness
              </h2>
              <p className="text-lg text-sage-700 font-light leading-relaxed">
                in a space designed for transformation.
              </p>
            </div>

            {/* Name Entry */}
            <AnimatePresence mode="wait">
              {!showPasscode ? (
                <motion.div
                  key="nameEntry"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6"
                >
                  <p className="text-sage-600 font-light">
                    We begin with your name
                  </p>

                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleNameComplete()}
                      placeholder="Your name"
                      className="w-full bg-white/40 backdrop-blur-sm border border-sage-200/50 rounded-none
                               px-6 py-4 text-center text-lg text-sage-900 placeholder-sage-500
                               focus:outline-none focus:border-sage-400 focus:ring-0 focus:shadow-lg
                               transition-all duration-700"
                      style={{
                        fontFamily: '"Crimson Text", Georgia, serif',
                        letterSpacing: '0.05em'
                      }}
                    />

                    {name.length >= 2 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleNameComplete}
                        className="mt-6 px-8 py-3 bg-sage-600/20 border border-sage-600/30 text-sage-800
                                 hover:bg-sage-600/30 hover:border-sage-600/50 transition-all duration-500
                                 font-light tracking-wide"
                      >
                        Continue
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="passcodeEntry"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6"
                >
                  <p className="text-sage-600 font-light">
                    Welcome, <span className="text-sage-900 font-medium">{name}</span>
                  </p>

                  <p className="text-sage-600 font-light text-sm">
                    Please enter your invitation code
                  </p>

                  <div className="space-y-6">
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && passcode.length >= 8 && handleSubmit()}
                      placeholder="INVITATION CODE"
                      className="w-full bg-white/40 backdrop-blur-sm border border-sage-200/50 rounded-none
                               px-6 py-4 text-center text-lg text-sage-900 placeholder-sage-500 tracking-widest
                               focus:outline-none focus:border-sage-400 focus:ring-0 focus:shadow-lg
                               transition-all duration-700"
                    />

                    {passcode.length >= 8 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleSubmit}
                        disabled={isValidating}
                        className="px-8 py-3 bg-sage-600/20 border border-sage-600/30 text-sage-800
                                 hover:bg-sage-600/30 hover:border-sage-600/50 transition-all duration-500
                                 font-light tracking-wide disabled:opacity-50"
                      >
                        {isValidating ? 'Validating...' : 'Enter Sacred Space'}
                      </motion.button>
                    )}
                  </div>

                  {/* Help text */}
                  <motion.p
                    className="text-xs text-sage-500 font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    Need an invitation? Contact hello@soullab.life
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtle guidance */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3, delay: 3 }}
              className="text-center"
            >
              <p className="text-sm text-sage-500 font-light italic">
                This is your private sanctuary for self-discovery,<br />
                guided by consciousness designed for transformation.
              </p>
            </motion.div>

          </motion.div>
        </div>

        {/* Subtle footer */}
        <div className="pb-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 4 }}
            className="text-xs text-sage-400 font-light tracking-wide"
          >
            A transformation begins
          </motion.div>
        </div>

      </div>

      {/* Validation overlay */}
      <AnimatePresence>
        {isValidating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full mx-auto"
              />
              <p className="text-sage-700 font-light tracking-wide">
                Preparing your consciousness space...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}