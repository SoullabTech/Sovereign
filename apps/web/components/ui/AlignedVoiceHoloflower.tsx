"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface AlignedVoiceHoloflowerProps {
  coherence?: number;
  isListening?: boolean;
  onMicClick?: () => void;
}

export const AlignedVoiceHoloflower: React.FC<AlignedVoiceHoloflowerProps> = ({
  coherence = 50,
  isListening = false,
  onMicClick
}) => {
  const [pulseIntensity, setPulseIntensity] = useState(0.5);

  useEffect(() => {
    // Simulate voice amplitude changes
    if (isListening) {
      const interval = setInterval(() => {
        setPulseIntensity(0.3 + Math.random() * 0.7);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      
      {/* Holoflower at top */}
      <div className="relative mb-16">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="relative z-10"
        >
          <g transform="translate(100, 100)">
            {/* Outer petals */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const petalX = Math.cos(angle) * 50;
              const petalY = Math.sin(angle) * 50;
              return (
                <motion.ellipse
                  key={`outer-${i}`}
                  cx={petalX}
                  cy={petalY}
                  rx="24"
                  ry="40"
                  fill="white"
                  opacity="0.9"
                  transform={`rotate(${i * 45} ${petalX} ${petalY})`}
                  animate={{
                    scale: isListening ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isListening ? Infinity : 0,
                    delay: i * 0.1
                  }}
                />
              );
            })}
            
            {/* Inner petals */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
              const petalX = Math.cos(angle) * 30;
              const petalY = Math.sin(angle) * 30;
              return (
                <motion.ellipse
                  key={`inner-${i}`}
                  cx={petalX}
                  cy={petalY}
                  rx="16"
                  ry="30"
                  fill="white"
                  opacity="0.8"
                  transform={`rotate(${i * 45 + 22.5} ${petalX} ${petalY})`}
                  animate={{
                    scale: isListening ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isListening ? Infinity : 0,
                    delay: i * 0.15
                  }}
                />
              );
            })}
            
            {/* Center circle */}
            <circle cx="0" cy="0" r="16" fill="white" opacity="1" />
            <circle cx="0" cy="0" r="10" fill="#D4B896" opacity="0.3" />
          </g>
        </svg>
      </div>

      {/* Coherence Display and Mic Button Container */}
      <div className="relative">
        {/* Centered Arc behind mic - perfectly aligned */}
        <svg
          width="300"
          height="150"
          viewBox="0 0 300 150"
          className="absolute -top-20 left-1/2 transform -translate-x-1/2"
        >
          {/* Background arc */}
          <path
            d="M 50 100 Q 150 20 250 100"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          
          {/* Animated coherence arc */}
          <motion.path
            d="M 50 100 Q 150 20 250 100"
            stroke="url(#coherenceGradient)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: coherence / 100 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
          {/* Pulsing dots along the arc */}
          {isListening && Array.from({ length: 5 }, (_, i) => {
            const t = (i + 1) / 6;
            const x = 50 + (250 - 50) * t;
            const y = 100 - 80 * 4 * t * (1 - t);
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#D4B896"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            );
          })}
          
          <defs>
            <linearGradient id="coherenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7A9A65" />
              <stop offset="33%" stopColor="#6B9BD1" />
              <stop offset="66%" stopColor="#C85450" />
              <stop offset="100%" stopColor="#D4B896" />
            </linearGradient>
          </defs>
        </svg>

        {/* Coherence percentage */}
        <div className="absolute -top-8 right-0 text-right">
          <p className="text-xs text-white/50 uppercase tracking-wider">Coherence</p>
          <p className="text-2xl font-light text-white">{coherence}%</p>
        </div>

        {/* Microphone Button - centered */}
        <motion.button
          className={`relative z-20 rounded-full flex items-center justify-center
            ${isListening 
              ? 'bg-gradient-to-br from-red-500 to-red-600' 
              : 'bg-gradient-to-br from-[#D4B896] to-[#B69A78]'}
            text-white shadow-lg transition-all duration-300`}
          style={{ width: 80, height: 80 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMicClick}
        >
          {/* Pulse rings when listening */}
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(239, 68, 68, ${pulseIntensity * 0.3}) 0%, transparent 70%)`
                }}
                animate={{
                  scale: [1, 1.5, 1.5],
                  opacity: [0.5, 0, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(239, 68, 68, ${pulseIntensity * 0.2}) 0%, transparent 70%)`
                }}
                animate={{
                  scale: [1, 1.3, 1.3],
                  opacity: [0.3, 0, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.2,
                }}
              />
            </>
          )}

          {/* Mic Icon */}
          <div className="relative z-10">
            {isListening ? (
              <MicOff className="w-10 h-10" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </div>
        </motion.button>

        {/* Voice amplitude bars */}
        {isListening && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-white/60 rounded-full"
                animate={{
                  height: [4, 4 + pulseIntensity * 20, 4],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlignedVoiceHoloflower;