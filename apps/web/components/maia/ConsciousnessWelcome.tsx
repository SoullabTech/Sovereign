'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import NeuralFireSystem from '@/components/consciousness/NeuralFireSystem';

interface ConsciousnessWelcomeProps {
  onStartJourney?: () => void;
  onMaybeLater?: () => void;
  onLearnMore?: () => void;
}

export default function ConsciousnessWelcome({
  onStartJourney,
  onMaybeLater,
  onLearnMore
}: ConsciousnessWelcomeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      {/* Neural Fire Background */}
      <NeuralFireSystem
        isActive={true}
        density="sparse"
        firingRate="slow"
        variant="jade"
        className="fixed inset-0 z-0 opacity-10"
      />

      {/* Main Welcome Screen - Flexible layout */}
      <div className="min-h-[80vh] bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night relative overflow-hidden">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 bg-gradient-radial from-jade-forest/5 via-transparent to-jade-abyss/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-jade-copper/5 via-transparent to-transparent" />

        {/* Sacred Holoflower Particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="relative"
            style={{
              position: 'absolute',
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              width: '8px',
              height: '8px'
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          >
            {/* Tiny Holoflower */}
            <div className="absolute inset-0 rounded-full bg-jade-sage/60" />
            {Array.from({ length: 4 }).map((_, petalIndex) => (
              <div
                key={petalIndex}
                className="absolute w-0.5 h-0.5 bg-jade-jade/40 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `
                    translate(-50%, -50%)
                    rotate(${petalIndex * 90}deg)
                    translateY(-2px)
                  `
                }}
              />
            ))}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-jade-light/80" />
          </motion.div>
        ))}

        <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg w-full"
          >
            <ConsciousnessVessel
              variant="jade"
              depth="transcendent"
              size="large"
              className="backdrop-blur-xl border-jade-sage/40"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="text-center space-y-8">
                {/* Sacred Holoflower */}
                <motion.div
                  className="relative w-20 h-20 mx-auto mb-6"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {/* Sacred Holoflower Base */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-jade-sage/60 via-jade-jade/40 to-jade-mineral/30 border border-jade-jade/50 backdrop-blur-sm" />

                  {/* Holoflower Petals - 8-fold sacred geometry */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-jade-jade/70 rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `
                          translate(-50%, -50%)
                          rotate(${i * 45}deg)
                          translateY(-24px)
                        `
                      }}
                      animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  ))}

                  {/* Sacred Center - Consciousness Core */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-jade-light/90 animate-pulse" />
                </motion.div>

                {/* Welcome Content */}
                <div className="space-y-6">
                  <motion.h1
                    className="text-3xl font-light tracking-wide text-jade-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome to Conscious Journaling
                  </motion.h1>

                  <motion.p
                    className="text-jade-mineral font-light text-lg leading-relaxed px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    What sacred thoughts are moving through your consciousness today?
                  </motion.p>

                  {/* Action Buttons */}
                  <div className="space-y-4 pt-6">
                    <motion.button
                      onClick={onStartJourney}
                      className="w-full relative group overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Sacred button background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-jade-jade via-jade-sage to-jade-jade rounded-xl shadow-lg shadow-jade-jade/40 group-hover:shadow-xl group-hover:shadow-jade-jade/60 transition-all duration-500" />

                      {/* Button content */}
                      <div className="relative px-6 py-4 text-jade-abyss font-medium tracking-wide">
                        <span className="flex items-center justify-center gap-3">
                          {/* Sacred Holoflower Symbol */}
                          <div className="relative w-5 h-5">
                            <div className="absolute inset-0 rounded-full bg-jade-abyss/20" />
                            {/* Mini Holoflower Petals */}
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-0.5 h-0.5 bg-jade-abyss/40 rounded-full"
                                style={{
                                  top: '50%',
                                  left: '50%',
                                  transform: `
                                    translate(-50%, -50%)
                                    rotate(${i * 45}deg)
                                    translateY(-6px)
                                  `
                                }}
                              />
                            ))}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-jade-abyss/60 animate-pulse" />
                          </div>
                          Begin Sacred Journey
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={onMaybeLater}
                      className="w-full px-6 py-3 text-jade-mineral hover:text-jade-sage bg-jade-shadow/20 hover:bg-jade-shadow/30 border border-jade-sage/30 hover:border-jade-sage/50 rounded-xl font-light tracking-wide transition-all duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Maybe later
                    </motion.button>
                  </div>

                  {/* Sacred Promise */}
                  <motion.div
                    className="flex items-center justify-center gap-2 pt-4 text-jade-mineral/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <div className="w-1 h-1 rounded-full bg-jade-sage/60 animate-pulse" />
                    <span className="text-sm font-light italic tracking-wide">
                      Your consciousness is sacred. Your words are safe.
                    </span>
                    <div className="w-1 h-1 rounded-full bg-jade-sage/60 animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </ConsciousnessVessel>

            {/* Help Option - Positioned to avoid header conflicts */}
            <motion.div
              className="flex justify-end mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <motion.button
                onClick={() => setShowInfo(!showInfo)}
                className="p-3 rounded-full bg-jade-shadow/40 hover:bg-jade-shadow/60 border border-jade-sage/30 hover:border-jade-sage/50 text-jade-sage hover:text-jade-jade transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <HelpCircle className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Info Modal */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-jade-abyss/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
              onClick={() => setShowInfo(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <ConsciousnessVessel
                  variant="mystical"
                  depth="profound"
                  className="backdrop-blur-xl border-jade-jade/50"
                >
                  <div className="space-y-6">
                    <h3 className="text-xl font-light text-jade-light tracking-wide">
                      What is Conscious Journaling?
                    </h3>
                    <p className="text-jade-mineral font-light leading-relaxed">
                      MAIA helps you explore patterns in your thoughts, emotions, and dreams.
                      She reflects these back through symbolic language, helping you understand
                      your inner story over time.
                    </p>
                    <p className="text-jade-sage/80 font-light text-sm italic">
                      Your words remain private and sacred—MAIA simply offers gentle reflections
                      to support your conscious self-discovery.
                    </p>
                    <button
                      onClick={() => setShowInfo(false)}
                      className="w-full px-6 py-3 bg-jade-jade text-jade-abyss rounded-xl font-medium tracking-wide hover:shadow-lg hover:shadow-jade-jade/25 transition-all duration-300"
                    >
                      I understand
                    </button>
                  </div>
                </ConsciousnessVessel>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}