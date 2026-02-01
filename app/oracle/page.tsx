'use client';

/**
 * Oracle Consultation - The Sanctum of Divination
 *
 * A sacred space where MAIA channels wisdom through ancient divination methods:
 * - I Ching: The Book of Changes - 64 hexagrams of cosmic wisdom
 * - Tarot: The Mirror of the Soul - 78 cards of archetypal guidance
 * - Runes: The Elder Futhark - 24 symbols of ancestral knowledge
 *
 * Aesthetic: Soullab hybrid dark theme - atmospheric with refined typography
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { betaSession } from '@/lib/auth/betaSession';
import { hasContinuityAccess, type MemberTier } from '@/lib/auth/tierAccess';
import PersonalThresholdInvitation from '@/components/tier/PersonalThresholdInvitation';
import TierDebugPill from '@/components/dev/TierDebugPill';

type DivinationMethod = 'iching' | 'tarot' | 'runes' | null;

interface OracleMethod {
  id: DivinationMethod;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  iconBg: string;
}

const ORACLE_METHODS: OracleMethod[] = [
  {
    id: 'iching',
    title: 'I Ching',
    subtitle: 'The Book of Changes',
    description: 'Cast the ancient hexagrams to understand cosmic currents. 64 pathways of wisdom await your question.',
    accentColor: 'text-amber-400',
    iconBg: 'bg-amber-500/20 border-amber-500/30'
  },
  {
    id: 'tarot',
    title: 'Tarot',
    subtitle: 'The Mirror of the Soul',
    description: 'Journey through archetypal wisdom of 78 sacred cards. Each spread reveals hidden patterns shaping your path.',
    accentColor: 'text-violet-400',
    iconBg: 'bg-violet-500/20 border-violet-500/30'
  },
  {
    id: 'runes',
    title: 'Runes',
    subtitle: 'The Elder Futhark',
    description: 'Draw from 24 ancient Norse symbols. The runes speak of fate, will, and the hidden currents of wyrd.',
    accentColor: 'text-teal-400',
    iconBg: 'bg-teal-500/20 border-teal-500/30'
  }
];

// Helper to get/set weekly reading count in localStorage
const READING_COUNT_KEY = 'oracle_readings_this_week';
const READING_WEEK_KEY = 'oracle_week_start';

function getWeekStart(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // local midnight
  const dayOfWeek = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - dayOfWeek); // Sunday start
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getReadingCount(): number {
  if (typeof window === 'undefined') return 0;
  const weekStart = localStorage.getItem(READING_WEEK_KEY);
  const currentWeekStart = getWeekStart();

  // Reset count if new week
  if (weekStart !== currentWeekStart) {
    localStorage.setItem(READING_WEEK_KEY, currentWeekStart);
    localStorage.setItem(READING_COUNT_KEY, '0');
    return 0;
  }

  return parseInt(localStorage.getItem(READING_COUNT_KEY) || '0', 10);
}

function incrementReadingCount(): void {
  if (typeof window === 'undefined') return;
  const currentWeekStart = getWeekStart();
  localStorage.setItem(READING_WEEK_KEY, currentWeekStart);
  const count = getReadingCount();
  localStorage.setItem(READING_COUNT_KEY, String(count + 1));
}

// Dismissal persistence (per week)
const DISMISS_KEY = 'oracle_threshold_dismissed_week';

function getThresholdDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DISMISS_KEY) === getWeekStart();
}

function setThresholdDismissed(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISMISS_KEY, getWeekStart());
}

// Custom SVG icons for each oracle type
const HexagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="6" y1="4" x2="18" y2="4" />
    <line x1="6" y1="8" x2="18" y2="8" />
    <line x1="6" y1="12" x2="11" y2="12" />
    <line x1="13" y1="12" x2="18" y2="12" />
    <line x1="6" y1="16" x2="18" y2="16" />
    <line x1="6" y1="20" x2="11" y2="20" />
    <line x1="13" y1="20" x2="18" y2="20" />
  </svg>
);

const TarotIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 8 L12 6" />
    <path d="M12 18 L12 16" />
    <path d="M8 12 L6 12" />
    <path d="M18 12 L16 12" />
  </svg>
);

const RuneIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3 L12 21" />
    <path d="M12 3 L18 9" />
    <path d="M12 12 L18 18" />
  </svg>
);

const ORACLE_ICONS = {
  iching: HexagramIcon,
  tarot: TarotIcon,
  runes: RuneIcon
};

export default function OracleConsultationPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<DivinationMethod>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Tier and reading tracking
  const [tier, setTier] = useState<MemberTier>('free');
  const [readingsThisWeek, setReadingsThisWeek] = useState(0);
  const [thresholdDismissed, setDismissedState] = useState(false);

  // Load user, reading count, and dismissal state
  useEffect(() => {
    const user = betaSession.getCurrentUser();
    if (user?.tier) {
      setTier(user.tier);
    }

    // Load persisted dismissal state
    setDismissedState(getThresholdDismissed());

    // Dev override: ?readings=5 to force threshold display
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const forceReadings = params.get('readings');
      if (forceReadings) {
        setReadingsThisWeek(parseInt(forceReadings, 10));
        return;
      }
    }

    setReadingsThisWeek(getReadingCount());
  }, []);

  const handleDismissThreshold = () => {
    setThresholdDismissed();
    setDismissedState(true);
  };

  const hasAccess = hasContinuityAccess({ tier });
  const showThreshold = !hasAccess && readingsThisWeek >= 3 && !thresholdDismissed;

  const handleMethodSelect = (method: DivinationMethod) => {
    // Track the reading
    incrementReadingCount();
    setReadingsThisWeek(prev => prev + 1);

    setIsTransitioning(true);
    setSelectedMethod(method);

    setTimeout(() => {
      router.push(`/oracle/${method}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 relative overflow-hidden">
      {/* Subtle atmospheric particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => {
          const seededX = (i * 17.3) % 100;
          const seededY = (i * 23.7) % 100;
          const seededDuration = 4 + ((i * 7.1) % 4);
          const seededDelay = (i * 11.3) % 2;
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
              style={{
                left: `${seededX}%`,
                top: `${seededY}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: seededDuration,
                repeat: Infinity,
                delay: seededDelay,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>

      {/* Soft gradient glow from bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-amber-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-4 py-8 md:py-12">
        <div className="w-full max-w-4xl mx-auto">

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => router.push('/maia')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-colors text-[13px] tracking-wide mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to MAIA</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Concentric circles icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
              <svg viewBox="0 0 64 64" className="w-full h-full text-amber-400/60" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="32" cy="32" r="28" />
                <circle cx="32" cy="32" r="18" />
                <circle cx="32" cy="32" r="8" />
              </svg>
            </div>

            <h1 className="text-3xl md:text-4xl font-light tracking-wide text-stone-100 mb-4">
              Oracle Consultation
            </h1>

            <p className="text-stone-400 text-[14px] tracking-wide leading-relaxed max-w-xl mx-auto">
              Enter the Sanctum of Divination. Choose your oracle, ask your question, and receive wisdom from the ages.
            </p>

            {/* Divider */}
            <div className="w-12 h-px bg-amber-500/30 mx-auto mt-8" />
          </motion.div>

          {/* Dev-only tier debug */}
          <div className="mb-6 text-center">
            <TierDebugPill
              tier={tier}
              hasAccess={hasAccess}
              extra={{ readings: `${readingsThisWeek}/3`, showThreshold }}
              hint="?readings=5 to force threshold"
              scheme="dark"
            />
          </div>

          {/* Threshold invitation for Free users who've consulted 3+ times this week */}
          {showThreshold && (
            <div className="mb-8">
              <PersonalThresholdInvitation
                context="oracle_frequency"
                isDayMode={false}
                onLearnMore={() => router.push('/membership')}
                onDismiss={handleDismissThreshold}
                variant="card"
              />
            </div>
          )}

          {/* Oracle Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {ORACLE_METHODS.map((method, index) => {
              const IconComponent = ORACLE_ICONS[method.id as keyof typeof ORACLE_ICONS];

              return (
                <motion.button
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={isTransitioning}
                  className="group relative p-6 rounded-xl bg-stone-900/60 border border-stone-700/50
                             hover:bg-stone-800/60 hover:border-stone-600/50
                             backdrop-blur-sm transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl border ${method.iconBg} mb-5 transition-colors group-hover:scale-105`}>
                    <div className={method.accentColor}>
                      <IconComponent />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-medium tracking-wide mb-1 ${method.accentColor}`}>
                    {method.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-[11px] text-stone-500 mb-4 font-medium tracking-[0.15em] uppercase">
                    {method.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-stone-400 text-[13px] tracking-wide leading-relaxed">
                    {method.description}
                  </p>

                  {/* Hover indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${method.accentColor}`} fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="w-12 h-12 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg text-stone-300 font-light tracking-wide">Entering the Oracle...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
