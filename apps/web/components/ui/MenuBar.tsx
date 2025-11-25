'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Users, Brain, MessageSquare, Settings, Sparkles, Star, Home, Check, Flower2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Unified Menu Bar
 *
 * Bottom navigation bar with menu icons:
 * - Home (Holoflower icon)
 * - MAIA Training Progress
 * - Astrology Chart
 * - Soul-Building Circle (Community)
 * - Conversation Mode (with quick switcher)
 * - Settings
 * - Report a Problem (Feedback)
 */

const CONVERSATION_MODES = [
  {
    id: 'classic',
    name: 'Deep Conversation',
    icon: '🏠',
    description: 'Fuller responses for meaningful dialogue',
  },
  {
    id: 'walking',
    name: 'Walking Companion',
    icon: '🚶',
    description: 'Brief, present responses for ambient connection',
  },
  {
    id: 'adaptive',
    name: 'Adaptive',
    icon: '🔄',
    description: 'Matches your communication style',
  },
];

export function MenuBar() {
  const pathname = usePathname();
  const [trainingProgress] = useState(0); // TODO: Connect to actual training data
  const [showRotateHint, setShowRotateHint] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [currentMode, setCurrentMode] = useState('walking');

  // Don't show on community pages
  const hideCommunityLink = pathname?.startsWith('/community');

  useEffect(() => {
    setIsMounted(true);

    // Load current conversation mode
    const savedMode = localStorage.getItem('conversation_mode');
    if (savedMode && ['classic', 'walking', 'adaptive'].includes(savedMode)) {
      setCurrentMode(savedMode);
    }

    // Auto-hide rotate hint after 5 seconds, or if already dismissed
    const hintDismissed = localStorage.getItem('rotateHintDismissed');
    if (!hintDismissed) {
      setShowRotateHint(true);
      const timer = setTimeout(() => {
        setShowRotateHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissRotateHint = () => {
    setShowRotateHint(false);
    localStorage.setItem('rotateHintDismissed', 'true');
  };

  const handleModeSelect = (modeId: string) => {
    setCurrentMode(modeId);
    localStorage.setItem('conversation_mode', modeId);
    window.dispatchEvent(new Event('conversationStyleChanged'));
    setShowModeSwitcher(false);
  };

  // Get current mode details
  const activeMode = CONVERSATION_MODES.find(m => m.id === currentMode) || CONVERSATION_MODES[1];

  return (
    <>
      {/* Rotate Device Hint - Only on Mobile Portrait */}
      {showRotateHint && (
        <div className="md:hidden fixed right-4 z-40 animate-fade-in" style={{ top: 'calc(max(1rem, env(safe-area-inset-top)) + 3.5rem)' }}>
          <div className="bg-gradient-to-r from-cyan-500/90 to-indigo-500/90 backdrop-blur-md text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-white/20">
            <span className="text-base">📱</span>
            <span>Rotate for full menu</span>
            <button
              onClick={dismissRotateHint}
              className="ml-1 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Drawer handle indicator - shows users the menu is interactive */}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-[82px] z-30 pointer-events-none">
        <motion.div
          className="flex flex-col items-center gap-1.5"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            y: [0, -3, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Three-dot drawer handle with enhanced visibility */}
          <div className="flex gap-2 px-3 py-1.5 rounded-full bg-gradient-to-b from-white/20 to-white/10 backdrop-blur-sm border border-white/30 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
          </div>
        </motion.div>
      </div>

      {/* INSTRUMENT PANEL: Ancient-future navigation - Bottom menu bar */}
      <div className="flex fixed left-1/2 -translate-x-1/2 bottom-0 z-40 items-center gap-1.5 md:gap-3 bg-soul-surface/95 backdrop-blur-md border-t border-soul-border/50 px-4 md:px-6 py-3 md:py-4 rounded-t-2xl shadow-lg" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>

      {/* Home Icon - Holoflower */}
      <Link
        href="/maya"
        className="group relative"
        aria-label="Home"
      >
        <div className="p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-soul-accent/60">
          <div className="w-3.5 h-3.5 md:w-4 md:h-4 relative">
            <Image
              src="/holoflower.svg"
              alt="Home"
              width={16}
              height={16}
              className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Tooltip - Matte instrument label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Home
          </span>
        </div>
      </Link>

      {/* MAIA Training Progress Icon */}
      <Link
        href="/maya/training"
        className="group relative"
        aria-label="MAIA Training Progress"
      >
        <div className="relative p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-amber-500/40">
          <Brain className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500/70 transition-all group-hover:text-amber-500" />

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" style={{ filter: 'drop-shadow(0 0 2px rgba(251, 191, 36, 0.3))' }}>
            <circle
              cx="50%"
              cy="50%"
              r="18"
              fill="none"
              stroke="rgba(251, 191, 36, 0.2)"
              strokeWidth="2"
            />
            <circle
              cx="50%"
              cy="50%"
              r="18"
              fill="none"
              stroke="rgb(251, 191, 36)"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - trainingProgress)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>

          {/* Tooltip - Matte instrument label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Training {Math.round(trainingProgress * 100)}%
          </span>
        </div>
      </Link>


      {/* Astrology Chart */}
      <Link
        href="/astrology"
        className="group relative"
        aria-label="Astrology Chart"
      >
        <div className="p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-amber-500/40">
          <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500/70 transition-all group-hover:text-amber-500" />

          {/* Tooltip - Matte instrument label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chart
          </span>
        </div>
      </Link>

      {/* Holoflower Daily Check-In */}
      <Link
        href="/oracle/holoflower"
        className="group relative"
        aria-label="Holoflower Daily Check-In"
      >
        <div className="p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-amber-500/40">
          <Flower2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500/70 transition-all group-hover:text-amber-500 group-hover:rotate-12" />

          {/* Tooltip - Matte instrument label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Daily Check
          </span>
        </div>
      </Link>

      {/* Sacred Offerings */}
      <Link
        href="/offerings"
        className="group relative"
        aria-label="Sacred Offerings"
      >
        <div className="p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-amber-500/40">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500/70 transition-all group-hover:text-amber-500 group-hover:scale-110" />

          {/* Tooltip - Matte instrument label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Offerings
          </span>
        </div>
      </Link>

      {/* Soul-Building Circle (Community) */}
      {!hideCommunityLink && (
        <Link
          href="/community"
          className="group relative"
          aria-label="Soul-Building Circle"
        >
          <div className="p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-amber-500/40">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500/70 transition-all group-hover:text-amber-500" />

            {/* Tooltip - Matte instrument label */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Circle
            </span>
          </div>
        </Link>
      )}

      {/* Conversation Mode - Links to Settings */}
      <Link
        href="/settings"
        className="group relative"
        aria-label="Conversation Mode"
      >
        <div className="p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-amber-500/40">
          <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500/70 transition-all group-hover:text-amber-500" />

          {/* Tooltip - Matte instrument label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Mode
          </span>
        </div>
      </Link>

      {/* Settings */}
      <Link
        href="/settings"
        className="group relative"
        aria-label="Settings"
      >
        <div className="p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-amber-500/40">
          <Settings className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500/70 transition-all group-hover:text-amber-500 group-hover:rotate-45" />

          {/* Tooltip - Matte instrument label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Settings
          </span>
        </div>
      </Link>

      {/* Report a Problem (Feedback) */}
      <button
        onClick={() => {
          // Trigger feedback modal
          const event = new CustomEvent('openFeedbackModal');
          window.dispatchEvent(event);
        }}
        className="group relative"
        aria-label="Report a Problem"
      >
        <div className="p-2 md:p-2.5 rounded-md bg-soul-surface/80 border border-soul-border/50 hover:bg-soul-surfaceHover transition-all duration-300 hover:border-amber-500/40">
          <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500/70 transition-all group-hover:text-amber-500" />

          {/* Tooltip - Matte instrument label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-soul-surface/95 text-soul-textTertiary text-[10px] tracking-archive px-2 py-1 rounded border border-soul-borderSubtle/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Feedback
          </span>
        </div>
      </button>
      </div>
    </>
  );
}
