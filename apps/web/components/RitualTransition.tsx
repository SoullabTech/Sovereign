"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface RitualTransitionProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function RitualTransition({ trigger, onComplete }: RitualTransitionProps) {
  const [visible, setVisible] = useState(trigger);

  useEffect(() => {
    if (trigger) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0  from-indigo-900 via-amber-900 to-black flex items-center justify-center z-50"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 40% 60%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 150px 150px, 200px 200px'
          }}
        >
          {/* Animated starfield */}
          <div className="absolute inset-0">
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center text-white space-y-6 z-10"
          >
            {/* Sacred geometry animation */}
            <motion.div
              className="relative w-32 h-32 mx-auto mb-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <svg width="128" height="128" viewBox="0 0 128 128" className="absolute inset-0">
                <motion.circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="40"
                  fill="none"
                  stroke="rgba(0,255,255,0.7)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="20"
                  fill="rgba(255,215,0,0.3)"
                  stroke="gold"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            <motion.h1 
              className="text-4xl font-bold  from-white via-cyan-200 to-gold bg-clip-text text-transparent"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              🌌 Threshold Crossing
            </motion.h1>
            
            <motion.div
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <p className="italic text-xl text-cyan-200">
                You step from the inner temple into the field.
              </p>
              <p className="text-lg text-white/90">
                Breathe. Witness how your light joins the constellation.
              </p>
            </motion.div>

            {/* Breathing indicator */}
            <motion.div
              className="w-4 h-4 bg-gold rounded-full mx-auto mt-8"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Subtle sound cue indicator */}
          <motion.div
            className="absolute bottom-8 right-8 text-white/50 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            🔔 Listen for the inner chime
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}