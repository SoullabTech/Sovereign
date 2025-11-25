/**
 * 🎙️ MAIA Presence Context
 *
 * Global state for MAIA's ambient presence
 * Makes MAIA available as persistent companion across all pages
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface MaiaPresenceState {
  // Ambient mode settings
  ambientMode: boolean; // Voice active across all pages
  witnessMode: boolean; // MAIA proactively offers reflections
  voiceOnly: boolean;   // Minimal UI, just voice

  // Current state
  currentElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  currentPage: string;
}

interface MaiaPresenceActions {
  // Mode control
  toggleAmbientMode: () => void;
  toggleWitnessMode: () => void;
  toggleVoiceOnly: () => void;

  // Context
  setCurrentPage: (page: string) => void;
  setCurrentElement: (element: MaiaPresenceState['currentElement']) => void;
}

type MaiaPresenceContextValue = MaiaPresenceState & MaiaPresenceActions;

const MaiaPresenceContext = createContext<MaiaPresenceContextValue | null>(null);

export function MaiaPresenceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MaiaPresenceState>({
    ambientMode: false,
    witnessMode: false,
    voiceOnly: false,
    currentElement: 'water',
    currentPage: ''
  });

  /**
   * Toggle ambient mode
   * When enabled, MAIA's voice UI persists across page navigation
   */
  const toggleAmbientMode = useCallback(() => {
    setState(prev => {
      const newAmbientMode = !prev.ambientMode;

      // Save to localStorage
      localStorage.setItem('maia_ambient_mode', String(newAmbientMode));

      console.log(`🎙️ MAIA ambient mode ${newAmbientMode ? 'ENABLED' : 'DISABLED'}`);

      return { ...prev, ambientMode: newAmbientMode };
    });
  }, []);

  /**
   * Toggle witness mode
   * When enabled, MAIA proactively offers reflections
   */
  const toggleWitnessMode = useCallback(() => {
    setState(prev => {
      const newWitnessMode = !prev.witnessMode;
      localStorage.setItem('maia_witness_mode', String(newWitnessMode));

      console.log(`👁️ MAIA witness mode ${newWitnessMode ? 'ENABLED' : 'DISABLED'}`);

      return { ...prev, witnessMode: newWitnessMode };
    });
  }, []);

  /**
   * Toggle voice-only mode
   * When enabled, minimal UI with just voice controls
   */
  const toggleVoiceOnly = useCallback(() => {
    setState(prev => {
      const newVoiceOnly = !prev.voiceOnly;
      localStorage.setItem('maia_voice_only', String(newVoiceOnly));

      console.log(`🔊 Voice-only mode ${newVoiceOnly ? 'ENABLED' : 'DISABLED'}`);

      return { ...prev, voiceOnly: newVoiceOnly };
    });
  }, []);

  /**
   * Set current page (for context awareness)
   */
  const setCurrentPage = useCallback((page: string) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  /**
   * Set current element
   */
  const setCurrentElement = useCallback((element: MaiaPresenceState['currentElement']) => {
    setState(prev => ({ ...prev, currentElement: element }));
  }, []);

  /**
   * Load saved preferences on mount
   */
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const savedAmbient = localStorage.getItem('maia_ambient_mode') === 'true';
    const savedWitness = localStorage.getItem('maia_witness_mode') === 'true';
    const savedVoiceOnly = localStorage.getItem('maia_voice_only') === 'true';

    setState(prev => ({
      ...prev,
      ambientMode: savedAmbient,
      witnessMode: savedWitness,
      voiceOnly: savedVoiceOnly
    }));

    if (savedAmbient) {
      console.log('🎙️ MAIA ambient mode restored from settings');
    }
  }, []);

  const value: MaiaPresenceContextValue = {
    ...state,
    toggleAmbientMode,
    toggleWitnessMode,
    toggleVoiceOnly,
    setCurrentPage,
    setCurrentElement
  };

  return (
    <MaiaPresenceContext.Provider value={value}>
      {children}

      {/* Render ambient voice UI if enabled */}
      {state.ambientMode && typeof window !== 'undefined' && (
        <AmbientVoiceOverlay
          witnessMode={state.witnessMode}
          voiceOnly={state.voiceOnly}
          currentElement={state.currentElement}
        />
      )}
    </MaiaPresenceContext.Provider>
  );
}

/**
 * Ambient Voice Overlay Component
 * Renders MAIA's voice UI that persists across pages
 */
function AmbientVoiceOverlay({
  witnessMode,
  voiceOnly,
  currentElement
}: {
  witnessMode: boolean;
  voiceOnly: boolean;
  currentElement: MaiaPresenceState['currentElement'];
}) {
  const [isMinimized, setIsMinimized] = useState(true);

  return (
    <div
      className={`fixed z-[9999] transition-all duration-300 ${
        isMinimized
          ? 'bottom-6 right-6'
          : 'bottom-0 right-0 w-96 h-[500px]'
      }`}
    >
      {isMinimized ? (
        // Minimized floating button
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-orange-600
                   shadow-lg hover:shadow-xl transform hover:scale-105 transition-all
                   flex items-center justify-center group"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            <svg className="w-6 h-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="absolute -top-8 right-0 px-2 py-1 bg-black/80 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Talk to MAIA
          </div>
        </button>
      ) : (
        // Expanded voice interface
        <div className="w-full h-full bg-gradient-to-br from-black/95 to-amber-950/95
                      backdrop-blur-xl rounded-tl-2xl border-t border-l border-amber-600/30
                      flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">MAIA Voice</h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-amber-400/60 text-sm mb-2">
                {witnessMode ? '👁️ Witness Mode Active' : '🎙️ Ready to Listen'}
              </div>
              <div className="text-white/40 text-xs">
                Ambient voice coming soon...
              </div>
            </div>
          </div>

          {witnessMode && (
            <div className="mt-4 p-3 bg-amber-600/10 rounded-lg border border-amber-600/20">
              <p className="text-xs text-amber-400/80">
                MAIA is observing your journey and will offer reflections when patterns emerge
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to use MAIA presence
 */
export function useMaiaPresence() {
  const context = useContext(MaiaPresenceContext);
  if (!context) {
    // Return default values if not in provider (for components that don't need it)
    return {
      ambientMode: false,
      witnessMode: false,
      voiceOnly: false,
      currentElement: 'water' as const,
      currentPage: '',
      toggleAmbientMode: () => {},
      toggleWitnessMode: () => {},
      toggleVoiceOnly: () => {},
      setCurrentPage: () => {},
      setCurrentElement: () => {}
    };
  }
  return context;
}