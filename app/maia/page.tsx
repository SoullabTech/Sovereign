'use client';

/**
 * MAIA Page - SOUL​LAB Dream-Weaver Edition
 *
 * MAIA = The Fertile Mother (Pleiades) - She who births wisdom
 * Not Maya (illusion) but MAIA (midwife)
 *
 * Kelly Nezat's vision: "Where two or more are gathered, there I AM"
 * God is more between than within - the I-Thou relationship
 */

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { OracleConversation } from '@/components/OracleConversation';
import { processUltimateMAIAConsciousnessSession } from '@/lib/consciousness-computing/ultimate-consciousness-system';
import { ClaudeCodePresence } from '@/components/ui/ClaudeCodePresence';
import { WisdomJourneyDashboard } from '@/components/maya/WisdomJourneyDashboard';
import { WeavingVisualization } from '@/components/maya/WeavingVisualization';
// BetaOnboarding removed - direct access only
import { ErrorBoundary } from '@/components/ErrorBoundary';
import WeekZeroOnboarding from '@/components/onboarding/WeekZeroOnboarding';
import { BrainTrustMonitor } from '@/components/consciousness/BrainTrustMonitor';
import { SacredLabDrawer } from '@/components/ui/SacredLabDrawer';
import { QuickJournalSheet } from '@/components/journal/QuickJournalSheet';
import { VoiceHelpSheet, TestFlightHelpSheet, HelpHubSheet } from '@/components/help';
import { ShadowWorkSheet } from '@/components/consciousness/ShadowWorkSheet';
import { AcademySheet } from '@/components/academy/AcademySheet';
import FeedbackSheet from '@/components/feedback/FeedbackSheet';
import { useFeatureAccess, useSubscription, membershipUtils } from '@/hooks/useSubscription';
import { PREMIUM_FEATURES, CONTRIBUTION_SUGGESTIONS, SEVA_PATHWAYS } from '@/lib/subscription/types';
import type { ContributionCircle, SevaPathway } from '@/lib/subscription/types';
import { LogOut, Sparkles, Menu, X, Brain, Volume2, ArrowLeft, Clock, Users, FlaskConical, BookOpen, Lock, User, Settings, Mic, Heart, Gift, Flame, MessageCircle, HelpCircle, Moon, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeNavigation, DirectionalHints } from '@/components/navigation/SwipeNavigation';
import { FrameworkSelector } from '@/components/framework/FrameworkSelector';
import { SyncAccountPrompt } from '@/components/auth/SyncAccountPrompt';
import {
  getCounselFramework,
  getScribeLens,
  type TherapeuticFramework,
  type ReflectionLens,
  THERAPEUTIC_FRAMEWORKS,
  REFLECTION_LENSES,
} from '@/lib/consciousness/therapeuticFrameworks';

// Migration version - increment to force re-auth for all users
const SESSION_VERSION = 2; // Bumped to fix UUID-as-name bug (Jan 5, 2026)

// Helper to detect if a string looks like a UUID (should never be used as a name)
function isLikelyUUID(str: string): boolean {
  if (!str) return false;
  // UUID pattern: 8-4-4-4-12 hex chars, or just looks like hex ID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hexPattern = /^[0-9a-f]{8,}$/i;
  const userIdPattern = /^user_\d+$/;
  return uuidPattern.test(str) || hexPattern.test(str) || userIdPattern.test(str);
}

// Force sign-out if session is outdated or corrupted
function checkAndMigrateSession(): boolean {
  if (typeof window === 'undefined') return false;

  const storedVersion = localStorage.getItem('maia_session_version');
  const currentName = localStorage.getItem('explorerName');

  // Force sign-out if: version mismatch OR name looks like a UUID
  const needsMigration = storedVersion !== String(SESSION_VERSION) || isLikelyUUID(currentName || '');

  if (needsMigration) {
    console.log('🔄 [MAIA] Session migration required - signing out user');
    // Clear session data but preserve permanent markers
    localStorage.removeItem('beta_user');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('explorerName');
    localStorage.removeItem('betaOnboardingComplete');
    // Set new version
    localStorage.setItem('maia_session_version', String(SESSION_VERSION));
    return true; // Needs redirect to sign-in
  }

  return false;
}

