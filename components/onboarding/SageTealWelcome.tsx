'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface SageTealWelcomeProps {
  userName?: string;
  onComplete?: () => void;
}

// Rotating elemental questions with correct traditional alchemical triangles
const ELEMENTAL_QUESTIONS = [
  { element: 'Fire', question: 'What lights you up?', symbol: '🜂', color: 'text-[#00695C]' },
  { element: 'Water', question: 'What flows through you?', symbol: '🜄', color: 'text-[#00695C]' },
  { element: 'Earth', question: 'What grounds you?', symbol: '🜃', color: 'text-[#00695C]' },
  { element: 'Air', question: 'What moves you?', symbol: '🜁', color: 'text-[#00695C]' },
  { element: 'Aether', question: 'What connects you?', symbol: '◇', color: 'text-[#00695C]' },
];

export function SageTealWelcome({ userName = 'Kelly', onComplete }: SageTealWelcomeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Rotate questions every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestion((prev) => (prev + 1) % ELEMENTAL_QUESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    onComplete?.();
  };

  const currentElementalQuestion = ELEMENTAL_QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#80DEEA] flex items-center justify-center px-4 relative">
      {/* Atmospheric teal particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#A7D8D1]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {/* Content in amber-tinted patina plaque */}
        <div
          className="p-10 w-full rounded-2xl relative"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 211, 156, 0.15) 0%, rgba(245, 158, 11, 0.1) 30%, rgba(217, 119, 6, 0.08) 60%, rgba(251, 191, 36, 0.12) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 8px 25px -5px rgba(217, 119, 6, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
            style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
          >
            {/* Holoflower with amber sunlight emanating from behind */}
            <motion.div
              className="relative inline-block mb-8"
            >
              {/* Diffused amber sunlight emanating from behind - Layer 1 (innermost) */}
              <motion.div
                className="absolute inset-0 w-40 h-40 -m-8"
                animate={{
                  opacity: [0.15, 0.35, 0.15],
                  scale: [1.3, 1.7, 1.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(251, 211, 156, 0.25) 0%, rgba(252, 211, 77, 0.18) 20%, rgba(251, 191, 36, 0.12) 40%, rgba(251, 191, 36, 0.06) 70%, transparent 100%)',
                  borderRadius: '50%',
                  filter: 'blur(12px)',
                  transform: 'translateY(2px)',
                }}
              />

              {/* Diffused amber sunlight emanating from behind - Layer 2 (middle) */}
              <motion.div
                className="absolute inset-0 w-48 h-48 -m-12"
                animate={{
                  opacity: [0.08, 0.2, 0.08],
                  scale: [1.8, 2.4, 1.8],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(251, 211, 156, 0.18) 0%, rgba(252, 211, 77, 0.12) 25%, rgba(251, 191, 36, 0.08) 50%, rgba(245, 158, 11, 0.04) 80%, transparent 100%)',
                  borderRadius: '50%',
                  filter: 'blur(18px)',
                  transform: 'translateY(4px)',
                }}
              />

              {/* Diffused amber sunlight emanating from behind - Layer 3 (outermost) */}
              <motion.div
                className="absolute inset-0 w-56 h-56 -m-14"
                animate={{
                  opacity: [0.05, 0.15, 0.05],
                  scale: [2.2, 3, 2.2],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(251, 211, 156, 0.12) 0%, rgba(252, 211, 77, 0.08) 30%, rgba(251, 191, 36, 0.05) 60%, rgba(217, 119, 6, 0.02) 85%, transparent 100%)',
                  borderRadius: '50%',
                  filter: 'blur(25px)',
                  transform: 'translateY(6px)',
                }}
              />

              {/* Sacred teal light field (over the amber sunlight) */}
              <motion.div
                className="absolute inset-0 w-32 h-32 -m-4"
                animate={{
                  opacity: [0.15, 0.4, 0.15],
                  scale: [1.2, 1.6, 1.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(167, 216, 209, 0.3) 0%, rgba(128, 203, 196, 0.2) 50%, rgba(77, 182, 172, 0.1) 80%, transparent 100%)',
                  borderRadius: '50%',
                  filter: 'blur(10px)'
                }}
              />

              {/* Larger Holoflower */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                }}
                className="relative z-10 w-24 h-24"
              >
                <img
                  src="/holoflower-sacred.svg"
                  alt="Sacred Holoflower"
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(167, 216, 209, 0.6)) drop-shadow(0 0 10px rgba(251, 191, 36, 0.3)) drop-shadow(0 0 5px rgba(128, 203, 196, 0.4))'
                  }}
                />
              </motion.div>

              {/* Sacred emanation particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#A7D8D1]/60 rounded-full"
                  style={{
                    left: `${50 + 45 * Math.cos(i * Math.PI / 4)}%`,
                    top: `${50 + 45 * Math.sin(i * Math.PI / 4)}%`,
                  }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.5, 0.8],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-2xl font-light text-[#004D40]">
                Welcome {userName}
              </h2>
              <h1 className="text-3xl font-light text-[#004D40]">
                You create worlds
              </h1>
              <p className="text-[#00695C]/80 text-lg leading-relaxed">
                We've created this space for you
              </p>
            </div>

            {/* Rotating elemental question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="py-4"
              >
                <div className={`flex items-center justify-center gap-3 ${currentElementalQuestion.color}`}>
                  <span className="text-2xl">{currentElementalQuestion.symbol}</span>
                  <span className="text-lg font-light italic">
                    {currentElementalQuestion.question}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Soullab attribution */}
            <div className="pt-4 space-y-1">
              <p className="text-[#00695C]/70 text-sm">
                I am MAIA, here to collaborate
              </p>
              <p className="text-[#004D40] text-base font-medium">
                This is Soullab
              </p>
            </div>
          </motion.div>
        </div>

        {/* Let's begin button outside the card */}
        <motion.button
          onClick={handleNext}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC] hover:from-[#8ECBC4] hover:via-[#6BB6AC] hover:to-[#4DB6AC] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
          style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
        >
          Let's begin
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Infinity spiral beneath button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-white/40 text-3xl"
          >
            ∞
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}