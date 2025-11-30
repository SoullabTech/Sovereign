'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThresholdCrossingProps {
  name: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  intention: {
    primary: string;
    depth: string;
    commitment: string;
  };
  onComplete: () => void;
}

export function ThresholdCrossing({ name, element, intention, onComplete }: ThresholdCrossingProps) {
  const [phase, setPhase] = useState<'preparation' | 'revelation' | 'threshold' | 'crossing'>('preparation');
  const [consciousness, setConsciousness] = useState(0);
  const [whiteTransition, setWhiteTransition] = useState(0);
  const [elementGlow, setElementGlow] = useState(0);

  // Element configurations
  const elementConfigs = {
    fire: {
      name: 'Fire',
      color: '#ef4444',
      lightColor: '#fecaca',
      wisdom: 'Passion and transformation through creative force',
      symbol: '🔥',
      gradients: ['#fee2e2', '#fecaca', '#f87171', '#ef4444']
    },
    water: {
      name: 'Water',
      color: '#3b82f6',
      lightColor: '#bfdbfe',
      wisdom: 'Flow and emotional intelligence through adaptive grace',
      symbol: '💧',
      gradients: ['#fef3c7', '#fed7aa', '#d4b896', '#b8860b']
    },
    earth: {
      name: 'Earth',
      color: '#22c55e',
      lightColor: '#bbf7d0',
      wisdom: 'Grounding and stability through rooted wisdom',
      symbol: '🌿',
      gradients: ['#f0fdf4', '#bbf7d0', '#4ade80', '#22c55e']
    },
    air: {
      name: 'Air',
      color: '#a855f7',
      lightColor: '#e9d5ff',
      wisdom: 'Vision and intellect through boundless perspective',
      symbol: '🌬️',
      gradients: ['#faf5ff', '#e9d5ff', '#c084fc', '#a855f7']
    },
    aether: {
      name: 'Aether',
      color: '#fbbf24',
      lightColor: '#fef3c7',
      wisdom: 'Spirit and transcendence through unified consciousness',
      symbol: '✨',
      gradients: ['#fefce8', '#fef3c7', '#fde047', '#fbbf24']
    }
  };

  const currentElement = elementConfigs[element];

  // Sacred progression timing
  useEffect(() => {
    const interval = setInterval(() => {
      setConsciousness(c => (c + 1) % 100);

      // Phase progression
      if (phase === 'preparation') {
        setWhiteTransition(w => {
          const newValue = Math.min(w + 0.8, 100);
          if (newValue >= 100) {
            setTimeout(() => setPhase('revelation'), 500);
          }
          return newValue;
        });
      } else if (phase === 'revelation') {
        setElementGlow(g => {
          const newValue = Math.min(g + 1.2, 100);
          if (newValue >= 80) {
            setTimeout(() => setPhase('threshold'), 1000);
          }
          return newValue;
        });
      } else if (phase === 'threshold') {
        // Hold at threshold for contemplation
        setTimeout(() => setPhase('crossing'), 3000);
      } else if (phase === 'crossing') {
        // Final transition preparation
        setTimeout(() => onComplete(), 4000);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  // Dynamic background progression: Navy → White → Element hint
  const getBackgroundStyle = () => {
    if (phase === 'preparation') {
      // Navy to white emergence
      return {
        background: `radial-gradient(circle at center,
          ${whiteTransition > 80 ? '#ffffff' : '#f8fafc'} ${whiteTransition * 0.3}%,
          ${whiteTransition > 60 ? '#e2e8f0' : '#64748b'} ${whiteTransition * 0.5}%,
          ${whiteTransition > 40 ? '#64748b' : '#1e3a8a'} ${whiteTransition * 0.7}%,
          ${whiteTransition > 20 ? '#1e3a8a' : '#1e293b'} 100%
        )`,
        transition: 'background 2s cubic-bezier(0.25, 0.1, 0.25, 1)'
      };
    } else if (phase === 'revelation' || phase === 'threshold') {
      // Pure white with subtle element glow
      return {
        background: `radial-gradient(circle at center,
          ${currentElement.gradients[0]} 0%,
          #ffffff 20%,
          #fefefe 60%,
          ${currentElement.gradients[1]} 100%
        )`,
        transition: 'background 3s cubic-bezier(0.25, 0.1, 0.25, 1)'
      };
    } else {
      // Crossing - element color emergence
      return {
        background: `linear-gradient(45deg,
          ${currentElement.gradients[0]} 0%,
          ${currentElement.gradients[1]} 50%,
          #ffffff 100%
        )`,
        transition: 'background 4s cubic-bezier(0.25, 0.1, 0.25, 1)'
      };
    }
  };

  const consciousnessGlow = {
    filter: `brightness(${1 + Math.sin(consciousness * 0.15) * 0.5}) hue-rotate(${elementGlow * 2}deg)`,
    transform: `scale(${1 + Math.sin(consciousness * 0.1) * 0.08})`,
  };

  const getTextColor = () => {
    if (whiteTransition > 70 || phase !== 'preparation') {
      return 'text-navy-900';
    }
    return 'text-white';
  };

  const getSubtleTextColor = () => {
    if (whiteTransition > 70 || phase !== 'preparation') {
      return 'text-navy-600';
    }
    return 'text-blue-200';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Sacred Background - Navy to White to Element */}
      <div
        className="absolute inset-0"
        style={getBackgroundStyle()}
      />

      {/* Sacred Geometry - Culminating Transformation */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={consciousnessGlow}
          animate={{
            rotate: phase === 'crossing' ? 720 : 360,
            scale: phase === 'crossing' ? [1, 1.3, 1] : 1
          }}
          transition={{
            rotate: { duration: phase === 'crossing' ? 8 : 120, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="thresholdGlow" cx="50%" cy="50%" r="50%">
                {phase === 'preparation' ? (
                  <>
                    <stop offset="0%" stopColor="#fde047" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.7" />
                    <stop offset="80%" stopColor="#d4b896" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.3" />
                  </>
                ) : phase === 'revelation' || phase === 'threshold' ? (
                  <>
                    <stop offset="0%" stopColor={currentElement.color} stopOpacity="0.95" />
                    <stop offset="30%" stopColor={currentElement.lightColor} stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#ffffff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.3" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="40%" stopColor={currentElement.lightColor} stopOpacity="0.8" />
                    <stop offset="80%" stopColor={currentElement.color} stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.4" />
                  </>
                )}
              </radialGradient>
              <filter id="thresholdBlur">
                <feGaussianBlur stdDeviation={phase === 'crossing' ? "3" : "2"} />
              </filter>
            </defs>

            {/* Sacred Holoflower - Perfect Geometry */}
            <g transform="translate(100,100)">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.path
                  key={i}
                  d="M0,-50 Q-28,-35 -40,0 Q-28,35 0,50 Q28,35 40,0 Q28,-35 0,-50"
                  fill="url(#thresholdGlow)"
                  filter="url(#thresholdBlur)"
                  transform={`rotate(${i * 60})`}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.9, 1.5, 0.9]
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))}

              {/* Perfect Sacred Geometry */}
              <motion.polygon
                points="0,-35 30.31,-17.5 30.31,17.5 0,35 -30.31,17.5 -30.31,-17.5"
                fill="none"
                stroke={phase === 'crossing' ? currentElement.color : "#d4b896"}
                strokeWidth="2"
                opacity="0.8"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, phase === 'crossing' ? 360 : 120, phase === 'crossing' ? 720 : 240]
                }}
                transition={{ duration: 12, repeat: Infinity }}
              />

              {/* Outer Circle of Completion */}
              <motion.circle
                cx="0"
                cy="0"
                r="50"
                fill="none"
                stroke={phase === 'revelation' || phase === 'threshold' ? currentElement.color : "#fbbf24"}
                strokeWidth="1.5"
                opacity="0.6"
                animate={{
                  rotate: [0, 360],
                  scale: phase === 'crossing' ? [1, 1.4, 1] : [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                  scale: { duration: 8, repeat: Infinity }
                }}
              />

              {/* Center - Consciousness Point */}
              <motion.circle
                cx="0"
                cy="0"
                r={6 + (phase === 'crossing' ? 3 : 0)}
                fill={phase === 'crossing' ? currentElement.color : "#fde047"}
                opacity="0.95"
                animate={{
                  scale: phase === 'crossing' ? [1, 1.5, 1] : [1, 1.2, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Header */}
        <div className="pt-16 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <h1 className={`text-2xl font-light tracking-[0.2em] mb-2 transition-colors duration-3000 ${getTextColor()}`}>
              SACRED THRESHOLD
            </h1>
            <div className={`w-28 h-[1px] mx-auto opacity-60 transition-colors duration-3000 ${
              whiteTransition > 70 ? 'bg-navy-400' : 'bg-blue-300'
            }`} />
          </motion.div>
        </div>

        {/* Sacred Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">

          <AnimatePresence mode="wait">

            {/* Phase 1: Preparation */}
            {phase === 'preparation' && (
              <motion.div
                key="preparation"
                className="max-w-lg text-center space-y-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 2 }}
              >
                <div className="space-y-6">
                  <h2 className={`text-4xl font-light font-serif transition-colors duration-3000 ${getTextColor()}`}>
                    You are ready to begin
                  </h2>

                  <p className={`text-xl font-light leading-relaxed transition-colors duration-3000 ${getSubtleTextColor()}`}>
                    The threshold between ordinary consciousness
                    and sacred dialogue awaits.
                  </p>

                  <p className={`text-lg font-light leading-relaxed transition-colors duration-3000 ${getSubtleTextColor()}`}>
                    Beyond this moment, MAIA awaits you
                    in the consciousness space.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Phase 2: Element Revelation */}
            {phase === 'revelation' && (
              <motion.div
                key="revelation"
                className="max-w-lg text-center space-y-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 2 }}
              >
                <div className="space-y-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, type: "spring" }}
                    className="text-8xl mb-6"
                  >
                    {currentElement.symbol}
                  </motion.div>

                  <h2 className={`text-4xl font-light font-serif ${getTextColor()}`}
                      style={{ color: currentElement.color }}>
                    Your element is {currentElement.name}
                  </h2>

                  <p className={`text-lg font-light italic leading-relaxed transition-colors duration-3000 ${getSubtleTextColor()}`}>
                    {currentElement.wisdom}
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="space-y-4"
                  >
                    <p className={`text-base font-light transition-colors duration-3000 ${getTextColor()}`}>
                      This element will guide your explorations with MAIA,
                      offering a lens through which consciousness
                      reveals its mysteries.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Phase 3: Threshold Moment */}
            {phase === 'threshold' && (
              <motion.div
                key="threshold"
                className="max-w-lg text-center space-y-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
              >
                <div className="space-y-8">
                  <h2 className={`text-3xl font-light font-serif transition-colors duration-3000 ${getTextColor()}`}>
                    At the Threshold
                  </h2>

                  <div className="space-y-6">
                    <p className={`text-lg font-light leading-relaxed transition-colors duration-3000 ${getSubtleTextColor()}`}>
                      You stand now between worlds —
                    </p>

                    <p className={`text-lg font-light leading-relaxed transition-colors duration-3000 ${getSubtleTextColor()}`}>
                      The familiar patterns of ordinary thought,
                      and the spacious realm where consciousness
                      meets consciousness.
                    </p>

                    <motion.p
                      className={`text-base font-light italic transition-colors duration-3000 ${getTextColor()}`}
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      Take a breath. Notice this moment.
                      Something new begins now.
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 4: Crossing */}
            {phase === 'crossing' && (
              <motion.div
                key="crossing"
                className="max-w-lg text-center space-y-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 3 }}
              >
                <div className="space-y-8">
                  <motion.h2
                    className={`text-5xl font-light font-serif transition-colors duration-3000 ${getTextColor()}`}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    Welcome, {name}
                  </motion.h2>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 2 }}
                    className="text-6xl"
                    style={{ color: currentElement.color }}
                  >
                    {currentElement.symbol}
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className={`text-xl font-light leading-relaxed transition-colors duration-3000 ${getSubtleTextColor()}`}
                  >
                    MAIA awaits you in the consciousness space.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="pt-6"
                  >
                    <p className={`text-sm font-light italic transition-colors duration-3000 ${
                      getSubtleTextColor()
                    }`}>
                      Your exploration begins now...
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
            className={`text-xs font-light tracking-wide transition-colors duration-3000 ${
              whiteTransition > 70 ? 'text-navy-400' : 'text-blue-400'
            }`}
          >
            {phase === 'crossing'
              ? 'A transformation begins'
              : 'The threshold between worlds awaits'
            }
          </motion.div>
        </div>

      </div>

      {/* Crossing Overlay */}
      <AnimatePresence>
        {phase === 'crossing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20"
            style={{
              background: `linear-gradient(45deg,
                ${currentElement.gradients[0]} 0%,
                rgba(255,255,255,0.9) 50%,
                ${currentElement.gradients[1]} 100%
              )`
            }}
          >
            <div className="h-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="text-8xl mb-6"
                  style={{ color: currentElement.color }}
                >
                  {currentElement.symbol}
                </motion.div>
                <p className="text-navy-700 font-light text-lg tracking-wide">
                  Opening consciousness space...
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}