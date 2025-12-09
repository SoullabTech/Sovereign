/**
 * ConsciousnessContext.tsx
 * React context for managing consciousness state throughout mobile app
 * Provides personal consciousness state and session management
 *
 * Created: December 8, 2025
 * Purpose: Centralized consciousness state management for mobile components
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ConsciousnessService } from '../services/ConsciousnessService';
import {
  ConsciousnessState,
  ConsciousnessSession,
  Element,
  Archetype,
  SessionType,
  UserSettings,
  APIResponse,
} from '../types';

// Context state interface
interface ConsciousnessContextState {
  // Current consciousness state
  consciousnessState: ConsciousnessState;

  // Session management
  currentSession: ConsciousnessSession | null;
  sessionHistory: ConsciousnessSession[];

  // User settings
  userSettings: Partial<UserSettings>;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Connection status
  connectionStatus: 'connected' | 'disconnected' | 'limited';
}

// Actions for consciousness state management
type ConsciousnessAction =
  | { type: 'SET_CONSCIOUSNESS_STATE'; payload: ConsciousnessState }
  | { type: 'START_SESSION'; payload: ConsciousnessSession }
  | { type: 'UPDATE_SESSION'; payload: Partial<ConsciousnessSession> }
  | { type: 'END_SESSION'; payload: ConsciousnessSession }
  | { type: 'SET_SESSION_HISTORY'; payload: ConsciousnessSession[] }
  | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connected' | 'disconnected' | 'limited' }
  | { type: 'RESET_STATE' };

// Context methods interface
interface ConsciousnessContextMethods {
  // Session management
  startSession: (type: SessionType, element: Element, archetype: Archetype, duration?: number) => Promise<void>;
  endSession: (notes?: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;

  // State updates
  updateConsciousnessState: () => Promise<void>;
  refreshSessionHistory: () => Promise<void>;

  // Settings management
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // Utility methods
  getCurrentFCI: () => Promise<number>;
  isSessionActive: () => boolean;
  getSessionDuration: () => number;
}

// Combined context type
type ConsciousnessContextType = ConsciousnessContextState & ConsciousnessContextMethods;

// Initial state
const initialState: ConsciousnessContextState = {
  consciousnessState: {
    currentElement: 'aether',
    currentArchetype: 'mystic',
    fci: 0.75,
    timestamp: new Date().toISOString(),
    isSessionActive: false,
    sessionDuration: 0,
  },
  currentSession: null,
  sessionHistory: [],
  userSettings: {},
  isLoading: false,
  error: null,
  connectionStatus: 'disconnected',
};

// Reducer for consciousness state management
function consciousnessReducer(
  state: ConsciousnessContextState,
  action: ConsciousnessAction
): ConsciousnessContextState {
  switch (action.type) {
    case 'SET_CONSCIOUSNESS_STATE':
      return {
        ...state,
        consciousnessState: action.payload,
      };

    case 'START_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        consciousnessState: {
          ...state.consciousnessState,
          isSessionActive: true,
          sessionDuration: 0,
        },
      };

    case 'UPDATE_SESSION':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          ...action.payload,
        },
      };

    case 'END_SESSION':
      return {
        ...state,
        currentSession: null,
        consciousnessState: {
          ...state.consciousnessState,
          isSessionActive: false,
          sessionDuration: 0,
        },
        sessionHistory: [action.payload, ...state.sessionHistory],
      };

    case 'SET_SESSION_HISTORY':
      return {
        ...state,
        sessionHistory: action.payload,
      };

    case 'UPDATE_USER_SETTINGS':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          ...action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Create context
const ConsciousnessContext = createContext<ConsciousnessContextType | undefined>(undefined);

// Provider component
interface ConsciousnessProviderProps {
  children: ReactNode;
}

export function ConsciousnessProvider({ children }: ConsciousnessProviderProps) {
  const [state, dispatch] = useReducer(consciousnessReducer, initialState);

  // Session timer for tracking duration
  const [sessionTimer, setSessionTimer] = React.useState<NodeJS.Timeout | null>(null);

  // Initialize consciousness data on mount
  useEffect(() => {
    initializeConsciousnessData();

    return () => {
      if (sessionTimer) {
        clearInterval(sessionTimer);
      }
    };
  }, []);

  // Update connection status based on service
  useEffect(() => {
    const updateConnectionStatus = () => {
      const status = ConsciousnessService.getConnectionStatus();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
    };

    updateConnectionStatus();
    const interval = setInterval(updateConnectionStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize consciousness data from service
   */
  const initializeConsciousnessData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Load consciousness state
      const consciousnessState = await ConsciousnessService.getConsciousnessState();
      dispatch({ type: 'SET_CONSCIOUSNESS_STATE', payload: consciousnessState });

      // Load session history
      const sessionHistory = await ConsciousnessService.getSessionHistory(20);
      dispatch({ type: 'SET_SESSION_HISTORY', payload: sessionHistory });

    } catch (error) {
      console.error('🔴 Failed to initialize consciousness data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load consciousness data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Start a consciousness session
   */
  const startSession = async (
    type: SessionType,
    element: Element,
    archetype: Archetype,
    duration: number = 1200
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const session = await ConsciousnessService.startSession(type, element, archetype, duration);
      dispatch({ type: 'START_SESSION', payload: session });

      // Start session timer
      startSessionTimer();

      console.log('✅ Session started:', session.id);

    } catch (error) {
      console.error('🔴 Failed to start session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start consciousness session' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * End current consciousness session
   */
  const endSession = async (notes?: string): Promise<void> => {
    if (!state.currentSession) {
      throw new Error('No active session to end');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const completedSession = await ConsciousnessService.endSession(state.currentSession.id, notes);
      dispatch({ type: 'END_SESSION', payload: completedSession });

      // Stop session timer
      stopSessionTimer();

      console.log('✅ Session ended:', completedSession.id);

    } catch (error) {
      console.error('🔴 Failed to end session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to end consciousness session' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Pause current session
   */
  const pauseSession = (): void => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
    console.log('⏸️ Session paused');
  };

  /**
   * Resume current session
   */
  const resumeSession = (): void => {
    if (state.currentSession && !sessionTimer) {
      startSessionTimer();
      console.log('▶️ Session resumed');
    }
  };

  /**
   * Start session timer for tracking duration
   */
  const startSessionTimer = (): void => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
    }

    const timer = setInterval(() => {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: {
          duration: state.currentSession
            ? (Date.now() - new Date(state.currentSession.startTime).getTime()) / 1000
            : 0
        }
      });

      // Update consciousness state session duration
      const newDuration = state.currentSession
        ? (Date.now() - new Date(state.currentSession.startTime).getTime()) / 1000
        : 0;

      dispatch({
        type: 'SET_CONSCIOUSNESS_STATE',
        payload: {
          ...state.consciousnessState,
          sessionDuration: newDuration,
        }
      });
    }, 1000);

    setSessionTimer(timer);
  };

  /**
   * Stop session timer
   */
  const stopSessionTimer = (): void => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
  };

  /**
   * Update consciousness state from service
   */
  const updateConsciousnessState = async (): Promise<void> => {
    try {
      const consciousnessState = await ConsciousnessService.getConsciousnessState();
      dispatch({ type: 'SET_CONSCIOUSNESS_STATE', payload: consciousnessState });
    } catch (error) {
      console.error('🔴 Failed to update consciousness state:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update consciousness state' });
    }
  };

  /**
   * Refresh session history
   */
  const refreshSessionHistory = async (): Promise<void> => {
    try {
      const sessionHistory = await ConsciousnessService.getSessionHistory(20);
      dispatch({ type: 'SET_SESSION_HISTORY', payload: sessionHistory });
    } catch (error) {
      console.error('🔴 Failed to refresh session history:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh session history' });
    }
  };

  /**
   * Update user settings
   */
  const updateSettings = async (settings: Partial<UserSettings>): Promise<void> => {
    try {
      await ConsciousnessService.updateSettings(settings);
      dispatch({ type: 'UPDATE_USER_SETTINGS', payload: settings });
      console.log('✅ User settings updated');
    } catch (error) {
      console.error('🔴 Failed to update settings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user settings' });
      throw error;
    }
  };

  /**
   * Get current FCI
   */
  const getCurrentFCI = async (): Promise<number> => {
    try {
      return await ConsciousnessService.getCurrentFCI();
    } catch (error) {
      console.error('🔴 Failed to get current FCI:', error);
      return state.consciousnessState.fci;
    }
  };

  /**
   * Check if session is active
   */
  const isSessionActive = (): boolean => {
    return state.currentSession !== null && state.consciousnessState.isSessionActive;
  };

  /**
   * Get current session duration in seconds
   */
  const getSessionDuration = (): number => {
    if (!state.currentSession) return 0;
    return (Date.now() - new Date(state.currentSession.startTime).getTime()) / 1000;
  };

  // Context value
  const contextValue: ConsciousnessContextType = {
    // State
    ...state,

    // Methods
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateConsciousnessState,
    refreshSessionHistory,
    updateSettings,
    getCurrentFCI,
    isSessionActive,
    getSessionDuration,
  };

  return (
    <ConsciousnessContext.Provider value={contextValue}>
      {children}
    </ConsciousnessContext.Provider>
  );
}

// Custom hook for using consciousness context
export function useConsciousness(): ConsciousnessContextType {
  const context = useContext(ConsciousnessContext);
  if (context === undefined) {
    throw new Error('useConsciousness must be used within a ConsciousnessProvider');
  }
  return context;
}