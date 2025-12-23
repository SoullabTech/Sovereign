/**
 * Journey Page - Zustand Store
 *
 * Five-element state management for the MAIA Journey Page.
 * Manages view modes, selections, and visibility for all five Spiralogic elements.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Created: December 23, 2024
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export type ViewMode =
  | 'spiral'      // Default: 3D spiral visualization
  | 'tapestry'    // Grid view of thread cards
  | 'narrative'   // Linear story timeline
  | 'timeline'    // Chronological biofield events
  | 'biofield'    // Focus on embodied metrics
  | 'aether';     // Meta-awareness constellation view

export interface JourneyState {
  // ============================================================================
  // View Mode
  // ============================================================================
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // ============================================================================
  // Thread Selection (for Aether synthesis)
  // ============================================================================
  selectedThreads: number[];
  toggleThreadSelection: (threadId: number) => void;
  clearSelection: () => void;
  selectMultiple: (threadIds: number[]) => void;

  // ============================================================================
  // 🫀 Earth Layer (Embodied Awareness)
  // ============================================================================
  biofieldPanelVisible: boolean;
  showBiofieldPanel: () => void;
  hideBiofieldPanel: () => void;
  toggleBiofieldPanel: () => void;

  // ============================================================================
  // 💧 Water Layer (Emotional Flow)
  // ============================================================================
  threadSidebarVisible: boolean;
  showThreadSidebar: () => void;
  hideThreadSidebar: () => void;
  toggleThreadSidebar: () => void;

  // Active thread for detail modal
  activeThreadId: number | null;
  setActiveThread: (threadId: number | null) => void;

  // ============================================================================
  // 🔥 Fire Layer (Expression & Sovereignty)
  // ============================================================================
  coAuthorMode: boolean;
  enableCoAuthorMode: () => void;
  disableCoAuthorMode: () => void;
  toggleCoAuthorMode: () => void;

  // ============================================================================
  // 🌬️ Air Layer (Reflection & Insight)
  // ============================================================================
  insightPanelVisible: boolean;
  showInsightPanel: () => void;
  hideInsightPanel: () => void;
  toggleInsightPanel: () => void;

  // Symbol cloud filter
  activeSymbol: string | null;
  setActiveSymbol: (symbol: string | null) => void;

  // ============================================================================
  // ✨ Aether Layer (Integration & Meta-Awareness)
  // ============================================================================
  aetherModeActive: boolean;
  enableAetherMode: () => void;
  disableAetherMode: () => void;
  toggleAetherMode: () => void;

  synthesisPanelVisible: boolean;
  showSynthesisPanel: () => void;
  hideSynthesisPanel: () => void;

  collectiveCoherenceVisible: boolean;
  showCollectiveCoherence: () => void;
  hideCollectiveCoherence: () => void;
  toggleCollectiveCoherence: () => void;

  // ============================================================================
  // Modal State
  // ============================================================================
  presenceOverlayVisible: boolean;
  showPresenceOverlay: () => void;
  hidePresenceOverlay: () => void;

  // ============================================================================
  // UI Preferences
  // ============================================================================
  spiralAnimationEnabled: boolean;
  toggleSpiralAnimation: () => void;

  compactMode: boolean;
  toggleCompactMode: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useJourneyStore = create<JourneyState>()(
  devtools(
    (set) => ({
      // ============================================================================
      // View Mode
      // ============================================================================
      viewMode: 'spiral',
      setViewMode: (mode) => set({ viewMode: mode }),

      // ============================================================================
      // Thread Selection
      // ============================================================================
      selectedThreads: [],
      toggleThreadSelection: (threadId) =>
        set((state) => ({
          selectedThreads: state.selectedThreads.includes(threadId)
            ? state.selectedThreads.filter((id) => id !== threadId)
            : [...state.selectedThreads, threadId],
        })),
      clearSelection: () => set({ selectedThreads: [] }),
      selectMultiple: (threadIds) => set({ selectedThreads: threadIds }),

      // ============================================================================
      // 🫀 Earth Layer
      // ============================================================================
      biofieldPanelVisible: true,
      showBiofieldPanel: () => set({ biofieldPanelVisible: true }),
      hideBiofieldPanel: () => set({ biofieldPanelVisible: false }),
      toggleBiofieldPanel: () =>
        set((state) => ({ biofieldPanelVisible: !state.biofieldPanelVisible })),

      // ============================================================================
      // 💧 Water Layer
      // ============================================================================
      threadSidebarVisible: true,
      showThreadSidebar: () => set({ threadSidebarVisible: true }),
      hideThreadSidebar: () => set({ threadSidebarVisible: false }),
      toggleThreadSidebar: () =>
        set((state) => ({ threadSidebarVisible: !state.threadSidebarVisible })),

      activeThreadId: null,
      setActiveThread: (threadId) => set({ activeThreadId: threadId }),

      // ============================================================================
      // 🔥 Fire Layer
      // ============================================================================
      coAuthorMode: false,
      enableCoAuthorMode: () => set({ coAuthorMode: true }),
      disableCoAuthorMode: () => set({ coAuthorMode: false }),
      toggleCoAuthorMode: () =>
        set((state) => ({ coAuthorMode: !state.coAuthorMode })),

      // ============================================================================
      // 🌬️ Air Layer
      // ============================================================================
      insightPanelVisible: false,
      showInsightPanel: () => set({ insightPanelVisible: true }),
      hideInsightPanel: () => set({ insightPanelVisible: false }),
      toggleInsightPanel: () =>
        set((state) => ({ insightPanelVisible: !state.insightPanelVisible })),

      activeSymbol: null,
      setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),

      // ============================================================================
      // ✨ Aether Layer
      // ============================================================================
      aetherModeActive: false,
      enableAetherMode: () =>
        set({
          aetherModeActive: true,
          viewMode: 'aether',
          // Automatically show synthesis panel when multiple threads selected
        }),
      disableAetherMode: () =>
        set({
          aetherModeActive: false,
          synthesisPanelVisible: false,
        }),
      toggleAetherMode: () =>
        set((state) => ({
          aetherModeActive: !state.aetherModeActive,
          viewMode: !state.aetherModeActive ? 'aether' : 'spiral',
        })),

      synthesisPanelVisible: false,
      showSynthesisPanel: () => set({ synthesisPanelVisible: true }),
      hideSynthesisPanel: () => set({ synthesisPanelVisible: false }),

      collectiveCoherenceVisible: true,
      showCollectiveCoherence: () => set({ collectiveCoherenceVisible: true }),
      hideCollectiveCoherence: () => set({ collectiveCoherenceVisible: false }),
      toggleCollectiveCoherence: () =>
        set((state) => ({
          collectiveCoherenceVisible: !state.collectiveCoherenceVisible,
        })),

      // ============================================================================
      // Modal State
      // ============================================================================
      presenceOverlayVisible: false,
      showPresenceOverlay: () => set({ presenceOverlayVisible: true }),
      hidePresenceOverlay: () => set({ presenceOverlayVisible: false }),

      // ============================================================================
      // UI Preferences
      // ============================================================================
      spiralAnimationEnabled: true,
      toggleSpiralAnimation: () =>
        set((state) => ({ spiralAnimationEnabled: !state.spiralAnimationEnabled })),

      compactMode: false,
      toggleCompactMode: () =>
        set((state) => ({ compactMode: !state.compactMode })),
    }),
    { name: 'journey-store' }
  )
);

// ============================================================================
// Selectors (for optimized subscriptions)
// ============================================================================

export const selectViewMode = (state: JourneyState) => state.viewMode;
export const selectSelectedThreads = (state: JourneyState) => state.selectedThreads;
export const selectAetherActive = (state: JourneyState) => state.aetherModeActive;
export const selectInsightVisible = (state: JourneyState) => state.insightPanelVisible;
export const selectSynthesisVisible = (state: JourneyState) => state.synthesisPanelVisible;
