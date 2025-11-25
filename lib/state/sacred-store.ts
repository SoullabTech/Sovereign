// 🌸 Sacred State Management Store
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface VoiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

interface MotionState {
  state: 'stillness' | 'listening' | 'processing' | 'responding' | 'breakthrough';
  coherence: number;
  intensity: number;
  transitions: string[];
}

interface AetherState {
  active: boolean;
  stage: 0 | 1 | 2 | 3;
  activation: number;
}

interface AudioState {
  enabled: boolean;
  currentFreq: number | null;
  volume: number;
  pattern: 'ascending' | 'descending' | 'circular' | null;
}

interface SessionState {
  id: string | null;
  userId: string | null;
  history: Array<{
    timestamp: Date;
    coherence: number;
    primaryFacet: string;
  }>;
  uploads: Array<{
    url: string;
    processed: boolean;
  }>;
}

interface OracleState {
  lastResponse: any | null;
  isProcessing: boolean;
  error: string | null;
}

export interface SacredState {
  voice: VoiceState;
  motion: MotionState;
  aether: AetherState;
  audio: AudioState;
  session: SessionState;
  oracle: OracleState;
}

interface SacredActions {
  // Voice actions
  setListening: (listening: boolean) => void;
  setTranscript: (transcript: string) => void;
  clearVoiceError: () => void;
  
  // Motion actions
  setMotionState: (state: Partial<MotionState>) => void;
  setCoherence: (coherence: number) => void;
  triggerBreakthrough: () => void;
  
  // Aether actions
  activateAether: (stage: number) => void;
  progressAether: (progress: number) => void;
  
  // Audio actions
  toggleAudio: () => void;
  setFrequency: (freq: number) => void;
  setVolume: (volume: number) => void;
  
  // Session actions
  startSession: (userId: string) => void;
  addToHistory: (entry: any) => void;
  addUpload: (upload: any) => void;
  endSession: () => void;
  
  // Oracle actions
  setProcessing: (processing: boolean) => void;
  setOracleResponse: (response: any) => void;
  setOracleError: (error: string) => void;
  
  // Global actions
  reset: () => void;
  hydrate: () => void;
}

const initialState: SacredState = {
  voice: {
    isListening: false,
    transcript: '',
    error: null
  },
  motion: {
    state: 'stillness',
    coherence: 0.5,
    intensity: 1.0,
    transitions: []
  },
  aether: {
    active: false,
    stage: 0,
    activation: 0
  },
  audio: {
    enabled: true,
    currentFreq: null,
    volume: 0.05,
    pattern: null
  },
  session: {
    id: null,
    userId: null,
    history: [],
    uploads: []
  },
  oracle: {
    lastResponse: null,
    isProcessing: false,
    error: null
  }
};

const useSacredStore = create<SacredState & SacredActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Voice Actions
        setListening: (listening) => set((state) => ({
          voice: { ...state.voice, isListening: listening },
          motion: { ...state.motion, state: listening ? 'listening' : 'stillness' }
        })),
        
        setTranscript: (transcript) => set((state) => ({
          voice: { ...state.voice, transcript }
        })),
        
        clearVoiceError: () => set((state) => ({
          voice: { ...state.voice, error: null }
        })),
        
        // Motion Actions
        setMotionState: (motionUpdate) => set((state) => ({
          motion: { ...state.motion, ...motionUpdate }
        })),
        
        setCoherence: (coherence) => set((state) => {
          // Auto-activate Aether at high coherence
          const shouldActivateAether = coherence > 0.9 && !state.aether.active;
          return {
            motion: { ...state.motion, coherence },
            aether: shouldActivateAether 
              ? { ...state.aether, active: true, stage: 1 }
              : state.aether
          };
        }),
        
        triggerBreakthrough: () => set((state) => ({
          motion: { ...state.motion, state: 'breakthrough' },
          aether: { ...state.aether, active: true, stage: Math.min(state.aether.stage + 1, 3) as 0 | 1 | 2 | 3 }
        })),
        
        // Aether Actions
        activateAether: (stage) => set((state) => ({
          aether: { active: true, stage: stage as 0 | 1 | 2 | 3, activation: 0 },
          motion: { ...state.motion, state: 'breakthrough' }
        })),
        
        progressAether: (progress) => set((state) => ({
          aether: { ...state.aether, activation: progress }
        })),
        
        // Audio Actions
        toggleAudio: () => set((state) => ({
          audio: { ...state.audio, enabled: !state.audio.enabled }
        })),
        
        setFrequency: (freq) => set((state) => ({
          audio: { ...state.audio, currentFreq: freq }
        })),
        
        setVolume: (volume) => set((state) => ({
          audio: { ...state.audio, volume }
        })),
        
        // Session Actions
        startSession: (userId) => set((state) => ({
          session: {
            ...state.session,
            id: `session_${Date.now()}`,
            userId,
            history: []
          }
        })),
        
        addToHistory: (entry) => set((state) => ({
          session: {
            ...state.session,
            history: [...state.session.history, entry]
          }
        })),
        
        addUpload: (upload) => set((state) => ({
          session: {
            ...state.session,
            uploads: [...state.session.uploads, upload]
          }
        })),
        
        endSession: () => set((state) => ({
          session: {
            ...state.session,
            id: null
          }
        })),
        
        // Oracle Actions
        setProcessing: (processing) => set((state) => ({
          oracle: { ...state.oracle, isProcessing: processing },
          motion: { ...state.motion, state: processing ? 'processing' : 'stillness' }
        })),
        
        setOracleResponse: (response) => set((state) => ({
          oracle: { ...state.oracle, lastResponse: response, error: null },
          motion: { ...state.motion, state: 'responding' }
        })),
        
        setOracleError: (error) => set((state) => ({
          oracle: { ...state.oracle, error, isProcessing: false },
          motion: { ...state.motion, state: 'stillness' }
        })),
        
        // Global Actions
        reset: () => set(initialState),
        
        hydrate: () => set((state) => {
          // Check accessibility preferences
          if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return {
              motion: { ...state.motion, intensity: 0.2 }
            };
          }
          return state;
        })
      }),
      {
        name: 'sacred-portal-state',
        partialize: (state) => ({
          audio: state.audio,
          aether: state.aether,
          session: {
            history: state.session.history,
            uploads: state.session.uploads
          }
        })
      }
    )
  )
);

// Selector hooks for components
export const useVoiceState = () => useSacredStore((state) => state.voice);
export const useMotionState = () => useSacredStore((state) => state.motion);
export const useAetherState = () => useSacredStore((state) => state.aether);
export const useAudioState = () => useSacredStore((state) => state.audio);
export const useSessionState = () => useSacredStore((state) => state.session);
export const useOracleState = () => useSacredStore((state) => state.oracle);

// Action hooks
export const useSacredActions = () => useSacredStore((state) => ({
  setListening: state.setListening,
  setTranscript: state.setTranscript,
  clearVoiceError: state.clearVoiceError,
  setMotionState: state.setMotionState,
  setCoherence: state.setCoherence,
  triggerBreakthrough: state.triggerBreakthrough,
  activateAether: state.activateAether,
  progressAether: state.progressAether,
  toggleAudio: state.toggleAudio,
  setFrequency: state.setFrequency,
  setVolume: state.setVolume,
  startSession: state.startSession,
  addToHistory: state.addToHistory,
  addUpload: state.addUpload,
  endSession: state.endSession,
  setProcessing: state.setProcessing,
  setOracleResponse: state.setOracleResponse,
  setOracleError: state.setOracleError,
  reset: state.reset,
  hydrate: state.hydrate
}));

export default useSacredStore;