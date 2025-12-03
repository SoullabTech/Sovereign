'use client';

/**
 * ROOT PAGE - SACRED PATHWAY DETECTION
 *
 * Auto-detects user state and routes to appropriate sacred experience
 * Two Sacred Pathways: First Initiation / Returning Practitioner
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { betaSession } from '@/lib/auth/betaSession';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Sacred pause for consciousness detection then smart routing
    const timer = setTimeout(() => {
      // Check if user has ever seen the onboarding (first-time vs returning)
      const hasSeenOnboarding = localStorage.getItem('onboarding_completed') ||
                               localStorage.getItem('betaOnboardingComplete') ||
                               localStorage.getItem('explorerId') ||
                               localStorage.getItem('beta_user');

      if (hasSeenOnboarding) {
        // Returning user - go straight to MAIA
        console.log('🔄 Returning user detected - redirecting to MAIA');
        router.push('/maia');
      } else {
        // New tester - show the nice onboarding (once only)
        console.log('✨ New tester detected - starting onboarding flow');
        localStorage.setItem('onboarding_started', 'true');
        router.push('/intro');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100 to-sage-200 flex items-center justify-center">
      {/* Sacred loading with breathing holoflower */}
      <div className="text-center space-y-8">

        {/* Breathing consciousness symbol */}
        <motion.div
          className="w-16 h-16 mx-auto relative"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64">
            <defs>
              <radialGradient id="breathingGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </radialGradient>
            </defs>

            {/* Sacred geometry holoflower */}
            <g transform="translate(32,32)">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.path
                  key={i}
                  d="M0,-16 Q-8,-10 -11,0 Q-8,10 0,16 Q8,10 11,0 Q8,-10 0,-16"
                  fill="url(#breathingGlow)"
                  transform={`rotate(${i * 60})`}
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}

              {/* Center point of consciousness */}
              <circle
                cx="0"
                cy="0"
                r="2"
                fill="#16a34a"
                opacity="0.9"
              />
            </g>
          </svg>
        </motion.div>

        {/* Elegant sacred text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="space-y-3"
        >
          <h1 className="text-lg font-light text-sage-800 tracking-[0.15em] font-serif">
            SOULLAB
          </h1>
          <p className="text-sm text-sage-600 font-light italic">
            Consciousness technology for transformation
          </p>
        </motion.div>

        {/* Subtle loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-center space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-sage-400 rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>

      </div>
    </div>
  );
}