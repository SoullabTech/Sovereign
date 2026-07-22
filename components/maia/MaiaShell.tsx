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
import { MaiaLeftRail } from './MaiaLeftRail';
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
  children,
}: MaiaShellProps) {
  const router = useRouter();
  const { isAdmin, isPractitioner } = useSession();
  const [activeWorld, setActiveWorld] = useState<MaiaWorldId>('maia');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [userPinnedPanel, setUserPinnedPanel] = useState(false);
  const [houseOpen, setHouseOpen] = useState(false);

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
        isVoiceMode={isVoiceMode}
        behavior={behavior}
        calmMode={calmMode}
        calmCeiling={calmCeiling}
        onToggleInputMode={onToggleInputMode}
        onOpenHelp={onOpenHelp}
        onOpenAccount={onOpenAccount}
      />

      {/* Arrival (Step 3): a newcomer meets one invitation — the rail recedes.
          Returning members (arrivalMode=false) keep the rail exactly as before. */}
      {!arrivalMode && (
        <MaiaLeftRail
          activeWorld={activeWorld}
          calmMode={calmMode}
          calmCeiling={calmCeiling}
          worldHints={worldHints}
          onWorldChange={handleWorldChange}
          onOpenAccount={onOpenAccount}
          onCaptureSpirit={() => onLabAction('capture-spirit')}
          activeMode={activeMode}
          onModeChange={onModeChange}
          isVoiceInput={isVoiceMode}
          onToggleInputMode={onToggleInputMode}
          askMode={askMode}
          onAskModeChange={onAskModeChange}
        />
      )}

      {/* Center field — offset for rail and top bar (no rail offset in Arrival) */}
      <main
        className={`mt-12 transition-all duration-300 ${arrivalMode ? 'ml-0' : 'ml-14'}`}
        style={{ marginRight: rightPanelOpen ? '20rem' : 0 }}
      >
        {children}
      </main>

      {/* The House — the newcomer's ONE doorway while the rail is receded.
          Never shown to returning members: they keep the rail, which already
          holds every place, so a floating House pill would only compete. */}
      {arrivalMode && (
        <>
          <button
            onClick={() => setHouseOpen(true)}
            className={`
              group fixed bottom-20 left-1/2 z-[85] flex -translate-x-1/2 items-center gap-2
              rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-md
              transition-all duration-500 hover:border-white/20 hover:bg-black/40
              ${calmMode && !calmCeiling ? 'opacity-0 hover:opacity-100' : 'opacity-70 hover:opacity-100'}
            `}
            title="The House — your places and practices"
            aria-label="Open The House"
          >
            <Home className="h-4 w-4 text-[#c9a54e]" strokeWidth={1.5} />
            <span className="text-[13px] text-slate-200" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
              The House
            </span>
          </button>

          <MaiaHouseSheet
            open={houseOpen}
            onClose={() => setHouseOpen(false)}
            isFounder={isAdmin || isPractitioner}
          />
        </>
      )}

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
