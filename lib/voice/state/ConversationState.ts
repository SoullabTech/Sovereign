import { create } from 'zustand';

/**
 * Conversation State Store
 *
 * Global Zustand store for MAIA voice state management.
 * Eliminates React hooks violations by moving state outside React lifecycle.
 *
 * Can be accessed:
 * - Inside React: useConversationState()
 * - Outside React: useConversationState.getState()
 *
 * This solves errors #425 and #422 (React hooks violations).
 */

export type VoiceMode = 'scribe' | 'active' | 'full';

export interface ConversationMessage {
  role: 'user' | 'maia';
  text: string;
  timestamp: number;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  affect?: 'joy' | 'sadness' | 'anger' | 'fear' | 'neutral';
}

export interface TimingMetric {
  stage: string;
  timestamp: number;
  delta?: number;
}

interface ConversationState {
  // Mode
  mode: VoiceMode;
  setMode: (mode: VoiceMode) => void;

  // Conversation history
  history: ConversationMessage[];
  addMessage: (message: Omit<ConversationMessage, 'timestamp'>) => void;
  clearHistory: () => void;

  // Current state flags
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  setListening: (listening: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setSpeaking: (speaking: boolean) => void;

  // Current transcript (accumulating)
  currentTranscript: string;
  setCurrentTranscript: (text: string) => void;
  appendTranscript: (text: string) => void;
  clearTranscript: () => void;

  // Performance tracking
  timings: TimingMetric[];
  addTiming: (stage: string, timestamp: number) => void;
  clearTimings: () => void;
  getAverageLatency: () => number;

  // Elemental state
  currentElement: 'fire' | 'water' | 'earth' | 'air' | 'aether' | null;
  setCurrentElement: (element: ConversationState['currentElement']) => void;

  // Error tracking
  lastError: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;

  // Session management
  sessionStart: number | null;
  startSession: () => void;
  endSession: () => void;
  getSessionDuration: () => number;

  // Reset all state
  reset: () => void;
}

const initialState = {
  mode: 'active' as VoiceMode,
  history: [],
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  currentTranscript: '',
  timings: [],
  currentElement: null,
  lastError: null,
  sessionStart: null,
};

export const useConversationState = create<ConversationState>((set, get) => ({
  ...initialState,

  // Mode
  setMode: (mode) => {
    set({ mode });
    console.log(`[CONVERSATION_STATE] Mode switched to: ${mode}`);
  },

  // History
  addMessage: (message) => {
    const timestamp = Date.now();
    set((state) => ({
      history: [
        ...state.history,
        { ...message, timestamp }
      ]
    }));
    console.log(`[CONVERSATION_STATE] Message added (${message.role}):`, message.text.substring(0, 50));
  },

  clearHistory: () => {
    set({ history: [] });
    console.log('[CONVERSATION_STATE] History cleared');
  },

  // State flags
  setListening: (isListening) => {
    set({ isListening });
    if (isListening) {
      console.log('[CONVERSATION_STATE] 🎤 Listening started');
    } else {
      console.log('[CONVERSATION_STATE] 🎤 Listening stopped');
    }
  },

  setProcessing: (isProcessing) => {
    set({ isProcessing });
    if (isProcessing) {
      console.log('[CONVERSATION_STATE] ⚙️ Processing started');
    } else {
      console.log('[CONVERSATION_STATE] ⚙️ Processing complete');
    }
  },

  setSpeaking: (isSpeaking) => {
    set({ isSpeaking });
    if (isSpeaking) {
      console.log('[CONVERSATION_STATE] 🔊 Speaking started');
    } else {
      console.log('[CONVERSATION_STATE] 🔊 Speaking ended');
    }
  },

  // Transcript
  setCurrentTranscript: (currentTranscript) => set({ currentTranscript }),

  appendTranscript: (text) => set((state) => ({
    currentTranscript: state.currentTranscript
      ? `${state.currentTranscript} ${text}`.trim()
      : text.trim()
  })),

  clearTranscript: () => set({ currentTranscript: '' }),

  // Timings
  addTiming: (stage, timestamp) => set((state) => {
    const prevTiming = state.timings[state.timings.length - 1];
    const newTiming: TimingMetric = {
      stage,
      timestamp,
      delta: prevTiming ? timestamp - prevTiming.timestamp : undefined
    };

    // Color-coded logging
    const deltaColor = !newTiming.delta ? '' :
      newTiming.delta < 100 ? '\x1b[32m' :  // green
      newTiming.delta < 500 ? '\x1b[33m' :  // yellow
      '\x1b[31m';  // red
    const reset = '\x1b[0m';

    console.log(
      `[TIMING] ${stage}: ${timestamp}ms ${deltaColor}(Δ ${newTiming.delta || 0}ms)${reset}`
    );

    return { timings: [...state.timings, newTiming] };
  }),

  clearTimings: () => set({ timings: [] }),

  getAverageLatency: () => {
    const { timings } = get();
    if (timings.length === 0) return 0;

    const deltas = timings
      .map(t => t.delta)
      .filter((d): d is number => d !== undefined);

    if (deltas.length === 0) return 0;

    return deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
  },

  // Elemental
  setCurrentElement: (currentElement) => {
    set({ currentElement });
    if (currentElement) {
      console.log(`[CONVERSATION_STATE] Element detected: ${currentElement}`);
    }
  },

  // Errors
  setError: (lastError) => {
    set({ lastError });
    if (lastError) {
      console.error('[CONVERSATION_STATE] Error:', lastError.message);
    }
  },

  clearError: () => set({ lastError: null }),

  // Session
  startSession: () => {
    const sessionStart = Date.now();
    set({ sessionStart, timings: [], history: [] });
    console.log('[CONVERSATION_STATE] 🚀 Session started');
  },

  endSession: () => {
    const duration = get().getSessionDuration();
    set({ sessionStart: null });
    console.log(`[CONVERSATION_STATE] 🏁 Session ended (duration: ${(duration / 1000).toFixed(1)}s)`);
  },

  getSessionDuration: () => {
    const { sessionStart } = get();
    if (!sessionStart) return 0;
    return Date.now() - sessionStart;
  },

  // Reset
  reset: () => {
    set(initialState);
    console.log('[CONVERSATION_STATE] 🔄 State reset');
  },
}));

// Selectors for optimized access
export const selectMode = (state: ConversationState) => state.mode;
export const selectHistory = (state: ConversationState) => state.history;
export const selectIsActive = (state: ConversationState) =>
  state.isListening || state.isProcessing || state.isSpeaking;
export const selectCurrentElement = (state: ConversationState) => state.currentElement;
export const selectLatency = (state: ConversationState) => state.getAverageLatency();

// Export type for external use
export type { ConversationState };
