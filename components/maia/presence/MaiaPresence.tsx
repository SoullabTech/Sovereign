'use client';

/**
 * MaiaPresence — the canonical MAIA relationship layer.
 *
 * Mounted ONCE in the root layout. Owns, for the whole app:
 *  - member identity (signed-in gate: getValidMemberId, same as BugReportButton)
 *  - the canonical conversation sessionId (lib/maia/presence/conversationIdentity)
 *  - the current place (facts-only, from the governed-room registry + useMaiaPlace)
 *  - presentation state (sheet open/closed)
 *  - ONE global OracleConversation instance (lazy-mounted on first open,
 *    kept mounted across route changes so the transcript survives navigation)
 *
 * Constitutional behavior:
 *  - The handle is quiet: small, static, no pulse, no badge, never auto-opens.
 *  - MAIA never speaks first from this surface; opening the sheet shows the
 *    conversation — it does not trigger a message.
 *  - Place context is held here and travels ONLY inside a message the member
 *    sends (see OracleConversation body build). Route changes transmit nothing.
 *  - Suppressed on full conversation surfaces (/maia, /studio/maia, /field/talk)
 *    so there is never a second live conversation mount, and on ungoverned
 *    routes (public, onboarding, /now-what — see place.ts registry).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { getValidMemberId, apiFetch } from '@/lib/http/apiBase';
import { getOrCreateMaiaSessionId } from '@/lib/maia/presence/conversationIdentity';
import { ensureSessionSanctuary, loadMemberDefaultMemoryMode } from '@/lib/settings/accountSettings';
import {
  type MaiaPlaceContext,
  isFullConversationRoute,
  placeFromPathname,
  resolveGovernedRoom,
} from '@/lib/maia/presence/place';

// The conversation surface is heavy (9k+ lines) — load it only when the
// member first summons MAIA, then keep it mounted for the rest of the session.
const OracleConversation = dynamic(
  () => import('@/components/OracleConversation').then(m => m.OracleConversation),
  { ssr: false },
);

interface MaiaPresenceValue {
  /** Facts-only current place (null off governed rooms). */
  place: MaiaPlaceContext | null;
  /** Member-initiated open/close of the conversation sheet. */
  isOpen: boolean;
  openMaia: () => void;
  closeMaia: () => void;
  /** Room-supplied place override (useMaiaPlace). */
  registerPlace: (place: MaiaPlaceContext | null) => void;
}

const MaiaPresenceContext = createContext<MaiaPresenceValue | null>(null);

export function useMaiaPresence(): MaiaPresenceValue | null {
  return useContext(MaiaPresenceContext);
}

/**
 * Room registration hook (Phase 8). A governed room may declare richer
 * facts about itself (e.g. an open object) than the route registry holds.
 * Declarative facts only — registration must not trigger conversation,
 * analytics, memory writes, or interpretation, and it does not transmit
 * anything anywhere: the registered place leaves the client only inside a
 * message the member sends.
 */
