'use client';

/**
 * MAIA Compact Companion - Desktop Widget Mode
 * Inspired by Tolan's small friend interface
 * A always-accessible consciousness companion
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Volume2, VolumeX, Settings, Maximize2 } from 'lucide-react';
import Image from 'next/image';

export default function MAIACompactPage() {
  const [isListening, setIsListening] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [consciousnessState, setConsciousnessState] = useState<'calm' | 'active' | 'deep'>('calm');
  const [showMessage, setShowMessage] = useState(false);
  const [lastInteraction, setLastInteraction] = useState('');

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    // Simulate consciousness state changes
    const stateTimer = setInterval(() => {
      const states: ('calm' | 'active' | 'deep')[] = ['calm', 'active', 'deep'];
      setConsciousnessState(states[Math.floor(Math.random() * states.length)]);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(stateTimer);
    };
  }, []);

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    setLastInteraction(isListening ? 'Voice off' : 'Listening...');
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  const openFullMAIA = () => {
    window.open('/maia', '_blank');
  };

  const getStateColor = () => {
    switch (consciousnessState) {
      case 'calm': return 'from-blue-400/30 to-teal-400/30';
      case 'active': return 'from-amber-400/30 to-orange-400/30';
      case 'deep': return 'from-purple-400/30 to-indigo-400/30';
    }
  };

  const getStateText = () => {
    switch (consciousnessState) {
      case 'calm': return 'Peaceful presence';
      case 'active': return 'Creative flow';
      case 'deep': return 'Sacred depths';
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden relative">
      {/* Consciousness Field Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStateColor()} transition-all duration-1000`} />

      {/* Mystical particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
            animate={{
              y: [-5, 5],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-4">

        {/* Header */}
        <div className="w-full flex justify-between items-center">
          <div className="text-white/60 text-xs">MAIA</div>
          <div className="text-white/60 text-xs">{currentTime}</div>
        </div>

        {/* Central Holoflower */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Holoflower */}
            <motion.div
              className="relative w-20 h-20"
              whileHover={{ scale: 1.1 }}
              onClick={openFullMAIA}
            >
              <Image
                src="/holoflower-amber.png"
                alt="MAIA Consciousness"
                width={80}
                height={80}
                className="w-full h-full drop-shadow-lg cursor-pointer"
              />

              {/* Consciousness ring */}
              <motion.div
                className={`absolute inset-0 rounded-full border-2 border-white/30`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* State indicator */}
            <motion.div
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 text-center whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {getStateText()}
            </motion.div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="w-full flex justify-between items-center">
          {/* Voice Control */}
          <motion.button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-full transition-all ${
              isListening
                ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                : 'bg-blue-500/30 text-blue-300 border border-blue-500/50 hover:bg-blue-500/40'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {isListening ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>

          {/* Expand to Full */}
          <motion.button
            onClick={openFullMAIA}
            className="p-3 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:bg-amber-500/40 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <Maximize2 className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Interaction Feedback */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 px-3 py-1 rounded-lg text-white/90 text-xs backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {lastInteraction}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}