'use client';

/**
 * Oracle Consultation - The Sanctum of Divination
 *
 * A sacred space where MAIA channels wisdom through ancient divination methods:
 * - I Ching: The Book of Changes - 64 hexagrams of cosmic wisdom
 * - Tarot: The Mirror of the Soul - 78 cards of archetypal guidance
 * - Runes: The Elder Futhark - 24 symbols of ancestral knowledge
 *
 * Aesthetic: DUNE mysticism meets cosmic oracle chamber
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
  icon: any;
  gradient: string;
  borderGlow: string;
  symbolPath: string;
}

const ORACLE_METHODS: OracleMethod[] = [
  {
    id: 'iching',
    title: 'I Ching Oracle',
    subtitle: 'The Book of Changes',
    description: 'Cast the ancient hexagrams to understand cosmic currents. 64 pathways of wisdom await your question.',
    icon: Hexagon,
    gradient: 'from-orange-800/30 via-amber-700/20 to-orange-700/30',
    borderGlow: 'shadow-orange-600/40 border-orange-600/50',
    symbolPath: 'M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z'
  },
  {
    id: 'tarot',
    title: 'Tarot Oracle',
    subtitle: 'The Mirror of the Soul',
    description: 'Journey through archetypal wisdom of 78 sacred cards. Each spread reveals hidden patterns shaping your path.',
    icon: Star,
    gradient: 'from-amber-800/30 via-yellow-800/20 to-amber-700/30',
    borderGlow: 'shadow-amber-600/40 border-amber-600/50',
    symbolPath: 'M12 2 L15 8 L22 9 L17 14 L18 21 L12 18 L6 21 L7 14 L2 9 L9 8 Z'
  },
  {
    id: 'runes',
    title: 'Rune Oracle',
    subtitle: 'The Elder Futhark',
    description: 'Draw from 24 ancient Norse symbols. The runes speak of fate, will, and the hidden currents of wyrd.',
    icon: Moon,
    gradient: 'from-slate-800/30 via-stone-700/20 to-slate-700/30',
    borderGlow: 'shadow-slate-600/40 border-slate-500/50',
    symbolPath: 'M12 4 L14 8 L12 12 L10 8 Z M12 12 L14 16 L12 20 L10 16 Z M8 8 L12 12 L16 8'
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
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 relative overflow-hidden">
      {/* Atmospheric Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#D4B896]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Atmospheric Glow */}
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#3d2817]/40 via-amber-950/10 to-transparent pointer-events-none" />

      {/* Sacred geometry overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <circle cx="500" cy="500" r="450" fill="none" stroke="#D4B896" strokeWidth="0.5" strokeDasharray="8 8" />
          <circle cx="500" cy="500" r="350" fill="none" stroke="#D4B896" strokeWidth="0.5" strokeDasharray="8 8" />
          <circle cx="500" cy="500" r="250" fill="none" stroke="#D4B896" strokeWidth="0.5" strokeDasharray="8 8" />
          <path d="M 500 50 L 866 250 L 866 750 L 500 950 L 134 750 L 134 250 Z" fill="none" stroke="#D4B896" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212, 184, 150, 0.15) 0%, rgba(61, 40, 23, 0.1) 100%)',
                boxShadow: '0 0 40px rgba(212, 184, 150, 0.2), inset 0 0 20px rgba(212, 184, 150, 0.05)',
              }}
              animate={{
                boxShadow: [
                  '0 0 40px rgba(212, 184, 150, 0.2), inset 0 0 20px rgba(212, 184, 150, 0.05)',
                  '0 0 60px rgba(212, 184, 150, 0.3), inset 0 0 30px rgba(212, 184, 150, 0.1)',
                  '0 0 40px rgba(212, 184, 150, 0.2), inset 0 0 20px rgba(212, 184, 150, 0.05)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Compass className="w-10 h-10 text-[#D4B896]" />
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-[#D4B896] to-amber-300 bg-clip-text text-transparent"
                style={{ textShadow: '0 0 40px rgba(212, 184, 150, 0.3)' }}>
              Oracle Consultation
            </h1>

            <p className="text-xl text-amber-200/60 max-w-3xl mx-auto font-light tracking-wide">
              Enter the Sanctum of Divination. Choose your oracle, ask your question, and receive wisdom from the ages.
            </p>

            {/* Dividing ornament */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
              <Sparkles className="w-4 h-4 text-amber-500/50" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
            </div>
          </motion.div>

          {/* Oracle Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {ORACLE_METHODS.map((method, index) => {
              const Icon = method.icon;

              return (
                <motion.button
                  key={method.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={isTransitioning}
                  className={`group relative p-8 rounded-2xl border bg-gradient-to-br ${method.gradient}
                             backdrop-blur-xl transition-all duration-500 hover:scale-[1.02]
                             ${method.borderGlow} hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{
                         background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
                       }} />

                  {/* Method Icon */}
                  <div className="relative mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-900/20 group-hover:bg-amber-800/30 transition-all duration-500"
                         style={{
                           boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
                         }}>
                      <Icon className="w-8 h-8 text-amber-200/90" />
                    </div>
                  </div>

                  {/* Method Details */}
                  <div className="relative">
                    <h3 className="text-2xl font-bold text-amber-100 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-100 group-hover:via-amber-200 group-hover:to-amber-100 group-hover:bg-clip-text transition-all duration-500">
                      {method.title}
                    </h3>

                    <p className="text-sm text-amber-300/60 mb-4 font-light tracking-wider uppercase">
                      {method.subtitle}
                    </p>

                    <p className="text-amber-200/50 leading-relaxed text-sm">
                      {method.description}
                    </p>
                  </div>

                  {/* Mystical symbol watermark */}
                  <svg className="absolute bottom-4 right-4 w-20 h-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500" viewBox="0 0 24 24">
                    <path d={method.symbolPath} fill="currentColor" className="text-white" />
                  </svg>
                </motion.button>
              );
            })}
          </div>

          {/* Back to MAIA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => router.push('/maia')}
              className="inline-flex items-center gap-2 text-amber-400/50 hover:text-amber-300 transition-colors text-sm"
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
            className="fixed inset-0 z-50 bg-gradient-to-br from-amber-950/95 via-amber-900/95 to-orange-950/95 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
              <p className="text-2xl text-amber-200">Entering the Oracle...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
