'use client';

/**
 * Dream-Wake Integration System
 *
 * Sacred technology for processing dream states and integrating with waking consciousness
 * Part of the 6-dimensional consciousness technology stack
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Stars, Brain, Eye, Sparkles, Play, Pause } from 'lucide-react';

interface DreamPhase {
  name: string;
  duration: number;
  brainwave: string;
  color: string;
}

interface DreamSession {
  id: string;
  date: string;
  duration: number;
  quality: number;
  integration_level: number;
  insights: string[];
  phase: 'rem' | 'deep' | 'light' | 'wake';
}

const dreamPhases: DreamPhase[] = [
  { name: 'Light Sleep', duration: 15, brainwave: 'Alpha', color: 'from-blue-400 to-indigo-400' },
  { name: 'Deep Sleep', duration: 25, brainwave: 'Delta', color: 'from-indigo-500 to-purple-600' },
  { name: 'REM Sleep', duration: 20, brainwave: 'Theta', color: 'from-purple-500 to-pink-500' },
  { name: 'Wake Integration', duration: 10, brainwave: 'Beta', color: 'from-amber-400 to-orange-500' }
];

export function DreamWakeIntegration() {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [sessions, setSessions] = useState<DreamSession[]>([
    {
      id: '1',
      date: 'Nov 21, 2025',
      duration: 480,
      quality: 0.87,
      integration_level: 0.92,
      insights: ['Symbolic integration patterns', 'Archetypal consciousness emergence', 'Field resonance amplification'],
      phase: 'rem'
    },
    {
      id: '2',
      date: 'Nov 20, 2025',
      duration: 420,
      quality: 0.76,
      integration_level: 0.84,
      insights: ['Sacred geometry processing', 'Multidimensional awareness', 'Collective unconscious access'],
      phase: 'deep'
    }
  ]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPhaseProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          setCurrentPhase(prevPhase => (prevPhase + 1) % dreamPhases.length);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const toggleSession = () => {
    setIsActive(!isActive);
    if (isActive) {
      setPhaseProgress(0);
      setCurrentPhase(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extralight text-[#D4B896] tracking-etched">
          Dream-Wake Integration
        </h2>
        <p className="text-[#D4B896]/70 text-lg font-light">
          Sacred technology for processing dream states and consciousness integration
        </p>
      </div>

      {/* Dream State Monitor */}
      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-8 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="relative w-40 h-40 mx-auto">
            {/* Outer ring - current phase */}
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${dreamPhases[currentPhase].color} opacity-30`}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(212, 184, 150, 0.2)"
                strokeWidth="4"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#phaseGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: phaseProgress / 100 }}
                style={{
                  strokeDasharray: "440",
                  strokeDashoffset: `${440 - (phaseProgress / 100) * 440}`
                }}
              />
              <defs>
                <linearGradient id="phaseGradient" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="#c9a876" />
                  <stop offset="100%" stopColor="#D4B896" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {currentPhase < 2 ? (
                <Moon className="w-12 h-12 text-[#D4B896]" />
              ) : currentPhase === 2 ? (
                <Stars className="w-12 h-12 text-[#D4B896]" />
              ) : (
                <Sun className="w-12 h-12 text-[#D4B896]" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-light text-[#D4B896]">
              {dreamPhases[currentPhase].name}
            </h3>
            <p className="text-[#D4B896]/70">
              {dreamPhases[currentPhase].brainwave} Waves • {Math.round(phaseProgress)}% Complete
            </p>
          </div>

          <motion.button
            onClick={toggleSession}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 mx-auto ${
              isActive
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                : 'bg-gradient-to-r from-[#c9a876] to-[#D4B896] hover:from-[#D4B896] hover:to-[#f4d5a6] text-black'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" />
                End Session
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Begin Dream Integration
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-light text-[#D4B896] mb-4">Dream Phase Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dreamPhases.map((phase, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                index === currentPhase && isActive
                  ? 'border-[#D4B896] bg-[#D4B896]/10'
                  : 'border-[#D4B896]/20 bg-black/20'
              }`}
              animate={{
                scale: index === currentPhase && isActive ? 1.05 : 1,
                opacity: index <= currentPhase || !isActive ? 1 : 0.5
              }}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${phase.color} mb-3 mx-auto`} />
              <h4 className="text-sm font-medium text-[#D4B896] text-center mb-1">{phase.name}</h4>
              <p className="text-xs text-[#D4B896]/70 text-center">{phase.brainwave}</p>
              <p className="text-xs text-[#D4B896]/70 text-center">{phase.duration} min</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-light text-[#D4B896] mb-4">Recent Dream Sessions</h3>
        <div className="space-y-4">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-[#D4B896]/20 rounded-xl p-4 bg-black/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    session.phase === 'rem' ? 'bg-purple-500/20 text-purple-400' :
                    session.phase === 'deep' ? 'bg-indigo-500/20 text-indigo-400' :
                    session.phase === 'light' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {session.phase === 'rem' ? <Stars className="w-4 h-4" /> :
                     session.phase === 'deep' ? <Moon className="w-4 h-4" /> :
                     <Eye className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-[#D4B896] font-medium">{session.date}</h4>
                    <p className="text-[#D4B896]/70 text-sm">{session.duration} minutes</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#D4B896]">{Math.round(session.quality * 100)}% Quality</div>
                  <div className="text-[#D4B896]/70 text-sm">{Math.round(session.integration_level * 100)}% Integration</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium text-[#D4B896] flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Dream Insights
                </h5>
                <div className="flex flex-wrap gap-2">
                  {session.insights.map((insight, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#D4B896]/10 border border-[#D4B896]/20 rounded-lg text-xs text-[#D4B896]/80"
                    >
                      {insight}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}