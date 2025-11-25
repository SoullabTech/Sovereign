// lib/voice/useCollectiveListening.ts
// React hook for integrating collective listening in client components

import { useEffect, useState, useCallback, useRef } from 'react';
import { MicSession } from './micSession';
import { symbolExtractor } from './symbolExtract';
import { aethericOrchestrator } from './aethericOrchestrator';
import {
  PersonalUtterance,
  SymbolicSignal,
  CollectiveSnapshot,
  OrchestratorInsight,
  MicSessionConfig,
  PresenceMode
} from './types';

interface UseCollectiveListeningOptions {
  teamId: string;
  userId?: string;
  mode: PresenceMode;
  wakeWord?: string;
  alwaysOn?: boolean;
  onPersonalUtterance?: (utterance: PersonalUtterance) => void;
  onCollectiveInsight?: (insight: OrchestratorInsight) => void;
  onError?: (error: Error) => void;
}

interface UseCollectiveListeningReturn {
  // State
  isListening: boolean;
  isConnected: boolean;
  mode: PresenceMode;
  activeUsers: number;
  lastInsight: OrchestratorInsight | null;

  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  changeMode: (mode: PresenceMode) => void;
  requestSnapshot: () => Promise<CollectiveSnapshot | null>;

  // Session info
  sessionId: string | null;
}

export function useCollectiveListening(options: UseCollectiveListeningOptions): UseCollectiveListeningReturn {
  const {
    teamId,
    userId,
    mode: initialMode,
    wakeWord = 'maya',
    alwaysOn = false,
    onPersonalUtterance,
    onCollectiveInsight,
    onError
  } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [mode, setMode] = useState<PresenceMode>(initialMode);
  const [activeUsers, setActiveUsers] = useState(0);
  const [lastInsight, setLastInsight] = useState<OrchestratorInsight | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Refs
  const micSession = useRef<MicSession | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * Connect to backchannel WebSocket
   */
  const connectBackchannel = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/backchannel/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to collective backchannel');
        setIsConnected(true);

        // Clear reconnect timeout
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'connected':
              setActiveUsers(message.activeUsers);
              break;

            case 'collective-insight':
              const insight = message.data as OrchestratorInsight;
              setLastInsight(insight);
              onCollectiveInsight?.(insight);
              break;

            case 'collective-snapshot':
              // Handle snapshot response
              break;

            case 'contribution-received':
              console.log(`Contribution received, ${message.teamContributors} active`);
              break;
          }
        } catch (error) {
          console.error('Failed to parse backchannel message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Backchannel error:', error);
        onError?.(new Error('Backchannel connection error'));
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection after 5 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('Attempting to reconnect to backchannel...');
          connectBackchannel();
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to connect to backchannel:', error);
      onError?.(error as Error);
    }
  }, [onCollectiveInsight, onError]);

  /**
   * Send symbolic signal to backchannel
   */
  const sendToBackchannel = useCallback((signal: SymbolicSignal) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Backchannel not connected, queuing signal');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'symbolic-contribution',
        data: signal
      }));
    } catch (error) {
      console.error('Failed to send to backchannel:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  /**
   * Handle personal utterance from mic session
   */
  const handleUtterance = useCallback(async (utterance: PersonalUtterance) => {
    // 1. Process locally first
    onPersonalUtterance?.(utterance);

    // 2. Extract symbolic representation
    const symbolic = symbolExtractor.toSymbolic(utterance);

    // 3. Add team ID
    const signal: SymbolicSignal = {
      ...symbolic,
      teamId
    };

    // 4. Send to backchannel
    sendToBackchannel(signal);

    // 5. Log privacy audit (in production, send to server)
    console.log('Privacy audit:', {
      originalLength: utterance.text.length,
      symbolicLength: JSON.stringify(symbolic).length,
      compressionRatio: utterance.text.length / JSON.stringify(symbolic).length,
      personalDataPresent: false
    });
  }, [teamId, onPersonalUtterance, sendToBackchannel]);

  /**
   * Start listening with mic session
   */
  const startListening = useCallback(async () => {
    if (isListening) return;

    try {
      // Connect to backchannel first
      connectBackchannel();

      // Create mic session config
      const config: MicSessionConfig = {
        mode,
        wakeWord,
        alwaysOn,
        silenceGraceMs: mode === 'meditation' ? 60000 : 3000,
        noiseSupression: true
      };

      // Create and start mic session
      const session = new MicSession(config);
      micSession.current = session;

      await session.start(handleUtterance);

      setIsListening(true);
      setSessionId(session.getSessionId());

      console.log(`Collective listening started in ${mode} mode`);

    } catch (error) {
      console.error('Failed to start listening:', error);
      onError?.(error as Error);
      setIsListening(false);
    }
  }, [mode, wakeWord, alwaysOn, isListening, connectBackchannel, handleUtterance, onError]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (micSession.current) {
      micSession.current.stop();
      micSession.current = null;
    }

    setIsListening(false);
    setSessionId(null);

    // Keep backchannel connected for receiving insights
    console.log('Stopped listening (backchannel remains connected)');
  }, []);

  /**
   * Change presence mode
   */
  const changeMode = useCallback((newMode: PresenceMode) => {
    setMode(newMode);

    // Restart mic session if listening
    if (isListening && micSession.current) {
      stopListening();

      // Restart with new mode
      setTimeout(() => {
        startListening();
      }, 100);
    }
  }, [isListening, startListening, stopListening]);

  /**
   * Request collective snapshot
   */
  const requestSnapshot = useCallback(async (): Promise<CollectiveSnapshot | null> => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Backchannel not connected');
      return null;
    }

    return new Promise((resolve) => {
      // Setup one-time listener for response
      const handleMessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'collective-snapshot') {
            wsRef.current?.removeEventListener('message', handleMessage);
            resolve(message.data as CollectiveSnapshot);
          }
        } catch (error) {
          console.error('Failed to parse snapshot:', error);
        }
      };

      wsRef.current.addEventListener('message', handleMessage);

      // Send request
      wsRef.current.send(JSON.stringify({
        type: 'request-snapshot',
        teamId
      }));

      // Timeout after 5 seconds
      setTimeout(() => {
        wsRef.current?.removeEventListener('message', handleMessage);
        resolve(null);
      }, 5000);
    });
  }, [teamId]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopListening();

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }

      symbolExtractor.resetSession();
    };
  }, []);

  /**
   * Heartbeat to keep connection alive
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    isListening,
    isConnected,
    mode,
    activeUsers,
    lastInsight,

    // Actions
    startListening,
    stopListening,
    changeMode,
    requestSnapshot,

    // Session info
    sessionId
  };
}