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
import { getOrCreateMaiaSessionId } from '@/lib/maia/presence/conversationIdentity';
import { placeFromPathname } from '@/lib/maia/presence/place';
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
import { shouldOpenJournalCapture, urlWithoutJournalParam } from '@/lib/navigation/journalDeepLink';
import { VoiceHelpSheet, TestFlightHelpSheet, HelpHubSheet } from '@/components/help';
import { ShadowWorkSheet } from '@/components/consciousness/ShadowWorkSheet';
import { AcademySheet } from '@/components/academy/AcademySheet';
import FeedbackSheet from '@/components/feedback/FeedbackSheet';
import PasswordChangeSheet from '@/components/auth/PasswordChangeSheet';
import { ChangesSheet } from '@/components/maia/changes/ChangesSheet';
import { useFeatureAccess, useSubscription, membershipUtils } from '@/hooks/useSubscription';
import { useFeatureFlags } from '@/lib/utils/feature-flags-client';
import { deriveShouldRenderArrival, readHasArrivedBefore, recordFirstArrival } from '@/lib/maia/arrivalState';
import { MaiaShell } from '@/components/maia/MaiaShell';
import { MaiaModalManager } from '@/components/maia/MaiaModalManager';
import { AccountDropdown } from '@/components/maia/AccountDropdown';
import { MaiaCenterField } from '@/components/maia/MaiaCenterField';
import { VoiceStateProvider } from '@/lib/maia/voiceStateContext';
import type { MaiaBehavior, VoicePresenceState } from '@/lib/navigation/types';
import { PREMIUM_FEATURES, CONTRIBUTION_SUGGESTIONS, SEVA_PATHWAYS } from '@/lib/subscription/types';
import type { ContributionCircle, SevaPathway } from '@/lib/subscription/types';
import { LogOut, Sparkles, Menu, X, Brain, Volume2, ArrowLeft, Clock, Users, FlaskConical, BookOpen, Lock, User, Settings, Mic, Heart, Gift, Flame, MessageCircle, HelpCircle, Moon, GraduationCap, Briefcase, Wind, GitFork, Scroll, PenLine, Home } from 'lucide-react';
import { FeatureTooltip } from '@/components/help/FeatureTooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeNavigation, DirectionalHints } from '@/components/navigation/SwipeNavigation';
import { FrameworkSelector } from '@/components/framework/FrameworkSelector';
// SyncAccountPrompt removed - was causing unwanted popup
import {
  getCounselFramework,
  getScribeLens,
  getMentorStance,
  setMentorStance,
  type TherapeuticFramework,
  type ReflectionLens,
  THERAPEUTIC_FRAMEWORKS,
  REFLECTION_LENSES,
} from '@/lib/consciousness/therapeuticFrameworks';
import { apiUrl, apiFetch, clearAuthState } from '@/lib/http/apiBase';
import { reportServerIdentityParity } from '@/lib/auth/verifyServerIdentity';

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

// Check if ID is a poisoned local_* fallback that can't be used with server
function isPoisonedLocalId(id: string | null | undefined): boolean {
  if (!id) return false;
  return id.startsWith('local_');
}

