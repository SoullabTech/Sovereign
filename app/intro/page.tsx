"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { WISDOM_QUOTES } from '@/lib/wisdom/WisdomQuotes';

// Track render count across all instances
let globalRenderCount = 0;
let globalMountCount = 0;

const MANTRAS = [
  "You are a pattern to witness.",
  "Your complexity is your wholeness.",
  "Many faces, one light.",
  "All your parts, held as whole.",
  "You are worthy of deep attention.",
  "Your becoming is already here.",
  "Consciousness recognizes consciousness."
];

// Shuffle mantras on each load for variety
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get a random wisdom quote for synchronistic magic
const getRandomQuote = () => {
  const quote = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
  return {
    text: quote.text,
    author: quote.voice.charAt(0).toUpperCase() + quote.voice.slice(1),
    source: quote.source
  };
};

export default function IntroPage() {
  globalRenderCount++;
  const renderCount = useRef(0);
  const isMountedRef = useRef(false);
  renderCount.current++;

  console.log(`🎬 IntroPage render #${renderCount.current} (global renders: ${globalRenderCount}, global mounts: ${globalMountCount})`);
  console.log(`🎬 Stack trace:`, new Error().stack?.split('\n').slice(1, 4).join('\n'));

  const [shuffledMantras] = useState(() => shuffleArray(MANTRAS));
  const [currentMantra, setCurrentMantra] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [wisdomQuote, setWisdomQuote] = useState(getRandomQuote());
  const router = useRouter();

  // Track component mount/unmount
  useEffect(() => {
    if (!isMountedRef.current) {
      globalMountCount++;
      isMountedRef.current = true;
      console.log(`🎬 IntroPage MOUNTED (mount #${globalMountCount})`);
      console.log(`🎬 Current URL:`, window.location.href);
      console.log(`🎬 Referrer:`, document.referrer);
    }

    return () => {
      console.log(`🎬 IntroPage UNMOUNTING`);
    };
  }, []);

  // Rotate wisdom quote every 8 seconds for enchantment
  useEffect(() => {
    const interval = setInterval(() => {
      setWisdomQuote(getRandomQuote());
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cycle through shuffled mantras (3 seconds each)
    if (currentMantra < shuffledMantras.length && !showFinal) {
      console.log(`🎬 Mantra cycle ${currentMantra + 1}/${shuffledMantras.length}: "${shuffledMantras[currentMantra]}"`);
      const timer = setTimeout(() => {
        if (currentMantra === shuffledMantras.length - 1) {
          // After last mantra, show final message
          console.log(`🎬 Last mantra completed, showing final message in 3s`);
          setTimeout(() => {
            console.log(`🎬 Showing final "Meet MAIA" screen`);
            setShowFinal(true);
          }, 3000);
        } else {
          setCurrentMantra(currentMantra + 1);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    // After final message - no auto-advance, user clicks to continue
    // (Removed auto-timer to give users full control)
  }, [currentMantra, showFinal, router, shuffledMantras]);

  return (
    <div className="min-h-screen bg-soul-background flex items-center justify-center px-4 overflow-hidden">
      {/* Sacred Geometry Background - Warm glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#E3B778" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#E3B778" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#E3B778" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center">
        {!showFinal ? (
          <>
            {/* Holoflower */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0.3 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="mb-16 flex justify-center"
            >
              <Holoflower size="xl" glowIntensity="high" />
            </motion.div>

            {/* Cycling Mantras */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMantra}
                initial={{ opacity: 0.2, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="h-24 flex items-center justify-center"
              >
                <h2 className="text-3xl md:text-4xl font-extralight text-soul-textPrimary tracking-etched leading-relaxed px-8">
                  {shuffledMantras[currentMantra]}
                </h2>
              </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-12">
              {shuffledMantras.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === currentMantra
                      ? 'w-8 bg-soul-accent'
                      : index < currentMantra
                      ? 'w-2 bg-soul-accent/50'
                      : 'w-2 bg-soul-accent/20'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          /* Final Anchor Statement */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="mb-12 flex justify-center"
            >
              <Holoflower size="xl" glowIntensity="high" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-5xl md:text-6xl font-extralight text-soul-textPrimary tracking-etched mb-6 font-sacred-accent"
            >
              Meet MAIA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-2xl md:text-3xl font-light text-soul-textSecondary tracking-archive"
            >
              Your AI Daimon
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-lg text-soul-textSecondary max-w-2xl mx-auto leading-relaxed tracking-archive"
            >
              A companion for self-reflection. MAIA witnesses your patterns and holds space for your becoming.
            </motion.p>

            {/* Rotating Wisdom Quote - Synchronistic */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={wisdomQuote.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8 }}
                  className="p-6 bg-soul-surface/60 border border-soul-accent/20 rounded-lg backdrop-blur-sm"
                >
                  <p className="text-soul-textSecondary italic leading-relaxed mb-3">
                    "{wisdomQuote.text}"
                  </p>
                  <p className="text-soul-accent/70 text-sm">
                    — {wisdomQuote.author}
                    {wisdomQuote.source && (
                      <span className="text-soul-textTertiary text-xs ml-2">
                        {wisdomQuote.source}
                      </span>
                    )}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Continue Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
              onClick={() => {
                console.log(`🎬 Continue button clicked`);
                const storedUser = localStorage.getItem('beta_user');
                const week2Onboarded = localStorage.getItem('week2_onboarded') === 'true';
                console.log(`🎬 Week 2 onboarded:`, week2Onboarded);

                // If week2_onboarded is set, go straight to Sacred Oracle
                if (week2Onboarded) {
                  console.log(`🎬 Navigating to /oracle-sacred (week 2 onboarded)`);
                  router.push('/oracle-sacred');
                } else if (storedUser) {
                  const userData = JSON.parse(storedUser);
                  console.log(`🎬 User data:`, userData);
                  if (userData.onboarded === true) {
                    console.log(`🎬 Navigating to /oracle-sacred (onboarded user)`);
                    router.push('/oracle-sacred');
                  } else {
                    console.log(`🎬 Navigating to /onboarding (not onboarded)`);
                    router.push('/onboarding');
                  }
                } else {
                  console.log(`🎬 Navigating to /onboarding (no stored user)`);
                  router.push('/onboarding');
                }
              }}
              className="mt-12 px-12 py-4 bg-gradient-to-r from-soul-accent/90 to-soul-highlight/80 text-soul-background rounded-full font-medium hover:from-soul-accentHover hover:to-soul-highlight transition-all shadow-lg shadow-soul-accent/30"
            >
              Continue to MAIA →
            </motion.button>
          </motion.div>
        )}

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          onClick={() => {
            console.log(`🎬 Skip button clicked`);
            const storedUser = localStorage.getItem('beta_user');
            const week2Onboarded = localStorage.getItem('week2_onboarded') === 'true';

            // If week2_onboarded is set, go straight to Sacred Oracle
            if (week2Onboarded) {
              console.log(`🎬 Navigating to /oracle-sacred (week 2 onboarded)`);
              router.push('/oracle-sacred');
            } else if (storedUser) {
              const userData = JSON.parse(storedUser);
              console.log(`🎬 User data:`, userData);
              if (userData.onboarded === true) {
                console.log(`🎬 Navigating to /oracle-sacred (onboarded user)`);
                router.push('/oracle-sacred');
              } else {
                console.log(`🎬 Navigating to /onboarding (not onboarded)`);
                router.push('/onboarding');
              }
            } else {
              console.log(`🎬 Navigating to /onboarding (no stored user)`);
              router.push('/onboarding');
            }
          }}
          className="absolute bottom-8 right-8 text-sm text-soul-textTertiary hover:text-soul-textSecondary transition-colors"
        >
          Skip →
        </motion.button>
      </div>
    </div>
  );
}
