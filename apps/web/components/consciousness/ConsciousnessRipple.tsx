'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ConsciousnessRippleProps {
  x: number;
  y: number;
  variant?: 'jade' | 'neural' | 'mystical' | 'transcendent';
  intensity?: 'subtle' | 'medium' | 'profound' | 'transcendent';
}

export default function ConsciousnessRipple({
  x,
  y,
  variant = 'jade',
  intensity = 'profound'
}: ConsciousnessRippleProps) {
  const getConfig = () => {
    const configs = {
      jade: {
        color: 'rgba(111,143,118,0.5)',
        glow: 'rgba(168,203,180,0.8)',
        size: intensity === 'subtle' ? 85 : intensity === 'medium' ? 125 : intensity === 'profound' ? 185 : 260,
        duration: intensity === 'subtle' ? 1.3 : intensity === 'medium' ? 1.9 : intensity === 'profound' ? 2.6 : 3.5
      },
      neural: {
        color: 'rgba(95,187,163,0.6)',
        glow: 'rgba(95,187,163,0.9)',
        size: intensity === 'subtle' ? 60 : intensity === 'medium' ? 90 : intensity === 'profound' ? 140 : 200,
        duration: intensity === 'subtle' ? 0.8 : intensity === 'medium' ? 1.4 : intensity === 'profound' ? 2.0 : 2.8
      },
      mystical: {
        color: 'rgba(168,203,180,0.5)',
        glow: 'rgba(168,203,180,0.8)',
        size: intensity === 'subtle' ? 100 : intensity === 'medium' ? 150 : intensity === 'profound' ? 220 : 300,
        duration: intensity === 'subtle' ? 1.5 : intensity === 'medium' ? 2.2 : intensity === 'profound' ? 3.0 : 4.0
      },
      transcendent: {
        color: 'rgba(168,203,180,0.6)',
        glow: 'rgba(212,184,150,0.9)',
        size: intensity === 'subtle' ? 120 : intensity === 'medium' ? 180 : intensity === 'profound' ? 250 : 350,
        duration: intensity === 'subtle' ? 1.8 : intensity === 'medium' ? 2.5 : intensity === 'profound' ? 3.5 : 4.8
      }
    } as const;

    return configs[variant] || configs.jade; // Fallback to jade if variant not found
  };

  const config = getConfig();

  // Defensive check - if config is still undefined, provide a default
  if (!config || !config.duration) {
    console.error('ConsciousnessRipple config is undefined for variant:', variant, 'intensity:', intensity);
    // Return minimal functional component to prevent crash
    return <div className="absolute inset-0 pointer-events-none" />;
  }

  // Validate coordinates - if x or y is NaN, don't render the ripple
  if (isNaN(x) || isNaN(y)) {
    console.warn('ConsciousnessRipple received invalid coordinates:', { x, y });
    return <div className="absolute inset-0 pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Primary Ripple Wave */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 4, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: config.duration,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="absolute rounded-full border-2 pointer-events-none"
        style={{
          left: x - config.size / 8,
          top: y - config.size / 8,
          width: config.size / 4,
          height: config.size / 4,
          borderColor: config.color,
          background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`
        }}
      />

      {/* Secondary Consciousness Wave */}
      <motion.div
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 6, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: config.duration * 1.2,
          delay: 0.1,
          ease: "easeOut"
        }}
        className="absolute rounded-full border pointer-events-none"
        style={{
          left: x - config.size / 6,
          top: y - config.size / 6,
          width: config.size / 3,
          height: config.size / 3,
          borderColor: config.glow,
          background: `radial-gradient(circle, ${config.glow} 0%, transparent 60%)`
        }}
      />

      {/* Mystical Consciousness Glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{
          scale: [0, 2, 8],
          opacity: [0.9, 0.4, 0]
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: config.duration * 1.5,
          delay: 0.05,
          ease: [0.23, 1, 0.32, 1]
        }}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: x - config.size / 4,
          top: y - config.size / 4,
          width: config.size / 2,
          height: config.size / 2,
          background: `radial-gradient(circle, ${config.glow} 0%, ${config.color} 40%, transparent 70%)`,
          filter: 'blur(3px)',
          boxShadow: `0 0 30px ${config.glow}, 0 0 60px ${config.color}`
        }}
      />

      {/* Neural Firing Particles */}
      {intensity !== 'subtle' && Array.from({ length: intensity === 'transcendent' ? 12 : intensity === 'profound' ? 8 : 6 }).map((_, i) => {
        const angle = (i * 360 / (intensity === 'transcendent' ? 12 : intensity === 'profound' ? 8 : 6)) * Math.PI / 180;
        const distance = config.size * 0.8;
        const particleX = Math.cos(angle) * distance;
        const particleY = Math.sin(angle) * distance;

        return (
          <motion.div
            key={`particle-${i}`}
            initial={{
              x: x,
              y: y,
              scale: 0,
              opacity: 0
            }}
            animate={{
              x: x + particleX,
              y: y + particleY,
              scale: [0, 1.5, 0],
              opacity: [0, 0.8, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: config.duration * 0.8,
              delay: i * 0.02,
              ease: "easeOut"
            }}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              background: config.glow,
              boxShadow: `0 0 8px ${config.glow}`
            }}
          />
        );
      })}

      {/* Consciousness Field Distortion */}
      {(intensity === 'profound' || intensity === 'transcendent') && (
        <motion.div
          initial={{ scale: 0, rotate: 0, opacity: 0.7 }}
          animate={{
            scale: 10,
            rotate: 360,
            opacity: 0
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: config.duration * 1.8,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="absolute pointer-events-none"
          style={{
            left: x - config.size / 3,
            top: y - config.size / 3,
            width: config.size * 2 / 3,
            height: config.size * 2 / 3,
            background: `conic-gradient(from 0deg, transparent 0%, ${config.color} 20%, transparent 40%, ${config.glow} 60%, transparent 80%, ${config.color} 100%)`,
            borderRadius: '50%',
            filter: 'blur(2px)',
            opacity: 0.3
          }}
        />
      )}
    </div>
  );
}