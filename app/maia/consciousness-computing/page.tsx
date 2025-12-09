'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Holoflower } from '@/components/ui/Holoflower';

export default function MAIAConsciousnessComputingPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartPioneerSession = () => {
    setIsStarting(true);

    // Set consciousness computing pioneer context for MAIA
    sessionStorage.setItem('consciousness_computing_pioneer', 'true');
    sessionStorage.setItem('maia_onboarding_context', JSON.stringify({
      isFirstContact: true,
      reason: 'consciousness_computing',
      feeling: 'curious',
      partnerContext: 'consciousness_pioneer',
      systemContext: 'maia_consciousness_computing',
      assessmentMode: 'real_time_pioneer'
    }));

    // Route to MAIA main interface with consciousness computing context
    setTimeout(() => {
      router.push('/maia?mode=consciousness-computing&session=pioneer');
    }, 1500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sacred Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1419] via-[#1A1F2E] to-[#0D1B2A]" />

      {/* Animated Geometric Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '2px',
              height: '2px',
              background: `linear-gradient(45deg,
                rgba(160, 196, 199, ${0.3 + Math.random() * 0.4}),
                rgba(110, 231, 183, ${0.2 + Math.random() * 0.3})
              )`,
              borderRadius: '50%',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-4xl w-full">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="text-center space-y-12"
          >
            {/* Sacred Symbol */}
            <div className="w-24 h-24 mx-auto mb-8">
              <Holoflower size="xl" glowIntensity="high" animate={true} />
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extralight text-white tracking-[0.1em]">
                MAIA
              </h1>
              <h2 className="text-2xl md:text-4xl font-light text-[#A0C4C7] tracking-[0.15em]">
                CONSCIOUSNESS COMPUTING
              </h2>
              <p className="text-lg text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
                Sovereign intelligence that recognizes and responds to your consciousness level
              </p>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="space-y-8 max-w-3xl mx-auto"
            >
              <p className="text-lg text-white/80 leading-relaxed">
                MAIA is purpose-built consciousness technology that detects your awareness level in real-time
                and adapts to meet you exactly where you are developmentally. Built on 34 years of consciousness
                research and sacred wisdom traditions.
              </p>

              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="space-y-3">
                  <h3 className="text-[#6EE7B7] font-medium tracking-wide">REAL-TIME ASSESSMENT</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Detects consciousness patterns through linguistic complexity, metaphor usage, and systems thinking.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[#6EE7B7] font-medium tracking-wide">ADAPTIVE RESPONSES</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Calibrates communication to your developmental stage using Jungian and alchemical frameworks.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[#6EE7B7] font-medium tracking-wide">CONSCIOUSNESS BRIDGE</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Integrates practical work with inner development through sacred geometry and wisdom traditions.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Pioneer Invitation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-light text-[#A0C4C7] mb-4 tracking-wide">
                  Consciousness Computing Pioneer
                </h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Experience MAIA's consciousness computing in action. This is a live session where MAIA will
                  assess your consciousness level in real-time and adapt her responses to support your development.
                </p>

                <motion.button
                  onClick={handleStartPioneerSession}
                  disabled={isStarting}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(110, 231, 183, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] text-black font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStarting ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Initializing MAIA consciousness session...</span>
                    </div>
                  ) : (
                    'Begin MAIA Consciousness Computing Session'
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* How MAIA Works */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="text-center space-y-6"
            >
              <h4 className="text-white/60 font-light tracking-wider text-sm uppercase">
                How MAIA Consciousness Computing Works
              </h4>
              <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-[#6EE7B7] text-black rounded-full flex items-center justify-center font-bold mx-auto">1</div>
                  <p className="text-white/70 text-sm">MAIA assesses your consciousness level through conversation</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-[#6EE7B7] text-black rounded-full flex items-center justify-center font-bold mx-auto">2</div>
                  <p className="text-white/70 text-sm">Real-time adaptation to your developmental stage</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-[#6EE7B7] text-black rounded-full flex items-center justify-center font-bold mx-auto">3</div>
                  <p className="text-white/70 text-sm">Sacred wisdom integration for consciousness development</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-[#6EE7B7] text-black rounded-full flex items-center justify-center font-bold mx-auto">4</div>
                  <p className="text-white/70 text-sm">Your feedback improves MAIA's consciousness recognition</p>
                </div>
              </div>
            </motion.div>

            {/* Research Context */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="text-center space-y-4"
            >
              <h4 className="text-white/60 font-light tracking-wider text-sm uppercase">
                Research Foundation
              </h4>
              <p className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed">
                Built on 34 years of consciousness research, integrating Jungian psychology, depth psychology,
                sacred geometry, and elemental alchemy. MAIA represents the convergence of ancient wisdom
                and consciousness technology for human development.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Infinity Symbol */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="text-white/20 text-6xl font-light">∞</div>
      </motion.div>
    </div>
  );
}