export function useMaiaPlace(place: Omit<MaiaPlaceContext, 'route'> & { route?: string }): void {
  const ctx = useContext(MaiaPresenceContext);
  const pathname = usePathname();
  const { placeId, placeName, purpose, objectType, objectId } = place;
  const route = place.route ?? pathname ?? '/';
  useEffect(() => {
    if (!ctx) return;
    ctx.registerPlace({ placeId, placeName, route, purpose, objectType, objectId });
    return () => ctx.registerPlace(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, placeName, route, purpose, objectType, objectId]);
}

export function MaiaPresence({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const [hasMember, setHasMember] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Once opened, the conversation stays mounted (hidden) so transcript state
  // survives close/reopen and route changes without a rehydrate seam.
  const [hasEverOpened, setHasEverOpened] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | undefined>(undefined);
  const [registeredPlace, setRegisteredPlace] = useState<MaiaPlaceContext | null>(null);

  // Signed-in gate — client-only, checked on mount and on route change
  // (sign-in/out happens via navigation in this app).
  useEffect(() => {
    setHasMember(getValidMemberId() !== null);
    try {
      const stored = localStorage.getItem('beta_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (typeof user?.name === 'string' && user.name.trim()) setMemberName(user.name.trim());
      }
    } catch { /* name stays undefined */ }
  }, [pathname]);

  // Canonical session identity — same module the /maia page uses, so the
  // sheet and the full page can never mint competing sessions.
  useEffect(() => {
    if (!hasMember) return;
    let cancelled = false;
    (async () => {
      // SANCTUARY-MEMBER-SCOPE-01 — establish whose default this is BEFORE the
      // boundary consumes it, exactly as /maia does. This provider mounts on
      // every route and its effect has no network wait of its own, so without
      // this it would reliably win the race and seed the session from a default
      // not yet attributed to this member. Idempotent and cheap once owned.
      const memberId = getValidMemberId();
      if (memberId) {
        await loadMemberDefaultMemoryMode(memberId, (url) => apiFetch(url));
      }
      if (cancelled) return;

      const identity = getOrCreateMaiaSessionId();
      if (identity) {
        setSessionId(identity.sessionId);
        // The sheet can mint the day's session before /maia ever mounts. Same
        // idempotent helper, same single policy — it discarded `isNew` here, so
        // without this the boundary went uncrossed whenever presence arrived first.
        ensureSessionSanctuary(identity.sessionId);
      }
    })();
    return () => { cancelled = true; };
  }, [hasMember]);

  const governedRoom = resolveGovernedRoom(pathname);
  const fullSurface = isFullConversationRoute(pathname);
  // Room-registered facts win over registry derivation (richer, same truth class).
  const place = useMemo<MaiaPlaceContext | null>(
    () => registeredPlace ?? placeFromPathname(pathname),
    [registeredPlace, pathname],
  );

  const openMaia = useCallback(() => {
    setHasEverOpened(true);
    setIsOpen(true);
  }, []);
  const closeMaia = useCallback(() => setIsOpen(false), []);
  const registerPlace = useCallback((p: MaiaPlaceContext | null) => setRegisteredPlace(p), []);

  const value = useMemo<MaiaPresenceValue>(
    () => ({ place, isOpen, openMaia, closeMaia, registerPlace }),
    [place, isOpen, openMaia, closeMaia, registerPlace],
  );

  // The presence surface renders only for a signed-in member, on a governed
  // room, off the full conversation surfaces. Unauthenticated and public
  // routes get children only — no member state, no handle, nothing.
  const showPresence = hasMember && !!governedRoom && !fullSurface && !!sessionId;

  // Close the sheet if navigation lands on a full conversation surface —
  // the page itself is now the relationship surface.
  useEffect(() => {
    if (fullSurface && isOpen) setIsOpen(false);
  }, [fullSurface, isOpen]);

  // Keyboard access: Escape closes; focus lands on the close control when the
  // sheet opens so keyboard members aren't stranded behind the scrim.
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <MaiaPresenceContext.Provider value={value}>
      {children}

      {showPresence && (
        <>
          {/* Quiet handle — static, small, clearly MAIA, never pulses or auto-opens */}
          {!isOpen && (
            <button
              type="button"
              onClick={openMaia}
              aria-label="Open your conversation with MAIA"
              className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full
                         border border-amber-500/30 bg-[#1A1513]/90 px-3.5 py-2 shadow-lg
                         backdrop-blur-sm transition-colors hover:border-amber-400/50
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
            >
              <span aria-hidden className="block h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="text-sm font-medium text-amber-100/90">MAIA</span>
            </button>
          )}

          {/* Conversation sheet — the SAME canonical relationship, over the room.
              Mounted on first open, then kept alive (hidden) across routes. */}
          {hasEverOpened && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Conversation with MAIA"
              aria-hidden={!isOpen}
              className={
                isOpen
                  ? 'fixed inset-0 z-[80] flex items-end justify-end sm:p-4'
                  : 'pointer-events-none fixed inset-0 z-[80] hidden'
              }
            >
              {/* Scrim — the room stays visible beneath; click closes */}
              <div
                aria-hidden
                onClick={closeMaia}
                className="absolute inset-0 bg-black/40"
              />
              <div
                className="relative flex h-[85vh] w-full flex-col overflow-hidden
                           rounded-t-2xl border border-amber-500/20 bg-[#1A1513] shadow-2xl
                           sm:h-[80vh] sm:max-w-md sm:rounded-2xl"
              >
                <div className="flex items-center justify-between border-b border-amber-500/15 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="block h-2 w-2 rounded-full bg-amber-400/80" />
                    <span className="text-sm font-medium text-amber-100/90">MAIA</span>
                    {place && (
                      <span className="text-xs text-amber-100/40">· {place.placeName}</span>
                    )}
                  </div>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={closeMaia}
                    aria-label="Close MAIA (your conversation is kept)"
                    className="rounded p-1.5 text-amber-100/60 transition-colors hover:text-amber-100
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="min-h-0 flex-1">
                  <OracleConversation
                    userId={getValidMemberId() || undefined}
                    userName={memberName}
                    sessionId={sessionId as string}
                    apiEndpoint="/api/sovereign/app/maia/list"
                    consciousnessType="maia"
                    voiceEnabled={false}
                    initialShowChatInterface={true}
                    placeContext={place ?? undefined}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </MaiaPresenceContext.Provider>
  );
}
