'use client';

/**
 * Oracle Consultation - The Sanctum of Divination
 *
 * A sacred space where MAIA channels wisdom through ancient divination methods:
 * - I Ching: The Book of Changes - 64 hexagrams of cosmic wisdom
 * - Tarot: The Mirror of the Soul - 78 cards of archetypal guidance
 * - Runes: The Elder Futhark - 24 symbols of ancestral knowledge
 *
 * Aesthetic: MAIA night sky temple - deep navy with golden/sage accents
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Moon,
  Star,
  Compass,
  Hexagon,
  ArrowLeft
} from 'lucide-react';

type DivinationMethod = 'iching' | 'tarot' | 'runes' | null;

interface OracleMethod {
  id: DivinationMethod;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
}

const ORACLE_METHODS: OracleMethod[] = [
  {
    id: 'iching',
    title: 'I Ching Oracle',
    subtitle: 'The Book of Changes',
    description: 'Cast the ancient hexagrams to understand cosmic currents. 64 pathways of wisdom await your question.',
    icon: Hexagon,
    accentColor: 'text-maia-spice-400',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'tarot',
    title: 'Tarot Oracle',
    subtitle: 'The Mirror of the Soul',
    description: 'Journey through archetypal wisdom of 78 sacred cards. Each spread reveals hidden patterns shaping your path.',
    icon: Star,
    accentColor: 'text-violet-400',
    glowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    id: 'runes',
    title: 'Rune Oracle',
    subtitle: 'The Elder Futhark',
    description: 'Draw from 24 ancient Norse symbols. The runes speak of fate, will, and the hidden currents of wyrd.',
    icon: Moon,
    accentColor: 'text-maia-sage-400',
    glowColor: 'rgba(20, 184, 166, 0.3)',
  }
];

export default function OracleConsultationPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<DivinationMethod>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMethodSelect = (method: DivinationMethod) => {
    setIsTransitioning(true);
    setSelectedMethod(method);

    setTimeout(() => {
      router.push(`/oracle/${method}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950 relative overflow-hidden">
      {/* Atmospheric Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-maia-spice-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Sacred geometry overlay - very subtle */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 8" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="4 8" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 8" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-maia-navy-800/60 border border-maia-spice-500/20"
              style={{
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.15)',
              }}
            >
              <Compass className="w-8 h-8 text-maia-spice-400" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4 text-maia-ink-100">
              Oracle Consultation
            </h1>

            <p className="text-base text-maia-ink-60 max-w-2xl mx-auto font-light leading-relaxed">
              Enter the Sanctum of Divination. Choose your oracle, ask your question, and receive wisdom from the ages.
            </p>

            {/* Dividing ornament */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-maia-spice-500/30 to-transparent" />
              <Sparkles className="w-3 h-3 text-maia-spice-500/40" />
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-maia-spice-500/30 to-transparent" />
            </div>
          </motion.div>

          {/* Oracle Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {ORACLE_METHODS.map((method, index) => {
              const Icon = method.icon;

              return (
                <motion.button
                  key={method.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={isTransitioning}
                  className="group relative p-6 rounded-xl bg-maia-navy-800/40 border border-maia-navy-700/50
                             backdrop-blur-sm transition-all duration-300 hover:bg-maia-navy-800/60
                             hover:border-maia-navy-600/50 disabled:opacity-50 disabled:cursor-not-allowed
                             text-left"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    boxShadow: `0 0 0 rgba(0,0,0,0)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 32px ${method.glowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
                  }}
                >
                  {/* Method Icon */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-maia-navy-700/50 ${method.accentColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Method Details */}
                  <h3 className="text-lg font-medium text-maia-ink-100 mb-1">
                    {method.title}
                  </h3>

                  <p className={`text-[10px] ${method.accentColor} mb-3 font-light tracking-[0.15em] uppercase opacity-70`}>
                    {method.subtitle}
                  </p>

                  <p className="text-maia-ink-60 text-sm leading-relaxed">
                    {method.description}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Back to MAIA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={() => router.push('/maia')}
              className="inline-flex items-center gap-2 text-maia-ink-60 hover:text-maia-ink-80 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to MAIA
            </button>
          </motion.div>

        </div>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-maia-navy-950/95 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <Sparkles className="w-12 h-12 text-maia-spice-400 mx-auto mb-3 animate-pulse" />
              <p className="text-xl text-maia-ink-80">Entering the Oracle...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
