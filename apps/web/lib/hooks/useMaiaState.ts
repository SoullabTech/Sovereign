"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type MaiaMotionState = "idle" | "listening" | "processing" | "responding" | "breakthrough";

interface MaiaStore {
  // Core state
  state: MaiaMotionState;
  setState: (s: MaiaMotionState) => void;
  
  // UI state
  showPanel: boolean;
  setShowPanel: (b: boolean) => void;
  
  // Coherence tracking
  coherenceLevel: number;
  setCoherenceLevel: (l: number) => void;
  coherenceHistory: number[];
  addCoherencePoint: (l: number) => void;
  
  // Elements balance
  elements: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  setElements: (e: Partial<MaiaStore["elements"]>) => void;
  
  // Shadow work
  shadowPetals: string[];
  setShadowPetals: (p: string[]) => void;
  
  // Preferences
  preferences: {
    voiceEnabled: boolean;
    subtleMode: boolean;
    quietHours: boolean;
    hapticFeedback: boolean;
    interactionMode: 'beginner' | 'advanced';
  };
  setPreference: (key: keyof MaiaStore["preferences"], value: boolean | string) => void;
  setInteractionMode: (mode: 'beginner' | 'advanced') => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  state: "idle" as MaiaMotionState,
  showPanel: false,
  coherenceLevel: 0.7,
  coherenceHistory: [],
  elements: {
    fire: 0.5,
    water: 0.5,
    earth: 0.5,
    air: 0.5
  },
  shadowPetals: [],
  preferences: {
    voiceEnabled: true,
    subtleMode: false,
    quietHours: true,
    hapticFeedback: true,
    interactionMode: 'beginner' as const
  }
};

export const useMaiaState = create<MaiaStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      setState: (s) => set({ state: s }),
      setShowPanel: (b) => set({ showPanel: b }),
      
      setCoherenceLevel: (l) => set({ coherenceLevel: l }),
      addCoherencePoint: (l) => set((state) => ({
        coherenceHistory: [...state.coherenceHistory.slice(-19), l]
      })),
      
      setElements: (e) => set((state) => ({
        elements: { ...state.elements, ...e }
      })),
      
      setShadowPetals: (p) => set({ shadowPetals: p }),
      
      setPreference: (key, value) => set((state) => ({
        preferences: { ...state.preferences, [key]: value }
      })),
      
      setInteractionMode: (mode) => set((state) => ({
        preferences: { ...state.preferences, interactionMode: mode }
      })),
      
      reset: () => set(initialState)
    }),
    {
      name: "maia-state",
      partialize: (state) => ({
        preferences: state.preferences,
        coherenceHistory: state.coherenceHistory
      })
    }
  )
);