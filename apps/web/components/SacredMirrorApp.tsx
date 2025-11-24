'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingFlow from './onboarding/OnboardingFlow';
import { SoullabChatInterface } from './SoullabChatInterface';

interface SacredMirrorAppProps {
  userId: string;
  userName?: string;
  skipOnboarding?: boolean;
}

interface UserPreferences {
  tone: number; // 0-1 scale from gentle to direct
  style: 'prose' | 'poetic' | 'auto';
  hasCompletedOnboarding: boolean;
}

const defaultPreferences: UserPreferences = {
  tone: 0.5,
  style: 'prose',
  hasCompletedOnboarding: false
};

export default function SacredMirrorApp({ 
  userId, 
  userName = 'Friend',
  skipOnboarding = false 
}: SacredMirrorAppProps) {
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(defaultPreferences);
  const [showOnboarding, setShowOnboarding] = useState(!skipOnboarding);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load user preferences from storage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const saved = localStorage.getItem(`soullab-prefs-${userId}`);
        if (saved) {
          const parsedPrefs = JSON.parse(saved);
          setUserPrefs(parsedPrefs);
          
          // If user has completed onboarding and we&apos;re not forcing it, skip
          if (parsedPrefs.hasCompletedOnboarding && !skipOnboarding) {
            setShowOnboarding(false);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadPreferences();
  }, [userId, skipOnboarding]);

  // Handle onboarding completion
  const handleOnboardingComplete = (prefs: { tone: number; style: string }) => {
    const newPrefs: UserPreferences = {
      tone: prefs.tone,
      style: prefs.style as 'prose' | 'poetic' | 'auto',
      hasCompletedOnboarding: true
    };

    // Save to state
    setUserPrefs(newPrefs);

    // Save to localStorage
    try {
      localStorage.setItem(`soullab-prefs-${userId}`, JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }

    // Ceremonial transition to chat
    setIsTransitioning(true);
    setTimeout(() => {
      setShowOnboarding(false);
      setIsTransitioning(false);
    }, 800);
  };

  // Sacred transition variants
  const containerVariants = {
    onboarding: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    transitioning: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4 }
    },
    chat: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut", delay: 0.2 }
    }
  };

  const getCurrentVariant = () => {
    if (isTransitioning) return 'transitioning';
    if (showOnboarding) return 'onboarding';
    return 'chat';
  };

  return (
    <motion.div
      variants={containerVariants}
      animate={getCurrentVariant()}
      className="min-h-screen"
    >
      <AnimatePresence mode="wait">
        {showOnboarding ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <OnboardingFlow onFinish={handleOnboardingComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <SoullabChatInterface
              userId={userId}
              userName={userName}
              onboardingPrefs={{
                tone: userPrefs.tone,
                style: userPrefs.style
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sacred transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900 flex items-center justify-center z-50"
          >
            {/* Breathing sacred geometry during transition */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              {/* Sacred circles */}
              <div className="w-32 h-32 border border-amber-400/30 rounded-full" />
              <div className="absolute inset-4 w-24 h-24 border border-amber-400/50 rounded-full" />
              <div className="absolute inset-8 w-16 h-16 border border-amber-400/70 rounded-full" />
              
              {/* Center symbol */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-light text-lg tracking-wider">
                  SL
                </div>
              </div>
            </motion.div>
            
            {/* Transition text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32 text-amber-400/80 text-lg font-light"
            >
              Preparing your sacred space...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}