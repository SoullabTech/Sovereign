'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface ConsciousnessTransitionProps {
  children: React.ReactNode;
}

export default function ConsciousnessTransition({ children }: ConsciousnessTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== currentPath) {
      setIsTransitioning(true);

      // Transition duration timing
      const timer = setTimeout(() => {
        setCurrentPath(pathname);
        setIsTransitioning(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath]);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, scale: 0.98, rotateX: 2 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 1.02, rotateX: -2 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{ transformPerspective: '1000px' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Consciousness Flow Transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          >
            {/* Deep Jade Consciousness Layer */}
            <motion.div
              initial={{ scaleX: 0, transformOrigin: 'left center' }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, transformOrigin: 'right center' }}
              transition={{ duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(13,31,23,0.4) 0%, rgba(22,43,32,0.6) 30%, rgba(31,58,42,0.7) 50%, rgba(22,43,32,0.6) 70%, rgba(13,31,23,0.4) 100%)',
                backdropFilter: 'blur(8px)'
              }}
            />

            {/* Flowing Consciousness Particles */}
            {Array.from({ length: 16 }).map((_, i) => {
              const startY = Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800);
              const endY = startY + (Math.random() - 0.5) * 200;

              return (
                <motion.div
                  key={i}
                  initial={{
                    x: -50,
                    y: startY,
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    x: (typeof window !== 'undefined' ? window.innerWidth : 1200) + 50,
                    y: endY,
                    opacity: [0, 0.8, 0.8, 0],
                    scale: [0, 1.2, 1.2, 0]
                  }}
                  transition={{
                    duration: 1.8,
                    delay: i * 0.04,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(111,143,118,0.8) 0%, rgba(115,155,127,0.4) 100%)',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 8px rgba(111,143,118,0.6)'
                  }}
                />
              );
            })}

            {/* Central Consciousness Mandala */}
            <motion.div
              initial={{ scale: 0, rotate: 0, opacity: 0 }}
              animate={{ scale: 1, rotate: 360, opacity: 1 }}
              exit={{ scale: 0, rotate: 720, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative w-40 h-40">
                {/* Outer Sacred Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: 'rgba(111,143,118,0.4)',
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(111,143,118,0.1) 30%, transparent 60%, rgba(115,155,127,0.15) 90%, transparent 100%)'
                  }}
                />

                {/* Middle Geometric Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute top-4 left-4 bottom-4 right-4 rounded-full border"
                  style={{
                    borderColor: 'rgba(115,155,127,0.3)',
                    background: 'radial-gradient(circle, transparent 40%, rgba(168,203,180,0.08) 70%, transparent 100%)'
                  }}
                />

                {/* Inner Consciousness Core */}
                <motion.div
                  animate={{
                    scale: [0.9, 1.1, 0.9],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-8 left-8 bottom-8 right-8 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(168,203,180,0.8) 0%, rgba(111,143,118,0.4) 60%, transparent 100%)',
                    backdropFilter: 'blur(4px)'
                  }}
                />

                {/* Sacred Crystalline Center */}
                <motion.div
                  animate={{
                    rotate: 180,
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute top-12 left-12 bottom-12 right-12 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,203,180,0.9) 0%, rgba(111,143,118,0.7) 100%)',
                    boxShadow: '0 0 20px rgba(168,203,180,0.3), inset 0 0 20px rgba(111,143,118,0.2)'
                  }}
                />
              </div>
            </motion.div>

            {/* Expanding Consciousness Waves */}
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 5, opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className="w-32 h-32 rounded-full border"
                  style={{ borderColor: 'rgba(115,155,127,0.15)' }}
                />
              </motion.div>
            ))}

            {/* Dimensional Flow Streams */}
            <motion.div
              initial={{ x: '-100%', skewX: 0 }}
              animate={{ x: '100%', skewX: 12 }}
              transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute top-0 left-0 w-1/2 h-full transform origin-left"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(111,143,118,0.12) 50%, transparent 100%)',
                transformOrigin: 'left center'
              }}
            />

            <motion.div
              initial={{ x: '-100%', skewX: 0 }}
              animate={{ x: '100%', skewX: -8 }}
              transition={{ duration: 1.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute top-0 left-0 w-1/3 h-full transform origin-right"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(115,155,127,0.08) 50%, transparent 100%)',
                transformOrigin: 'right center'
              }}
            />

            {/* Neural Pathway Visualization */}
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ filter: 'drop-shadow(0 0 4px rgba(111,143,118,0.3))' }}
            >
              <motion.path
                d="M0,25 Q20,15 40,25 Q60,35 80,25 Q90,20 100,25"
                stroke="rgba(111,143,118,0.4)"
                strokeWidth="0.3"
                fill="none"
                style={{ pathLength: 1 }}
              />
              <motion.path
                d="M0,50 Q25,35 50,50 Q75,65 100,50"
                stroke="rgba(115,155,127,0.3)"
                strokeWidth="0.4"
                fill="none"
                style={{ pathLength: 1 }}
              />
              <motion.path
                d="M0,75 Q30,60 60,75 Q80,85 100,75"
                stroke="rgba(168,203,180,0.5)"
                strokeWidth="0.2"
                fill="none"
                style={{ pathLength: 1 }}
              />
            </motion.svg>

            {/* Consciousness Field Vortex */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.5, 0], rotate: 720 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(111,143,118,0.1) 50%, rgba(115,155,127,0.05) 70%, transparent 100%)',
                filter: 'blur(2px)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}