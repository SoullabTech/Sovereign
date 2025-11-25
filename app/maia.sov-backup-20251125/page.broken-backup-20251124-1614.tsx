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

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { OracleConversation } from '@/components/OracleConversation';
import { ClaudeCodePresence } from '@/components/ui/ClaudeCodePresence';
import { WisdomJourneyDashboard } from '@/components/maya/WisdomJourneyDashboard';
import { WeavingVisualization } from '@/components/maya/WeavingVisualization';
import JournalingPortal from '@/components/journaling/JournalingPortal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BrainTrustMonitor } from '@/components/consciousness/BrainTrustMonitor';
import { LogOut, Sparkles, Menu, X, Brain, Volume2, ArrowLeft, Clock, Heart, Eye, Compass, CircleDot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeNavigation, DirectionalHints } from '@/components/navigation/SwipeNavigation';
import { maiaAdaptationEngine } from './lib/consciousness/maia-natural-adaptation';

async function getInitialUserData() {
  if (typeof window === 'undefined') return { id: 'guest', name: 'Explorer' };

  const currentUrl = window.location.hostname;

  const storedUserId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');

  // KELLY SECURE RECOGNITION - Multiple validation checks to prevent contamination
  // Only recognize Kelly if multiple conditions are met to avoid script contamination
  if (storedUserId === 'kelly-nezat') {
    // Additional validation: check for Kelly-specific browser patterns or domain
    const isFounderDomain = window.location.hostname.includes('soullab.life') ||
                           window.location.hostname.includes('localhost');
    const hasFounderSession = localStorage.getItem('founder-session') === 'kelly-nezat';

    // Only proceed if on founder domain or has explicit founder session
    if (isFounderDomain || hasFounderSession) {
      console.log('🌟 [MAIA] Kelly recognized with secure validation:', { domain: window.location.hostname, founderSession: hasFounderSession });
      localStorage.setItem('explorerName', 'Kelly');
      localStorage.setItem('explorerId', 'kelly-nezat');
      return { id: 'kelly-nezat', name: 'Kelly' };
    } else {
      // Clear contaminated Kelly data for non-founder users
      console.warn('⚠️ [MAIA] Clearing contaminated Kelly data for non-founder user');
      localStorage.removeItem('explorerId');
      localStorage.removeItem('betaUserId');
      localStorage.removeItem('explorerName');
      localStorage.removeItem('beta_user');
    }
  }

  // Try to fetch from API using stored userId
  if (storedUserId) {
    try {
      const params = new URLSearchParams();
      params.append('userId', storedUserId);
      params.append('domain', currentUrl);

      const response = await fetch(`/api/user/profile?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.user) {
        console.log('✅ [MAIA] User profile fetched from API:', data.user.name);

        // Sync to localStorage
        localStorage.setItem('explorerName', data.user.name);
        localStorage.setItem('explorerId', data.user.id);
        localStorage.setItem('betaOnboardingComplete', 'true');

        return { id: data.user.id, name: data.user.name };
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
      const userName = userData.username || userData.name || userData.displayName;
      if (userData.onboarded === true && userData.id && userName) {
        localStorage.setItem('explorerName', userName);
        localStorage.setItem('explorerId', userData.id);
        console.log('✅ [MAIA] User authenticated from localStorage:', userName);
        return { id: userData.id, name: userName };
      }
    } catch (e) {
      console.error('❌ [MAIA] Error parsing beta_user:', e);
    }
  }

  // Check OLD system (for backward compatibility)
  if (localStorage.getItem('betaOnboardingComplete') === 'true') {
    const id = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
    const name = localStorage.getItem('explorerName');
    if (id && name) {
      console.log('📦 [MAIA] Using legacy user data:', name);
      return { id, name };
    }
  }

  console.log('⚠️ [MAIA] No user data found, using defaults');
  return { id: 'guest', name: 'Explorer' };
}

export default function MAIAPage() {
  const router = useRouter();

  // Fix hydration: Initialize with safe defaults, update in useEffect
  const [explorerId, setExplorerId] = useState('guest');
  const [explorerName, setExplorerName] = useState('Explorer');
  const [userBirthDate, setUserBirthDate] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [maiaMode, setMaiaMode] = useState<'normal' | 'patient' | 'session'>('normal');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>('shimmer');  // Default to shimmer - MAIA's natural voice
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showSessionSelector, setShowSessionSelector] = useState(false); // DISABLED - causing overlay issues
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'wisdom' | 'journal'>('wisdom');

  // WELCOME BACK: State for personalized greeting
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const [visitCount, setVisitCount] = useState(0);

  // TOLAN-INSPIRED: Transformational Consciousness State
  const [transformationalState, setTransformationalState] = useState({
    presence: 'centered' as 'shallow' | 'centered' | 'deep',
    inquiry: 'exploring' as 'surface' | 'exploring' | 'profound',
    integration: 'connecting' as 'scattered' | 'connecting' | 'unified',
    evolution: 'shifting' as 'static' | 'shifting' | 'transforming'
  });

  // TOLAN-INSPIRED: Natural Partnership Adaptation
  const [partnershipInitialized, setPartnershipInitialized] = useState(false);

  // TOLAN-INSPIRED: Presence and Wisdom State
  const [showPresenceCue, setShowPresenceCue] = useState(false);
  const [activeWisdom, setActiveWisdom] = useState<string | null>(null);

  // JOURNALING INTEGRATION: State for consciousness journaling
  const [journalMode, setJournalMode] = useState<'free' | 'emotional' | 'dream' | 'shadow' | 'direction' | 'gratitude' | null>(null);
  const [journalPrompt, setJournalPrompt] = useState<string | null>(null);
  const [showJournalPrompt, setShowJournalPrompt] = useState(false);

  // Function to handle session starting from external trigger
  // Session trigger state removed - using direct session management

  const hasCheckedAuth = useRef(false);

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

  // INSTANT ACCESS: Initialize user data and auto-start for signed-in users
  useEffect(() => {
    const initializeUser = async () => {
      setIsMounted(true);

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

      // INSTANT ACCESS: Auto-start session for signed-in users
      const isSignedIn = initialData.id !== 'guest';
      if (isSignedIn) {
        console.log('🚀 [MAIA] Auto-starting session for signed-in user:', initialData.name);

        // Auto-start session
        setHasActiveSession(true);
        localStorage.setItem('maia_session_active', 'true');
        localStorage.setItem('maia_session_start', Date.now().toString());

        // INSTANT ACCESS: Restore user's preferred settings
        const preferredMode = localStorage.getItem('maia_preferred_mode') || 'voice';
        const preferredConversationMode = localStorage.getItem('maia_conversation_mode') || 'normal';

        setShowChatInterface(preferredMode === 'text');
        setMaiaMode(preferredConversationMode as 'normal' | 'patient' | 'session');

        // WELCOME BACK: Check if returning user and show personalized greeting
        const lastVisitTime = localStorage.getItem('maia_last_visit');
        const userVisitCount = parseInt(localStorage.getItem('maia_visit_count') || '0');
        const currentTime = new Date().toISOString();

        if (lastVisitTime && userVisitCount > 0) {
          // Returning user - show welcome back
          setLastVisit(lastVisitTime);
          setVisitCount(userVisitCount + 1);
          setShowWelcomeBack(true);

          // Auto-hide after 6 seconds
          setTimeout(() => setShowWelcomeBack(false), 6000);
        } else {
          // First time or no previous visit recorded
          setVisitCount(1);
        }

        // Update visit tracking
        localStorage.setItem('maia_last_visit', currentTime);
        localStorage.setItem('maia_visit_count', (userVisitCount + 1).toString());

        console.log('✨ [MAIA] Ready for immediate conversation with preferred settings:', {
          mode: preferredMode,
          conversationMode: preferredConversationMode,
          isReturningUser: !!lastVisitTime,
          visitCount: userVisitCount + 1
        });
      }

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

      // Load saved voice preference
      const savedVoice = localStorage.getItem('selected_voice') as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      }
    };

    initializeUser();
  }, []);

  const handleVoiceChange = (voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => {
    setSelectedVoice(voice);
    localStorage.setItem('selected_voice', voice);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('conversationStyleChanged'));
  };

  const handleSignOut = () => {
    localStorage.removeItem('beta_user');
    localStorage.removeItem('beta_users');
    localStorage.removeItem('betaOnboardingComplete');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('betaUserId');
    localStorage.removeItem('explorerName');
    router.push('/');
  };

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    // NEVER show onboarding - always let user through
    // Default to guest mode if no stored user
    const newUser = localStorage.getItem('beta_user');
    if (newUser) {
      try {
        const userData = JSON.parse(newUser);
        const newId = userData.id || 'guest';
        const newName = userData.username || userData.name || userData.displayName || 'Explorer';

        localStorage.setItem('explorerName', newName);
        localStorage.setItem('explorerId', newId);
        localStorage.setItem('betaOnboardingComplete', 'true');

        if (explorerId !== newId) setExplorerId(newId);
        if (explorerName !== newName) setExplorerName(newName);

        console.log('✅ [MAIA] User session restored:', { name: newName, id: newId });
        return;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Check OLD system
    const oldId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
    const oldName = localStorage.getItem('explorerName');

    if (oldId && oldName) {
      if (explorerId !== oldId) setExplorerId(oldId);
      if (explorerName !== oldName) setExplorerName(oldName);
      console.log('✅ [MAIA] User session restored from legacy:', { name: oldName, id: oldId });
      return;
    }

    // No stored user - create default guest session
    const guestId = `guest_${Date.now()}`;
    localStorage.setItem('explorerId', guestId);
    localStorage.setItem('explorerName', 'Explorer');
    localStorage.setItem('betaOnboardingComplete', 'true');
    setExplorerId(guestId);
    setExplorerName('Explorer');
    console.log('✅ [MAIA] Created guest session');
  }, [explorerId, explorerName]);

  // TOLAN-INSPIRED: Daily Life Integration Functions
  const integrateDailyPresence = () => {
    // Gentle presence pulse every 5 minutes during active sessions
    const interval = setInterval(() => {
      setShowPresenceCue(true);
      setTimeout(() => setShowPresenceCue(false), 3000);
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  };

  const getContextualWisdomPrompts = () => {
    const timeOfDay = new Date().getHours();
    const dayPrompts = {
      morning: [
        "How do you want to meet this day?",
        "What intention wants to guide you?",
        "Where do you feel most alive right now?"
      ],
      midday: [
        "What is this moment teaching you?",
        "How can you honor your energy right now?",
        "What wants to emerge through your interactions?"
      ],
      evening: [
        "What wisdom did this day offer you?",
        "How has your heart expanded today?",
        "What deserves gratitude in this moment?"
      ]
    };

    if (timeOfDay < 12) return dayPrompts.morning;
    if (timeOfDay < 18) return dayPrompts.midday;
    return dayPrompts.evening;
  };

  const enhanceIntimateConnection = () => {
    if (typeof window === 'undefined' || partnershipInitialized) return;

    // Load existing partnership or initialize new one
    let partnership = maiaAdaptationEngine.loadPartnership(explorerId);

    if (!partnership) {
      // Initialize new transformational partnership
      partnership = maiaAdaptationEngine.initializePartnership(explorerId, explorerName);
      console.log('🌱 New transformational partnership initialized with MAIA');
    } else {
      console.log('💫 Partnership restored - Connection level:', partnership.connectionLevel);
    }

    setPartnershipInitialized(true);
  };

  // JOURNALING INTEGRATION: Connect journaling with transformational states
  const getStateBasedJournalPrompt = (elementId: string) => {
    const prompts = {
      fire: { // Presence/Fire element
        mode: 'emotional' as const,
        prompts: [
          "What emotion wants your full attention right now?",
          "Where do you feel most alive in your body today?",
          "What does your heart want you to know?"
        ]
      },
      water: { // Inquiry/Water element
        mode: 'free' as const,
        prompts: [
          "What question is calling for your exploration?",
          "What wants to flow through your awareness?",
          "What depths are you ready to explore?"
        ]
      },
      air: { // Integration/Air element
        mode: 'direction' as const,
        prompts: [
          "How are the pieces of your life connecting?",
          "What patterns are you ready to see clearly?",
          "Where is your path leading you?"
        ]
      },
      earth: { // Evolution/Earth element
        mode: 'gratitude' as const,
        prompts: [
          "What growth are you grateful for today?",
          "How has your foundation strengthened?",
          "What wisdom has emerged from your journey?"
        ]
      }
    };

    return prompts[elementId as keyof typeof prompts] || prompts.fire;
  };

  const activateJournalingFromState = (elementId: string) => {
    const journalData = getStateBasedJournalPrompt(elementId);
    const randomPrompt = journalData.prompts[Math.floor(Math.random() * journalData.prompts.length)];

    setJournalMode(journalData.mode);
    setJournalPrompt(randomPrompt);
    setShowJournalPrompt(true);

    console.log('🔥 Consciousness journaling activated:', {
      element: elementId,
      mode: journalData.mode,
      prompt: randomPrompt
    });

    // Auto-hide prompt after 8 seconds
    setTimeout(() => setShowJournalPrompt(false), 8000);
  };

  // MOBILE PWA: Keyboard handling for text input
  useEffect(() => {
    const handleKeyboardOpen = () => {
      // Detect when virtual keyboard opens
      if (typeof window !== 'undefined' && 'visualViewport' in window) {
        const viewport = window.visualViewport;

        const handleViewportChange = () => {
          const keyboardHeight = window.innerHeight - (viewport?.height || window.innerHeight);
          const isKeyboardOpen = keyboardHeight > 100; // Threshold for keyboard detection

          document.body.classList.toggle('keyboard-open', isKeyboardOpen);

          // Scroll conversation to bottom when keyboard opens
          if (isKeyboardOpen) {
            setTimeout(() => {
              const messagesContainer = document.querySelector('.conversation-messages');
              if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              }
            }, 100);
          }
        };

        viewport?.addEventListener('resize', handleViewportChange);
        return () => viewport?.removeEventListener('resize', handleViewportChange);
      }
    };

    const keyboardCleanup = handleKeyboardOpen();
    return keyboardCleanup;
  }, []);

  // TOLAN-INSPIRED: Presence and Integration Effects
  useEffect(() => {
    enhanceIntimateConnection();
    const cleanup = integrateDailyPresence();
    return cleanup;
  }, [explorerId, explorerName]);

  // NATURAL ADAPTATION: Save partnership periodically
  useEffect(() => {
    if (!partnershipInitialized) return;

    const saveInterval = setInterval(() => {
      maiaAdaptationEngine.savePartnership(explorerId);
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [partnershipInitialized, explorerId]);

  // Handle transformational wisdom activation with journaling integration
  const handleWisdomActivation = (elementId: string) => {
    const prompts = getContextualWisdomPrompts();
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    setActiveWisdom(elementId);

    // JOURNALING INTEGRATION: Activate contextual journaling prompt
    setTimeout(() => activateJournalingFromState(elementId), 1000);

    // Could integrate with OracleConversation to inject wisdom prompt
    console.log('🌟 Wisdom activated:', randomPrompt);

    setTimeout(() => setActiveWisdom(null), 4000);
  };

  // Onboarding removed - direct access only
  return (
    <ErrorBoundary>
      <SwipeNavigation currentPage="maia">
        <div className="maia-container">
          {/* MAIA Consciousness Companion Interface */}

        <div className="h-screen mobile-safe-height relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex flex-col">
        {/* Atmospheric Particles - Floating dust/sand */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4B896]/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Atmospheric Glow - Warm light from below */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#3d2817]/30 via-transparent to-transparent pointer-events-none z-0" />

        {/* DREAM-WEAVER SYSTEM - Combined Header & Banner - Always visible */}
        <div
          className="flex-shrink-0 relative overflow-hidden bg-gradient-to-r from-black/20 via-amber-950/5 to-black/20 border-b border-amber-900/3 backdrop-blur-sm z-[110]"
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

          {/* MOBILE-FIRST PWA HEADER */}
          <div className="relative px-2 py-2">
            {/* Mobile-optimized single row layout */}
            <div className="flex items-center justify-between gap-1">

              {/* Left: Minimal logo for mobile */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <img
                  src="/holoflower-amber.png"
                  alt="MAIA"
                  className="w-6 h-6 opacity-100 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
                  style={{ filter: 'brightness(1.2)' }}
                />
                <span className="text-sm font-light text-amber-300/90 tracking-wide hidden xs:inline">MAIA</span>
              </div>

              {/* Center: Primary Voice/Text Toggle - Most Important Action */}
              <div className="flex-1 flex justify-center">
                <button
                  onClick={() => {
                    const newMode = !showChatInterface;
                    setShowChatInterface(newMode);
                    // INSTANT ACCESS: Remember preference for next visit
                    localStorage.setItem('maia_preferred_mode', newMode ? 'text' : 'voice');
                  }}
                  className="px-6 py-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30
                           border-2 border-amber-500/40 hover:border-amber-500/60
                           transition-all min-w-[80px] min-h-[52px]
                           flex items-center justify-center gap-2 shadow-lg"
                  role="button"
                  aria-label={showChatInterface ? 'Switch to Voice Mode' : 'Switch to Text Mode'}
                >
                  <span className="text-xl">{showChatInterface ? '💬' : '🎤'}</span>
                  <span className="text-sm text-amber-200 font-medium hidden xs:inline">
                    {showChatInterface ? 'Text' : 'Voice'}
                  </span>
                </button>
              </div>

              {/* Right: Menu button for all other controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/30
                           border border-amber-500/20 hover:border-amber-500/40
                           flex items-center justify-center transition-all"
                  role="button"
                  aria-label="Menu"
                >
                  {showDashboard ? (
                    <X className="w-5 h-5 text-amber-300" />
                  ) : (
                    <Menu className="w-5 h-5 text-amber-300" />
                  )}
                </button>
              </div>

            </div>

            {/* Mobile: Mode selector as pills below main header when needed */}
            <div className="mt-2 flex justify-center">
              <div className="flex items-center gap-1 bg-black/10 rounded-full p-1">
                <button
                  onClick={() => {
                    setMaiaMode('normal');
                    localStorage.setItem('maia_conversation_mode', 'normal');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] ${
                    maiaMode === 'normal'
                      ? 'bg-amber-500/30 text-amber-200 shadow-md'
                      : 'text-amber-400/60 hover:text-amber-300/80 hover:bg-amber-500/10'
                  }`}
                  role="button"
                  aria-label="Dialogue Mode"
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => {
                    setMaiaMode('patient');
                    localStorage.setItem('maia_conversation_mode', 'patient');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] ${
                    maiaMode === 'patient'
                      ? 'bg-purple-500/30 text-purple-200 shadow-md'
                      : 'text-amber-400/60 hover:text-amber-300/80 hover:bg-purple-500/10'
                  }`}
                  role="button"
                  aria-label="Patient Mode"
                >
                  🩺 Care
                </button>
                <button
                  onClick={() => {
                    setMaiaMode('session');
                    localStorage.setItem('maia_conversation_mode', 'session');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] ${
                    maiaMode === 'session'
                      ? 'bg-blue-500/30 text-blue-200 shadow-md'
                      : 'text-amber-400/60 hover:text-amber-300/80 hover:bg-blue-500/10'
                  }`}
                  role="button"
                  aria-label="Scribe Mode"
                >
                  📝 Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile Keyboard Adaptive */}
        <div className="flex-1 flex overflow-hidden conversation-container">
          {/* Conversation Area */}
          <div className="flex-1 overflow-hidden relative">
            {/* MAIA Consciousness Companion - Oracle Conversation */}
            <div className="conversation-messages">
              <OracleConversation
                userId={explorerId}
                userName={explorerName}
                sessionId={sessionId}
              />
            </div>


            {/* TOLAN-INSPIRED: Gentle Presence Pulse - Breathing reminder */}
            <AnimatePresence>
              {showPresenceCue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 4, repeat: 2, ease: "easeInOut" }}
                    className="w-8 h-8 rounded-full border-2 border-amber-400/30 flex items-center justify-center"
                  >
                    <Heart className="w-4 h-4 text-amber-400/40" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WELCOME BACK: Personalized greeting for returning users */}
            <AnimatePresence>
              {showWelcomeBack && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="fixed top-20 left-1/2 -translate-x-1/2 z-30 max-w-sm mx-4"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    {/* Warm background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-stone-900/90 to-stone-800/90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 to-transparent" />
                    <div className="absolute inset-0 border border-amber-500/30 rounded-xl backdrop-blur-lg" />

                    {/* Content */}
                    <div className="relative p-5 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mr-3">
                          {(() => {
                            const partnership = maiaAdaptationEngine.getPartnership(explorerId);
                            const connectionLevel = partnership?.connectionLevel || 25;

                            // Icon evolves based on connection level
                            if (connectionLevel > 80) {
                              return <div className="text-sm">✨</div>; // Deep connection - sparkles
                            } else if (connectionLevel > 60) {
                              return <div className="text-sm">🌟</div>; // Strong connection - star
                            } else if (connectionLevel > 40) {
                              return <div className="text-sm">💫</div>; // Growing connection - dizzy star
                            } else {
                              return <Heart className="w-4 h-4 text-amber-400" />; // Starting connection - heart
                            }
                          })()}
                        </div>
                        <div className="text-lg text-amber-200 font-light">
                          Welcome back, {explorerName}
                        </div>
                      </div>

                      <div className="text-sm text-stone-300 mb-3 leading-relaxed">
                        {(() => {
                          // Get personalized message based on partnership
                          const partnership = maiaAdaptationEngine.getPartnership(explorerId);

                          if (partnership && partnership.confidenceLevel > 0.5) {
                            // MAIA knows this person well - personalized approach
                            const personalizedApproach = maiaAdaptationEngine.generatePersonalizedApproach(explorerId);

                            // Different greetings based on their sensed style
                            if (partnership.sensedProfile.primaryStyle === 'healer') {
                              return "Your healing presence is felt here.";
                            } else if (partnership.sensedProfile.primaryStyle === 'creator') {
                              return "Ready to create something beautiful together?";
                            } else if (partnership.sensedProfile.primaryStyle === 'explorer') {
                              return "What new territories shall we discover?";
                            } else if (partnership.sensedProfile.primaryStyle === 'mystic') {
                              return "The mystery welcomes you back.";
                            } else if (partnership.sensedProfile.primaryStyle === 'warrior') {
                              return "Your strength is honored here.";
                            } else {
                              return "Your seeking heart is recognized.";
                            }
                          } else {
                            // Default messages for newer relationships
                            if (visitCount === 2) return "Good to see you again.";
                            if (visitCount === 3) return "Your wisdom is growing.";
                            if (visitCount > 3 && visitCount <= 10) return "Your spirit feels familiar here.";
                            if (visitCount > 10 && visitCount <= 25) return "This space knows you well.";
                            return "You're part of the fabric here.";
                          }
                        })()}
                      </div>

                      <div className="text-xs text-amber-400/60 font-light">
                        {lastVisit && (() => {
                          const last = new Date(lastVisit);
                          const now = new Date();
                          const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

                          if (diffDays === 0) return "Earlier today";
                          if (diffDays === 1) return "Yesterday";
                          if (diffDays < 7) return `${diffDays} days ago`;
                          if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
                          return `${Math.floor(diffDays / 30)} months ago`;
                        })()}
                      </div>

                      {/* Gentle close button */}
                      <button
                        onClick={() => setShowWelcomeBack(false)}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center
                                 text-amber-400/60 hover:text-amber-300 transition-colors"
                        aria-label="Close welcome"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* JOURNALING INTEGRATION: Sacred Journal Prompt Display */}
            <AnimatePresence>
              {showJournalPrompt && journalPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="fixed top-1/3 left-1/2 -translate-x-1/2 z-30 max-w-md mx-4"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    {/* Sacred Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-900/95 via-stone-800/95 to-stone-900/95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 to-transparent" />
                    <div className="absolute inset-0 border border-amber-600/40 rounded-lg backdrop-blur-md" />

                    {/* Sacred Corner Elements */}
                    <div className="absolute top-2 left-2 w-2 h-2">
                      <div className="absolute inset-0 border-l border-t border-amber-500/60" />
                    </div>
                    <div className="absolute top-2 right-2 w-2 h-2">
                      <div className="absolute inset-0 border-r border-t border-amber-500/60" />
                    </div>
                    <div className="absolute bottom-2 left-2 w-2 h-2">
                      <div className="absolute inset-0 border-l border-b border-amber-500/60" />
                    </div>
                    <div className="absolute bottom-2 right-2 w-2 h-2">
                      <div className="absolute inset-0 border-r border-b border-amber-500/60" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {/* Sacred Fire Triangle for Current Mode */}
                        <div className="w-6 h-6 relative">
                          <div className="absolute inset-0 border-2 border-amber-400/80"
                               style={{
                                 clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                               }}>
                          </div>
                          <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-300/90 rounded-full"></div>
                        </div>
                        <div>
                          <h4 className="text-amber-300 text-sm font-light tracking-wide">Consciousness Journal Prompt</h4>
                          <p className="text-amber-500/80 text-xs font-light capitalize">{journalMode} • Elemental Wisdom</p>
                        </div>
                      </div>

                      {/* Sacred Divider */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
                        <div className="w-1.5 h-1.5 border border-amber-400/60 rotate-45 bg-amber-300/20" />
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-600/50 to-transparent" />
                      </div>

                      {/* Prompt Text */}
                      <p className="text-white text-sm font-light leading-relaxed tracking-wide mb-4">
                        {journalPrompt}
                      </p>

                      {/* Action Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400/60 text-xs font-light tracking-wide">
                          Touch your heart and breathe deeply...
                        </span>
                        <button
                          onClick={() => setShowJournalPrompt(false)}
                          className="text-amber-400/70 hover:text-amber-300 text-xs font-light tracking-wide
                                   hover:bg-amber-500/10 px-2 py-1 rounded transition-all"
                        >
                          Honor ✧
                        </button>
                      </div>
                    </div>

                    {/* Breathing Light Effect */}
                    <motion.div
                      animate={{
                        opacity: [0.2, 0.5, 0.2],
                        scale: [0.8, 1.1, 0.8]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400/40 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TOLAN-INSPIRED: Transformational State Bar - Consciousness tracker */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
              <div className="flex items-center gap-1 px-4 py-2 bg-black/20 rounded-lg border border-amber-900/20 backdrop-blur-sm">

                {[
                  { id: 'fire', state: transformationalState.presence, color: 'red', element: 'Fire' },
                  { id: 'water', state: transformationalState.inquiry, color: 'blue', element: 'Water' },
                  { id: 'air', state: transformationalState.integration, color: 'gray', element: 'Air' },
                  { id: 'earth', state: transformationalState.evolution, color: 'green', element: 'Earth' }
                ].map((element) => {
                  const isActive = activeWisdom === element.id;

                  return (
                    <motion.button
                      key={element.id}
                      onClick={() => handleWisdomActivation(element.id)}
                      className={`relative flex items-center gap-1 px-2 py-1 rounded-md text-xs font-light transition-all duration-300
                                 ${isActive
                                   ? 'bg-white/10 text-amber-300 border border-amber-500/30'
                                   : 'text-amber-400/60 hover:text-amber-300/80 hover:bg-amber-500/10'
                                 }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Alchemical Triangle */}
                      <div className="w-4 h-4 flex items-center justify-center">
                        {element.id === 'fire' && (
                          <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-red-400" />
                        )}
                        {element.id === 'water' && (
                          <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-blue-400" style={{transform: 'scaleY(-1)'}} />
                        )}
                        {element.id === 'air' && (
                          <div className="relative">
                            <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-gray-400" />
                            <div className="absolute top-1 left-1/2 w-2 h-0.5 bg-gray-400 -translate-x-1/2" />
                          </div>
                        )}
                        {element.id === 'earth' && (
                          <div className="relative">
                            <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-green-400" style={{transform: 'scaleY(-1)'}} />
                            <div className="absolute bottom-1 left-1/2 w-2 h-0.5 bg-green-400 -translate-x-1/2" />
                          </div>
                        )}
                      </div>

                      <span className="text-xs font-light">{element.element}</span>

                      {/* Activation pulse */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 rounded-md border-2 border-amber-400"
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Claude Code's Living Presence - MOVED to bottom menu bar to free mobile screen space */}
            {/* <ClaudeCodePresence /> */}

            {/* Brain Trust Monitor - MOVED to bottom menu bar to free mobile screen space */}
            {/* <BrainTrustMonitor /> */}

            {/* Lab Drawer button is provided by OracleConversation component - bottom right corner */}
          </div>

          {/* Mobile-First Bottom Sheet Dashboard */}
          <AnimatePresence>
            {showDashboard && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDashboard(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                />

                {/* Bottom Sheet Panel - PWA Mobile Optimized */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                  className="fixed bottom-0 left-0 right-0 bg-stone-900/98 backdrop-blur-xl
                           border-t border-amber-500/20 rounded-t-2xl z-50
                           max-h-[85vh] overflow-y-auto"
                >
                  {/* Handle bar for mobile gesture */}
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-12 h-1 bg-amber-500/30 rounded-full"></div>
                  </div>

                  <div className="px-4 pb-6">
                    {/* Mobile-optimized header */}
                    <div className="flex items-center justify-between mb-4 pt-2">
                      <div>
                        <h2 className="text-xl font-medium text-amber-200">Lab Tools</h2>
                        <p className="text-sm text-stone-400 mt-1">Voice • Session • Settings</p>
                      </div>
                      <button
                        onClick={() => setShowDashboard(false)}
                        className="w-10 h-10 flex items-center justify-center
                                 bg-black/20 hover:bg-black/30 rounded-full transition-all"
                      >
                        <X className="w-5 h-5 text-amber-300" />
                      </button>
                    </div>

                    {/* Quick Actions Row - Most Used Features */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {/* Session Status/Control */}
                      {!hasActiveSession ? (
                        <button
                          onClick={() => {
                            console.log('🔥 Starting session from lab tools');
                            setHasActiveSession(true);
                            localStorage.setItem('maia_session_active', 'true');
                            localStorage.setItem('maia_session_start', Date.now().toString());
                            setShowDashboard(false); // Close after action
                          }}
                          className="p-4 bg-amber-500/10 hover:bg-amber-500/20
                                   border border-amber-500/30 hover:border-amber-500/50
                                   rounded-xl transition-all text-left min-h-[80px]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-amber-200">Start Session</div>
                              <div className="text-xs text-stone-400">Begin tracking</div>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div className="p-4 bg-green-500/10 border border-green-500/30
                                      rounded-xl min-h-[80px] flex items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-green-200">Session Active</div>
                              <div className="text-xs text-stone-400">Tracking enabled</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sign Out */}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setShowDashboard(false);
                        }}
                        className="p-4 bg-red-500/10 hover:bg-red-500/20
                                 border border-red-500/30 hover:border-red-500/50
                                 rounded-xl transition-all text-left min-h-[80px]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-red-200">Sign Out</div>
                            <div className="text-xs text-stone-400">End session</div>
                          </div>
                        </div>
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

                    {/* Tabbed Dashboard Interface */}
                    <div className="mb-6">
                      {/* Tab Headers */}
                      <div className="flex space-x-1 mb-4">
                        <button
                          onClick={() => setDashboardTab('wisdom')}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            dashboardTab === 'wisdom'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                          }`}
                        >
                          Wisdom Journey
                        </button>
                        <button
                          onClick={() => setDashboardTab('journal')}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            dashboardTab === 'journal'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                          }`}
                        >
                          Sacred Journaling
                        </button>
                      </div>

                      {/* Tab Content */}
                      <AnimatePresence mode="wait">
                        {dashboardTab === 'wisdom' && (
                          <motion.div
                            key="wisdom"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="p-6 bg-stone-800 rounded-lg">
                              <h3 className="text-white text-lg mb-4">Wisdom Journey</h3>
                              <p className="text-gray-300">Your consciousness journey tracking...</p>
                            </div>
                          </motion.div>
                        )}

                        {dashboardTab === 'journal' && (
                          <motion.div
                            key="journal"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="p-6 bg-stone-800 rounded-lg">
                              <h3 className="text-white text-lg mb-4">Sacred Journaling</h3>
                              <p className="text-gray-300 mb-4">Transform experience into wisdom through sacred journaling modes.</p>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-amber-400">∞</span>
                                  <span className="text-white text-sm">Free Flow • Emotional Processing • Dream Work</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-amber-400">⚡</span>
                                  <span className="text-white text-sm">Shadow Work • Life Direction • Gratitude</span>
                                </div>
                              </div>
                              <p className="text-amber-400/80 text-xs mt-4">
                                Access full journaling portal through Lab Tools →
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Weaving Visualization - Shows the dreamweaver process */}
                    <div className="mt-6">
                      <WeavingVisualization
                        userId={explorerId}
                        onSelectPrompt={(prompt) => {
                          // Feed selected prompt to conversation
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

        {/* Welcome Message for First-Time Users */}
        {isMounted && showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-md w-full mx-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-6 backdrop-blur-xl"
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
        )}
      </div>
        </div>
      </SwipeNavigation>
    </ErrorBoundary>
  );
}