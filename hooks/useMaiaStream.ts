import { useState, useCallback } from 'react';

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
    lang?: string;
    mode?: 'dialogue' | 'counsel' | 'scribe';
  }): Promise<string> => {
    const { userText, element, userId = 'anonymous', mode = 'dialogue' } = params;

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

    try {
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
    }
  }, [controller, stopStream]);

  return {
    isStreaming,
    stream: streamMessage,
    stopStream
  };
}