// Helper to get a valid display name, filtering out UUIDs and generic names
function getValidDisplayName(name: string | undefined | null, username: string | undefined | null): string {
  // NOTE: 'friend' is excluded from genericNames - if user explicitly chose it, respect it
  const genericNames = ['user', 'guest', 'anonymous', 'explorer', 'test', 'admin'];

  // First try the name field
  if (name && !isLikelyUUID(name) && !genericNames.includes(name.toLowerCase())) {
    return name;
  }

  // Fall back to capitalized username if valid (username is user's chosen identifier)
  if (username && !isLikelyUUID(username) && !genericNames.includes(username.toLowerCase())) {
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  return 'Friend';
}

// Check if an ID is a valid member identifier (not a placeholder)
function isValidMemberId(id: string | null | undefined): boolean {
  if (!id) return false;
  if (id === 'guest' || id.startsWith('guest_') || id === 'anonymous') return false;
  return true;
}

async function getInitialUserData() {
  if (typeof window === 'undefined') return { id: 'guest', name: 'Friend' };

  const currentUrl = window.location.hostname;

  // Check multiple sources for valid member ID, prioritizing authenticated data
  let storedUserId = localStorage.getItem('explorerId');

  // If explorerId is invalid (guest), try to get real ID from beta_user
  if (!isValidMemberId(storedUserId)) {
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        if (isValidMemberId(userData.id)) {
          storedUserId = userData.id;
          // Sync the valid ID back to explorerId
          localStorage.setItem('explorerId', userData.id);
          console.log('🔄 [MAIA] Synced member ID from beta_user:', userData.id);
        }
      } catch (e) { /* invalid JSON */ }
    }
  }

  // Fallback to betaUserId
  if (!isValidMemberId(storedUserId)) {
    storedUserId = localStorage.getItem('betaUserId');
  }

  // 🔍 DIAGNOSTIC: Log localStorage state for debugging name issues
  console.log('🔍 [INIT] localStorage state:', {
    explorerId: localStorage.getItem('explorerId'),
    betaUserId: localStorage.getItem('betaUserId'),
    explorerName: localStorage.getItem('explorerName'),
    explorerPreferredName: localStorage.getItem('explorerPreferredName'),
    beta_user: localStorage.getItem('beta_user')?.substring(0, 100) + '...',
    storedUserId,
    isValid: isValidMemberId(storedUserId)
  });

  // Try to fetch from API using stored userId (only if it's a valid member ID)
  if (storedUserId && isValidMemberId(storedUserId)) {
    try {
      const params = new URLSearchParams();
      params.append('userId', storedUserId);
      params.append('domain', currentUrl);

      const response = await fetch(`/api/user/profile?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.user) {
        // Priority: preferredName > name > username (preferredName is what user wants to be called)
        const validName = getValidDisplayName(
          data.user.preferredName || data.user.name,
          data.user.username
        );
        console.log('✅ [MAIA] User profile fetched from API:', validName, '(preferredName:', data.user.preferredName, ')');
        console.log('🔍 [MAIA] API response:', JSON.stringify(data.user));

        // Sync to localStorage
        localStorage.setItem('explorerName', validName);
        localStorage.setItem('explorerPreferredName', validName);
        localStorage.setItem('explorerId', data.user.id);
        console.log('🔍 [MAIA] Wrote to localStorage: explorerName=' + validName);
        localStorage.setItem('betaOnboardingComplete', 'true');
        // PERMANENT marker that NEVER gets removed, even on signout
        localStorage.setItem('maiaPermanentUser', 'true');

        return { id: data.user.id, name: validName };
      }
    } catch (error) {
      console.error('❌ [MAIA] Error fetching user profile:', error);
    }
  }

  // Check NEW system (beta_user from auth system)
  const betaUser = localStorage.getItem('beta_user');
  if (betaUser) {
    try {
      const userData = JSON.parse(betaUser);
      // Use bulletproof name validation (filters UUIDs, generic names)
      // Priority: preferredName > name > displayName (preferredName is what user wants to be called)
      const validName = getValidDisplayName(
        userData.preferredName || userData.name || userData.displayName,
        userData.username
      );

      // Accept if user has ID (onboarded check removed - was causing issues)
      if (userData.id) {
        localStorage.setItem('explorerName', validName);
        localStorage.setItem('explorerId', userData.id);
        console.log('✅ [MAIA] User authenticated from localStorage:', validName);
        return { id: userData.id, name: validName };
      }
    } catch (e) {
      console.error('❌ [MAIA] Error parsing beta_user:', e);
    }
  }

  // Check OLD system (for backward compatibility)
  if (localStorage.getItem('betaOnboardingComplete') === 'true') {
    const id = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
    const storedName = localStorage.getItem('explorerName');
    if (id) {
      // Validate stored name isn't a UUID
      const validName = isLikelyUUID(storedName || '') ? 'Friend' : (storedName || 'Friend');
      console.log('📦 [MAIA] Using legacy user data:', validName);
      return { id, name: validName };
    }
  }

  console.log('⚠️ [MAIA] No user data found, using defaults');
  return { id: 'guest', name: 'Friend' };
}

function MAIAPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const labToolsAccess = useFeatureAccess(PREMIUM_FEATURES.LAB_TOOLS);

  // URL-based panel control (preserves other query params, uses replace for clean history)
  const sp = searchParams?.toString() ?? '';

  const setPanel = useCallback((nextPanel: string) => {
    const params = new URLSearchParams(sp);
    params.set('panel', nextPanel);
    const q = params.toString();
    const path = pathname ?? '/maia';
    router.replace(q ? `${path}?${q}` : path, { scroll: false });
  }, [sp, pathname, router]);

  const clearPanel = useCallback(() => {
    const params = new URLSearchParams(sp);
    params.delete('panel');
    const q = params.toString();
    const path = pathname ?? '/maia';
    router.replace(q ? `${path}?${q}` : path, { scroll: false });
  }, [sp, pathname, router]);

  // Derive showDashboard from URL
  const showDashboard = searchParams?.get('panel') === 'journey';

  // Fix hydration: Initialize with safe defaults, update in useEffect
  const [explorerId, setExplorerId] = useState('guest');
  const [explorerName, setExplorerName] = useState('Friend');
  const [userBirthDate, setUserBirthDate] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [maiaMode, setMaiaMode] = useState<'normal' | 'patient' | 'session'>('normal');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>('alloy');  // Default to alloy - MAIA's OpenAI TTS voice
  const [voiceSpeed, setVoiceSpeed] = useState(0.95);  // OpenAI TTS speed (0.25 - 4.0)
  const [voiceModel, setVoiceModel] = useState<'tts-1' | 'tts-1-hd'>('tts-1-hd');  // TTS model quality
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [showLabDrawer, setShowLabDrawer] = useState(false);
  const [showWeekZeroOnboarding, setShowWeekZeroOnboarding] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSustainingSlider, setShowSustainingSlider] = useState(false);
  const [sustainingAmount, setSustainingAmount] = useState(25);
  const [showSevaOptions, setShowSevaOptions] = useState(false);
  const [showJournalSheet, setShowJournalSheet] = useState(false);
  const [showShadowWork, setShowShadowWork] = useState(false);
  const [showAcademySheet, setShowAcademySheet] = useState(false);
  const [showHelpHub, setShowHelpHub] = useState(false);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [showTestFlightHelp, setShowTestFlightHelp] = useState(false);
  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false);

  // Framework selector state (long-press on Care/Note tabs)
  const [showFrameworkSelector, setShowFrameworkSelector] = useState(false);
  const [frameworkSelectorMode, setFrameworkSelectorMode] = useState<'counsel' | 'scribe'>('counsel');
  const [currentCounselFramework, setCurrentCounselFramework] = useState<TherapeuticFramework>('auto');
  const [currentScribeLens, setCurrentScribeLens] = useState<ReflectionLens>('auto');

  // Keep users on this beautiful page - no redirect
  // useEffect(() => {
  //   const betaUser = localStorage.getItem('beta_user');
  //   if (betaUser) {
  //     try {
  //       const userData = JSON.parse(betaUser);
  //       if (userData.onboarded === true) {
  //         console.log('🌸 Redirecting to sacred interface...');
  //         router.replace('/oracle-sacred');
  //         return;
  //       }
  //     } catch (e) {
  //       console.error('Error parsing user data:', e);
  //     }
  //   }
  // }, [router]);

  // Fix hydration: Initialize user data and session after mount
  useEffect(() => {
    const initializeUser = async () => {
      setIsMounted(true);

      // Check for session migration (forces re-auth if needed)
      if (checkAndMigrateSession()) {
        console.log('🔄 [MAIA] Redirecting to sign-in for fresh session...');
        router.replace('/signin');
        return;
      }

      // Get or create persistent sessionId - this enables conversation continuity across reloads!
      const existingSessionId = localStorage.getItem('maia_session_id');
      if (existingSessionId) {
        setSessionId(existingSessionId);
        console.log('💫 [MAIA] Restored session:', existingSessionId);
      } else {
        const newSessionId = `session_${Date.now()}`;
        localStorage.setItem('maia_session_id', newSessionId);
        setSessionId(newSessionId);
        console.log('✨ [MAIA] Created new session:', newSessionId);
      }

      const initialData = await getInitialUserData();
      setExplorerId(initialData.id);
      setExplorerName(initialData.name);

      // Load birth date from localStorage for teen support
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        try {
          const userData = JSON.parse(betaUser);
          if (userData.birthDate) {
            setUserBirthDate(userData.birthDate);
            console.log('📅 User birth date loaded:', userData.birthDate);
          }
        } catch (e) {
          console.error('Error loading user birth date:', e);
        }
      }

      // Check welcome message in client-side only
      const welcomeSeen = localStorage.getItem('maia_welcome_seen');
      setShowWelcome(!welcomeSeen);

      // Check Week 0 onboarding completion
      const week0Complete = localStorage.getItem('week0_onboarding_complete');
      if (!week0Complete && initialData.name !== 'Friend') {
        // Show onboarding for new users (but not for guest/default users)
        setShowWeekZeroOnboarding(true);
        console.log('🌱 [MAIA] Week 0 onboarding required for:', initialData.name);
      } else {
        console.log('✅ [MAIA] Week 0 onboarding already completed or guest user');
      }

      // Load saved voice preference
      const savedVoice = localStorage.getItem('selected_voice') as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      }
    };

    initializeUser();
  }, []);

  // Load and listen for framework/lens changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load initial values
    setCurrentCounselFramework(getCounselFramework());
    setCurrentScribeLens(getScribeLens());

    // Listen for changes
    const handleCounselChange = () => setCurrentCounselFramework(getCounselFramework());
    const handleScribeChange = () => setCurrentScribeLens(getScribeLens());

    window.addEventListener('maia-counsel-framework-changed', handleCounselChange);
    window.addEventListener('maia-scribe-lens-changed', handleScribeChange);

    return () => {
      window.removeEventListener('maia-counsel-framework-changed', handleCounselChange);
      window.removeEventListener('maia-scribe-lens-changed', handleScribeChange);
    };
  }, []);

  const handleVoiceChange = (voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => {
    setSelectedVoice(voice);
    localStorage.setItem('selected_voice', voice);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('conversationStyleChanged'));
  };

  const handleSignOut = () => {
    // Remove ONLY active session token, keep user identity
    localStorage.removeItem('beta_user');

    // ✅ KEEP these - they identify a returning user:
    // - betaOnboardingComplete
    // - explorerId (used by root page to detect returning user)
    // - explorerName (preserves personalization)

    router.push('/');
  };

  const handleWeekZeroComplete = (onboardingData: any) => {
    console.log('🌸 [MAIA] Week 0 onboarding completed:', onboardingData);
    setShowWeekZeroOnboarding(false);

    // Hide welcome message since onboarding is more comprehensive
    localStorage.setItem('maia_welcome_seen', 'true');
    setShowWelcome(false);

    // Log the completion for analytics/learning
    console.log('📊 [MAIA] Onboarding data collected for learning system');
  };

  const handleWeekZeroSkip = () => {
    console.log('⏭️ [MAIA] Week 0 onboarding skipped');
    // Mark as complete so it doesn't show again
    localStorage.setItem('week0_onboarding_complete', 'skipped');
    setShowWeekZeroOnboarding(false);
  };

  // One-time migration check for contaminated kelly-nezat sessions
  useEffect(() => {
    // MIGRATION: Fix contaminated Kelly sessions (bug introduced Dec 31, 2024)
    // Users who aren't Kelly but got assigned the literal 'kelly-nezat' ID
    // NOTE: Only check for the contaminated ID, NOT the name. Real Kelly has a proper UUID now.
    const storedId = localStorage.getItem('explorerId');
    const betaUser = localStorage.getItem('beta_user');

    if (storedId === 'kelly-nezat') {
      // Check if this is actually Kelly via beta_user auth
      let isActuallyKelly = false;
      if (betaUser) {
        try {
          const userData = JSON.parse(betaUser);
          const authName = (userData.username || userData.name || userData.email || '').toLowerCase();
          isActuallyKelly = authName.includes('kelly');
        } catch (e) { /* ignore */ }
      }

      if (!isActuallyKelly) {
        // This user was incorrectly assigned Kelly's identity - reset them
        console.log('🔧 [MAIA] Fixing contaminated session - clearing kelly-nezat identity');
        localStorage.removeItem('explorerId');
        localStorage.removeItem('explorerName');
        localStorage.removeItem('betaOnboardingComplete');
        // Generate fresh guest identity
        const freshId = `guest_${Date.now()}`;
        localStorage.setItem('explorerId', freshId);
        localStorage.setItem('explorerName', 'Friend');
        setExplorerId(freshId);
        setExplorerName('Friend');
        console.log('✅ [MAIA] Session reset - user now has fresh identity:', freshId);
        return;
      }
    }
    // All other user loading is handled by getInitialUserData() in the first useEffect
    // Do NOT duplicate that logic here - it causes race conditions with stale localStorage
  }, []);

  // Onboarding removed - direct access only
  return (
    <ErrorBoundary>
      {/* Prompt for users with local data but no server account */}
      <SyncAccountPrompt />

      <SwipeNavigation currentPage="maia">
        {/* DirectionalHints removed - keyboard shortcuts now active (arrow keys + ESC) */}

        <div className="h-screen relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex flex-col">
        {/* Atmospheric Particles - Floating dust/sand */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(30)].map((_, i) => {
            // Create deterministic "random" values based on index for hydration consistency
            const seededX = (i * 17.3) % 100;
            const seededY = (i * 23.7) % 100;
            const seededDuration = 3 + ((i * 7.1) % 4);
            const seededDelay = (i * 11.3) % 2;

            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#D4B896]/20 rounded-full"
                style={{
                  left: `${seededX}%`,
                  top: `${seededY}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: seededDuration,
                  repeat: Infinity,
                  delay: seededDelay,
                }}
              />
            );
          })}
        </div>

        {/* Atmospheric Glow - Warm light from below */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#3d2817]/30 via-transparent to-transparent pointer-events-none z-0" />

        {/* DREAM-WEAVER SYSTEM - Combined Header & Banner - Always visible */}
        <div
          className="header-navigation safari-nav-fix flex-shrink-0 relative overflow-hidden bg-gradient-to-r from-black/20 via-amber-950/5 to-black/20 border-b border-amber-900/3 backdrop-blur-sm z-60"
        >
          {/* Spice particle effect - very subtle movement */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(1px 1px at 20% 30%, amber 0%, transparent 50%),
                                 radial-gradient(1px 1px at 60% 70%, amber 0%, transparent 50%),
                                 radial-gradient(1px 1px at 80% 10%, amber 0%, transparent 50%)`,
                backgroundSize: '50px 50px',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Holographic scan line - more transparent */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-600/3 to-transparent pointer-events-none"
            animate={{
              y: ['-100%', '200%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 3
            }}
          />

          <div className="relative w-full px-2 py-1" style={{paddingTop: 'max(env(safe-area-inset-top), 1.5rem)'}}>
            {/* Mobile: Horizontal scrollable container */}
            <div className="md:hidden mobile-carousel scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max px-2 py-1">
                {/* Logo removed - now in bottom center */}

                {/* Voice/Text Toggle - Mobile optimized */}
                <button
                  onClick={() => setShowChatInterface(!showChatInterface)}
                  className="carousel-item px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                >
                  <span className="text-xs text-amber-300/90 font-light">
                    {showChatInterface ? '💬' : '🎤'}
                  </span>
                </button>

                {/* Mode Selector + Session Button - Mobile optimized */}
                <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5 carousel-item">
                  <motion.button
                    onClick={() => setMaiaMode('normal')}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg
                             bg-amber-500/10 hover:bg-amber-500/20
                             border border-amber-500/20 hover:border-amber-500/40
                             text-amber-400 text-xs font-light transition-all flex-shrink-0"
                    style={{
                      border: maiaMode === 'normal' ? '1px solid #f59e0b' : undefined,
                      fontWeight: maiaMode === 'normal' ? 'bold' : 'normal'
                    }}
                  >
                    {maiaMode === 'normal' && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                    )}
                    <span className="text-xs">Talk</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setMaiaMode('patient')}
                    onTouchStart={(e) => {
                      const timer = setTimeout(() => {
                        if ('vibrate' in navigator) navigator.vibrate(10);
                        setFrameworkSelectorMode('counsel');
                        setShowFrameworkSelector(true);
                      }, 500);
                      (e.currentTarget as any)._longPressTimer = timer;
                    }}
                    onTouchEnd={(e) => {
                      clearTimeout((e.currentTarget as any)._longPressTimer);
                    }}
                    onTouchMove={(e) => {
                      clearTimeout((e.currentTarget as any)._longPressTimer);
                    }}
                    onDoubleClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(10);
                      setFrameworkSelectorMode('counsel');
                      setShowFrameworkSelector(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg
                             bg-amber-500/10 hover:bg-amber-500/20
                             border border-amber-500/20 hover:border-amber-500/40
                             text-amber-400 text-xs font-light transition-all flex-shrink-0"
                    style={{
                      border: maiaMode === 'patient' ? '1px solid #14b8a6' : undefined,
                      fontWeight: maiaMode === 'patient' ? 'bold' : 'normal'
                    }}
                    title="Tap to switch • Double-tap for framework options"
                  >
                    {maiaMode === 'patient' && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#5eead4' }} />
                    )}
                    <span className="text-xs">Care</span>
                    {currentCounselFramework !== 'auto' ? (
                      <span className="text-[10px] opacity-70">{THERAPEUTIC_FRAMEWORKS[currentCounselFramework]?.icon}</span>
                    ) : (
                      <span className="text-[9px] opacity-40">▾</span>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setMaiaMode('session')}
                    onTouchStart={(e) => {
                      const timer = setTimeout(() => {
                        e.preventDefault();
                        if ('vibrate' in navigator) navigator.vibrate(10);
                        setFrameworkSelectorMode('scribe');
                        setShowFrameworkSelector(true);
                      }, 500);
                      (e.currentTarget as any)._longPressTimer = timer;
                    }}
                    onTouchEnd={(e) => {
                      clearTimeout((e.currentTarget as any)._longPressTimer);
                    }}
                    onTouchMove={(e) => {
                      clearTimeout((e.currentTarget as any)._longPressTimer);
                    }}
                    onDoubleClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(10);
                      setFrameworkSelectorMode('scribe');
                      setShowFrameworkSelector(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg
                             bg-amber-500/10 hover:bg-amber-500/20
                             border border-amber-500/20 hover:border-amber-500/40
                             text-amber-400 text-xs font-light transition-all flex-shrink-0"
                    style={{
                      border: maiaMode === 'session' ? '1px solid #3b82f6' : undefined,
                      fontWeight: maiaMode === 'session' ? 'bold' : 'normal'
                    }}
                    title="Tap to switch • Double-tap for lens options"
                  >
                    {maiaMode === 'session' && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#93c5fd' }} />
                    )}
                    <span className="text-xs">Note</span>
                    {currentScribeLens !== 'auto' ? (
                      <span className="text-[10px] opacity-70">{REFLECTION_LENSES[currentScribeLens]?.icon}</span>
                    ) : (
                      <span className="text-[9px] opacity-40">▾</span>
                    )}
                  </motion.button>

                  {/* Session Button - Inside mode selector, after Note */}
                  {!hasActiveSession ? (
                    <motion.button
                      onClick={() => setShowSessionSelector(true)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg
                               bg-green-500/10 hover:bg-green-500/20
                               border border-green-500/20 hover:border-green-500/40
                               text-green-400 text-xs font-light transition-all flex-shrink-0"
                      title="Start Session"
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">Start</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => setHasActiveSession(false)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg
                               bg-red-500/10 hover:bg-red-500/20
                               border border-red-500/20 hover:border-red-500/40
                               text-red-400 text-xs font-light transition-all flex-shrink-0"
                      title="End Session"
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">End</span>
                    </motion.button>
                  )}

                  {/* Help Hub Button - Mobile */}
                  <motion.button
                    onClick={() => setShowHelpHub(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-full
                             bg-amber-500/10 hover:bg-amber-500/20
                             border border-amber-500/20 hover:border-amber-500/40
                             text-amber-400 text-xs font-light transition-all flex-shrink-0"
                    title="Help"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Journal Button - Mobile */}
                <motion.button
                  onClick={() => setShowJournalSheet(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-indigo-500/10 hover:bg-indigo-500/20
                           border border-indigo-500/20 hover:border-indigo-500/40
                           text-indigo-400 text-xs font-light transition-all flex-shrink-0"
                  title="Quick Journal"
                >
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs">Journal</span>
                </motion.button>

                {/* Soullab Button - Mobile */}
                <motion.button
                  onClick={() => setShowAcademySheet(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-amber-500/10 hover:bg-amber-500/20
                           border border-amber-500/20 hover:border-amber-500/40
                           text-amber-400 text-xs font-light transition-all flex-shrink-0"
                  title="Soullab"
                >
                  <GraduationCap className="w-3 h-3" />
                  <span className="text-xs">Soullab</span>
                </motion.button>

                {/* Guide Button - Mobile */}
                <motion.button
                  onClick={() => router.push('/maia/community/content/guides/working-with-maia')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-purple-500/10 hover:bg-purple-500/20
                           border border-purple-500/20 hover:border-purple-500/40
                           text-purple-400 text-xs font-light transition-all flex-shrink-0"
                  title="Guide"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs">Guide</span>
                </motion.button>

                {/* Shadow Work Button - Mobile */}
                <motion.button
                  onClick={() => setShowShadowWork(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-violet-500/10 hover:bg-violet-500/20
                           border border-violet-500/20 hover:border-violet-500/40
                           text-violet-400 text-xs font-light transition-all flex-shrink-0"
                  title="Shadow Work"
                >
                  <Moon className="w-3 h-3" />
                  <span className="text-xs">Shadow</span>
                </motion.button>

                {/* Feedback Button - Mobile */}
                <button
                  onClick={() => setShowFeedbackSheet(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-green-500/10 hover:bg-green-500/20
                           border border-green-500/20 hover:border-green-500/40
                           text-green-400 text-xs font-light transition-all flex-shrink-0"
                  title="Send Feedback"
                >
                  <MessageCircle className="w-3 h-3" />
                </button>

                {/* Account Button - Mobile (opens bottom sheet) */}
                <motion.button
                  onClick={() => setShowAccountMenu(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-amber-500/10 hover:bg-amber-500/20
                           border border-amber-500/20 hover:border-amber-500/40
                           text-amber-400 text-xs font-light transition-all flex-shrink-0"
                  title="Account Menu"
                >
                  <User className="w-3 h-3" />
                  <span className="text-xs">Account</span>
                </motion.button>
              </div>
            </div>

            {/* Desktop: Traditional layout - centered navigation */}
            <div className="hidden md:flex items-center justify-center max-w-7xl mx-auto px-4">
              {/* All navigation controls grouped together */}
              <div className="flex items-center gap-3">
                {/* Voice/Text Toggle */}
                <button
                  onClick={() => setShowChatInterface(!showChatInterface)}
                  className="px-3 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                >
                  <span className="text-xs text-amber-300/90 font-light">
                    {showChatInterface ? '💬 Text' : '🎤 Voice'}
                  </span>
                </button>

                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5">
                  <motion.button
                    onClick={() => setMaiaMode('normal')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-amber-500/10 hover:bg-amber-500/20
                             border border-amber-500/20 hover:border-amber-500/40
                             text-amber-400 text-xs font-light transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      border: maiaMode === 'normal' ? '2px solid #f59e0b' : undefined,
                      fontWeight: maiaMode === 'normal' ? 'bold' : 'normal'
                    }}
                  >
                    {maiaMode === 'normal' && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                    )}
                    Talk
                  </motion.button>
                  <motion.button
                    onClick={() => setMaiaMode('patient')}
                    onTouchStart={(e) => {
                      const timer = setTimeout(() => {
                        if ('vibrate' in navigator) navigator.vibrate(10);
                        setFrameworkSelectorMode('counsel');
                        setShowFrameworkSelector(true);
                      }, 500);
                      (e.currentTarget as any)._longPressTimer = timer;
                    }}
                    onTouchEnd={(e) => {
                      clearTimeout((e.currentTarget as any)._longPressTimer);
                    }}
                    onTouchMove={(e) => {
                      clearTimeout((e.currentTarget as any)._longPressTimer);
                    }}
                    onDoubleClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(10);
                      setFrameworkSelectorMode('counsel');
                      setShowFrameworkSelector(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-amber-500/10 hover:bg-amber-500/20
                             border border-amber-500/20 hover:border-amber-500/40
                             text-amber-400 text-xs font-light transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      border: maiaMode === 'patient' ? '2px solid #14b8a6' : undefined,
                      fontWeight: maiaMode === 'patient' ? 'bold' : 'normal'
                    }}
                    title="Click to switch • Double-click for framework options (Jungian, Somatic, IFS, etc.)"
                  >
                    {maiaMode === 'patient' && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5eead4' }} />
                    )}
                    Care
                    {currentCounselFramework !== 'auto' ? (
                      <span className="text-[10px] opacity-70">{THERAPEUTIC_FRAMEWORKS[currentCounselFramework]?.icon}</span>
                    ) : (
                      <span className="text-[10px] opacity-40">▾</span>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setMaiaMode('session')}
                    onTouchStart={(e) => {
                      const timer = setTimeout(() => {
                        if ('vibrate' in navigator) navigator.vibrate(10);
                        setFrameworkSelectorMode('scribe');
                        setShowFrameworkSelector(true);
                      }, 500);
                      (e.currentTarget as any)._longPressTimer = timer;
                    }}
                    onTouchEnd={(e) => {
                      clearTimeout((e.currentTarget as any)._longPressTimer);
                    }}
                    onTouchMove={(e) => {
                      clearTimeout((e.currentTarget as any)._longPressTimer);
                    }}
                    onDoubleClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(10);
                      setFrameworkSelectorMode('scribe');
                      setShowFrameworkSelector(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-amber-500/10 hover:bg-amber-500/20
                             border border-amber-500/20 hover:border-amber-500/40
                             text-amber-400 text-xs font-light transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      border: maiaMode === 'session' ? '2px solid #3b82f6' : undefined,
                      fontWeight: maiaMode === 'session' ? 'bold' : 'normal'
                    }}
                    title="Click to switch • Double-click for lens options (Jungian, Somatic, Archetypal, etc.)"
                  >
                    {maiaMode === 'session' && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#93c5fd' }} />
                    )}
                    Scribe
                    {currentScribeLens !== 'auto' ? (
                      <span className="text-[10px] opacity-70">{REFLECTION_LENSES[currentScribeLens]?.icon}</span>
                    ) : (
                      <span className="text-[10px] opacity-40">▾</span>
                    )}
                  </motion.button>
                </div>

                {/* Session + Account Buttons */}
                {/* Session Button */}
                {!hasActiveSession ? (
                  <motion.button
                    onClick={() => setShowSessionSelector(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-[#D4B896]/10 hover:bg-[#D4B896]/20
                             border border-[#D4B896]/20 hover:border-[#D4B896]/40
                             text-[#D4B896] text-xs font-light transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Start Session</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                               bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="hidden sm:inline">Session Active</span>
                  </div>
                )}

                {/* Guide Button - Desktop */}
                <motion.button
                  onClick={() => router.push('/maia/community/content/guides/working-with-maia')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-purple-500/10 hover:bg-purple-500/20
                           border border-purple-500/20 hover:border-purple-500/40
                           text-purple-400 text-xs font-light transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Demo Guide"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Guide</span>
                </motion.button>

                {/* Help Hub Button - Desktop */}
                <motion.button
                  onClick={() => setShowHelpHub(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-full
                           bg-amber-500/10 hover:bg-amber-500/20
                           border border-amber-500/20 hover:border-amber-500/40
                           text-amber-400 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Help"
                >
                  <HelpCircle className="w-4 h-4" />
                </motion.button>

                {/* Journal Button - Desktop */}
                <motion.button
                  onClick={() => setShowJournalSheet(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-indigo-500/10 hover:bg-indigo-500/20
                           border border-indigo-500/20 hover:border-indigo-500/40
                           text-indigo-400 text-xs font-light transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Quick Journal"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Journal</span>
                </motion.button>

                {/* Soullab Button - Desktop */}
                <motion.button
                  onClick={() => setShowAcademySheet(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-amber-500/10 hover:bg-amber-500/20
                           border border-amber-500/20 hover:border-amber-500/40
                           text-amber-400 text-xs font-light transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Soullab"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden sm:inline">Soullab</span>
                </motion.button>

                {/* Feedback Button - Desktop */}
                <motion.button
                  onClick={() => setShowFeedbackSheet(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-green-500/10 hover:bg-green-500/20
                           border border-green-500/20 hover:border-green-500/40
                           text-green-400 text-xs font-light transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Send Feedback"
                >
                  <MessageCircle className="w-4 h-4" />
                </motion.button>

                {/* Account Button - Desktop (opens bottom sheet) */}
                <motion.button
                  onClick={() => setShowAccountMenu(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-amber-500/10 hover:bg-amber-500/20
                           border border-amber-500/20 hover:border-amber-500/40
                           text-amber-400 text-xs font-light transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Account Menu"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation Area */}
          <div className="flex-1 overflow-hidden relative">
            <OracleConversation
              userId={explorerId}
              userName={explorerName}
              userBirthDate={userBirthDate}
              sessionId={sessionId}
              voiceEnabled={voiceEnabled}
              voice={selectedVoice}
              voiceSpeed={voiceSpeed}
              voiceModel={voiceModel}
              initialMode={maiaMode}
              onModeChange={setMaiaMode}
              apiEndpoint="/api/sovereign/app/maia"
              consciousnessType="maia"
              initialShowChatInterface={showChatInterface}
              onShowChatInterfaceChange={setShowChatInterface}
              showSessionSelector={showSessionSelector}
              onCloseSessionSelector={() => setShowSessionSelector(false)}
              onSessionActiveChange={setHasActiveSession}
              initialAction={searchParams?.get('action') || undefined}
            />

            {/* Claude Code's Living Presence - MOVED to bottom menu bar to free mobile screen space */}
            {/* <ClaudeCodePresence /> */}

            {/* Brain Trust Monitor - MOVED to bottom menu bar to free mobile screen space */}
            {/* <BrainTrustMonitor /> */}

            {/* Lab Drawer button is provided by OracleConversation component - bottom right corner */}
          </div>

          {/* Wisdom Journey Dashboard - Slide-out Panel */}
          <AnimatePresence>
            {showDashboard && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={clearPanel}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                />

                {/* Panel */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="absolute lg:relative right-0 top-0 h-full w-full max-w-md bg-stone-900/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto z-50"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-medium text-stone-200">Your Wisdom Patterns</h2>
                        <p className="text-xs text-stone-500 mt-1">Threads being woven from your reflections</p>
                      </div>
                      <button
                        onClick={clearPanel}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-stone-400" />
                      </button>
                    </div>

                    {/* Voice Settings */}
                    <div className="mb-6 bg-black/20 rounded-lg p-4 border border-amber-900/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Volume2 className="w-4 h-4 text-amber-400/60" />
                        <h3 className="text-sm font-medium text-stone-200">Voice Settings</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex flex-col gap-1">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={['shimmer', 'fable', 'nova', 'alloy', 'echo', 'onyx'].indexOf(selectedVoice)}
                            onChange={(e) => {
                              const voices: Array<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = ['shimmer', 'fable', 'nova', 'alloy', 'echo', 'onyx'];
                              handleVoiceChange(voices[parseInt(e.target.value)]);
                            }}
                            className="w-full h-1.5 bg-stone-700/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            style={{
                              background: `linear-gradient(to right, rgb(245 158 11 / 0.5) 0%, rgb(245 158 11 / 0.5) ${(['shimmer', 'fable', 'nova', 'alloy', 'echo', 'onyx'].indexOf(selectedVoice) / 5) * 100}%, rgb(87 83 78 / 0.5) ${(['shimmer', 'fable', 'nova', 'alloy', 'echo', 'onyx'].indexOf(selectedVoice) / 5) * 100}%, rgb(87 83 78 / 0.5) 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs">
                            <span title="Shimmer - Gentle & soothing">✨</span>
                            <span title="Fable - Storytelling">📖</span>
                            <span title="Nova - Bright & energetic">⭐</span>
                            <span title="Alloy - Neutral & balanced">🔘</span>
                            <span title="Echo - Warm & expressive">🌊</span>
                            <span title="Onyx - Deep & resonant">🖤</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 min-w-[64px]">
                          <span className="text-xs text-amber-400/80 font-medium uppercase tracking-wide">
                            {selectedVoice}
                          </span>
                          <span className="text-[9px] text-stone-500">
                            {selectedVoice === 'shimmer' && 'Gentle'}
                            {selectedVoice === 'fable' && 'Story'}
                            {selectedVoice === 'nova' && 'Bright'}
                            {selectedVoice === 'alloy' && 'Neutral'}
                            {selectedVoice === 'echo' && 'Warm'}
                            {selectedVoice === 'onyx' && 'Deep'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <WisdomJourneyDashboard userId={explorerId} />

                    {/* Weaving Visualization - Shows the dreamweaver process */}
                    <div className="mt-6">
                      <WeavingVisualization
                        userId={explorerId}
                        onSelectPrompt={(prompt) => {
                          // Feed selected prompt to conversation
                          // TODO: Connect to OracleConversation input
                          console.log('Selected prompt:', prompt.question);
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Week Zero Onboarding */}
        {isMounted && showWeekZeroOnboarding && (
          <WeekZeroOnboarding
            userId={explorerId}
            userName={explorerName}
            onComplete={handleWeekZeroComplete}
            onSkip={handleWeekZeroSkip}
          />
        )}

        {/* Welcome Message for First-Time Users */}
        {isMounted && showWelcome && !showWeekZeroOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative max-w-md w-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-6 backdrop-blur-xl"
            >
              <div className="text-center">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Welcome, {explorerName}
                </h3>
                <p className="text-sm text-stone-300 mb-4">
                  Share your story. MAIA will help you discover the wisdom within it.
                  Your journey begins now.
                </p>
                <button
                  onClick={() => {
                    localStorage.setItem('maia_welcome_seen', 'true');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                >
                  Begin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* SOULLAB Logo - Bottom Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-2 left-0 right-0 flex justify-center z-50"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md border border-amber-500/20 rounded-full">
            <img
              src="/holoflower-amber.png"
              alt="Holoflower"
              className="w-6 h-6 opacity-100 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
              style={{ filter: 'brightness(1.2)' }}
            />
            <h1 className="text-lg font-light text-amber-300/90 tracking-wider">
              SOULLAB
            </h1>
          </div>
        </motion.div>

        {/* Sacred Lab Drawer */}
        <SacredLabDrawer
          isOpen={showLabDrawer}
          onClose={() => setShowLabDrawer(false)}
          onNavigate={(path) => {
            router.push(path);
            setShowLabDrawer(false);
          }}
          onAction={(action) => {
            console.log('Lab action:', action);
            // Handle specific actions here
          }}
        />

        {/* Quick Journal Sheet */}
        <QuickJournalSheet
          isOpen={showJournalSheet}
          onClose={() => setShowJournalSheet(false)}
          userId={explorerId}
          onSaved={(entryId) => {
            console.log('📓 [MAIA] Journal entry saved:', entryId);
          }}
          onAskMaia={(content, type) => {
            // Close journal and send content to MAIA conversation
            setShowJournalSheet(false);
            // Dispatch event that OracleConversation can listen to
            window.dispatchEvent(new CustomEvent('journalAskMaia', {
              detail: {
                content,
                type,
                prompt: type === 'dream'
                  ? `Here's a dream I just captured:\n\n${content}`
                  : `Something I'm sitting with:\n\n${content}`
              }
            }));
          }}
        />

        {/* Shadow Work Sheet */}
        <ShadowWorkSheet
          isOpen={showShadowWork}
          onClose={() => setShowShadowWork(false)}
          userId={explorerId}
          onComplete={(responses) => {
            console.log('🌙 [MAIA] Shadow work completed:', Object.keys(responses).length, 'responses');
          }}
        />

        {/* Academy Sheet */}
        <AcademySheet
          isOpen={showAcademySheet}
          onClose={() => setShowAcademySheet(false)}
          userId={explorerId}
          onSelectPrompt={(promptId, domain) => {
            console.log('📚 [MAIA] Academy prompt selected:', promptId, 'in', domain);
          }}
        />

        {/* Help Hub Sheet */}
        <HelpHubSheet
          isOpen={showHelpHub}
          onClose={() => setShowHelpHub(false)}
          onOpenVoiceHelp={() => setShowVoiceHelp(true)}
          onOpenTestFlightHelp={() => setShowTestFlightHelp(true)}
        />

        {/* Voice Help Sheet */}
        <VoiceHelpSheet
          isOpen={showVoiceHelp}
          onClose={() => setShowVoiceHelp(false)}
        />

        {/* TestFlight Help Sheet */}
        <TestFlightHelpSheet
          isOpen={showTestFlightHelp}
          onClose={() => setShowTestFlightHelp(false)}
        />

        {/* Feedback Sheet */}
        <FeedbackSheet
          isOpen={showFeedbackSheet}
          onClose={() => setShowFeedbackSheet(false)}
          userName={explorerName}
          userId={explorerId}
        />

        </div>
      </SwipeNavigation>

      {/* Framework Selector - Long-press on Care/Note buttons (OUTSIDE SwipeNavigation for proper z-index) */}
      <FrameworkSelector
        mode={frameworkSelectorMode}
        isOpen={showFrameworkSelector}
        onClose={() => setShowFrameworkSelector(false)}
      />

      {/* Account Bottom Sheet */}
      <AnimatePresence>
        {showAccountMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setShowAccountMenu(false)}
            />
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#1a1a2e] to-black border-t border-amber-500/30 rounded-t-2xl z-[9999] p-4 pb-8 max-h-[85vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-amber-500/40 rounded-full mx-auto mb-4" />

              {/* Menu Items */}
              <div className="space-y-2 max-w-md mx-auto">
                {/* Sustaining Circle Section */}
                <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <span className="text-base text-amber-400 font-medium">Sustaining Circle</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mb-3 italic">
                    Everyone has full access. Your contribution sustains the sacred work.
                  </p>

                  {/* Current Circle Status */}
                  {membershipUtils.isBetaTester() && (
                    <div className="mb-3 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-300 font-medium">Pioneer Founding Member</span>
                    </div>
                  )}

                  {/* Choose Your Path */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Sustaining Circle */}
                    <button
                      onClick={() => setShowSustainingSlider(!showSustainingSlider)}
                      className={`p-2 rounded-lg transition-all text-center ${
                        showSustainingSlider
                          ? 'bg-amber-500/20 border border-amber-500/40'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                      }`}
                    >
                      <Flame className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                      <p className="text-[10px] text-amber-300 font-medium">Sustaining Circle</p>
                      <p className="text-[9px] text-stone-400">Choose your level</p>
                    </button>

                    {/* Seva Exchange */}
                    <button
                      onClick={() => setShowSevaOptions(!showSevaOptions)}
                      className={`p-2 rounded-lg transition-all text-center ${
                        showSevaOptions
                          ? 'bg-teal-500/20 border border-teal-500/40'
                          : 'bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30'
                      }`}
                    >
                      <Users className="w-4 h-4 mx-auto mb-1 text-teal-400" />
                      <p className="text-[10px] text-teal-300 font-medium">Seva Exchange</p>
                      <p className="text-[9px] text-stone-400">Contribute service</p>
                    </button>
                  </div>

                  {/* Sustaining Circle Slider (expandable) */}
                  {showSustainingSlider && (
                    <div className="mt-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      <p className="text-[10px] text-amber-300 mb-3 font-medium text-center">
                        Choose what feels right for you
                      </p>

                      {/* Amount Display */}
                      <div className="text-center mb-4">
                        <p className="text-2xl font-light text-amber-300">${sustainingAmount}<span className="text-sm text-stone-400">/mo</span></p>
                      </div>

                      {/* Slider */}
                      <div className="mb-4">
                        <input
                          type="range"
                          min="5"
                          max="500"
                          step="5"
                          value={sustainingAmount}
                          onChange={(e) => setSustainingAmount(parseInt(e.target.value))}
                          className="w-full h-2 rounded-full cursor-pointer accent-amber-500
                            [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-stone-700/50
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:-mt-1.5
                            [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-stone-700/50
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0"
                          style={{ WebkitAppearance: 'none', appearance: 'none', background: 'transparent' }}
                        />
                        <div className="flex justify-between text-[9px] text-stone-500 mt-1">
                          <span>$5</span>
                          <span>$500+</span>
                        </div>
                      </div>

                      {/* Benefits Preview */}
                      <div className="text-[9px] text-stone-400 mb-3 space-y-1">
                        <p className="flex items-center gap-1"><span className="text-amber-400">✓</span> Monthly build letters</p>
                        {sustainingAmount >= 25 && <p className="flex items-center gap-1"><span className="text-amber-400">✓</span> Early access + previews</p>}
                        {sustainingAmount >= 75 && <p className="flex items-center gap-1"><span className="text-amber-400">✓</span> Patron Q&A circle</p>}
                        {sustainingAmount >= 250 && <p className="flex items-center gap-1"><span className="text-amber-400">✓</span> Direct roadmap input</p>}
                        {sustainingAmount >= 500 && <p className="flex items-center gap-1"><span className="text-amber-400">✓</span> Founder channel access</p>}
                      </div>

                      {/* Transparency */}
                      <div className="bg-stone-800/50 rounded-lg p-3 mb-3 border border-stone-700/50">
                        <p className="text-[8px] text-stone-500 uppercase tracking-wide mb-2">What this sustains</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                          <span className="text-stone-400">Infrastructure</span>
                          <span className="text-stone-500 text-right">~$500/mo</span>
                          <span className="text-stone-400">Development</span>
                          <span className="text-stone-500 text-right">70+ hrs/wk</span>
                          <span className="text-amber-400 font-medium">Target</span>
                          <span className="text-amber-400 text-right font-medium">$3,500/mo</span>
                        </div>
                        <p className="text-[8px] text-stone-500 mt-2">
                          No VC. No ads. For us by us.
                        </p>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={() => membershipUtils.joinSustainingCircle(sustainingAmount)}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium transition-all"
                      >
                        Join Circle
                      </button>

                      {/* Full Details Link */}
                      <a
                        href="/patrons"
                        className="block text-center text-[9px] text-stone-500 hover:text-amber-400 mt-2 transition-colors"
                      >
                        View full details →
                      </a>
                    </div>
                  )}

                  {/* Seva Options (expandable) */}
                  {showSevaOptions && (
                    <div className="mt-3 p-3 bg-teal-500/5 border border-teal-500/20 rounded-lg">
                      <p className="text-[10px] text-teal-300 mb-2 font-medium">Choose your path of service:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(Object.entries(SEVA_PATHWAYS) as [SevaPathway, typeof SEVA_PATHWAYS[SevaPathway]][]).map(([key, path]) => (
                          <button
                            key={key}
                            onClick={() => membershipUtils.joinSeva(key)}
                            className="p-1.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-left transition-all"
                          >
                            <p className="text-[9px] text-teal-300 font-medium">{path.name}</p>
                            <p className="text-[8px] text-stone-500">{path.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-amber-500/20 my-2" />

                {/* Voice Settings Section */}
                <div className="px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                    <span className="text-base text-cyan-400 font-medium">Voice Settings</span>
                  </div>

                  {/* Voice Selection */}
                  <div className="mb-4">
                    <label className="text-xs text-stone-400 mb-2 block">MAIA&apos;s Voice</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setSelectedVoice(v)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                            selectedVoice === v
                              ? 'bg-amber-500/30 text-amber-200 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                              : 'bg-stone-800/50 text-stone-400 border border-stone-700/50 hover:bg-stone-700/50'
                          }`}
                        >
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                          {selectedVoice === v && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1.5">
                      {selectedVoice === 'alloy' && '🔘 Neutral & balanced'}
                      {selectedVoice === 'echo' && '🌊 Warm & expressive'}
                      {selectedVoice === 'fable' && '📖 Storytelling quality'}
                      {selectedVoice === 'nova' && '⭐ Bright & energetic'}
                      {selectedVoice === 'shimmer' && '✨ Gentle & soothing'}
                      {selectedVoice === 'onyx' && '🖤 Deep & resonant'}
                    </p>
                  </div>

                  {/* Speed Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-stone-400">Speed</label>
                      <span className="text-xs text-cyan-400 font-mono">{voiceSpeed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-stone-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      style={{
                        background: `linear-gradient(to right, rgb(6 182 212 / 0.5) 0%, rgb(6 182 212 / 0.5) ${((voiceSpeed - 0.5) / 1) * 100}%, rgb(87 83 78 / 0.5) ${((voiceSpeed - 0.5) / 1) * 100}%, rgb(87 83 78 / 0.5) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                      <span>Slower</span>
                      <span>Normal</span>
                      <span>Faster</span>
                    </div>
                  </div>

                  {/* Quality Toggle */}
                  <div>
                    <label className="text-xs text-stone-400 mb-2 block">Quality</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVoiceModel('tts-1')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                          voiceModel === 'tts-1'
                            ? 'bg-amber-500/30 text-amber-200 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-stone-800/50 text-stone-400 border border-stone-700/50 hover:bg-stone-700/50'
                        }`}
                      >
                        Standard
                        {voiceModel === 'tts-1' && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                        )}
                      </button>
                      <button
                        onClick={() => setVoiceModel('tts-1-hd')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                          voiceModel === 'tts-1-hd'
                            ? 'bg-amber-500/30 text-amber-200 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-stone-800/50 text-stone-400 border border-stone-700/50 hover:bg-stone-700/50'
                        }`}
                      >
                        HD ✨
                        {voiceModel === 'tts-1-hd' && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-amber-500/20 my-2" />

                {/* Commons */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/maia/community');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-amber-500/10 text-amber-400"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-base">Community Commons</span>
                </button>

                {/* Labtools - Full access for everyone */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    setShowLabDrawer(true);
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-blue-500/10 text-blue-400"
                >
                  <FlaskConical className="w-5 h-5" />
                  <span className="text-base">Labtools</span>
                </button>

                {/* Account Settings */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/account/settings');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-purple-500/10 text-purple-400"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-base">Settings</span>
                </button>

                {/* Send Feedback */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    requestAnimationFrame(() => setShowFeedbackSheet(true));
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-green-500/10 text-green-400"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-base">Send Feedback</span>
                </button>

                {/* Divider */}
                <div className="border-t border-amber-500/20 my-2" />

                {/* Sign Out */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    handleSignOut();
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-red-500/10 text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-base">Sign Out</span>
                </button>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => setShowAccountMenu(false)}
                className="mt-4 w-full max-w-md mx-auto block py-3 rounded-xl bg-amber-500/10 text-amber-400 text-center font-medium hover:bg-amber-500/20 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Beta Tester Feedback Hub removed - feedback available via Account menu */}
    </ErrorBoundary>
  );
}

// Wrap with Suspense for useSearchParams (Next.js 15 requirement)
export default function MAIAPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="text-[#D4B896] animate-pulse">Loading MAIA...</div>
    </div>}>
      <MAIAPageContent />
    </Suspense>
  );
}