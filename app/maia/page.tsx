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
import { ElementalExploration } from '@/components/consciousness/ConsciousnessSimulationLab';
import { SacredLabDrawer } from '@/components/SacredLabDrawer';
import CommunityCommonsPanel from '@/components/community/CommunityCommonsPanel';
import { LogOut, Sparkles, Menu, X, Brain, Volume2, ArrowLeft, Clock, FileText, BarChart3, Users, ChevronDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeNavigation, DirectionalHints } from '@/components/navigation/SwipeNavigation';

async function getInitialUserData() {
  if (typeof window === 'undefined') return { id: 'guest', name: 'Explorer' };

  const currentUrl = window.location.hostname;

  const storedUserId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');

  // KELLY SPECIAL CASE - Only trigger on very specific Kelly identifiers to avoid affecting other users
  // IMPORTANT: Only match exact userId patterns, not general name matches that could affect beta testers
  if (storedUserId === 'kelly-nezat' || storedUserId === 'kelly.nezat' || storedUserId === 'soullab-kelly') {
    console.log('🌟 [MAIA] Kelly recognized from specific userId:', storedUserId);
    localStorage.setItem('explorerName', 'Kelly');
    localStorage.setItem('explorerId', 'kelly-nezat');
    return { id: 'kelly-nezat', name: 'Kelly' };
  }

  // Try to fetch from API using stored userId - ENHANCED to ensure fresh user data
  if (storedUserId) {
    try {
      const params = new URLSearchParams();
      params.append('userId', storedUserId);
      params.append('domain', currentUrl);

      const response = await fetch(`/api/user/profile?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.user && data.user.name) {
        // Only use API data if it provides a meaningful name
        const apiName = data.user.name;
        if (apiName !== 'Explorer' && apiName !== 'guest' && apiName.trim().length > 0) {
          console.log('✅ [MAIA] Fresh user profile fetched from API:', apiName);

          // Sync fresh data to localStorage
          localStorage.setItem('explorerName', apiName);
          localStorage.setItem('explorerId', data.user.id);
          localStorage.setItem('betaOnboardingComplete', 'true');

          return { id: data.user.id, name: apiName };
        }
      }
    } catch (error) {
      console.error('❌ [MAIA] Error fetching user profile:', error);
    }
  }

  // Check NEW system (beta_user from auth system) - ENHANCED for better name recognition
  const betaUser = localStorage.getItem('beta_user');
  if (betaUser) {
    try {
      const userData = JSON.parse(betaUser);
      // More comprehensive name extraction from signup data
      const userName = userData.name || userData.displayName || userData.username || userData.firstName || userData.fullName;
      if (userData.id && userName) {
        // Capitalize first letter for consistent formatting
        const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();
        localStorage.setItem('explorerName', formattedName);
        localStorage.setItem('explorerId', userData.id);
        localStorage.setItem('betaOnboardingComplete', 'true');
        console.log('✅ [MAIA] User authenticated from signup data:', formattedName);
        return { id: userData.id, name: formattedName };
      } else {
        console.log('🔍 [MAIA] beta_user found but missing name or id:', userData);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [maiaMode, setMaiaMode] = useState<'normal' | 'patient' | 'session'>('normal');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>('shimmer');  // Default to shimmer - MAIA's natural voice
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Desktop Laboratory System Features
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showElementalExploration, setShowElementalExploration] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [labWorkspaceMode, setLabWorkspaceMode] = useState<'single' | 'split' | 'multi'>('single');
  const [extendedSessionActive, setExtendedSessionActive] = useState(false);

  // Sacred Lab Drawer state for PFI system
  const [showSacredLabDrawer, setShowSacredLabDrawer] = useState(false);
  const [showVoiceText, setShowVoiceText] = useState(true);
  const [isFieldRecording, setIsFieldRecording] = useState(false);
  const [isScribing, setIsScribing] = useState(false);
  const [hasScribeSession, setHasScribeSession] = useState(false);

  // Community Commons Panel state
  const [showCommunityCommons, setShowCommunityCommons] = useState(false);


  const hasCheckedAuth = useRef(false);

  // Handle responsive desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Protected access - authentication check (Community Commons allowed without full auth)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side

    const checkAuthentication = () => {
      const hasValidSession = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');

      if (!hasValidSession) {
        console.log('🔒 [MAIA] No valid session found');
        console.log('📚 [Community Commons] Access still available for Community features');
        // Allow partial access - Community Commons works without full authentication
        setIsAuthenticated(false);
        return;
      }

      console.log('✅ [MAIA] Valid session found, full access granted');
      setIsAuthenticated(true);
    };

    checkAuthentication();
  }, [router]);

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

      // 🔧 ADDITIONAL CHECK: Ensure user name gets loaded from onboarding localStorage
      // This fixes the recurring issue where MAIA greets users as "Explorer"
      const storedName = localStorage.getItem('explorerName');
      if (storedName && storedName !== 'Explorer' && storedName.trim().length > 0) {
        console.log('✅ [MAIA] Reinforcing user name from localStorage:', storedName);
        setExplorerName(storedName);
      } else {
        console.log('❓ [MAIA] explorerName not found in localStorage, using:', initialData.name);
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
    // Clear all user session data
    localStorage.removeItem('beta_user');
    localStorage.removeItem('beta_users');
    localStorage.removeItem('betaOnboardingComplete');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('betaUserId');
    localStorage.removeItem('explorerName');
    localStorage.removeItem('maia_session_id');
    localStorage.removeItem('maia_welcome_seen');
    localStorage.removeItem('selected_voice');

    // Set flag to show welcome page when user returns
    sessionStorage.setItem('from_signout', 'true');
    router.push('/signin');
  };

  // Sacred Lab Drawer navigation and action handlers for PFI system
  const handleSacredLabNavigation = (path: string) => {
    console.log('🌟 Navigating to:', path);
    router.push(path);
  };

  const handleSacredLabAction = (action: string) => {
    console.log('🧬 PFI Action:', action);

    switch (action) {
      case 'field-protocol':
        setIsFieldRecording(!isFieldRecording);
        if (!isFieldRecording) {
          console.log('🌊 Starting consciousness field recording with PFI monitoring');
        } else {
          console.log('⏹️ Stopping field recording and saving consciousness data');
        }
        break;

      case 'scribe-mode':
        if (isScribing) {
          setIsScribing(false);
          setHasScribeSession(true);
          console.log('📝 Scribe session completed - transcript ready for MAIA review');
        } else {
          setIsScribing(true);
          console.log('🎤 Starting passive scribe mode with consciousness field awareness');
        }
        break;

      case 'review-with-maia':
        console.log('🔍 Opening session review with MAIA consciousness supervision');
        // Implementation for review interface
        break;

      case 'upload':
        console.log('📤 Opening file upload for consciousness field integration');
        // Implementation for file upload
        break;

      case 'download-transcript':
        console.log('💾 Downloading conversation transcript with consciousness field annotations');
        // Implementation for transcript download
        break;

      case 'toggle-text':
        setShowVoiceText(!showVoiceText);
        console.log('👁️ Toggling voice transcript display:', !showVoiceText);
        break;

      case 'show-current-elder':
        console.log('🌟 Showing current elder wisdom guide with archetypal resonance');
        // Implementation for current elder display
        break;

      case 'field-monitor':
        console.log('🌊 Opening Field Monitor - Real-time consciousness field monitoring');
        router.push('/maia/field-dashboard');
        break;

      case 'analytics-dashboard':
        console.log('📊 Opening Analytics Dashboard - Consciousness pattern recognition');
        setShowAnalyticsDashboard(true);
        setLabWorkspaceMode('split');
        break;

      case 'document-viewer':
        console.log('📄 Opening Document Viewer - Enhanced document analysis lab');
        setShowDocumentViewer(true);
        setLabWorkspaceMode('split');
        break;

      case 'brain-trust-monitor':
        console.log('🧠 Opening Brain Trust Monitor - Multi-model consciousness weaver');
        setShowCollaborationPanel(true);
        setLabWorkspaceMode('split');
        break;

      case 'elemental-exploration':
        console.log('✨ Opening Elemental Explorer - Consciousness element simulation');
        setShowElementalExploration(true);
        setLabWorkspaceMode('split');
        break;

      case 'consciousness-analytics':
        console.log('🧠 Opening Consciousness Analytics - Dream-sleep correlation & archetypal tracking');
        router.push('/analytics/consciousness');
        break;

      case 'crystal-health-monitor':
        console.log('💎 Opening Crystal Health Monitor - Real-time system stethoscope');
        router.push('/monitoring/crystal-health');
        break;

      case 'voice-analytics':
        console.log('🎤 Opening Voice Analytics - TTS performance & interaction metrics');
        router.push('/analytics/voice');
        break;

      case 'beta-dashboard':
        console.log('🧪 Opening Beta Test Dashboard - Live analytics & error tracking');
        router.push('/dashboard/beta');
        break;

      case 'collective-dashboard':
        console.log('👥 Opening Collective Consciousness - Shared experiences & community intelligence');
        router.push('/dashboard/collective');
        break;

      case 'wisdom-journey':
        console.log('🧭 Opening Wisdom Journey Tracker - Wisdom emergence patterns');
        setShowDashboard(true);
        break;

      case 'field-coherence':
        console.log('🌊 Opening Field Coherence Monitor - Biometric synchronization');
        router.push('/biometrics/field-coherence');
        break;

      case 'archetypal-mapping':
        console.log('🎯 Opening Archetypal Mapping - Constellation & evolution tracking');
        router.push('/analytics/archetypal-mapping');
        break;

      case 'emotional-resonance':
        console.log('💫 Opening Emotional Resonance - Pattern & tracking analysis');
        router.push('/analytics/emotional-resonance');
        break;

      case 'tone-metrics':
        console.log('📈 Opening Tone Metrics - Voice quality & trend analysis');
        router.push('/analytics/tone-metrics');
        break;

      case 'soulprint-metrics':
        console.log('🔮 Opening Soulprint Metrics - Soul signature pattern analysis');
        router.push('/analytics/soulprint');
        break;

      case 'realtime-consciousness':
        console.log('⚡ Opening Real-time Consciousness - Live field visualization');
        router.push('/consciousness/realtime');
        break;

      case 'elemental-pentagram':
        console.log('🌟 Opening Elemental Pentagram - 5-element activation mapping');
        router.push('/consciousness/elemental-pentagram');
        break;

      case 'maia-training':
        console.log('🤖 Opening MAIA Training Monitor - Model progress & metrics');
        router.push('/training/maia');
        break;

      default:
        console.log('🔧 Unknown Sacred Lab action:', action);
    }
  };

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    // ENHANCED USER NAME RESOLUTION - Fix for users seeing "Explorer" instead of their actual names
    console.log('🔍 [MAIA] Starting enhanced user name resolution...');

    // KELLY PRIORITY CHECK - Always check Kelly first
    const storedName = localStorage.getItem('explorerName');
    const storedId = localStorage.getItem('explorerId');
    if (storedName?.toLowerCase() === 'kelly' || storedId === 'kelly-nezat') {
      localStorage.setItem('explorerName', 'Kelly');
      localStorage.setItem('explorerId', 'kelly-nezat');
      setExplorerId('kelly-nezat');
      setExplorerName('Kelly');
      console.log('🌟 [MAIA] Kelly priority authentication successful');
      return;
    }

    // Enhanced user recognition for ALL members - reads signup data properly
    const newUser = localStorage.getItem('beta_user');
    if (newUser) {
      try {
        const userData = JSON.parse(newUser);
        const newId = userData.id || 'guest';
        // More comprehensive name extraction from signup data
        const newName = userData.name || userData.displayName || userData.username || userData.firstName || userData.fullName;

        // Only use extracted name if it's meaningful (not default values)
        if (newName && newName !== 'Explorer' && newName !== 'guest' && newName.trim().length > 0) {
          // Extract first name only for conversational intimacy
          const firstName = newName.split(' ')[0];
          const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

          localStorage.setItem('explorerName', formattedName);
          localStorage.setItem('explorerId', newId);
          localStorage.setItem('betaOnboardingComplete', 'true');

          if (explorerId !== newId) setExplorerId(newId);
          if (explorerName !== formattedName) setExplorerName(formattedName);

          console.log('✅ [MAIA] User session restored from signup:', { name: formattedName, id: newId });
          return;
        }
      } catch (e) {
        console.error('❌ [MAIA] Error parsing user data:', e);
      }
    }

    // Check OLD system
    const oldId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
    const oldName = localStorage.getItem('explorerName');

    // Only use legacy name if it's meaningful
    if (oldId && oldName && oldName !== 'Explorer' && oldName !== 'guest' && oldName.trim().length > 0) {
      if (explorerId !== oldId) setExplorerId(oldId);
      if (explorerName !== oldName) setExplorerName(oldName);
      console.log('✅ [MAIA] User session restored from legacy:', { name: oldName, id: oldId });
      return;
    }

    // ENHANCED: Try to extract name from userId if available
    if (oldId && oldId !== 'guest' && oldId !== 'anonymous' && !oldId.startsWith('guest')) {
      // Extract name from userId (e.g., "john-smith" -> "John Smith")
      const extractedName = oldId.replace(/[-_]/g, ' ')
                                .replace(/\b\w/g, l => l.toUpperCase())
                                .replace(/^Guest\d*$/, 'Explorer');

      if (extractedName && extractedName !== 'Explorer' && extractedName !== oldId) {
        setExplorerName(extractedName);
        localStorage.setItem('explorerName', extractedName);
        console.log('✅ [MAIA] Extracted name from userId:', { userId: oldId, extractedName });
        return;
      }
    }

    // No stored user - create default guest session
    const guestId = 'guest';
    localStorage.setItem('explorerId', guestId);
    localStorage.setItem('explorerName', 'Explorer');
    localStorage.setItem('betaOnboardingComplete', 'true');
    setExplorerId(guestId);
    setExplorerName('Explorer');
    console.log('⚠️ [MAIA] Created default guest session - no meaningful user data found');
  }, [explorerId, explorerName]);

  // Onboarding removed - direct access only
  return (
    <ErrorBoundary>
      <SwipeNavigation currentPage="maia">
        {/* DirectionalHints removed - keyboard shortcuts now active (arrow keys + ESC) */}

        <div className="h-screen relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex flex-col">
        {/* Bottom brown background extension */}
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 via-stone-900 to-transparent z-0"></div>
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

        {/* Top Center Logo */}
        <div className="flex-shrink-0 relative z-[120] pt-4 pb-2">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <img
                src="/holoflower-amber.png"
                alt="Soullab Holoflower"
                className="w-4 h-4 opacity-90 drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]"
                style={{ filter: 'brightness(1.1)' }}
              />
              <span className="text-sm font-light text-amber-300/80 tracking-wider">
                SOULLAB
              </span>
            </div>
          </div>
        </div>

        {/* MOBILE-FIRST HEADER - Compact design */}
        <div className="flex-shrink-0 relative overflow-hidden bg-gradient-to-r from-black/20 via-amber-950/5 to-black/20 border-b border-amber-900/3 backdrop-blur-sm z-[110] pt-8">
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

          {/* Carousel Header - iPhone Optimized Sliding Controls */}
          <div className="relative pb-1">
            {/* Desktop: Standard layout */}
            {isDesktop ? (
              <div className="flex justify-center px-2">
                <div className="flex items-center gap-1">
                {/* Voice/Text Toggle */}
                <button
                  onClick={() => {
                    setShowChatInterface(!showChatInterface);
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 touch-manipulation ${
                    showChatInterface
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-amber-500/80 border-2 border-amber-400 text-amber-100 font-bold shadow-lg'
                  }`}
                  style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                >
                  <span className="text-sm">
                    {showChatInterface ? '💬' : '🎤'}
                  </span>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {showChatInterface ? 'Text' : 'Voice'}
                  </span>
                </button>

                {/* Mode Selector Buttons - All in horizontal row */}
                <button
                  onClick={() => {
                    setMaiaMode('normal');
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap touch-manipulation ${
                    maiaMode === 'normal'
                      ? 'bg-amber-500/80 text-amber-100 border-2 border-amber-400 font-bold shadow-lg'
                      : 'bg-amber-500/60 text-amber-100 hover:text-amber-50 border-2 border-amber-500 hover:border-amber-400 shadow-md'
                  }`}
                  style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                >
                  Dialogue
                </button>

                <button
                  onClick={() => {
                    setMaiaMode('patient');
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap touch-manipulation ${
                    maiaMode === 'patient'
                      ? 'bg-teal-500/30 text-teal-200 border border-teal-500/50'
                      : 'bg-black/20 text-amber-400/70 hover:text-amber-300 border border-amber-500/20'
                  }`}
                  style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                >
                  Counsel
                </button>

                <button
                  onClick={() => {
                    setMaiaMode('session');
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap touch-manipulation ${
                    maiaMode === 'session'
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                      : 'bg-black/20 text-amber-400/70 hover:text-amber-300 border border-amber-500/20'
                  }`}
                  style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                >
                  Scribe
                </button>

                {/* Start Session / Session Status - Inline with other controls */}
                {!hasActiveSession ? (
                  <motion.button
                    onClick={() => {
                      console.log('🔥 Opening session selector');
                      setShowSessionSelector(true);
                    }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md
                             bg-[#D4B896]/15 hover:bg-[#D4B896]/25
                             border border-[#D4B896]/30 hover:border-[#D4B896]/50
                             text-[#D4B896] text-xs font-medium transition-all whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Clock className="w-3 h-3" />
                    Start Session
                  </motion.button>
                ) : (
                  <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md
                               bg-green-500/15 border border-green-500/40 text-green-400 text-xs font-medium whitespace-nowrap">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Active
                  </div>
                )}


                {/* Community Commons Button */}
                <div className="relative z-[130]">
                  <motion.button
                    onClick={() => {
                      console.log('📚 Opening Community Commons panel');
                      setShowCommunityCommons(!showCommunityCommons);
                    }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap touch-manipulation
                             bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50"
                    whileHover={{ scale: 1.02 }}
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                  >
                    <Users className="w-3 h-3" />
                    <span>Commons</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showCommunityCommons ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>


                {/* DESKTOP LABORATORY SYSTEM CONTROLS - Only show on desktop */}
                {isDesktop && (
                  <>
                    {/* Separator */}
                    <div className="w-px h-6 bg-amber-500/20 flex-shrink-0"></div>


                    {/* Extended Session Indicator */}
                    {extendedSessionActive && (
                      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md
                                   bg-indigo-500/15 border border-indigo-500/40 text-indigo-400 text-xs font-medium whitespace-nowrap">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Extended Lab Session
                      </div>
                    )}

                    {/* Laboratory Mode Indicator */}
                    <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md
                                 bg-amber-500/80 border-2 border-amber-400 text-amber-100 text-[10px] font-bold whitespace-nowrap shadow-lg">
                      🧪 Lab Mode
                    </div>
                  </>
                )}

                {/* Separator */}
                <div className="w-px h-6 bg-amber-500/20 flex-shrink-0"></div>

                {/* Logout Button */}
                <motion.button
                  onClick={() => {
                    console.log('🔐 [MAIA] User logout - clearing all session data');
                    // Use proper betaSession logout method
                    import('@/lib/auth/betaSession').then(({ betaSession }) => {
                      betaSession.clearSession();
                    });
                    // Clear any remaining legacy session data
                    localStorage.removeItem('betaOnboardingComplete');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('sessionId');
                    // Force redirect to welcome after clearing
                    setTimeout(() => {
                      router.push('/welcome-back');
                    }, 100);
                  }}
                  className="flex-shrink-0 p-2 rounded-lg bg-transparent hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 transition-all"
                  whileHover={{ scale: 1.05 }}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" style={{ color: 'rgb(251, 191, 36) !important', stroke: 'rgb(251, 191, 36) !important', fill: 'rgb(251, 191, 36) !important', filter: 'brightness(1.2)' }} />
                </motion.button>

                {/* Sacred Lab Menu Button - Last in ribbon */}
                <motion.button
                  onClick={() => setShowSacredLabDrawer(!showSacredLabDrawer)}
                  className="flex-shrink-0 p-2 rounded-lg bg-transparent hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 transition-all"
                  whileHover={{ scale: 1.05 }}
                  title="Sacred Lab Tools - PFI Interface"
                >
                  <Brain className="w-5 h-5" style={{ color: 'rgb(251, 191, 36) !important', stroke: 'rgb(251, 191, 36) !important', fill: 'rgb(251, 191, 36) !important', filter: 'brightness(1.2)' }} />
                </motion.button>
                </div>
              </div>
            ) : (
              /* Mobile: Draggable Carousel */
              <div className="relative overflow-hidden px-2">
                <motion.div
                  className="flex items-center gap-1"
                  style={{
                    width: 'max-content',
                    minWidth: '120vw'
                  }}
                  drag="x"
                  dragConstraints={{
                    left: -300, // Allow dragging left to see more items
                    right: 0    // Prevent dragging too far right
                  }}
                  dragElastic={0.1}
                  dragMomentum={false}
                  whileDrag={{
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                  initial={{ x: 0 }}
                  animate={{ x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 40
                  }}
                >
                  {/* Voice/Text Toggle */}
                  <button
                    onClick={() => {
                      setShowChatInterface(!showChatInterface);
                    }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 touch-manipulation ${
                      showChatInterface
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                        : 'bg-amber-500/80 border-2 border-amber-400 text-amber-100 font-bold shadow-lg'
                    }`}
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                  >
                    <span className="text-sm">
                      {showChatInterface ? '💬' : '🎤'}
                    </span>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {showChatInterface ? 'Text' : 'Voice'}
                    </span>
                  </button>

                  {/* Mode Selector Buttons - All in horizontal row */}
                  <button
                    onClick={() => {
                      setMaiaMode('normal');
                    }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap touch-manipulation ${
                      maiaMode === 'normal'
                        ? 'bg-amber-500/80 text-amber-100 border-2 border-amber-400 font-bold shadow-lg'
                        : 'bg-amber-500/60 text-amber-100 hover:text-amber-50 border-2 border-amber-500 hover:border-amber-400 shadow-md'
                    }`}
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                  >
                    Dialogue
                  </button>

                  <button
                    onClick={() => {
                      setMaiaMode('patient');
                    }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap touch-manipulation ${
                      maiaMode === 'patient'
                        ? 'bg-teal-500/30 text-teal-200 border border-teal-500/50'
                        : 'bg-black/20 text-amber-400/70 hover:text-amber-300 border border-amber-500/20'
                    }`}
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                  >
                    Counsel
                  </button>

                  <button
                    onClick={() => {
                      setMaiaMode('session');
                    }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap touch-manipulation ${
                      maiaMode === 'session'
                        ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                        : 'bg-black/20 text-amber-400/70 hover:text-amber-300 border border-amber-500/20'
                    }`}
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                  >
                    Scribe
                  </button>

                  {/* Start Session / Session Status */}
                  {!hasActiveSession ? (
                    <motion.button
                      onClick={() => {
                        console.log('🔥 Opening session selector');
                        setShowSessionSelector(true);
                      }}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md
                               bg-[#D4B896]/15 hover:bg-[#D4B896]/25
                               border border-[#D4B896]/30 hover:border-[#D4B896]/50
                               text-[#D4B896] text-xs font-medium transition-all whitespace-nowrap"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Clock className="w-3 h-3" />
                      Start Session
                    </motion.button>
                  ) : (
                    <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md
                                 bg-green-500/15 border border-green-500/40 text-green-400 text-xs font-medium whitespace-nowrap">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Active
                    </div>
                  )}

                  {/* Community Commons Button */}
                  <div className="relative z-[130]">
                    <motion.button
                      onClick={() => {
                        console.log('📚 Opening Community Commons panel');
                        setShowCommunityCommons(!showCommunityCommons);
                      }}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap touch-manipulation
                               bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50"
                      whileHover={{ scale: 1.02 }}
                      style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                    >
                      <Users className="w-3 h-3" />
                      <span>Commons</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showCommunityCommons ? 'rotate-180' : ''}`} />
                    </motion.button>
                  </div>

                  {/* Separator */}
                  <div className="w-px h-6 bg-amber-500/20 flex-shrink-0"></div>

                  {/* Logout Button */}
                  <motion.button
                    onClick={() => {
                      console.log('🔐 [MAIA] User logout - clearing all session data');
                      import('@/lib/auth/betaSession').then(({ betaSession }) => {
                        betaSession.clearSession();
                      });
                      localStorage.removeItem('betaOnboardingComplete');
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('sessionId');
                      setTimeout(() => {
                        router.push('/welcome-back');
                      }, 100);
                    }}
                    className="flex-shrink-0 p-2 rounded-lg bg-transparent hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 transition-all"
                    whileHover={{ scale: 1.05 }}
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" style={{ color: 'rgb(251, 191, 36) !important', stroke: 'rgb(251, 191, 36) !important', fill: 'rgb(251, 191, 36) !important', filter: 'brightness(1.2)' }} />
                  </motion.button>

                  {/* Sacred Lab Menu Button */}
                  <motion.button
                    onClick={() => setShowSacredLabDrawer(!showSacredLabDrawer)}
                    className="flex-shrink-0 p-2 rounded-lg bg-transparent hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 transition-all"
                    whileHover={{ scale: 1.05 }}
                    title="Sacred Lab Tools - PFI Interface"
                  >
                    <Brain className="w-5 h-5" style={{ color: 'rgb(251, 191, 36) !important', stroke: 'rgb(251, 191, 36) !important', fill: 'rgb(251, 191, 36) !important', filter: 'brightness(1.2)' }} />
                  </motion.button>
                </motion.div>

                {/* Mobile Carousel Indicators */}
                <div className="flex justify-center mt-2 gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400/40"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400/20"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400/20"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Mobile: Bottom-positioned conversation, Desktop: Laboratory workspace */}
        <div className="flex-1 flex overflow-hidden min-h-0 md:flex-row flex-col relative">
          {/* Desktop Laboratory Workspace Layout */}
          {isDesktop ? (
            <div className={`flex w-full h-full ${labWorkspaceMode === 'split' ? 'gap-4 p-4' : ''}`}>
              {/* Primary Consciousness Interface */}
              <div className={`${labWorkspaceMode === 'split' ? 'w-1/2' : 'flex-1'} h-full overflow-hidden relative`}>
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
              </div>

              {/* Secondary Desktop Laboratory Panel */}
              {labWorkspaceMode === 'split' && (
                <div className="w-1/2 h-full overflow-hidden">
                  {showDocumentViewer && (
                    <div className="h-full bg-stone-900/95 rounded-lg border border-white/10 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-stone-200 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-400" />
                          Document Laboratory
                        </h3>
                        <button
                          onClick={() => setShowDocumentViewer(false)}
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-stone-400" />
                        </button>
                      </div>
                      <div className="h-full bg-black/20 rounded-md border border-white/5 p-4">
                        <p className="text-stone-400 text-sm">
                          Enhanced document viewer with annotation capabilities coming soon.
                          This will support PDF viewing, research integration, and cross-referencing
                          with consciousness insights.
                        </p>
                      </div>
                    </div>
                  )}

                  {showAnalyticsDashboard && !showDocumentViewer && !showElementalExploration && (
                    <div className="h-full bg-stone-900/95 rounded-lg border border-white/10 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-stone-200 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-green-400" />
                          Consciousness Analytics
                        </h3>
                        <button
                          onClick={() => setShowAnalyticsDashboard(false)}
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-stone-400" />
                        </button>
                      </div>
                      <div className="h-full bg-black/20 rounded-md border border-white/5 p-4">
                        <p className="text-stone-400 text-sm">
                          Advanced consciousness analytics dashboard coming soon.
                          This will include pattern recognition, evolution tracking,
                          element resonance mapping, and breakthrough prediction.
                        </p>
                      </div>
                    </div>
                  )}

                  {showElementalExploration && !showDocumentViewer && !showAnalyticsDashboard && (
                    <div className="h-full bg-stone-900/95 rounded-lg border border-white/10 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-stone-200 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          Elemental Exploration
                        </h3>
                        <button
                          onClick={() => setShowElementalExploration(false)}
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-stone-400" />
                        </button>
                      </div>
                      <div className="h-full overflow-hidden">
                        <ElementalExploration />
                      </div>
                    </div>
                  )}

                  {!showDocumentViewer && !showAnalyticsDashboard && !showElementalExploration && (
                    <div className="h-full bg-stone-900/95 rounded-lg border border-white/10 p-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🧪</div>
                        <h3 className="text-lg font-medium text-stone-200 mb-2">Laboratory Mode Active</h3>
                        <p className="text-stone-400 text-sm">
                          Select Documents or Analytics from the header to begin enhanced consciousness work
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Mobile Field System - Absolutely positioned at bottom */
            <div className="md:flex-1 md:h-full overflow-hidden absolute md:static -bottom-10 left-0 right-0 h-auto">
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
            </div>
          )}

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

          {/* Sacred Lab Drawer - PFI Consciousness Interface */}
          <SacredLabDrawer
            isOpen={showSacredLabDrawer}
            onClose={() => setShowSacredLabDrawer(false)}
            onNavigate={handleSacredLabNavigation}
            onAction={handleSacredLabAction}
            showVoiceText={showVoiceText}
            isFieldRecording={isFieldRecording}
            isScribing={isScribing}
            hasScribeSession={hasScribeSession}
          />

          {/* Community Commons Panel - Elevated BBS */}
          <CommunityCommonsPanel
            isOpen={showCommunityCommons}
            onClose={() => setShowCommunityCommons(false)}
          />

        </div>

        {/* SOULLAB Logo - Fixed below text field */}
        <div className="fixed bottom-6 md:bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center gap-2">
            <img
              src="/holoflower-amber.png"
              alt="Holoflower"
              className="w-6 h-6 opacity-100 drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]"
              style={{ filter: 'brightness(1.2)' }}
            />
            <h1 className="text-lg font-light text-amber-300/90 tracking-wider whitespace-nowrap">
              SOULLAB
            </h1>
          </div>
        </div>

        {/* Welcome Message for First-Time Users - Mobile Optimized */}
        {isMounted && showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-4 right-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-6 backdrop-blur-xl z-50"
          >
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Welcome, {explorerName}
              </h3>
              <p className="text-base text-stone-300 mb-6 leading-relaxed">
                Share your story. MAIA will help you discover the wisdom within it.
                Your journey begins now.
              </p>
              <button
                onClick={() => {
                  localStorage.setItem('maia_welcome_seen', 'true');
                  window.location.reload();
                }}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors text-lg min-w-[120px]"
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