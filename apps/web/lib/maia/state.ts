import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JournalingMode, JournalingResponse } from '../journaling/JournalingPrompts';
import { VoiceMetrics } from './voicePatterns';
import { CognitiveVoiceAnalysis } from './cognitiveVoiceAnalysis';

export interface JournalEntry {
  id: string;
  userId: string;
  mode: JournalingMode;
  content: string;
  reflection?: JournalingResponse;
  timestamp: Date;
  wordCount: number;
  duration?: number;
  isVoice: boolean;
  // Voice analysis data
  voiceMetrics?: VoiceMetrics;
  cognitiveAnalysis?: CognitiveVoiceAnalysis;
}

export interface MaiaState {
  currentView: 'mode-select' | 'journal-entry' | 'voice-journal' | 'reflection' | 'timeline' | 'search';
  selectedMode: JournalingMode | null;
  currentEntry: string;
  entries: JournalEntry[];
  isProcessing: boolean;
  searchQuery: string;
  isVoiceMode: boolean;

  setView: (view: MaiaState['currentView']) => void;
  setMode: (mode: JournalingMode, isVoice?: boolean) => void;
  setEntry: (content: string) => void;
  addEntry: (entry: JournalEntry) => void;
  setProcessing: (processing: boolean) => void;
  setSearchQuery: (query: string) => void;
  setVoiceMode: (isVoice: boolean) => void;
  resetEntry: () => void;
}

export const useMaiaStore = create<MaiaState>()(
  persist(
    (set) => ({
      currentView: 'mode-select',
      selectedMode: null,
      currentEntry: '',
      entries: [],
      isProcessing: false,
      searchQuery: '',
      isVoiceMode: false,

      setView: (view) => set({ currentView: view }),
      setMode: (mode, isVoice = false) => {
        console.log('🔥 [MAIA STATE] setMode called with:', mode, 'isVoice:', isVoice);
        const targetView = isVoice ? 'voice-journal' : 'journal-entry';
        set({ selectedMode: mode, currentView: targetView, isVoiceMode: isVoice });
        console.log('🔥 [MAIA STATE] State updated to:', { selectedMode: mode, currentView: targetView, isVoiceMode: isVoice });
      },
      setEntry: (content) => set({ currentEntry: content }),
      addEntry: (entry) => set((state) => ({
        entries: [entry, ...state.entries],
        currentEntry: '',
        currentView: 'reflection'
      })),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setVoiceMode: (isVoice) => set({ isVoiceMode: isVoice }),
      resetEntry: () => set({ currentEntry: '', selectedMode: null, currentView: 'mode-select', isVoiceMode: false })
    }),
    {
      name: 'maia-storage',
      partialize: (state) => ({
        entries: state.entries,
        selectedMode: state.selectedMode,
        currentView: state.currentView
      })
    }
  )
);