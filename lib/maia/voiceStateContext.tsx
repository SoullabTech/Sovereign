'use client';

/**
 * VoiceStateContext — Broadcasts voice presence state to the spatial shell
 *
 * Talk-first architecture: voice state is the primary driver of UI behavior.
 * The center field, left rail, top bar, and right panel all respond to this context.
 *
 * Source of truth: page.tsx derives presenceState from existing OracleConversation
 * callback signals. No OracleConversation internals are touched.
 */

import { createContext, useContext, useMemo } from 'react';
import type { VoicePresenceState, MaiaWorldId } from '@/lib/navigation/types';

export interface VoiceStateContextValue {
  /** Current voice lifecycle phase */
  presenceState: VoicePresenceState;
  /** Audio amplitude 0-1, drives particle/glow intensity */
  amplitude: number;
  /** Whether voice is actively flowing (listening OR responding) — triggers calm mode */
  isVoiceFlowing: boolean;
  /** Whether a conversation turn is in progress (processing or responding) */
  isConversationActive: boolean;
  /** Sanctuary mode — no cognition signals, no insights, no world hints */
  isSanctuary: boolean;
}

const VoiceStateContext = createContext<VoiceStateContextValue>({
  presenceState: 'idle',
  amplitude: 0,
  isVoiceFlowing: false,
  isConversationActive: false,
  isSanctuary: false,
});

interface VoiceStateProviderProps {
  presenceState: VoicePresenceState;
  amplitude: number;
  isSanctuary?: boolean;
  children: React.ReactNode;
}

export function VoiceStateProvider({ presenceState, amplitude, isSanctuary = false, children }: VoiceStateProviderProps) {
  const value = useMemo<VoiceStateContextValue>(() => ({
    presenceState,
    amplitude,
    isVoiceFlowing: presenceState === 'listening' || presenceState === 'responding',
    isConversationActive: presenceState === 'processing' || presenceState === 'responding',
    isSanctuary,
  }), [presenceState, amplitude, isSanctuary]);

  return (
    <VoiceStateContext.Provider value={value}>
      {children}
    </VoiceStateContext.Provider>
  );
}

/** Hook to consume voice state in any shell component */
export function useVoiceState(): VoiceStateContextValue {
  return useContext(VoiceStateContext);
}
