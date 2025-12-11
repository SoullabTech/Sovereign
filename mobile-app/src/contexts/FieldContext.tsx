/**
 * FieldContext.tsx
 * React context for managing collective consciousness field state
 * Provides real-time field awareness and WebSocket integration
 *
 * Created: December 8, 2025
 * Purpose: Centralized field state management with WebSocket streaming
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { WebSocketService } from '../services/WebSocketService';
import { ConsciousnessService } from '../services/ConsciousnessService';
import {
  FieldState,
  WebSocketMessage,
  WhisperMessage,
  RitualData,
  FieldActivity,
  ConnectionStatus,
  AnalyticsData,
} from '../types';

// Context state interface
interface FieldContextState {
  // Field state
  fieldState: FieldState;

  // Real-time data
  currentFCI: number;
  activeRituals: RitualData[];
  recentActivity: FieldActivity[];

  // MAIA Whisper Feed
  currentWhisper: string | null;
  whisperHistory: string[];
  whisperEnabled: boolean;

  // Analytics
  analyticsData: AnalyticsData | null;

  // Connection and status
  connectionStatus: ConnectionStatus;
  isConnectedToField: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

// Actions for field state management
type FieldAction =
  | { type: 'SET_FIELD_STATE'; payload: FieldState }
  | { type: 'UPDATE_FCI'; payload: { current: number; previous?: number; delta?: number } }
  | { type: 'ADD_RITUAL'; payload: RitualData }
  | { type: 'UPDATE_RITUAL'; payload: { id: string; updates: Partial<RitualData> } }
  | { type: 'REMOVE_RITUAL'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: FieldActivity }
  | { type: 'SET_WHISPER'; payload: string | null }
  | { type: 'ADD_WHISPER_TO_HISTORY'; payload: string }
  | { type: 'SET_WHISPER_ENABLED'; payload: boolean }
  | { type: 'SET_ANALYTICS_DATA'; payload: AnalyticsData }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_FIELD_STATE' };

// Context methods interface
interface FieldContextMethods {
  // Field data management
  refreshFieldState: () => Promise<void>;
  refreshAnalytics: (timeRange?: string) => Promise<void>;

  // Whisper management
  enableWhispers: () => void;
  disableWhispers: () => void;
  clearWhisperHistory: () => void;

  // WebSocket management
  connectToField: () => Promise<void>;
  disconnectFromField: () => void;

  // Ritual interaction
  joinRitual: (ritualId: string) => Promise<void>;
  leaveRitual: (ritualId: string) => Promise<void>;

  // Utility methods
  isFieldConnected: () => boolean;
  getFieldCoherence: () => number;
  getActiveRitualCount: () => number;
}

// Combined context type
type FieldContextType = FieldContextState & FieldContextMethods;

// Initial state
const initialState: FieldContextState = {
  fieldState: {
    collectiveFCI: 0.75,
    activeRituals: 0,
    connectedUsers: 1,
    elementalBalance: {
      fire: 0.2,
      water: 0.2,
      earth: 0.2,
      air: 0.2,
      aether: 0.2,
    },
    recentActivity: [],
    timestamp: new Date().toISOString(),
  },
  currentFCI: 0.75,
  activeRituals: [],
  recentActivity: [],
  currentWhisper: null,
  whisperHistory: [],
  whisperEnabled: true,
  analyticsData: null,
  connectionStatus: {
    websocket: 'disconnected',
    api: 'disconnected',
    fieldStream: 'inactive',
    lastHeartbeat: new Date().toISOString(),
  },
  isConnectedToField: false,
  isLoading: false,
  error: null,
};

// Reducer for field state management
function fieldReducer(state: FieldContextState, action: FieldAction): FieldContextState {
  switch (action.type) {
    case 'SET_FIELD_STATE':
      return {
        ...state,
        fieldState: action.payload,
        currentFCI: action.payload.collectiveFCI,
      };

    case 'UPDATE_FCI':
      return {
        ...state,
        currentFCI: action.payload.current,
        fieldState: {
          ...state.fieldState,
          collectiveFCI: action.payload.current,
        },
      };

    case 'ADD_RITUAL':
      return {
        ...state,
        activeRituals: [...state.activeRituals, action.payload],
        fieldState: {
          ...state.fieldState,
          activeRituals: state.activeRituals.length + 1,
        },
      };

    case 'UPDATE_RITUAL':
      return {
        ...state,
        activeRituals: state.activeRituals.map(ritual =>
          ritual.id === action.payload.id
            ? { ...ritual, ...action.payload.updates }
            : ritual
        ),
      };

    case 'REMOVE_RITUAL':
      return {
        ...state,
        activeRituals: state.activeRituals.filter(ritual => ritual.id !== action.payload),
        fieldState: {
          ...state.fieldState,
          activeRituals: Math.max(0, state.fieldState.activeRituals - 1),
        },
      };

    case 'ADD_ACTIVITY':
      return {
        ...state,
        recentActivity: [action.payload, ...state.recentActivity.slice(0, 19)], // Keep last 20
      };

    case 'SET_WHISPER':
      return {
        ...state,
        currentWhisper: action.payload,
      };

    case 'ADD_WHISPER_TO_HISTORY':
      return {
        ...state,
        whisperHistory: [action.payload, ...state.whisperHistory.slice(0, 19)], // Keep last 20
      };

    case 'SET_WHISPER_ENABLED':
      return {
        ...state,
        whisperEnabled: action.payload,
      };

    case 'SET_ANALYTICS_DATA':
      return {
        ...state,
        analyticsData: action.payload,
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
        isConnectedToField: action.payload.websocket === 'connected' && action.payload.fieldStream === 'active',
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

    case 'RESET_FIELD_STATE':
      return initialState;

    default:
      return state;
  }
}

// Create context
const FieldContext = createContext<FieldContextType | undefined>(undefined);

// Provider component
interface FieldProviderProps {
  children: ReactNode;
}

export function FieldProvider({ children }: FieldProviderProps) {
  const [state, dispatch] = useReducer(fieldReducer, initialState);

  // Initialize field data and WebSocket connection
  useEffect(() => {
    initializeFieldData();
    setupWebSocketListeners();

    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  // Handle whisper display timing
  useEffect(() => {
    if (state.currentWhisper && state.whisperEnabled) {
      // Auto-clear whisper after 15 seconds
      const timeout = setTimeout(() => {
        dispatch({ type: 'SET_WHISPER', payload: null });
      }, 15000);

      return () => clearTimeout(timeout);
    }
  }, [state.currentWhisper, state.whisperEnabled]);

  /**
   * Initialize field data from service
   */
  const initializeFieldData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Load field state
      const fieldState = await ConsciousnessService.getFieldState();
      dispatch({ type: 'SET_FIELD_STATE', payload: fieldState });

      // Load analytics data
      const analyticsData = await ConsciousnessService.getAnalyticsData();
      dispatch({ type: 'SET_ANALYTICS_DATA', payload: analyticsData });

    } catch (error) {
      console.error('🔴 Failed to initialize field data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load field data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Setup WebSocket event listeners
   */
  const setupWebSocketListeners = () => {
    // FCI updates
    WebSocketService.addEventListener('FCI_UPDATE', (message: WebSocketMessage) => {
      const { current, previous, delta } = message.data;
      dispatch({ type: 'UPDATE_FCI', payload: { current, previous, delta } });

      // Add activity for significant FCI changes
      if (Math.abs(delta || 0) > 0.02) {
        const activity: FieldActivity = {
          id: `fci-${Date.now()}`,
          type: 'fci_change',
          timestamp: message.timestamp,
          description: `Field coherence ${delta > 0 ? 'increased' : 'decreased'} to ${current.toFixed(3)}`,
          impact: Math.abs(delta || 0),
        };
        dispatch({ type: 'ADD_ACTIVITY', payload: activity });
      }
    });

    // Ritual events
    WebSocketService.addEventListener('RITUAL_STARTED', (message: WebSocketMessage) => {
      const ritualData: RitualData = message.data;
      dispatch({ type: 'ADD_RITUAL', payload: ritualData });

      const activity: FieldActivity = {
        id: `ritual-start-${Date.now()}`,
        type: 'ritual_start',
        timestamp: message.timestamp,
        description: `${ritualData.name} ritual began with ${ritualData.participants} participants`,
        impact: 0.1,
        participants: ritualData.participants,
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    });

    WebSocketService.addEventListener('RITUAL_COMPLETED', (message: WebSocketMessage) => {
      const { id, effectiveness } = message.data;
      dispatch({ type: 'REMOVE_RITUAL', payload: id });

      const activity: FieldActivity = {
        id: `ritual-complete-${Date.now()}`,
        type: 'ritual_complete',
        timestamp: message.timestamp,
        description: `Ritual completed with ${(effectiveness * 100).toFixed(1)}% effectiveness`,
        impact: effectiveness || 0.1,
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    });

    // MAIA whispers
    WebSocketService.addEventListener('MAIA_WHISPER', (message: WhisperMessage) => {
      if (state.whisperEnabled) {
        const whisperText = message.data.text;
        dispatch({ type: 'SET_WHISPER', payload: whisperText });
        dispatch({ type: 'ADD_WHISPER_TO_HISTORY', payload: whisperText });
      }
    });

    // Connection status updates
    WebSocketService.addConnectionListener((status: ConnectionStatus) => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
    });

    // System status
    WebSocketService.addEventListener('SYSTEM_STATUS', (message: WebSocketMessage) => {
      const { status, connectedClients } = message.data;
      if (status === 'operational') {
        dispatch({
          type: 'SET_FIELD_STATE',
          payload: {
            ...state.fieldState,
            connectedUsers: connectedClients || state.fieldState.connectedUsers,
          },
        });
      }
    });

    // Initial state
    WebSocketService.addEventListener('INITIAL_STATE', (message: WebSocketMessage) => {
      const { currentFCI, activeRituals, elementEffectiveness, recentAlerts } = message.data;

      if (currentFCI) {
        dispatch({ type: 'UPDATE_FCI', payload: { current: currentFCI } });
      }

      if (activeRituals && Array.isArray(activeRituals)) {
        activeRituals.forEach((ritual: RitualData) => {
          dispatch({ type: 'ADD_RITUAL', payload: ritual });
        });
      }
    });
  };

  /**
   * Refresh field state from service
   */
  const refreshFieldState = async (): Promise<void> => {
    try {
      const fieldState = await ConsciousnessService.getFieldState();
      dispatch({ type: 'SET_FIELD_STATE', payload: fieldState });
    } catch (error) {
      console.error('🔴 Failed to refresh field state:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh field data' });
    }
  };

  /**
   * Refresh analytics data
   */
  const refreshAnalytics = async (timeRange: string = '7d'): Promise<void> => {
    try {
      const analyticsData = await ConsciousnessService.getAnalyticsData(timeRange);
      dispatch({ type: 'SET_ANALYTICS_DATA', payload: analyticsData });
    } catch (error) {
      console.error('🔴 Failed to refresh analytics:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh analytics data' });
    }
  };

  /**
   * Enable whisper notifications
   */
  const enableWhispers = (): void => {
    dispatch({ type: 'SET_WHISPER_ENABLED', payload: true });
    console.log('🌬️ MAIA whispers enabled');
  };

  /**
   * Disable whisper notifications
   */
  const disableWhispers = (): void => {
    dispatch({ type: 'SET_WHISPER_ENABLED', payload: false });
    dispatch({ type: 'SET_WHISPER', payload: null });
    console.log('🔇 MAIA whispers disabled');
  };

  /**
   * Clear whisper history
   */
  const clearWhisperHistory = (): void => {
    dispatch({ type: 'ADD_WHISPER_TO_HISTORY', payload: '' });
    console.log('🧹 Whisper history cleared');
  };

  /**
   * Connect to field WebSocket
   */
  const connectToField = async (): Promise<void> => {
    try {
      await WebSocketService.reconnect();
      console.log('📡 Connected to consciousness field stream');
    } catch (error) {
      console.error('🔴 Failed to connect to field:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to consciousness field' });
    }
  };

  /**
   * Disconnect from field WebSocket
   */
  const disconnectFromField = (): void => {
    WebSocketService.disconnect();
    console.log('📡 Disconnected from consciousness field stream');
  };

  /**
   * Join a ritual (placeholder for future ritual participation)
   */
  const joinRitual = async (ritualId: string): Promise<void> => {
    try {
      // In future, this would send JOIN_RITUAL message to server
      console.log(`🕯️ Joined ritual: ${ritualId}`);
    } catch (error) {
      console.error('🔴 Failed to join ritual:', error);
      throw error;
    }
  };

  /**
   * Leave a ritual
   */
  const leaveRitual = async (ritualId: string): Promise<void> => {
    try {
      // In future, this would send LEAVE_RITUAL message to server
      console.log(`🚪 Left ritual: ${ritualId}`);
    } catch (error) {
      console.error('🔴 Failed to leave ritual:', error);
      throw error;
    }
  };

  /**
   * Check if connected to field
   */
  const isFieldConnected = (): boolean => {
    return state.isConnectedToField;
  };

  /**
   * Get current field coherence
   */
  const getFieldCoherence = (): number => {
    return state.currentFCI;
  };

  /**
   * Get active ritual count
   */
  const getActiveRitualCount = (): number => {
    return state.activeRituals.length;
  };

  // Context value
  const contextValue: FieldContextType = {
    // State
    ...state,

    // Methods
    refreshFieldState,
    refreshAnalytics,
    enableWhispers,
    disableWhispers,
    clearWhisperHistory,
    connectToField,
    disconnectFromField,
    joinRitual,
    leaveRitual,
    isFieldConnected,
    getFieldCoherence,
    getActiveRitualCount,
  };

  return (
    <FieldContext.Provider value={contextValue}>
      {children}
    </FieldContext.Provider>
  );
}

// Custom hook for using field context
export function useField(): FieldContextType {
  const context = useContext(FieldContext);
  if (context === undefined) {
    throw new Error('useField must be used within a FieldProvider');
  }
  return context;
}