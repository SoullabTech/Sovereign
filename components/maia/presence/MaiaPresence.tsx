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
 *  - Three concepts, deliberately NOT one boolean:
 *      canHost    — may MAIA be hosted here at all (governed room + signed-in
 *                   member + session). Constitutional/platform permission.
 *      showHandle — does this surface OFFER MAIA unprompted (place.ts
 *                   handleVisibility). Experiential; narrower than canHost.
 *      openMaiaWith — an explicit member invocation carrying a scoped
 *                   contribution. Works wherever canHost holds, handle or not.
 *  - MAIA never speaks first from this surface; opening the sheet shows the
 *    conversation — it does not trigger a message.
 *  - Place context is held here and travels ONLY inside a message the member
 *    sends (see OracleConversation body build). Route changes transmit nothing.
 *  - A room may hand a member-composed message straight into this conversation
 *    (openMaiaWith) so the member stays in the room instead of being moved to
 *    /maia. It is still member-initiated and still one conversation: the sheet
 *    opens over the room and the message appends to the running transcript.
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
import { getValidMemberId } from '@/lib/http/apiBase';
import { getOrCreateMaiaSessionId } from '@/lib/maia/presence/conversationIdentity';
import {
  type MaiaPlaceContext,
  isFullConversationRoute,
  isMaiaHandleVisible,
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
  /**
   * Open the sheet AND send a message the member composed in the room — the
   * in-place handoff (e.g. "Discuss this with MAIA" on a reflection). The room
   * stays on screen; the conversation opens over it. Only ever called from a
   * member gesture, and only with text the member has read: no room may push
   * material into the conversation on its own.
   */
  openMaiaWith: (prompt: string) => void;
  closeMaia: () => void;
  /** Room-supplied place override (useMaiaPlace). */
  registerPlace: (place: MaiaPlaceContext | null) => void;
  /**
   * True when this layer can actually host the conversation here (signed-in
   * member, governed room, not a full conversation surface). A room offering an
   * in-place handoff reads this to decide whether to open over itself or fall
   * back to navigating — so the gesture never dead-ends silently.
   */
  canHost: boolean;
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
  // Nonce-keyed so the same text can be sent twice and a re-render never resends.
  const [injectedMessage, setInjectedMessage] = useState<{ text: string; nonce: number } | null>(null);
  const injectionNonceRef = useRef(0);

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
    const identity = getOrCreateMaiaSessionId();
    if (identity) setSessionId(identity.sessionId);
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
  const openMaiaWith = useCallback((prompt: string) => {
    const text = prompt?.trim();
    if (!text) return;
    injectionNonceRef.current += 1;
    setInjectedMessage({ text, nonce: injectionNonceRef.current });
    setHasEverOpened(true);
    setIsOpen(true);
  }, []);
  const closeMaia = useCallback(() => setIsOpen(false), []);
  const registerPlace = useCallback((p: MaiaPlaceContext | null) => setRegisteredPlace(p), []);

  // The presence surface renders only for a signed-in member, on a governed
  // room, off the full conversation surfaces. Unauthenticated and public
  // routes get children only — no member state, no handle, nothing.
  const showPresence = hasMember && !!governedRoom && !fullSurface && !!sessionId;

  // The handle is offered on a NARROWER set of surfaces than presence can host.
  // A room may be fully MAIA-capable and still not advertise — e.g. an index or
  // feed with no object in view. The sheet itself renders on showPresence, so a
  // member gesture (openMaiaWith) still opens MAIA where the handle is hidden.
  const showHandle = showPresence && isMaiaHandleVisible(pathname, place);

  const value = useMemo<MaiaPresenceValue>(
    () => ({ place, isOpen, openMaia, openMaiaWith, closeMaia, registerPlace, canHost: showPresence }),
    [place, isOpen, openMaia, openMaiaWith, closeMaia, registerPlace, showPresence],
  );

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
          {/* Quiet handle — static, small, clearly MAIA, never pulses or auto-opens.
              Gated on showHandle, not showPresence: see the three concepts above. */}
          {showHandle && !isOpen && (
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
                    presentationMode="contained"
                    placeContext={place ?? undefined}
                    injectedMessage={injectedMessage}
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