// Force sign-out if session is outdated or corrupted
// Returns: 'migrate' (go to /signin), 'fresh' (go to /begin), or null (continue to /maia)
function checkAndMigrateSession(): 'migrate' | 'fresh' | null {
  if (typeof window === 'undefined') return null;

  const storedVersion = localStorage.getItem('maia_session_version');
  const currentName = localStorage.getItem('explorerName');
  const explorerId = localStorage.getItem('explorerId');
  const betaUser = localStorage.getItem('beta_user');
  const signupCompleted = localStorage.getItem('signup_completed');

  // Also check for poisoned local_* IDs from failed onboarding
  let betaUserId: string | null = null;
  try {
    if (betaUser) {
      const parsed = JSON.parse(betaUser);
      betaUserId = parsed.id;
    }
  } catch { /* ignore */ }

  // DEBUG: Log all values for iOS debugging
  console.log('🔍 [MAIA] checkAndMigrateSession:', {
    storedVersion,
    expectedVersion: String(SESSION_VERSION),
    currentName,
    explorerId: explorerId?.slice(0, 8) + '...',
    betaUserId: betaUserId?.slice(0, 8) + '...',
    betaUser: betaUser ? 'present' : 'null',
    signupCompleted,
  });

  // FRESH INSTALL DETECTION: If there's NO session data at all, this is a fresh install.
  // The user needs to go through onboarding at /begin, NOT /signin.
  // Check both explicit keys AND any maia/explorer/beta prefixed keys for extra safety.
  const hasAnySessionData = betaUser || explorerId || signupCompleted ||
    Object.keys(localStorage).some(k =>
      k.startsWith('maia_') || k.startsWith('explorer') || k.startsWith('beta')
    );
  if (!hasAnySessionData) {
    console.log('🆕 [MAIA] Fresh install detected - no session data, redirecting to /begin');
    return 'fresh';
  }

  // Check for poisoned local_* IDs
  const hasLocalId = isPoisonedLocalId(explorerId) || isPoisonedLocalId(betaUserId);
  if (hasLocalId) {
    console.warn('🚨 [MAIA] Detected poisoned local_* ID - clearing and redirecting to /begin');
    localStorage.removeItem('beta_user');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('explorerName');
    localStorage.removeItem('signup_completed');
    return 'fresh';
  }

  // Check for version mismatch (only if there IS session data)
  const versionMismatch = storedVersion !== String(SESSION_VERSION);
  const nameIsUUID = isLikelyUUID(currentName || '');
  const needsMigration = versionMismatch || nameIsUUID;

  if (needsMigration) {
    console.log('🔄 [MAIA] Session migration required - signing out user');
    console.log('🔄 [MAIA] Reasons: versionMismatch=' + versionMismatch + ', nameIsUUID=' + nameIsUUID);
    // Clear session data but preserve permanent markers
    localStorage.removeItem('beta_user');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('explorerName');
    localStorage.removeItem('betaOnboardingComplete');
    // Set new version
    localStorage.setItem('maia_session_version', String(SESSION_VERSION));
    return 'migrate'; // Needs redirect to sign-in (existing user, bad session)
  }

  return null; // Session is valid, continue to /maia
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

// Check if an ID is a valid member identifier (not a placeholder or local_* fallback)
function isValidMemberId(id: string | null | undefined): boolean {
  if (!id) return false;
  if (id === 'guest' || id.startsWith('guest_') || id === 'anonymous') return false;
  // CRITICAL: Reject local_* fallback IDs that can't be used with server
  if (id.startsWith('local_')) return false;
  return true;
}

async function getInitialUserData() {
  if (typeof window === 'undefined') return { id: 'guest', name: 'Friend' };

  const currentUrl = window.location.hostname;

  // 🛡️ EARLY CHECK: If we already have a valid preferred name, use it
  // This prevents API failures from overwriting good data
  const existingPreferredName = localStorage.getItem('explorerPreferredName');
  const existingId = localStorage.getItem('explorerId');
  if (existingPreferredName &&
      existingPreferredName.trim() &&
      existingPreferredName.toLowerCase() !== 'friend' &&
      !isLikelyUUID(existingPreferredName) &&
      existingId &&
      isValidMemberId(existingId)) {
    console.log('🛡️ [MAIA] Using existing preferred name from localStorage:', existingPreferredName);
    return { id: existingId, name: existingPreferredName };
  }

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

      const response = await apiFetch(`/api/user/profile?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.user) {
        // Priority: preferredName > name > username (preferredName is what user wants to be called)
        const validName = getValidDisplayName(
          data.user.preferredName || data.user.name,
          data.user.username
        );
        console.log('✅ [MAIA] User profile fetched from API:', validName, '(preferredName:', data.user.preferredName, ')');
        console.log('🔍 [MAIA] API response:', JSON.stringify(data.user));

        // 🛡️ DON'T overwrite existing good data with guest/Friend data from failed API lookup
        if (data.user.isGuest || validName === 'Friend') {
          console.log('⚠️ [MAIA] API returned guest data - preserving existing localStorage');
          // Don't overwrite - fall through to check beta_user
        } else {
          // Sync to localStorage only if we got real user data
          localStorage.setItem('explorerName', validName);
          localStorage.setItem('explorerPreferredName', validName);
          localStorage.setItem('explorerId', data.user.id);
          console.log('🔍 [MAIA] Wrote to localStorage: explorerName=' + validName);
          localStorage.setItem('betaOnboardingComplete', 'true');
          // PERMANENT marker that NEVER gets removed, even on signout
          localStorage.setItem('maiaPermanentUser', 'true');

          return { id: data.user.id, name: validName };
        }
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
  const { flags: featureFlags } = useFeatureFlags();

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
  // NOTE: Initialize name as '' (not 'Friend') so greeting shows "Good morning" without a bogus label
  // The real name loads async via getInitialUserData() and updates before greeting renders
  const [explorerId, setExplorerId] = useState('guest');
  const [explorerName, setExplorerName] = useState('');
  const [userBirthDate, setUserBirthDate] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [maiaMode, setMaiaMode] = useState<'normal' | 'patient' | 'session'>('normal');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('maia_core');  // Sovereign voice identity
  const [voiceSpeed, setVoiceSpeed] = useState(0.95);  // TTS speed (0.25 - 4.0)
  const [voiceModel, setVoiceModel] = useState<string>('maia_core');  // Sovereign voice model
  const [voiceVolume, setVoiceVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maia_voice_volume');
      return saved ? parseFloat(saved) : 1.0;
    }
    return 1.0;
  });  // Voice playback volume (0.0 - 1.0)
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [askMode, setAskMode] = useState(false); // Ask MAIA — orientation + Knowledge Field stance
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  // Arrival state — TWO states, deliberately not one.
  //
  // Ruling (Kelly, 2026-07-22):
  //
  //   Returning to Arrival is opening a room, not undoing an initiation.
  //
  // Collapsing these into a single boolean is the ambiguity this model exists to
  // prevent: it would make "the member is looking at Arrival right now" and "the
  // member has never crossed before" the same fact, so a deliberate return would
  // have to erase the first crossing to render the room.
  //
  //   hasArrivedBefore — DURABLE. The first crossing, persisted in localStorage
  //                      under 'maia_has_arrived'. Written once, never cleared.
  //   arrivalInvoked   — TEMPORARY. The member asked for Arrival in this session,
  //                      via The House. Never persisted; dies with the tab.
  //
  // Default hasArrivedBefore=true is the SSR-safe returning surface: the majority
  // never sees a flash of Arrival before the marker is read.
  const [hasArrivedBefore, setHasArrivedBefore] = useState(true);
  const [arrivalInvoked, setArrivalInvoked] = useState(false);
  // #736 — the third member act: crossing the threshold WITHOUT authoring
  // speech ("I'm ready"). Session-temporary like arrivalInvoked; never
  // persisted. It ends the Arrival render for this session while leaving the
  // durable first-crossing marker untouched — activation is not expression
  // (ruling below), so this member still meets the ceremony next visit
  // unless they actually speak.
  const [arrivalCrossedWithoutSpeech, setArrivalCrossedWithoutSpeech] = useState(false);
  useEffect(() => {
    setHasArrivedBefore(readHasArrivedBefore());
  }, []);
  // The one calculated truth. Every consumer — the shell's receding rail, the
  // greeting suppression, the renderer itself — reads THIS, never the raw flag.
  // A first-time member and a member who deliberately returned meet the same room.
  const shouldRenderArrival = deriveShouldRenderArrival({
    arrivalEntryEnabled: featureFlags.arrivalEntry,
    hasArrivedBefore,
    arrivalInvoked,
    crossedWithoutSpeech: arrivalCrossedWithoutSpeech,
  });
  // The House's deliberate return. Opens the room; leaves the first-crossing
  // marker exactly as it was. A member who returns and leaves again is still
  // someone who has arrived before.
  const returnToArrival = useCallback(() => setArrivalInvoked(true), []);
  // #736 — the non-writing exit. Fired by "I'm ready". Clears ONLY the
  // session-temporary states (an invoked return is over once crossed); the
  // durable marker stays exactly as it was, per the ruling below. This is
  // deliberately NOT markArrived — see the ⚠️ under that ruling.
  const crossArrivalWithoutSpeech = useCallback(() => {
    setArrivalCrossedWithoutSpeech(true);
    setArrivalInvoked(false);
  }, []);
  // Ruling (Kelly, 2026-07-22):
  //
  //   A person is no longer arriving once they have spoken into the relationship.
  //
  // Activation is not expression. The invitation click is the member answering
  // MAIA's greeting — "I am willing to begin" — not the start of conversation.
  // Someone who activates, explores The House, and leaves is still arriving, and
  // meets the ceremony again next visit. Nor does arrival wait on MAIA's reply:
  // a member who speaks and closes the laptop before an answer has still crossed.
  //
  // ⚠️ Do NOT wire activation controls to this — not the jewel, not the mic, and
  // not the "I'm ready" button. Wiring any of them here silently collapses the
  // ruling back to option A. ("I'm ready" now exists and exits Arrival via
  // crossArrivalWithoutSpeech above — session-scoped, durable-marker-free —
  // exactly so it never has to touch this. #736)
  //
  // Fired on every member turn, so it must be idempotent AND write-once: the marker
  // records when arrival happened, not when the member last spoke.
  const markArrived = useCallback(() => {
    setHasArrivedBefore(true);
    // Speaking ends an invoked return the same way it ends a first arrival: the
    // room gives way to conversation. Without this, a member who deliberately
    // returned would stay on the Arrival surface while talking.
    setArrivalInvoked(false);
    recordFirstArrival();
  }, []);
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
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showChangesSheet, setShowChangesSheet] = useState(false);

  // Framework selector state (long-press on Care/Note tabs)
  const [showFrameworkSelector, setShowFrameworkSelector] = useState(false);
  const [frameworkSelectorMode, setFrameworkSelectorMode] = useState<'counsel' | 'scribe'>('counsel');
  const [currentCounselFramework, setCurrentCounselFramework] = useState<TherapeuticFramework>('auto');
  const [currentScribeLens, setCurrentScribeLens] = useState<ReflectionLens>('auto');
  const [mentorStanceEnabled, setMentorStanceEnabled] = useState(false);

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
      const sessionCheck = checkAndMigrateSession();
      if (sessionCheck === 'fresh') {
        console.log('[NAV] /maia -> /begin (reason: fresh install)');
        router.replace('/signin');
        return;
      }
      if (sessionCheck === 'migrate') {
        console.log('[NAV] /maia -> /signin (reason: session migration)');
        router.replace('/signin');
        return;
      }

      // Load user data first (needed for session registration)
      const initialData = await getInitialUserData();

      // 🔎 IDENTITY PARITY (2026-08-24, iOS memory-context divergence).
      // Ask the server whether it recognizes this device, and compare with what
      // localStorage believes. On the web the cookie + middleware keep the two
      // in step; on iOS neither exists, so a device with a stale/absent
      // `maia_session_token` can look signed in while every turn resolves to an
      // anonymous caller — MAIA converses normally and recalls nothing.
      // Non-blocking and non-destructive: this only observes and logs
      // (`[identity] parity`). It never clears credentials and never redirects,
      // so an offline boot cannot sign a member out of their own device.
      reportServerIdentityParity().catch(() => { /* never blocks arrival */ });

      // Get or create persistent sessionId via the CANONICAL identity module
      // (lib/maia/presence/conversationIdentity) — the same module the global
      // MaiaPresence provider uses, so the full page and the presence sheet
      // can never mint competing sessions. Daily rotation semantics unchanged.
      const priorSessionId = localStorage.getItem('maia_session_id');
      const identity = getOrCreateMaiaSessionId();
      if (identity && !identity.isNew) {
        setSessionId(identity.sessionId);
        console.log('💫 [MAIA] Restored session:', identity.sessionId);
        // Touch the session to update last_activity_at (non-blocking)
        apiFetch('/api/maia/session/start', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: identity.sessionId,
            memberId: initialData?.id,
          }),
        }).catch(() => {}); // Ignore errors for touch
      } else if (identity) {
        // New day or no session - create fresh session and clear old conversation
        const newSessionId = identity.sessionId;
        setSessionId(newSessionId);

        // Register session with backend (non-blocking but important for finalize)
        apiFetch('/api/maia/session/start', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: newSessionId,
            memberId: initialData?.id,
            privacyMode: 'standard',
            maiaMode: 'normal',
          }),
        }).then((res) => {
          if (res.ok) {
            console.log('✅ [MAIA] Session registered with backend');
          } else {
            console.warn('⚠️ [MAIA] Session registration failed (will retry on finalize)');
          }
        }).catch((err) => {
          console.warn('⚠️ [MAIA] Session registration error:', err);
        });

        // Clear old conversation from localStorage for clean slate
        if (priorSessionId && priorSessionId !== newSessionId) {
          localStorage.removeItem(`maia_conversation_${priorSessionId}`);
          console.log('🌅 [MAIA] New day - cleared old conversation, starting fresh');
        }
        console.log('✨ [MAIA] Created new session:', newSessionId);
      }
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
      if (!week0Complete && initialData.name && initialData.name !== 'Friend') {
        // Show onboarding for new users (but not for guest/default users)
        setShowWeekZeroOnboarding(true);
        console.log('🌱 [MAIA] Week 0 onboarding required for:', initialData.name);
      } else {
        console.log('✅ [MAIA] Week 0 onboarding already completed or guest user');
      }

      // Load saved voice preference, migrating legacy vendor names
      const savedVoice = localStorage.getItem('selected_voice');
      if (savedVoice) {
        const LEGACY_VOICE_MAP: Record<string, string> = {
          alloy: 'maia_core', shimmer: 'maia_warm', nova: 'maia_clear',
          echo: 'atlas', onyx: 'atlas_deep', fable: 'maia_clear',
        };
        const migrated = LEGACY_VOICE_MAP[savedVoice] ?? savedVoice;
        setSelectedVoice(migrated);
        if (migrated !== savedVoice) {
          localStorage.setItem('selected_voice', migrated);
        }
      }
    };

    initializeUser();
  }, []);

  // Check for password change request from signin redirect
  useEffect(() => {
    if (searchParams?.get('changePassword') === 'true') {
      setShowPasswordChangeModal(true);
      // Clean up URL after showing modal (remove query param)
      const params = new URLSearchParams(searchParams.toString());
      params.delete('changePassword');
      const newQuery = params.toString();
      const path = pathname ?? '/maia';
      router.replace(newQuery ? `${path}?${newQuery}` : path, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // Journal capture deep link (/maia?journal=1) — the Journal's "New Entry"
  // control opens the EXISTING capture sheet here rather than bouncing the
  // member to /maia with nothing open. Strip the parameter immediately so
  // refresh, Back, or a re-render cannot reopen it; the guard above makes the
  // effect a no-op on the re-run that the replace itself triggers.
  useEffect(() => {
    if (!shouldOpenJournalCapture(searchParams)) return;
    setShowJournalSheet(true);
    router.replace(urlWithoutJournalParam(searchParams, pathname), { scroll: false });
  }, [searchParams, pathname, router]);

  // Load and listen for framework/lens changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load initial values
    setCurrentCounselFramework(getCounselFramework());
    setCurrentScribeLens(getScribeLens());
    setMentorStanceEnabled(getMentorStance());

    // Listen for changes
    const handleCounselChange = () => setCurrentCounselFramework(getCounselFramework());
    const handleScribeChange = () => setCurrentScribeLens(getScribeLens());
    const handleMentorChange = (e: Event) => setMentorStanceEnabled((e as CustomEvent).detail.enabled);

    window.addEventListener('maia-counsel-framework-changed', handleCounselChange);
    window.addEventListener('maia-scribe-lens-changed', handleScribeChange);
    window.addEventListener('maia-mentor-stance-changed', handleMentorChange);

    return () => {
      window.removeEventListener('maia-counsel-framework-changed', handleCounselChange);
      window.removeEventListener('maia-scribe-lens-changed', handleScribeChange);
      window.removeEventListener('maia-mentor-stance-changed', handleMentorChange);
    };
  }, []);

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem('selected_voice', voice);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('conversationStyleChanged'));
  };

  const handleSignOut = async () => {
    try {
      // 1) Kill server session + clear cookies
      await apiFetch('/api/members/signout', { method: 'POST' });
    } catch (e) {
      console.warn('[MAIA] Server signout failed (continuing with client cleanup):', e);
    }

    // 2) Clear ALL local auth state
    clearAuthState();
    sessionStorage.removeItem('maia_root_redirect_once');

    // 3) Set signout latch AFTER cleanup (survives any future broad clears)
    localStorage.setItem('maia_signed_out', '1');
    localStorage.setItem('maia_signed_out_at', String(Date.now()));

    // 4) Hard navigation to signin
    window.location.replace('/signin?from=signout');
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

  // --- Spatial Shell (behind feature flag) ---
  // When spatialMaiaShell is enabled, wrap the existing content in the new spatial layout.
  // The existing center field renders inside {children}. Nothing is removed — only wrapped.
  // Derive behavior from maiaMode for the spatial shell
  const currentBehavior: MaiaBehavior = maiaMode === 'patient' ? 'care' : maiaMode === 'session' ? 'scribe' : 'default';

  // Shared journal ask-maia handler
  const handleJournalAskMaia = useCallback((content: string, type: string) => {
    setShowJournalSheet(false);
    window.dispatchEvent(new CustomEvent('journalAskMaia', {
      detail: { content, type, prompt: type === 'dream' ? `Here's a dream I just captured:\n\n${content}` : `Something I'm sitting with:\n\n${content}` }
    }));
  }, []);

  // Shared lab action dispatcher
  const handleLabAction = useCallback((action: string) => {
    if (action === 'open-academy') { setShowAcademySheet(true); return; }
    window.dispatchEvent(new CustomEvent('labAction', { detail: { action } }));
  }, []);

  // --- Talk-first: derive voice presence state from conversation signals ---
  const voicePresenceState: VoicePresenceState = hasActiveSession ? 'listening' : 'idle';
  const voiceAmplitude = 0; // Placeholder — wire to onAudioLevelChange in Tier 2

  // Sanctuary mode: read from maia_settings in localStorage (same source as VoiceHUD)
  const [isSanctuary, setIsSanctuary] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('maia_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setIsSanctuary(settings.sanctuary === true);
      }
    } catch { /* ignore */ }
    // Listen for sanctuary toggle changes from VoiceHUD
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sanctuary !== undefined) setIsSanctuary(detail.sanctuary);
    };
    window.addEventListener('maia-settings-changed', handler);
    return () => window.removeEventListener('maia-settings-changed', handler);
  }, []);

  if (featureFlags.spatialMaiaShell) {
    return (
      <ErrorBoundary>
        <VoiceStateProvider presenceState={voicePresenceState} amplitude={voiceAmplitude} isSanctuary={isSanctuary}>
          <MaiaShell
            explorerName={explorerName}
            explorerId={explorerId}
            isVoiceMode={!showChatInterface}
            behavior={currentBehavior}
            onToggleInputMode={() => setShowChatInterface(!showChatInterface)}
            onOpenHelp={() => setShowHelpHub(true)}
            onOpenAccount={() => setShowAccountMenu(true)}
            onOpenJournalSheet={() => setShowJournalSheet(true)}
            onOpenShadowWork={() => setShowShadowWork(true)}
            onOpenAcademy={() => setShowAcademySheet(true)}
            onOpenChanges={() => setShowChangesSheet(true)}
            onLabAction={handleLabAction}
            activeMode={maiaMode}
            onModeChange={setMaiaMode}
            askMode={askMode}
            onAskModeChange={setAskMode}
            arrivalMode={shouldRenderArrival}
            onReturnToArrival={returnToArrival}
            canReturnToArrival={featureFlags.arrivalEntry && !shouldRenderArrival}
          >
            {/* Center field — voice-reactive atmosphere wrapping OracleConversation */}
            <SwipeNavigation currentPage="maia">
              <MaiaCenterField>
                <OracleConversation
                  userId={explorerId}
                  userName={explorerName}
                  userBirthDate={userBirthDate}
                  sessionId={sessionId}
                  voiceEnabled={voiceEnabled}
                  voice={selectedVoice}
                  voiceSpeed={voiceSpeed}
                  voiceModel={voiceModel}
                  voiceVolume={voiceVolume}
                  initialMode={maiaMode}
                  onModeChange={setMaiaMode}
                  apiEndpoint="/api/sovereign/app/maia/list"
                  onCanonicalThreadChange={setSessionId}
                  consciousnessType="maia"
                  initialShowChatInterface={showChatInterface}
                  onShowChatInterfaceChange={setShowChatInterface}
                  showSessionSelector={showSessionSelector}
                  onCloseSessionSelector={() => setShowSessionSelector(false)}
                  onSessionActiveChange={setHasActiveSession}
                  onMemberExpression={markArrived}
                  onArrivalCrossed={crossArrivalWithoutSpeech}
                  shouldRenderArrival={shouldRenderArrival}
                  initialAction={searchParams?.get('action') || undefined}
                  askMode={askMode}
                  onAskModeChange={setAskMode}
                  placeContext={placeFromPathname('/maia') ?? undefined}
                />
              </MaiaCenterField>
            </SwipeNavigation>
          </MaiaShell>
        </VoiceStateProvider>

        {/* All modals — single location */}
        <MaiaModalManager
          explorerId={explorerId}
          explorerName={explorerName}
          showHelpHub={showHelpHub}
          onCloseHelpHub={() => setShowHelpHub(false)}
          showVoiceHelp={showVoiceHelp}
          onCloseVoiceHelp={() => setShowVoiceHelp(false)}
          showTestFlightHelp={showTestFlightHelp}
          onCloseTestFlightHelp={() => setShowTestFlightHelp(false)}
          onOpenVoiceHelp={() => setShowVoiceHelp(true)}
          onOpenTestFlightHelp={() => setShowTestFlightHelp(true)}
          showFeedbackSheet={showFeedbackSheet}
          onCloseFeedbackSheet={() => setShowFeedbackSheet(false)}
          showPasswordChangeModal={showPasswordChangeModal}
          onClosePasswordChangeModal={() => setShowPasswordChangeModal(false)}
          showFrameworkSelector={showFrameworkSelector}
          onCloseFrameworkSelector={() => setShowFrameworkSelector(false)}
          frameworkSelectorMode={frameworkSelectorMode}
          showJournalSheet={showJournalSheet}
          onCloseJournalSheet={() => setShowJournalSheet(false)}
          onJournalAskMaia={handleJournalAskMaia}
          showShadowWork={showShadowWork}
          onCloseShadowWork={() => setShowShadowWork(false)}
          showAcademySheet={showAcademySheet}
          onCloseAcademySheet={() => setShowAcademySheet(false)}
          showChangesSheet={showChangesSheet}
          onCloseChangesSheet={() => setShowChangesSheet(false)}
        />

        {/* Account dropdown — extracted from inline bottom sheet */}
        <AccountDropdown
          isOpen={showAccountMenu}
          onClose={() => setShowAccountMenu(false)}
          onOpenFeedback={() => setShowFeedbackSheet(true)}
          onSignOut={handleSignOut}
          explorerName={explorerName}
        />
      </ErrorBoundary>
    );
  }

  // --- Legacy layout (flag off — unchanged) ---
  return (
    <ErrorBoundary>
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
        {/* NOTE: overflow-hidden removed from outer div — iOS Safari renders backdrop-blur-xl as invisible when
            combined with overflow:hidden on the same element. Decorations are clipped in inner wrapper instead. */}
        <div
          className="header-navigation safari-nav-fix flex-shrink-0 relative bg-[#1b1410]/90 backdrop-blur-xl border-b border-[#3a2a1f]/60 z-60"
        >
          {/* Decorative elements — overflow-hidden applied here, NOT on the outer div */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Spice particle effect - very subtle movement */}
            <div className="absolute inset-0 opacity-5">
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
              className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-600/3 to-transparent"
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
          </div>

          <div className="relative w-full px-2 py-1" style={{paddingTop: 'max(env(safe-area-inset-top), 1.5rem)'}}>
            {/* Mobile: Horizontal scrollable container */}
            <div className="md:hidden mobile-carousel scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max px-2 py-1">
                {/* Logo removed - now in bottom center */}

                {/* Voice/Text Toggle - Mobile */}
                <div className="flex items-center gap-1 carousel-item">
                  <button
                    onClick={() => setShowChatInterface(!showChatInterface)}
                    className="px-2 py-1 rounded-md bg-maia-navy-800/60 hover:bg-maia-navy-800 border border-maia-navy-700/50 transition-all"
                  >
                    <span className="text-xs text-maia-ink-80 font-light">
                      {showChatInterface ? '💬' : '🎤'}
                    </span>
                  </button>
                </div>

                {/* Mode Selector + Session Button - Mobile optimized */}
                <div className="flex items-center gap-1 bg-maia-navy-900/60 rounded-lg p-0.5 carousel-item">
                  <motion.button
                    onClick={() => setMaiaMode('normal')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-light transition-all flex-shrink-0 ${
                      maiaMode === 'normal'
                        ? 'bg-maia-navy-800/80 border border-maia-spice-500/50 text-maia-ink-100 font-medium'
                        : 'bg-maia-navy-800/40 hover:bg-maia-navy-800 border border-maia-navy-700/40 text-maia-ink-60 hover:text-maia-ink-100'
                    }`}
                  >
                    {maiaMode === 'normal' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-maia-spice-400" />
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
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-light transition-all flex-shrink-0 ${
                      maiaMode === 'patient'
                        ? 'bg-maia-navy-800/80 border border-maia-sage-500/50 text-maia-ink-100 font-medium'
                        : 'bg-maia-navy-800/40 hover:bg-maia-navy-800 border border-maia-navy-700/40 text-maia-ink-60 hover:text-maia-ink-100'
                    }`}
                    title="Tap to switch • Double-tap for framework options"
                  >
                    {maiaMode === 'patient' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-maia-sage-400" />
                    )}
                    <span className="text-xs">Care</span>
                    {currentCounselFramework !== 'auto' ? (
                      <span className="text-[10px] opacity-70">{THERAPEUTIC_FRAMEWORKS[currentCounselFramework]?.icon}</span>
                    ) : (
                      <span className="text-[9px] opacity-40">▾</span>
                    )}
                  </motion.button>

                  {/* Mentor stance toggle — Care mode only */}
                  {maiaMode === 'patient' && (
                    <motion.button
                      onClick={() => {
                        const next = !mentorStanceEnabled;
                        setMentorStance(next);
                        if ('vibrate' in navigator) navigator.vibrate(5);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-light transition-all flex-shrink-0 ${
                        mentorStanceEnabled
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                          : 'bg-maia-navy-800/40 hover:bg-maia-navy-800 border border-maia-navy-700/40 text-maia-ink-60 hover:text-maia-ink-100'
                      }`}
                      title="Mentor stance — For practitioner supervision and case consultation"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <span className="text-xs">Mentor</span>
                      {mentorStanceEnabled && currentCounselFramework !== 'auto' && (
                        <span className="text-[9px] opacity-70">· {currentCounselFramework.toUpperCase()}</span>
                      )}
                    </motion.button>
                  )}

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
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-light transition-all flex-shrink-0 ${
                      maiaMode === 'session'
                        ? 'bg-maia-navy-800/80 border border-blue-500/50 text-maia-ink-100 font-medium'
                        : 'bg-maia-navy-800/40 hover:bg-maia-navy-800 border border-maia-navy-700/40 text-maia-ink-60 hover:text-maia-ink-100'
                    }`}
                    title="Tap to switch • Double-tap for lens options"
                  >
                    {maiaMode === 'session' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                    <span className="text-xs">Scribe</span>
                    {currentScribeLens !== 'auto' ? (
                      <span className="text-[10px] opacity-70">{REFLECTION_LENSES[currentScribeLens]?.icon}</span>
                    ) : (
                      <span className="text-[9px] opacity-40">▾</span>
                    )}
                  </motion.button>

                  {/* ✨ Keep Button - Mobile (after Scribe, before Session) */}
                  <motion.button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('labAction', {
                        detail: { action: 'capture-spirit' }
                      }));
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg
                             bg-[#D4B896]/10 hover:bg-[#D4B896]/20
                             border border-[#D4B896]/30 hover:border-[#D4B896]/50
                             text-[#D4B896] text-xs font-light transition-all flex-shrink-0"
                    title="Keep this moment from the last few turns"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs">Keep</span>
                  </motion.button>

                  {/* Session Button - Inside mode selector, after Capture */}
                  {!hasActiveSession ? (
                    <motion.button
                      onClick={() => setShowSessionSelector(true)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg
                               bg-maia-navy-800/40 hover:bg-maia-navy-800
                               border border-maia-success/30 hover:border-maia-success/50
                               text-maia-success text-xs font-light transition-all flex-shrink-0"
                      title="Start Session"
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">Start</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => setHasActiveSession(false)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg
                               bg-maia-navy-800/40 hover:bg-maia-navy-800
                               border border-maia-danger/30 hover:border-maia-danger/50
                               text-maia-danger text-xs font-light transition-all flex-shrink-0"
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
                             bg-maia-navy-800/40 hover:bg-maia-navy-800
                             border border-maia-navy-700/40 hover:border-maia-navy-700
                             text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all flex-shrink-0"
                    title="Help"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Journal Button - Mobile */}
                <motion.button
                  onClick={() => setShowJournalSheet(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-maia-navy-800/40 hover:bg-maia-navy-800
                           border border-maia-navy-700/40 hover:border-maia-navy-700
                           text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all flex-shrink-0"
                  title="Quick Journal"
                >
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs">Journal</span>
                </motion.button>

                {/* Changes Button - Mobile */}
                <motion.button
                  onClick={() => setShowChangesSheet(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-maia-navy-800/40 hover:bg-maia-navy-800
                           border border-maia-navy-700/40 hover:border-maia-navy-700
                           text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all flex-shrink-0"
                  title="Changes"
                >
                  <Wind className="w-3 h-3" />
                  <span className="text-xs">Changes</span>
                </motion.button>

                {/* Feedback Button - Mobile */}
                <button
                  onClick={() => setShowFeedbackSheet(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-maia-navy-800/40 hover:bg-maia-navy-800
                           border border-maia-navy-700/40 hover:border-maia-navy-700
                           text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all flex-shrink-0"
                  title="Send Feedback"
                >
                  <MessageCircle className="w-3 h-3" />
                </button>

                {/* Account Button - Mobile (opens bottom sheet) */}
                <motion.button
                  onClick={() => setShowAccountMenu(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg
                           bg-maia-navy-800/40 hover:bg-maia-navy-800
                           border border-maia-navy-700/40 hover:border-maia-navy-700
                           text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all flex-shrink-0"
                  title="Account Menu"
                >
                  <User className="w-3 h-3" />
                  <span className="text-xs">Account</span>
                </motion.button>
              </div>
            </div>

            {/* Desktop: Scrollable navigation for narrow windows (including PWA) */}
            <div className="hidden md:block w-full mobile-carousel scrollbar-hide">
              {/* All navigation controls grouped together */}
              <div className="flex items-center justify-center gap-3 min-w-max px-4 py-1">
                {/* Voice/Text Toggle */}
                <div className="flex items-center gap-1">
                  <FeatureTooltip featureId="voice-text-toggle" side="bottom">
                    <button
                      onClick={() => setShowChatInterface(!showChatInterface)}
                      className="px-3 py-1.5 rounded-lg bg-maia-navy-800/60 hover:bg-maia-navy-800 border border-maia-navy-700/50 transition-all"
                    >
                      <span className="text-xs text-maia-ink-80 font-light">
                        {showChatInterface ? '💬 Text' : '🎤 Voice'}
                      </span>
                    </button>
                  </FeatureTooltip>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-maia-navy-900/60 rounded-lg p-0.5">
                  <FeatureTooltip featureId="mode-talk" side="bottom">
                    <motion.button
                      onClick={() => setMaiaMode('normal')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
                        maiaMode === 'normal'
                          ? 'bg-maia-navy-800/80 border border-maia-spice-500/50 text-maia-ink-100 font-medium'
                          : 'bg-maia-navy-800/40 hover:bg-maia-navy-800 border border-maia-navy-700/40 text-maia-ink-60 hover:text-maia-ink-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {maiaMode === 'normal' && (
                        <div className="w-2 h-2 rounded-full bg-maia-spice-400" />
                      )}
                      Talk
                    </motion.button>
                  </FeatureTooltip>
                  <FeatureTooltip featureId="mode-care" side="bottom">
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
                        maiaMode === 'patient'
                          ? 'bg-maia-navy-800/80 border border-maia-sage-500/50 text-maia-ink-100 font-medium'
                          : 'bg-maia-navy-800/40 hover:bg-maia-navy-800 border border-maia-navy-700/40 text-maia-ink-60 hover:text-maia-ink-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Click to switch • Double-click for framework options (Jungian, Somatic, IFS, etc.)"
                    >
                      {maiaMode === 'patient' && (
                        <div className="w-2 h-2 rounded-full bg-maia-sage-400" />
                      )}
                      Care
                      {currentCounselFramework !== 'auto' ? (
                        <span className="text-[10px] opacity-70">{THERAPEUTIC_FRAMEWORKS[currentCounselFramework]?.icon}</span>
                      ) : (
                        <span className="text-[10px] opacity-40">▾</span>
                      )}
                    </motion.button>
                  </FeatureTooltip>

                  {/* Mentor stance toggle — Care mode only (desktop) */}
                  {maiaMode === 'patient' && (
                    <motion.button
                      onClick={() => {
                        const next = !mentorStanceEnabled;
                        setMentorStance(next);
                        if ('vibrate' in navigator) navigator.vibrate(5);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
                        mentorStanceEnabled
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                          : 'bg-maia-navy-800/40 hover:bg-maia-navy-800 border border-maia-navy-700/40 text-maia-ink-60 hover:text-maia-ink-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Mentor stance — For practitioner supervision and case consultation"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      Mentor
                      {mentorStanceEnabled && currentCounselFramework !== 'auto' && (
                        <span className="text-[10px] opacity-70">· {currentCounselFramework.toUpperCase()}</span>
                      )}
                    </motion.button>
                  )}

                  <FeatureTooltip featureId="mode-scribe" side="bottom">
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
                        maiaMode === 'session'
                          ? 'bg-maia-navy-800/80 border border-blue-500/50 text-maia-ink-100 font-medium'
                          : 'bg-maia-navy-800/40 hover:bg-maia-navy-800 border border-maia-navy-700/40 text-maia-ink-60 hover:text-maia-ink-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Click to switch • Double-click for lens options (Jungian, Somatic, Archetypal, etc.)"
                    >
                      {maiaMode === 'session' && (
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                      )}
                      Scribe
                      {currentScribeLens !== 'auto' ? (
                        <span className="text-[10px] opacity-70">{REFLECTION_LENSES[currentScribeLens]?.icon}</span>
                      ) : (
                        <span className="text-[10px] opacity-40">▾</span>
                      )}
                    </motion.button>
                  </FeatureTooltip>

                  {/* Keep Button - Desktop (after Scribe, before Session) */}
                  <FeatureTooltip featureId="capture" side="bottom">
                    <motion.button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('labAction', {
                          detail: { action: 'capture-spirit' }
                        }));
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                               bg-[#D4B896]/10 hover:bg-[#D4B896]/20
                               border border-[#D4B896]/30 hover:border-[#D4B896]/50
                               text-[#D4B896] text-xs font-light transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Keep this moment from the last few turns"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Keep
                    </motion.button>
                  </FeatureTooltip>

                  {/* Session Button - Desktop (after Capture) */}
                  {!hasActiveSession ? (
                    <FeatureTooltip featureId="session-start" side="bottom">
                      <motion.button
                        onClick={() => setShowSessionSelector(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                                 bg-maia-navy-800/40 hover:bg-maia-navy-800
                                 border border-maia-success/30 hover:border-maia-success/50
                                 text-maia-success text-xs font-light transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Clock className="w-4 h-4" />
                        <span className="hidden sm:inline">Start Session</span>
                      </motion.button>
                    </FeatureTooltip>
                  ) : (
                    <FeatureTooltip featureId="session-end" side="bottom">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                                   bg-maia-navy-800/60 border border-maia-success/40 text-maia-success text-xs">
                        <div className="w-2 h-2 rounded-full bg-maia-success animate-pulse" />
                        <span className="hidden sm:inline">Session Active</span>
                      </div>
                    </FeatureTooltip>
                  )
                }
                </div>

                {/* Help Hub Button - Desktop */}
                <FeatureTooltip featureId="help" side="bottom">
                  <motion.button
                    onClick={() => setShowHelpHub(true)}
                    className="flex items-center justify-center w-8 h-8 rounded-full
                             bg-maia-navy-800/40 hover:bg-maia-navy-800
                             border border-maia-navy-700/40 hover:border-maia-navy-700
                             text-maia-ink-60 hover:text-maia-ink-100 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Help"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </motion.button>
                </FeatureTooltip>

                {/* Journal Button - Desktop */}
                <FeatureTooltip featureId="journal" side="bottom">
                  <motion.button
                    onClick={() => setShowJournalSheet(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-maia-navy-800/40 hover:bg-maia-navy-800
                             border border-maia-navy-700/40 hover:border-maia-navy-700
                             text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Quick Journal"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Journal</span>
                  </motion.button>
                </FeatureTooltip>

                {/* Changes Button - Desktop */}
                <FeatureTooltip featureId="changes" side="bottom">
                  <motion.button
                    onClick={() => setShowChangesSheet(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-maia-navy-800/40 hover:bg-maia-navy-800
                             border border-maia-navy-700/40 hover:border-maia-navy-700
                             text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Changes"
                  >
                    <Wind className="w-4 h-4" />
                    <span className="hidden sm:inline">Changes</span>
                  </motion.button>
                </FeatureTooltip>

                {/* Feedback Button - Desktop */}
                <FeatureTooltip featureId="feedback" side="bottom">
                  <motion.button
                    onClick={() => setShowFeedbackSheet(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-maia-navy-800/40 hover:bg-maia-navy-800
                             border border-maia-navy-700/40 hover:border-maia-navy-700
                             text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Send Feedback"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </motion.button>
                </FeatureTooltip>

                {/* Account Button - Desktop (opens bottom sheet) */}
                <FeatureTooltip featureId="account" side="bottom">
                  <motion.button
                    onClick={() => setShowAccountMenu(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-maia-navy-800/40 hover:bg-maia-navy-800
                             border border-maia-navy-700/40 hover:border-maia-navy-700
                             text-maia-ink-60 hover:text-maia-ink-100 text-xs font-light transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Account Menu"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Account</span>
                  </motion.button>
                </FeatureTooltip>
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
              voiceVolume={voiceVolume}
              initialMode={maiaMode}
              onModeChange={setMaiaMode}
              apiEndpoint="/api/sovereign/app/maia/list"
              onCanonicalThreadChange={setSessionId}
              consciousnessType="maia"
              initialShowChatInterface={showChatInterface}
              onShowChatInterfaceChange={setShowChatInterface}
              showSessionSelector={showSessionSelector}
              onCloseSessionSelector={() => setShowSessionSelector(false)}
              onSessionActiveChange={setHasActiveSession}
              initialAction={searchParams?.get('action') || undefined}
              placeContext={placeFromPathname('/maia') ?? undefined}
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
                            max="4"
                            value={['maia_warm', 'maia_clear', 'maia_core', 'atlas', 'atlas_deep'].indexOf(selectedVoice)}
                            onChange={(e) => {
                              const voices = ['maia_warm', 'maia_clear', 'maia_core', 'atlas', 'atlas_deep'];
                              handleVoiceChange(voices[parseInt(e.target.value)]);
                            }}
                            className="w-full h-1.5 bg-stone-700/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            style={{
                              background: `linear-gradient(to right, rgb(245 158 11 / 0.5) 0%, rgb(245 158 11 / 0.5) ${(['maia_warm', 'maia_clear', 'maia_core', 'atlas', 'atlas_deep'].indexOf(selectedVoice) / 4) * 100}%, rgb(87 83 78 / 0.5) ${(['maia_warm', 'maia_clear', 'maia_core', 'atlas', 'atlas_deep'].indexOf(selectedVoice) / 4) * 100}%, rgb(87 83 78 / 0.5) 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs">
                            <span title="Maia Warm - Soft & reflective">💧</span>
                            <span title="Maia Clear - Bright & articulate">🔥</span>
                            <span title="Maia Main - Clear & balanced">✨</span>
                            <span title="Atlas - Grounded & resonant">🌍</span>
                            <span title="Atlas Deep - Deep & contemplative">🖤</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 min-w-[64px]">
                          <span className="text-xs text-amber-400/80 font-medium uppercase tracking-wide">
                            {selectedVoice === 'maia_core' ? 'Main' :
                             selectedVoice === 'maia_warm' ? 'Warm' :
                             selectedVoice === 'maia_clear' ? 'Clear' :
                             selectedVoice === 'atlas' ? 'Atlas' :
                             selectedVoice === 'atlas_deep' ? 'Deep' : selectedVoice}
                          </span>
                          <span className="text-[9px] text-stone-500">
                            {selectedVoice === 'maia_warm' && 'Reflective'}
                            {selectedVoice === 'maia_clear' && 'Bright'}
                            {selectedVoice === 'maia_core' && 'Balanced'}
                            {selectedVoice === 'atlas' && 'Grounded'}
                            {selectedVoice === 'atlas_deep' && 'Deep'}
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
              src="/logo_flower 2.png"
              alt="Holoflower"
              className="w-6 h-6 opacity-100"
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
            setShowLabDrawer(false);
            // Handle academy action locally
            if (action === 'open-academy') {
              setShowAcademySheet(true);
              return;
            }
            // Dispatch event that OracleConversation can handle
            window.dispatchEvent(new CustomEvent('labAction', {
              detail: { action }
            }));
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

        {/* Help Hub Sheet — member orientation surface only.
            TestFlight/QA tooling lives on admin surfaces (BetaTesterHub),
            not Help. See: project_surface_typology.md */}
        <HelpHubSheet
          isOpen={showHelpHub}
          onClose={() => setShowHelpHub(false)}
          onOpenVoiceHelp={() => setShowVoiceHelp(true)}
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

        {/* Changes Sheet (Book of Changes) */}
        <ChangesSheet
          isOpen={showChangesSheet}
          onClose={() => setShowChangesSheet(false)}
          memberId={explorerId}
          memberName={explorerName}
        />

        {/* Password Change Sheet (beta tester upgrade) */}
        <PasswordChangeSheet
          isOpen={showPasswordChangeModal}
          onClose={() => setShowPasswordChangeModal(false)}
          memberId={explorerId}
          memberName={explorerName}
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
                {/* My Portal — personal threshold */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/home');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-base">My Portal</span>
                </button>

                {/* Commons */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/commons/circles');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-base">Commons</span>
                </button>

                {/* Library - Wisdom library */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/maia/community');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-base">Library</span>
                </button>

                {/* Wisdom Keepers */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/wisdom-keepers/wisdom');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
                >
                  <Scroll className="w-5 h-5" />
                  <span className="text-base">Wisdom Keepers</span>
                </button>

                {/* Labtools - Full access for everyone */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/labtools');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
                >
                  <FlaskConical className="w-5 h-5" />
                  <span className="text-base">Labtools</span>
                </button>

                {/* Soullab Studios - Main practitioner portal */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/studio');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-base">Soullab Studios</span>
                </button>

                {/* Account Settings */}
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    router.push('/account/settings');
                  }}
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
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
                  className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-base">Send Feedback</span>
                </button>

                {/* Divider */}
                <div className="border-t border-[#D4B896]/20 my-2" />

                {/* Sustaining Circle Section - Moved to bottom */}
                <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#D4B896]/5 via-[#D4B896]/3 to-transparent border border-[#D4B896]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-5 h-5 text-[#D4B896]" />
                    <span className="text-base text-[#D4B896] font-medium">Sustaining Circle</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mb-3 italic">
                    Everyone has full access. Your contribution sustains the sacred work.
                  </p>

                  {/* Current Circle Status */}
                  {membershipUtils.isBetaTester() && (
                    <div className="mb-3 flex items-center justify-center gap-2 px-3 py-2 bg-[#D4B896]/10 border border-[#D4B896]/30 rounded-lg">
                      <Sparkles className="w-4 h-4 text-[#D4B896]" />
                      <span className="text-sm text-[#D4B896] font-medium">Pioneer Founding Member</span>
                    </div>
                  )}

                  {/* Choose Your Path */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Sustaining Circle */}
                    <button
                      onClick={() => setShowSustainingSlider(!showSustainingSlider)}
                      className={`p-2 rounded-lg transition-all text-center ${
                        showSustainingSlider
                          ? 'bg-[#D4B896]/20 border border-[#D4B896]/40'
                          : 'bg-[#D4B896]/10 hover:bg-[#D4B896]/20 border border-[#D4B896]/30'
                      }`}
                    >
                      <Flame className="w-4 h-4 mx-auto mb-1 text-[#D4B896]" />
                      <p className="text-[10px] text-[#D4B896] font-medium">Sustaining Circle</p>
                      <p className="text-[9px] text-stone-400">Choose your level</p>
                    </button>

                    {/* Seva Exchange */}
                    <button
                      onClick={() => setShowSevaOptions(!showSevaOptions)}
                      className={`p-2 rounded-lg transition-all text-center ${
                        showSevaOptions
                          ? 'bg-[#D4B896]/20 border border-[#D4B896]/40'
                          : 'bg-[#D4B896]/10 hover:bg-[#D4B896]/20 border border-[#D4B896]/30'
                      }`}
                    >
                      <Users className="w-4 h-4 mx-auto mb-1 text-[#D4B896]" />
                      <p className="text-[10px] text-[#D4B896] font-medium">Seva Exchange</p>
                      <p className="text-[9px] text-stone-400">Contribute service</p>
                    </button>
                  </div>

                  {/* Sustaining Circle Slider (expandable) */}
                  {showSustainingSlider && (
                    <div className="mt-3 p-4 bg-[#D4B896]/5 border border-[#D4B896]/20 rounded-lg">
                      <p className="text-[10px] text-[#D4B896] mb-3 font-medium text-center">
                        Choose what feels right for you
                      </p>

                      {/* Amount Display */}
                      <div className="text-center mb-4">
                        <p className="text-2xl font-light text-[#D4B896]">${sustainingAmount}<span className="text-sm text-stone-400">/mo</span></p>
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
                          className="w-full h-2 rounded-full cursor-pointer accent-[#D4B896]
                            [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-stone-700/50
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4B896] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:-mt-1.5
                            [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-stone-700/50
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-[#D4B896] [&::-moz-range-thumb]:border-0"
                          style={{ WebkitAppearance: 'none', appearance: 'none', background: 'transparent' }}
                        />
                        <div className="flex justify-between text-[9px] text-stone-500 mt-1">
                          <span>$5</span>
                          <span>$500+</span>
                        </div>
                      </div>

                      {/* Benefits Preview */}
                      <div className="text-[9px] text-stone-400 mb-3 space-y-1">
                        <p className="flex items-center gap-1"><span className="text-[#D4B896]">✓</span> Monthly build letters</p>
                        {sustainingAmount >= 25 && <p className="flex items-center gap-1"><span className="text-[#D4B896]">✓</span> Early access + previews</p>}
                        {sustainingAmount >= 75 && <p className="flex items-center gap-1"><span className="text-[#D4B896]">✓</span> Patron Q&A circle</p>}
                        {sustainingAmount >= 250 && <p className="flex items-center gap-1"><span className="text-[#D4B896]">✓</span> Direct roadmap input</p>}
                        {sustainingAmount >= 500 && <p className="flex items-center gap-1"><span className="text-[#D4B896]">✓</span> Founder channel access</p>}
                      </div>

                      {/* Transparency */}
                      <div className="bg-stone-800/50 rounded-lg p-3 mb-3 border border-stone-700/50">
                        <p className="text-[8px] text-stone-500 uppercase tracking-wide mb-2">What this sustains</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                          <span className="text-stone-400">Infrastructure</span>
                          <span className="text-stone-500 text-right">~$500/mo</span>
                          <span className="text-stone-400">Development</span>
                          <span className="text-stone-500 text-right">70+ hrs/wk</span>
                          <span className="text-[#D4B896] font-medium">Target</span>
                          <span className="text-[#D4B896] text-right font-medium">$3,500/mo</span>
                        </div>
                        <p className="text-[8px] text-stone-500 mt-2">
                          No VC. No ads. For us by us.
                        </p>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={() => membershipUtils.joinSustainingCircle(sustainingAmount)}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-[#D4B896] to-[#C4A886] hover:from-[#C4A886] hover:to-[#B49876] text-black text-sm font-medium transition-all"
                      >
                        Join Circle
                      </button>

                      {/* Full Details Link */}
                      <a
                        href="/patrons"
                        className="block text-center text-[9px] text-stone-500 hover:text-[#D4B896] mt-2 transition-colors"
                      >
                        View full details →
                      </a>
                    </div>
                  )}

                  {/* Seva Options (expandable) */}
                  {showSevaOptions && (
                    <div className="mt-3 p-3 bg-[#D4B896]/5 border border-[#D4B896]/20 rounded-lg">
                      <p className="text-[10px] text-[#D4B896] mb-2 font-medium">Choose your path of service:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(Object.entries(SEVA_PATHWAYS) as [SevaPathway, typeof SEVA_PATHWAYS[SevaPathway]][]).map(([key, path]) => (
                          <button
                            key={key}
                            onClick={() => membershipUtils.joinSeva(key)}
                            className="p-1.5 rounded bg-[#D4B896]/10 hover:bg-[#D4B896]/20 text-left transition-all"
                          >
                            <p className="text-[9px] text-[#D4B896] font-medium">{path.name}</p>
                            <p className="text-[8px] text-stone-500">{path.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-[#D4B896]/20 my-2" />

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