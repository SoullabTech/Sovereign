'use client';

/**
 * MaiaShell — Spatial layout shell for the MAIA presence environment
 *
 * Talk-first architecture: voice state drives shell behavior.
 * Calm mode: when voice is flowing, shell chrome softly de-emphasizes
 * so the center field becomes sovereign. Any interaction restores it.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { MaiaTopBar } from './MaiaTopBar';
import { MaiaRightPanelHost } from './MaiaRightPanelHost';
import { MaiaHouseSheet } from './MaiaHouseSheet';
import { useVoiceState } from '@/lib/maia/voiceStateContext';
import { useSession } from '@/lib/hooks/useSession';
import { onVoiceNavigate } from '@/lib/maia/voiceNavigationBridge';
import type { MaiaWorldId, MaiaBehavior } from '@/lib/navigation/types';
import type { ConversationInsight } from '@/lib/maia/cognitionEvents';

interface MaiaShellProps {
  explorerName: string;
  explorerId: string;
  /** true = voice mode (showChatInterface false), false = text mode */
  isVoiceMode: boolean;
  behavior: MaiaBehavior;
  onToggleInputMode: () => void;
  onOpenHelp: () => void;
  onOpenAccount: () => void;
  onOpenJournalSheet: () => void;
  onOpenShadowWork: () => void;
  onOpenAcademy: () => void;
  onOpenChanges: () => void;
  onOpenDecisions: () => void;
  onLabAction: (action: string) => void;
  /** MAIA mode — primary state of entry (Talk / Care / Note) */
  activeMode?: 'normal' | 'patient' | 'session';
  onModeChange?: (mode: 'normal' | 'patient' | 'session') => void;
  /** Ask MAIA — orientation + Knowledge Field stance */
  askMode?: boolean;
  onAskModeChange?: (active: boolean) => void;
  /**
   * Arrival mode (Step 3) — first-visit only. The rail and chrome recede so
   * a newcomer meets one invitation, nothing competing. The House doorway
   * remains, so the whole world is one tap away. Returning members render
   * with arrivalMode=false — their surface is unchanged.
   */
  arrivalMode?: boolean;
  /**
   * The House's deliberate return to Arrival. Invoked by the member, never by
   * the system. Opens the room for this session only — it must NOT clear the
   * durable first-crossing marker. Returning to Arrival is opening a room, not
   * undoing an initiation.
   */
  onReturnToArrival?: () => void;
  /**
   * Whether the return affordance should appear at all. False while Arrival is
   * already on screen (there is nothing to return to) and false when the
   * arrivalEntry kill-switch is off (there is no room to open).
   */
  canReturnToArrival?: boolean;
  children: React.ReactNode;
}

