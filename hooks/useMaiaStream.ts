import { useState, useCallback } from 'react';

// Hard ceiling for a single /api/between/chat request. Accommodates the slowest
// expected path (DEEP tier, ~6-20s per CLAUDE.md) with comfortable headroom,
// short enough that a true SSE/streaming hang names itself before users notice.
// NOTE: This timeout covers the *primary* fetch only. The dev-port fallback
// path below (window.location.port + 3001/3003/3005) is a separate substrate
// concern and remains unhardened in this commit — flagged for follow-up.
const STREAM_TIMEOUT_MS = 90_000;

export interface StreamMessage {
  type: 'delta' | 'done' | 'error' | 'meta';
  text?: string;
  reason?: string;
  metadata?: any;
}

export interface UseMaiaStreamResult {
  isStreaming: boolean;
  stream: (params: {
    userText: string;
    element: string;
    userId?: string;
    userName?: string;
    lang?: string;
    mode?: 'dialogue' | 'counsel' | 'scribe';
  }) => Promise<string>;
  stopStream: () => void;
}

export function useMaiaStream(): UseMaiaStreamResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (controller) {
      controller.abort();
      setController(null);
    }
    setIsStreaming(false);
  }, [controller]);

  const streamMessage = useCallback(async (params: {
    userText: string;
    element: string;
    userId?: string;
    userName?: string;
    lang?: string;
    mode?: 'dialogue' | 'counsel' | 'scribe';
  }): Promise<string> => {
    const { userText, element, userId = 'anonymous', userName, mode = 'dialogue' } = params;

    console.log('[MaiaStream] Starting request:', {
      userText: userText.substring(0, 50) + '...',
      element,
      userId,
      timestamp: new Date().toISOString()
    });

    // Stop any existing stream
    stopStream();

    const newController = new AbortController();
    setController(newController);
    setIsStreaming(true);

    // Time-bind the controller so a hung primary fetch can't trap the UI.
    // `timedOut` distinguishes timeout-driven abort from user-driven abort
    // (stopStream) so the failure mode is logged with a named timeout label
    // instead of being silently swallowed as a generic AbortError.
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;

    try {
      timeoutId = setTimeout(() => {
        timedOut = true;
        newController.abort();
      }, STREAM_TIMEOUT_MS);

      // Use the current working MAIA endpoint
      const currentPort = window.location.port || '3000';
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:${currentPort}`;

      console.log('[MaiaStream] Using MAIA /api/between/chat endpoint:', backendUrl);

      const response = await fetch(`${backendUrl}/api/between/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          sessionId: userId,
          userId: userId,
          userName: userName, // Pass user's display name
          element: element,
          mode: mode // ✅ Talk/Care/Note mode awareness
        }),
        signal: newController.signal
      });

      if (!response.ok) {
        throw new Error(`MAIA request failed: ${response.status}`);
      }

      const data = await response.json();
      setIsStreaming(false);

      if (data.message) {
        return data.message;
      } else {
        throw new Error('No message in response');
      }

    } catch (error: any) {
      setIsStreaming(false);
      setController(null);

      if (timedOut) {
        console.error(`[MaiaStream] streaming voice send timed out after ${STREAM_TIMEOUT_MS}ms`);
        return 'I apologize, but the response is taking longer than expected. Please try again.';
      }

      if (error.name === 'AbortError') {
        return ''; // Stream was cancelled
      }

      console.error('Maia request error:', error);

      // Try alternative ports as fallback
      const fallbackPorts = ['3001', '3003', '3005'];

      for (const port of fallbackPorts) {
        try {
          const fallbackUrl = `${window.location.protocol}//${window.location.hostname}:${port}`;
          console.log(`[MaiaStream] Trying fallback port ${port}:`, fallbackUrl);

          const fallbackResponse = await fetch(`${fallbackUrl}/api/between/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: userText,
              sessionId: userId,
              userId: userId,
              userName: userName, // Pass user's display name
              element: element,
              mode: mode // ✅ Talk/Care/Note mode awareness
            })
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.message) {
              console.log(`[MaiaStream] Successful fallback on port ${port}`);
              return fallbackData.message;
            }
          }
        } catch (fallbackError) {
          console.log(`[MaiaStream] Fallback port ${port} failed:`, fallbackError);
          continue;
        }
      }

      return 'I apologize, but I am having trouble connecting right now. Please try refreshing the page.';
    } finally {
      // Always release the pending timer so a successful fetch doesn't trigger
      // a stray abort after the function returns, and a failed fetch doesn't
      // leave a dangling timer.
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [controller, stopStream]);

  return {
    isStreaming,
    stream: streamMessage,
    stopStream
  };
}