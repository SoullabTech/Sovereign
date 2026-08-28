'use client';

/**
 * /field/talk — Field voice session
 *
 * Voice-first entry point for iOS/Capacitor. Renders the same MAIA conversation
 * UI as /maia but with reduced boot weight:
 *
 *  - No /api/studio/* calls on mount
 *  - Caps initial message history context to 10 messages via sessionStorage flag
 *  - Defers Journal + Capture module loading until after first user interaction
 *  - Logs "[Field] boot — heavy tasks deferred until first interaction" once per session
 *
 * The flag "field_heavy_loaded" in sessionStorage gates the deferred phase.
 * OracleConversation is shared directly with /maia (no duplication of logic).
 */

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OracleConversation } from '@/components/OracleConversation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { apiFetch, clearAuthState } from '@/lib/http/apiBase';
import { getOrCreateMaiaSessionId } from '@/lib/maia/presence/conversationIdentity';
import { ensureSessionSanctuary } from '@/lib/settings/accountSettings';
import { advanceEnergyState, loadEnergyContext, type FieldEnergyState } from '@/lib/field/energyState';

// ---------------------------------------------------------------------------
// Build stamp — injected at build time via next.config.js
// ---------------------------------------------------------------------------
const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA || 'dev';
const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE || 'unknown';

// ---------------------------------------------------------------------------
// Session version — keep in sync with /maia/page.tsx
// ---------------------------------------------------------------------------
const SESSION_VERSION = 2;

// ---------------------------------------------------------------------------
// Field Safe Mode — when true, visible in debug panel (env set server-side)
// Client only knows via a data attribute we inject; actual enforcement is server-side.
// ---------------------------------------------------------------------------
const FIELD_SAFE_MODE_HINT = typeof window !== 'undefined'
  ? document.documentElement.getAttribute('data-field-safe') === '1'
  : false;

function isLikelyUUID(str: string): boolean {
  if (!str) return false;
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hexPattern = /^[0-9a-f]{8,}$/i;
  const userIdPattern = /^user_\d+$/;
  return (
    uuidPattern.test(str) || hexPattern.test(str) || userIdPattern.test(str)
  );
}

function isPoisonedLocalId(id: string | null | undefined): boolean {
  if (!id) return false;
  return id.startsWith('local_');
}

function isValidMemberId(id: string | null | undefined): boolean {
  if (!id) return false;
  if (id === 'guest' || id.startsWith('guest_') || id === 'anonymous') return false;
  if (id.startsWith('local_')) return false;
  return true;
}