export function MaiaShell({
  explorerName,
  explorerId,
  isVoiceMode,
  behavior,
  onToggleInputMode,
  onOpenHelp,
  onOpenAccount,
  onOpenJournalSheet,
  onOpenShadowWork,
  onOpenAcademy,
  onOpenChanges,
  onOpenDecisions,
  onLabAction,
  activeMode,
  onModeChange,
  askMode,
  onAskModeChange,
  arrivalMode = false,
  onReturnToArrival,
  canReturnToArrival = false,
  children,
}: MaiaShellProps) {
  const router = useRouter();
  const { isAdmin, isPractitioner } = useSession();
  const [activeWorld, setActiveWorld] = useState<MaiaWorldId>('maia');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [userPinnedPanel, setUserPinnedPanel] = useState(false);
  const [houseOpen, setHouseOpen] = useState(false);

  // The Arrival composition renders in a portal outside this tree, so its quiet
  // base doorway cannot call setHouseOpen directly. It announces the intent and
  // the shell — which owns the sheet — answers. Without this listener the
  // arrival doorway dispatches into the void and reads as decorative.
  useEffect(() => {
    const openHouse = () => setHouseOpen(true);
    window.addEventListener('openMaiaHouse', openHouse);
    return () => window.removeEventListener('openMaiaHouse', openHouse);
  }, []);

  // --- Calm mode ---
  const { isVoiceFlowing, isSanctuary } = useVoiceState();
  const [calmMode, setCalmMode] = useState(false);
  const calmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced calm mode: engage after 1.5s of voice flowing, disengage after 0.5s of silence
  // Max calm duration: 12s — then gently restore to partial visibility (40%) for orientation
  const MAX_CALM_DURATION = 12000;
  const calmCeilingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [calmCeiling, setCalmCeiling] = useState(false); // true = max duration reached, show at 40%

  useEffect(() => {
    if (isVoiceFlowing) {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      calmTimerRef.current = setTimeout(() => {
        setCalmMode(true);
        setCalmCeiling(false);
        // Start max-duration ceiling timer
        calmCeilingRef.current = setTimeout(() => setCalmCeiling(true), MAX_CALM_DURATION);
      }, 1500);
    } else {
      if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
      if (calmCeilingRef.current) clearTimeout(calmCeilingRef.current);
      setCalmCeiling(false);
      revealTimerRef.current = setTimeout(() => setCalmMode(false), 500);
    }
    return () => {
      if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (calmCeilingRef.current) clearTimeout(calmCeilingRef.current);
    };
  }, [isVoiceFlowing]);

  // Any interaction immediately reveals chrome (pointer, click, keyboard)
  const revealChrome = useCallback(() => {
    setCalmMode(false);
    setCalmCeiling(false);
    // Re-engage after 3s if voice is still flowing
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
    calmTimerRef.current = setTimeout(() => {
      // Only re-engage if voice is still flowing (check via ref would be ideal,
      // but we rely on the useEffect above to re-engage on next isVoiceFlowing tick)
    }, 3000);
  }, []);

  useEffect(() => {
    const handler = () => revealChrome();
    window.addEventListener('pointermove', handler, { passive: true });
    window.addEventListener('pointerdown', handler, { passive: true });
    window.addEventListener('keydown', handler, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handler);
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [revealChrome]);

  // --- World navigation ---
  const handleWorldChange = useCallback((world: MaiaWorldId) => {
    setActiveWorld(world);
    if (world === 'maia') {
      // Only auto-close if user didn't explicitly pin the panel
      if (!userPinnedPanel) {
        setRightPanelOpen(false);
      }
    } else {
      setRightPanelOpen(true);
      setUserPinnedPanel(true); // User explicitly chose a world
    }
  }, [userPinnedPanel]);

  // Auto-close right panel during voice flow ONLY if user hasn't pinned it
  useEffect(() => {
    if (isVoiceFlowing && activeWorld === 'maia' && !userPinnedPanel) {
      setRightPanelOpen(false);
    }
  }, [isVoiceFlowing, activeWorld, userPinnedPanel]);

  const handleCloseRightPanel = useCallback(() => {
    setRightPanelOpen(false);
    setUserPinnedPanel(false); // User explicitly closed it
  }, []);

  // --- Voice-driven navigation ---
  // Listen for voice commands that navigate between worlds.
  // Studio transitions use router.push (handled in the bridge detail).
  useEffect(() => {
    const cleanup = onVoiceNavigate((detail) => {
      console.log(`🧭 [MaiaShell] Voice navigation received: ${detail.worldId}`);
      if (detail.worldId === 'studio') {
        // Studio is a boundary transition — navigate to separate shell
        router.push('/studio');
      } else {
        handleWorldChange(detail.worldId as MaiaWorldId);
        // Also reveal chrome briefly so user sees the transition
        revealChrome();
      }
    });
    return cleanup;
  }, [handleWorldChange, revealChrome]);

  // --- Cognition signals ---
  // PRODUCTION: empty until real oracle/memory signals are wired (Phase 7).
  // DEV ONLY: mock signals fire in development to validate UI behavior.
  // Mock signals MUST NOT run in production — they simulate intelligence without substance.
  const [insights, setInsights] = useState<ConversationInsight[]>([]);
  const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDev) return; // No mock signals in production

    const MOCK_POOL: Omit<ConversationInsight, 'id' | 'timestamp'>[] = [
      { type: 'pattern-match', title: 'Recurring theme', summary: 'This pattern has appeared in 3 recent conversations.', relevance: 0.6, worldId: 'patterns' },
      { type: 'theme-emergence', title: 'Worth capturing', summary: 'This thought might be worth journaling.', relevance: 0.5, worldId: 'journal' },
      { type: 'sacred-resonance', title: 'Wisdom resonance', summary: 'This echoes something from the wisdom tradition you explored.', relevance: 0.4, worldId: 'wisdom' },
    ];

    const scheduleNext = () => {
      const delay = 25000 + Math.random() * 15000;
      mockTimerRef.current = setTimeout(() => {
        if (Math.random() < 0.5) { scheduleNext(); return; }

        const template = MOCK_POOL[Math.floor(Math.random() * MOCK_POOL.length)];
        const insight: ConversationInsight = {
          ...template,
          id: `mock-${Date.now()}`,
          timestamp: Date.now(),
        };

        setInsights(prev => [...prev, insight].slice(-2));
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => { if (mockTimerRef.current) clearTimeout(mockTimerRef.current); };
  }, [isDev]);

  // Derive worldHints from current insights (single breath per world, not persistent)
  // Sanctuary mode: suppress ALL cognition signals — no hints, no insights
  const safeInsights = isSanctuary ? [] : insights;
  const worldHints: Partial<Record<MaiaWorldId, boolean>> = {};
  if (!isSanctuary) {
    for (const insight of insights) {
      if (insight.worldId && insight.worldId !== activeWorld) {
        worldHints[insight.worldId] = true;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <MaiaTopBar
        explorerName={explorerName}
        behavior={behavior}
        calmMode={calmMode}
        calmCeiling={calmCeiling}
        onOpenAccount={onOpenAccount}
      />

      {/* THE RAIL IS RETIRED — founder ruling, 2026-07-22.
       *
       *   The House is the solution to platform complexity. MAIA is the primary
       *   relationship. The House contains the places. The member should not
       *   encounter the platform as a rail of product features.
       *
       * The House previously failed this ruling by being added ALONGSIDE the
       * rail rather than replacing it: eleven destinations stayed permanently
       * exposed while the House offered the same places again, so the member met
       * the product's internal map before they met the place.
       *
       * Every destination the rail carried is registered in lib/navigation/maiaNav
       * and is reachable through The House, under the same visibility rules — the
       * registry is the single source, so nothing became unreachable and no
       * permission changed. The rail component itself is left in the tree for the
       * founder/steward surfaces that still mount it directly.
       *
       * ⚠️ Do not reintroduce a permanent multi-icon rail here, and do not add a
       * chevron rail beside the House. Disclosure belongs INSIDE the House.
       */}

      {/* Center field — the conversation is the surface; nothing is offset for
          navigation any more, because there is no navigation column. */}
      <main
        className="mt-12 transition-all duration-300"
        style={{ marginRight: rightPanelOpen ? '20rem' : 0 }}
      >
        {children}
      </main>

      {/* The House — THE doorway. Now the only permanent navigation on the
          conversation surface: MAIA, and one way into the places.

          GEOMETRY IS LOAD-BEARING. This must render at the SAME box as the
          Arrival composition's doorway, because Arrival and conversation swap
          beneath a member who should never have to re-find the way out. The
          container mirrors MaiaArrivalField's header exactly — h-[54px],
          px-4 md:px-6 — and the button mirrors its button — -ml-1, h-11, px-2,
          no pill. That yields an identical box in both states:

              desktop  x=20  y=5  114x44
              mobile   x=12  y=5  114x44

          A previous pass placed this at `left-3 top-14` and asserted in a
          comment that it matched Arrival. It did not: measured, it sat at
          (12,56) 124x44 — a 51px jump and a 10px width change every time
          Arrival gave way to conversation. Do not re-anchor this to the top bar
          height or to a `top-*` offset; anchor it to the same header box, and
          verify by measuring the bounding box in both states, not by reading
          this comment.

          Hidden while Arrival is on screen — Arrival carries its own doorway at
          these coordinates. One House, one renderer, one doorway. */}
      {!arrivalMode && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[85] flex h-[54px] items-center px-4 md:px-6">
          <button
            onClick={() => setHouseOpen(true)}
            className={`
              group pointer-events-auto -ml-1 flex h-11 min-w-[44px] items-center gap-2 rounded-full px-2
              text-[rgba(201,165,78,0.75)] transition-colors hover:text-[#c9a54e] focus:outline-none
              ${calmMode && !calmCeiling ? 'opacity-60 hover:opacity-100' : 'opacity-100'}
            `}
            title="The House — your places and practices"
            aria-label="Open The House"
          >
            <Home className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
            {/* The label is revealed, not removed. The icon alone is the resting
                state — after a few uses a doorway does not need to say its own
                name, and the permanent label was the widest thing in the bar,
                which is what crowded MAIA off small screens.

                Revealed on hover AND on keyboard focus: hover-only would hide
                the name from anyone navigating by keyboard, who needs it most.
                Width animates rather than the label appearing/disappearing, so
                nothing beside it jumps. `aria-label` on the button carries the
                name unconditionally, so screen readers never depend on hover. */}
            <span
              className="max-w-0 overflow-hidden whitespace-nowrap text-[15px] leading-none opacity-0 transition-all duration-300 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
              aria-hidden="true"
            >
              The House
            </span>
          </button>
        </div>
      )}

      <MaiaHouseSheet
        open={houseOpen}
        onClose={() => setHouseOpen(false)}
        isFounder={isAdmin || isPractitioner}
        onOpenHelp={onOpenHelp}
        onOpenAccount={() => { setHouseOpen(false); onOpenAccount(); }}
        onReturnToArrival={
          canReturnToArrival && onReturnToArrival
            ? () => { setHouseOpen(false); onReturnToArrival(); }
            : undefined
        }
      />

      <MaiaRightPanelHost
        isOpen={rightPanelOpen}
        activeWorld={activeWorld}
        explorerId={explorerId}
        insights={safeInsights}
        onClose={handleCloseRightPanel}
        onOpenJournalSheet={onOpenJournalSheet}
        onOpenShadowWork={onOpenShadowWork}
        onOpenAcademy={onOpenAcademy}
        onOpenChanges={onOpenChanges}
        onOpenDecisions={onOpenDecisions}
        onChooseGuide={() => onLabAction('choose-guide')}
        onShowCurrentElder={() => onLabAction('show-current-elder')}
      />
    </div>
  );
}
