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
// BetaOnboarding removed - direct access only
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BrainTrustMonitor } from '@/components/consciousness/BrainTrustMonitor';
import { LogOut, Sparkles, Menu, X, Brain, Volume2, ArrowLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeNavigation, DirectionalHints } from '@/components/navigation/SwipeNavigation';

async function getInitialUserData() {
  if (typeof window === 'undefined') return { id: 'guest', name: 'Explorer' };

  const currentUrl = window.location.hostname;

  const storedUserId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');

  // KELLY SPECIAL CASE - Only check for specific Kelly userId
  // Do NOT auto-assign based on domain - that would affect all users
  if (storedUserId === 'kelly-nezat') {
    console.log('🌟 [MAIA] Kelly recognized from userId:', storedUserId);
    localStorage.setItem('explorerName', 'Kelly');
    localStorage.setItem('explorerId', 'kelly-nezat');
    return { id: 'kelly-nezat', name: 'Kelly' };
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
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

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

  // Fix hydration: Initialize user data and session after mount
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

  // Onboarding removed - direct access only
  return (
    <ErrorBoundary>
      <SwipeNavigation currentPage="maia">
        {/* DirectionalHints removed - keyboard shortcuts now active (arrow keys + ESC) */}

        <div className="h-screen relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex flex-col">
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
                scale: [1, 1.5, 1],
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
          className="flex-shrink-0 relative overflow-hidden bg-gradient-to-r from-black/20 via-amber-950/5 to-black/20 border-b border-amber-900/3 backdrop-blur-sm"
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

          <div className="relative max-w-7xl mx-auto px-4 py-1.5">
            <div className="flex items-center justify-between">
              {/* Left: SOULLAB Logo with Holoflower */}
              <div className="flex items-center gap-2 ml-0 sm:ml-12">
                <img
                  src="/holoflower-amber.png"
                  alt="Holoflower"
                  className="w-5 h-5 sm:w-6 sm:h-6 opacity-100 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
                  style={{ filter: 'brightness(1.2)' }}
                />
                <h1 className="text-base sm:text-lg font-light text-amber-300/90 tracking-wider">
                  SOULLAB
                </h1>
              </div>

              {/* Center: Voice/Text toggle + Mode selector */}
              <div className="flex items-center gap-3">
                {/* Voice/Text Toggle - Clickable */}
                <button
                  onClick={() => setShowChatInterface(!showChatInterface)}
                  className="px-3 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                >
                  <span className="text-xs text-amber-300/90 font-light">
                    {showChatInterface ? '💬 Text' : '🎤 Voice'}
                  </span>
                </button>

                {/* Mode Selector: Dialogue / Patient / Scribe */}
                <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5">
                  <button
                    onClick={() => setMaiaMode('normal')}
                    className={`px-2 py-1 rounded text-xs font-light transition-all ${
                      maiaMode === 'normal'
                        ? 'bg-amber-500/30 text-amber-200'
                        : 'text-amber-400/60 hover:text-amber-300/80'
                    }`}
                  >
                    Dialogue
                  </button>
                  <button
                    onClick={() => setMaiaMode('patient')}
                    className={`px-2 py-1 rounded text-xs font-light transition-all ${
                      maiaMode === 'patient'
                        ? 'bg-purple-500/30 text-purple-200'
                        : 'text-amber-400/60 hover:text-amber-300/80'
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    onClick={() => setMaiaMode('session')}
                    className={`px-2 py-1 rounded text-xs font-light transition-all ${
                      maiaMode === 'session'
                        ? 'bg-blue-500/30 text-blue-200'
                        : 'text-amber-400/60 hover:text-amber-300/80'
                    }`}
                  >
                    Scribe
                  </button>
                </div>
              </div>

              {/* Right: Sign Out + Session Container buttons */}
              <div className="flex items-center gap-2">
                {/* Sign Out Button */}
                <motion.button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-red-500/10 hover:bg-red-500/20
                           border border-red-500/20 hover:border-red-500/40
                           text-red-400 text-xs font-light transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </motion.button>
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
              initialMode={maiaMode}
              onModeChange={setMaiaMode}
              apiEndpoint="/api/between/chat"
              consciousnessType="maia"
              initialShowChatInterface={showChatInterface}
              onShowChatInterfaceChange={setShowChatInterface}
              showSessionSelector={showSessionSelector}
              onCloseSessionSelector={() => setShowSessionSelector(false)}
              onSessionActiveChange={setHasActiveSession}
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
                  onClick={() => setShowDashboard(false)}
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
                        onClick={() => setShowDashboard(false)}
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
      </SwipeNavigation>
    </ErrorBoundary>
  );
}