function getValidDisplayName(
  name: string | undefined | null,
  username: string | undefined | null
): string {
  const genericNames = ['user', 'guest', 'anonymous', 'explorer', 'test', 'admin'];
  if (name && !isLikelyUUID(name) && !genericNames.includes(name.toLowerCase())) {
    return name;
  }
  if (
    username &&
    !isLikelyUUID(username) &&
    !genericNames.includes(username.toLowerCase())
  ) {
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
  return 'Friend';
}

/** Read user data from localStorage — mirrors /maia logic, no API call on mount. */
async function getFieldUserData(): Promise<{ id: string; name: string; birthDate?: string }> {
  if (typeof window === 'undefined') return { id: 'guest', name: 'Friend' };

  // Prefer cached preferred name (avoids round-trip)
  const preferredName = localStorage.getItem('explorerPreferredName');
  const explorerId = localStorage.getItem('explorerId');
  if (
    preferredName &&
    preferredName.trim() &&
    preferredName.toLowerCase() !== 'friend' &&
    !isLikelyUUID(preferredName) &&
    explorerId &&
    isValidMemberId(explorerId)
  ) {
    return { id: explorerId, name: preferredName };
  }

  // beta_user is the primary auth source
  const betaUser = localStorage.getItem('beta_user');
  if (betaUser) {
    try {
      const userData = JSON.parse(betaUser);
      if (isValidMemberId(userData.id)) {
        const validName = getValidDisplayName(
          userData.preferredName || userData.name || userData.displayName,
          userData.username
        );
        return {
          id: userData.id,
          name: validName,
          birthDate: userData.birthDate,
        };
      }
    } catch {
      // ignore parse error
    }
  }

  // Legacy fallback
  const legacyId =
    localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
  const legacyName = localStorage.getItem('explorerName');
  if (legacyId && isValidMemberId(legacyId)) {
    const validName = isLikelyUUID(legacyName || '') ? 'Friend' : legacyName || 'Friend';
    return { id: legacyId, name: validName };
  }

  return { id: 'guest', name: 'Friend' };
}

// ---------------------------------------------------------------------------
// Main component (needs Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------
function FieldTalkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [explorerId, setExplorerId] = useState('guest');
  const [explorerName, setExplorerName] = useState('');
  const [userBirthDate, setUserBirthDate] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [voiceEnabled] = useState(true);

  // Field energy state — drives oracle regulation arc (arrival → settling → presence)
  const [fieldEnergyState, setFieldEnergyState] = useState<FieldEnergyState>('arrival');
  const [selectedVoice, setSelectedVoice] = useState('maia_core');
  const [voiceSpeed] = useState(0.95);
  const [voiceVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maia_voice_volume');
      return saved ? parseFloat(saved) : 1.0;
    }
    return 1.0;
  });

  // Deferred module state — loaded after first interaction
  const [heavyLoaded, setHeavyLoaded] = useState(false);

  // ---------------------------------------------------------------------------
  // Boot: session check + user data (Field-mode: local only, no /api/studio/*)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const boot = async () => {
      setIsMounted(true);

      // Mark this session as Field shell — apiFetch will add X-App-Shell: field to all requests.
      // This enables server-side enforcement of the Field/Studio boundary.
      sessionStorage.setItem('field_shell', '1');

      // 🛡️ FIELD BOOT CALL GUARD: detect (but do NOT suppress) /api/studio/* calls during boot.
      // Detection-only: we warn loudly so the coupling becomes visible and can be fixed.
      // Suppression was removed — fake 200s mask real dependencies and create inconsistent state.
      // Real enforcement is server-side via X-App-Shell header (see middleware.ts).
      const _nativeFetch = window.fetch;
      const _bootGuardActive = { current: true };
      window.fetch = function guardedFetch(input, init) {
        const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
        if (_bootGuardActive.current && url.includes('/api/studio/')) {
          console.warn(
            `[Field] ⚠️ BOOT VIOLATION: /api/studio/* called during Field boot. ` +
            `URL: ${url}. ` +
            `This increases boot weight and must be moved to post-first-interaction. ` +
            `Server will return 403 if X-App-Shell: field enforcement is active.`
          );
          // Do NOT suppress — let the real request proceed so we see the actual failure
        }
        return _nativeFetch.call(window, input as RequestInfo, init);
      };
      // Lift guard after boot completes (see cleanup at end of boot())


      // Session migration check (same logic as /maia)
      const storedVersion = localStorage.getItem('maia_session_version');
      const betaUser = localStorage.getItem('beta_user');
      const explorerId = localStorage.getItem('explorerId');
      const signupCompleted = localStorage.getItem('signup_completed');

      let betaUserId: string | null = null;
      try {
        if (betaUser) betaUserId = JSON.parse(betaUser).id;
      } catch { /* ignore */ }

      const hasAnySessionData =
        betaUser ||
        explorerId ||
        signupCompleted ||
        Object.keys(localStorage).some(
          (k) =>
            k.startsWith('maia_') ||
            k.startsWith('explorer') ||
            k.startsWith('beta')
        );

      if (!hasAnySessionData) {
        console.log('[Field] No session data — routing to /begin');
        router.replace('/signin');
        return;
      }

      if (isPoisonedLocalId(explorerId) || isPoisonedLocalId(betaUserId)) {
        console.warn('[Field] Poisoned local_* ID — clearing, routing to /begin');
        localStorage.removeItem('beta_user');
        localStorage.removeItem('explorerId');
        localStorage.removeItem('explorerName');
        localStorage.removeItem('signup_completed');
        router.replace('/signin');
        return;
      }

      const versionMismatch = storedVersion !== String(SESSION_VERSION);
      if (versionMismatch) {
        console.log('[Field] Session version mismatch — routing to /signin');
        localStorage.removeItem('beta_user');
        localStorage.removeItem('explorerId');
        localStorage.removeItem('explorerName');
        localStorage.setItem('maia_session_version', String(SESSION_VERSION));
        router.replace('/signin');
        return;
      }

      // Load user data from localStorage only (no API call on Field boot)
      const userData = await getFieldUserData();

      // Session management — through the canonical identity module rather than
      // a second hand-rolled copy of the same daily-rotation scheme. This is the
      // smallest de-duplication that lets Sanctuary policy live in ONE place:
      // while this surface minted sessions on its own keys, the boundary helper
      // could not be given a canonical id to stamp. Semantics are unchanged —
      // same two localStorage keys, same calendar-day rotation, same
      // `session_<ms>` id shape.
      const existingSessionId = localStorage.getItem('maia_session_id');
      const identity = getOrCreateMaiaSessionId();
      const activeSessionId = identity?.sessionId ?? `session_${Date.now()}`;
      // Establish the live Sanctuary boundary for this session. Idempotent, so
      // it is safe whether Field, /maia or the presence sheet arrived first.
      ensureSessionSanctuary(activeSessionId);

      if (identity && !identity.isNew) {
        console.log('[Field] Restored session:', activeSessionId);
        // Non-blocking touch
        apiFetch('/api/maia/session/start', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: activeSessionId,
            memberId: userData.id,
          }),
        }).catch(() => {});
      } else {
        // getOrCreateMaiaSessionId() already persisted the id and its date.
        console.log('[Field] Created new session:', activeSessionId);

        // Non-blocking session registration
        apiFetch('/api/maia/session/start', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: activeSessionId,
            memberId: userData.id,
            privacyMode: 'standard',
            maiaMode: 'normal',
          }),
        }).catch(() => {});

        if (existingSessionId && existingSessionId !== activeSessionId) {
          localStorage.removeItem(`maia_conversation_${existingSessionId}`);
        }
      }

      // Field boot: cap history context, defer heavy modules
      const heavyKey = 'field_heavy_loaded';
      const alreadyLoaded = sessionStorage.getItem(heavyKey) === '1';
      if (!alreadyLoaded) {
        console.log('[Field] boot — heavy tasks deferred until first interaction');
        // Limit message history available to OracleConversation context
        // by setting a sessionStorage flag that the component can read.
        // OracleConversation reads historicalMessagesRef which it builds itself;
        // we truncate via the flag after it loads.
        sessionStorage.setItem('field_history_cap', '10');
      } else {
        setHeavyLoaded(true);
      }

      // Voice preference
      const savedVoice = localStorage.getItem('selected_voice');
      if (savedVoice) {
        const LEGACY_VOICE_MAP: Record<string, string> = {
          alloy: 'maia_core',
          shimmer: 'maia_warm',
          nova: 'maia_clear',
          echo: 'atlas',
          onyx: 'atlas_deep',
          fable: 'maia_clear',
        };
        setSelectedVoice(LEGACY_VOICE_MAP[savedVoice] ?? savedVoice);
      }

      setExplorerId(userData.id);
      setExplorerName(userData.name);
      if (userData.birthDate) setUserBirthDate(userData.birthDate);
      setSessionId(activeSessionId);

      // Lift boot guard — boot complete, normal fetch resumes
      _bootGuardActive.current = false;
      window.fetch = _nativeFetch;
    };

    boot();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // After first user interaction: enable Journal + Capture lazy-load
  // ---------------------------------------------------------------------------
  const handleFirstInteraction = useCallback(() => {
    if (heavyLoaded) return;
    const heavyKey = 'field_heavy_loaded';
    sessionStorage.setItem(heavyKey, '1');
    sessionStorage.removeItem('field_history_cap');
    setHeavyLoaded(true);
    console.log('[Field] First interaction — enabling deferred modules');
  }, [heavyLoaded]);

  // Treat a message being added as the first interaction signal.
  // Also advances Field energy state when a user message is sent (arrival → settling → presence).
  const handleMessageAdded = useCallback((message: { role?: string; text?: string; content?: string }) => {
    handleFirstInteraction();

    // Only advance energy state on user messages (not oracle/system responses)
    if (sessionId && message.role === 'user') {
      const text = message.text || message.content || '';
      const ctx = advanceEnergyState(sessionId, text, 'dialogue');
      setFieldEnergyState(ctx.state);
      console.log(`[Field] Energy state: ${ctx.state} (turn ${ctx.turnCount})`);
    }
  }, [handleFirstInteraction, sessionId]);

  // Restore persisted energy state when sessionId is known
  useEffect(() => {
    if (!sessionId) return;
    const ctx = loadEnergyContext(sessionId);
    setFieldEnergyState(ctx.state);
    console.log(`[Field] Restored energy state: ${ctx.state} (turn ${ctx.turnCount})`);
  }, [sessionId]);

  if (!isMounted || !sessionId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-950">
        <div className="w-2 h-2 rounded-full bg-amber-600/60 animate-pulse" />
      </div>
    );
  }

  // Show debug panel when ?debug=1 is in the URL
  const showDebug = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      {showDebug && (
        <div
          style={{
            position: 'fixed',
            bottom: 8,
            left: 8,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            color: '#a3e635',
            fontFamily: 'monospace',
            fontSize: 10,
            padding: '6px 10px',
            borderRadius: 6,
            lineHeight: 1.6,
            pointerEvents: 'none',
            maxWidth: 280,
          }}
        >
          <div>SHA: {BUILD_SHA}</div>
          <div>Date: {BUILD_DATE}</div>
          <div>Field: true</div>
          <div>Safe: {FIELD_SAFE_MODE_HINT ? 'YES ⚠️' : 'no'}</div>
          <div>Energy: {fieldEnergyState}</div>
          <div>Session: {sessionId.slice(-8)}</div>
        </div>
      )}
      <OracleConversation
        userId={explorerId}
        userName={explorerName}
        userBirthDate={userBirthDate}
        sessionId={sessionId}
        voiceEnabled={voiceEnabled}
        voice={selectedVoice}
        voiceSpeed={voiceSpeed}
        voiceVolume={voiceVolume}
        initialMode="normal"
        apiEndpoint="/api/sovereign/app/maia/list"
        consciousnessType="maia"
        onMessageAdded={handleMessageAdded}
        initialAction={searchParams?.get('action') || undefined}
        fieldMode={true}
        fieldEnergyState={fieldEnergyState}
      />
    </div>
  );
}

export default function FieldTalkPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-stone-950">
            <div className="w-2 h-2 rounded-full bg-amber-600/60 animate-pulse" />
          </div>
        }
      >
        <FieldTalkContent />
      </Suspense>
    </ErrorBoundary>
  );
}
